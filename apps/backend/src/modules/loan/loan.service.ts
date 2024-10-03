import { CreateRequestContext, Loaded, LockMode, ref } from '@mikro-orm/core'
import { InjectRepository } from '@mikro-orm/nestjs'
import {
  EntityManager,
  EntityRepository,
  MikroORM,
} from '@mikro-orm/postgresql'
import { Injectable, Logger } from '@nestjs/common'
import { calculateInterest } from 'common/utils/interest'
import { calculateLoanRepayment } from 'common/utils/interest'
import { addMinutes, endOfSecond } from 'date-fns'
import { AccountService } from 'modules/account/account.service'
import { Loan } from 'modules/database/entities/loan.entity'
import { EntryService } from 'modules/entry/entry.service'
import { UserService } from 'modules/user/user.service'

const BORROWER_INTEREST_RATE = 0.12

@Injectable()
export class LoanService {
  private readonly logger = new Logger(LoanService.name)

  constructor(
    private readonly em: EntityManager,
    private readonly entryService: EntryService,
    private readonly userService: UserService,
    private readonly accountService: AccountService,
    // Required to use @CreateRequestContext()
    private readonly orm: MikroORM,
    @InjectRepository(Loan)
    private readonly loanRepository: EntityRepository<Loan>
  ) {}

  async createAndDisburseLoan({
    user_id,
    amount_in_cents,
  }: {
    user_id: string
    amount_in_cents: number
  }) {
    const cash_account_id =
      await this.accountService.getSpecialAccountId('cash')
    const borrower = await this.userService.getUser({ user_id })
    await this.em.transactional(async (em) => {
      const now = endOfSecond(new Date())

      const loan = new Loan()
      loan.borrower = ref(borrower)
      loan.principal_in_cents = amount_in_cents
      loan.remaining_principal_in_cents = amount_in_cents
      loan.interest_rate = BORROWER_INTEREST_RATE
      loan.compounding_frequency = 'minute'
      loan.num_compounds_in_term = 12
      loan.next_compounding_time = addMinutes(now, 1)

      em.persist(loan)
      await this.entryService.createEntries(
        {
          description: 'Disburse',
          entries: [
            {
              account_id: cash_account_id,
              amount_in_cents,
              entry_type: 'credit',
            },
            {
              account_id: borrower.borrower_principal_account.id,
              amount_in_cents,
              entry_type: 'debit',
            },
          ],
        },
        em
      )
    })
  }

  private async updateInterestForOneLoan({
    loan,
  }: {
    loan: Loaded<Loan, 'borrower'>
  }) {
    const now = new Date()
    const { next_compounding_time } = loan
    if (!next_compounding_time) {
      throw new Error('Inconsistent compounding time')
    }
    if (next_compounding_time.getTime() > now.getTime()) {
      throw new Error('Loan not due for interest yet')
    }
    const revenue_account_id =
      await this.accountService.getSpecialAccountId('revenue')
    await this.em.transactional(async (em) => {
      await this.em.lock(loan, LockMode.PESSIMISTIC_WRITE)

      if (
        !loan.next_compounding_time ||
        loan.next_compounding_time.getTime() > now.getTime()
      ) {
        // Loan has already been updated by another cron job
        return
      }

      const interest = calculateInterest(loan)

      this.logger.log({
        msg: 'Adding interest for loan',
        user: loan.borrower.$.id,
        interest,
      })

      // Update ledger for transaction
      const update_interest_transaction = await this.entryService.createEntries(
        {
          description: 'Update interest for loan',
          entries: [
            {
              account_id: loan.borrower.$.borrower_interest_account.id,
              amount_in_cents: interest,
              entry_type: 'debit',
            },
            {
              account_id: revenue_account_id,
              amount_in_cents: interest,
              entry_type: 'credit',
            },
          ],
        },
        em
      )

      // Update loan
      loan.interest_transactions.add(update_interest_transaction)
      em.persist(loan)
    })
  }

  @CreateRequestContext()
  async updateInterestForLoans() {
    const now = new Date()
    const loansToUpdate = await this.loanRepository.findAll({
      where: {
        next_compounding_time: {
          $lt: now,
        },
        remaining_principal_in_cents: { $gt: 0 },
      },
      populate: ['borrower'],
    })
    for (const loan of loansToUpdate) {
      await this.updateInterestForOneLoan({ loan })
    }
  }

  private async makePaymentForOneLoan({
    loan,
  }: {
    loan: Loaded<Loan, 'borrower'>
  }) {
    const now = new Date()
    const { next_compounding_time } = loan
    if (!next_compounding_time) {
      throw new Error('Inconsistent compounding time')
    }
    if (next_compounding_time.getTime() > now.getTime()) {
      throw new Error('Loan not due for interest yet')
    }
    const cash_account_id =
      await this.accountService.getSpecialAccountId('cash')
    await this.em.transactional(async (em) => {
      await this.em.lock(loan, LockMode.PESSIMISTIC_WRITE)

      if (
        !loan.next_compounding_time ||
        loan.next_compounding_time.getTime() > now.getTime()
      ) {
        // Loan has already been updated by another cron job
        return
      }

      const { interest_repayment, principal_repayment } =
        calculateLoanRepayment(loan)

      this.logger.log({
        msg: 'Making payment for loan',
        user: loan.borrower.$.id,
        interest_repayment,
        principal_repayment,
        total_repayment: interest_repayment + principal_repayment,
      })

      // Update ledger for transaction
      const payment_transaction = await this.entryService.createEntries(
        {
          description: 'Make payment for loan',
          entries: [
            {
              account_id: loan.borrower.$.borrower_interest_account.id,
              amount_in_cents: interest_repayment,
              entry_type: 'credit',
            },
            {
              account_id: loan.borrower.$.borrower_principal_account.id,
              amount_in_cents: principal_repayment,
              entry_type: 'credit',
            },
            {
              account_id: cash_account_id,
              amount_in_cents: interest_repayment + principal_repayment,
              entry_type: 'debit',
            },
          ],
        },
        em
      )

      // Update loan
      loan.payment_transactions.add(payment_transaction)
      loan.remaining_principal_in_cents -= principal_repayment
      if (loan.remaining_principal_in_cents < 0) {
        throw new Error('Loan remaining principal went below 0')
      }
      loan.next_compounding_time =
        loan.remaining_principal_in_cents === 0 ? null : addMinutes(now, 1)
      em.persist(loan)
    })
  }

  /**
   * For simplicity we run a cron job that makes payment for all loans
   * every second.
   */
  @CreateRequestContext()
  async makePaymentForAllLoans() {
    const now = new Date()
    const loansToUpdate = await this.loanRepository.findAll({
      where: {
        next_compounding_time: {
          $lt: now,
        },
        remaining_principal_in_cents: { $gt: 0 },
      },
      populate: ['borrower'],
    })
    for (const loan of loansToUpdate) {
      await this.makePaymentForOneLoan({ loan })
    }
  }
}

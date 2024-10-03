import { InjectRepository } from '@mikro-orm/nestjs'
import {
  CreateRequestContext,
  EntityManager,
  EntityRepository,
  Loaded,
  LockMode,
  MikroORM,
  ref,
} from '@mikro-orm/postgresql'
import { Injectable, Logger } from '@nestjs/common'
import { calculateInterestForInvestment } from 'common/utils/interest'
import { addMinutes, endOfSecond } from 'date-fns'
import { AccountService } from 'modules/account/account.service'
import { Investment } from 'modules/database/entities/investment.entity'
import { EntryService } from 'modules/entry/entry.service'
import { UserService } from 'modules/user/user.service'

const INVESTOR_INTEREST_RATE = 0.048

@Injectable()
export class InvestService {
  private readonly logger = new Logger(InvestService.name)

  constructor(
    private readonly entryService: EntryService,
    private readonly accountService: AccountService,
    private readonly userService: UserService,
    private readonly em: EntityManager,
    // Required to use @CreateRequestContext()
    private readonly orm: MikroORM,
    @InjectRepository(Investment)
    private readonly investmentRepository: EntityRepository<Investment>
  ) {}

  async invest({
    user_id,
    amount_in_cents,
    term_in_months,
  }: {
    user_id: string
    amount_in_cents: number
    term_in_months: number
  }) {
    const cash_account_id =
      await this.accountService.getSpecialAccountId('cash')
    const investor = await this.userService.getUser({ user_id })
    await this.em.transactional(async (em) => {
      const now = endOfSecond(new Date())

      const investment = new Investment()
      investment.principal_in_cents = amount_in_cents
      investment.investor = ref(investor)
      investment.compounding_frequency = 'month'
      investment.next_compounding_time = addMinutes(now, 1)
      investment.interest_rate = INVESTOR_INTEREST_RATE
      investment.term_in_months = term_in_months
      investment.term_remaining_in_months = term_in_months
      em.persist(investment)

      await this.entryService.createEntries(
        {
          description: 'Invest',
          entries: [
            {
              account_id: cash_account_id,
              amount_in_cents,
              entry_type: 'debit',
            },
            {
              account_id: investor.investor_principal_account.id,
              amount_in_cents,
              entry_type: 'credit',
            },
          ],
        },
        em
      )
    })
  }

  private async handleInvestmentPayout({
    investment,
    em,
  }: {
    investment: Loaded<Investment, 'investor'>
    em: EntityManager
  }) {
    if (
      investment.term_remaining_in_months !== 0 ||
      investment.next_compounding_time !== null
    ) {
      throw new Error('Cannot pay out investment with remaining time')
    }

    const cash_account_id =
      await this.accountService.getSpecialAccountId('cash')
    const interest_transactions = await investment.interest_transactions.load()
    let total_interest = 0
    for (const interest_transaction of interest_transactions) {
      const entries = await interest_transaction.entries.load()
      const credit_entry = entries.find((entry) => entry.type === 'credit')
      if (!credit_entry) {
        throw new Error('Credit entry not found for transaction')
      }
      total_interest += credit_entry.amount_in_cents
    }

    this.logger.log({
      msg: 'Paying out investment',
      user: investment.investor.$.id,
      total_interest,
    })

    const payout_transaction = await this.entryService.createEntries(
      {
        description: 'Payout',
        entries: [
          {
            account_id: cash_account_id,
            amount_in_cents: total_interest + investment.principal_in_cents,
            entry_type: 'credit',
          },
          {
            account_id: investment.investor.$.investor_interest_account.id,
            amount_in_cents: total_interest,
            entry_type: 'debit',
          },
          {
            account_id: investment.investor.$.investor_principal_account.id,
            amount_in_cents: investment.principal_in_cents,
            entry_type: 'debit',
          },
        ],
      },
      em
    )
    investment.payout_transaction = payout_transaction
    em.persist(investment)
  }

  private async updateInterestForOneInvestment({
    investment,
  }: {
    investment: Loaded<Investment, 'investor'>
  }) {
    const now = new Date()
    const { next_compounding_time } = investment
    if (!next_compounding_time) {
      throw new Error('Inconsistent compounding time')
    }
    if (next_compounding_time.getTime() > now.getTime()) {
      throw new Error('Investment not due for interest yet')
    }
    const revenue_account_id =
      await this.accountService.getSpecialAccountId('revenue')
    await this.em.transactional(async (em) => {
      await em.lock(investment, LockMode.PESSIMISTIC_WRITE)

      if (
        !investment.next_compounding_time ||
        investment.next_compounding_time.getTime() > now.getTime()
      ) {
        // Interest has already been updated by another cron job
        return
      }

      const interest = calculateInterestForInvestment(investment)

      this.logger.log({
        msg: 'Adding interest for investment',
        user: investment.investor.$.id,
        interest,
      })

      // Update ledger for transaction
      const update_interest_transaction = await this.entryService.createEntries(
        {
          description: 'Update interest for investment',
          entries: [
            {
              account_id: investment.investor.$.investor_interest_account.id,
              amount_in_cents: interest,
              entry_type: 'credit',
            },
            {
              account_id: revenue_account_id,
              amount_in_cents: interest,
              entry_type: 'debit',
            },
          ],
        },
        em
      )

      // Update investment
      investment.interest_transactions.add(update_interest_transaction)
      investment.term_remaining_in_months -= 1
      if (investment.term_remaining_in_months === 0) {
        investment.next_compounding_time = null
        await this.handleInvestmentPayout({ investment, em })
      } else {
        investment.next_compounding_time = addMinutes(now, 1)
      }
      em.persist(investment)
    })
  }

  @CreateRequestContext()
  async updateInterestForInvestments() {
    const now = new Date()
    const investmentsToUpdate = await this.investmentRepository.findAll({
      where: {
        next_compounding_time: {
          $lt: now,
        },
        term_remaining_in_months: { $gt: 0 },
      },
      populate: ['investor'],
    })
    for (const investment of investmentsToUpdate) {
      await this.updateInterestForOneInvestment({ investment })
    }
  }
}

import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Account } from 'modules/database/entities/account.entity'
import { Entry } from 'modules/database/entities/entry.entity'
import { Transaction } from 'modules/database/entities/transaction.entity'
import { DataSource, EntityManager, In, Repository } from 'typeorm'

const CREDIT_CARD_FEE_PERCENTAGE = 0.03
const WITHDRAWAL_FEE_PERCENTAGE = 0.03

export interface CreateEntriesDto {
  description: string
  entries: {
    account_id: string
    amount_in_cents: number
    entry_type: 'credit' | 'debit'
  }[]
}

@Injectable()
export class EntryService {
  constructor(
    @InjectRepository(Entry)
    private entryRepository: Repository<Entry>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private dataSource: DataSource
  ) {}

  private isBalanceChangePositive({
    account,
    entry,
  }: {
    account: Account
    entry: CreateEntriesDto['entries'][number]
  }) {
    if (entry.entry_type === 'credit') {
      return account.type === 'credit_normal'
    }
    return account.type === 'debit_normal'
  }

  private async createEntries({
    data,
    transactionManager,
  }: {
    data: CreateEntriesDto
    transactionManager?: EntityManager
  }) {
    const credit_entries = data.entries.filter(
      (entry) => entry.entry_type === 'credit'
    )
    const debit_entries = data.entries.filter(
      (entry) => entry.entry_type === 'debit'
    )
    if (
      data.entries.length < 2 ||
      credit_entries.length === 0 ||
      debit_entries.length === 0
    ) {
      throw new Error('Must have at least one credit and one debit entry')
    }
    const credit_total = credit_entries.reduce(
      (acc, entry) => (acc += entry.amount_in_cents),
      0
    )
    const debit_total = debit_entries.reduce(
      (acc, entry) => (acc += entry.amount_in_cents),
      0
    )
    if (credit_total !== debit_total) {
      throw new Error('Credit total must equal debit total')
    }
    const account_ids = data.entries.map((entry) => entry.account_id)
    const runOperation = async (manager: EntityManager) => {
      const accounts = await manager
        .withRepository(this.accountRepository)
        .find({
          where: {
            id: In(account_ids),
          },
          lock: {
            mode: 'pessimistic_write',
          },
        })
      const found_account_ids = new Set(accounts.map((account) => account.id))
      account_ids.forEach((account_id) => {
        if (!found_account_ids.has(account_id)) {
          throw new Error('Account not found')
        }
      })

      // Generate transaction entity
      const transaction = await manager.save(
        this.transactionRepository.create({
          description: data.description,
        })
      )

      // Generate entry entities
      const entries = data.entries.map((entry) => {
        const account = accounts.find(
          (account) => account.id === entry.account_id
        )
        if (!account) {
          throw new Error('Account not found')
        }
        return this.entryRepository.create({
          amount_in_cents: entry.amount_in_cents,
          type: entry.entry_type,
          account,
          transaction,
        })
      })

      // Update account entities
      data.entries.forEach((entry) => {
        const account = accounts.find(
          (account) => account.id === entry.account_id
        )
        if (!account) {
          throw new Error('Account not found')
        }
        const balanceChange = this.isBalanceChangePositive({ account, entry })
          ? entry.amount_in_cents
          : -entry.amount_in_cents
        account.balance_in_cents += balanceChange
      })

      await manager.save([...entries, ...accounts])
    }
    return transactionManager
      ? runOperation(transactionManager)
      : this.dataSource.transaction(runOperation)
  }

  async topUpWallet({
    account_id,
    amount_in_cents,
  }: {
    account_id: string
    amount_in_cents: number
  }) {
    const cash_account_id = await Account.getSpecialAccountId('cash')
    const credit_card_fees_account_id =
      await Account.getSpecialAccountId('credit_card_fees')
    const credit_card_fee = Math.ceil(
      CREDIT_CARD_FEE_PERCENTAGE * amount_in_cents
    )
    await this.createEntries({
      data: {
        description: 'Top up',
        entries: [
          {
            account_id: cash_account_id,
            amount_in_cents,
            entry_type: 'debit',
          },
          {
            account_id,
            amount_in_cents,
            entry_type: 'credit',
          },
          {
            account_id: cash_account_id,
            amount_in_cents: credit_card_fee,
            entry_type: 'credit',
          },
          {
            account_id: credit_card_fees_account_id,
            amount_in_cents: credit_card_fee,
            entry_type: 'debit',
          },
        ],
      },
    })
  }

  async sendMoney({
    amount_in_cents,
    receiver_account_id,
    sender_account_id,
  }: {
    sender_account_id: string
    receiver_account_id: string
    amount_in_cents: number
  }) {
    await this.createEntries({
      data: {
        description: 'Top up',
        entries: [
          {
            account_id: sender_account_id,
            amount_in_cents,
            entry_type: 'debit',
          },
          {
            account_id: receiver_account_id,
            amount_in_cents,
            entry_type: 'credit',
          },
        ],
      },
    })
  }

  async withdrawMoney({
    account_id,
    amount_in_cents,
  }: {
    account_id: string
    amount_in_cents: number
  }) {
    const cash_account_id = await Account.getSpecialAccountId('cash')
    const revenue_account_id = await Account.getSpecialAccountId('revenue')
    const withdrawal_fee = Math.ceil(
      WITHDRAWAL_FEE_PERCENTAGE * amount_in_cents
    )
    const net_amount_withdrawn = amount_in_cents - withdrawal_fee
    await this.createEntries({
      data: {
        description: 'Withdrawal',
        entries: [
          {
            account_id,
            amount_in_cents,
            entry_type: 'debit',
          },
          {
            account_id: cash_account_id,
            amount_in_cents: net_amount_withdrawn,
            entry_type: 'credit',
          },
          {
            account_id: revenue_account_id,
            amount_in_cents: withdrawal_fee,
            entry_type: 'credit',
          },
        ],
      },
    })
  }
}

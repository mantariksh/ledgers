import { EntityManager, LockMode } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { Account } from 'modules/database/entities/account.entity'
import { Entry } from 'modules/database/entities/entry.entity'
import { Transaction } from 'modules/database/entities/transaction.entity'

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
  constructor(private readonly em: EntityManager) {}

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

  async createEntries(data: CreateEntriesDto) {
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
    const account_ids_deduped = Array.from(new Set(account_ids))
    return this.em.transactional(async (em) => {
      const accounts: Account[] = []
      for (const account_id of account_ids_deduped) {
        const found_account = await em.findOne(
          Account,
          {
            id: account_id,
          },
          {
            lockMode: LockMode.PESSIMISTIC_WRITE,
          }
        )
        if (!found_account) {
          throw new Error('Account not found')
        }
        accounts.push(found_account)
      }

      // Generate transaction entity
      const transaction = new Transaction()
      transaction.description = data.description
      em.persist(transaction)

      // Generate entry entities
      const entries = data.entries.map((entry) => {
        const account = accounts.find(
          (account) => account.id === entry.account_id
        )
        if (!account) {
          throw new Error('Account not found')
        }
        const entryEntity = new Entry()
        entryEntity.amount_in_cents = entry.amount_in_cents
        entryEntity.type = entry.entry_type
        entryEntity.account = account
        entryEntity.transaction = transaction
        return entryEntity
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

      em.persist([...entries, ...accounts])
    })
  }
}

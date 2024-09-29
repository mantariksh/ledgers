import { Entity, ManyToOne, Property } from '@mikro-orm/core'
import { Account } from './account.entity'
import { BaseEntity } from './base.entity'
import { Transaction } from './transaction.entity'

@Entity()
export class Entry extends BaseEntity {
  @Property()
  amount_in_cents: number

  @Property({ type: 'text' })
  type: 'credit' | 'debit'

  @ManyToOne(() => Account)
  account: Account

  @ManyToOne()
  transaction: Transaction
}

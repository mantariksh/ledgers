import { BeforeInsert, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm'

import { nanoid } from '@shared/utils/nanoid'
import { BaseEntity } from './base.entity'
import { Account } from './account.entity'
import { Transaction } from './transaction.entity'

@Entity({ name: 'entries' })
export class Entry extends BaseEntity {
  @PrimaryColumn({ type: 'varchar', length: 24 })
  id: string

  @BeforeInsert()
  setId() {
    this.id = nanoid()
  }

  @Column('int')
  amount_in_cents: number

  @Column('text')
  type: 'credit' | 'debit'

  @ManyToOne(() => Account, (account) => account.entries)
  account: Account

  @ManyToOne(() => Transaction, (transaction) => transaction.entries)
  transaction: Transaction
}

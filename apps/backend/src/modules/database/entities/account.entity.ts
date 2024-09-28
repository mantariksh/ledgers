import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm'

import { nanoid } from '@shared/utils/nanoid'
import { BaseEntity } from './base.entity'
import { User } from './user.entity'
import { Entry } from './entry.entity'

export type SpecialAccount = 'cash' | 'credit_card_fees' | 'revenue'

const SPECIAL_ACCOUNT_ID_CACHE: Partial<Record<SpecialAccount, string>> = {}

@Entity({ name: 'accounts' })
export class Account extends BaseEntity {
  @PrimaryColumn({ type: 'varchar', length: 24 })
  id: string

  @BeforeInsert()
  setId() {
    this.id = nanoid()
  }

  @Column('text')
  type: 'credit_normal' | 'debit_normal'

  @Column('text', { nullable: true })
  @Index()
  name: SpecialAccount | null

  @Column('int')
  balance_in_cents: number

  @ManyToOne(() => User, (user) => user.accounts, { nullable: true })
  user: User

  @OneToMany(() => Entry, (entry) => entry.account)
  entries: Entry[]

  static async getSpecialAccountId(
    accountName: SpecialAccount
  ): Promise<string> {
    if (!SPECIAL_ACCOUNT_ID_CACHE[accountName]) {
      const account = await this.findOne({
        where: {
          name: accountName,
        },
      })
      if (account) {
        SPECIAL_ACCOUNT_ID_CACHE[accountName] = account.id
      } else {
        const createdAccount = await this.create({
          type: ['revenue'].includes(accountName)
            ? 'credit_normal'
            : 'debit_normal',
          name: accountName,
          balance_in_cents: 0,
        }).save()
        SPECIAL_ACCOUNT_ID_CACHE[accountName] = createdAccount.id
      }
    }

    return SPECIAL_ACCOUNT_ID_CACHE[accountName] as string
  }
}

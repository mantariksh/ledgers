import {
  Collection,
  Entity,
  OneToMany,
  Property,
  TextType,
} from '@mikro-orm/core'
import { BaseEntity } from './base.entity'
import { Entry } from './entry.entity'

export type SpecialAccount = 'cash' | 'credit_card_fees' | 'revenue'

@Entity()
export class Account extends BaseEntity {
  @Property({ type: TextType })
  type: 'credit_normal' | 'debit_normal'

  @Property({ type: TextType, index: true, nullable: true })
  name: SpecialAccount | null

  @Property()
  balance_in_cents: number

  @OneToMany(() => Entry, (entry) => entry.account)
  entries = new Collection<Entry>(this)
}

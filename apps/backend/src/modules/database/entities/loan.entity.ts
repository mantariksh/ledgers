import {
  Collection,
  Entity,
  FloatType,
  ManyToMany,
  ManyToOne,
  Property,
  Ref,
} from '@mikro-orm/core'
import { BaseEntity } from './base.entity'
import { User } from './user.entity'
import { Transaction } from './transaction.entity'

@Entity()
export class Loan extends BaseEntity {
  @ManyToOne(() => User, { ref: true })
  borrower: Ref<User>

  @Property()
  principal_in_cents: number

  @Property()
  remaining_principal_in_cents: number

  @Property({ type: FloatType })
  interest_rate: number

  @Property()
  compounding_frequency: 'month'

  @Property()
  term_in_months: number

  @Property({ type: 'timestamp with time zone', nullable: true })
  next_compounding_time: Date | null

  @ManyToMany(() => Transaction)
  interest_transactions = new Collection<Transaction>(this)

  @ManyToMany(() => Transaction)
  payment_transactions = new Collection<Transaction>(this)
}

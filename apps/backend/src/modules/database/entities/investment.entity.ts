import {
  Collection,
  Entity,
  FloatType,
  ManyToMany,
  ManyToOne,
  OneToOne,
  Property,
  Ref,
} from '@mikro-orm/core'
import { BaseEntity } from './base.entity'
import { User } from './user.entity'
import { Transaction } from './transaction.entity'

@Entity()
export class Investment extends BaseEntity {
  @ManyToOne(() => User, { ref: true })
  investor: Ref<User>

  @Property()
  principal_in_cents: number

  @Property({ type: FloatType })
  interest_rate: number

  @Property()
  compounding_frequency: 'minute'

  @Property()
  num_compounds_in_term: number

  @Property()
  num_compounds_remaining: number

  @Property({ type: 'timestamp with time zone', nullable: true })
  next_compounding_time: Date | null

  @ManyToMany(() => Transaction)
  interest_transactions = new Collection<Transaction>(this)

  @OneToOne({ nullable: true, owner: true, type: Transaction })
  payout_transaction: Transaction | null
}

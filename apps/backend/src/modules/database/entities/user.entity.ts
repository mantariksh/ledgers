import { Entity, OneToOne, Property, Ref } from '@mikro-orm/core'
import { Account } from './account.entity'
import { BaseEntity } from './base.entity'
import { LowercasedType } from '../utils/LowercasedType'

@Entity()
export class User extends BaseEntity {
  @Property({ type: LowercasedType, unique: true })
  email: string

  @OneToOne(() => Account)
  wallet_account: Ref<Account>

  @OneToOne(() => Account)
  borrower_principal_account: Ref<Account>

  @OneToOne(() => Account)
  borrower_interest_account: Ref<Account>

  @OneToOne(() => Account)
  investor_principal_account: Ref<Account>

  @OneToOne(() => Account)
  investor_interest_account: Ref<Account>
}

import { EntityRepository, ref } from '@mikro-orm/core'
import { InjectRepository } from '@mikro-orm/nestjs'
import { EntityManager } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import { isValidNanoId } from '@shared/utils/nanoid'
import { Account } from 'modules/database/entities/account.entity'
import { User } from 'modules/database/entities/user.entity'

export interface CreateEntriesDto {
  description: string
  entries: {
    account_id: string
    amount_in_cents: number
    entry_type: 'credit' | 'debit'
  }[]
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: EntityRepository<User>,
    private em: EntityManager
  ) {}

  private async createUser({ user_id }: { user_id: string }) {
    return this.em.transactional(async (em) => {
      const wallet_account = this.createAccount({ type: 'credit_normal' })
      const borrower_principal_account = this.createAccount({
        type: 'debit_normal',
      })
      const borrower_interest_account = this.createAccount({
        type: 'debit_normal',
      })
      const investor_principal_account = this.createAccount({
        type: 'credit_normal',
      })
      const investor_interest_account = this.createAccount({
        type: 'credit_normal',
      })
      em.persist([
        wallet_account,
        borrower_principal_account,
        borrower_interest_account,
        investor_principal_account,
        investor_interest_account,
      ])
      const user = new User()
      user.id = user_id
      user.email = `ABC${Date.now()}@gmail.com`
      user.wallet_account = ref(wallet_account)
      user.borrower_principal_account = ref(borrower_principal_account)
      user.borrower_interest_account = ref(borrower_interest_account)
      user.investor_principal_account = ref(investor_principal_account)
      user.investor_interest_account = ref(investor_interest_account)
      em.persist(user)
      return user
    })
  }

  private createAccount({ type }: { type: Account['type'] }) {
    const account = new Account()
    account.type = type
    account.balance_in_cents = 0
    return account
  }

  async getAccountsForUser({ user_id }: { user_id: string }) {
    if (!isValidNanoId(user_id)) {
      throw new Error('Invalid user ID')
    }
    const user =
      (await this.userRepository.findOne({
        id: user_id,
      })) ?? (await this.createUser({ user_id }))
    return {
      wallet_account: user.wallet_account,
      borrower_principal_account: user.borrower_principal_account,
      borrower_interest_account: user.borrower_interest_account,
      investor_principal_account: user.investor_principal_account,
      investor_interest_account: user.investor_interest_account,
    }
  }

  async getUser({ user_id }: { user_id: string }) {
    if (!isValidNanoId(user_id)) {
      throw new Error('Invalid user ID')
    }
    return (
      (await this.userRepository.findOne({
        id: user_id,
      })) ?? (await this.createUser({ user_id }))
    )
  }
}

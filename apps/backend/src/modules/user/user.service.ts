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

  private async createUser({
    em,
    wallet_account,
    user_id,
  }: {
    em: EntityManager
    wallet_account?: Account
    user_id: string
  }) {
    const user = new User()
    user.id = user_id
    user.email = `ABC${Date.now()}@gmail.com`
    if (wallet_account) {
      user.wallet_account = ref(wallet_account)
    }
    em.persist(user)
  }

  async getWalletAccountForUser({ user_id }: { user_id: string }) {
    const user = await this.userRepository.findOne({
      id: user_id,
    })
    if (user) {
      return user.wallet_account
    }
    if (!isValidNanoId(user_id)) {
      throw new Error('Invalid user ID')
    }
    return this.em.transactional(async (em) => {
      const wallet_account = new Account()
      wallet_account.type = 'credit_normal'
      wallet_account.balance_in_cents = 0
      em.persist(wallet_account)
      this.createUser({
        em,
        wallet_account,
        user_id,
      })
      return wallet_account
    })
  }
}

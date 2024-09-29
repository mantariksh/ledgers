import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { isValidNanoId } from '@shared/utils/nanoid'
import { Account } from 'modules/database/entities/account.entity'
import { User } from 'modules/database/entities/user.entity'
import { DataSource, EntityManager, Repository } from 'typeorm'

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
    private userRepository: Repository<User>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    private dataSource: DataSource
  ) {}

  private async createUser({
    manager,
    wallet_account,
    user_id,
  }: {
    manager: EntityManager
    wallet_account?: Account
    user_id: string
  }) {
    return manager
      .withRepository(this.userRepository)
      .create({
        id: user_id,
        email: `abc${Date.now()}@gmail.com`,
        wallet_account,
      })
      .save()
  }

  async getWalletAccountForUser({ user_id }: { user_id: string }) {
    const user = await this.userRepository.findOne({
      where: {
        id: user_id,
      },
    })
    if (user) {
      return user.wallet_account
    }
    if (!isValidNanoId(user_id)) {
      throw new Error('Invalid user ID')
    }
    return this.dataSource.transaction(async (manager) => {
      const wallet_account = await manager
        .withRepository(this.accountRepository)
        .create({
          type: 'credit_normal',
          balance_in_cents: 0,
        })
        .save()
      const newUser = await this.createUser({
        manager,
        wallet_account,
        user_id,
      })
      return newUser.wallet_account
    })
  }
}

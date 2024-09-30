import { InjectRepository } from '@mikro-orm/nestjs'
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql'
import { Injectable } from '@nestjs/common'
import {
  Account,
  SpecialAccount,
} from 'modules/database/entities/account.entity'

@Injectable()
export class AccountService {
  private SPECIAL_ACCOUNT_ID_CACHE: Partial<Record<SpecialAccount, string>> = {}

  constructor(
    @InjectRepository(Account)
    private accountRepository: EntityRepository<Account>,
    private readonly em: EntityManager
  ) {}

  async getSpecialAccountId(accountName: SpecialAccount): Promise<string> {
    if (!this.SPECIAL_ACCOUNT_ID_CACHE[accountName]) {
      const account = await this.accountRepository.findOne({
        name: accountName,
      })
      if (account) {
        this.SPECIAL_ACCOUNT_ID_CACHE[accountName] = account.id
      } else {
        const account = new Account()
        account.type = ['revenue'].includes(accountName)
          ? 'credit_normal'
          : 'debit_normal'
        account.name = accountName
        account.balance_in_cents = 0
        await this.em.persist(account).flush()
        this.SPECIAL_ACCOUNT_ID_CACHE[accountName] = account.id
      }
    }

    return this.SPECIAL_ACCOUNT_ID_CACHE[accountName] as string
  }
}

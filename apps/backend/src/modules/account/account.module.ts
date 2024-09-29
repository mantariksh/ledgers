import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { Account } from 'modules/database/entities/account.entity'
import { AccountService } from './account.service'

@Module({
  imports: [MikroOrmModule.forFeature([Account])],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}

import { Module } from '@nestjs/common'
import { UserModule } from 'modules/user/user.module'
import { LoanController } from './loan.controller'
import { LoanService } from './loan.service'
import { EntryModule } from 'modules/entry/entry.module'
import { AccountModule } from 'modules/account/account.module'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Loan } from 'modules/database/entities/loan.entity'

@Module({
  imports: [
    MikroOrmModule.forFeature([Loan]),
    UserModule,
    EntryModule,
    AccountModule,
  ],
  controllers: [LoanController],
  providers: [LoanService],
  exports: [LoanService],
})
export class LoanModule {}

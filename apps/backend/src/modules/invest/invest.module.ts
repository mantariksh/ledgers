import { Module } from '@nestjs/common'
import { AccountModule } from 'modules/account/account.module'
import { EntryModule } from 'modules/entry/entry.module'
import { UserModule } from 'modules/user/user.module'
import { InvestController } from './invest.controller'
import { InvestService } from './invest.service'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Investment } from 'modules/database/entities/investment.entity'

@Module({
  imports: [
    MikroOrmModule.forFeature([Investment]),
    EntryModule,
    UserModule,
    AccountModule,
  ],
  controllers: [InvestController],
  providers: [InvestService],
  exports: [InvestService],
})
export class InvestModule {}

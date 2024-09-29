import { Module } from '@nestjs/common'
import { EntryModule } from 'modules/entry/entry.module'
import { WalletController } from './wallet.controller'
import { WalletService } from './wallet.service'
import { UserModule } from 'modules/user/user.module'
import { AccountModule } from 'modules/account/account.module'

@Module({
  imports: [EntryModule, UserModule, AccountModule],
  controllers: [WalletController],
  providers: [WalletService],
})
export class WalletModule {}

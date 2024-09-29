import { Module } from '@nestjs/common'
import { EntryModule } from 'modules/entry/entry.module'
import { WalletController } from './wallet.controller'
import { WalletService } from './wallet.service'

@Module({
  imports: [EntryModule],
  controllers: [WalletController],
  providers: [WalletService],
})
export class WalletModule {}

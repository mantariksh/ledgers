import { Body, Controller, Post } from '@nestjs/common'
import {
  SendMoneyRequestDto,
  TopUpWalletRequestDto,
  WithdrawMoneyRequestDto,
} from '@shared/dto/entry.dto'
import { WalletService } from './wallet.service'

@Controller()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('topup')
  async topUpWallet(
    @Body()
    { account_id, amount_in_cents }: TopUpWalletRequestDto
  ) {
    await this.walletService.topUpWallet({
      account_id,
      amount_in_cents,
    })
    return { message: 'Entry created' }
  }

  @Post('send')
  async sendMoney(
    @Body()
    {
      amount_in_cents,
      sender_account_id,
      receiver_account_id,
    }: SendMoneyRequestDto
  ) {
    await this.walletService.sendMoney({
      amount_in_cents,
      sender_account_id,
      receiver_account_id,
    })
    return { message: 'Entry created' }
  }

  @Post('withdraw')
  async withdrawMoney(
    @Body()
    { amount_in_cents, account_id }: WithdrawMoneyRequestDto
  ) {
    await this.walletService.withdrawMoney({
      amount_in_cents,
      account_id,
    })
    return { message: 'Entry created' }
  }
}

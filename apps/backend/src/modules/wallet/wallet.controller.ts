import { Body, Controller, Post } from '@nestjs/common'
import {
  SendMoneyRequestDto,
  TopUpWalletRequestDto,
  WithdrawMoneyRequestDto,
} from '@shared/dto/wallet.dto'
import { WalletService } from './wallet.service'
import { UserService } from 'modules/user/user.service'

@Controller()
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly userService: UserService
  ) {}

  @Post('topup')
  async topUpWallet(
    @Body()
    { amount_in_cents, user_id }: TopUpWalletRequestDto
  ) {
    const wallet_account = await this.userService.getWalletAccountForUser({
      user_id,
    })
    await this.walletService.topUpWallet({
      account_id: wallet_account.id,
      amount_in_cents,
    })
  }

  @Post('send')
  async sendMoney(
    @Body()
    { amount_in_cents, receiver_user_id, sender_user_id }: SendMoneyRequestDto
  ) {
    const sender_wallet_account =
      await this.userService.getWalletAccountForUser({
        user_id: sender_user_id,
      })
    const receiver_wallet_account =
      await this.userService.getWalletAccountForUser({
        user_id: receiver_user_id,
      })
    await this.walletService.sendMoney({
      amount_in_cents,
      receiver_account_id: receiver_wallet_account.id,
      sender_account_id: sender_wallet_account.id,
    })
  }

  @Post('withdraw')
  async withdrawMoney(
    @Body()
    { amount_in_cents, user_id }: WithdrawMoneyRequestDto
  ) {
    const wallet_account = await this.userService.getWalletAccountForUser({
      user_id,
    })
    await this.walletService.withdrawMoney({
      account_id: wallet_account.id,
      amount_in_cents,
    })
  }
}

import { Injectable } from '@nestjs/common'
import { Account } from 'modules/database/entities/account.entity'
import { EntryService } from 'modules/entry/entry.service'

const CREDIT_CARD_FEE_PERCENTAGE = 0.03
const WITHDRAWAL_FEE_PERCENTAGE = 0.03

@Injectable()
export class WalletService {
  constructor(private readonly entryService: EntryService) {}

  async topUpWallet({
    account_id,
    amount_in_cents,
  }: {
    account_id: string
    amount_in_cents: number
  }) {
    const cash_account_id = await Account.getSpecialAccountId('cash')
    const credit_card_fees_account_id =
      await Account.getSpecialAccountId('credit_card_fees')
    const credit_card_fee = Math.ceil(
      CREDIT_CARD_FEE_PERCENTAGE * amount_in_cents
    )
    await this.entryService.createEntries({
      data: {
        description: 'Top up',
        entries: [
          {
            account_id: cash_account_id,
            amount_in_cents,
            entry_type: 'debit',
          },
          {
            account_id,
            amount_in_cents,
            entry_type: 'credit',
          },
          {
            account_id: cash_account_id,
            amount_in_cents: credit_card_fee,
            entry_type: 'credit',
          },
          {
            account_id: credit_card_fees_account_id,
            amount_in_cents: credit_card_fee,
            entry_type: 'debit',
          },
        ],
      },
    })
  }

  async sendMoney({
    amount_in_cents,
    receiver_account_id,
    sender_account_id,
  }: {
    sender_account_id: string
    receiver_account_id: string
    amount_in_cents: number
  }) {
    await this.entryService.createEntries({
      data: {
        description: 'Top up',
        entries: [
          {
            account_id: sender_account_id,
            amount_in_cents,
            entry_type: 'debit',
          },
          {
            account_id: receiver_account_id,
            amount_in_cents,
            entry_type: 'credit',
          },
        ],
      },
    })
  }

  async withdrawMoney({
    account_id,
    amount_in_cents,
  }: {
    account_id: string
    amount_in_cents: number
  }) {
    const cash_account_id = await Account.getSpecialAccountId('cash')
    const revenue_account_id = await Account.getSpecialAccountId('revenue')
    const withdrawal_fee = Math.ceil(
      WITHDRAWAL_FEE_PERCENTAGE * amount_in_cents
    )
    const net_amount_withdrawn = amount_in_cents - withdrawal_fee
    await this.entryService.createEntries({
      data: {
        description: 'Withdrawal',
        entries: [
          {
            account_id,
            amount_in_cents,
            entry_type: 'debit',
          },
          {
            account_id: cash_account_id,
            amount_in_cents: net_amount_withdrawn,
            entry_type: 'credit',
          },
          {
            account_id: revenue_account_id,
            amount_in_cents: withdrawal_fee,
            entry_type: 'credit',
          },
        ],
      },
    })
  }
}

import { z } from 'zod'
import { createZodDto } from './common/createZodDto'

export class TopUpWalletRequestDto extends createZodDto(
  z.object({
    amount_in_cents: z.number().int(),
    account_id: z.string(),
  })
) {}

export class SendMoneyRequestDto extends createZodDto(
  z.object({
    amount_in_cents: z.number().int(),
    sender_account_id: z.string(),
    receiver_account_id: z.string(),
  })
) {}

export class WithdrawMoneyRequestDto extends createZodDto(
  z.object({
    amount_in_cents: z.number().int(),
    account_id: z.string(),
  })
) {}

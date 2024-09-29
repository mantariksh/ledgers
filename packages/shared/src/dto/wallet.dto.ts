import { z } from 'zod'
import { createZodDto } from './common/createZodDto'

export class TopUpWalletRequestDto extends createZodDto(
  z.object({
    amount_in_cents: z.number().int(),
    user_id: z.string(),
  })
) {}

export class SendMoneyRequestDto extends createZodDto(
  z.object({
    amount_in_cents: z.number().int(),
    sender_user_id: z.string(),
    receiver_user_id: z.string(),
  })
) {}

export class WithdrawMoneyRequestDto extends createZodDto(
  z.object({
    amount_in_cents: z.number().int(),
    user_id: z.string(),
  })
) {}

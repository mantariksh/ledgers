import { z } from 'zod'
import { createZodDto } from './common/createZodDto'

export class InvestRequestDto extends createZodDto(
  z.object({
    amount_in_cents: z.number().int(),
    user_id: z.string(),
  })
) {}

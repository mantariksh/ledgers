import { z } from 'zod'
import { createZodDto } from './common/createZodDto'

export class CreateLoanRequestDto extends createZodDto(
  z.object({
    amount_in_cents: z.number().int(),
    user_id: z.string(),
  })
) {}

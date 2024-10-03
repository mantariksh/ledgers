import { Body, Controller, Post } from '@nestjs/common'
import { InvestRequestDto } from '@shared/dto/invest.dto'
import { InvestService } from './invest.service'

@Controller()
export class InvestController {
  constructor(private readonly investService: InvestService) {}

  @Post()
  async invest(
    @Body()
    { amount_in_cents, user_id, term_in_months }: InvestRequestDto
  ) {
    await this.investService.invest({
      user_id,
      amount_in_cents,
      term_in_months,
    })
  }
}

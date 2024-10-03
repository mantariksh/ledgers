import { Body, Controller, Post } from '@nestjs/common'
import { CreateLoanRequestDto } from '@shared/dto/loan.dto'
import { LoanService } from './loan.service'

@Controller()
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @Post()
  async createLoan(
    @Body()
    { amount_in_cents, user_id, term_in_months }: CreateLoanRequestDto
  ) {
    await this.loanService.createAndDisburseLoan({
      amount_in_cents,
      user_id,
      term_in_months,
    })
  }
}

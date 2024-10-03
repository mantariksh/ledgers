import { MONTHS_PER_YEAR } from 'common/constants/time'

/**
 * Returns the interest to be credited for an investment period.
 *
 * Assumes interest rate is "annual" interest rate (in the case of
 * our toy app, this is a "per 12-minute" interest rate).
 */
export const calculateInterestForInvestment = ({
  principal_in_cents,
  interest_rate,
}: {
  principal_in_cents: number
  interest_rate: number
}) => {
  return Math.ceil((interest_rate * principal_in_cents) / MONTHS_PER_YEAR)
}

/**
 * Returns the interest + principal amounts to be repaid for a
 * loan period.
 *
 * Assumes interest rate is "annual" interest rate (in the case of
 * our toy app, this is a "per 12-minute" interest rate).
 */
export const calculateLoanRepayment = ({
  principal_in_cents,
  remaining_principal_in_cents,
  interest_rate,
  term_in_months,
}: {
  principal_in_cents: number
  remaining_principal_in_cents: number
  interest_rate: number
  term_in_months: number
}): {
  interest_repayment: number
  principal_repayment: number
} => {
  const total_interest = principal_in_cents * interest_rate
  const interest_repayment = Math.ceil(total_interest / MONTHS_PER_YEAR)
  const max_principal_repayment = Math.ceil(principal_in_cents / term_in_months)
  return {
    interest_repayment,
    // Can't repay more than remaining principal
    principal_repayment: Math.min(
      max_principal_repayment,
      remaining_principal_in_cents
    ),
  }
}

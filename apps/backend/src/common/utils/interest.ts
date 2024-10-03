import { MONTHS_PER_YEAR } from 'common/constants/time'

/**
 * Implements compound interset formula,
 * A = P(1 + r/n)^t
 */
const calculateFinalCompoundInterestAmount = (
  principal: number,
  annual_interest_rate: number,
  num_compounds_in_months: number
): number => {
  return Math.ceil(
    principal *
      (1 + annual_interest_rate / MONTHS_PER_YEAR) ** num_compounds_in_months
  )
}

/**
 * Returns the interest to be credited for an investment period.
 *
 * Assumes interest rate is "annual" interest rate (in the case of
 * our toy app, this is a "per 12-minute" interest rate).
 */
export const calculateInterestForInvestment = ({
  principal_in_cents,
  interest_rate,
  term_in_months,
  term_remaining_in_months,
}: {
  principal_in_cents: number
  interest_rate: number
  term_in_months: number
  term_remaining_in_months: number
}) => {
  /**
   * Number of times to compound
   */
  const n = term_in_months - term_remaining_in_months
  const new_balance = calculateFinalCompoundInterestAmount(
    principal_in_cents,
    interest_rate,
    n + 1
  )
  const prev_balance = calculateFinalCompoundInterestAmount(
    principal_in_cents,
    interest_rate,
    n
  )
  return new_balance - prev_balance
}

/**
 * Implements monthly loan payment, commonly known as
 * "mortgage payment equation".
 *
 * M = (P * i * (1 + i)^n) / ((1 + i)^n - 1)
 */
const calculateMonthlyLoanPayment = (
  principal_in_cents: number,
  annual_interest_rate: number,
  term_in_months: number
): number => {
  const monthly_interest_rate = annual_interest_rate / MONTHS_PER_YEAR
  const numerator =
    principal_in_cents *
    monthly_interest_rate *
    (1 + monthly_interest_rate) ** term_in_months
  const denominator = (1 + monthly_interest_rate) ** term_in_months - 1
  return Math.ceil(numerator / denominator)
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
  const interest_repayment = Math.ceil(
    (remaining_principal_in_cents * interest_rate) / MONTHS_PER_YEAR
  )
  const total_repayment = calculateMonthlyLoanPayment(
    principal_in_cents,
    interest_rate,
    term_in_months
  )
  const max_principal_repayment = total_repayment - interest_repayment
  return {
    interest_repayment,
    // Can't repay more than remaining principal
    principal_repayment: Math.min(
      max_principal_repayment,
      remaining_principal_in_cents
    ),
  }
}

/**
 * Simple interest for now
 */
export const calculateInterest = ({
  principal_in_cents,
  interest_rate,
  num_compounds_in_term,
}: {
  principal_in_cents: number
  interest_rate: number
  num_compounds_in_term: number
}) => {
  return Math.ceil((interest_rate * principal_in_cents) / num_compounds_in_term)
}

/**
 * Simple interest for now
 */
export const calculateLoanRepayment = ({
  principal_in_cents,
  remaining_principal_in_cents,
  interest_rate,
  num_compounds_in_term,
}: {
  principal_in_cents: number
  remaining_principal_in_cents: number
  interest_rate: number
  num_compounds_in_term: number
}): {
  interest_repayment: number
  principal_repayment: number
} => {
  const total_interest = principal_in_cents * interest_rate
  const interest_repayment = Math.ceil(total_interest / num_compounds_in_term)
  const max_principal_repayment = Math.ceil(
    principal_in_cents / num_compounds_in_term
  )
  return {
    interest_repayment,
    // Can't repay more than remaining principal
    principal_repayment: Math.min(
      max_principal_repayment,
      remaining_principal_in_cents
    ),
  }
}

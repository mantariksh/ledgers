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

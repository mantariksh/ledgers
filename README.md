## Introduction

This is an implementation of the examples in Modern Treasury's "Accounting For Developers" article series. The implementation includes both the example in [part 2 of the series](https://www.moderntreasury.com/journal/accounting-for-developers-part-ii), a toy Venmo clone, and the example in [part 3 of the series](https://www.moderntreasury.com/journal/accounting-for-developers-part-iii), a lending marketplace.

I have also extended the example in part 3 to use compound interest instead of simple interest.

Note that for the lending marketplace implementation, I've adjusted the interest calculation interval to minutes instead of months, so you can watch a 1-year investment or 1-year loan play out in 12 minutes instead of 12 months.

## Getting started

1. Checkout the relevant commit:
    - `4e7b746` for toy Venmo clone
    - `5ffc66d` for lending marketplace with simple interest
    - `feeb8cd` for lending marketplace with compound interest
1. Run `pnpm install`
1. Run `pnpm dev`
1. Run `cd apps/backend && pnpm migration:run`
1. Use [Bruno](https://www.usebruno.com/) and import the `bruno` folder to call the relevant APIs
1. Use your SQL database GUI of choice to observe how the account balances change.

# Early Repayment Calculator

## Overview

The `computeEarlyRepayment` function calculates interest savings and schedule changes when making extra payments on a loan.

## Function Signature

```typescript
function computeEarlyRepayment(
  loanAmount: number,
  totalMonths: number,
  interestRates: number[],
  calcMethod: 'annuity' | 'fixed',
  extraAmount: number,
  paymentType: 'one-time' | 'monthly'
): EarlyRepaymentResult
```

## Parameters

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `loanAmount` | number | Original loan principal (VND) |
| `totalMonths` | number | Loan term in months |
| `interestRates` | number[] | Annual interest rates per year (%) |
| `calcMethod` | 'annuity' \| 'fixed' | Calculation method |
| `extraAmount` | number | Extra payment amount (VND) |
| `paymentType` | 'one-time' \| 'monthly' | Payment frequency |

## Return Value

```typescript
interface EarlyRepaymentResult {
  newSchedule: ScheduleEntry[];    // New amortization schedule
  originalTotalInterest: number;  // Total interest without extra payment
  newTotalInterest: number;       // Total interest with extra payment
  interestSaved: number;          // Interest savings = original - new
  originalMonths: number;         // Original loan term
  newMonths: number;              // New loan term (may be shorter)
  monthsReduced: number;          // Months saved = original - new
}
```

## Calculation Logic

### Step 1: Calculate Original Schedule

First, compute the original amortization schedule without any extra payments using either:

- `computeScheduleAnnuity()` - Equal monthly payments (PMT formula)
- `computeScheduleFixed()` - Fixed principal, decreasing interest

### Step 2: Apply Extra Payment

#### One-Time Payment

- Reduces principal immediately at month 1
- Formula: `newPrincipal = loanAmount - extraAmount`
- Recalculates monthly payment based on reduced principal

#### Monthly Extra Payment

- Added to each monthly payment
- Reduces principal faster each month
- Formula: `totalPayment = regularPayment + extraAmount`

### Step 3: Recalculate Schedule

For each month until loan is paid off:

```text
For Annuity Method:
1. Calculate remaining months
2. Recalculate PMT for remaining balance
3. Add extra amount (if monthly)
4. Interest = remainingBalance x monthlyRate
5. Principal = payment - interest
6. Update remaining balance

For Fixed Principal Method:
1. fixedPrincipal = loanAmount / totalMonths
2. principal = fixedPrincipal + extraAmount (if monthly)
3. interest = remainingBalance x monthlyRate
4. payment = principal + interest
5. Update remaining balance
```

### Step 4: Calculate Savings

```text
interestSaved = originalTotalInterest - newTotalInterest
monthsReduced = originalMonths - newMonths
```

## Example

### Input

- Loan: 500,000,000 VND
- Term: 120 months (10 years)
- Rate: 8% per year
- Method: Annuity
- Extra: 5,000,000 VND monthly

### Output

```typescript
{
  originalTotalInterest: 226_000_000,  // ~226M VND
  newTotalInterest: 142_000_000,       // ~142M VND
  interestSaved: 84_000_000,           // ~84M VND saved
  originalMonths: 120,
  newMonths: 78,                       // Pay off 42 months earlier
  monthsReduced: 42
}
```

## Key Formulas

### Monthly Interest Rate

```text
monthlyRate = annualRate / 100 / 12
```

### PMT (Payment) Formula

```text
PMT = r x PV x (1 + r)^n / ((1 + r)^n - 1)

Where:
- r = monthly interest rate
- PV = present value (loan amount)
- n = number of months
```

### Interest Calculation

```text
monthlyInterest = remainingBalance x monthlyRate
```

### Principal Calculation

```text
principal = payment - interest
```

## Notes

1. **Early Termination**: Loop terminates when `remainingLoan <= 0.01` (handles floating point)
2. **Safety Limit**: Maximum iterations = `totalMonths x 2` to prevent infinite loops
3. **Variable Rates**: Supports different interest rates per year via `getInterestRateMonthly()`
4. **Precision**: All amounts are in VND (no decimals needed for display)

## Related Functions

- `computeScheduleAnnuity()` - Standard annuity schedule
- `computeScheduleFixed()` - Fixed principal schedule
- `PMT()` - Payment calculation
- `getInterestRateMonthly()` - Get rate for specific month

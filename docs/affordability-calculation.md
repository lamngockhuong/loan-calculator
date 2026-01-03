# Affordability Calculator

## Overview

The `computeAffordability` function calculates the maximum loan amount a person can afford based on their monthly income and the DTI (Debt-to-Income) ratio.

## What is DTI?

**DTI (Debt-to-Income)** ratio measures how much of your monthly income goes toward debt payments.

```text
DTI = Monthly Debt Payments / Monthly Gross Income x 100%
```

### DTI Threshold Guidelines

| DTI Range | Assessment | Recommendation |
| --------- | ---------- | -------------- |
| Below 36% | Ideal | Strong financial health, low risk |
| 37-42% | Acceptable | Be cautious with new debt |
| 43-49% | Warning | High debt risk, may face loan rejection |
| Above 50% | Critical | Need debt reduction plan urgently |

## Function Signature

```typescript
function computeAffordability(
  monthlyIncome: number,
  interestRate: number,
  loanYears: number
): AffordabilityResult
```

## Parameters

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `monthlyIncome` | number | Gross monthly income (VND) |
| `interestRate` | number | Annual interest rate (%) |
| `loanYears` | number | Loan term in years |

## Return Value

```typescript
interface AffordabilityResult {
  maxLoan43: number;           // Maximum loan at 43% DTI
  maxLoan36: number;           // Maximum loan at 36% DTI (comfortable)
  maxMonthlyPayment43: number; // Max monthly payment at 43% DTI
  maxMonthlyPayment36: number; // Max monthly payment at 36% DTI
}
```

## Calculation Logic

### Step 1: Calculate Maximum Monthly Payment

Based on DTI thresholds:

```text
maxPayment43 = monthlyIncome x 0.43  (maximum)
maxPayment36 = monthlyIncome x 0.36  (comfortable)
```

### Step 2: Convert to Monthly Interest Rate

```text
monthlyRate = annualRate / 100 / 12
```

### Step 3: Calculate Maximum Loan (Reverse PMT Formula)

The reverse PMT formula calculates present value (loan amount) from payment:

```text
PV = PMT x ((1 - (1 + r)^-n) / r)

Where:
- PV = Present Value (maximum loan amount)
- PMT = Maximum monthly payment
- r = Monthly interest rate
- n = Total months
```

### Special Case: Zero Interest Rate

```text
If r = 0: maxLoan = maxPayment x totalMonths
```

## Example

### Input

- Monthly income: 30,000,000 VND
- Interest rate: 9% per year
- Loan term: 20 years

### Calculation

```text
Step 1: Max monthly payments
- At 43% DTI: 30,000,000 x 0.43 = 12,900,000 VND
- At 36% DTI: 30,000,000 x 0.36 = 10,800,000 VND

Step 2: Monthly rate
- 9 / 100 / 12 = 0.0075

Step 3: Max loan (using reverse PMT)
- At 43% DTI: ~1,433,000,000 VND (~1.43 billion)
- At 36% DTI: ~1,200,000,000 VND (~1.2 billion)
```

### Output

```typescript
{
  maxLoan43: 1_433_000_000,
  maxLoan36: 1_200_000_000,
  maxMonthlyPayment43: 12_900_000,
  maxMonthlyPayment36: 10_800_000
}
```

## Why Two DTI Levels?

| Level | DTI | Purpose |
| ----- | --- | ------- |
| **Maximum** | 43% | Upper limit, higher risk, may strain finances |
| **Comfortable** | 36% | Recommended, leaves buffer for emergencies |

**Recommendation**: Use 36% DTI for financial safety. Only consider 43% if you have stable income and no other debts.

## Key Formulas

### DTI Calculation

```text
DTI = (Monthly Loan Payment / Monthly Income) x 100%
```

### Reverse PMT (Loan Amount from Payment)

```text
PV = PMT x ((1 - (1 + r)^-n) / r)
```

### Standard PMT (Payment from Loan Amount)

```text
PMT = PV x (r x (1 + r)^n) / ((1 + r)^n - 1)
```

## Notes

1. **Gross Income**: Use pre-tax income for calculation
2. **Other Debts**: This calculates for one loan only; reduce if you have other debts
3. **Variable Rates**: Uses first year rate; actual affordability may change
4. **Conservative Approach**: 36% DTI is recommended for long-term financial health

## Related Functions

- `computeScheduleAnnuity()` - Calculate payment schedule
- `PMT()` - Calculate monthly payment from loan amount
- `computeEarlyRepayment()` - Calculate early repayment savings

# Loan Calculator

This is a loan calculator application built with [Next.js](https://nextjs.org) and bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Features

1. **Loan Amount Input**

   - Allows users to input the loan amount in VND.

2. **Loan Term Input**

   - Allows users to input the loan term in years (can be fractional).

3. **Calculation Method Selection**

   - Users can choose between two calculation methods:
     - Annuity (Equal Principal and Interest)
     - Fixed Principal, Reducing Interest

4. **Interest Rate Generation**

   - Generate interest rates for each year or a common interest rate for all years.

5. **Interest Rate Input**

   - Allows users to input interest rates for each period.

6. **Repayment Schedule Calculation**

   - Calculates the repayment schedule based on the input values and selected calculation method.

7. **Repayment Schedule Display**

   - Displays the repayment schedule in a table format with the following columns:
     - Month
     - Beginning Balance (VND)
     - Interest (VND)
     - Principal (VND)
     - Total Payment (VND)
     - Ending Balance (VND)

8. **Statistics Display**

   - Displays total interest payable and total principal and interest payable.

9. **Repayment Chart**

   - Displays a line chart showing the beginning and ending balance over the loan term.

10. **Interest and Principal Chart**

    - Displays a bar chart showing the interest and principal amounts over the loan term.

11. **CSV Download**

    - Allows users to download the repayment schedule as a CSV file.

12. **Share Plan**

    - Allows users to share the repayment plan via a unique link.

13. **Multi-language Support**

    - Supports English and Vietnamese languages.

14. **Error Handling**

    - Displays modal messages for invalid inputs such as invalid loan term, loan amount, or interest rates.

15. **Compare Methods Side-by-Side**

    - Toggle to compare Annuity vs Fixed Principal methods simultaneously.
    - Shows interest difference and which method saves more.

16. **Payment Breakdown Chart**

    - Doughnut chart showing Principal vs Interest ratio in total payment.

17. **Early Repayment Calculator**

    - Calculate interest savings from extra payments (one-time or monthly).
    - Shows months reduced from early repayment.

18. **Affordability Calculator**

    - Input monthly income to calculate maximum loan amount.
    - Based on DTI (Debt-to-Income) ratio: 43% max, 36% comfortable.
    - **DTI Threshold Guide:**
      - Below 36%: Ideal - Strong financial health
      - 37-42%: Acceptable - Be cautious with new debt
      - 43-49%: Warning - High debt risk, may face loan rejection
      - Above 50%: Critical - Need debt reduction plan urgently

19. **Save/Load Plans**

    - Save multiple loan plans to localStorage.
    - Load and compare different scenarios.

20. **Export to PDF**

    - Professional PDF export of repayment schedule.
    - Supports Vietnamese (ASCII-safe) and English.

## Documentation

Detailed calculation documentation available in `docs/`:

| Document | Description |
| -------- | ----------- |
| [Affordability Calculator](docs/affordability-calculation.md) | How max loan is calculated based on DTI ratio |
| [Early Repayment](docs/early-repayment-calculation.md) | How interest savings are calculated |

Vietnamese versions: `*_vi.md`

## SEO Optimization

This application includes the following SEO optimizations:

- Meta tags for description, keywords, and author.
- Sitemap XML for better indexing by search engines.
- SEO-friendly URLs.

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 22 or later)
- [pnpm](https://pnpm.io/) (version 10 or later)

### Installation

First, clone the repository:

```bash
git clone https://github.com/lamngockhuong/loan-calculator.git
cd loan-calculator
```

Then, install the dependencies:

```bash
pnpm install
```

### Running the Development Server

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

### Running Tests

To run tests, use the following command:

```bash
pnpm test
```

### Building for Production

To create an optimized production build, run:

```bash
pnpm build
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

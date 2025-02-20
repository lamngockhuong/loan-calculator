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

12. **Multi-language Support**

    - Supports English and Vietnamese languages.

13. **Error Handling**
    - Displays modal messages for invalid inputs such as invalid loan term, loan amount, or interest rates.

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

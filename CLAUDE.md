# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server with Turbopack at localhost:3000
pnpm build        # Production build
pnpm lint         # Run ESLint
pnpm test         # Run Jest tests
pnpm test -- --watch              # Watch mode
pnpm test -- loan.utils.test.ts   # Run specific test file
```

## Architecture

This is a **Next.js 16 App Router** loan calculator with bilingual support (EN/VI).

### Core Structure

```bash
app/
├── layout.tsx    # Root layout with LanguageContext provider
└── page.tsx      # Home page, manages loan state, URL sharing via compressed params

components/
├── Loan.tsx      # Main component (~1400 lines) - all loan UI, calculations, charts
├── Menu.tsx      # Navigation with language switcher
└── Modal.tsx     # Error message modal

utils/
├── loan.utils.ts                    # Core calculation functions
└── __tests__/
    ├── loan.utils.test.ts           # Unit tests for utils
    └── financial-accuracy.test.ts   # Financial accuracy tests (PMT, Excel verification)

hooks/
└── useLanguage.ts          # Language context hook

types/
└── loan.interfaces.ts      # TypeScript interfaces

docs/
├── affordability-calculation.md      # Affordability calculator docs (EN)
├── affordability-calculation_vi.md   # Affordability calculator docs (VI)
├── early-repayment-calculation.md    # Early repayment docs (EN)
└── early-repayment-calculation_vi.md # Early repayment docs (VI)
```

### Key Patterns

**State Management**: All loan state (amount, years, rates, schedule) lifted to `page.tsx`, passed down to `Loan.tsx` as props. Language state in `layout.tsx` with React Context.

**Calculation Methods** (see `docs/` for details):

- `computeScheduleAnnuity()` - Equal monthly payments (PMT formula)
- `computeScheduleFixed()` - Fixed principal, decreasing interest
- `computeAffordability()` - Max loan based on income (DTI 36%/43%) (see `docs/affordability-calculation.md`)
- `computeEarlyRepayment()` - Interest savings calculator (see `docs/early-repayment-calculation.md`)

**URL Sharing**: Loan params compressed with `pako` (deflate) and base64-encoded in `?data=` query param.

**i18n**: Translations defined inline in components as `translations` objects with `en`/`vi` keys. No external i18n library.

**Charts**: Chart.js via `react-chartjs-2` with dynamic imports (SSR disabled). Line (balance), Bar (interest/principal), Doughnut (payment breakdown) charts.

**PDF Export**: Uses `jspdf` + `jspdf-autotable`. Vietnamese text uses ASCII-safe translations (no diacritics) due to font limitations. Variable interest rates shown individually in PDF.

**Styling**: Tailwind CSS v4 with CSS variables in `styles/globals.css`. Design tokens: `--color-primary`, `--color-accent`, etc.

### Key Interfaces

```typescript
interface ScheduleEntry {
  month: number;
  beginningBalance: number;
  interest: number;
  principal: number;
  payment: number;
  endingBalance: number;
}

interface InterestRate {
  period: number;
  months: number;
  rate: string;
  commonRate?: boolean;  // true = single rate for all years
}

interface SavedPlan {
  id: string;
  name: string;
  createdAt: string;
  loanAmount: string;
  loanYears: string;
  calcMethod: string;
  interestRates: InterestRate[];
  totalInterest: number;
  totalPayment: number;
}
```

### Features

- Two calculation methods: Annuity vs Fixed Principal
- Variable interest rates per year
- Compare methods side-by-side
- Early repayment calculator
- Affordability calculator (income-based)
- Save/load plans to localStorage
- Export to PDF (jspdf)
- Download CSV
- Share via URL

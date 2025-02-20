
export interface InterestRate {
  period: number;
  months: number;
  rate: string;
  commonRate?: boolean;
}

export interface ScheduleEntry {
  month: number;
  beginningBalance: number;
  interest: number;
  principal: number;
  payment: number;
  endingBalance: number;
}

export interface LoanProps {
  loanAmount: string;
  setLoanAmount: (value: string) => void;
  loanYears: string;
  setLoanYears: (value: string) => void;
  calcMethod: string;
  setCalcMethod: (value: string) => void;
  interestRates: InterestRate[];
  setInterestRates: (value: InterestRate[]) => void;
  schedule: ScheduleEntry[];
  setSchedule: (value: ScheduleEntry[]) => void;
  totalInterest: number;
  setTotalInterest: (value: number) => void;
  totalPayment: number;
  setTotalPayment: (value: number) => void;
  language: 'en' | 'vi';
}

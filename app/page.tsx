'use client';
import { useState } from 'react';
import Loan from '../components/Loan';

interface InterestRate {
  period: number;
  months: number;
  rate: string;
}

interface ScheduleEntry {
  month: number;
  beginningBalance: number;
  interest: number;
  principal: number;
  payment: number;
  endingBalance: number;
}

export default function Home() {
  const [loanAmount, setLoanAmount] = useState<string>('');
  const [loanYears, setLoanYears] = useState<string>('');
  const [calcMethod, setCalcMethod] = useState<string>('annuity');
  const [interestRates, setInterestRates] = useState<InterestRate[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [totalPayment, setTotalPayment] = useState<number>(0);
  const [language, setLanguage] = useState<'en' | 'vi'>('vi');

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as 'en' | 'vi');
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Phân tích kế hoạch trả nợ vay</h1>
      <div className="mb-4">
        <label htmlFor="language" className="mr-2">Language:</label>
        <select id="language" value={language} onChange={handleLanguageChange}>
          <option value="vi">Vietnamese</option>
          <option value="en">English</option>
        </select>
      </div>
      <Loan
        loanAmount={loanAmount}
        setLoanAmount={setLoanAmount}
        loanYears={loanYears}
        setLoanYears={setLoanYears}
        calcMethod={calcMethod}
        setCalcMethod={setCalcMethod}
        interestRates={interestRates}
        setInterestRates={setInterestRates}
        schedule={schedule}
        setSchedule={setSchedule}
        totalInterest={totalInterest}
        setTotalInterest={setTotalInterest}
        totalPayment={totalPayment}
        setTotalPayment={setTotalPayment}
        language={language}
      />
    </div>
  );
}

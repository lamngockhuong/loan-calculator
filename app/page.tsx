'use client';
import { useState } from 'react';
import Loan from '../components/Loan';
import { useLanguage } from '../hooks/useLanguage';
import { InterestRate, ScheduleEntry } from '../types/loan.interfaces';

const translations = {
  en: 'Loan Repayment Plan Analysis',
  vi: 'Phân tích kế hoạch trả nợ vay'
};

export default function HomePage() {
  const language = useLanguage();
  const [loanAmount, setLoanAmount] = useState<string>('');
  const [loanYears, setLoanYears] = useState<string>('');
  const [calcMethod, setCalcMethod] = useState<string>('');
  const [interestRates, setInterestRates] = useState<InterestRate[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [totalPayment, setTotalPayment] = useState<number>(0);

  return (
    <div className="p-3 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-6 text-center text-gray-800">{translations[language]}</h1>
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

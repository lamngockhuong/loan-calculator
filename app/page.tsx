'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Loan from '../components/Loan';
import { useLanguage } from '../hooks/useLanguage';
import { InterestRate, ScheduleEntry } from '../types/loan.interfaces';
import { compressed, decompressed } from '../utils/loan.utils';
import { toast } from 'react-toastify';

const translations = {
  en: 'Loan Repayment Plan Analysis',
  vi: 'Phân tích kế hoạch trả nợ vay'
};

const toastMessages = {
  en: {
    copySuccess: 'Link copied to clipboard!',
    copyError: 'Failed to copy link.'
  },
  vi: {
    copySuccess: 'Liên kết đã được sao chép vào clipboard!',
    copyError: 'Sao chép liên kết thất bại.'
  }
};

function HomePage() {
  const language = useLanguage();
  const searchParams = useSearchParams();
  const [loanAmount, setLoanAmount] = useState<string>('');
  const [loanYears, setLoanYears] = useState<string>('');
  const [calcMethod, setCalcMethod] = useState<string>('');
  const [interestRates, setInterestRates] = useState<InterestRate[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [totalPayment, setTotalPayment] = useState<number>(0);
  const [autoCalculate, setAutoCalculate] = useState<boolean>(false);

  useEffect(() => {
    const compressedParams = searchParams.get('data');
    if (!compressedParams) return;

    const decompressedParams = decompressed(decodeURIComponent(compressedParams));
    const { loanAmount, loanYears, calcMethod, interestRates } = decompressedParams;

    // Intentional: hydrate state from URL params on mount
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoanAmount(loanAmount);
    setLoanYears(loanYears);
    setCalcMethod(calcMethod);
    setInterestRates(interestRates);
    setAutoCalculate(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [searchParams]);

  const handleSharePlan = () => {
    const params = {
      loanAmount,
      loanYears,
      calcMethod,
      interestRates
    };
    const compressedParams = compressed(params);
    const shareUrl = `${window.location.origin}${window.location.pathname}?data=${encodeURIComponent(compressedParams)}`;

    navigator.clipboard.writeText(shareUrl).then(() => {
        toast.success(toastMessages[language].copySuccess);
      }).catch(err => {
        console.error('Could not copy text: ', err);
        toast.error(toastMessages[language].copyError);
      });
  };

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8 min-h-screen">
      <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-slate-800">{translations[language]}</h1>
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
        autoCalculate={autoCalculate}
        onSharePlan={handleSharePlan}
      />
    </div>
  );
}

function HomePageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePage />
    </Suspense>
  );
}

export default HomePageWrapper;

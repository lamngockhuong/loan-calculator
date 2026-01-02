import { ChangeEvent, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, TooltipItem } from 'chart.js';
import { formatCurrency, computeScheduleAnnuity, computeScheduleFixed, computeAffordability, computeEarlyRepayment } from '../utils/loan.utils';
import { InterestRate, ScheduleEntry, LoanProps, SavedPlan } from '../types/loan.interfaces';
import { AffordabilityResult, EarlyRepaymentResult } from '../utils/loan.utils';
import Modal from './Modal';
import { ToastContainer, toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const Line = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), { ssr: false });
const Bar = dynamic(() => import('react-chartjs-2').then(mod => mod.Bar), { ssr: false });
const Doughnut = dynamic(() => import('react-chartjs-2').then(mod => mod.Doughnut), { ssr: false });

// Icons
const CurrencyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
);

const PercentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="m9 14.25 6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185ZM9.75 9h.008v.008H9.75V9Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 4.5h.008v.008h-.008V13.5Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
  </svg>
);

const CompareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
  </svg>
);

const WalletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const BookmarkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

const DocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);

const translations = {
  en: {
    loanAmount: 'Loan Amount (VND)',
    loanYears: 'Loan Term (Years)',
    loanYearsHint: 'Can be fractional, e.g., 1.5',
    calcMethod: 'Calculation Method',
    annuity: 'Annuity (Equal Principal & Interest)',
    fixed: 'Fixed Principal, Reducing Interest',
    generateRates: 'Generate Yearly Rates',
    generateCommonRates: 'Use Common Rate',
    calculate: 'Calculate',
    repaymentSchedule: 'Repayment Schedule',
    month: 'Month',
    beginningBalance: 'Beginning Balance',
    interest: 'Interest',
    principal: 'Principal',
    totalPayment: 'Total Payment',
    endingBalance: 'Ending Balance',
    statistics: 'Summary',
    totalInterest: 'Total Interest',
    totalPaymentSummary: 'Total Amount Payable',
    chart: 'Balance Over Time',
    interestAndPrincipalChart: 'Interest vs Principal',
    interestRate: (period: number, months: number) =>
      months === 12 ? `Year ${period} Rate (%)` : months === 0 ? `Final Year Rate (%)` : `Last ${months} Months Rate (%)`,
    interestRateCommon: 'Annual Interest Rate (%)',
    modalMessages: {
      invalidLoanTerm: 'Please enter a valid loan term.',
      invalidLoanAmount: 'Please enter a valid loan amount.',
      invalidInterestRates: 'Please enter valid interest rates.'
    },
    downloadCSV: 'Download CSV',
    sharePlan: 'Share Plan',
    maxMonthlyPayment: 'to',
    minMonthlyPayment: 'from',
    monthlyPayment: 'Monthly Payment',
    vnd: 'VND',
    applyToRemaining: 'Apply to remaining',
    defaultRate: 'Default rate',
    quickAmounts: 'Quick select:',
    million: 'M',
    billion: 'B',
    years: 'years',
    // Phase 1: Compare methods
    compareMode: 'Compare Methods',
    annuityMethod: 'Annuity',
    fixedMethod: 'Fixed Principal',
    interestDiff: 'Interest Difference',
    youSave: 'You save',
    // Phase 2: Pie chart
    paymentBreakdown: 'Payment Breakdown',
    principalLabel: 'Principal',
    interestLabel: 'Interest',
    // Phase 3: Early repayment
    earlyRepayment: 'Early Repayment',
    extraPayment: 'Extra Payment Amount',
    oneTime: 'One-time',
    monthly: 'Monthly',
    interestSaved: 'Interest Saved',
    monthsReduced: 'Months Reduced',
    calculateSavings: 'Calculate Savings',
    // Phase 4: Affordability
    affordability: 'Affordability Calculator',
    monthlyIncome: 'Monthly Income',
    maxLoan: 'Maximum Loan (50% DTI)',
    comfortableLoan: 'Comfortable Loan (40% DTI)',
    calculateAffordability: 'Calculate',
    // Phase 5: Save plans
    savedPlans: 'Saved Plans',
    savePlan: 'Save Plan',
    planName: 'Plan Name',
    loadPlan: 'Load',
    deletePlan: 'Delete',
    noPlansSaved: 'No plans saved yet',
    planSaved: 'Plan saved successfully!',
    planDeleted: 'Plan deleted!',
    planLoaded: 'Plan loaded!',
    // Phase 6: Export PDF
    exportPDF: 'Export PDF'
  },
  vi: {
    loanAmount: 'Số tiền vay (VND)',
    loanYears: 'Thời hạn vay (Năm)',
    loanYearsHint: 'Có thể nhập số lẻ, VD: 1.5',
    calcMethod: 'Phương pháp tính',
    annuity: 'Gốc và lãi chia đều hàng tháng',
    fixed: 'Gốc cố định, lãi giảm dần',
    generateRates: 'Tạo lãi suất từng năm',
    generateCommonRates: 'Dùng lãi suất chung',
    calculate: 'Tính toán',
    repaymentSchedule: 'Lịch trả nợ chi tiết',
    month: 'Tháng',
    beginningBalance: 'Dư nợ đầu kỳ',
    interest: 'Tiền lãi',
    principal: 'Tiền gốc',
    totalPayment: 'Tổng trả',
    endingBalance: 'Dư nợ cuối kỳ',
    statistics: 'Tổng quan',
    totalInterest: 'Tổng lãi phải trả',
    totalPaymentSummary: 'Tổng tiền phải trả',
    chart: 'Biểu đồ dư nợ',
    interestAndPrincipalChart: 'So sánh Lãi & Gốc',
    interestRate: (period: number, months: number) =>
      months === 12 ? `Lãi suất năm ${period} (%)` : months === 0 ? `Lãi suất năm cuối (%)` : `Lãi suất ${months} tháng cuối (%)`,
    interestRateCommon: 'Lãi suất hàng năm (%)',
    modalMessages: {
      invalidLoanTerm: 'Vui lòng nhập số năm vay hợp lệ.',
      invalidLoanAmount: 'Vui lòng nhập số tiền vay hợp lệ.',
      invalidInterestRates: 'Vui lòng nhập lãi suất hợp lệ.'
    },
    downloadCSV: 'Tải CSV',
    sharePlan: 'Chia sẻ',
    maxMonthlyPayment: 'đến',
    minMonthlyPayment: 'từ',
    monthlyPayment: 'Trả hàng tháng',
    vnd: 'VND',
    applyToRemaining: 'Áp dụng cho năm còn lại',
    defaultRate: 'Lãi suất mặc định',
    quickAmounts: 'Chọn nhanh:',
    million: 'Tr',
    billion: 'Tỷ',
    years: 'năm',
    // Phase 1: Compare methods
    compareMode: 'So sánh phương pháp',
    annuityMethod: 'Trả góp đều',
    fixedMethod: 'Gốc cố định',
    interestDiff: 'Chênh lệch lãi',
    youSave: 'Tiết kiệm',
    // Phase 2: Pie chart
    paymentBreakdown: 'Cơ cấu thanh toán',
    principalLabel: 'Gốc',
    interestLabel: 'Lãi',
    // Phase 3: Early repayment
    earlyRepayment: 'Trả nợ trước hạn',
    extraPayment: 'Số tiền trả thêm',
    oneTime: 'Một lần',
    monthly: 'Hàng tháng',
    interestSaved: 'Tiết kiệm lãi',
    monthsReduced: 'Giảm số tháng',
    calculateSavings: 'Tính tiết kiệm',
    // Phase 4: Affordability
    affordability: 'Khả năng vay',
    monthlyIncome: 'Thu nhập hàng tháng',
    maxLoan: 'Vay tối đa (50% DTI)',
    comfortableLoan: 'Vay thoải mái (40% DTI)',
    calculateAffordability: 'Tính toán',
    // Phase 5: Save plans
    savedPlans: 'Kế hoạch đã lưu',
    savePlan: 'Lưu kế hoạch',
    planName: 'Tên kế hoạch',
    loadPlan: 'Tải',
    deletePlan: 'Xóa',
    noPlansSaved: 'Chưa có kế hoạch nào',
    planSaved: 'Đã lưu kế hoạch!',
    planDeleted: 'Đã xóa kế hoạch!',
    planLoaded: 'Đã tải kế hoạch!',
    // Phase 6: Export PDF
    exportPDF: 'Xuất PDF'
  }
};

// PDF-safe Vietnamese translations (no diacritics for jsPDF compatibility)
const pdfTranslations = {
  en: {
    title: 'Loan Repayment Schedule',
    loanAmount: 'Loan Amount (VND)',
    loanYears: 'Loan Term (Years)',
    calcMethod: 'Calculation Method',
    interestRate: 'Annual Interest Rate (%)',
    totalInterest: 'Total Interest',
    totalPayment: 'Total Amount Payable',
    annuity: 'Equal Monthly Payments (Annuity)',
    fixed: 'Fixed Principal, Reducing Interest',
    month: 'Month',
    beginningBalance: 'Beginning Balance',
    interest: 'Interest',
    principal: 'Principal',
    payment: 'Total Payment',
    endingBalance: 'Ending Balance',
    years: 'years'
  },
  vi: {
    title: 'Lich Tra No Vay',
    loanAmount: 'So tien vay (VND)',
    loanYears: 'So nam vay',
    calcMethod: 'Phuong phap tinh',
    interestRate: 'Lai suat hang nam (%)',
    totalInterest: 'Tong lai',
    totalPayment: 'Tong phai tra',
    annuity: 'Tra gop deu (Annuity)',
    fixed: 'Goc co dinh, Lai giam dan',
    month: 'Thang',
    beginningBalance: 'Du no dau ky',
    interest: 'Lai',
    principal: 'Goc',
    payment: 'Tong tra',
    endingBalance: 'Du no cuoi ky',
    years: 'nam'
  }
};

export default function Loan({
  loanAmount,
  setLoanAmount,
  loanYears,
  setLoanYears,
  calcMethod,
  setCalcMethod,
  interestRates,
  setInterestRates,
  schedule,
  setSchedule,
  totalInterest,
  setTotalInterest,
  totalPayment,
  setTotalPayment,
  language,
  autoCalculate,
  onSharePlan
}: LoanProps) {
  const t = translations[language];
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [commonInterestRates, setCommonInterestRates] = useState<InterestRate[]>([]);
  const [individualInterestRates, setIndividualInterestRates] = useState<InterestRate[]>([]);
  const [maxMonthlyPayment, setMaxMonthlyPayment] = useState<number>(0);
  const [minMonthlyPayment, setMinMonthlyPayment] = useState<number>(0);

  // Phase 1: Compare mode
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [annuitySchedule, setAnnuitySchedule] = useState<ScheduleEntry[]>([]);
  const [fixedSchedule, setFixedSchedule] = useState<ScheduleEntry[]>([]);

  // Phase 3: Early repayment
  const [extraPayment, setExtraPayment] = useState<string>('');
  const [paymentType, setPaymentType] = useState<'one-time' | 'monthly'>('monthly');
  const [earlyRepaymentResult, setEarlyRepaymentResult] = useState<EarlyRepaymentResult | null>(null);

  // Phase 4: Affordability
  const [monthlyIncome, setMonthlyIncome] = useState<string>('');
  const [affordabilityResult, setAffordabilityResult] = useState<AffordabilityResult | null>(null);

  // Phase 5: Saved plans
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [planName, setPlanName] = useState<string>('');

  const handleLoanAmountChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value.replace(/,/g, '');
    if (!isNaN(Number(value))) {
      setLoanAmount(formatCurrency(Number(value)));
    }
  };

  const generateRates = (commonRate: boolean = false): void => {
    const loanYearsValue = parseFloat(loanYears);
    if (isNaN(loanYearsValue) || loanYearsValue <= 0) {
      setModalMessage(t.modalMessages.invalidLoanTerm);
      return;
    }
    const fullYears = Math.floor(loanYearsValue);
    const hasFraction = (loanYearsValue - fullYears) > 0.0001;
    const totalPeriods = fullYears + (hasFraction ? 1 : 0);
    const totalMonths = Math.round(loanYearsValue * 12);

    const rates: InterestRate[] = [];
    if (commonRate) {
      rates.push({ period: 1, months: totalMonths, rate: commonInterestRates[0]?.rate || '', commonRate: true });
      setCommonInterestRates(rates);
    } else {
      for (let i = 1; i <= totalPeriods; i++) {
        const monthsInThisPeriod = (i < totalPeriods) ? 12 : (totalMonths - fullYears * 12);
        rates.push({ period: i, months: monthsInThisPeriod, rate: individualInterestRates[i - 1]?.rate || '', commonRate: false });
      }
      setIndividualInterestRates(rates);
    }
    setInterestRates(rates);
  };

  const handleRateChange = (index: number, value: string): void => {
    const newRates = [...interestRates];
    newRates[index].rate = value;
    setInterestRates(newRates);
    if (newRates[0].commonRate) {
      setCommonInterestRates(newRates);
    } else {
      setIndividualInterestRates(newRates);
    }
  };

  const applyRateToRemaining = (fromIndex: number): void => {
    const sourceRate = interestRates[fromIndex].rate;
    if (!sourceRate) return;

    const newRates = interestRates.map((rate, index) => ({
      ...rate,
      rate: index >= fromIndex ? sourceRate : rate.rate
    }));
    setInterestRates(newRates);
    setIndividualInterestRates(newRates);
  };

  const calculate = (): void => {
    const loanAmountValue = parseFloat(loanAmount.replace(/,/g, ''));
    const loanYearsValue = parseFloat(loanYears);
    if (isNaN(loanAmountValue) || loanAmountValue <= 0) {
      setModalMessage(t.modalMessages.invalidLoanAmount);
      return;
    }
    if (isNaN(loanYearsValue) || loanYearsValue <= 0) {
      setModalMessage(t.modalMessages.invalidLoanTerm);
      return;
    }
    const totalMonths = Math.round(loanYearsValue * 12);

    const rates = interestRates.map(rate => parseFloat(rate.rate));
    if (rates.length === 0 || rates.some(rate => isNaN(rate) || rate < 0)) {
      setModalMessage(t.modalMessages.invalidInterestRates);
      return;
    }

    let schedule: ScheduleEntry[] = [];
    if (calcMethod === 'annuity') {
      schedule = computeScheduleAnnuity(loanAmountValue, totalMonths, rates);
    } else if (calcMethod === 'fixed') {
      schedule = computeScheduleFixed(loanAmountValue, totalMonths, rates);
    }

    setSchedule(schedule);
    setTotalInterest(schedule.reduce((sum, entry) => sum + entry.interest, 0));
    setTotalPayment(schedule.reduce((sum, entry) => sum + entry.payment, 0));
    setMaxMonthlyPayment(Math.max(...schedule.map(entry => entry.payment)));
    setMinMonthlyPayment(Math.min(...schedule.map(entry => entry.payment)));
  };

  const handleCalcMethodChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCalcMethod(e.target.value);
    calcMethod = e.target.value;
    calculate();
  };

  const downloadCSV = () => {
    const csvContent = [
      [t.month, t.beginningBalance, t.interest, t.principal, t.totalPayment, t.endingBalance],
      ...schedule.map(entry => [
        entry.month,
        `"${formatCurrency(entry.beginningBalance)}"`,
        `"${formatCurrency(entry.interest)}"`,
        `"${formatCurrency(entry.principal)}"`,
        `"${formatCurrency(entry.payment)}"`,
        `"${formatCurrency(entry.endingBalance)}"`
      ])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `repayment_schedule_${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Phase 6: Export PDF (uses ASCII-safe translations for jsPDF compatibility)
  const exportPDF = () => {
    const doc = new jsPDF();
    const pdf = pdfTranslations[language];

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(pdf.title, 105, 20, { align: 'center' });

    // Summary section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    let yPos = 35;

    doc.text(`${pdf.loanAmount}: ${formatCurrency(parseFloat(loanAmount.replace(/,/g, '')) || 0)} VND`, 20, yPos);
    yPos += 8;
    doc.text(`${pdf.loanYears}: ${loanYears} ${pdf.years}`, 20, yPos);
    yPos += 8;
    doc.text(`${pdf.calcMethod}: ${calcMethod === 'annuity' ? pdf.annuity : pdf.fixed}`, 20, yPos);
    yPos += 8;

    // Show interest rates - check if all rates are the same or different
    const uniqueRates = [...new Set(interestRates.map(r => r.rate))];
    if (uniqueRates.length === 1) {
      // All rates are the same
      doc.text(`${pdf.interestRate}: ${interestRates[0]?.rate || 0}%`, 20, yPos);
      yPos += 12;
    } else {
      // Different rates per year - show each
      doc.text(`${pdf.interestRate}:`, 20, yPos);
      yPos += 6;
      interestRates.forEach((rate, idx) => {
        const yearLabel = language === 'vi' ? `Nam ${idx + 1}` : `Year ${idx + 1}`;
        doc.text(`  ${yearLabel}: ${rate.rate}%`, 25, yPos);
        yPos += 5;
      });
      yPos += 5;
    }

    // Summary stats
    doc.setFont('helvetica', 'bold');
    doc.text(`${pdf.totalInterest}: ${formatCurrency(totalInterest)} VND`, 20, yPos);
    yPos += 8;
    doc.text(`${pdf.totalPayment}: ${formatCurrency(totalPayment)} VND`, 20, yPos);
    yPos += 15;

    // Schedule table with PDF-safe headers
    const tableHeaders = [
      pdf.month,
      pdf.beginningBalance,
      pdf.interest,
      pdf.principal,
      pdf.payment,
      pdf.endingBalance
    ];

    const tableData = schedule.map(entry => [
      entry.month.toString(),
      formatCurrency(entry.beginningBalance),
      formatCurrency(entry.interest),
      formatCurrency(entry.principal),
      formatCurrency(entry.payment),
      formatCurrency(entry.endingBalance)
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [tableHeaders],
      body: tableData,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    // Save
    doc.save(`loan-schedule-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success(language === 'vi' ? 'Da xuat PDF thanh cong!' : 'PDF exported!');
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11
          }
        }
      }
    }
  };

  const chartData = {
    labels: schedule.length > 0 ? schedule.map(entry => `${entry.month}`) : [],
    datasets: [
      {
        label: t.beginningBalance,
        data: schedule.length > 0 ? schedule.map(entry => entry.beginningBalance) : [],
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: t.endingBalance,
        data: schedule.length > 0 ? schedule.map(entry => entry.endingBalance) : [],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const statisticsChartData = {
    labels: schedule.length > 0 ? schedule.map(entry => `${entry.month}`) : [],
    datasets: [
      {
        label: t.interest,
        data: schedule.length > 0 ? schedule.map(entry => entry.interest) : [],
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderColor: '#EF4444',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: t.principal,
        data: schedule.length > 0 ? schedule.map(entry => entry.principal) : [],
        backgroundColor: 'rgba(37, 99, 235, 0.7)',
        borderColor: '#2563EB',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  // Phase 2: Pie chart data
  const pieChartData = {
    labels: [t.principalLabel, t.interestLabel],
    datasets: [{
      data: schedule.length > 0 ? [
        parseFloat(loanAmount.replace(/,/g, '')),
        totalInterest
      ] : [0, 0],
      backgroundColor: ['#2563EB', '#F59E0B'],
      borderWidth: 0
    }]
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'doughnut'>) => {
            const value = context.raw as number;
            const total = parseFloat(loanAmount.replace(/,/g, '')) + totalInterest;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Phase 1: Compare mode calculation
  const calculateComparison = () => {
    const loanAmountValue = parseFloat(loanAmount.replace(/,/g, ''));
    const loanYearsValue = parseFloat(loanYears);
    const totalMonths = Math.round(loanYearsValue * 12);
    const rates = interestRates.map(rate => parseFloat(rate.rate));

    if (isNaN(loanAmountValue) || loanAmountValue <= 0 || rates.length === 0) return;

    const annuity = computeScheduleAnnuity(loanAmountValue, totalMonths, rates);
    const fixed = computeScheduleFixed(loanAmountValue, totalMonths, rates);

    setAnnuitySchedule(annuity);
    setFixedSchedule(fixed);
  };

  // Phase 3: Early repayment calculation
  const calculateEarlyRepayment = () => {
    const loanAmountValue = parseFloat(loanAmount.replace(/,/g, ''));
    const loanYearsValue = parseFloat(loanYears);
    const extraAmountValue = parseFloat(extraPayment.replace(/,/g, ''));
    const totalMonths = Math.round(loanYearsValue * 12);
    const rates = interestRates.map(rate => parseFloat(rate.rate));

    if (isNaN(extraAmountValue) || extraAmountValue <= 0 || !calcMethod) return;

    const result = computeEarlyRepayment(
      loanAmountValue,
      totalMonths,
      rates,
      calcMethod as 'annuity' | 'fixed',
      extraAmountValue,
      paymentType
    );
    setEarlyRepaymentResult(result);
  };

  // Phase 4: Affordability calculation
  const calculateAffordabilityResult = () => {
    const incomeValue = parseFloat(monthlyIncome.replace(/,/g, ''));
    const loanYearsValue = parseFloat(loanYears);
    const rate = interestRates.length > 0 ? parseFloat(interestRates[0].rate) : NaN;

    if (isNaN(incomeValue) || incomeValue <= 0) {
      toast.error(language === 'vi' ? 'Vui lòng nhập thu nhập hàng tháng' : 'Please enter monthly income');
      return;
    }

    if (isNaN(loanYearsValue) || loanYearsValue <= 0) {
      toast.error(language === 'vi' ? 'Vui lòng nhập số năm vay ở phần trên' : 'Please enter loan years above');
      return;
    }

    if (isNaN(rate) || rate <= 0) {
      toast.error(language === 'vi' ? 'Vui lòng nhập lãi suất ở phần trên' : 'Please enter interest rate above');
      return;
    }

    const result = computeAffordability(incomeValue, rate, loanYearsValue);
    setAffordabilityResult(result);
  };

  // Phase 5: Load saved plans from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('savedLoanPlans');
    if (stored) {
      setSavedPlans(JSON.parse(stored));
    }
  }, []);

  const savePlanToStorage = () => {
    if (!planName.trim() || schedule.length === 0) return;

    const newPlan: SavedPlan = {
      id: Date.now().toString(),
      name: planName,
      createdAt: new Date().toISOString(),
      loanAmount,
      loanYears,
      calcMethod,
      interestRates,
      totalInterest,
      totalPayment
    };

    const updatedPlans = [...savedPlans, newPlan];
    setSavedPlans(updatedPlans);
    localStorage.setItem('savedLoanPlans', JSON.stringify(updatedPlans));
    setPlanName('');
  };

  const deletePlanFromStorage = (id: string) => {
    const updatedPlans = savedPlans.filter(p => p.id !== id);
    setSavedPlans(updatedPlans);
    localStorage.setItem('savedLoanPlans', JSON.stringify(updatedPlans));
  };

  const loadPlanFromStorage = (plan: SavedPlan) => {
    setLoanAmount(plan.loanAmount);
    setLoanYears(plan.loanYears);
    setCalcMethod(plan.calcMethod);
    setInterestRates(plan.interestRates);
  };

  // Update comparison when compare mode is enabled
  useEffect(() => {
    if (compareMode && schedule.length > 0) {
      calculateComparison();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compareMode, loanAmount, loanYears, interestRates]);

  useEffect(() => {
    if (autoCalculate) {
      calculate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoCalculate]);

  // Auto-recalculate when inputs change (only if calcMethod is selected)
  useEffect(() => {
    if (!calcMethod) return;

    const loanAmountValue = parseFloat(loanAmount.replace(/,/g, ''));
    const loanYearsValue = parseFloat(loanYears);
    const rates = interestRates.map(rate => parseFloat(rate.rate));

    // Only calculate if all inputs are valid
    if (
      !isNaN(loanAmountValue) && loanAmountValue > 0 &&
      !isNaN(loanYearsValue) && loanYearsValue > 0 &&
      rates.length > 0 && rates.every(rate => !isNaN(rate) && rate >= 0)
    ) {
      calculate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loanAmount, loanYears, interestRates, calcMethod]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Input Form */}
      <div className="card mb-6">
        <div className="card-body">
          {modalMessage && (
            <Modal onClose={() => setModalMessage(null)}>
              {modalMessage}
            </Modal>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Loan Amount */}
            <div>
              <label htmlFor="loanAmount" className="block text-sm font-medium text-slate-700 mb-2">
                {t.loanAmount}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CurrencyIcon />
                </div>
                <input
                  type="text"
                  id="loanAmount"
                  value={loanAmount}
                  onChange={handleLoanAmountChange}
                  required
                  className="has-icon pl-10!"
                  placeholder="500,000,000"
                />
              </div>
              {/* Quick amount selection */}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-500">{t.quickAmounts}</span>
                {[
                  { value: 100000000, label: `100${t.million}` },
                  { value: 300000000, label: `300${t.million}` },
                  { value: 500000000, label: `500${t.million}` },
                  { value: 1000000000, label: `1${t.billion}` },
                  { value: 2000000000, label: `2${t.billion}` },
                  { value: 3000000000, label: `3${t.billion}` },
                ].map((amount) => (
                  <button
                    key={amount.value}
                    type="button"
                    onClick={() => setLoanAmount(formatCurrency(amount.value))}
                    className={`px-2 py-1 text-xs font-medium rounded-md transition-colors duration-150 cursor-pointer ${
                      loanAmount === formatCurrency(amount.value)
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {amount.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Loan Years */}
            <div>
              <label htmlFor="loanYears" className="block text-sm font-medium text-slate-700 mb-2">
                {t.loanYears}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon />
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  id="loanYears"
                  value={loanYears}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const value = e.target.value;
                    if (value === '' || parseFloat(value) >= 0) {
                      setLoanYears(value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === '-') e.preventDefault();
                  }}
                  required
                  className="has-icon pl-10!"
                  placeholder="10"
                />
              </div>
              {/* Quick years selection */}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-500">{t.quickAmounts}</span>
                {[5, 10, 15, 20, 25, 30].map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => setLoanYears(year.toString())}
                    className={`px-2 py-1 text-xs font-medium rounded-md transition-colors duration-150 cursor-pointer ${
                      loanYears === year.toString()
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {year} {t.years}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interest Rate Buttons */}
          <div className="mt-6">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => generateRates(true)}
                className={`btn cursor-pointer ${
                  interestRates.length > 0 && interestRates[0]?.commonRate
                    ? 'btn-primary'
                    : 'btn-outline'
                }`}
              >
                {t.generateCommonRates}
              </button>
              <button
                type="button"
                onClick={() => generateRates(false)}
                className={`btn cursor-pointer ${
                  interestRates.length > 0 && !interestRates[0]?.commonRate
                    ? 'btn-primary'
                    : 'btn-outline'
                }`}
              >
                {t.generateRates}
              </button>
            </div>
          </div>

          {/* Interest Rates */}
          {interestRates.length > 0 && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {interestRates.map((rate, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {rate.commonRate ? t.interestRateCommon : t.interestRate(rate.period, rate.months)}
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PercentIcon />
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={rate.rate}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleRateChange(index, e.target.value)}
                        required
                        className="has-icon pl-10!"
                        placeholder="8.5"
                      />
                    </div>
                    {/* Show "Apply to remaining" button only for yearly rates and not last item */}
                    {!rate.commonRate && index < interestRates.length - 1 && rate.rate && (
                      <button
                        type="button"
                        onClick={() => applyRateToRemaining(index)}
                        className="px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 whitespace-nowrap cursor-pointer"
                        title={t.applyToRemaining}
                      >
                        ↓ {t.applyToRemaining}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Calculation Method */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700 mb-3">{t.calcMethod}</label>
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200">
                <input
                  type="radio"
                  name="calcMethod"
                  value="annuity"
                  checked={calcMethod === 'annuity'}
                  onChange={handleCalcMethodChange}
                />
                <span className="text-sm text-slate-700">{t.annuity}</span>
              </label>
              <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200">
                <input
                  type="radio"
                  name="calcMethod"
                  value="fixed"
                  checked={calcMethod === 'fixed'}
                  onChange={handleCalcMethodChange}
                />
                <span className="text-sm text-slate-700">{t.fixed}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {schedule.length > 0 && (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <div className="card-body">
                <div className="stat-card">
                  <span className="stat-label">{t.monthlyPayment}</span>
                  {calcMethod === 'annuity' ? (
                    <span className="stat-value highlight">{formatCurrency(maxMonthlyPayment)} <span className="text-base font-normal text-slate-500">{t.vnd}</span></span>
                  ) : (
                    <span className="stat-value text-lg">
                      {formatCurrency(minMonthlyPayment)} - {formatCurrency(maxMonthlyPayment)} <span className="text-sm font-normal text-slate-500">{t.vnd}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <div className="stat-card">
                  <span className="stat-label">{t.totalInterest}</span>
                  <span className="stat-value text-red-600">{formatCurrency(totalInterest)} <span className="text-base font-normal text-slate-500">{t.vnd}</span></span>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <div className="stat-card">
                  <span className="stat-label">{t.totalPaymentSummary}</span>
                  <span className="stat-value">{formatCurrency(totalPayment)} <span className="text-base font-normal text-slate-500">{t.vnd}</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Repayment Schedule Table */}
          <div className="card">
            <div className="card-body">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <h2 className="text-xl font-semibold text-slate-800">{t.repaymentSchedule}</h2>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={downloadCSV}
                    className="btn btn-success cursor-pointer"
                  >
                    <DownloadIcon />
                    {t.downloadCSV}
                  </button>
                  <button
                    type="button"
                    onClick={exportPDF}
                    className="btn btn-outline cursor-pointer"
                  >
                    <DocumentIcon />
                    {t.exportPDF}
                  </button>
                  <button
                    type="button"
                    onClick={onSharePlan}
                    className="btn btn-primary cursor-pointer"
                  >
                    <ShareIcon />
                    {t.sharePlan}
                  </button>
                </div>
              </div>

              <div className="table-wrapper max-h-96">
                <table>
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="text-center text-slate-600">{t.month}</th>
                      <th className="text-right text-slate-600">{t.beginningBalance}</th>
                      <th className="text-right text-slate-600">{t.interest}</th>
                      <th className="text-right text-slate-600">{t.principal}</th>
                      <th className="text-right text-slate-600">{t.totalPayment}</th>
                      <th className="text-right text-slate-600">{t.endingBalance}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((entry, index) => (
                      <tr key={index}>
                        <td className="text-center font-medium text-slate-700">{entry.month}</td>
                        <td className="text-right text-slate-600 tabular-nums">{formatCurrency(entry.beginningBalance)}</td>
                        <td className="text-right text-red-600 tabular-nums">{formatCurrency(entry.interest)}</td>
                        <td className="text-right text-blue-600 tabular-nums">{formatCurrency(entry.principal)}</td>
                        <td className="text-right font-medium text-slate-700 tabular-nums">{formatCurrency(entry.payment)}</td>
                        <td className="text-right text-slate-600 tabular-nums">{formatCurrency(entry.endingBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card">
              <div className="card-body">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">{t.chart}</h2>
                <div className="chart-container">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">{t.interestAndPrincipalChart}</h2>
                <div className="chart-container">
                  <Bar data={statisticsChartData} options={chartOptions} />
                </div>
              </div>
            </div>
            {/* Phase 2: Pie Chart */}
            <div className="card">
              <div className="card-body">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">{t.paymentBreakdown}</h2>
                <div className="chart-container">
                  <Doughnut data={pieChartData} options={pieChartOptions} />
                </div>
                <div className="mt-4 text-center text-sm text-slate-600">
                  <p>{t.principalLabel}: {((parseFloat(loanAmount.replace(/,/g, '')) / totalPayment) * 100).toFixed(1)}%</p>
                  <p>{t.interestLabel}: {((totalInterest / totalPayment) * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Phase 1: Compare Methods Toggle */}
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-800">{t.compareMode}</h2>
                <button
                  type="button"
                  onClick={() => {
                    setCompareMode(!compareMode);
                    if (!compareMode) calculateComparison();
                  }}
                  className={`btn cursor-pointer ${compareMode ? 'btn-primary' : 'btn-outline'}`}
                >
                  <CompareIcon />
                  {t.compareMode}
                </button>
              </div>

              {compareMode && annuitySchedule.length > 0 && fixedSchedule.length > 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Annuity Method */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h3 className="font-semibold text-blue-800 mb-3">{t.annuityMethod}</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-slate-600">{t.monthlyPayment}:</span> <span className="font-medium">{formatCurrency(annuitySchedule[0]?.payment || 0)}</span></p>
                        <p><span className="text-slate-600">{t.totalInterest}:</span> <span className="font-medium text-red-600">{formatCurrency(annuitySchedule.reduce((sum, e) => sum + e.interest, 0))}</span></p>
                        <p><span className="text-slate-600">{t.totalPaymentSummary}:</span> <span className="font-medium">{formatCurrency(annuitySchedule.reduce((sum, e) => sum + e.payment, 0))}</span></p>
                      </div>
                    </div>

                    {/* Fixed Principal Method */}
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h3 className="font-semibold text-green-800 mb-3">{t.fixedMethod}</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-slate-600">{t.monthlyPayment}:</span> <span className="font-medium">{formatCurrency(fixedSchedule[0]?.payment || 0)} - {formatCurrency(fixedSchedule[fixedSchedule.length - 1]?.payment || 0)}</span></p>
                        <p><span className="text-slate-600">{t.totalInterest}:</span> <span className="font-medium text-red-600">{formatCurrency(fixedSchedule.reduce((sum, e) => sum + e.interest, 0))}</span></p>
                        <p><span className="text-slate-600">{t.totalPaymentSummary}:</span> <span className="font-medium">{formatCurrency(fixedSchedule.reduce((sum, e) => sum + e.payment, 0))}</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Comparison Summary */}
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <h3 className="font-semibold text-amber-800 mb-2">{t.interestDiff}</h3>
                    {(() => {
                      const annuityInterest = annuitySchedule.reduce((sum, e) => sum + e.interest, 0);
                      const fixedInterest = fixedSchedule.reduce((sum, e) => sum + e.interest, 0);
                      const diff = Math.abs(annuityInterest - fixedInterest);
                      const betterMethod = annuityInterest < fixedInterest ? t.annuityMethod : t.fixedMethod;
                      return (
                        <p className="text-sm">
                          <span className="text-amber-800">{t.youSave} </span>
                          <span className="font-bold text-amber-900">{formatCurrency(diff)} VND</span>
                          <span className="text-amber-800"> {language === 'vi' ? 'với' : 'with'} </span>
                          <span className="font-semibold text-amber-900">{betterMethod}</span>
                        </p>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Phase 3: Early Repayment Calculator */}
          <div className="card">
              <div className="card-body">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">{t.earlyRepayment}</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">{t.extraPayment}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PlusIcon />
                      </div>
                      <input
                        type="text"
                        value={extraPayment}
                        onChange={(e) => {
                          const value = e.target.value.replace(/,/g, '');
                          if (!isNaN(Number(value))) {
                            setExtraPayment(formatCurrency(Number(value)));
                          }
                        }}
                        className="has-icon pl-10!"
                        placeholder="5,000,000"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentType('one-time')}
                      className={`flex-1 btn cursor-pointer ${paymentType === 'one-time' ? 'btn-primary' : 'btn-outline'}`}
                    >
                      {t.oneTime}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentType('monthly')}
                      className={`flex-1 btn cursor-pointer ${paymentType === 'monthly' ? 'btn-primary' : 'btn-outline'}`}
                    >
                      {t.monthly}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={calculateEarlyRepayment}
                    className="w-full btn btn-success cursor-pointer"
                  >
                    {t.calculateSavings}
                  </button>

                  {earlyRepaymentResult && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-600">{t.interestSaved}:</span>
                          <p className="font-bold text-green-700">{formatCurrency(earlyRepaymentResult.interestSaved)} VND</p>
                        </div>
                        <div>
                          <span className="text-slate-600">{t.monthsReduced}:</span>
                          <p className="font-bold text-green-700">{earlyRepaymentResult.monthsReduced} {language === 'vi' ? 'tháng' : 'months'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
        </div>
      )}

      {/* Tools that work without schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Phase 4: Affordability Calculator */}
        <div className="card">
          <div className="card-body">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">{t.affordability}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t.monthlyIncome}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <WalletIcon />
                  </div>
                  <input
                    type="text"
                    value={monthlyIncome}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, '');
                      if (!isNaN(Number(value))) {
                        setMonthlyIncome(formatCurrency(Number(value)));
                      }
                    }}
                    className="has-icon pl-10!"
                    placeholder="30,000,000"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={calculateAffordabilityResult}
                className="w-full btn btn-primary cursor-pointer"
              >
                {t.calculateAffordability}
              </button>
              {affordabilityResult && (
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-sm text-slate-600">{t.maxLoan}</span>
                    <p className="font-bold text-blue-700 text-lg">{formatCurrency(affordabilityResult.maxLoan50)} VND</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-sm text-slate-600">{t.comfortableLoan}</span>
                    <p className="font-bold text-green-700 text-lg">{formatCurrency(affordabilityResult.maxLoan40)} VND</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Phase 5: Saved Plans */}
        <div className="card">
          <div className="card-body">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">{t.savedPlans}</h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder={t.planName}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={savePlanToStorage}
                  disabled={!planName.trim() || schedule.length === 0}
                  className="btn btn-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <BookmarkIcon />
                  {t.savePlan}
                </button>
              </div>
              {savedPlans.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">{t.noPlansSaved}</p>
              ) : (
                <div className="space-y-2">
                  {savedPlans.map((plan) => (
                    <div key={plan.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{plan.name}</p>
                        <p className="text-xs text-slate-500">
                          {formatCurrency(parseFloat(plan.loanAmount.replace(/,/g, '')))} VND / {plan.loanYears} {t.years}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => loadPlanFromStorage(plan)}
                          className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          {t.loadPlan}
                        </button>
                        <button
                          type="button"
                          onClick={() => deletePlanFromStorage(plan.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 py-8 border-t border-slate-200">
        <div className="text-center">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Loan Calculator. All rights reserved.
          </p>
          <p className="text-slate-500 text-sm mt-1">
            Built with <span className="heart">&#10084;</span> by{' '}
            <a
              href="https://khuong.dev"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200"
            >
              khuong.dev
            </a>
          </p>
        </div>
      </footer>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

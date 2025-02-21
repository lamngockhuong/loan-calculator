import { ChangeEvent, useState } from 'react';
import dynamic from 'next/dynamic';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { formatCurrency, computeScheduleAnnuity, computeScheduleFixed } from '../utils/loan.utils';
import { InterestRate, ScheduleEntry, LoanProps } from '../types/loan.interfaces';
import Modal from './Modal';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Line = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), { ssr: false });
const Bar = dynamic(() => import('react-chartjs-2').then(mod => mod.Bar), { ssr: false });

const translations = {
  en: {
    loanAmount: 'Loan Amount (VND):',
    loanYears: 'Loan Years (can be fractional, e.g., 1.5):',
    calcMethod: 'Calculation Method:',
    annuity: 'Annuity (Equal Principal and Interest)',
    fixed: 'Fixed Principal, Reducing Interest',
    generateRates: 'Generate Interest Rates for Each Year',
    generateCommonRates: 'Generate Common Interest Rate',
    calculate: 'Calculate',
    repaymentSchedule: 'Repayment Schedule',
    month: 'Month',
    beginningBalance: 'Beginning Balance (VND)',
    interest: 'Interest (VND)',
    principal: 'Principal (VND)',
    totalPayment: 'Total Payment (VND)',
    endingBalance: 'Ending Balance (VND)',
    statistics: 'Statistics',
    totalInterest: 'Total Interest Payable:',
    totalPaymentSummary: 'Total Principal and Interest Payable:',
    chart: 'Repayment Chart',
    interestAndPrincipalChart: 'Interest and Principal Chart',
    interestRate: (period: number, months: number) =>
      months === 12 ? `Interest Rate Year ${period} (%)` : months === 0 ? `Interest Rate for Last Year (%)` : `Interest Rate for Last ${months} Months (%)`,
    interestRateCommon: 'Interest Rate for All Years (%)',
    modalMessages: {
      invalidLoanTerm: 'Please enter a valid loan term.',
      invalidLoanAmount: 'Please enter a valid loan amount.',
      invalidInterestRates: 'Please enter valid interest rates.'
    }
  },
  vi: {
    loanAmount: 'Số tiền vay (VND):',
    loanYears: 'Số năm vay (có thể số lẻ, VD: 1.5):',
    calcMethod: 'Phương pháp tính:',
    annuity: 'Gốc, lãi chia đều hàng tháng',
    fixed: 'Gốc cố định, lãi giảm dần',
    generateRates: 'Tạo lãi suất cho từng năm',
    generateCommonRates: 'Tạo lãi suất chung',
    calculate: 'Tính toán',
    repaymentSchedule: 'Lịch trả nợ',
    month: 'Tháng',
    beginningBalance: 'Số dư đầu kỳ (VND)',
    interest: 'Tiền lãi (VND)',
    principal: 'Tiền gốc (VND)',
    totalPayment: 'Tổng trả (VND)',
    endingBalance: 'Số dư cuối kỳ (VND)',
    statistics: 'Thống kê',
    totalInterest: 'Tổng lãi phải trả:',
    totalPaymentSummary: 'Tổng số tiền gốc và lãi phải trả:',
    chart: 'Biểu đồ trả nợ',
    interestAndPrincipalChart: 'Biểu đồ lãi và gốc',
    interestRate: (period: number, months: number) =>
      months === 12 ? `Lãi suất năm ${period} (%)` : months === 0 ? `Lãi suất cho năm cuối (%)` : `Lãi suất cho ${months} tháng cuối (%)`,
    interestRateCommon: 'Lãi suất cho tất cả các năm (%)',
    modalMessages: {
      invalidLoanTerm: 'Vui lòng nhập số năm vay hợp lệ.',
      invalidLoanAmount: 'Vui lòng nhập số tiền vay hợp lệ.',
      invalidInterestRates: 'Vui lòng nhập lãi suất hợp lệ.'
    }
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
  language
}: LoanProps) {
  const t = translations[language];
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [commonInterestRates, setCommonInterestRates] = useState<InterestRate[]>([]);
  const [individualInterestRates, setIndividualInterestRates] = useState<InterestRate[]>([]);

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
    if (rates.some(rate => isNaN(rate) || rate < 0)) {
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

  const chartData = {
    labels: schedule.length > 0 ? schedule.map(entry => `${t.month} ${entry.month}`) : [],
    datasets: [
      {
        label: t.beginningBalance,
        data: schedule.length > 0 ? schedule.map(entry => entry.beginningBalance) : [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
      {
        label: t.endingBalance,
        data: schedule.length > 0 ? schedule.map(entry => entry.endingBalance) : [],
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
      },
    ],
  };

  const statisticsChartData = {
    labels: schedule.length > 0 ? schedule.map(entry => `${t.month} ${entry.month}`) : [],
    datasets: [
      {
        label: t.interest,
        data: schedule.length > 0 ? schedule.map(entry => entry.interest) : [],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
      {
        label: t.principal,
        data: schedule.length > 0 ? schedule.map(entry => entry.principal) : [],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <form id="loanForm" className="bg-white p-6 rounded-lg shadow-lg mb-6">
        {modalMessage && (
          <Modal onClose={() => setModalMessage(null)}>
            {modalMessage}
          </Modal>
        )}
        <div className="mb-4">
          <label htmlFor="loanAmount" className="block text-gray-700 font-semibold">{t.loanAmount}</label>
          <input type="text" id="loanAmount" value={loanAmount} onChange={handleLoanAmountChange} required className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="mb-4">
          <label htmlFor="loanYears" className="block text-gray-700 font-semibold">{t.loanYears}</label>
          <input type="number" step="0.01" id="loanYears" value={loanYears} onChange={(e: ChangeEvent<HTMLInputElement>) => setLoanYears(e.target.value)} required className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="mb-4">
          <button
            type="button"
            onClick={() => generateRates(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 sm:mb-0 sm:mr-2"
          >
            {t.generateCommonRates}
          </button>
          <button
            type="button"
            onClick={() => generateRates(false)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {t.generateRates}
          </button>
        </div>
        <div id="interestRatesContainer" className="mb-4">
          {interestRates.map((rate, index) => (
            <div key={index} className="mb-2">
              <label className="block text-gray-700 font-semibold">
                {rate.commonRate ? t.interestRateCommon : t.interestRate(rate.period, rate.months)}
              </label>
              <input type="number" step="0.01" value={rate.rate} onChange={(e: ChangeEvent<HTMLInputElement>) => handleRateChange(index, e.target.value)} required className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold">{t.calcMethod}</label>
          <div className="flex items-center">
            <input type="radio" id="annuity" name="calcMethod" value="annuity" checked={calcMethod === 'annuity'} onChange={handleCalcMethodChange} className="mr-2" />
            <label htmlFor="annuity" className="mr-4">{t.annuity}</label>
            <input type="radio" id="fixed" name="calcMethod" value="fixed" checked={calcMethod === 'fixed'} onChange={handleCalcMethodChange} className="mr-2" />
            <label htmlFor="fixed">{t.fixed}</label>
          </div>
        </div>
        {schedule.length > 0 && (
          <div id="results">
            <h2 className="text-xl font-bold mb-4">{t.repaymentSchedule}</h2>
            <div className="overflow-x-auto max-h-96">
              <table id="scheduleTable" className="w-full bg-white rounded-lg shadow-lg mb-6">
                <thead className="sticky top-0 bg-blue-500 text-white" style={{ zIndex: 1 }}>
                  <tr>
                    <th className="p-2">{t.month}</th>
                    <th className="p-2">{t.beginningBalance}</th>
                    <th className="p-2">{t.interest}</th>
                    <th className="p-2">{t.principal}</th>
                    <th className="p-2">{t.totalPayment}</th>
                    <th className="p-2">{t.endingBalance}</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((entry, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2 text-center">{entry.month}</td>
                      <td className="p-2">{formatCurrency(entry.beginningBalance)}</td>
                      <td className="p-2">{formatCurrency(entry.interest)}</td>
                      <td className="p-2">{formatCurrency(entry.principal)}</td>
                      <td className="p-2">{formatCurrency(entry.payment)}</td>
                      <td className="p-2">{formatCurrency(entry.endingBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mb-4">
              <button type="button" onClick={downloadCSV} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500">
                Download CSV
              </button>
            </div>
            <div id="statistics" className="bg-white p-6 rounded-lg shadow-lg mb-6">
              <h2 className="text-xl font-bold mb-4">{t.statistics}</h2>
              <p id="totalInterest" className="mb-2">{t.totalInterest} <span className='font-bold'>{formatCurrency(totalInterest)}</span> VND</p>
              <p id="totalPayment">{t.totalPaymentSummary} <span className='font-bold'>{formatCurrency(totalPayment)}</span> VND</p>
            </div>
            <div id="chart" className="bg-white p-6 rounded-lg shadow-lg mb-6">
              <h2 className="text-xl font-bold mb-4">{t.chart}</h2>
              <Line data={chartData} />
            </div>
            <div id="statisticsChart" className="bg-white p-6 rounded-lg shadow-lg mb-6">
              <h2 className="text-xl font-bold mb-4">{t.interestAndPrincipalChart}</h2>
              <Bar data={statisticsChartData} />
            </div>
          </div>
        )}
      </form>
      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>&copy; {new Date().getFullYear()} Loan Calculator. All rights reserved.</p>
        <p>Built with <span className="heart">❤</span> by <a href="https://khuong.dev" target='_blank' className="underline">khuong.dev</a></p>
      </footer>
    </div>
  );
}

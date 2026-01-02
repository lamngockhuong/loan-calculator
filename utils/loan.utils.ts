import { deflateRaw, inflateRaw } from "pako";
import { ScheduleEntry } from "../types/loan.interfaces";

export const compressed = (params: object) => {
  const jsonString = JSON.stringify(params);
  const compressedData = deflateRaw(jsonString);
  return btoa(String.fromCharCode(...compressedData));
}

export const decompressed = (base64String: string) => {
  const binaryString = atob(base64String);
  const uint8Array = new Uint8Array(
    [...binaryString].map((c) => c.charCodeAt(0))
  );
  const decompressedData = inflateRaw(uint8Array, { to: 'string' });
  return JSON.parse(decompressedData);
}

export const formatCurrency = (value: number): string => {
  return value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const getInterestRateMonthly = (interestRates: number[], month: number): number => {
  const yearIndex = Math.floor((month - 1) / 12);
  const interestRate = interestRates[yearIndex] || interestRates[interestRates.length - 1];
  return interestRate / 100 / 12;
};

export const computeScheduleAnnuity = (
  loanAmount: number,
  totalMonths: number,
  interestRates: number[]
): ScheduleEntry[] => {
  const schedule: ScheduleEntry[] = [];
  let remainingLoan = loanAmount;

  for (let month = 1; month <= totalMonths; month++) {
    const interestRateMonth = getInterestRateMonthly(interestRates, month);
    const monthlyPayment = PMT(interestRateMonth, totalMonths - month + 1, remainingLoan, 0);
    const interestPayment = remainingLoan * interestRateMonth;
    const principalPayment = monthlyPayment - interestPayment;
    const endingBalance = remainingLoan - principalPayment;

    schedule.push({
      month: month,
      beginningBalance: remainingLoan,
      interest: interestPayment,
      principal: principalPayment,
      payment: monthlyPayment,
      endingBalance: endingBalance
    });

    remainingLoan = endingBalance;
  }

  return schedule;
};

export const computeScheduleFixed = (
  loanAmount: number,
  totalMonths: number,
  interestRates: number[]
): ScheduleEntry[] => {
  const schedule: ScheduleEntry[] = [];
  const fixedPrincipal = loanAmount / totalMonths;
  let remainingLoan = loanAmount;

  for (let month = 1; month <= totalMonths; month++) {
    const interestRateMonth = getInterestRateMonthly(interestRates, month);
    const interestPayment = remainingLoan * interestRateMonth;
    const monthlyPayment = fixedPrincipal + interestPayment;
    const endingBalance = remainingLoan - fixedPrincipal;

    schedule.push({
      month: month,
      beginningBalance: remainingLoan,
      interest: interestPayment,
      principal: fixedPrincipal,
      payment: monthlyPayment,
      endingBalance: endingBalance
    });

    remainingLoan = endingBalance;
  }

  return schedule;
};

/**
 * Calculate Payment (PMT) - Standard financial formula
 * PMT = r × (PV × (1+r)^n + FV) / ((1+r)^n - 1)
 *
 * @param ir - Interest rate per period (monthly rate = annual rate / 12 / 100)
 * @param np - Number of periods (months)
 * @param pv - Present value (loan amount)
 * @param fv - Future value (default 0)
 * @returns Monthly payment amount
 */
function PMT(ir: number, np: number, pv: number, fv: number): number {
  if (!fv) {
    fv = 0;
  }

  // Handle zero interest rate - simple division
  if (ir === 0) {
    return (pv + fv) / np;
  }

  const rateFactor = Math.pow(1 + ir, np);
  const pmt = (ir * (pv * rateFactor + fv)) / (rateFactor - 1);
  return pmt;
}

export function calculateMonthlyPayment(
  interestRatePerPeriod: number, // Lãi suất mỗi kỳ (ví dụ: mỗi tháng)
  totalPeriods: number, // Tổng số kỳ thanh toán (ví dụ: số tháng)
  loanAmount: number, // Giá trị khoản vay ban đầu (PV - Present Value)
  futureValue: number = 0 // Giá trị tương lai mong muốn (FV - Future Value), mặc định là 0
): number {
  if (totalPeriods <= 0 || loanAmount <= 0) {
    return 0;
  }

  if (interestRatePerPeriod === 0) {
    return loanAmount / totalPeriods; // Trả góp đều nếu không có lãi suất
  }

  const rateFactor = Math.pow(1 + interestRatePerPeriod, totalPeriods);
  const monthlyPayment =
    (interestRatePerPeriod * (loanAmount * rateFactor + futureValue)) /
    (rateFactor - 1);

  return monthlyPayment;
}

// Phase 4: Affordability Calculator
export interface AffordabilityResult {
  maxLoan50: number; // 50% DTI
  maxLoan40: number; // 40% DTI (comfortable)
  maxMonthlyPayment50: number;
  maxMonthlyPayment40: number;
}

export function computeAffordability(
  monthlyIncome: number,
  interestRate: number, // annual rate in %
  loanYears: number
): AffordabilityResult {
  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = Math.round(loanYears * 12);

  const maxPayment50 = monthlyIncome * 0.5;
  const maxPayment40 = monthlyIncome * 0.4;

  // Reverse PMT formula: PV = PMT * ((1 - (1 + r)^-n) / r)
  const calculateMaxLoan = (maxPayment: number): number => {
    if (monthlyRate === 0) {
      return maxPayment * totalMonths;
    }
    const factor = (1 - Math.pow(1 + monthlyRate, -totalMonths)) / monthlyRate;
    return maxPayment * factor;
  };

  return {
    maxLoan50: calculateMaxLoan(maxPayment50),
    maxLoan40: calculateMaxLoan(maxPayment40),
    maxMonthlyPayment50: maxPayment50,
    maxMonthlyPayment40: maxPayment40
  };
}

// Phase 3: Early Repayment Calculator
export interface EarlyRepaymentResult {
  newSchedule: ScheduleEntry[];
  originalTotalInterest: number;
  newTotalInterest: number;
  interestSaved: number;
  originalMonths: number;
  newMonths: number;
  monthsReduced: number;
}

export function computeEarlyRepayment(
  loanAmount: number,
  totalMonths: number,
  interestRates: number[],
  calcMethod: 'annuity' | 'fixed',
  extraAmount: number,
  paymentType: 'one-time' | 'monthly'
): EarlyRepaymentResult {
  // Calculate original schedule
  const originalSchedule = calcMethod === 'annuity'
    ? computeScheduleAnnuity(loanAmount, totalMonths, interestRates)
    : computeScheduleFixed(loanAmount, totalMonths, interestRates);

  const originalTotalInterest = originalSchedule.reduce((sum, e) => sum + e.interest, 0);

  // Calculate new schedule with extra payment
  const newSchedule: ScheduleEntry[] = [];
  let remainingLoan = loanAmount;

  // For one-time: reduce principal at month 1
  if (paymentType === 'one-time') {
    remainingLoan = Math.max(0, loanAmount - extraAmount);
  }

  const effectiveTotalMonths = paymentType === 'one-time'
    ? totalMonths
    : totalMonths;

  let month = 1;
  while (remainingLoan > 0.01 && month <= totalMonths * 2) {
    const interestRateMonth = getInterestRateMonthly(interestRates, month);

    let principal: number;
    let monthlyPayment: number;

    if (calcMethod === 'annuity') {
      const remainingMonths = Math.max(1, effectiveTotalMonths - month + 1);
      monthlyPayment = PMT(interestRateMonth, remainingMonths, remainingLoan, 0);
      if (paymentType === 'monthly') {
        monthlyPayment += extraAmount;
      }
      const interestPayment = remainingLoan * interestRateMonth;
      principal = Math.min(monthlyPayment - interestPayment, remainingLoan);
      monthlyPayment = principal + interestPayment;
    } else {
      const fixedPrincipal = loanAmount / totalMonths;
      principal = paymentType === 'monthly'
        ? fixedPrincipal + extraAmount
        : fixedPrincipal;
      principal = Math.min(principal, remainingLoan);
      const interestPayment = remainingLoan * interestRateMonth;
      monthlyPayment = principal + interestPayment;
    }

    const interestPayment = remainingLoan * interestRateMonth;
    const endingBalance = Math.max(0, remainingLoan - principal);

    newSchedule.push({
      month,
      beginningBalance: remainingLoan,
      interest: interestPayment,
      principal,
      payment: monthlyPayment,
      endingBalance
    });

    remainingLoan = endingBalance;
    month++;
  }

  const newTotalInterest = newSchedule.reduce((sum, e) => sum + e.interest, 0);

  return {
    newSchedule,
    originalTotalInterest,
    newTotalInterest,
    interestSaved: originalTotalInterest - newTotalInterest,
    originalMonths: originalSchedule.length,
    newMonths: newSchedule.length,
    monthsReduced: originalSchedule.length - newSchedule.length
  };
}


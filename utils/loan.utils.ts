import { ScheduleEntry } from "../types/loan.interfaces";

export const formatCurrency = (value: number): string => {
  return value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const computeScheduleAnnuity = (
  loanAmount: number,
  totalMonths: number,
  interestRates: number[],
  fullYears: number,
  hasFraction: boolean,
  totalPeriods: number
): ScheduleEntry[] => {
  const schedule: ScheduleEntry[] = [];
  let remainingLoan = loanAmount;
  let currentMonth = 1;
  for (let period = 0; period < totalPeriods; period++) {
    const monthsInPeriod = (period < totalPeriods - 1) ? 12 : (totalMonths - fullYears * 12);
    const monthlyRate = interestRates[period] / 100 / 12;
    const monthsRemaining = totalMonths - (currentMonth - 1);
    let monthlyPayment;
    if (monthlyRate === 0) {
      monthlyPayment = remainingLoan / monthsRemaining;
    } else {
      monthlyPayment = remainingLoan * monthlyRate * Math.pow(1 + monthlyRate, monthsRemaining) /
                       (Math.pow(1 + monthlyRate, monthsRemaining) - 1);
    }
    for (let m = 0; m < monthsInPeriod; m++) {
      if (remainingLoan <= 0.01) { remainingLoan = 0; break; }
      const beginningBalance = remainingLoan;
      const interestPayment = beginningBalance * monthlyRate;
      let principalPayment: number = monthlyPayment - interestPayment;
      if (principalPayment > remainingLoan) {
        principalPayment = remainingLoan;
        monthlyPayment = interestPayment + principalPayment;
      }
      const endingBalance = beginningBalance - principalPayment;
      schedule.push({
        month: currentMonth,
        beginningBalance: beginningBalance,
        interest: interestPayment,
        principal: principalPayment,
        payment: monthlyPayment,
        endingBalance: endingBalance
      });
      remainingLoan = endingBalance;
      currentMonth++;
    }
  }
  return schedule;
};

export const computeScheduleFixed = (
  loanAmount: number,
  totalMonths: number,
  interestRates: number[],
  fullYears: number,
  hasFraction: boolean,
  totalPeriods: number
): ScheduleEntry[] => {
  const schedule: ScheduleEntry[] = [];
  const fixedPrincipal = loanAmount / totalMonths;
  let remainingLoan = loanAmount;
  let currentMonth = 1;
  const monthRates: number[] = [];
  for (let period = 0; period < totalPeriods; period++) {
    const monthsInPeriod = (period < totalPeriods - 1) ? 12 : (totalMonths - fullYears * 12);
    const monthlyRate = interestRates[period] / 100 / 12;
    for (let m = 0; m < monthsInPeriod; m++) {
      monthRates.push(monthlyRate);
    }
  }
  for (let i = 0; i < totalMonths; i++) {
    const beginningBalance = remainingLoan;
    const monthlyRate = monthRates[i];
    const interestPayment = beginningBalance * monthlyRate;
    let principalPayment = fixedPrincipal;
    if (principalPayment > remainingLoan) {
      principalPayment = remainingLoan;
    }
    const monthlyPayment = interestPayment + principalPayment;
    const endingBalance = beginningBalance - principalPayment;
    schedule.push({
      month: currentMonth,
      beginningBalance: beginningBalance,
      interest: interestPayment,
      principal: principalPayment,
      payment: monthlyPayment,
      endingBalance: endingBalance
    });
    remainingLoan = endingBalance;
    currentMonth++;
  }
  return schedule;
};

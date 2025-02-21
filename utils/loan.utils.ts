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

function PMT(ir: number, np: number, pv: number, fv: number): number {
  if (!fv) {
    fv = 0;
  }
  const pmt =
    (ir * (pv * Math.pow(ir + 1, np) + fv)) / (Math.pow(ir + 1, np) - 1);
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

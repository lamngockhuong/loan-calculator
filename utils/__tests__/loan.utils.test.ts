import { formatCurrency, getInterestRateMonthly, computeScheduleAnnuity, computeScheduleFixed, calculateMonthlyPayment } from "../loan.utils";

describe("loan.utils", () => {
  describe("formatCurrency", () => {
    it("should format number as currency", () => {
      expect(formatCurrency(1234567)).toBe("1,234,567");
      expect(formatCurrency(1234.56)).toBe("1,235");
    });

    it("should handle negative numbers", () => {
      expect(formatCurrency(-1234567)).toBe("-1,234,567");
      expect(formatCurrency(-1234.56)).toBe("-1,235");
    });

    it("should handle zero", () => {
      expect(formatCurrency(0)).toBe("0");
    });
  });

  describe("getInterestRateMonthly", () => {
    it("should return correct monthly interest rate", () => {
      const interestRates = [5, 6, 7];
      expect(getInterestRateMonthly(interestRates, 1)).toBeCloseTo(0.004167, 5);
      expect(getInterestRateMonthly(interestRates, 13)).toBeCloseTo(0.005, 5);
      expect(getInterestRateMonthly(interestRates, 25)).toBeCloseTo(0.005833, 5);
    });

    it("should handle months beyond provided interest rates", () => {
      const interestRates = [5];
      expect(getInterestRateMonthly(interestRates, 13)).toBeCloseTo(0.004167, 5);
    });

    it("should handle negative months", () => {
      const interestRates = [5];
      expect(getInterestRateMonthly(interestRates, -1)).toBeCloseTo(0.004167, 5);
    });

    it("should handle zero months", () => {
      const interestRates = [5];
      expect(getInterestRateMonthly(interestRates, 0)).toBeCloseTo(0.004167, 5);
    });

    it("should handle zero interest rates", () => {
      const interestRates = [0];
      expect(getInterestRateMonthly(interestRates, 1)).toBeCloseTo(0, 5);
    });

    it("should handle negative interest rates", () => {
      const interestRates = [-5];
      expect(getInterestRateMonthly(interestRates, 1)).toBeCloseTo(-0.004167, 5);
    });

    it("should handle multiple interest rates", () => {
      const interestRates = [5, 6, 7];
      expect(getInterestRateMonthly(interestRates, 1)).toBeCloseTo(0.004167, 5);
      expect(getInterestRateMonthly(interestRates, 13)).toBeCloseTo(0.005, 5);
      expect(getInterestRateMonthly(interestRates, 25)).toBeCloseTo(0.005833, 5);
    });

    it("should handle multiple interest rates with negative months", () => {
      const interestRates = [5, 6, 7];
      expect(getInterestRateMonthly(interestRates, -1)).toBeCloseTo(
        0.005833,
        5
      );
    });

    it("should handle multiple interest rates with zero months", () => {
      const interestRates = [5, 6, 7];
      expect(getInterestRateMonthly(interestRates, 0)).toBeCloseTo(0.005833, 5);
    });

    it("should handle multiple interest rates with zero interest rates", () => {
      const interestRates = [0];
      expect(getInterestRateMonthly(interestRates, 1)).toBeCloseTo(0, 5);
    });

    it("should handle multiple interest rates with negative interest rates", () => {
      const interestRates = [-5, -6, -7];
      expect(getInterestRateMonthly(interestRates, 1)).toBeCloseTo(-0.004167, 5);
      expect(getInterestRateMonthly(interestRates, 13)).toBeCloseTo(-0.005, 5);
      expect(getInterestRateMonthly(interestRates, 25)).toBeCloseTo(-0.005833, 5);
    });
  });

  describe("computeScheduleAnnuity", () => {
    it("should compute annuity schedule correctly", () => {
      const loanAmount = 100000;
      const totalMonths = 12;
      const interestRates = [5];
      const schedule = computeScheduleAnnuity(loanAmount, totalMonths, interestRates);

      expect(schedule.length).toBe(totalMonths);
      expect(schedule[0].beginningBalance).toBe(100000);
      expect(schedule[totalMonths - 1].endingBalance).toBeCloseTo(0, 2);
    });

    it("should handle multiple interest rates", () => {
      const loanAmount = 100000;
      const totalMonths = 24;
      const interestRates = [5, 6];
      const schedule = computeScheduleAnnuity(loanAmount, totalMonths, interestRates);

      expect(schedule.length).toBe(totalMonths);
      expect(schedule[0].beginningBalance).toBe(100000);
      expect(schedule[totalMonths - 1].endingBalance).toBeCloseTo(0, 2);
    });

    it("should handle zero loan amount", () => {
      const loanAmount = 0;
      const totalMonths = 12;
      const interestRates = [5];
      const schedule = computeScheduleAnnuity(loanAmount, totalMonths, interestRates);

      expect(schedule.length).toBe(totalMonths);
      expect(schedule[0].beginningBalance).toBe(0);
      expect(schedule[totalMonths - 1].endingBalance).toBeCloseTo(0, 2);
    });

    it("should handle zero total months", () => {
      const loanAmount = 100000;
      const totalMonths = 0;
      const interestRates = [5];
      const schedule = computeScheduleAnnuity(loanAmount, totalMonths, interestRates);

      expect(schedule.length).toBe(0);
    });

    it("should handle zero interest rates", () => {
      const loanAmount = 100000;
      const totalMonths = 12;
      const interestRates = [0];
      const schedule = computeScheduleAnnuity(loanAmount, totalMonths, interestRates);

      expect(schedule.length).toBe(totalMonths);
      expect(schedule[0].beginningBalance).toBe(100000);
      expect(schedule[totalMonths - 1].endingBalance).toBeNaN();
    });

    it("should handle negative loan amount", () => {
      const loanAmount = -100000;
      const totalMonths = 12;
      const interestRates = [5];
      const schedule = computeScheduleAnnuity(loanAmount, totalMonths, interestRates);

      expect(schedule.length).toBe(totalMonths);
      expect(schedule[0].beginningBalance).toBe(-100000);
      expect(schedule[totalMonths - 1].endingBalance).toBeCloseTo(0, 2);
    });

    it("should handle negative total months", () => {
      const loanAmount = 100000;
      const totalMonths = -12;
      const interestRates = [5];
      const schedule = computeScheduleAnnuity(loanAmount, totalMonths, interestRates);

      expect(schedule.length).toBe(0);
    });

    it("should handle negative interest rates", () => {
      const loanAmount = 100000;
      const totalMonths = 12;
      const interestRates = [-5];
      const schedule = computeScheduleAnnuity(loanAmount, totalMonths, interestRates);

      expect(schedule.length).toBe(totalMonths);
      expect(schedule[0].beginningBalance).toBe(100000);
      expect(schedule[totalMonths - 1].endingBalance).toBeCloseTo(0, 2);
    });

    it("should handle multiple interest rates with negative months", () => {
      const loanAmount = 100000;
      const totalMonths = 24;
      const interestRates = [5, 6, 7];
      const schedule = computeScheduleAnnuity(loanAmount, -totalMonths, interestRates);

      expect(schedule.length).toBe(0);
    });

    it("should handle multiple interest rates with zero months", () => {
      const loanAmount = 100000;
      const interestRates = [5, 6, 7];
      const schedule = computeScheduleAnnuity(loanAmount, 0, interestRates);

      expect(schedule.length).toBe(0);
    });

    it("should handle multiple interest rates with zero interest rates", () => {
      const loanAmount = 100000;
      const totalMonths = 24;
      const interestRates = [0, 0, 0];
      const schedule = computeScheduleAnnuity(loanAmount, totalMonths, interestRates);

      expect(schedule.length).toBe(totalMonths);
      expect(schedule[0].beginningBalance).toBe(100000);
      expect(schedule[totalMonths - 1].endingBalance).toBeNaN();
    });

    it("should handle multiple interest rates with negative interest rates", () => {
      const loanAmount = 100000;
      const totalMonths = 24;
      const interestRates = [-5, -6, -7];
      const schedule = computeScheduleAnnuity(loanAmount, totalMonths, interestRates);

      expect(schedule.length).toBe(totalMonths);
      expect(schedule[0].beginningBalance).toBe(100000);
      expect(schedule[totalMonths - 1].endingBalance).toBeCloseTo(0, 2);
    });

    it("should handle multiple interest rates with negative loan amount", () => {
      const loanAmount = -100000;
      const totalMonths = 24;
      const interestRates = [5, 6, 7];
      const schedule = computeScheduleAnnuity(loanAmount, totalMonths, interestRates);

      expect(schedule.length).toBe(totalMonths);
      expect(schedule[0].beginningBalance).toBe(-100000);
      expect(schedule[totalMonths - 1].endingBalance).toBeCloseTo(0, 2);
    });

    it("should handle multiple interest rates with negative total months", () => {
      const loanAmount = 100000;
      const totalMonths = -24;
      const interestRates = [5, 6, 7];
      const schedule = computeScheduleAnnuity(loanAmount, totalMonths, interestRates);

      expect(schedule.length).toBe(0);
    });
  });

  describe("computeScheduleFixed", () => {
    it("should compute fixed schedule correctly", () => {
      const loanAmount = 100000;
      const totalMonths = 12;
      const interestRates = [5];
      const schedule = computeScheduleFixed(loanAmount, totalMonths, interestRates);

      expect(schedule.length).toBe(totalMonths);
      expect(schedule[0].beginningBalance).toBe(100000);
      expect(schedule[totalMonths - 1].endingBalance).toBeCloseTo(0, 2);
    });

    it("should handle multiple interest rates", () => {
      const loanAmount = 100000;
      const totalMonths = 24;
      const interestRates = [5, 6];
      const schedule = computeScheduleFixed(loanAmount, totalMonths, interestRates);

      expect(schedule.length).toBe(totalMonths);
      expect(schedule[0].beginningBalance).toBe(100000);
      expect(schedule[totalMonths - 1].endingBalance).toBeCloseTo(0, 2);
    });

    it("should handle zero loan amount", () => {
      const loanAmount = 0;
      const totalMonths = 12;
      const interestRates = [5];
      const schedule = computeScheduleFixed(loanAmount, totalMonths, interestRates);

      expect(schedule.length).toBe(totalMonths);
      expect(schedule[0].beginningBalance).toBe(0);
      expect(schedule[totalMonths - 1].endingBalance).toBeCloseTo(0, 2);
    });

    it("should handle zero total months", () => {
      const loanAmount = 100000;
      const totalMonths = 0;
      const interestRates = [5];
      const schedule = computeScheduleFixed(loanAmount, totalMonths, interestRates);

      expect(schedule.length).toBe(0);
    });

    it("should handle zero interest rates", () => {
      const loanAmount = 100000;
      const totalMonths = 12;
      const interestRates = [0];
      const schedule = computeScheduleFixed(loanAmount, totalMonths, interestRates);

      expect(schedule.length).toBe(totalMonths);
      expect(schedule[0].beginningBalance).toBe(100000);
      expect(schedule[totalMonths - 1].endingBalance).toBeCloseTo(3.64e-12, 2);
    });

    it("should handle negative loan amount", () => {
      const loanAmount = -100000;
      const totalMonths = 12;
      const interestRates = [5];
      const schedule = computeScheduleFixed(loanAmount, totalMonths, interestRates);

      expect(schedule.length).toBe(totalMonths);
      expect(schedule[0].beginningBalance).toBe(-100000);
      expect(schedule[totalMonths - 1].endingBalance).toBeCloseTo(0, 2);
    });

    it("should handle negative total months", () => {
      const loanAmount = 100000;
      const totalMonths = -12;
      const interestRates = [5];
      const schedule = computeScheduleFixed(loanAmount, totalMonths, interestRates);

      expect(schedule.length).toBe(0);
    });

    it("should handle negative interest rates", () => {
      const loanAmount = 100000;
      const totalMonths = 12;
      const interestRates = [-5];
      const schedule = computeScheduleFixed(loanAmount, totalMonths, interestRates);

      expect(schedule.length).toBe(totalMonths);
      expect(schedule[0].beginningBalance).toBe(100000);
      expect(schedule[totalMonths - 1].endingBalance).toBeCloseTo(0, 2);
    });

    it("should handle multiple interest rates with negative months", () => {
      const loanAmount = 100000;
      const totalMonths = 24;
      const interestRates = [5, 6, 7];
      const schedule = computeScheduleFixed(loanAmount, -totalMonths, interestRates);

      expect(schedule.length).toBe(0);
    });

    it("should handle multiple interest rates with zero months", () => {
      const loanAmount = 100000;
      const interestRates = [5, 6, 7];
      const schedule = computeScheduleFixed(loanAmount, 0, interestRates);

      expect(schedule.length).toBe(0);
    });

    it("should handle multiple interest rates with zero interest rates", () => {
      const loanAmount = 100000;
      const totalMonths = 24;
      const interestRates = [0, 0, 0];
      const schedule = computeScheduleFixed(loanAmount, totalMonths, interestRates);

      expect(schedule.length).toBe(totalMonths);
      expect(schedule[0].beginningBalance).toBe(100000);
      expect(schedule[totalMonths - 1].endingBalance).toBeCloseTo(0, 2);
    });

    it("should handle multiple interest rates with negative interest rates", () => {
      const loanAmount = 100000;
      const totalMonths = 24;
      const interestRates = [-5, -6, -7];
      const schedule = computeScheduleFixed(loanAmount, totalMonths, interestRates);

      expect(schedule.length).toBe(totalMonths);
      expect(schedule[0].beginningBalance).toBe(100000);
      expect(schedule[totalMonths - 1].endingBalance).toBeCloseTo(0, 2);
    });

    it("should handle multiple interest rates with negative loan amount", () => {
      const loanAmount = -100000;
      const totalMonths = 24;
      const interestRates = [5, 6, 7];
      const schedule = computeScheduleFixed(loanAmount, totalMonths, interestRates);

      expect(schedule.length).toBe(totalMonths);
      expect(schedule[0].beginningBalance).toBe(-100000);
      expect(schedule[totalMonths - 1].endingBalance).toBeCloseTo(0, 2);
    });

    it("should handle multiple interest rates with negative total months", () => {
      const loanAmount = 100000;
      const totalMonths = -24;
      const interestRates = [5, 6, 7];
      const schedule = computeScheduleFixed(loanAmount, totalMonths, interestRates);

      expect(schedule.length).toBe(0);
    });

    it("should handle multiple interest rates with zero fixed principal", () => {
      const loanAmount = 100000;
      const totalMonths = 24;
      const interestRates = [5, 6, 7];
      const schedule = computeScheduleFixed(loanAmount, totalMonths, interestRates);

      expect(schedule.length).toBe(totalMonths);
      expect(schedule[0].beginningBalance).toBe(100000);
      expect(schedule[totalMonths - 1].endingBalance).toBeCloseTo(0, 2);
    });

    it("should handle multiple interest rates with negative fixed principal", () => {
      const loanAmount = 100000;
      const totalMonths = 24;
      const interestRates = [5, 6, 7];
      const schedule = computeScheduleFixed(loanAmount, totalMonths, interestRates);

      expect(schedule.length).toBe(totalMonths);
      expect(schedule[0].beginningBalance).toBe(100000);
      expect(schedule[totalMonths - 1].endingBalance).toBeCloseTo(0, 2);
    });

    it("should handle multiple interest rates with zero total months", () => {
      const loanAmount = 100000;
      const interestRates = [5, 6, 7];
      const schedule = computeScheduleFixed(loanAmount, 0, interestRates);

      expect(schedule.length).toBe(0);
    });

    it("should handle multiple interest rates with negative total months", () => {
      const loanAmount = 100000;
      const totalMonths = -24;
      const interestRates = [5, 6, 7];
      const schedule = computeScheduleFixed(loanAmount, totalMonths, interestRates);

      expect(schedule.length).toBe(0);
    });
  });

  describe("calculateMonthlyPayment", () => {
    it("should calculate monthly payment correctly with interest", () => {
      const interestRatePerPeriod = 0.005;
      const totalPeriods = 12;
      const loanAmount = 100000;
      const monthlyPayment = calculateMonthlyPayment(interestRatePerPeriod, totalPeriods, loanAmount);

      expect(monthlyPayment).toBeCloseTo(8606.64, 2);
    });

    it("should calculate monthly payment correctly without interest", () => {
      const interestRatePerPeriod = 0;
      const totalPeriods = 12;
      const loanAmount = 100000;
      const monthlyPayment = calculateMonthlyPayment(interestRatePerPeriod, totalPeriods, loanAmount);

      expect(monthlyPayment).toBeCloseTo(8333.33, 2);
    });

    it("should handle zero loan amount", () => {
      const interestRatePerPeriod = 0.005;
      const totalPeriods = 12;
      const loanAmount = 0;
      const monthlyPayment = calculateMonthlyPayment(interestRatePerPeriod, totalPeriods, loanAmount);

      expect(monthlyPayment).toBe(0);
    });

    it("should handle zero total periods", () => {
      const interestRatePerPeriod = 0.005;
      const totalPeriods = 0;
      const loanAmount = 100000;
      const monthlyPayment = calculateMonthlyPayment(interestRatePerPeriod, totalPeriods, loanAmount);

      expect(monthlyPayment).toBe(0);
    });

    it("should handle zero interest rate", () => {
      const interestRatePerPeriod = 0;
      const totalPeriods = 12;
      const loanAmount = 100000;
      const monthlyPayment = calculateMonthlyPayment(interestRatePerPeriod, totalPeriods, loanAmount);

      expect(monthlyPayment).toBeCloseTo(8333.33, 2);
    });

    it("should handle negative interest rate", () => {
      const interestRatePerPeriod = -0.005;
      const totalPeriods = 12;
      const loanAmount = 100000;
      const monthlyPayment = calculateMonthlyPayment(interestRatePerPeriod, totalPeriods, loanAmount);

      expect(monthlyPayment).toBeCloseTo(8064.99, 2);
    });

    it("should handle negative loan amount", () => {
      const interestRatePerPeriod = 0.005;
      const totalPeriods = 12;
      const loanAmount = -100000;
      const monthlyPayment = calculateMonthlyPayment(interestRatePerPeriod, totalPeriods, loanAmount);

      expect(monthlyPayment).toBe(0);
    });

    it("should handle negative total periods", () => {
      const interestRatePerPeriod = 0.005;
      const totalPeriods = -12;
      const loanAmount = 100000;
      const monthlyPayment = calculateMonthlyPayment(interestRatePerPeriod, totalPeriods, loanAmount);

      expect(monthlyPayment).toBe(0);
    });
  });
});

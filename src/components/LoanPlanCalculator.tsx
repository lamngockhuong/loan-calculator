"use client";
import { useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function LoanPlanCalculator() {
  const [amount, setAmount] = useState(270000000);
  const [years, setYears] = useState(1);
  const [method, setMethod] = useState("equalPrincipal");
  const [interestRates, setInterestRates] = useState<{ [year: number]: number }>({ 1: 10 });
  const [schedule, setSchedule] = useState<any[]>([]);

  const calculatePlan = () => {
    const months = years * 12;
    const plan = [];
    let remaining = amount;

    for (let i = 1; i <= months; i++) {
      const year = Math.ceil(i / 12);
      const interestRate = interestRates[year] || 10;
      const interest = (remaining * (interestRate / 100)) / 12;
      const principal = method === "equalPrincipal" ? amount / months : remaining / (months - i + 1);
      const totalPayment = principal + interest;
      remaining -= principal;
      plan.push({ month: i, beginningBalance: remaining + principal, interest, principal, totalPayment, endingBalance: remaining });
    }
    setSchedule(plan);
  };

  const chartData = {
    labels: schedule.map((row) => `Tháng ${row.month}`),
    datasets: [
      {
        label: "Tiền gốc",
        data: schedule.map((row) => row.principal),
        backgroundColor: "#4CAF50",
      },
      {
        label: "Tiền lãi",
        data: schedule.map((row) => row.interest),
        backgroundColor: "#FF9800",
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Phân tích kế hoạch trả nợ vay</h1>
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium">Số tiền vay (VND)</label>
          <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium">Số năm vay</label>
          <input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium">Phương pháp tính</label>
          <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full p-2 border rounded">
            <option value="equalPrincipal">Gốc, lãi chia đều hàng tháng</option>
            <option value="decliningBalance">Gốc cố định, lãi giảm dần</option>
          </select>
        </div>
      </div>
      <button onClick={calculatePlan} className="bg-blue-500 text-white px-4 py-2 rounded">Tính toán</button>
      <h2 className="text-xl font-bold mt-6">Thống kê</h2>
      <div className="bg-gray-200 p-4 rounded mt-2">
        <p><strong>Tổng lãi phải trả:</strong> {schedule.reduce((sum, row) => sum + row.interest, 0).toFixed(0)} VND</p>
        <p><strong>Tổng số tiền gốc và lãi phải trả:</strong> {schedule.reduce((sum, row) => sum + row.totalPayment, 0).toFixed(0)} VND</p>
      </div>
      <h2 className="text-xl font-bold mt-6">Lịch trả nợ</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border mt-4">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="border p-2">Tháng</th>
              <th className="border p-2">Số dư đầu kỳ (VND)</th>
              <th className="border p-2">Tiền lãi (VND)</th>
              <th className="border p-2">Tiền gốc (VND)</th>
              <th className="border p-2">Tổng trả (VND)</th>
              <th className="border p-2">Số dư cuối kỳ (VND)</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((row, index) => (
              <tr key={index} className="border">
                <td className="border p-2">{row.month}</td>
                <td className="border p-2">{row.beginningBalance.toFixed(0)}</td>
                <td className="border p-2">{row.interest.toFixed(0)}</td>
                <td className="border p-2">{row.principal.toFixed(0)}</td>
                <td className="border p-2">{row.totalPayment.toFixed(0)}</td>
                <td className="border p-2">{row.endingBalance.toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="text-xl font-bold mt-6">Biểu đồ</h2>
      <Bar data={chartData} />
    </div>
  );
}
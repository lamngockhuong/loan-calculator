import "../styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Phân tích kế hoạch trả nợ vay",
  description: "Ứng dụng tính toán kế hoạch trả nợ vay sử dụng Next.js",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="bg-gray-100 text-gray-900">
        <main className="container mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}
"use client";

import '../styles/globals.css';
import Menu from '../components/Menu';
import { useState, useEffect } from 'react';
import { LanguageContext } from '../hooks/useLanguage';
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [language, setLanguage] = useState<'en' | 'vi'>('vi');

  useEffect(() => {
    const storedLanguage = localStorage.getItem('language') as 'en' | 'vi';
    if (storedLanguage) {
      setLanguage(storedLanguage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const handleLanguageChange = (lang: 'en' | 'vi') => {
    setLanguage(lang);
  };

  return (
    <html lang="en" className="no-touch" data-lt-installed="true">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Loan Calculator - Calculate your loan payments easily - Tính toán khoản vay của bạn một cách dễ dàng" />
        <meta name="keywords" content="loan, calculator, finance, payments, khoản vay, tính toán, tài chính, thanh toán" />
        <meta name="author" content="Lâm Ngọc Khương - me@khuong.dev" />
      </head>
      <body>
        <LanguageContext.Provider value={language}>
          <Menu language={language} handleLanguageChange={handleLanguageChange} />
          <main>{children}</main>
        </LanguageContext.Provider>
      </body>
      <GoogleAnalytics gaId="G-5N1MLC7RDY" />
    </html>
  )
}

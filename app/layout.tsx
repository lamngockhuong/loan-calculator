"use client";

import '../styles/globals.css';
import Menu from '../components/Menu';
import { useState, useEffect } from 'react';
import { LanguageContext } from '../hooks/useLanguage';

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
      </head>
      <body>
        <LanguageContext.Provider value={language}>
          <Menu language={language} handleLanguageChange={handleLanguageChange} />
          <main>{children}</main>
        </LanguageContext.Provider>
      </body>
    </html>
  )
}

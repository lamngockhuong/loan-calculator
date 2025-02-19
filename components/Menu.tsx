"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '../app/layout';

type MenuProps = {
  language: 'en' | 'vi';
  handleLanguageChange: (lang: 'en' | 'vi') => void;
};

const Menu = ({ handleLanguageChange }: MenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const language = useLanguage();
  const menuRef = useRef<HTMLUListElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <nav className="bg-gray-800 p-4">
      <div className="flex justify-between items-center">
        <div className="text-white md:hidden">Loan Calculator</div>
        <button
          className="text-white md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>
      </div>
      <ul ref={menuRef} className={`flex-col md:flex-row md:flex ${isOpen ? 'flex' : 'hidden'} space-y-2 md:space-y-0 md:space-x-2 mt-4 md:mt-0`}>
        <li className="bg-gray-700 p-2 rounded-md md:bg-transparent">
          <Link href="/" passHref legacyBehavior>
            <a rel="noopener noreferrer" className="text-white hover:text-gray-400">Home</a>
          </Link>
        </li>
        <li className="bg-gray-700 p-2 rounded-md md:bg-transparent">
          <a href="https://dev.ngockhuong.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-400">Blog</a>
        </li>
        <li className="bg-gray-700 p-2 rounded-md md:bg-transparent">
          <a href="https://khuong.dev" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-400">Khuong Dev</a>
        </li>
        <li className="flex space-x-2">
          <button onClick={() => handleLanguageChange('vi')} className={`p-2 rounded-md ${language === 'vi' ? 'bg-gray-700' : 'bg-transparent'}`}>
            🇻🇳
          </button>
          <button onClick={() => handleLanguageChange('en')} className={`p-2 rounded-md ${language === 'en' ? 'bg-gray-700' : 'bg-transparent'}`}>
            🇺🇸
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Menu;

import { createContext, useContext } from 'react';

export const LanguageContext = createContext<'en' | 'vi'>('vi');

export const useLanguage = () => useContext(LanguageContext);

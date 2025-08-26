'use client';

import { useIntl } from './IntlProvider';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useIntl();

  return (
    <div className="absolute top-6 right-6 z-50">
      <div className="flex items-center gap-2 text-sm font-medium">
        <span 
          onClick={() => setLocale('en')}
          className={`cursor-pointer transition-colors font-bold ${
            locale === 'en' ? 'text-[#C1FF72]' : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          En
        </span>
        <span className="text-gray-500">/</span>
        <span 
          onClick={() => setLocale('zh-TW')}
          className={`cursor-pointer transition-colors font-bold ${
            locale === 'zh-TW' ? 'text-[#C1FF72]' : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          繁
        </span>
      </div>
    </div>
  );
} 
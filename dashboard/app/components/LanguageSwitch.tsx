'use client';

import { useState } from 'react';
import './LanguageSwitch.css';

export function LanguageSwitch(props: { initial: 'en' | 'de' }) {
  const [locale, setLocale] = useState<'en' | 'de'>(props.initial);
  const [isChanging, setIsChanging] = useState(false);

  async function toggle() {
    const newLang = locale === 'de' ? 'en' : 'de';
    setIsChanging(true);
    setLocale(newLang);
    
    try {
      await fetch('/api/lang', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ locale: newLang })
      });
      window.location.reload();
    } catch (error) {
      setIsChanging(false);
      setLocale(locale); // Revert on error
    }
  }

  return (
    <div className="lang-switch-wrapper">
      <button
        className={`lang-switch ${isChanging ? 'lang-switch-loading' : ''}`}
        onClick={toggle}
        disabled={isChanging}
        aria-label={`Switch to ${locale === 'de' ? 'English' : 'Deutsch'}`}
      >
        <span className={`lang-option ${locale === 'de' ? 'active' : ''}`}>DE</span>
        <span className={`lang-option ${locale === 'en' ? 'active' : ''}`}>EN</span>
        <span className={`lang-toggle ${locale === 'en' ? 'lang-toggle-right' : ''}`} />
      </button>
    </div>
  );
}

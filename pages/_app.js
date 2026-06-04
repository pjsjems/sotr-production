import { useState, useEffect, createContext, useContext } from 'react';
import Head from 'next/head';
import '../styles/globals.css';
import { Playfair_Display, Source_Sans_3, Source_Serif_4 } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
});

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-source-sans',
  display: 'swap',
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  variable: '--font-source-serif',
  display: 'swap',
});

// ── Language Context ────────────────────────────────────────
// Provides the active language (en/fr/es) to all components.
// Components read from this context instead of checking data-lang.
export const LangContext = createContext('en');
export function useLang() { return useContext(LangContext); }

// ── App ─────────────────────────────────────────────────────
export default function App({ Component, pageProps }) {
  const [lang, setLang] = useState('en');

  // Persist language choice across page navigations
  useEffect(() => {
    const saved = localStorage.getItem('sotr-lang');
    if (saved && ['en','fr','es'].includes(saved)) {
      setLang(saved);
      document.body.setAttribute('data-lang', saved);
    }
  }, []);

  function handleSetLang(l) {
    setLang(l);
    localStorage.setItem('sotr-lang', l);
    document.body.setAttribute('data-lang', l);
  }

  const fontClasses = `${playfair.variable} ${sourceSans.variable} ${sourceSerif.variable}`;

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>SPY ON THE RISE: Independent Publishing House</title>
        <meta
          name="description"
          content="Where Ideas Rise. Where Voices Ascend. Geopolitical essays, espionage thrillers, speculative fiction, behavioral sociology, and poetry, bilingual publishing from Fort Collins, Colorado."
        />
      </Head>
      <div className={fontClasses} style={{ display: 'contents' }}>
        <LangContext.Provider value={{ lang, setLang: handleSetLang }}>
          <Component {...pageProps} lang={lang} setLang={handleSetLang} />
        </LangContext.Provider>
      </div>
      <Analytics />
    </>
  );
}

// components/textes/LanguageSelector.jsx
// Reusable language selector for FreeText pages and Atlas series page.

const FLAG  = { fr: '🇫🇷', en: '🇺🇸', es: '🇪🇸' };
const LABEL = { fr: 'FR',   en: 'EN',   es: 'ES'   };
const ARIA  = { fr: 'Français', en: 'English', es: 'Español' };

export default function LanguageSelector({ currentLang, onChange, availableLangs = ['fr', 'en', 'es'] }) {
  return (
    <div className="lang-selector" role="group" aria-label="Language / Langue / Idioma">
      {availableLangs.map(lang => (
        <button
          key={lang}
          type="button"
          aria-pressed={currentLang === lang}
          aria-label={ARIA[lang]}
          className={`lang-selector__btn${currentLang === lang ? ' lang-selector__btn--active' : ''}`}
          onClick={() => onChange(lang)}
        >
          <span aria-hidden="true">{FLAG[lang]}</span>
          <span className="lang-selector__code">{LABEL[lang]}</span>
        </button>
      ))}
    </div>
  );
}

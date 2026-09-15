// components/textes/PodcastModal.jsx
// "Listen to this podcast" button + platform-picker modal for a Text of
// the Month. Platforms come entirely from the admin-managed
// text.podcastPlatforms map — only platforms with a saved link render.

import { useEffect } from 'react';

// Display name for each known platform key. Any key saved by the admin
// that isn't in this map still renders, capitalized, so nothing is ever
// silently dropped.
export const PLATFORM_LABELS = {
  apple: 'Apple Podcasts',
  spotify: 'Spotify',
  amazon: 'Amazon Music',
  iheart: 'iHeartRadio',
  castbox: 'Castbox',
  overcast: 'Overcast',
  pocketcasts: 'Pocket Casts',
  podcastaddict: 'Podcast Addict',
  deezer: 'Deezer',
  playerfm: 'Player FM',
  castro: 'Castro',
  goodpods: 'Goodpods',
  truefans: 'TrueFans',
};

export function platformLabel(key) {
  return PLATFORM_LABELS[key] || (key.charAt(0).toUpperCase() + key.slice(1));
}

const L = {
  en: { listen: 'Listen to this podcast', title: 'Select your platform', comingSoon: 'Podcast links coming soon.', close: 'Close' },
  fr: { listen: 'Écouter ce podcast', title: 'Choisissez votre plateforme', comingSoon: 'Liens du podcast bientôt disponibles.', close: 'Fermer' },
  es: { listen: 'Escuchar este podcast', title: 'Elige tu plataforma', comingSoon: 'Enlaces del podcast próximamente.', close: 'Cerrar' },
};

export function ListenButton({ onClick, lang = 'en', style }) {
  const t = L[lang] || L.en;
  return (
    <button type="button" onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: '#16110C', color: '#F0EDE8', border: 'none', borderRadius: 4,
        padding: '11px 22px', fontFamily: "'Source Sans 3',sans-serif", fontSize: 13,
        fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer',
        ...style,
      }}>
      <span aria-hidden="true">🎙</span>
      <span>{t.listen}</span>
    </button>
  );
}

export default function PodcastModal({ open, onClose, platforms, lang = 'en' }) {
  const t = L[lang] || L.en;

  useEffect(() => {
    if (!open) return;
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const entries = Object.entries(platforms || {}).filter(([, url]) => !!url);

  return (
    <div role="dialog" aria-modal="true" aria-label={t.title}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(22,17,12,.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: '#F8F5F0', borderRadius: 8, maxWidth: 420, width: '100%', maxHeight: '80vh', overflowY: 'auto', padding: '1.75rem', position: 'relative', fontFamily: "'Source Serif 4',Georgia,serif" }}>
        <button type="button" onClick={onClose} aria-label={t.close}
          style={{ position: 'absolute', top: 10, right: 12, background: 'none', border: 'none', fontSize: 22, color: '#6B6560', cursor: 'pointer', lineHeight: 1, padding: 4 }}>
          ×
        </button>
        <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 'clamp(17px,2.2vw,21px)', fontWeight: 700, color: '#16110C', marginBottom: '1.25rem', paddingRight: '1.5rem' }}>
          {t.title}
        </div>
        {entries.length === 0 ? (
          <p style={{ color: '#6B6560', fontSize: 14, textAlign: 'center', padding: '1rem 0' }}>{t.comingSoon}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {entries.map(([key, url]) => (
              <button key={key} type="button"
                onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', textAlign: 'left', background: '#fff', border: '1px solid #EDE8E2', borderRadius: 6, padding: '.75rem 1rem', fontSize: 14, fontWeight: 600, color: '#16110C', cursor: 'pointer', fontFamily: "'Source Sans 3',sans-serif" }}>
                <span>{platformLabel(key)}</span>
                <span style={{ color: '#7A1515', fontSize: 14 }} aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import Head from 'next/head';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const L = {
  en: {
    section: 'Text of the Month',
    heading: 'All Texts',
    sub: 'Every text published by SPY ON THE RISE, in chronological order.',
    by: 'By',
    readText: 'Read →',
    featured: 'Current',
    back: '← Text of the Month',
    empty: 'No texts published yet.',
    loading: 'Loading...',
  },
  fr: {
    section: 'Texte du mois',
    heading: 'Tous les textes',
    sub: "Tous les textes publiés par SPY ON THE RISE, dans l'ordre chronologique.",
    by: 'Par',
    readText: 'Lire →',
    featured: 'En cours',
    back: '← Texte du mois',
    empty: 'Aucun texte publié pour le moment.',
    loading: 'Chargement...',
  },
  es: {
    section: 'Texto del mes',
    heading: 'Todos los textos',
    sub: 'Todos los textos publicados por SPY ON THE RISE, en orden cronológico.',
    by: 'Por',
    readText: 'Leer →',
    featured: 'Actual',
    back: '← Texto del mes',
    empty: 'Ningún texto publicado aún.',
    loading: 'Cargando...',
  },
};

export default function TextesArchive() {
  const [lang, setLang] = useState('en');
  const [texts, setTexts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('sotr-lang') || 'en';
    if (['en', 'fr', 'es'].includes(saved)) setLang(saved);
    fetch('/api/texts?mode=archive')
      .then(r => r.json())
      .then(data => setTexts(Array.isArray(data) ? data : []))
      .catch(() => setTexts([]))
      .finally(() => setLoading(false));
  }, []);

  const labels = L[lang] || L.en;

  const sorted = [...texts].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return new Date(b.publishedAt) - new Date(a.publishedAt);
  });

  function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(
      lang === 'fr' ? 'fr-FR' : lang === 'es' ? 'es-ES' : 'en-US',
      { year: 'numeric', month: 'long' }
    );
  }

  return (
    <>
      <Head>
        <title>{labels.heading} — SPY ON THE RISE</title>
        <meta name="description" content={labels.sub} />
      </Head>

      <div style={{ background: '#F8F5F0', minHeight: '100vh', fontFamily: "'Source Serif 4', Georgia, serif" }}>

        {/* Header */}
        <div style={{ background: '#16110C', padding: '2.5rem 1.5rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: '#7A1515', marginBottom: '.5rem' }}>
            {labels.section}
          </div>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 700, color: '#F0EDE8', lineHeight: 1.15, marginBottom: '.6rem' }}>
            {labels.heading}
          </div>
          <div style={{ fontSize: 14, fontStyle: 'italic', color: '#B8B0A5', maxWidth: 480, margin: '0 auto .6rem' }}>
            {labels.sub}
          </div>

          {/* Lang switcher */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: '1rem' }}>
            {['en', 'fr', 'es'].map(l => (
              <button key={l} onClick={() => { setLang(l); localStorage.setItem('sotr-lang', l); }}
                style={{ background: lang === l ? '#7A1515' : 'transparent', color: lang === l ? '#fff' : '#B8B0A5', border: '1px solid', borderColor: lang === l ? '#7A1515' : 'rgba(255,255,255,.15)', borderRadius: 4, padding: '4px 12px', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Text list */}
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '2.5rem 1.5rem' }}>

          {loading && (
            <p style={{ textAlign: 'center', color: '#6B6560', padding: '3rem 0' }}>{labels.loading}</p>
          )}

          {!loading && sorted.length === 0 && (
            <p style={{ textAlign: 'center', color: '#6B6560', padding: '3rem 0' }}>{labels.empty}</p>
          )}

          {!loading && sorted.map((t, i) => {
            const title = t[`title_${lang}`] || t.title_en || '';
            const desc  = t[`description_${lang}`] || t.description_en || '';
            const date  = formatDate(t.publishedAt);

            return (
              <div key={t.id} className="textes-archive-item"
                style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', padding: '1.5rem 0', borderBottom: i < sorted.length - 1 ? '1px solid #E8E2D9' : 'none' }}>

                {/* Issue number */}
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: t.featured ? '#7A1515' : '#E8E2D9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: t.featured ? '#fff' : '#6B6560' }}>
                  {String(sorted.length - i).padStart(2, '0')}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '.3rem', flexWrap: 'wrap' }}>
                    {t.featured && (
                      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', background: '#7A1515', color: '#fff', padding: '2px 7px', borderRadius: 2 }}>
                        {labels.featured}
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: '#9A8F85', letterSpacing: '.06em' }}>{date}</span>
                  </div>
                  <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(16px, 2.2vw, 20px)', fontWeight: 700, color: '#16110C', lineHeight: 1.25, marginBottom: '.4rem' }}>
                    {title}
                  </div>
                  <div style={{ fontSize: 14, color: '#5A5048', lineHeight: 1.65, marginBottom: '.75rem' }}>
                    {desc}
                  </div>
                  <div style={{ fontSize: 11, color: '#9A8F85' }}>
                    {labels.by} {t.author || 'Jems S. Pompée'}
                  </div>
                </div>

                {/* Read link */}
                <Link href={`/textes?id=${t.id}`} className="textes-read-link"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: "'Source Sans 3', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '.08em', color: '#7A1515', textDecoration: 'none', border: '1px solid rgba(122,21,21,.3)', borderRadius: 4, padding: '6px 14px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {labels.readText}
                </Link>
              </div>
            );
          })}

          {/* Back link */}
          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '2px solid #7A1515', textAlign: 'center' }}>
            <Link href="/textes"
              style={{ fontSize: 13, color: '#7A1515', textDecoration: 'none', fontWeight: 600, letterSpacing: '.06em' }}>
              {labels.back}
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}

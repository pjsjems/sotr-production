// components/textes/HomepageBlocks.jsx
// Two homepage blocks:
//   <FeaturedTextBanner> — "Texte du mois" hero block
//   <AtlasSeriesBlock>   — Atlas two-tome series promo block

import Link from 'next/link';
import { urlFor } from '../../lib/queries';

const FEATURED_UI = {
  fr: { eyebrow: 'Texte du mois', cta: "Lire l'extrait gratuit", badge: 'Gratuit' },
  en: { eyebrow: 'Monthly Insight', cta: 'Read the free excerpt', badge: 'Free' },
  es: { eyebrow: 'Reflexión del mes', cta: 'Leer el extracto gratuito', badge: 'Gratis' },
};

const ATLAS_UI = {
  en: {
    eyebrow: 'New: Two-Volume Poetry Series', cta1: 'Explore the series',
    cta2: 'Buy Tome I', cta3: 'Buy Tome II',
    tomeLabel: (n) => `Tome ${n}`, poems: (n) => `${n} poems`, editions: 'EN · FR',
  },
  fr: {
    eyebrow: 'Nouveau : Série de poésie en deux volumes', cta1: 'Explorer la série',
    cta2: 'Acheter le Tome I', cta3: 'Acheter le Tome II',
    tomeLabel: (n) => `Tome ${n}`, poems: (n) => `${n} poèmes`, editions: 'EN · FR',
  },
  es: {
    eyebrow: 'Nuevo: Serie de poesía en dos volúmenes', cta1: 'Explorar la serie',
    cta2: 'Comprar Tomo I', cta3: 'Comprar Tomo II',
    tomeLabel: (n) => `Tomo ${n}`, poems: (n) => `${n} poemas`, editions: 'EN · FR',
  },
};

export function FeaturedTextBanner({ doc, lang = 'fr' }) {
  if (!doc) return null;
  const ui       = FEATURED_UI[lang] || FEATURED_UI.fr;
  const title    = doc[`title_${lang}`]    || doc.title_fr || '';
  const synopsis = doc[`synopsis_${lang}`] || doc.synopsis_fr || '';
  const coverSrc = doc.coverImage
    ? urlFor(doc.coverImage).width(600).height(400).fit('crop').url() : null;

  return (
    <section className="hp-featured" aria-label={ui.eyebrow}>
      <div className="hp-featured__inner">
        <div className="hp-featured__text">
          <p className="hp-featured__eyebrow">{ui.eyebrow}</p>
          <span className="hp-featured__badge">{ui.badge}</span>
          <h2 className="hp-featured__title">{title}</h2>
          <p className="hp-featured__author">— {doc.author}</p>
          <p className="hp-featured__synopsis">{synopsis}</p>
          <Link href={`/textes/${doc.slug.current}?lang=${lang}`} className="hp-featured__cta">{ui.cta}</Link>
        </div>
        {coverSrc && (
          <div className="hp-featured__cover" aria-hidden="true">
            <img src={coverSrc} alt={title} loading="lazy" />
          </div>
        )}
      </div>
    </section>
  );
}

export function AtlasSeriesBlock({ series, lang = 'en' }) {
  if (!series) return null;
  const ui    = ATLAS_UI[lang] || ATLAS_UI.en;
  const title = series[`seriesTitle_${lang}`]  || series.seriesTitle_en;
  const tag   = series[`seriesTagline_${lang}`] || series.seriesTagline_en;

  const cover1Src = series.tome1_cover_fr && lang === 'fr'
    ? urlFor(series.tome1_cover_fr).width(280).height(400).fit('crop').url()
    : series.tome1_cover_en ? urlFor(series.tome1_cover_en).width(280).height(400).fit('crop').url() : null;

  const cover2Src = series.tome2_cover_fr && lang === 'fr'
    ? urlFor(series.tome2_cover_fr).width(280).height(400).fit('crop').url()
    : series.tome2_cover_en ? urlFor(series.tome2_cover_en).width(280).height(400).fit('crop').url() : null;

  const t1Sub = series[`tome1_subtitle_${lang}`] || series.tome1_subtitle_en || '';
  const t2Sub = series[`tome2_subtitle_${lang}`] || series.tome2_subtitle_en || '';

  return (
    <section className="hp-atlas" aria-label={title}>
      <div className="hp-atlas__inner">
        <div className="hp-atlas__header">
          <p className="hp-atlas__eyebrow">{ui.eyebrow}</p>
          <h2 className="hp-atlas__title">{title}</h2>
          <p className="hp-atlas__tagline">{tag}</p>
          <p className="hp-atlas__editions">{ui.editions}</p>
        </div>
        <div className="hp-atlas__tomes">
          {[1, 2].map(n => {
            const coverSrc = n === 1 ? cover1Src : cover2Src;
            const sub = n === 1 ? t1Sub : t2Sub;
            const count = n === 1 ? (series.tome1_poemCount || 39) : (series.tome2_poemCount || 45);
            return (
              <div key={n} className="hp-atlas__tome">
                {coverSrc
                  ? <img src={coverSrc} alt={`${title} — ${ui.tomeLabel(n)}`} loading="lazy" className="hp-atlas__cover" />
                  : <div className="hp-atlas__cover hp-atlas__cover--placeholder"><span>{ui.tomeLabel(n)}</span></div>}
                <p className="hp-atlas__tome-label">{ui.tomeLabel(n)}</p>
                <p className="hp-atlas__tome-sub">{sub}</p>
                <p className="hp-atlas__tome-poems">{ui.poems(count)}</p>
              </div>
            );
          })}
        </div>
        <div className="hp-atlas__ctas">
          <Link href={`/series/atlas?lang=${lang}`} className="atlas-btn atlas-btn--primary">{ui.cta1}</Link>
          {series.tome1_link_amazon && (
            <a href={series.tome1_link_amazon} target="_blank" rel="noopener noreferrer" className="atlas-btn atlas-btn--secondary">{ui.cta2}</a>
          )}
          {series.tome2_link_amazon && (
            <a href={series.tome2_link_amazon} target="_blank" rel="noopener noreferrer" className="atlas-btn atlas-btn--secondary">{ui.cta3}</a>
          )}
        </div>
      </div>
    </section>
  );
}

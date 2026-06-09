// pages/series/atlas.jsx — Atlas of the Unspoken — 2-tome series page
// Route: /series/atlas?lang=en|fr|es

import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { sanityClient, ATLAS_SERIES_QUERY, isSanityConfigured, pickAtlasTome, urlFor } from '../../lib/queries';
import LanguageSelector from '../../components/textes/LanguageSelector';

const UI = {
  en: { buy:'Buy', buyOn:(s) => `Buy on ${s}`, bundle:'Buy Both Tomes', available:'Available', soon:'Coming Soon', poems:(n) => `${n} poems`, series:'Series', edition:(l) => `${l.toUpperCase()} Edition`, isbn:'ISBN', price:(p) => p ? `$${p}` : '', backLabel:'← Catalog' },
  fr: { buy:'Acheter', buyOn:(s) => `Acheter sur ${s}`, bundle:'Acheter les deux tomes', available:'Disponible', soon:'Bientôt disponible', poems:(n) => `${n} poèmes`, series:'Série', edition:(l) => `Édition ${l.toUpperCase()}`, isbn:'ISBN', price:(p) => p ? `${p} $` : '', backLabel:'← Catalogue' },
  es: { buy:'Comprar', buyOn:(s) => `Comprar en ${s}`, bundle:'Comprar ambos tomos', available:'Disponible', soon:'Próximamente', poems:(n) => `${n} poemas`, series:'Serie', edition:(l) => `Edición ${l.toUpperCase()}`, isbn:'ISBN', price:(p) => p ? `$${p}` : '', backLabel:'← Catálogo' },
};

function TomeCard({ tomeNumber, seriesTitle, lang, tome, ui }) {
  const coverSrc = tome.cover ? urlFor(tome.cover).width(400).height(560).fit('crop').url() : null;
  return (
    <div className={`atlas-tome atlas-tome--${tomeNumber}`}>
      <div className="atlas-tome__cover">
        {coverSrc
          ? <img src={coverSrc} alt={`${seriesTitle} — Tome ${tomeNumber}`} loading="lazy" />
          : <div className="atlas-tome__cover--placeholder" aria-hidden="true"><span>Tome {tomeNumber}</span></div>}
        {!tome.isAvailable && <span className="atlas-tome__soon-badge">{ui.soon}</span>}
      </div>
      <div className="atlas-tome__info">
        <p className="atlas-tome__label">Tome {tomeNumber}</p>
        <h2 className="atlas-tome__subtitle">{tome.subtitle}</h2>
        <p className="atlas-tome__poems">{ui.poems(tome.poemCount)}</p>
        <p className="atlas-tome__edition">{ui.edition(lang)}</p>
        {tome.price && <p className="atlas-tome__price">{ui.price(tome.price)}</p>}
        {tome.synopsis && <p className="atlas-tome__synopsis">{tome.synopsis}</p>}
        {tome.isbn_print && <p className="atlas-tome__isbn"><span className="atlas-tome__isbn-label">{ui.isbn}</span> {tome.isbn_print}</p>}
        {tome.isAvailable && (
          <div className="atlas-tome__links">
            {tome.links.amazon   && <a href={tome.links.amazon}   target="_blank" rel="noopener noreferrer" className="atlas-btn atlas-btn--amazon">{ui.buyOn('Amazon')}</a>}
            {tome.links.bookbaby && <a href={tome.links.bookbaby} target="_blank" rel="noopener noreferrer" className="atlas-btn atlas-btn--bookbaby">{ui.buyOn('BookBaby')}</a>}
            {tome.links.etsy     && <a href={tome.links.etsy}     target="_blank" rel="noopener noreferrer" className="atlas-btn atlas-btn--etsy">{ui.buyOn('Etsy')}</a>}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AtlasSeriesPage({ series }) {
  const router = useRouter();
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const l = router.query.lang;
    if (l && ['en','fr','es'].includes(l)) setLang(l);
  }, [router.query.lang]);

  const handleLangChange = (newLang) => {
    setLang(newLang);
    router.replace({ pathname:'/series/atlas', query:{ lang:newLang } }, undefined, { shallow:true });
  };

  if (!series) return <main className="atlas-page"><p style={{padding:'4rem',textAlign:'center'}}>Series data not yet available.</p></main>;

  const ui           = UI[lang] || UI.en;
  const seriesTitle  = series[`seriesTitle_${lang}`]   || series.seriesTitle_en;
  const tagline      = series[`seriesTagline_${lang}`]  || series.seriesTagline_en;
  const overview     = series[`seriesOverview_${lang}`] || series.seriesOverview_en;
  const genre        = series[`genre_${lang}`]          || series.genre_en;
  const seoTitle     = series[`seo_title_${lang}`]      || series.seo_title_en || seriesTitle;
  const seoDesc      = series[`seo_desc_${lang}`]       || series.seo_desc_en  || tagline;
  const ogImage      = series.seo_og_image ? urlFor(series.seo_og_image).width(1200).height(630).fit('crop').url() : '';
  const tome1        = pickAtlasTome(series, 1, lang);
  const tome2        = pickAtlasTome(series, 2, lang);

  return (
    <>
      <Head>
        <title>{`${seoTitle} — SPY ON THE RISE`}</title>
        <meta name="description" content={seoDesc} />
        <meta property="og:title" content={`${seriesTitle} — SPY ON THE RISE`} />
        <meta property="og:description" content={tagline} />
        <meta property="og:type" content="book" />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <link rel="canonical" href={`https://spyontherise.com/series/atlas?lang=${lang}`} />
      </Head>
      <main className="atlas-page">
        <nav className="atlas-page__nav">
          <Link href={`/?lang=${lang}`} className="atlas-page__back">{ui.backLabel}</Link>
        </nav>
        <header className="atlas-page__header">
          <p className="atlas-page__eyebrow">{ui.series} · {genre} · {series.totalPoems} {ui.poems(series.totalPoems).split(' ')[1]}</p>
          <h1 className="atlas-page__series-title">{seriesTitle}</h1>
          <p className="atlas-page__tagline">{tagline}</p>
          <p className="atlas-page__author">— {series.author}</p>
          <LanguageSelector currentLang={lang} onChange={handleLangChange}
            availableLangs={series.languages?.map(l => l.toLowerCase()).filter(l => ['en','fr','es'].includes(l)) || ['en','fr']} />
        </header>
        {overview && <section className="atlas-page__overview"><p>{overview}</p></section>}
        <section className="atlas-page__tomes" aria-label="Volumes">
          <TomeCard tomeNumber={1} seriesTitle={seriesTitle} lang={lang} tome={tome1} ui={ui} />
          <TomeCard tomeNumber={2} seriesTitle={seriesTitle} lang={lang} tome={tome2} ui={ui} />
        </section>
        {series.bundle_link && (
          <section className="atlas-page__bundle">
            {series.bundle_price && <p className="atlas-page__bundle-price">{ui.price(series.bundle_price)}</p>}
            <a href={series.bundle_link} target="_blank" rel="noopener noreferrer" className="atlas-btn atlas-btn--bundle">{ui.bundle}</a>
          </section>
        )}
      </main>
    </>
  );
}

export async function getStaticProps() {
  if (!isSanityConfigured()) return { props:{ series:null }, revalidate:300 };
  try {
    const series = await sanityClient.fetch(ATLAS_SERIES_QUERY);
    return { props:{ series: series||null }, revalidate:300 };
  } catch { return { props:{ series:null }, revalidate:300 }; }
}

// pages/textes/index.jsx — "Texte du mois" list page
// Route: /textes?lang=fr|en|es

import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { sanityClient, ALL_FREE_TEXTS_QUERY, isSanityConfigured, urlFor } from '../../lib/queries';
import LanguageSelector from '../../components/textes/LanguageSelector';

const UI = {
  fr: { sectionDefault:'Texte du mois', badge:'Gratuit', cta:"Lire l'extrait", pageTitle:'Textes gratuits', metaDesc:'Réflexions et textes courts offerts gratuitement par les auteurs de SPY ON THE RISE.', noTexts:'Aucun texte publié pour le moment. Revenez bientôt.' },
  en: { sectionDefault:'Monthly Insight', badge:'Free', cta:'Read the excerpt', pageTitle:'Free Texts', metaDesc:'Short reflections and texts offered free by the authors of SPY ON THE RISE.', noTexts:'No texts published yet. Check back soon.' },
  es: { sectionDefault:'Reflexión del mes', badge:'Gratis', cta:'Leer el extracto', pageTitle:'Textos gratuitos', metaDesc:'Reflexiones y textos cortos ofrecidos gratuitamente por los autores de SPY ON THE RISE.', noTexts:'Aún no hay textos publicados. Vuelve pronto.' },
};

function TextCard({ doc, lang }) {
  const title    = doc[`title_${lang}`]    || doc.title_fr || '';
  const synopsis = doc[`synopsis_${lang}`] || doc.synopsis_fr || '';
  const ui = UI[lang] || UI.fr;
  return (
    <div className="text-card">
      <div className="text-card__cover">
        {doc.coverImage
          ? <img src={urlFor(doc.coverImage).width(400).height(240).fit('crop').url()} alt={title} loading="lazy" />
          : <div className="text-card__cover--placeholder" aria-hidden="true" />}
        <span className="text-card__badge">{ui.badge}</span>
        {doc.is_featured && <span className="text-card__featured">★</span>}
      </div>
      <div className="text-card__body">
        <div className="text-card__langs" aria-label="Available languages">
          {['en','fr','es'].filter(l => !!(doc[`title_${l}`])).map(l => (
            <span key={l} className={`text-card__lang-pill text-card__lang-pill--${l}`}>{l.toUpperCase()}</span>
          ))}
        </div>
        <h2 className="text-card__title">{title}</h2>
        <p className="text-card__author">{doc.author}</p>
        <p className="text-card__synopsis">{synopsis}</p>
        <Link href={`/textes/${doc.slug.current}?lang=${lang}`} className="text-card__cta">{ui.cta}</Link>
      </div>
    </div>
  );
}

export default function TextesPage({ texts, sectionLabel }) {
  const router = useRouter();
  const [lang, setLang] = useState('fr');

  useEffect(() => {
    const l = router.query.lang;
    if (l && ['fr','en','es'].includes(l)) setLang(l);
  }, [router.query.lang]);

  const handleLangChange = (newLang) => {
    setLang(newLang);
    router.replace({ pathname:'/textes', query:{ lang:newLang } }, undefined, { shallow:true });
  };

  const ui    = UI[lang] || UI.fr;
  const label = sectionLabel || ui.sectionDefault;

  return (
    <>
      <Head>
        <title>{`${label} — SPY ON THE RISE`}</title>
        <meta name="description" content={ui.metaDesc} />
        <meta property="og:title" content={`${label} — SPY ON THE RISE`} />
        <meta property="og:description" content={ui.metaDesc} />
        <meta property="og:type" content="website" />
      </Head>
      <main className="textes-page">
        <header className="textes-page__header">
          <p className="textes-page__eyebrow">SPY ON THE RISE</p>
          <h1 className="textes-page__title">{label}</h1>
          <LanguageSelector currentLang={lang} onChange={handleLangChange} />
        </header>
        {texts.length === 0
          ? <p className="textes-page__empty">{ui.noTexts}</p>
          : <div className="textes-page__grid">{texts.map(doc => <TextCard key={doc._id} doc={doc} lang={lang} />)}</div>
        }
      </main>
    </>
  );
}

export async function getStaticProps() {
  if (!isSanityConfigured()) return { props: { texts:[], sectionLabel:null }, revalidate:60 };
  try {
    const [texts, settings] = await Promise.all([
      sanityClient.fetch(ALL_FREE_TEXTS_QUERY),
      sanityClient.fetch(`*[_type == "siteSettings"][0]{ freeTextSectionLabel }`).catch(() => null),
    ]);
    return { props: { texts: texts||[], sectionLabel: settings?.freeTextSectionLabel||null }, revalidate:60 };
  } catch { return { props: { texts:[], sectionLabel:null }, revalidate:60 }; }
}

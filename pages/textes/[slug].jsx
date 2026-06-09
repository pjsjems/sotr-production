// pages/textes/[slug].jsx — Individual free text page
// Route: /textes/[slug]?lang=fr|en|es

import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { PortableText } from '@portabletext/react';
import { sanityClient, FREE_TEXT_BY_SLUG_QUERY, FREE_TEXT_SLUGS_QUERY, isSanityConfigured, pickLang, urlFor } from '../../lib/queries';
import LanguageSelector from '../../components/textes/LanguageSelector';
import EmailCaptureModal from '../../components/textes/EmailCaptureModal';

const REVEAL_INLINE = false;

const UI = {
  fr: { badge:'Gratuit', readCta:'Lire le texte complet', backLink:'← Tous les textes', by:'par', previewLabel:'Extrait' },
  en: { badge:'Free', readCta:'Read the full text', backLink:'← All texts', by:'by', previewLabel:'Excerpt' },
  es: { badge:'Gratis', readCta:'Leer el texto completo', backLink:'← Todos los textos', by:'por', previewLabel:'Extracto' },
};

export default function TextePage({ doc }) {
  const router  = useRouter();
  const [lang, setLang]         = useState('fr');
  const [modalOpen, setModal]   = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const l = router.query.lang;
    if (l && ['fr','en','es'].includes(l)) setLang(l);
  }, [router.query.lang]);

  const handleLangChange = (newLang) => {
    setLang(newLang);
    router.replace({ pathname:`/textes/${doc.slug.current}`, query:{ lang:newLang } }, undefined, { shallow:true });
  };

  const { title, subtitle, synopsis, preview, full, seoTitle, seoDesc } = pickLang(doc, lang);
  const ui      = UI[lang] || UI.fr;
  const ogImage = doc.coverImage ? urlFor(doc.coverImage).width(1200).height(630).fit('crop').url() : '';

  return (
    <>
      <Head>
        <title>{`${seoTitle || title} — SPY ON THE RISE`}</title>
        <meta name="description" content={seoDesc || synopsis} />
        <meta property="og:title" content={`${title} — SPY ON THE RISE`} />
        <meta property="og:description" content={synopsis} />
        <meta property="og:type" content="article" />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <link rel="canonical" href={`https://spyontherise.com/textes/${doc.slug.current}?lang=${lang}`} />
      </Head>
      <main className="text-page">
        <nav className="text-page__nav">
          <a href={`/textes?lang=${lang}`} className="text-page__back">{ui.backLink}</a>
        </nav>
        {doc.coverImage && (
          <div className="text-page__cover">
            <img src={urlFor(doc.coverImage).width(900).height(400).fit('crop').url()} alt={title} className="text-page__cover-img" />
          </div>
        )}
        <header className="text-page__header">
          <span className="text-page__badge">{ui.badge}</span>
          <h1 className="text-page__title">{title}</h1>
          {subtitle && <p className="text-page__subtitle">{subtitle}</p>}
          <p className="text-page__author">{ui.by} {doc.author}</p>
          <LanguageSelector currentLang={lang} onChange={handleLangChange}
            availableLangs={['fr','en','es'].filter(l => !!(doc[`title_${l}`]))} />
        </header>
        <section className="text-page__synopsis" aria-label="Synopsis"><p>{synopsis}</p></section>
        <section className="text-page__preview" aria-label={ui.previewLabel}>
          <PortableText value={preview} />
          <div className="text-page__fade" aria-hidden="true" />
        </section>
        {!unlocked && (
          <div className="text-page__cta-wrap">
            <button className="text-page__cta" onClick={() => setModal(true)}>{ui.readCta}</button>
          </div>
        )}
        {unlocked && REVEAL_INLINE && (
          <section className="text-page__full" aria-label="Full text"><PortableText value={full} /></section>
        )}
        <EmailCaptureModal
          isOpen={modalOpen} onClose={() => setModal(false)}
          onSuccess={() => { setModal(false); if (REVEAL_INLINE) setUnlocked(true); }}
          slug={doc.slug.current} lang={lang} title={title}
        />
      </main>
    </>
  );
}

export async function getStaticPaths() {
  if (!isSanityConfigured()) return { paths:[], fallback:'blocking' };
  try {
    const docs  = await sanityClient.fetch(FREE_TEXT_SLUGS_QUERY);
    const paths = docs.flatMap(({ slug }) =>
      ['fr','en','es'].map(lang => ({ params:{ slug }, locale:undefined }))
    );
    return { paths, fallback:'blocking' };
  } catch { return { paths:[], fallback:'blocking' }; }
}

export async function getStaticProps({ params }) {
  if (!isSanityConfigured()) return { notFound:true };
  try {
    const doc = await sanityClient.fetch(FREE_TEXT_BY_SLUG_QUERY, { slug: params.slug });
    if (!doc) return { notFound:true };
    return { props:{ doc }, revalidate:60 };
  } catch { return { notFound:true }; }
}

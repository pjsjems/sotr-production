import Head from 'next/head';
import Link from 'next/link';
import { useLang } from '../_app';

function t(obj, lang) { return obj[lang] || obj.en || ''; }

function formatDate(dateStr, lang) {
  const d = new Date(dateStr);
  const opts = { year: 'numeric', month: 'long', day: 'numeric' };
  const locale = lang === 'fr' ? 'fr-FR' : lang === 'es' ? 'es-ES' : 'en-US';
  return d.toLocaleDateString(locale, opts);
}

function BlogNav({ lang, setLang }) {
  return (
    <nav className="blog-topnav">
      <div className="wrap blog-topnav-inner">
        <Link href="/" className="blog-topnav-logo">
          <span className="blog-topnav-brand">SPY ON THE RISE</span>
          <span className="blog-topnav-sub">
            {lang === 'fr' ? 'Maison d\'Édition Indépendante' : lang === 'es' ? 'Editorial Independiente' : 'Independent Publishing House'}
          </span>
        </Link>
        <div className="blog-topnav-right">
          <Link href="/" className="blog-back-link">
            {lang === 'fr' ? '← Catalogue' : lang === 'es' ? '← Catálogo' : '← Catalog'}
          </Link>
          <div className="lang-switch">
            <button className={`lang-btn${lang === 'en' ? ' active' : ''}`} onClick={() => setLang('en')}>EN</button>
            <button className={`lang-btn${lang === 'fr' ? ' active' : ''}`} onClick={() => setLang('fr')}>FR</button>
            <button className={`lang-btn${lang === 'es' ? ' active' : ''}`} onClick={() => setLang('es')}>ES</button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function BlogIndex({ posts }) {
  const { lang, setLang } = useLang();
  const activeLang = lang || 'en';

  const labels = {
    en: { heading: 'Author Notes', sub: 'Editorial writing from Jems S. Pompée: on craft, publishing, and the analytical work behind SPY ON THE RISE.', readMore: 'Read →', by: 'By' },
    fr: { heading: 'Notes de l\'Auteur', sub: 'Écrits éditoriaux de Jems S. Pompée: sur l\'écriture, l\'édition et le travail analytique derrière SPY ON THE RISE.', readMore: 'Lire →', by: 'Par' },
    es: { heading: 'Notas del Autor', sub: 'Escritura editorial de Jems S. Pompée: sobre el oficio, la publicación y el trabajo analítico detrás de SPY ON THE RISE.', readMore: 'Leer →', by: 'Por' },
  };
  const l = labels[activeLang] || labels.en;

  return (
    <>
      <Head>
        <title>Author Notes : SPY ON THE RISE</title>
        <meta name="description" content={l.sub} />
        <meta property="og:title" content="Author Notes : SPY ON THE RISE" />
        <meta property="og:description" content={l.sub} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://spyontherise.com/blog" />
      </Head>

      <BlogNav lang={activeLang} setLang={setLang} />

      <main className="blog-main">
        <div className="blog-hero">
          <div className="wrap">
            <p className="bh-label">◆ {activeLang === 'fr' ? 'Éditorial' : activeLang === 'es' ? 'Editorial' : 'Editorial'}</p>
            <h1 className="bh-title" style={{ maxWidth: '640px' }}>{l.heading}</h1>
            <p className="bh-desc" style={{ maxWidth: '560px' }}>{l.sub}</p>
          </div>
        </div>

        <section className="press-section">
          <div className="wrap">
            <div className="blog-list">
              {posts.map((post) => (
                <article key={post.slug} className="blog-list-card">
                  <div className="blc-meta">
                    <span className="blc-date">{formatDate(post.date, activeLang)}</span>
                    <span className="blc-author">{l.by} {post.author}</span>
                    <div className="blc-tags">
                      {post.tags.map(tag => <span key={tag} className="blc-tag">{tag}</span>)}
                    </div>
                  </div>
                  <div className="blc-body">
                    <h2 className="blc-title">{t(post.title, activeLang)}</h2>
                    <p className="blc-excerpt">{t(post.excerpt, activeLang)}</p>
                    <Link href={`/blog/${post.slug}`} className="blc-read">{l.readMore}</Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="blog-footer">
        <div className="wrap">
          <div className="blog-footer-inner">
            <span className="blog-footer-brand">SPY ON THE RISE</span>
            <Link href="/" className="blog-back-link">
              {activeLang === 'fr' ? '← Retour au Catalogue' : activeLang === 'es' ? '← Volver al Catálogo' : '← Back to Catalog'}
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}

export async function getStaticProps() {
  const { POSTS } = require('../../data/posts.js');
  return {
    props: {
      posts: POSTS.map(p => ({
        slug: p.slug,
        date: p.date,
        author: p.author,
        tags: p.tags,
        title: p.title,
        excerpt: p.excerpt,
      })),
    },
  };
}

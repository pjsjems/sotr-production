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

function BlogNav({ lang, setLang, backLabel }) {
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
          <Link href="/blog" className="blog-back-link">{backLabel}</Link>
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

export default function BlogPost({ post }) {
  const { lang, setLang } = useLang();
  const activeLang = lang || 'en';

  const labels = {
    en: { back: '← All Notes', by: 'By', tags: 'Filed under', backCatalog: '← Back to Catalog' },
    fr: { back: '← Toutes les Notes', by: 'Par', tags: 'Classé sous', backCatalog: '← Retour au Catalogue' },
    es: { back: '← Todas las Notas', by: 'Por', tags: 'Archivado en', backCatalog: '← Volver al Catálogo' },
  };
  const l = labels[activeLang] || labels.en;

  const title = t(post.title, activeLang);
  const excerpt = t(post.excerpt, activeLang);
  const paragraphs = t(post.content, activeLang);

  return (
    <>
      <Head>
        <title>{title} : SPY ON THE RISE</title>
        <meta name="description" content={excerpt} />
        <meta property="og:title" content={`${title} : SPY ON THE RISE`} />
        <meta property="og:description" content={excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://spyontherise.com/blog/${post.slug}`} />
        <meta property="article:author" content={post.author} />
        <meta property="article:published_time" content={post.date} />
      </Head>

      <BlogNav lang={activeLang} setLang={setLang} backLabel={l.back} />

      <main className="blog-main">
        <article className="blog-post">
          <header className="blog-post-header">
            <div className="wrap">
              <div className="blog-post-meta">
                <span className="blc-date">{formatDate(post.date, activeLang)}</span>
                <span className="blc-author">{l.by} {post.author}</span>
              </div>
              <h1 className="blog-post-title">{title}</h1>
              <p className="blog-post-excerpt">{excerpt}</p>
              <div className="blc-tags" style={{ marginTop: '1rem' }}>
                <span className="blog-tags-label">{l.tags}: </span>
                {post.tags.map(tag => <span key={tag} className="blc-tag">{tag}</span>)}
              </div>
            </div>
          </header>

          <div className="blog-post-body">
            <div className="wrap blog-post-content">
              {paragraphs.map((para, i) => (
                <p key={i} className="blog-post-para">{para}</p>
              ))}
            </div>
          </div>

          <footer className="blog-post-footer">
            <div className="wrap">
              <div className="blog-post-author-card">
                <div className="bpac-monogram">JP</div>
                <div>
                  <div className="bpac-name">{post.author}</div>
                  <div className="bpac-title">
                    {activeLang === 'fr' ? 'Auteur · Directeur de Série · SPY ON THE RISE' : activeLang === 'es' ? 'Autor · Director de Serie · SPY ON THE RISE' : 'Author · Series Director · SPY ON THE RISE'}
                  </div>
                  <Link href="/" className="bpac-link">
                    {activeLang === 'fr' ? 'Retour au Catalogue →' : activeLang === 'es' ? 'Volver al Catálogo →' : 'Back to Catalog →'}
                  </Link>
                </div>
              </div>
              <div className="blog-post-nav">
                <Link href="/blog" className="btn btn-ghost" style={{ display: 'inline-flex' }}>{l.back}</Link>
                <Link href="/" className="blog-back-link" style={{ marginLeft: '1.5rem' }}>{l.backCatalog}</Link>
              </div>
            </div>
          </footer>
        </article>
      </main>
    </>
  );
}

export async function getStaticPaths() {
  const { POSTS } = require('../../data/posts.js');
  return {
    paths: POSTS.map(p => ({ params: { slug: p.slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const { POSTS } = require('../../data/posts.js');
  const post = POSTS.find(p => p.slug === params.slug);
  if (!post) return { notFound: true };
  return { props: { post } };
}

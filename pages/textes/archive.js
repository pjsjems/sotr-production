import Head from 'next/head';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import PodcastModal, { ListenButton } from '../../components/textes/PodcastModal';

const L = {
  en: { heading:'All Texts', sub:'Browse all texts published by SPY ON THE RISE, grouped by category.', by:'By', read:'Read', current:'Current', currentTitle:'Text of the Month', archivesTitle:'Archives', archivesSub:'Past texts of the month.', back:'Back to Text of the Month', home:'Return to Home', empty:'No texts published yet.', noArchives:'No past texts yet, check back after next month’s feature.', uncategorized:'Uncategorized' },
  fr: { heading:'Tous les textes', sub:'Parcourez tous les textes publiés par SPY ON THE RISE, regroupés par catégorie.', by:'Par', read:'Lire', current:'En cours', currentTitle:'Texte du mois', archivesTitle:'Archives', archivesSub:'Textes du mois précédents.', back:'Retour au texte du mois', home:'Retour à l’accueil', empty:'Aucun texte publié.', noArchives:'Aucun texte archivé pour le moment, revenez après le prochain texte du mois.', uncategorized:'Non classé' },
  es: { heading:'Todos los textos', sub:'Consulte todos los textos publicados por SPY ON THE RISE, agrupados por categoría.', by:'Por', read:'Leer', current:'Actual', currentTitle:'Texto del mes', archivesTitle:'Archivo', archivesSub:'Textos del mes anteriores.', back:'Volver al texto del mes', home:'Volver al inicio', empty:'Ningún texto publicado.', noArchives:'Todavía no hay textos archivados, vuelve después del próximo texto del mes.', uncategorized:'Sin categoría' },
};

export default function TextesArchive() {
  const [lang, setLang] = useState('en');
  const [allTexts, setAllTexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [podcastFor, setPodcastFor] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('sotr-lang') || 'en';
    if (['en','fr','es'].includes(saved)) setLang(saved);
    fetch('/api/texts?mode=archive')
      .then(r => r.json())
      .then(data => setAllTexts(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const labels = L[lang] || L.en;

  const current = allTexts.find(t => t.featured);

  // Group the non-featured (past) texts by this language's category
  // (falls back to EN, then legacy flat field) so switching language
  // re-labels categories without losing any previously published text.
  const groups = {};
  [...allTexts]
    .filter(t => !t.featured)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .forEach(t => {
      const cat = t[`category_${lang}`] || t.category_en || t.category || 'Uncategorized';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(t);
    });
  const hasArchives = Object.keys(groups).length > 0;

  function fmtDate(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString(
      lang === 'fr' ? 'fr-FR' : lang === 'es' ? 'es-ES' : 'en-US',
      { year:'numeric', month:'long' }
    );
  }

  function textRow(t) {
    const title = t[`title_${lang}`] || t.title_en || '';
    const desc  = t[`description_${lang}`] || t.description_en || '';
    return (
      <div key={t.id} style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'1rem', background:'#fff', borderRadius:6, border:'1px solid #EDE8E2', padding:'1rem 1.25rem' }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:11, color:'#9A8F85', marginBottom:'.25rem' }}>{fmtDate(t.publishedAt)}</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(15px,2vw,18px)', fontWeight:700, color:'#16110C', lineHeight:1.3, marginBottom:'.3rem' }}>{title}</div>
          <div style={{ fontSize:13, color:'#6B6560', lineHeight:1.6 }}>{desc}</div>
          <div style={{ fontSize:11, color:'#9A8F85', marginTop:'.3rem' }}>{labels.by} {t.author || 'Jems S. Pompee'}</div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6, flexShrink:0 }}>
          <Link href={`/textes/read/${t.id}`}
            style={{ fontSize:12, fontWeight:700, color:'#7A1515', textDecoration:'none', border:'1px solid rgba(122,21,21,.3)', borderRadius:4, padding:'7px 14px', letterSpacing:'.07em', whiteSpace:'nowrap' }}>
            {labels.read} →
          </Link>
          <ListenButton lang={lang} onClick={() => setPodcastFor(t)}
            style={{ padding:'7px 14px', fontSize:11 }} />
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{labels.heading}: SPY ON THE RISE</title>
        <meta name="description" content={labels.sub} />
      </Head>
      <div style={{ background:'#F8F5F0', minHeight:'100vh', fontFamily:"'Source Serif 4',Georgia,serif" }}>
        <div style={{ background:'#16110C', padding:'2.5rem 1.5rem 2rem', textAlign:'center' }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(26px,4vw,40px)', fontWeight:700, color:'#F0EDE8', marginBottom:'.6rem' }}>
            {labels.heading}
          </div>
          <div style={{ fontSize:14, fontStyle:'italic', color:'#B8B0A5', maxWidth:480, margin:'0 auto .6rem' }}>
            {labels.sub}
          </div>
          <div style={{ display:'flex', gap:8, justifyContent:'center', marginTop:'1rem' }}>
            {['en','fr','es'].map(l => (
              <button key={l} onClick={() => { setLang(l); localStorage.setItem('sotr-lang', l); }}
                style={{ background:lang===l?'#7A1515':'transparent', color:lang===l?'#fff':'#B8B0A5', border:'1px solid', borderColor:lang===l?'#7A1515':'rgba(255,255,255,.15)', borderRadius:4, padding:'4px 12px', fontSize:11, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', cursor:'pointer' }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div style={{ maxWidth:760, margin:'0 auto', padding:'2.5rem 1.5rem' }}>
          {loading && <p style={{ textAlign:'center', color:'#6B6560', padding:'3rem 0' }}>Loading...</p>}
          {!loading && !current && !hasArchives && (
            <p style={{ textAlign:'center', color:'#6B6560', padding:'3rem 0' }}>{labels.empty}</p>
          )}

          {/* ── CURRENT: TEXT OF THE MONTH ──────────── */}
          {!loading && current && (
            <div style={{ marginBottom:'3rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:'1.25rem' }}>
                <div style={{ height:2, width:32, background:'#7A1515', flexShrink:0 }} />
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(16px,2vw,20px)', fontWeight:700, color:'#16110C', letterSpacing:'.01em' }}>
                  {labels.currentTitle}
                </div>
              </div>
              <div style={{ background:'#fff', borderRadius:6, border:'1.5px solid #7A1515', padding:'1.25rem 1.5rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'.4rem', flexWrap:'wrap' }}>
                  <span style={{ fontSize:9, fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase', background:'#7A1515', color:'#fff', padding:'2px 7px', borderRadius:2 }}>{labels.current}</span>
                  <span style={{ fontSize:11, color:'#9A8F85' }}>{fmtDate(current.publishedAt)}</span>
                </div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(18px,2.4vw,24px)', fontWeight:700, color:'#16110C', lineHeight:1.3, marginBottom:'.4rem' }}>
                  {current[`title_${lang}`] || current.title_en || ''}
                </div>
                <div style={{ fontSize:14, color:'#6B6560', lineHeight:1.6, marginBottom:'.5rem' }}>
                  {current[`description_${lang}`] || current.description_en || ''}
                </div>
                <div style={{ fontSize:11, color:'#9A8F85', marginBottom:'1rem' }}>{labels.by} {current.author || 'Jems S. Pompee'}</div>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  <Link href="/textes"
                    style={{ fontSize:12, fontWeight:700, color:'#fff', background:'#7A1515', textDecoration:'none', borderRadius:4, padding:'9px 18px', letterSpacing:'.07em' }}>
                    {labels.read} →
                  </Link>
                  <ListenButton lang={lang} onClick={() => setPodcastFor(current)} />
                </div>
              </div>
            </div>
          )}

          {/* ── ARCHIVES: PAST TEXTS OF THE MONTH ───── */}
          {!loading && (current || hasArchives) && (
            <div style={{ marginBottom:'1rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:'.25rem' }}>
                <div style={{ height:2, width:32, background:'#7A1515', flexShrink:0 }} />
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(16px,2vw,20px)', fontWeight:700, color:'#16110C', letterSpacing:'.01em' }}>
                  {labels.archivesTitle}
                </div>
              </div>
              <div style={{ fontSize:12, color:'#9A8F85', marginBottom:'1.25rem', marginLeft:44 }}>{labels.archivesSub}</div>

              {!hasArchives && (
                <p style={{ color:'#9A8F85', fontSize:13, fontStyle:'italic', padding:'.5rem 0 1rem' }}>{labels.noArchives}</p>
              )}

              {Object.entries(groups).map(([category, texts]) => (
                <div key={category} style={{ marginBottom:'2rem' }}>
                  <div style={{ fontSize:12, fontWeight:700, letterSpacing:'.05em', color:'#7A1515', marginBottom:'.75rem' }}>
                    {category === 'Uncategorized' ? labels.uncategorized : category}
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
                    {texts.map(textRow)}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop:'2.5rem', paddingTop:'1.5rem', borderTop:'2px solid #7A1515', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
            <Link href="/textes"
              style={{ fontSize:13, color:'#7A1515', textDecoration:'none', fontWeight:600, letterSpacing:'.06em' }}>
              ← {labels.back}
            </Link>
            <Link href="/"
              style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:12, fontWeight:700, color:'#7A1515', textDecoration:'none', border:'1px solid rgba(122,21,21,.3)', borderRadius:4, padding:'9px 18px', letterSpacing:'.07em', textTransform:'uppercase', fontFamily:"'Source Sans 3',sans-serif" }}>
              {labels.home}
            </Link>
          </div>
        </div>
      </div>

      <PodcastModal open={!!podcastFor} onClose={() => setPodcastFor(null)} platforms={podcastFor?.podcastPlatforms} lang={lang} />
    </>
  );
}

import Head from 'next/head';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const L = {
  en: { heading:'All Texts', sub:'Browse all texts published by SPY ON THE RISE, grouped by category.', by:'By', read:'Read', featured:'Current', back:'Back to Text of the Month', empty:'No texts published yet.', uncategorized:'Uncategorized' },
  fr: { heading:'Tous les textes', sub:'Parcourez tous les textes publiés par SPY ON THE RISE, regroupés par catégorie.', by:'Par', read:'Lire', featured:'En cours', back:'Retour au texte du mois', empty:'Aucun texte publié.', uncategorized:'Non classé' },
  es: { heading:'Todos los textos', sub:'Consulte todos los textos publicados por SPY ON THE RISE, agrupados por categoría.', by:'Por', read:'Leer', featured:'Actual', back:'Volver al texto del mes', empty:'Ningún texto publicado.', uncategorized:'Sin categoría' },
};

export default function TextesArchive() {
  const [lang, setLang] = useState('en');
  const [allTexts, setAllTexts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('sotr-lang') || 'en';
    if (['en','fr','es'].includes(saved)) setLang(saved);
    fetch('/api/texts?mode=archive')
      .then(r => r.json())
      .then(data => setAllTexts(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Group by this language's category (falls back to EN, then legacy
  // flat field) so switching language re-labels categories without
  // losing any previously published Text of the Month.
  const groups = {};
  [...allTexts]
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    })
    .forEach(t => {
      const cat = t[`category_${lang}`] || t.category_en || t.category || 'Uncategorized';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(t);
    });

  const labels = L[lang] || L.en;

  function fmtDate(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString(
      lang === 'fr' ? 'fr-FR' : lang === 'es' ? 'es-ES' : 'en-US',
      { year:'numeric', month:'long' }
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
          {!loading && Object.keys(groups).length === 0 && (
            <p style={{ textAlign:'center', color:'#6B6560', padding:'3rem 0' }}>{labels.empty}</p>
          )}

          {!loading && Object.entries(groups).map(([category, texts]) => (
            <div key={category} style={{ marginBottom:'3rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:'1.25rem' }}>
                <div style={{ height:2, width:32, background:'#7A1515', flexShrink:0 }} />
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(16px,2vw,20px)', fontWeight:700, color:'#16110C', letterSpacing:'.01em' }}>
                  {category === 'Uncategorized' ? labels.uncategorized : category}
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
                {texts.map(t => {
                  const title = t[`title_${lang}`] || t.title_en || '';
                  const desc  = t[`description_${lang}`] || t.description_en || '';
                  return (
                    <div key={t.id} style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'1rem', background:'#fff', borderRadius:6, border:'1px solid #EDE8E2', padding:'1rem 1.25rem' }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'.25rem', flexWrap:'wrap' }}>
                          {t.featured && <span style={{ fontSize:9, fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase', background:'#7A1515', color:'#fff', padding:'2px 7px', borderRadius:2 }}>{labels.featured}</span>}
                          <span style={{ fontSize:11, color:'#9A8F85' }}>{fmtDate(t.publishedAt)}</span>
                        </div>
                        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(15px,2vw,18px)', fontWeight:700, color:'#16110C', lineHeight:1.3, marginBottom:'.3rem' }}>{title}</div>
                        <div style={{ fontSize:13, color:'#6B6560', lineHeight:1.6 }}>{desc}</div>
                        <div style={{ fontSize:11, color:'#9A8F85', marginTop:'.3rem' }}>{labels.by} {t.author || 'Jems S. Pompee'}</div>
                      </div>
                      <Link href={`/textes/read/${t.id}`}
                        style={{ flexShrink:0, fontSize:12, fontWeight:700, color:'#7A1515', textDecoration:'none', border:'1px solid rgba(122,21,21,.3)', borderRadius:4, padding:'7px 14px', letterSpacing:'.07em', whiteSpace:'nowrap' }}>
                        {labels.read} →
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div style={{ marginTop:'2.5rem', paddingTop:'1.5rem', borderTop:'2px solid #7A1515', textAlign:'center' }}>
            <Link href="/textes" style={{ fontSize:13, color:'#7A1515', textDecoration:'none', fontWeight:600, letterSpacing:'.06em' }}>
              {labels.back}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

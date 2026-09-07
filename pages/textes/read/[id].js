import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const L = {
  en: { by:'By', readFull:'Read the full text', emailPlaceholder:'your@email.com', emailBtn:'Send me the full text', emailHint:'Enter your email to read the complete text. One-time send, no spam.', success:'The full text is now displayed below.', errorEmail:'Please enter a valid email address.', errorFetch:'Something went wrong. Please try again.', back:'All texts', backFeatured:'Text of the Month', download:'Download PDF', category:'Category' },
  fr: { by:'Par', readFull:'Lire le texte complet', emailPlaceholder:'votre@email.com', emailBtn:"M'envoyer le texte complet", emailHint:'Entrez votre email pour lire le texte complet. Envoi unique, sans spam.', success:'Le texte complet est maintenant affiché ci-dessous.', errorEmail:'Veuillez entrer une adresse email valide.', errorFetch:"Une erreur s'est produite. Veuillez réessayer.", back:'Tous les textes', backFeatured:'Texte du mois', download:'Télécharger PDF', category:'Catégorie' },
  es: { by:'Por', readFull:'Leer el texto completo', emailPlaceholder:'tu@email.com', emailBtn:'Enviarme el texto completo', emailHint:'Ingresa tu email para leer el texto completo. Un solo envío, sin spam.', success:'El texto completo se muestra ahora a continuación.', errorEmail:'Por favor ingresa un email válido.', errorFetch:'Algo salió mal. Por favor intenta de nuevo.', back:'Todos los textos', backFeatured:'Texto del mes', download:'Descargar PDF', category:'Categoría' },
};

export default function TextReadPage() {
  const router = useRouter();
  const { id } = router.query;
  const [lang, setLang] = useState('en');
  const [text, setText] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [emailMsg, setEmailMsg] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [fullText, setFullText] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('sotr-lang') || 'en';
    if (['en','fr','es'].includes(saved)) setLang(saved);
  }, []);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/texts?id=${id}`)
      .then(r => r.json())
      .then(d => { setText(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (!id || loading) return (
    <div style={{ minHeight:'100vh', background:'#F8F5F0', display:'flex', alignItems:'center', justifyContent:'center', color:'#6B6560', fontFamily:"'Source Serif 4',serif" }}>
      Loading...
    </div>
  );

  if (!text || text.error) return (
    <div style={{ minHeight:'100vh', background:'#F8F5F0', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'1rem' }}>
      <p style={{ color:'#6B6560', fontFamily:"'Source Serif 4',serif" }}>Text not found.</p>
      <Link href="/textes/archive" style={{ color:'#7A1515', fontWeight:600 }}>All texts</Link>
    </div>
  );

  const labels = L[lang] || L.en;
  const title    = text[`title_${lang}`]    || text.title_en    || '';
  const sub      = text[`subtitle_${lang}`] || text.subtitle_en || '';
  const preview  = text[`preview_${lang}`]  || text.preview_en  || '';
  const category = text[`category_${lang}`] || text.category_en || text.category || '';
  const hasAtt   = lang === 'en' ? !!(text.hasAttachment_en ?? text.hasAttachment) : !!text[`hasAttachment_${lang}`];
  const author  = text.author || 'Jems S. Pompée';
  const fmtDate = text.publishedAt
    ? new Date(text.publishedAt).toLocaleDateString(
        lang === 'fr' ? 'fr-FR' : lang === 'es' ? 'es-ES' : 'en-US',
        { year:'numeric', month:'long' })
    : '';

  async function requestFull(e) {
    e.preventDefault();
    if (!email || !email.includes('@')) { setEmailMsg(labels.errorEmail); return; }
    setEmailLoading(true); setEmailMsg('');
    try {
      const r = await fetch('/api/texts', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ id: text.id, email, lang }),
      });
      const d = await r.json();
      if (d.success) {
        setFullText(d[`full_${lang}`] || d.full_en || '');
        setEmailMsg(labels.success);
      } else setEmailMsg(labels.errorFetch);
    } catch { setEmailMsg(labels.errorFetch); }
    setEmailLoading(false);
  }

  const displayText = fullText || preview;

  return (
    <>
      <Head>
        <title>{title}: SPY ON THE RISE</title>
        <meta name="description" content={sub || title} />
      </Head>
      <div style={{ background:'#F8F5F0', minHeight:'100vh', fontFamily:"'Source Serif 4',Georgia,serif" }}>

        {/* Header */}
        <div style={{ background:'#16110C', padding:'3rem 1.5rem 2.5rem', textAlign:'center' }}>
          {category && (
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', color:'#7A1515', marginBottom:'.6rem' }}>
              {category}
            </div>
          )}
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(24px,4.5vw,48px)', fontWeight:700, color:'#F0EDE8', lineHeight:1.15, marginBottom:'.75rem', maxWidth:700, margin:'0 auto .75rem' }}>
            {title}
          </div>
          {sub && (
            <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:'clamp(14px,2vw,19px)', fontStyle:'italic', color:'#B8B0A5', marginBottom:'.6rem', maxWidth:560, margin:'0 auto .6rem' }}>
              {sub}
            </div>
          )}
          <div style={{ fontSize:12, color:'#6B6560', marginTop:'.75rem' }}>
            {labels.by} {author}{fmtDate ? `, ${fmtDate}` : ''}
          </div>
          <div style={{ display:'flex', gap:8, justifyContent:'center', marginTop:'1.25rem' }}>
            {['en','fr','es'].map(l => (
              <button key={l} onClick={() => { setLang(l); localStorage.setItem('sotr-lang', l); }}
                style={{ background:lang===l?'#7A1515':'transparent', color:lang===l?'#fff':'#B8B0A5', border:'1px solid', borderColor:lang===l?'#7A1515':'rgba(255,255,255,.15)', borderRadius:4, padding:'4px 12px', fontSize:11, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', cursor:'pointer' }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Article body */}
        <div style={{ maxWidth:680, margin:'0 auto', padding:'3rem 1.5rem' }}>
          <div style={{ fontSize:'clamp(16px,1.9vw,19px)', lineHeight:1.9, color:'#2D2620' }}>
            {displayText.split('\n\n').map((p, i) => (
              <p key={i} style={{ marginBottom:'1.4em' }}>{p}</p>
            ))}
          </div>

          {/* Email gate */}
          {!fullText && (
            <div style={{ borderTop:'2px solid #7A1515', paddingTop:'2rem', marginTop:'2rem', textAlign:'center' }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(17px,2.5vw,23px)', fontWeight:700, color:'#16110C', marginBottom:'.5rem' }}>
                {labels.readFull}
              </div>
              <div style={{ fontSize:13, color:'#6B6560', lineHeight:1.6, marginBottom:'1.25rem' }}>
                {labels.emailHint}
              </div>
              <form onSubmit={requestFull} style={{ display:'flex', gap:8, flexWrap:'wrap', justifyContent:'center' }}>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder={labels.emailPlaceholder}
                  style={{ flex:'1 1 220px', maxWidth:300, padding:'10px 14px', borderRadius:4, border:'1.5px solid #CCBFB0', fontFamily:"'Source Serif 4',serif", fontSize:14, outline:'none' }}/>
                <button type="submit" disabled={emailLoading}
                  style={{ background:'#7A1515', color:'#fff', border:'none', borderRadius:4, padding:'10px 22px', fontFamily:"'Source Sans 3',sans-serif", fontSize:13, fontWeight:700, letterSpacing:'.06em', cursor:'pointer', opacity:emailLoading ? .6 : 1 }}>
                  {emailLoading ? '...' : labels.emailBtn}
                </button>
              </form>
              {emailMsg && (
                <p style={{ textAlign:'center', marginTop:'.75rem', fontSize:13, color:emailMsg === labels.success ? '#1A5C2A' : '#7A1515' }}>
                  {emailMsg}
                </p>
              )}
            </div>
          )}

          {/* Download attachment if available */}
          {hasAtt && (
            <div style={{ marginTop:'2rem', textAlign:'center' }}>
              <a href={`/api/texts/download?id=${text.id}&lang=${lang}`}
                target="_blank" rel="noopener"
                style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:12, fontWeight:700, color:'#7A1515', textDecoration:'none', border:'1px solid rgba(122,21,21,.3)', borderRadius:4, padding:'8px 18px', letterSpacing:'.07em' }}>
                ↓ {labels.download}
              </a>
            </div>
          )}

          {/* Navigation */}
          <div style={{ marginTop:'3rem', paddingTop:'1.5rem', borderTop:'1px solid #E8E2D9', display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
            <Link href="/textes/archive" style={{ fontSize:12, color:'#7A1515', textDecoration:'none', fontWeight:600, letterSpacing:'.06em' }}>
              ← {labels.back}
            </Link>
            <Link href="/textes" style={{ fontSize:12, color:'#7A1515', textDecoration:'none', fontWeight:600, letterSpacing:'.06em' }}>
              {labels.backFeatured} →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

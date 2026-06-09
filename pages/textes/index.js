import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const LABELS = {
  en: { section:'Text of the Month', by:'By', preview:'Preview', readMore:'Read the full text', emailPlaceholder:'your@email.com', emailBtn:'Send me the full text', emailHint:'Enter your email to read the full text. We send it once, no spam.', success:'The full text has been sent to your inbox.', errorEmail:'Please enter a valid email address.', errorFetch:'Something went wrong. Please try again.', allTexts:'All Texts', noFeatured:'No featured text this month.' },
  fr: { section:'Texte du mois', by:'Par', preview:'Extrait', readMore:'Lire le texte complet', emailPlaceholder:'votre@email.com', emailBtn:"M'envoyer le texte complet", emailHint:'Entrez votre email pour lire le texte complet. Envoi unique, sans spam.', success:'Le texte complet a été envoyé dans votre boîte mail.', errorEmail:'Veuillez entrer une adresse email valide.', errorFetch:"Une erreur s'est produite. Veuillez réessayer.", allTexts:'Tous les textes', noFeatured:'Aucun texte à la une ce mois-ci.' },
  es: { section:'Texto del mes', by:'Por', preview:'Extracto', readMore:'Leer el texto completo', emailPlaceholder:'tu@email.com', emailBtn:'Enviarme el texto completo', emailHint:'Ingresa tu email para leer el texto completo. Un solo envío, sin spam.', success:'El texto completo ha sido enviado a tu bandeja de entrada.', errorEmail:'Por favor ingresa un email válido.', errorFetch:'Algo salió mal. Por favor intenta de nuevo.', allTexts:'Todos los textos', noFeatured:'No hay texto destacado este mes.' },
};

export default function TextesPage() {
  const [lang, setLang] = useState('en');
  const [texts, setTexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [emailMsg, setEmailMsg] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [fullText, setFullText] = useState(null);

  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem('sotr-lang')) || 'en';
    if (['en','fr','es'].includes(saved)) setLang(saved);
    fetch('/api/texts').then(r=>r.json()).then(setTexts).catch(()=>setTexts([])).finally(()=>setLoading(false));
  }, []);

  const L = LABELS[lang] || LABELS.en;
  const featured = texts.find(t => t.featured);
  const title  = featured?.[`title_${lang}`]  || featured?.title_en  || '';
  const sub    = featured?.[`subtitle_${lang}`]|| featured?.subtitle_en || '';
  const preview= featured?.[`preview_${lang}`] || featured?.preview_en || '';
  const author = featured?.author || 'Jems S. Pompée';
  const date   = featured?.publishedAt ? new Date(featured.publishedAt).toLocaleDateString(lang==='fr'?'fr-FR':lang==='es'?'es-ES':'en-US',{year:'numeric',month:'long'}) : '';

  async function requestFull(e) {
    e.preventDefault();
    if (!email || !email.includes('@')) { setEmailMsg(L.errorEmail); return; }
    setEmailLoading(true); setEmailMsg('');
    try {
      const r = await fetch('/api/texts', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ id: featured.id, email, lang }),
      });
      const d = await r.json();
      if (d.success) {
        setFullText(d[`full_${lang}`] || d.full_en || '');
        setEmailMsg(L.success);
      } else { setEmailMsg(L.errorFetch); }
    } catch { setEmailMsg(L.errorFetch); }
    setEmailLoading(false);
  }

  return (
    <>
      <Head>
        <title>{L.section} — SPY ON THE RISE</title>
        <meta name="description" content={featured ? (featured[`subtitle_${lang}`]||featured.subtitle_en||'') : L.section} />
        <meta name="robots" content="index,follow" />
      </Head>

      <div style={{background:'var(--bg,#F8F5F0)',minHeight:'100vh',fontFamily:"'Source Serif 4',Georgia,serif"}}>
        {/* Header */}
        <div style={{background:'#16110C',padding:'2.5rem 1.5rem 2rem',textAlign:'center'}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:'.2em',textTransform:'uppercase',color:'#7A1515',marginBottom:'.6rem'}}>{L.section}</div>
          <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:'clamp(26px,4vw,42px)',fontWeight:700,color:'#F0EDE8',lineHeight:1.15,marginBottom:'.75rem'}}>{loading?'...':title}</div>
          {sub && <div style={{fontFamily:"'Source Serif 4',Georgia,serif",fontSize:'clamp(14px,2vw,18px)',fontStyle:'italic',color:'#B8B0A5',marginBottom:'.5rem'}}>{sub}</div>}
          {!loading && <div style={{fontSize:12,color:'#6B6560',marginTop:'.5rem'}}>{L.by} {author}{date ? ` · ${date}` : ''}</div>}
          {/* Lang switcher */}
          <div style={{display:'flex',gap:8,justifyContent:'center',marginTop:'1.25rem'}}>
            {['en','fr','es'].map(l=>(
              <button key={l} onClick={()=>setLang(l)}
                style={{background:lang===l?'#7A1515':'transparent',color:lang===l?'#fff':'#B8B0A5',border:'1px solid',borderColor:lang===l?'#7A1515':'rgba(255,255,255,.15)',borderRadius:4,padding:'4px 12px',fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',cursor:'pointer'}}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{maxWidth:700,margin:'0 auto',padding:'2.5rem 1.5rem'}}>
          {loading && <p style={{color:'#6B6560',textAlign:'center'}}>Loading...</p>}
          {!loading && !featured && <p style={{color:'#6B6560',textAlign:'center',padding:'3rem 0'}}>{L.noFeatured}</p>}

          {!loading && featured && (
            <>
              {/* Preview text */}
              <div style={{fontSize:'clamp(15px,1.8vw,18px)',lineHeight:1.85,color:'#3D3328',marginBottom:'2rem'}}>
                {(fullText || preview).split('\n\n').map((p,i)=>(
                  <p key={i} style={{marginBottom:'1.25em'}}>{p}</p>
                ))}
              </div>

              {/* Email gate — only show if full text not yet revealed */}
              {!fullText && (
                <div style={{borderTop:'2px solid #7A1515',paddingTop:'2rem',marginTop:'2rem'}}>
                  <div style={{textAlign:'center',marginBottom:'1.25rem'}}>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(16px,2.5vw,22px)',fontWeight:700,color:'#16110C',marginBottom:'.5rem'}}>{L.readMore}</div>
                    <div style={{fontSize:13,color:'#6B6560',lineHeight:1.6}}>{L.emailHint}</div>
                  </div>
                  <form onSubmit={requestFull} style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center'}}>
                    <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                      placeholder={L.emailPlaceholder}
                      style={{flex:'1 1 220px',maxWidth:300,padding:'10px 14px',borderRadius:4,border:'1.5px solid #CCBFB0',fontFamily:"'Source Serif 4',serif",fontSize:14,outline:'none'}}/>
                    <button type="submit" disabled={emailLoading}
                      style={{background:'#7A1515',color:'#fff',border:'none',borderRadius:4,padding:'10px 22px',fontFamily:"'Source Sans 3',sans-serif",fontSize:13,fontWeight:700,letterSpacing:'.06em',cursor:'pointer',whiteSpace:'nowrap',opacity:emailLoading?.6:1}}>
                      {emailLoading ? '...' : L.emailBtn}
                    </button>
                  </form>
                  {emailMsg && <p style={{textAlign:'center',marginTop:'.75rem',fontSize:13,color:emailMsg===L.success?'#1A5C2A':'#7A1515'}}>{emailMsg}</p>}
                </div>
              )}

              {/* Back link */}
              <div style={{marginTop:'3rem',paddingTop:'1.5rem',borderTop:'1px solid #E8E2D9',textAlign:'center'}}>
                <Link href="/" style={{fontSize:13,color:'#7A1515',textDecoration:'none',fontWeight:600,letterSpacing:'.06em'}}>← SPY ON THE RISE</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// SPY ON THE RISE â€” Site Logic v4
// Encoding: UTF-8
// Language system: bridges to Next.js body via window.__sotrSetLang
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ── LIVE CATALOG ─────────────────────────────────────────
// Loaded fresh from /api/catalog-live on every page load.
// Availability toggles from the admin dashboard appear on
// the live site within 10 seconds — no redeployment needed.
let BOOKS = {};
let SERIES = {};
let BUNDLES = [];
let PLATFORMS = {};

async function loadCatalog() {
  try {
    const r = await fetch('/api/catalog-live');
    if (!r.ok) throw new Error('catalog fetch failed');
    const data = await r.json();

    // Filter out hidden books for public display
    const allBooks = data.BOOKS || {};
    const visibleBooks = {};
    Object.entries(allBooks).forEach(([k, b]) => {
      if (!b.hidden) visibleBooks[k] = b;
    });

    BOOKS     = visibleBooks;
    SERIES    = data.SERIES    || {};
    BUNDLES   = data.BUNDLES   || [];
    PLATFORMS = data.PLATFORMS || {};

    // Site lock check
    if (data.siteLocked) {
      const host = window.location.hostname;
      const isAdmin = window.location.pathname.startsWith('/admin');
      const isPreview = host.includes('vercel.app') || host === 'localhost' || host === '127.0.0.1';
      const hasBypass = localStorage.getItem('sotr-preview') === 'sotr2026' ||
        new URLSearchParams(window.location.search).get('preview') === 'sotr2026';

      if (new URLSearchParams(window.location.search).get('preview') === 'sotr2026') {
        localStorage.setItem('sotr-preview', 'sotr2026');
      }

      if (!isAdmin && !isPreview && !hasBypass) {
        showSiteLockOverlay();
      }
    } else {
      hideSiteLockOverlay();
    }
  } catch (e) {
    console.warn('[SOTR] Catalog load failed:', e.message);
  }
}

function showSiteLockOverlay() {
  let el = document.getElementById('sotr-lock-overlay');
  if (!el) {
    el = document.createElement('div');
    el.id = 'sotr-lock-overlay';
    el.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:99999',
      'background:#16110C',
      'display:flex', 'flex-direction:column',
      'align-items:center', 'justify-content:center',
      'text-align:center', 'padding:2rem',
    ].join(';');
    el.innerHTML = `
      <div style="color:#7A1515;font-size:28px;margin-bottom:1rem;letter-spacing:.2em">&#9670;</div>
      <div style="font-family:Georgia,serif;font-size:clamp(28px,5vw,52px);font-weight:700;color:#F0EDE8;line-height:1.2;margin-bottom:1rem">SPY ON THE RISE</div>
      <div style="font-family:Georgia,serif;font-size:clamp(14px,2vw,20px);font-style:italic;color:#B8B0A5;margin-bottom:2.5rem">Where Ideas Rise. Where Voices Ascend.</div>
      <div style="width:48px;height:2px;background:#7A1515;margin-bottom:2.5rem"></div>
      <div style="font-family:Arial,sans-serif;font-size:clamp(13px,1.8vw,17px);font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#7A1515;margin-bottom:1rem">Launching Soon</div>
      <div style="font-family:Georgia,serif;font-size:clamp(13px,1.6vw,16px);color:#6B6560;max-width:420px;line-height:1.8">Our full catalog of geopolitical essays, espionage thrillers, speculative fiction, and bilingual poetry is almost ready.</div>
      <div style="margin-top:3rem;font-family:Arial,sans-serif;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#3D3328">spyontherise.com</div>
    `;
    document.body.appendChild(el);
  }
  el.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  document.body.style.pointerEvents = 'none';
  el.style.pointerEvents = 'all';
}

function hideSiteLockOverlay() {
  const el = document.getElementById('sotr-lock-overlay');
  if (el) {
    el.style.display = 'none';
    document.body.style.overflow = '';
    document.body.style.pointerEvents = '';
  }
}

/* ══════════════════════════════════════
   BOOK COVER BUILDER
══════════════════════════════════════ */
function buildCover(b, size='normal'){
  const fs = size==='small' ? '10px' : size==='mini' ? '8px' : '13px';

  const imgHtml = b.image
    ? `<img src="${b.image}?v=${Date.now()}" alt="${b.title.replace(/"/g,'')}"
         loading="lazy"
         style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit;"
         onerror="this.style.display='none'">`
    : '';

  if(!b.available){
    return `<div class="book-cover book-cover-unavail" style="position:relative;">
      <div class="book-cover-bg" style="background:${b.color};"></div>
      ${imgHtml ? `<div style="position:absolute;inset:0;overflow:hidden;border-radius:inherit;">${imgHtml}<div style="position:absolute;inset:0;background:rgba(0,0,0,0.55);"></div></div>` : ''}
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px;text-align:center;z-index:2;">
        <div class="unavail-icon">🔒</div>
        <div class="unavail-label en">${b.release||'Coming Soon'}</div>
        <div class="unavail-label fr">${b.release||'À Venir'}</div>
        <div class="unavail-label es">${b.release||'Próximamente'}</div>
        <div style="font-family:var(--display);font-size:${fs};font-weight:700;color:rgba(255,255,255,0.75);margin-top:6px;line-height:1.25;">${b.title}</div>
      </div>
      ${b.release && b.release!=='TBD' ? `<div class="release-banner" style="z-index:3;">${b.release}</div>` : ''}
    </div>`;
  }

  return `<div class="book-cover" style="position:relative;">
    <div class="book-cover-bg" style="background:${b.color};"></div>
    ${imgHtml ? `<div style="position:absolute;inset:0;overflow:hidden;border-radius:inherit;">${imgHtml}</div>` : ''}
    <div class="book-cover-top" style="position:absolute;top:.7rem;left:.7rem;right:.7rem;z-index:2;">
      <span class="bc-genre-pill">${b.genre}</span>
    </div>
    <div class="book-cover-overlay" style="z-index:2;">
      ${!b.image ? `<div class="bc-orn">${b.orn}</div>
      <div class="bc-title-text" style="font-size:${fs};">${b.title}</div>
      ${b.subtitle && !b.subtitle.includes('Coming') ? `<div class="bc-subtitle-text">${b.subtitle}</div>` : ''}` : ''}
    </div>
  </div>`;
}

function buildBookCard(b, showVol=false){
  return `<div class="book-card clickable-card" onclick="openBook('${b.key}')" style="overflow:hidden;" role="button" tabindex="0" aria-label="Open details for ${b.title}">
    <div style="position:relative;">${buildCover(b)}</div>
    <div class="book-card-body">
      <div class="book-card-title">${b.title}</div>
      <div class="book-card-meta">${b.genre}${showVol && b.vol ? ' · '+b.vol : ''}</div>
      ${b.available ? `<div class="book-card-price">${b.price}</div>` : `<div class="book-card-coming">${b.price}</div>`}
    </div>
  </div>`;
}

/* ══════════════════════════════════════
   RENDER HOME
══════════════════════════════════════ */
function renderHomeCatalog(){
  if (!BOOKS || Object.keys(BOOKS).length === 0) return;
  const featured = ['mercer1','iran','warorbits','anatomy2','chess','atlas','teacher','neural','invisible','haiti','crooked1','anatomy1'];
  document.getElementById('home-catalog-grid').innerHTML = featured.map(k=>BOOKS[k]).filter(Boolean).map(b=>buildBookCard(b)).join('');
}

function renderHomeSeriesGrid(){
  if (!BOOKS || Object.keys(BOOKS).length === 0) return;
  document.getElementById('home-series-grid').innerHTML = Object.values(SERIES).map(s=>`
    <div class="series-overview-card" onclick="openSeries('${s.key}')" role="button" tabindex="0" aria-label="Explore ${s.name}">
      <div class="soc-num">${s.num}</div>
      <div class="soc-tag">${s.tag}</div>
      <div class="soc-name">${s.name}</div>
      <div class="soc-desc">${s.desc}</div>
      <div class="soc-count">${s.totalVols} <span class="en">volumes</span><span class="fr">volumes</span><span class="es">volúmenes</span> · EN/FR <span class="soc-arrow">→</span></div>
    </div>`).join('');
}

function renderHeroMosaic(){
  if (!BOOKS || Object.keys(BOOKS).length === 0) return;
  const keys = ['mercer1','iran','anatomy2','chess','atlas','neural'];
  document.getElementById('hero-mosaic').innerHTML = keys.map(k=>{
    const b=BOOKS[k];
    if(!b) return null;
    return `<div class="hero-mini-card" onclick="openBook('${b.key}')" aria-label="${b.title}">
      <div class="hero-mini-inner" style="background:${b.color};">
        <div class="hero-mini-content"><div class="hmc-genre">${b.genre}</div><div class="hmc-title">${b.title}</div><div class="hmc-orn">${b.orn}</div></div>
      </div>
    </div>`;
  }).filter(Boolean).join('');
}

function renderBBPreviews(){
  const prev = [
    {badge:'bundle',bgBadge:'var(--bg-dark)',name:{en:'The Complete Mercer',fr:'Mercer Intégral',es:'Mercer Completo'},save:{en:'All 7 volumes · Save 35%',fr:'7 volumes · Économisez 35%',es:'7 volúmenes · Ahorra 35%'}},
    {badge:'promo',bgBadge:'var(--crimson)',name:{en:'New Reader Pack',fr:'Pack Nouveau Lecteur',es:'Pack Nuevo Lector'},save:{en:'3 titles · Save 30%',fr:'3 titres · Économisez 30%',es:'3 títulos · Ahorra 30%'}},
    {badge:'limited',bgBadge:'var(--gold)',name:{en:'Geopolitics Pack',fr:'Pack Géopolitique',es:'Pack Geopolítico'},save:{en:'4 titles · Save 40%',fr:'4 titres · Économisez 40%',es:'4 títulos · Ahorra 40%'}},
    {badge:'bilingual',bgBadge:'var(--green)',name:{en:'Bilingual Pair',fr:'Duo Bilingue',es:'Par Bilingüe'},save:{en:'EN + FR · Save 25%',fr:'EN + FR · Économisez 25%',es:'EN + FR · Ahorra 25%'}},
  ];
  const labels = {bundle:{en:'Bundle',fr:'Lot',es:'Paquete'},promo:{en:'Promo',fr:'Promo',es:'Promo'},limited:{en:'⚡ Limited',fr:'⚡ Limité',es:'⚡ Limitado'},bilingual:{en:'Bilingual',fr:'Bilingue',es:'Bilingüe'}};
  document.getElementById('bb-previews').innerHTML = prev.map(p=>`
    <div class="bb-prev-card" onclick="showPage('bundles')">
      <span class="bbp-badge" style="background:${p.bgBadge};color:#fff;"><span class="en">${labels[p.badge]?.en||p.badge}</span><span class="fr">${labels[p.badge]?.fr||p.badge}</span><span class="es">${labels[p.badge]?.es||p.badge}</span></span>
      <div class="bbp-name en">${p.name.en}</div><div class="bbp-name fr">${p.name.fr}</div><div class="bbp-name es">${p.name.es}</div>
      <div class="bbp-savings en">${p.save.en}</div><div class="bbp-savings fr">${p.save.fr}</div><div class="bbp-savings es">${p.save.es}</div>
    </div>`).join('');
}

/* ══════════════════════════════════════
   SERIES LIST PAGE
══════════════════════════════════════ */
function renderSeriesListPage(){
  if (!BOOKS || Object.keys(BOOKS).length === 0) return;
  document.getElementById('series-list-grid').innerHTML = Object.values(SERIES).map(s=>`
    <div class="series-overview-card" onclick="openSeries('${s.key}')" role="button" tabindex="0">
      <div class="soc-num">${s.num}</div>
      <div class="soc-tag">${s.tag}</div>
      <div class="soc-name">${s.name}</div>
      <div class="soc-desc">${s.desc}</div>
      <div class="soc-count">${s.totalVols} <span class="en">volumes · Explore →</span><span class="fr">volumes · Explorer →</span><span class="es">volúmenes · Explorar →</span></div>
    </div>`).join('');
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   BOOK MODAL - points (b)(e)
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
let currentFmt = 'print';
function openBook(key){
  if (!BOOKS || Object.keys(BOOKS).length === 0) return;
  const b = BOOKS[key];
  // Cover in modal header
  document.getElementById('modal-cover-box').innerHTML = buildCover(b,'small');
  document.getElementById('mh-genre').textContent = b.genre;
  document.getElementById('mh-title').textContent = b.title;
  document.getElementById('mh-subtitle').textContent = b.subtitle || '';
  document.getElementById('mh-meta').innerHTML = `<span>${b.lang}</span><span style="margin:0 5px;opacity:.25;">·</span><span>${b.pages}</span><span style="margin:0 5px;opacity:.25;">·</span><span>${b.series}</span>`;
  // Unavailable notice + email signup
  const _safeTitle = b.title.replace(/'/g,'').replace(/"/g,'');
  document.getElementById('mh-unavail').innerHTML = !b.available
    ? `<div class="unavail-notice" id="unavail-${b.key}">
        <div class="un-title en">Coming ${b.release||'Soon'}</div>
        <div class="un-title fr">Sortie ${b.release||'prochaine'}</div>
        <div class="un-title es">Llegando ${b.release||'pronto'}</div>
        <div class="un-body en">Be the first to know when this title launches.</div>
        <div class="un-body fr">Soyez le premier inform&eacute; du lancement.</div>
        <div class="un-body es">S&eacute; el primero en saber cuando se lance.</div>
        <div id="unf-${b.key}">
          <div style="display:flex;gap:6px;margin-top:.6rem;flex-wrap:wrap;">
            <input type="email" id="un-inp-${b.key}" class="un-email-inp"
              placeholder="your@email.com" autocomplete="email"
              onkeydown="if(event.key==='Enter')notifySignup('${b.key}','${_safeTitle}')"/>
            <button class="un-notify-btn"
              onclick="notifySignup('${b.key}','${_safeTitle}')">
              <span class="en">Notify Me</span>
              <span class="fr">M'avertir</span>
              <span class="es">Notificarme</span>
            </button>
          </div>
          <div id="un-msg-${b.key}" style="display:none;font-size:12px;margin-top:6px;"></div>
        </div>
      </div>`
    : '';
  // Synopsis
  const _activeLang = document.body.getAttribute('data-lang') || 'en';
  const _synopsis = (_activeLang === 'fr' && b.synopsis_fr) ? b.synopsis_fr
    : (_activeLang === 'es' && b.synopsis_es) ? b.synopsis_es
    : (b.synopsis_en || b.synopsis || '');
  document.getElementById('modal-synopsis').textContent = _synopsis;
  const detailFields = [
    b.genre  ? [['Genre','Genre','Género'], b.genre] : null,
    b.lang   ? [['Language','Langue','Idioma'], b.lang] : null,
    b.pages  ? [['Pages','Pages','Páginas'], b.pages] : null,
    b.series ? [['Series','Série','Serie'], b.series + (b.vol ? ' Vol. ' + b.vol : '')] : null,
    b.release? [['Release','Sortie','Lanzamiento'], b.release] : null,
  ].filter(Boolean);
  document.getElementById('modal-details').innerHTML = detailFields.length
    ? detailFields.map(([labels,v])=>`<div><div class="sd-label en">${labels[0]}</div><div class="sd-label fr">${labels[1]}</div><div class="sd-label es">${labels[2]}</div><div class="sd-value">${v}</div></div>`).join('')
    : `<div><div class="sd-label en">Status</div><div class="sd-label fr">Statut</div><div class="sd-label es">Estado</div><div class="sd-value en">In Production</div><div class="sd-value fr">En Production</div><div class="sd-value es">En Producción</div></div>`;
  // Buy tab availability
  if(!b.available){
    document.getElementById('platform-list').innerHTML = `<p style="font-family:var(--body);font-style:italic;color:var(--text-muted);padding:0.5rem 0;" class="en">Not yet available for purchase. Subscribe to our newsletter to be notified.</p><p style="font-family:var(--body);font-style:italic;color:var(--text-muted);padding:0.5rem 0;" class="fr">Pas encore disponible. Abonnez-vous à notre newsletter pour être notifié.</p><p style="font-family:var(--body);font-style:italic;color:var(--text-muted);padding:0.5rem 0;" class="es">Aún no disponible. Suscríbete a nuestra newsletter para recibir notificaciones.</p>`;
  } else {
    currentFmt = 'print';
    document.querySelectorAll('.ft-btn').forEach((btn,i)=>btn.classList.toggle('active',i===0));
    renderPlatforms('print');
  }
  // Related titles - point (e): same series layer + same genre layer
  renderRelated(b);
  // Reset tabs
  document.querySelectorAll('.modal-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.modal-tab')[0].classList.add('active');
  document.querySelectorAll('.modal-tab')[3].classList.add('active');
  document.querySelectorAll('.modal-tab')[6].classList.add('active');
  document.querySelectorAll('.modal-tab-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('tab-synopsis').classList.add('active');
  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow='hidden';
}

async function notifySignup(bookKey, bookTitle) {
  const input = document.getElementById('un-inp-' + bookKey);
  const msgEl = document.getElementById('un-msg-' + bookKey);
  const formEl = document.getElementById('unf-' + bookKey);
  if (!input || !msgEl) return;

  const email = (input.value || '').trim();
  if (!email || !email.includes('@') || !email.includes('.')) {
    msgEl.style.display = 'block';
    msgEl.style.color = '#E57373';
    msgEl.textContent = 'Please enter a valid email address.';
    return;
  }

  const btn = formEl ? formEl.querySelector('.un-notify-btn') : null;
  if (btn) { btn.disabled = true; btn.style.opacity = '.5'; }

  try {
    const lang = document.body.getAttribute('data-lang') || 'en';
    const r = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, lang, bookKey, bookTitle: bookTitle || bookKey, type: 'prelaunch' }),
    });
    const d = await r.json();

    if (r.ok) {
      const flexDiv = formEl ? formEl.querySelector('div') : null;
      if (flexDiv) flexDiv.style.display = 'none';
      msgEl.style.display = 'block';
      msgEl.style.color = '#4AC77A';
      msgEl.innerHTML = `
        <span class="en">&#10003; You are on the list for <em>${bookTitle||bookKey}</em>. We will notify you on launch day.</span>
        <span class="fr">&#10003; Vous &ecirc;tes sur la liste pour <em>${bookTitle||bookKey}</em>.</span>
        <span class="es">&#10003; Est&aacute;s en la lista para <em>${bookTitle||bookKey}</em>.</span>`;
    } else {
      msgEl.style.display = 'block';
      msgEl.style.color = '#E57373';
      msgEl.textContent = d.error || 'Something went wrong. Please try again.';
      if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
    }
  } catch {
    msgEl.style.display = 'block';
    msgEl.style.color = '#E57373';
    msgEl.textContent = 'Connection error. Please try again.';
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
  }
}

function renderRelated(b){
  if (!BOOKS || Object.keys(BOOKS).length === 0) return;
  // Layer 1: same series (excluding self)
  const sameSeries = b.seriesKey
    ? Object.values(BOOKS).filter(bk=>bk.key!==b.key && bk.seriesKey===b.seriesKey)
    : [];
  // Layer 2: same genre (excluding self and already shown in series)
  const seriesKeys = new Set(sameSeries.map(bk=>bk.key));
  const sameGenre = Object.values(BOOKS).filter(bk=>
    bk.key!==b.key &&
    !seriesKeys.has(bk.key) &&
    bk.genre===b.genre
  );
  // Layer 3: related standalone (different genre, curated by hand)
  let html = '';
  if(sameSeries.length){
    html += `<p class="related-group-label en">Other books in ${b.series}</p>
             <p class="related-group-label fr">Autres livres dans ${b.series}</p>
             <p class="related-group-label es">Otros libros de ${b.series}</p>
             <div class="related-mini-grid">${sameSeries.map(bk=>buildRelatedCard(bk)).join('')}</div>`;
  }
  if(sameGenre.length){
    html += `<p class="related-group-label en" style="margin-top:1.75rem;">More in <em>${b.genre}</em></p>
             <p class="related-group-label fr" style="margin-top:1.75rem;">Plus dans <em>${b.genre}</em></p>
             <p class="related-group-label es" style="margin-top:1.75rem;">Más en <em>${b.genre}</em></p>
             <div class="related-mini-grid">${sameGenre.slice(0,6).map(bk=>buildRelatedCard(bk)).join('')}</div>`;
  }
  if(!sameSeries.length && !sameGenre.length){
    html += `<p class="related-empty en">No related titles available yet in this genre.</p>
             <p class="related-empty fr">Aucun titre associé disponible pour ce genre.</p>
             <p class="related-empty es">No hay títulos relacionados disponibles aún.</p>`;
  }
  document.getElementById('related-content').innerHTML = html;
}

function buildRelatedCard(b){
  return `<div class="book-card clickable-card" onclick="closeModal();setTimeout(()=>openBook('${b.key}'),160)" role="button" tabindex="0" style="overflow:hidden;">
    <div>${buildCover(b,'small')}</div>
    <div class="book-card-body">
      <div class="book-card-title" style="font-size:12px;">${b.title}</div>
      ${b.available ? `<div class="book-card-price" style="font-size:12px;">${b.price}</div>` : `<div class="book-card-coming" style="font-size:11px;">${b.price}</div>`}
    </div>
  </div>`;
}

function switchTab(id, btn){
  document.querySelectorAll('.modal-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.modal-tab-panel').forEach(p=>p.classList.remove('active'));
  // Activate all language variants of this tab position
  document.querySelectorAll('.modal-tab').forEach(t=>{
    if(t.getAttribute('onclick')===`switchTab('${id}',this)`) t.classList.add('active');
  });
  document.getElementById('tab-'+id).classList.add('active');
}

function setFmt(fmt, btn){
  currentFmt=fmt;
  document.querySelectorAll('.ft-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderPlatforms(fmt);
}

function renderPlatforms(fmt){
  const ps=PLATFORMS[fmt]||[];
  if(!ps.length){ document.getElementById('platform-list').innerHTML='<p style="font-family:var(--body);font-style:italic;color:var(--text-muted);" class="en">Coming soon for this format.</p><p style="font-family:var(--body);font-style:italic;color:var(--text-muted);" class="fr">Disponible prochainement.</p><p style="font-family:var(--body);font-style:italic;color:var(--text-muted);" class="es">Próximamente.</p>'; return; }
  document.getElementById('platform-list').innerHTML=ps.map(p=>`
    <div class="platform-row ${p.feat?'feat':''}">
      <div style="display:flex;align-items:center;gap:10px;">
        <div class="pr-icon" style="background:${p.color};">${p.abbr}</div>
        <div><div class="pr-name">${p.name}${p.feat?'<span class="badge-rec">Recommended</span>':''}</div><div class="pr-note">${p.note}</div></div>
      </div>
      <a href="${p.url}" class="btn-buy" target="_blank" rel="noopener">
        <span class="en">Buy</span><span class="fr">Acheter</span><span class="es">Comprar</span>
      </a>
    </div>`).join('');
}

function closeModal(){ document.getElementById('modal-overlay').classList.remove('open'); document.body.style.overflow=''; }
function closeMBg(e){ if(e.target===document.getElementById('modal-overlay')) closeModal(); }

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   BUNDLES PAGE
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const BADGE_CLASSES = {bundle:'badge-bundle',promo:'badge-promo',limited:'badge-limited',new:'badge-new'};
const BADGE_LABELS  = {bundle:{en:'Bundle',fr:'Lot',es:'Paquete'},promo:{en:'Promotion',fr:'Promotion',es:'Promoción'},limited:{en:'&#9889; Limited Time',fr:'&#9889; Durée Limitée',es:'&#9889; Tiempo Limitado'},new:{en:'New',fr:'Nouveau',es:'Nuevo'}};
function renderBundles(filter){
  if (!BOOKS || Object.keys(BOOKS).length === 0) return;
  const data = filter==='all' ? BUNDLES : BUNDLES.filter(b=>b.types.includes(filter));
  document.getElementById('bundles-grid').innerHTML = data.map(b=>`
    <div class="bundle-card ${b.isGold?'gold-card':''}" onclick="openBundle('${b.id}')"
      <div class="bc-head">
        <div class="bc-badges"><span class="badge-type ${BADGE_CLASSES[b.badge]||'badge-bundle'}"><span class="en">${BADGE_LABELS[b.badge]?.en||''}</span><span class="fr">${BADGE_LABELS[b.badge]?.fr||''}</span><span class="es">${BADGE_LABELS[b.badge]?.es||''}</span></span></div>
        <div class="bc-title">${b.title}</div><div class="bc-subtitle">${b.subtitle}</div>
      </div>
      <div class="bc-books">${b.books.map(bk=>`<span class="bk-chip">${bk}</span>`).join('')}</div>
      <div class="bc-foot">
        <div class="bc-foot-row">
          <div><div class="bc-orig">${b.orig}</div><div class="bc-disc">${b.disc}</div><div class="bc-save ${b.isGold?'gold':''}">${b.save}</div></div>
          ${b.timer?`<div class="timer-block"><div class="bc-timer-label en">Ends in</div><div class="bc-timer-label fr">Se termine dans</div><div class="bc-timer-label es">Termina en</div><div class="bc-countdown" id="timer-${b.id}">-</div></div>`:''}
        </div>
        <button class="bc-buy-btn" onclick="event.stopPropagation();openBundle('${b.id}')">
          <span class="en">BUY THIS BUNDLE</span>
          <span class="fr">ACHETER CE LOT</span>
          <span class="es">COMPRAR ESTE PAQUETE</span>
        </button>
      </div>
    </div>`).join('');
  tickTimers();
}
function filterBundles(filter, btn){
  document.querySelectorAll('.bf-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderBundles(filter);
}

function openBundle(id) {
  const b = BUNDLES.find(x => x.id === id);
  if (!b) return;

  const bookList = b.books.map(bk => `
    <div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border);">
      <span style="color:var(--crimson);font-size:12px;">◆</span>
      <span style="font-family:var(--body);font-size:14px;color:var(--text-primary);">${bk}</span>
    </div>`).join('');

  const savings = `
    <div style="text-align:center;padding:1.25rem;background:var(--bg-muted);border-radius:var(--r);margin:1rem 0;">
      <div style="font-family:var(--ui);font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--text-muted);margin-bottom:4px;">
        <span class="en">Bundle Price</span><span class="fr">Prix du Lot</span><span class="es">Precio del Paquete</span>
      </div>
      <div style="font-family:var(--display);font-size:36px;font-weight:700;color:var(--crimson);line-height:1;">${b.disc}</div>
      <div style="font-family:var(--ui);font-size:13px;color:var(--text-muted);text-decoration:line-through;margin-top:4px;">${b.orig}</div>
      <div style="display:inline-block;margin-top:8px;background:var(--green-bg);color:var(--green);font-family:var(--ui);font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;">${b.save}</div>
    </div>`;

  const timerHtml = b.timer ? `
    <div style="text-align:center;background:var(--gold-bg);border:1px solid var(--gold-border);border-radius:var(--r);padding:.75rem;margin-bottom:1rem;">
      <div style="font-family:var(--ui);font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);">
        <span class="en">&#9889; Offer ends in</span>
        <span class="fr">&#9889; Offre se termine dans</span>
        <span class="es">&#9889; Oferta termina en</span>
      </div>
      <div class="bc-countdown" id="bundle-modal-timer" style="font-family:var(--display);font-size:22px;font-weight:700;color:var(--gold);margin-top:4px;">—</div>
    </div>` : '';

  const featPrint = (PLATFORMS.print || []).filter(p => p.feat);
  const retailersHtml = featPrint.length ? `
    <div style="margin-top:1rem;">
      <div style="font-family:var(--ui);font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--text-muted);margin-bottom:.75rem;">
        <span class="en">Purchase via</span><span class="fr">Acheter via</span><span class="es">Comprar en</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${featPrint.map(p=>`
          <a href="${p.url}" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border:1.5px solid var(--crimson-mid);border-radius:var(--r);background:var(--crimson-pale);text-decoration:none;transition:border-color .15s;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:30px;height:30px;border-radius:3px;background:${p.color};display:flex;align-items:center;justify-content:center;font-family:var(--ui);font-size:9px;font-weight:700;color:#fff;">${p.abbr}</div>
              <div>
                <div style="font-family:var(--ui);font-size:14px;font-weight:600;color:var(--text-primary);">${p.name} <span style="font-size:9px;background:var(--crimson);color:#fff;padding:1px 6px;border-radius:2px;margin-left:4px;font-weight:700;letter-spacing:.08em;">BEST PRICE</span></div>
                <div style="font-family:var(--ui);font-size:11px;color:var(--text-muted);">${p.note}</div>
              </div>
            </div>
            <span style="font-family:var(--ui);font-size:11px;font-weight:700;letter-spacing:.08em;color:#fff;background:var(--crimson);padding:8px 16px;border-radius:var(--r);">
              <span class="en">Buy Bundle</span><span class="fr">Acheter</span><span class="es">Comprar</span>
            </span>
          </a>`).join('')}
      </div>
    </div>` : '';

  document.getElementById('mh-genre').textContent = (b.types||[]).map(t=>t.charAt(0).toUpperCase()+t.slice(1)).join(' · ');
  document.getElementById('mh-title').textContent = b.title;
  document.getElementById('mh-subtitle').textContent = b.subtitle;
  document.getElementById('mh-meta').innerHTML = `<span>${b.books.length} <span class="en">titles</span><span class="fr">titres</span><span class="es">títulos</span></span><span style="margin:0 5px;opacity:.25;">·</span><span class="en">Bundle Offer</span><span class="fr">Offre Groupée</span><span class="es">Oferta de Paquete</span>`;
  document.getElementById('mh-unavail').innerHTML = '';

  const buyBtnHtml = featPrint.length
    ? `<button class="bc-buy-btn" style="margin-top:1.25rem;" onclick="document.getElementById('modal-overlay').querySelector('.platform-list a')?.click()||document.querySelector('#tab-buy .btn-buy')?.click()">
        <span class="en">BUY THIS BUNDLE</span>
        <span class="fr">ACHETER CE LOT</span>
        <span class="es">COMPRAR ESTE PAQUETE</span>
      </button>`
    : '';

  document.getElementById('modal-synopsis').innerHTML = `
    <p style="font-family:var(--body);font-size:15px;line-height:1.8;color:var(--text-secondary);margin-bottom:1.25rem;">${b.subtitle}</p>
    ${timerHtml}
    ${savings}
    <div style="font-family:var(--ui);font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--text-muted);margin-bottom:.5rem;">
      <span class="en">Titles Included</span><span class="fr">Titres Inclus</span><span class="es">Títulos Incluidos</span>
    </div>
    ${bookList}
    ${buyBtnHtml}`;
  document.getElementById('modal-details').innerHTML = '';
  document.getElementById('platform-list').innerHTML = retailersHtml;

  const related = BUNDLES.filter(x => x.id !== b.id && (x.types||[]).some(t => (b.types||[]).includes(t))).slice(0, 4);
  document.getElementById('related-content').innerHTML = related.length
    ? `<p class="related-group-label en">Other Offers You Might Like</p>
       <p class="related-group-label fr">Autres Offres Similaires</p>
       <p class="related-group-label es">Otras Ofertas Similares</p>
       <div class="related-mini-grid">${related.map(rb=>`
         <div class="book-card clickable-card" onclick="openBundle('${rb.id}')">
           <div style="background:var(--bg-dark);padding:.75rem;border-radius:2px 2px 0 0;text-align:center;">
             <div style="font-family:var(--display);font-size:22px;font-weight:700;color:var(--gold);">${rb.disc}</div>
             <div style="font-family:var(--ui);font-size:10px;color:rgba(255,255,255,.4);text-decoration:line-through;">${rb.orig}</div>
           </div>
           <div class="book-card-body">
             <div class="book-card-title">${rb.title}</div>
             <div class="book-card-meta">${rb.books.length} titles</div>
             <div class="book-card-price">${rb.save}</div>
           </div>
         </div>`).join('')}</div>`
    : '<p style="font-family:var(--body);font-style:italic;color:var(--text-muted);padding:.5rem 0" class="en">No similar offers at this time.</p><p style="font-family:var(--body);font-style:italic;color:var(--text-muted);padding:.5rem 0" class="fr">Aucune offre similaire pour le moment.</p>';

  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';

  if (b.timer) {
    const el = document.getElementById('bundle-modal-timer');
    if (el) {
      const update = () => {
        const diff = SALE_END - new Date();
        if (diff <= 0) { el.textContent = 'Expired'; return; }
        const h = String(Math.floor(diff/3600000)).padStart(2,'0');
        const m = String(Math.floor(diff%3600000/60000)).padStart(2,'0');
        const s = String(Math.floor(diff%60000/1000)).padStart(2,'0');
        el.textContent = `${h}:${m}:${s}`;
        setTimeout(update, 1000);
      };
      update();
    }
  }
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   COUNTDOWN TIMERS
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const SALE_END = new Date('2026-06-30T23:59:59');
function tickTimers(){
  function tick(){
    const diff = SALE_END - new Date();
    if(diff<=0){ document.querySelectorAll('[id^="timer-"]').forEach(el=>el.textContent='Expired'); ['en','fr','es'].forEach(l=>{const c=document.getElementById('ct-'+l);if(c)c.textContent='Expired';}); return; }
    const h=String(Math.floor(diff/3600000)).padStart(2,'0');
    const m=String(Math.floor(diff%3600000/60000)).padStart(2,'0');
    const s=String(Math.floor(diff%60000/1000)).padStart(2,'0');
    const str=`${h}:${m}:${s}`;
    document.querySelectorAll('[id^="timer-"]').forEach(el=>el.textContent=str);
    ['en','fr','es'].forEach(l=>{const c=document.getElementById('ct-'+l);if(c)c.textContent=str;});
  }
  tick();
  if(!window._tmr){ window._tmr=true; setInterval(tick,1000); }
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   PAGE ROUTING
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const pg = document.getElementById('page-'+id);
  if(pg) pg.classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
  document.querySelectorAll('.nav-link').forEach(l=>l.classList.remove('active'));
  if(id==='home') document.querySelectorAll('#nl-home').forEach(l=>l.classList.add('active'));
  if(id==='series-list'||id==='series-detail'){ document.querySelectorAll('#nl-series').forEach(l=>l.classList.add('active')); renderSeriesListPage(); }
  if(id==='bundles'){ document.querySelectorAll('#nl-bundles').forEach(l=>l.classList.add('active')); renderBundles('all'); }
  document.getElementById('main-footer').style.display='block';
}
function openSeries(key){ SERIES[key]; const s=SERIES[key]; if(!s) return; openSeries2(key); }
function openSeries2(key){
  if (!BOOKS || Object.keys(BOOKS).length === 0) return;
  const s=SERIES[key];
  document.getElementById('sdp-breadcrumb').innerHTML=`<a onclick="showPage('home')" class="en">Home</a><a onclick="showPage('home')" class="fr">Accueil</a><a onclick="showPage('home')" class="es">Inicio</a><span>›</span><a onclick="showPage('series-list')" class="en">Series</a><a onclick="showPage('series-list')" class="fr">Séries</a><a onclick="showPage('series-list')" class="es">Series</a><span>›</span><span>${s.name}</span>`;
  document.getElementById('sdp-tag').textContent=s.tag;
  document.getElementById('sdp-title').innerHTML=s.name;
  document.getElementById('sdp-desc').textContent=s.desc;
  document.getElementById('sdp-stats').innerHTML=s.stats.map(st=>`<div><div class="sdp-stat-n">${st.n}</div><div class="sdp-stat-l en">${st.l.en}</div><div class="sdp-stat-l fr">${st.l.fr}</div><div class="sdp-stat-l es">${st.l.es}</div></div>`).join('');
  document.getElementById('sdp-concept-head').textContent=s.conceptHead;
  document.getElementById('sdp-concept-body').textContent=s.conceptBody;
  const avail=s.volumes.filter(k=>BOOKS[k]?.available).length;
  document.getElementById('sdp-books-head-en').textContent=`All ${s.volumes.length} Titles in This Series`;
  document.getElementById('sdp-books-head-fr').textContent=`Les ${s.volumes.length} Titres de Cette Série`;
  document.getElementById('sdp-books-head-es').textContent=`Los ${s.volumes.length} Títulos de Esta Serie`;
  document.getElementById('sdp-avail-count').innerHTML=`<span class="en">${avail} available · ${s.volumes.length-avail} coming soon</span><span class="fr">${avail} disponibles · ${s.volumes.length-avail} à venir</span><span class="es">${avail} disponibles · ${s.volumes.length-avail} próximamente</span>`;
  document.getElementById('sdp-books-grid').innerHTML=s.volumes.map(k=>{
    const b=BOOKS[k];if(!b)return '';
    return `<div class="book-card clickable-card" onclick="openBook('${b.key}')" role="button" tabindex="0" style="position:relative;overflow:hidden;">
      <div style="position:relative;">${buildCover(b)}${b.vol?`<div class="vol-badge">${b.vol}</div>`:''}</div>
      <div class="book-card-body">
        <div class="book-card-title">${b.title}</div>
        <div class="book-card-meta">${b.genre}${b.vol?' · '+b.vol:''}</div>
        ${b.available?`<div class="book-card-price">${b.price}</div>`:`<div class="book-card-coming en">${b.release||'Coming Soon'}</div><div class="book-card-coming fr">${b.release||'À Venir'}</div><div class="book-card-coming es">${b.release||'Próximamente'}</div>`}
      </div>
    </div>`;
  }).join('');
  showPage('series-detail');
}

function goCatalog(){ showPage('home'); setTimeout(()=>document.getElementById('catalog')?.scrollIntoView({behavior:'smooth'}),80); }
function goAbout(){ showPage('home'); setTimeout(()=>document.getElementById('about')?.scrollIntoView({behavior:'smooth'}),80); }

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   LANGUAGE
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function setLang(l){
  if(window.__sotrSetLang){window.__sotrSetLang(l);return;}
  document.body.setAttribute('data-lang',l);
  localStorage.setItem('sotr-lang',l);
  document.querySelectorAll('.lang-btn').forEach(b=>b.classList.remove('active'));
  const _idx=['en','fr','es'].indexOf(l);
  document.querySelectorAll('.lang-btn').forEach((b,i)=>b.classList.toggle('active',i===_idx));
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   SEARCH
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function openSearch(){ document.getElementById('search-overlay').classList.add('open'); document.getElementById('si-input').focus(); document.body.style.overflow='hidden'; }
function closeSearch(){ document.getElementById('search-overlay').classList.remove('open'); document.body.style.overflow=''; document.getElementById('si-input').value=''; document.getElementById('search-results').innerHTML=''; }
function closeSBg(e){ if(e.target===document.getElementById('search-overlay')) closeSearch(); }
function doSearch(){
  if (!BOOKS || Object.keys(BOOKS).length === 0) return;
  const q=document.getElementById('si-input').value.toLowerCase();
  const out=document.getElementById('search-results');
  if(q.length<2){ out.innerHTML=''; return; }
  const matches=Object.values(BOOKS).filter(b=>b.title.toLowerCase().includes(q)||b.genre.toLowerCase().includes(q)||b.series.toLowerCase().includes(q)||b.subtitle.toLowerCase().includes(q));
  if(!matches.length){ out.innerHTML=`<p style="font-family:var(--body);font-style:italic;color:var(--text-muted);padding:1rem 0;" class="en">No titles found for "${q}"</p><p style="font-family:var(--body);font-style:italic;color:var(--text-muted);padding:1rem 0;" class="fr">Aucun titre trouvé pour « ${q} »</p><p style="font-family:var(--body);font-style:italic;color:var(--text-muted);padding:1rem 0;" class="es">No se encontraron títulos para "${q}"</p>`; return; }
  out.innerHTML=matches.map(b=>`<div class="sr-item" onclick="closeSearch();openBook('${b.key}')"><div class="sr-title">${b.title}</div><div class="sr-meta">${b.genre} · ${b.series} · ${b.lang}</div></div>`).join('');
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   FOOTER CATALOG LINKS
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function renderFooterLinks(){
  if (!BOOKS || Object.keys(BOOKS).length === 0) return;
  const keys=['mercer1','mercer7','iran','warorbits','anatomy2','chess','atlas','teacher','neural','invisible','haiti','crooked1'];
  document.getElementById('footer-catalog-links').innerHTML = keys.filter(k=>BOOKS[k]).map(k=>`<li><a onclick="openBook('${k}')">${BOOKS[k].title.replace(/ - Book \d/,'').replace(/ Vol\. \d/,'')}</a></li>`).join('');
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   NEWSLETTER
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function handleNL(){
  const v=document.getElementById('nl-input').value;
  if(!v||!v.includes('@'))return;
  document.getElementById('nl-input').style.display='none';
  document.querySelector('.nl-submit').style.display='none';
  document.getElementById('nl-confirm').style.display='block';
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   KEYBOARD
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){ closeModal(); closeSearch(); }
  if(e.key==='k'&&(e.metaKey||e.ctrlKey)){ e.preventDefault(); openSearch(); }
});
// Also allow Enter on card keyboard navigation
document.addEventListener('keydown',e=>{
  if(e.key==='Enter'&&e.target.hasAttribute('onclick')){
    e.target.click();
  }
});

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   INIT
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function renderHome() {
  renderHeroMosaic();
  renderHomeCatalog();
  renderHomeSeriesGrid();
  renderBBPreviews();
  renderSeriesListPage();
  renderBundles('all');
  renderFooterLinks();
}

(async function init() {
  await loadCatalog();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      renderHome();
      tickTimers();
    });
  } else {
    renderHome();
    tickTimers();
  }
})();


// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// SPY ON THE RISE â€” Site Logic v4
// Encoding: UTF-8
// Language system: bridges to Next.js body via window.__sotrSetLang
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ── LIVE CATALOG ─────────────────────────────────────────
// Loaded fresh from /api/catalog-live on every page load.
// Availability toggles from the admin dashboard appear on
// the live site within 10 seconds, no redeployment needed.
let BOOKS = {};
let SERIES = {};
let BUNDLES = [];
let PLATFORMS = {};
let PUBLISHING_TAXONOMY = [];

// Book/series/bundle text fields are admin-entered (dashboard forms with
// no format validation) and get interpolated straight into innerHTML
// template strings all over this file — including inside style="..."
// attributes (e.g. a cover's color swatch). Escaping at the point of
// use, for the fields actually reachable from the most-rendered card/
// cover builders below, closes the highest-traffic stored-XSS surface:
// a compromised admin session could otherwise plant a payload that
// fires for every site visitor, not just the admin.
function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function localizedTextMarkup(values) {
  return ['en', 'fr', 'es'].map(lang =>
    `<span class="${lang}">${escapeHtml(values?.[lang] || '')}</span>`,
  ).join('');
}

function localizedImageMarkup(values, fallback, alt, className) {
  return ['en', 'fr', 'es'].map(language => {
    const image = values?.[language] || (language === 'en' ? fallback : '');
    const altText = typeof alt === 'object' ? (alt[language] || '') : alt;
    return image
      ? `<img class="${className} ${language}" src="${escapeHtml(image)}" alt="${escapeHtml(altText || '')}" loading="lazy">`
      : '';
  }).join('');
}

function bookTitleValues(book) {
  return book.titles || {
    en: book.title_en || book.title || '',
    fr: book.title_fr || '',
    es: book.title_es || '',
  };
}

function bookTextValues(book, field, fallback='') {
  const values = book[field] || {};
  return {
    en: values.en || fallback,
    fr: values.fr || '',
    es: values.es || '',
  };
}

function seriesTextValues(series, field) {
  const legacy = field === 'name' ? series.name
    : field === 'desc' ? series.desc
      : field === 'conceptHead' ? series.conceptHead
        : series.conceptBody;
  const values = field === 'name' ? series.names
    : field === 'desc' ? series.descriptions
      : field === 'conceptHead' ? series.conceptHeads
        : series.conceptBodies;
  return {
    en: values?.en || series[`${field}_en`] || legacy || '',
    fr: values?.fr || series[`${field}_fr`] || '',
    es: values?.es || series[`${field}_es`] || '',
  };
}

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
    PUBLISHING_TAXONOMY = data.PUBLISHING_TAXONOMY || [];

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
  const titles = bookTitleValues(b);
  const titleMarkup = localizedTextMarkup(titles);
  const subtitles = bookTextValues(b, 'subtitles', b.subtitle || '');
  const genreLabels = bookTextValues(b, 'genreLabels', b.genre || '');
  const releases = bookTextValues(b, 'releases', b.release || '');
  const color = escapeHtml(b.color);
  const hasRelease = Object.values(releases).some(value => value && value !== 'TBD');
  const images = b.images || { en: b.image, fr: '', es: '' };
  const hasAnyImage = Object.values(images).some(Boolean);
  const imgHtml = hasAnyImage
    ? localizedImageMarkup(images, b.image, titles, 'book-cover-image')
        .replace(/src="([^"]+)"/g, (_, src) => `src="${src}${src.includes('?') ? '&' : '?'}v=${Date.now()}"`)
        .replace(/class="book-cover-image ([a-z]+)"/g, 'class="book-cover-image $1" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit;"')
    : '';
  const coverFallback = ['en', 'fr', 'es'].map(language => images[language] ? '' : `
    <div class="${language}">
      <div class="bc-orn">${escapeHtml(b.orn)}</div>
      <div class="bc-title-text" style="font-size:${fs};">${escapeHtml(titles[language] || '')}</div>
      ${subtitles[language] ? `<div class="bc-subtitle-text">${escapeHtml(subtitles[language])}</div>` : ''}
    </div>`).join('');

  if(!b.available){
    return `<div class="book-cover book-cover-unavail" style="position:relative;">
      <div class="book-cover-bg" style="background:${color};"></div>
      ${imgHtml ? `<div style="position:absolute;inset:0;overflow:hidden;border-radius:inherit;">${imgHtml}<div style="position:absolute;inset:0;background:rgba(0,0,0,0.55);"></div></div>` : ''}
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px;text-align:center;z-index:2;">
        <div class="unavail-icon">🔒</div>
        <div class="unavail-label">${localizedTextMarkup(
          { en: releases.en || 'Coming Soon', fr: releases.fr || 'À Venir', es: releases.es || 'Próximamente' },
        )}</div>
        <div style="font-family:var(--display);font-size:${fs};font-weight:700;color:rgba(255,255,255,0.75);margin-top:6px;line-height:1.25;">${titleMarkup}</div>
      </div>
      ${hasRelease ? `<div class="release-banner" style="z-index:3;">${localizedTextMarkup(releases)}</div>` : ''}
    </div>`;
  }

  return `<div class="book-cover" style="position:relative;">
    <div class="book-cover-bg" style="background:${color};"></div>
    ${imgHtml ? `<div style="position:absolute;inset:0;overflow:hidden;border-radius:inherit;">${imgHtml}</div>` : ''}
    <div class="book-cover-top" style="position:absolute;top:.7rem;left:.7rem;right:.7rem;z-index:2;">
      <span class="bc-genre-pill">${localizedTextMarkup(genreLabels)}</span>
    </div>
    <div class="book-cover-overlay" style="z-index:2;">
      ${coverFallback}
    </div>
  </div>`;
}

function buildBookCard(b, showVol=false){
  const titles = bookTitleValues(b);
  const subtitles = bookTextValues(b, 'subtitles', b.subtitle || '');
  const genreLabels = bookTextValues(b, 'genreLabels', b.genre || '');
  const prices = bookTextValues(b, 'prices', b.price || '');
  const volumeLabels = bookTextValues(b, 'volumeLabels', b.vol || '');
  const title = localizedTextMarkup(titles);
  return `<div class="book-card clickable-card" onclick="openBook('${b.key}')" style="overflow:hidden;" role="button" tabindex="0">
    <div style="position:relative;">${buildCover(b)}</div>
    <div class="book-card-body">
      <div class="book-card-title">${title}</div>
      ${Object.values(subtitles).some(Boolean) ? `<div class="book-card-meta">${localizedTextMarkup(subtitles)}</div>` : ''}
      ${b.authors?.length ? `<div class="book-card-meta">${b.authors.map(escapeHtml).join(', ')}</div>` : ''}
      <div class="book-card-meta">${localizedTextMarkup(genreLabels)}${showVol && b.vol ? ` · ${localizedTextMarkup(volumeLabels)}` : ''}</div>
      ${b.publishingSubcategory ? `<div class="book-card-meta">${escapeHtml(b.publishingCategory)} · ${escapeHtml(b.publishingSubcategory)}</div>` : ''}
      ${b.available ? `<div class="book-card-price">${localizedTextMarkup(prices)}</div>` : `<div class="book-card-coming">${localizedTextMarkup(prices)}</div>`}
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
  renderPublishingCategoryBrowse();
}

function renderPublishingCategoryBrowse(){
  const featuredGrid = document.getElementById('home-catalog-grid');
  if (!featuredGrid || !PUBLISHING_TAXONOMY.length) return;
  let browse = document.getElementById('publishing-category-browse');
  if (!browse) {
    browse = document.createElement('div');
    browse.id = 'publishing-category-browse';
    browse.style.cssText = 'margin-top:3rem;padding-top:2rem;border-top:1px solid rgba(255,255,255,.12);';
    featuredGrid.insertAdjacentElement('afterend', browse);
  }
  const option = (value, label) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`;
  const genres = [...new Set(Object.values(BOOKS).map(book => book.genre).filter(Boolean))].sort();
  const subjects = [...new Set(Object.values(BOOKS).flatMap(book => book.subjects || []))].sort();
  const audiences = [...new Set(Object.values(BOOKS).map(book => book.targetAudience).filter(Boolean))].sort();
  const contentTypes = [...new Set(Object.values(BOOKS).map(book => book.contentType).filter(Boolean))].sort();
  const languages = [...new Set(Object.values(BOOKS).flatMap(book => [...(book.editionLanguages || []), book.lang]).filter(Boolean))].sort();
  const formats = [...new Set(Object.values(BOOKS).flatMap(book => book.formats || []))].sort();
  browse.innerHTML = `
    <h3 class="section-title" style="font-size:clamp(20px,2.4vw,30px);margin-bottom:1rem;">
      <span class="en">Browse by <em>Category</em></span>
      <span class="fr">Explorer par <em>catégorie</em></span>
      <span class="es">Explorar por <em>categoría</em></span>
    </h3>
    <div style="display:flex;flex-wrap:wrap;gap:.65rem;margin-bottom:1.25rem;">
      <select id="publishing-parent-filter" aria-label="Publishing category" style="min-width:220px;padding:.65rem;background:#171717;color:#eee;border:1px solid #444;">
        ${option('', 'All publishing categories')}
        ${PUBLISHING_TAXONOMY.map(category => option(category.label, category.label)).join('')}
      </select>
      <select id="publishing-child-filter" aria-label="Publishing subcategory" style="min-width:220px;padding:.65rem;background:#171717;color:#eee;border:1px solid #444;" disabled>
        ${option('', 'Select a category first')}
      </select>
      <select id="publishing-genre-filter" aria-label="Genre" style="min-width:180px;padding:.65rem;background:#171717;color:#eee;border:1px solid #444;">
        ${option('', 'All genres')}${genres.map(value => option(value, value)).join('')}
      </select>
      <select id="publishing-subject-filter" aria-label="Subject" style="min-width:180px;padding:.65rem;background:#171717;color:#eee;border:1px solid #444;">
        ${option('', 'All subjects')}${subjects.map(value => option(value, value)).join('')}
      </select>
      <select id="publishing-audience-filter" aria-label="Audience" style="min-width:160px;padding:.65rem;background:#171717;color:#eee;border:1px solid #444;">
        ${option('', 'All audiences')}${audiences.map(value => option(value, value)).join('')}
      </select>
      <select id="publishing-content-type-filter" aria-label="Content type" style="min-width:160px;padding:.65rem;background:#171717;color:#eee;border:1px solid #444;">
        ${option('', 'All content types')}${contentTypes.map(value => option(value, value)).join('')}
      </select>
      <select id="publishing-language-filter" aria-label="Edition language" style="min-width:160px;padding:.65rem;background:#171717;color:#eee;border:1px solid #444;">
        ${option('', 'All languages')}${languages.map(value => option(value, value)).join('')}
      </select>
      <select id="publishing-format-filter" aria-label="Published format" style="min-width:160px;padding:.65rem;background:#171717;color:#eee;border:1px solid #444;">
        ${option('', 'All formats')}${formats.map(value => option(value, value)).join('')}
      </select>
      <input id="publishing-age-min-filter" type="number" min="0" aria-label="Minimum age" placeholder="Age from" style="width:110px;padding:.65rem;background:#171717;color:#eee;border:1px solid #444;">
      <input id="publishing-age-max-filter" type="number" min="0" aria-label="Maximum age" placeholder="Age to" style="width:110px;padding:.65rem;background:#171717;color:#eee;border:1px solid #444;">
    </div>
    <div id="publishing-category-results" style="font-size:13px;color:var(--text-muted);">Choose a filter to browse the catalogue.</div>
    <div id="publishing-category-grid" class="books-grid"></div>
  `;
  const parent = browse.querySelector('#publishing-parent-filter');
  const child = browse.querySelector('#publishing-child-filter');
  const controls = ['genre', 'subject', 'audience', 'content-type', 'language', 'format']
    .map(name => browse.querySelector(`#publishing-${name}-filter`));
  const ageMin = browse.querySelector('#publishing-age-min-filter');
  const ageMax = browse.querySelector('#publishing-age-max-filter');
  const grid = browse.querySelector('#publishing-category-grid');
  const results = browse.querySelector('#publishing-category-results');
  const renderResults = () => {
    const categoryLabel = parent.value;
    const childLabel = child.value;
    const [genre, subject, audience, contentType, language, format] = controls.map(control => control.value);
    const minimumAge = ageMin.value === '' ? null : Number(ageMin.value);
    const maximumAge = ageMax.value === '' ? null : Number(ageMax.value);
    const hasFilter = !!(categoryLabel || genre || subject || audience || contentType || language || format || minimumAge !== null || maximumAge !== null);
    const matches = Object.values(BOOKS).filter(book =>
      (!categoryLabel || book.publishingCategory === categoryLabel) &&
      (!childLabel || book.publishingSubcategory === childLabel) &&
      (!genre || book.genre === genre || (book.genres || []).includes(genre)) &&
      (!subject || (book.subjects || []).includes(subject)) &&
      (!audience || book.targetAudience === audience) &&
      (!contentType || book.contentType === contentType) &&
      (!language || book.lang === language || (book.editionLanguages || []).includes(language)) &&
      (!format || (book.formats || []).includes(format)) &&
      (minimumAge === null || (book.ageRangeMin != null || book.ageRangeMax != null) &&
        (book.ageRangeMax == null || Number(book.ageRangeMax) >= minimumAge)) &&
      (maximumAge === null || (book.ageRangeMin != null || book.ageRangeMax != null) &&
        (book.ageRangeMin == null || Number(book.ageRangeMin) <= maximumAge)),
    );
    results.textContent = hasFilter ? `${matches.length} title${matches.length === 1 ? '' : 's'}` : 'Choose a filter to browse the catalogue.';
    grid.innerHTML = hasFilter ? matches.map(book => buildBookCard(book)).join('') : '';
  };
  parent.addEventListener('change', () => {
    const category = PUBLISHING_TAXONOMY.find(item => item.label === parent.value);
    child.innerHTML = option('', category ? 'All subcategories' : 'Select a category first') +
      (category?.subcategories || []).map(value => option(value, value)).join('');
    child.disabled = !category;
    child.value = '';
    renderResults();
  });
  child.addEventListener('change', renderResults);
  controls.forEach(control => control.addEventListener('change', renderResults));
  ageMin.addEventListener('input', renderResults);
  ageMax.addEventListener('input', renderResults);
}

function renderHomeSeriesGrid(){
  if (!BOOKS || Object.keys(BOOKS).length === 0) return;
  document.getElementById('home-series-grid').innerHTML = Object.values(SERIES).map(s=>{
    const names = seriesTextValues(s, 'name');
    const descriptions = seriesTextValues(s, 'desc');
    const covers = s.covers || { en: s.cover_en, fr: '', es: '' };
    const hasCover = Object.values(covers).some(Boolean);
    return `
    <div class="series-overview-card" onclick="openSeries('${s.key}')" role="button" tabindex="0">
      ${hasCover ? localizedImageMarkup(covers, s.cover_en, names, 'soc-cover') : ''}
      <div class="soc-num">${s.num}</div>
      <div class="soc-tag">${escapeHtml(s.tag)}</div>
      <div class="soc-name">${localizedTextMarkup(names)}</div>
      <div class="soc-desc">${localizedTextMarkup(descriptions)}</div>
      <div class="soc-count">${s.totalVols} <span class="en">volumes</span><span class="fr">volumes</span><span class="es">volúmenes</span> · EN/FR <span class="soc-arrow">→</span></div>
    </div>`;}).join('');
}

function renderHeroMosaic(){
  if (!BOOKS || Object.keys(BOOKS).length === 0) return;
  const keys = ['mercer1','iran','anatomy2','chess','atlas','neural'];
  document.getElementById('hero-mosaic').innerHTML = keys.map(k=>{
    const b=BOOKS[k];
    if(!b) return null;
    const titles = bookTitleValues(b);
    const genres = bookTextValues(b, 'genreLabels', b.genre || '');
    return `<div class="hero-mini-card" onclick="openBook('${b.key}')">
      <div class="hero-mini-inner" style="background:${b.color};">
        <div class="hero-mini-content"><div class="hmc-genre">${localizedTextMarkup(genres)}</div><div class="hmc-title">${localizedTextMarkup(titles)}</div><div class="hmc-orn">${escapeHtml(b.orn)}</div></div>
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
  document.getElementById('series-list-grid').innerHTML = Object.values(SERIES).map(s=>{
    const names = seriesTextValues(s, 'name');
    const descriptions = seriesTextValues(s, 'desc');
    const covers = s.covers || { en: s.cover_en, fr: '', es: '' };
    const hasCover = Object.values(covers).some(Boolean);
    return `
    <div class="series-overview-card" onclick="openSeries('${s.key}')" role="button" tabindex="0">
      ${hasCover ? localizedImageMarkup(covers, s.cover_en, names, 'soc-cover') : ''}
      <div class="soc-num">${escapeHtml(s.num)}</div>
      <div class="soc-tag">${escapeHtml(s.tag)}</div>
      <div class="soc-name">${localizedTextMarkup(names)}</div>
      <div class="soc-desc">${localizedTextMarkup(descriptions)}</div>
      <div class="soc-count">${s.totalVols} <span class="en">volumes · Explore →</span><span class="fr">volumes · Explorer →</span><span class="es">volúmenes · Explorar →</span></div>
    </div>`;}).join('');
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   BOOK MODAL - points (b)(e)
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
let currentFmt = 'print';
function openBook(key){
  if (!BOOKS || Object.keys(BOOKS).length === 0) return;
  const b = BOOKS[key];
  const titles = bookTitleValues(b);
  const subtitles = bookTextValues(b, 'subtitles', b.subtitle || '');
  const genreLabels = bookTextValues(b, 'genreLabels', b.genre || '');
  const releases = bookTextValues(b, 'releases', b.release || '');
  const volumeLabels = bookTextValues(b, 'volumeLabels', b.vol || '');
  const seriesNames = bookTextValues(b, 'seriesNames', b.series || '');
  // Cover in modal header
  document.getElementById('modal-cover-box').innerHTML = buildCover(b,'small');
  document.getElementById('mh-genre').innerHTML = localizedTextMarkup(genreLabels);
  document.getElementById('mh-title').innerHTML = localizedTextMarkup(titles);
  document.getElementById('mh-subtitle').innerHTML = localizedTextMarkup(subtitles);
  document.getElementById('mh-meta').innerHTML = `<span>${escapeHtml(b.lang || '')}</span><span style="margin:0 5px;opacity:.25;">·</span><span>${escapeHtml(b.pages || '')}</span><span style="margin:0 5px;opacity:.25;">·</span>${localizedTextMarkup(seriesNames)}${b.vol ? `<span style="margin:0 5px;opacity:.25;">·</span>${localizedTextMarkup(volumeLabels)}` : ''}`;
  // Unavailable notice + email signup
  const _safeTitle = titles.en.replace(/'/g,'').replace(/"/g,'');
  document.getElementById('mh-unavail').innerHTML = !b.available
    ? `<div class="unavail-notice" id="unavail-${b.key}">
        <div class="un-title en">Coming ${escapeHtml(releases.en||'Soon')}</div>
        <div class="un-title fr">Sortie ${escapeHtml(releases.fr||'prochaine')}</div>
        <div class="un-title es">Llegando ${escapeHtml(releases.es||'pronto')}</div>
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
  document.getElementById('modal-synopsis').innerHTML = localizedTextMarkup(
    b.synopses || {
      en: b.synopsis_en || b.synopsis || '',
      fr: b.synopsis_fr || '',
      es: b.synopsis_es || '',
    },
  );
  const detailFields = [
    b.publishingCategory ? [['Publishing Category','Catégorie éditoriale','Categoría editorial'], escapeHtml(b.publishingCategory)] : null,
    b.publishingSubcategory ? [['Subcategory','Sous-catégorie','Subcategoría'], escapeHtml(b.publishingSubcategory)] : null,
    b.genre  ? [['Genre','Genre','Género'], localizedTextMarkup(genreLabels)] : null,
    b.lang   ? [['Language','Langue','Idioma'], escapeHtml(b.lang)] : null,
    b.pages  ? [['Pages','Pages','Páginas'], escapeHtml(b.pages)] : null,
    b.series ? [['Series','Série','Serie'], `${localizedTextMarkup(seriesNames)}${b.vol ? ` · ${localizedTextMarkup(volumeLabels)}` : ''}`] : null,
    b.release? [['Release','Sortie','Lanzamiento'], localizedTextMarkup(releases)] : null,
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
    const relatedSeries = SERIES[b.seriesKey];
    const seriesNames = relatedSeries ? seriesTextValues(relatedSeries, 'name') : { en:b.series, fr:b.series, es:b.series };
    html += `<p class="related-group-label en">Other books in ${escapeHtml(seriesNames.en)}</p>
             <p class="related-group-label fr">Autres livres dans ${escapeHtml(seriesNames.fr)}</p>
             <p class="related-group-label es">Otros libros de ${escapeHtml(seriesNames.es)}</p>
             <div class="related-mini-grid">${sameSeries.map(bk=>buildRelatedCard(bk)).join('')}</div>`;
  }
  if(sameGenre.length){
    const genreLabels = bookTextValues(b, 'genreLabels', b.genre || '');
    html += `<p class="related-group-label en" style="margin-top:1.75rem;">More in <em>${escapeHtml(genreLabels.en)}</em></p>
             <p class="related-group-label fr" style="margin-top:1.75rem;">Plus dans <em>${escapeHtml(genreLabels.fr)}</em></p>
             <p class="related-group-label es" style="margin-top:1.75rem;">Más en <em>${escapeHtml(genreLabels.es)}</em></p>
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
  const titles = bookTitleValues(b);
  const subtitles = bookTextValues(b, 'subtitles', b.subtitle || '');
  const prices = bookTextValues(b, 'prices', b.price || '');
  return `<div class="book-card clickable-card" onclick="closeModal();setTimeout(()=>openBook('${b.key}'),160)" role="button" tabindex="0" style="overflow:hidden;">
    <div>${buildCover(b,'small')}</div>
    <div class="book-card-body">
      <div class="book-card-title" style="font-size:12px;">${localizedTextMarkup(titles)}</div>
      ${Object.values(subtitles).some(Boolean) ? `<div class="book-card-meta">${localizedTextMarkup(subtitles)}</div>` : ''}
      ${b.available ? `<div class="book-card-price" style="font-size:12px;">${localizedTextMarkup(prices)}</div>` : `<div class="book-card-coming" style="font-size:11px;">${localizedTextMarkup(prices)}</div>`}
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
    <div class="bundle-card ${b.isGold?'gold-card':''}" onclick="openBundle('${b.id}')">
      <div class="bc-head">
        <div class="bc-badges"><span class="badge-type ${BADGE_CLASSES[b.badge]||'badge-bundle'}"><span class="en">${BADGE_LABELS[b.badge]?.en||''}</span><span class="fr">${BADGE_LABELS[b.badge]?.fr||''}</span><span class="es">${BADGE_LABELS[b.badge]?.es||''}</span></span></div>
        <div class="bc-title">${escapeHtml(b.title)}</div><div class="bc-subtitle">${escapeHtml(b.subtitle)}</div>
      </div>
      <div class="bc-books">${b.books.map(bk=>`<span class="bk-chip">${escapeHtml(bk)}</span>`).join('')}</div>
      <div class="bc-foot">
        <div class="bc-foot-row">
          <div><div class="bc-orig">${escapeHtml(b.orig)}</div><div class="bc-disc">${escapeHtml(b.disc)}</div><div class="bc-save ${b.isGold?'gold':''}">${escapeHtml(b.save)}</div></div>
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
      <span style="font-family:var(--body);font-size:14px;color:var(--text-primary);">${escapeHtml(bk)}</span>
    </div>`).join('');

  const savings = `
    <div style="text-align:center;padding:1.25rem;background:var(--bg-muted);border-radius:var(--r);margin:1rem 0;">
      <div style="font-family:var(--ui);font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--text-muted);margin-bottom:4px;">
        <span class="en">Bundle Price</span><span class="fr">Prix du Lot</span><span class="es">Precio del Paquete</span>
      </div>
      <div style="font-family:var(--display);font-size:36px;font-weight:700;color:var(--crimson);line-height:1;">${escapeHtml(b.disc)}</div>
      <div style="font-family:var(--ui);font-size:13px;color:var(--text-muted);text-decoration:line-through;margin-top:4px;">${escapeHtml(b.orig)}</div>
      <div style="display:inline-block;margin-top:8px;background:var(--green-bg);color:var(--green);font-family:var(--ui);font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;">${escapeHtml(b.save)}</div>
    </div>`;

  const timerHtml = b.timer ? `
    <div style="text-align:center;background:var(--gold-bg);border:1px solid var(--gold-border);border-radius:var(--r);padding:.75rem;margin-bottom:1rem;">
      <div style="font-family:var(--ui);font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);">
        <span class="en">&#9889; Offer ends in</span>
        <span class="fr">&#9889; Offre se termine dans</span>
        <span class="es">&#9889; Oferta termina en</span>
      </div>
      <div class="bc-countdown" id="bundle-modal-timer" style="font-family:var(--display);font-size:22px;font-weight:700;color:var(--gold);margin-top:4px;">00:00:00</div>
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
    <p style="font-family:var(--body);font-size:15px;line-height:1.8;color:var(--text-secondary);margin-bottom:1.25rem;">${escapeHtml(b.subtitle)}</p>
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
  const names = seriesTextValues(s, 'name');
  const descriptions = seriesTextValues(s, 'desc');
  document.getElementById('sdp-breadcrumb').innerHTML=`<a onclick="showPage('home')" class="en">Home</a><a onclick="showPage('home')" class="fr">Accueil</a><a onclick="showPage('home')" class="es">Inicio</a><span>›</span><a onclick="showPage('series-list')" class="en">Series</a><a onclick="showPage('series-list')" class="fr">Séries</a><a onclick="showPage('series-list')" class="es">Series</a><span>›</span>${localizedTextMarkup(names)}`;
  document.getElementById('sdp-tag').textContent=s.tag || '';
  document.getElementById('sdp-title').innerHTML=localizedTextMarkup(names);
  document.getElementById('sdp-desc').innerHTML=localizedTextMarkup(descriptions);
  const covers = s.covers || { en: s.cover_en, fr: '', es: '' };
  const hasCover = Object.values(covers).some(Boolean);
  const coverContainer = document.getElementById('sdp-cover');
  if (coverContainer) coverContainer.innerHTML = hasCover
    ? localizedImageMarkup(covers, s.cover_en, names, 'sdp-cover-image')
    : '';
  document.getElementById('sdp-stats').innerHTML=s.stats.map(st=>`<div><div class="sdp-stat-n">${st.n}</div><div class="sdp-stat-l en">${st.l.en}</div><div class="sdp-stat-l fr">${st.l.fr}</div><div class="sdp-stat-l es">${st.l.es}</div></div>`).join('');
  document.getElementById('sdp-concept-head').innerHTML=localizedTextMarkup(seriesTextValues(s, 'conceptHead'));
  document.getElementById('sdp-concept-body').innerHTML=localizedTextMarkup(seriesTextValues(s, 'conceptBody'));
  const avail=s.volumes.filter(k=>BOOKS[k]?.available).length;
  document.getElementById('sdp-books-head-en').textContent=`All ${s.volumes.length} Titles in This Series`;
  document.getElementById('sdp-books-head-fr').textContent=`Les ${s.volumes.length} Titres de Cette Série`;
  document.getElementById('sdp-books-head-es').textContent=`Los ${s.volumes.length} Títulos de Esta Serie`;
  document.getElementById('sdp-avail-count').innerHTML=`<span class="en">${avail} available · ${s.volumes.length-avail} coming soon</span><span class="fr">${avail} disponibles · ${s.volumes.length-avail} à venir</span><span class="es">${avail} disponibles · ${s.volumes.length-avail} próximamente</span>`;
  document.getElementById('sdp-books-grid').innerHTML=s.volumes.map(k=>{
    const b=BOOKS[k];if(!b)return '';
    const titles = bookTitleValues(b);
    const subtitles = bookTextValues(b, 'subtitles', b.subtitle || '');
    const genreLabels = bookTextValues(b, 'genreLabels', b.genre || '');
    const prices = bookTextValues(b, 'prices', b.price || '');
    const releases = bookTextValues(b, 'releases', b.release || '');
    const volumeLabels = bookTextValues(b, 'volumeLabels', b.vol || '');
    return `<div class="book-card clickable-card" onclick="openBook('${b.key}')" role="button" tabindex="0" style="position:relative;overflow:hidden;">
      <div style="position:relative;">${buildCover(b)}${b.vol?`<div class="vol-badge">${localizedTextMarkup(volumeLabels)}</div>`:''}</div>
      <div class="book-card-body">
        <div class="book-card-title">${localizedTextMarkup(titles)}</div>
        ${Object.values(subtitles).some(Boolean) ? `<div class="book-card-meta">${localizedTextMarkup(subtitles)}</div>` : ''}
        <div class="book-card-meta">${localizedTextMarkup(genreLabels)}${b.vol ? ` · ${localizedTextMarkup(volumeLabels)}` : ''}</div>
        ${b.available ? `<div class="book-card-price">${localizedTextMarkup(prices)}</div>` : `<div class="book-card-coming">${localizedTextMarkup({
          en: releases.en || 'Coming Soon', fr: releases.fr || 'À Venir', es: releases.es || 'Próximamente',
        })}</div>`}
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
  const matches=Object.values(BOOKS).filter(b=>
    Object.values(bookTitleValues(b)).some(title=>title.toLowerCase().includes(q))
    || Object.values(bookTextValues(b, 'genreLabels', b.genre || '')).some(value => value.toLowerCase().includes(q))
    || Object.values(bookTextValues(b, 'seriesNames', b.series || '')).some(value => value.toLowerCase().includes(q))
    || Object.values(bookTextValues(b, 'subtitles', b.subtitle || '')).some(value => value.toLowerCase().includes(q))
  );
  if(!matches.length){ out.innerHTML=`<p style="font-family:var(--body);font-style:italic;color:var(--text-muted);padding:1rem 0;" class="en">No titles found for "${q}"</p><p style="font-family:var(--body);font-style:italic;color:var(--text-muted);padding:1rem 0;" class="fr">Aucun titre trouvé pour « ${q} »</p><p style="font-family:var(--body);font-style:italic;color:var(--text-muted);padding:1rem 0;" class="es">No se encontraron títulos para "${q}"</p>`; return; }
  out.innerHTML=matches.map(b=>`<div class="sr-item" onclick="closeSearch();openBook('${b.key}')"><div class="sr-title">${localizedTextMarkup(bookTitleValues(b))}</div><div class="sr-meta">${localizedTextMarkup(bookTextValues(b, 'genreLabels', b.genre || ''))} · ${localizedTextMarkup(bookTextValues(b, 'seriesNames', b.series || ''))} · ${escapeHtml(b.lang)}</div></div>`).join('');
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   FOOTER CATALOG LINKS
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const PODCAST_PLATFORM_LABELS={apple:'Apple Podcasts',spotify:'Spotify',amazon:'Amazon Music',iheart:'iHeartRadio',castbox:'Castbox',overcast:'Overcast',pocketcasts:'Pocket Casts',podcastaddict:'Podcast Addict',deezer:'Deezer',playerfm:'Player FM',castro:'Castro',goodpods:'Goodpods',truefans:'TrueFans'};
function openPodcastModal(){
  const platforms=(window.__sotrFeaturedText&&window.__sotrFeaturedText.podcastPlatforms)||{};
  const entries=Object.entries(platforms).filter(([,url])=>!!url);
  const list=document.getElementById('podcast-platform-list');
  if(!entries.length){
    list.innerHTML='<p style="font-family:var(--body);font-style:italic;color:var(--text-muted);" class="en">Podcast links coming soon.</p><p style="font-family:var(--body);font-style:italic;color:var(--text-muted);" class="fr">Liens du podcast bientôt disponibles.</p><p style="font-family:var(--body);font-style:italic;color:var(--text-muted);" class="es">Enlaces del podcast próximamente.</p>';
  } else {
    list.innerHTML=entries.map(([key,url])=>`
      <div class="platform-row">
        <div class="pr-name">${PODCAST_PLATFORM_LABELS[key]||(key.charAt(0).toUpperCase()+key.slice(1))}</div>
        <a href="${url}" class="btn-buy" target="_blank" rel="noopener">
          <span class="en">Listen</span><span class="fr">Écouter</span><span class="es">Escuchar</span>
        </a>
      </div>`).join('');
  }
  document.getElementById('podcast-modal-overlay').classList.add('open');
  document.body.style.overflow='hidden';
}
function closePodcastModal(){ document.getElementById('podcast-modal-overlay').classList.remove('open'); document.body.style.overflow=''; }
function closePodBg(e){ if(e.target===document.getElementById('podcast-modal-overlay')) closePodcastModal(); }

function renderFooterLinks(){
  if (!BOOKS || Object.keys(BOOKS).length === 0) return;
  const keys=['mercer1','mercer7','iran','warorbits','anatomy2','chess','atlas','teacher','neural','invisible','haiti','crooked1'];
  document.getElementById('footer-catalog-links').innerHTML = keys.filter(k=>BOOKS[k]).map(k=>`<li><a onclick="openBook('${k}')">${BOOKS[k].title.replace(/ - Book \d/,'').replace(/ Vol\. \d/,'')}</a></li>`).join('');
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   NEWSLETTER
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
async function handleNL(){
  const input = document.getElementById('nl-input');
  const btn = document.querySelector('.nl-submit');
  const confirmEl = document.getElementById('nl-confirm');
  const v = (input.value || '').trim();
  if (!v || !v.includes('@') || !v.includes('.')) return;

  if (btn) { btn.disabled = true; btn.style.opacity = '.5'; }
  try {
    const lang = document.body.getAttribute('data-lang') || 'en';
    const r = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: v, lang, type: 'notification', tag: 'new-releases' }),
    });
    if (!r.ok) throw new Error('request failed');
    input.style.display = 'none';
    if (btn) btn.style.display = 'none';
    if (confirmEl) confirmEl.style.display = 'block';
  } catch (e) {
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
    console.error('[Newsletter] Signup failed:', e.message);
  }
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

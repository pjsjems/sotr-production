import { useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script';

const COMING_SOON_MODE = true; // Set to false when ready to launch publicly

export default function Home() {
  useEffect(() => {
    // Domain-based lock: show coming soon on public domain, allow full
    // access on vercel.app preview URL
    if (COMING_SOON_MODE) {
      const host = window.location.hostname;
      const isPublicDomain =
        host === 'spyontherise.com' ||
        host === 'www.spyontherise.com';
      const isPreviewUrl =
        host.includes('vercel.app') ||
        host === 'localhost' ||
        host === '127.0.0.1';
      const hasAdminBypass =
        new URLSearchParams(window.location.search).get('preview') === 'sotr2026' ||
        localStorage.getItem('sotr-preview') === 'sotr2026';

      if (new URLSearchParams(window.location.search).get('preview') === 'sotr2026') {
        localStorage.setItem('sotr-preview', 'sotr2026');
      }

      if (isPublicDomain && !hasAdminBypass) {
        const el = document.getElementById('coming-soon-overlay');
        if (el) {
          el.style.display = 'flex';
          document.body.style.overflow = 'hidden';
          document.body.style.pointerEvents = 'none';
          el.style.pointerEvents = 'all';
        }
      }
    }

    // ── FIX: Set data-lang on the real <body> element ──────────────────
    // Next.js renders SITE_HTML inside a <div>, so the data-lang="en"
    // inside the HTML string never reaches document.body.
    // We set it here on mount so the CSS language filters work correctly.
    const saved = localStorage.getItem('sotr-lang') || 'en';
    document.body.setAttribute('data-lang', saved);

    // ── FIX: Patch setLang to update real body + persist choice ────────
    window.__sotrSetLang = function(l) {
      document.body.setAttribute('data-lang', l);
      localStorage.setItem('sotr-lang', l);
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
      const idx = ['en','fr','es'].indexOf(l);
      if (idx >= 0) {
        const btns = document.querySelectorAll('.lang-btn');
        if (btns[idx]) btns[idx].classList.add('active');
      }
    };

    // Sync active lang button to saved language
    setTimeout(() => {
      const idx = ['en','fr','es'].indexOf(saved);
      document.querySelectorAll('.lang-btn').forEach((b,i) => {
        b.classList.toggle('active', i === idx);
      });
    }, 50);
  }, []);

  return (
    <>
      {COMING_SOON_MODE && (
        <div id="coming-soon-overlay" style={{
          display:'none',
          position:'fixed', inset:0, zIndex:99999,
          background:'#16110C',
          flexDirection:'column',
          alignItems:'center', justifyContent:'center',
          textAlign:'center', padding:'2rem',
        }}>
          <div style={{color:'#7A1515',fontSize:'28px',marginBottom:'1rem',
            letterSpacing:'.2em'}}>◆</div>
          <div style={{fontFamily:'Georgia,serif',fontSize:'clamp(28px,5vw,52px)',
            fontWeight:700,color:'#F0EDE8',lineHeight:1.2,marginBottom:'1rem'}}>
            SPY ON THE RISE
          </div>
          <div style={{fontFamily:'Georgia,serif',fontSize:'clamp(14px,2vw,20px)',
            fontStyle:'italic',color:'#B8B0A5',marginBottom:'2.5rem'}}>
            Where Ideas Rise. Where Voices Ascend.
          </div>
          <div style={{width:48,height:2,background:'#7A1515',marginBottom:'2.5rem'}}/>
          <div style={{fontFamily:'Arial,sans-serif',fontSize:'clamp(13px,1.8vw,17px)',
            fontWeight:600,letterSpacing:'.18em',textTransform:'uppercase',
            color:'#7A1515',marginBottom:'1rem'}}>
            Launching Soon
          </div>
          <div style={{fontFamily:'Georgia,serif',fontSize:'clamp(13px,1.6vw,16px)',
            color:'#6B6560',maxWidth:420,lineHeight:1.8}}>
            Our full catalog of geopolitical essays, espionage thrillers,
            speculative fiction, and bilingual poetry is almost ready.
          </div>
          <div style={{marginTop:'3rem',fontFamily:'Arial,sans-serif',
            fontSize:'12px',letterSpacing:'.12em',textTransform:'uppercase',
            color:'#3D3328'}}>
            spyontherise.com
          </div>
        </div>
      )}
      <Head>
        <meta charSet="utf-8" />
        <title>SPY ON THE RISE — Independent Publishing House</title>
        <meta name="description" content="Where Ideas Rise. Where Voices Ascend. Geopolitical essays, espionage thrillers, speculative fiction, behavioral sociology, and poetry." />
        <meta property="og:title" content="SPY ON THE RISE — Independent Publishing House" />
        <meta property="og:description" content="Where Ideas Rise. Where Voices Ascend. A bilingual publishing house at the intersection of bold ideas and rising voices." />
        <meta property="og:url" content="https://spyontherise.com" />
        <meta property="og:type" content="website" />
      </Head>

      <div
        id="sotr-root"
        dangerouslySetInnerHTML={{ __html: SITE_HTML }}
        suppressHydrationWarning={true}
      />

      <Script src="/site-logic.js" strategy="afterInteractive" />
    </>
  );
}

const SITE_HTML = `<!-- TOPBAR -->
<div class="topbar">
  <span class="en">First Publication Wave 2026: <strong>Iran: The Laboratory</strong> · The Chess-Go Game · The Teacher's Gun · and more. Pre-orders open.</span>
  <span class="fr">Première vague de publication 2026 : <strong>L'Iran : Le Laboratoire</strong> · Le Jeu Échecs-Go · Le Fusil du Professeur · et plus. Pré-commandes ouvertes.</span>
  <span class="es">Primera ola de publicación 2026: <strong>Irán: El Laboratorio</strong> · El Juego Ajedrez-Go · El Fusil del Profesor · y más. Preventas abiertas.</span>
</div>

<!-- NAVIGATION -->
<nav>
  <div class="nav-inner">
    <a class="nav-logo" onclick="showPage('home')">
      <span class="nav-logo-main">Spy on the Rise</span>
      <span class="nav-logo-sub en">Independent Publishing House</span>
      <span class="nav-logo-sub fr">Maison d'Édition Indépendante</span>
      <span class="nav-logo-sub es">Editorial Independiente</span>
    </a>
    <ul class="nav-links">
      <li><span class="nav-link en" id="nl-home" onclick="showPage('home')">Home</span><span class="nav-link fr" onclick="showPage('home')">Accueil</span><span class="nav-link es" onclick="showPage('home')">Inicio</span></li>
      <li><span class="nav-link en" onclick="goCatalog()">Catalog</span><span class="nav-link fr" onclick="goCatalog()">Catalogue</span><span class="nav-link es" onclick="goCatalog()">Catálogo</span></li>
      <li><span class="nav-link en" id="nl-series" onclick="showPage('series-list')">Series</span><span class="nav-link fr" onclick="showPage('series-list')">Séries</span><span class="nav-link es" onclick="showPage('series-list')">Series</span></li>
      <li><span class="nav-link en" id="nl-bundles" onclick="showPage('bundles')">Bundles & Deals</span><span class="nav-link fr" onclick="showPage('bundles')">Offres & Lots</span><span class="nav-link es" onclick="showPage('bundles')">Paquetes</span></li>
      <li><span class="nav-link en" onclick="goAbout()">About</span><span class="nav-link fr" onclick="goAbout()">À Propos</span><span class="nav-link es" onclick="goAbout()">Acerca de</span></li>
    </ul>
    <div class="nav-right">
      <div class="lang-switch">
        <button class="lang-btn active" onclick="setLang('en')">EN</button>
        <button class="lang-btn" onclick="setLang('fr')">FR</button>
        <button class="lang-btn" onclick="setLang('es')">ES</button>
      </div>
      <button class="nav-search-btn" onclick="openSearch()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <span class="en">Search</span><span class="fr">Rechercher</span><span class="es">Buscar</span>
      </button>
    </div>
  </div>
</nav>

<!-- ════════ PAGE: HOME ════════ -->
<div id="page-home" class="page active">
  <!-- Hero -->
  <section class="hero">
    <div class="hero-left">
      <p class="hero-eyebrow en">Independent Publishing House</p>
      <p class="hero-eyebrow fr">Maison d'Édition Indépendante</p>
      <p class="hero-eyebrow es">Editorial Independiente</p>
      <h1 class="hero-title"><span class="en">Where <em>Stories</em><br>Command <em>Power</em></span><span class="fr">Là où les <em>Récits</em><br>Exercent le <em>Pouvoir</em></span><span class="es">Donde las <em>Historias</em><br>Ejercen el <em>Poder</em></span></h1>
      <span class="hero-orn">◆ ◆ ◆</span>
      <p class="hero-desc en">Where Ideas Rise. Where Voices Ascend. Geopolitical essays, espionage thrillers, speculative fiction, behavioral sociology, and poetry — a publishing house at the intersection of bold ideas and rising voices.</p>
      <p class="hero-desc fr">Où les Idées s'Élèvent. Où les Voix Montent. Essais géopolitiques, thrillers d'espionnage, fiction spéculative, sociologie comportementale et poésie — une maison d'édition à l'intersection des idées audacieuses et des voix montantes.</p>
      <p class="hero-desc es">Donde las Ideas Ascienden. Donde las Voces se Elevan. Ensayos geopolíticos, thrillers de espionaje, ficción especulativa, sociología conductual y poesía — una editorial en la intersección de ideas audaces y voces emergentes.</p>
      <div class="hero-actions">
        <button class="btn btn-primary en" onclick="goCatalog()">Explore Catalog</button>
        <button class="btn btn-primary fr" onclick="goCatalog()">Explorer le Catalogue</button>
        <button class="btn btn-primary es" onclick="goCatalog()">Explorar Catálogo</button>
        <button class="btn btn-outline en" onclick="showPage('series-list')" style="color:#fff;border-color:rgba(255,255,255,0.4);">View Series</button>
        <button class="btn btn-outline fr" onclick="showPage('series-list')" style="color:#fff;border-color:rgba(255,255,255,0.4);">Voir les Séries</button>
        <button class="btn btn-outline es" onclick="showPage('series-list')" style="color:#fff;border-color:rgba(255,255,255,0.4);">Ver Series</button>
        <button class="btn btn-gold en" onclick="showPage('bundles')">&#9889; Deals</button>
        <button class="btn btn-gold fr" onclick="showPage('bundles')">&#9889; Offres</button>
        <button class="btn btn-gold es" onclick="showPage('bundles')">&#9889; Ofertas</button>
      </div>
      <div class="hero-stats">
        <div><div class="hs-n">49+</div><div class="hs-l en">Titles</div><div class="hs-l fr">Titres</div><div class="hs-l es">Títulos</div></div>
        <div><div class="hs-n">6</div><div class="hs-l en">Series</div><div class="hs-l fr">Séries</div><div class="hs-l es">Series</div></div>
        <div><div class="hs-n">3</div><div class="hs-l en">Languages</div><div class="hs-l fr">Langues</div><div class="hs-l es">Idiomas</div></div>
        <div><div class="hs-n">8</div><div class="hs-l en">Platforms</div><div class="hs-l fr">Plateformes</div><div class="hs-l es">Plataformas</div></div>
      </div>
    </div>
    <div class="hero-right"><div class="hero-mosaic" id="hero-mosaic"></div></div>
  </section>
  <!-- Marquee -->
  <div class="marquee" aria-hidden="true"><div class="marquee-track"><span>SPY ON THE RISE</span><span class="dot">◆</span><span>ENGLISH</span><span class="dot">◆</span><span>FRANÇAIS</span><span class="dot">◆</span><span>ESPAÑOL</span><span class="dot">◆</span><span>GEOPOLITICS</span><span class="dot">◆</span><span>SPY THRILLERS</span><span class="dot">◆</span><span>SOCIOLOGY</span><span class="dot">◆</span><span>LITERARY FICTION</span><span class="dot">◆</span><span>POETRY</span><span class="dot">◆</span><span>INDEPENDENT PUBLISHING</span><span class="dot">◆</span><span>SPY ON THE RISE</span><span class="dot">◆</span><span>ENGLISH</span><span class="dot">◆</span><span>FRANÇAIS</span><span class="dot">◆</span><span>ESPAÑOL</span><span class="dot">◆</span><span>GEOPOLITICS</span><span class="dot">◆</span><span>SPY THRILLERS</span><span class="dot">◆</span><span>SOCIOLOGY</span><span class="dot">◆</span><span>LITERARY FICTION</span><span class="dot">◆</span><span>POETRY</span><span class="dot">◆</span><span>INDEPENDENT PUBLISHING</span><span class="dot">◆</span></div></div>
  <!-- Catalog -->
  <section class="catalog-section" id="catalog"><div class="wrap"><div class="catalog-header"><div><p class="section-label en">The Catalog</p><p class="section-label fr">Le Catalogue</p><p class="section-label es">El Catálogo</p><h2 class="section-title" style="margin-top:0.35rem;"><span class="en">Featured <em>Titles</em></span><span class="fr">Titres <em>Vedettes</em></span><span class="es">Títulos <em>Destacados</em></span></h2></div><button class="btn btn-ghost en" onclick="showPage('series-list')">All Series →</button><button class="btn btn-ghost fr" onclick="showPage('series-list')">Toutes les Séries →</button><button class="btn btn-ghost es" onclick="showPage('series-list')">Todas las Series →</button></div><div class="books-grid" id="home-catalog-grid"></div></div></section>
  <!-- Series overview -->
  <section class="series-strip"><div class="wrap"><div class="series-strip-header"><div><p class="section-label en">The Collections</p><p class="section-label fr">Les Collections</p><p class="section-label es">Las Colecciones</p><h2 class="section-title" style="margin-top:0.35rem;"><span class="en">Explore by <em>Series</em></span><span class="fr">Explorer par <em>Série</em></span><span class="es">Explorar por <em>Serie</em></span></h2></div><button class="btn btn-ghost en" onclick="showPage('series-list')">View All →</button><button class="btn btn-ghost fr" onclick="showPage('series-list')">Voir Tout →</button><button class="btn btn-ghost es" onclick="showPage('series-list')">Ver Todo →</button></div><div class="series-overview-grid" id="home-series-grid"></div></div></section>
  <!-- Bundles banner -->
  <section class="bundles-banner"><div class="wrap"><div class="bb-grid"><div><p class="bb-label en">◆ Exclusive Offers</p><p class="bb-label fr">◆ Offres Exclusives</p><p class="bb-label es">◆ Ofertas Exclusivas</p><h2 class="bb-title en">Bundles &amp; <em>Promotions</em></h2><h2 class="bb-title fr">Lots &amp; <em>Promotions</em></h2><h2 class="bb-title es">Paquetes y <em>Promociones</em></h2><p class="bb-body en">Read more, spend less. Curated bundles by series, theme, or reading journey — up to 40% off individual pricing. Offers refreshed seasonally.</p><p class="bb-body fr">Lire plus, dépenser moins. Lots thématiques jusqu'à 40 % de réduction. Offres renouvelées chaque saison.</p><p class="bb-body es">Lee más, gasta menos. Paquetes temáticos hasta 40% de descuento. Ofertas renovadas cada temporada.</p><button class="btn btn-gold en" onclick="showPage('bundles')" style="margin-top:0.5rem;">Browse All Deals →</button><button class="btn btn-gold fr" onclick="showPage('bundles')" style="margin-top:0.5rem;">Voir Toutes les Offres →</button><button class="btn btn-gold es" onclick="showPage('bundles')" style="margin-top:0.5rem;">Ver Todas las Ofertas →</button></div><div class="bb-previews" id="bb-previews"></div></div></div></section>
  <!-- About -->
  <section class="about-strip" id="about"><div class="wrap"><div class="about-grid"><div><p class="at-label en">The House</p><p class="at-label fr">La Maison</p><p class="at-label es">La Editorial</p><h2 class="at-title en">An Independent Voice<br>in <em>World Literature</em></h2><h2 class="at-title fr">Une Voix Indépendante<br>dans la <em>Littérature Mondiale</em></h2><h2 class="at-title es">Una Voz Independiente<br>en la <em>Literatura Mundial</em></h2><p class="at-body en">SPY ON THE RISE publishes work that refuses easy categories — analytical and literary, geopolitical and intimate, always in at least two languages. Based in Colorado. Distributed worldwide.</p><p class="at-body fr">SPY ON THE RISE publie des œuvres qui refusent les catégories faciles — analytique et littéraire, géopolitique et intime, toujours en au moins deux langues. Basé au Colorado. Distribution mondiale.</p><p class="at-body es">SPY ON THE RISE publica obras que rechazan las categorías fáciles — analítico y literario, geopolítico e íntimo, siempre en al menos dos idiomas. Con sede en Colorado. Distribución mundial.</p><div class="at-pillars" style="margin-top:2rem;"><div class="pillar"><div class="pillar-label en">Language</div><div class="pillar-label fr">Langue</div><div class="pillar-label es">Idioma</div><div class="pillar-title en">Bilingual by Design</div><div class="pillar-title fr">Bilingue par Essence</div><div class="pillar-title es">Bilingüe por Diseño</div><div class="pillar-desc en">EN / FR — Spanish editions in progress.</div><div class="pillar-desc fr">AN / FR — Éditions espagnoles en cours.</div><div class="pillar-desc es">EN / FR — Ediciones en español en proceso.</div></div><div class="pillar"><div class="pillar-label en">Distribution</div><div class="pillar-label fr">Distribution</div><div class="pillar-label es">Distribución</div><div class="pillar-title en">8 Global Platforms</div><div class="pillar-title fr">8 Plateformes Mondiales</div><div class="pillar-title es">8 Plataformas Globales</div><div class="pillar-desc en">Amazon, Apple Books, B&N, Kobo and more.</div><div class="pillar-desc fr">Amazon, Apple Books, B&N, Kobo et plus.</div><div class="pillar-desc es">Amazon, Apple Books, B&N, Kobo y más.</div></div><div class="pillar"><div class="pillar-label en">Scope</div><div class="pillar-label fr">Portée</div><div class="pillar-label es">Alcance</div><div class="pillar-title en">Multi-Genre</div><div class="pillar-title fr">Multi-Genre</div><div class="pillar-title es">Multi-Género</div><div class="pillar-desc en">Fiction, essays, poetry, geopolitics.</div><div class="pillar-desc fr">Fiction, essais, poésie, géopolitique.</div><div class="pillar-desc es">Ficción, ensayos, poesía, geopolítica.</div></div><div class="pillar"><div class="pillar-label en">Standard</div><div class="pillar-label fr">Standard</div><div class="pillar-label es">Estándar</div><div class="pillar-title en">Zero Compromise</div><div class="pillar-title fr">Zéro Compromis</div><div class="pillar-title es">Cero Compromisos</div><div class="pillar-desc en">Rigorous verification protocol on every title.</div><div class="pillar-desc fr">Protocole de vérification rigoureux.</div><div class="pillar-desc es">Protocolo de verificación riguroso.</div></div></div></div><div class="author-card"><div class="ac-monogram">JP</div><div class="ac-name">Jems S. Pompée</div><div class="ac-role en">Author · Series Director · Production Manager</div><div class="ac-role fr">Auteur · Directeur de Série · Directeur de Production</div><div class="ac-role es">Autor · Director de Serie · Director de Producción</div><p class="ac-bio en">Jems S. Pompée writes at the intersection of power, behavior, and language. Educated at Colorado State University (MBA) and National Chengchi University in Taipei, his institutional range spans the Inter-American Development Bank, Coca-Cola Haiti, Kura Technologies, Frito-Lay Denver, and international trade ministry. This cross-institutional authority forms the analytical foundation of the Anatomy of Micro-Societies series.</p><p class="ac-bio fr">Jems S. Pompée écrit à l'intersection du pouvoir, du comportement et du langage. Diplômé de Colorado State University (MBA) et de l'Université Nationale Chengchi à Taipei, son parcours institutionnel couvre la BID, Coca-Cola Haïti, Kura Technologies, Frito-Lay Denver et un ministère du commerce.</p><p class="ac-bio es">Jems S. Pompée escribe en la intersección del poder, el comportamiento y el lenguaje. Egresado de Colorado State University (MBA) y la Universidad Nacional Chengchi en Taipei, su trayectoria abarca el BID, Coca-Cola Haití, Kura Technologies, Frito-Lay Denver y un ministerio de comercio.</p><div class="ac-tags"><span class="ac-tag">MBA · Colorado State</span><span class="ac-tag">NCCU · Taipei</span><span class="ac-tag">IDB · Washington D.C.</span><span class="ac-tag">Coca-Cola · Haiti</span><span class="ac-tag">Kura Technologies</span><span class="ac-tag">Frito-Lay · Denver</span><span class="ac-tag">Milvet Navigator · CO</span></div></div></div></div></section>
  <!-- Reviews -->
  <section class="reviews-section"><div class="wrap"><p class="section-label en">Reader Reviews</p><p class="section-label fr">Avis des Lecteurs</p><p class="section-label es">Reseñas de Lectores</p><h2 class="section-title" style="margin-top:0.35rem;margin-bottom:2.5rem;"><span class="en">What <em>Readers</em> Say</span><span class="fr">Ce que disent les <em>Lecteurs</em></span><span class="es">Lo que dicen los <em>Lectores</em></span></h2><div class="reviews-grid"><div class="review-card"><div class="rc-stars">★★★★★</div><p class="rc-text">"The Mercer Files rewired how I think about intelligence fiction. Architecturally serious writing."</p><div class="rc-author">Marcus T. — New York</div><div class="rc-source">Amazon · Verified Purchase</div></div><div class="review-card"><div class="rc-stars">★★★★★</div><p class="rc-text">"Anatomy of Micro-Societies reads like a knife. It dismantled my assumptions about how power moves in closed groups."</p><div class="rc-author">Isabelle R. — Paris</div><div class="rc-source">Goodreads · 5 Stars</div></div><div class="review-card"><div class="rc-stars">★★★★★</div><p class="rc-text">"The French edition of Atlas breathes differently. A rare bilingual literary achievement."</p><div class="rc-author">Claudette M. — Montréal</div><div class="rc-source">Apple Books · Verified</div></div></div></div></section>
  <!-- Platforms -->
  <section class="platforms-strip"><div class="wrap"><div class="platforms-inner"><span class="platforms-label en">Available On</span><span class="platforms-label fr">Disponible Sur</span><span class="platforms-label es">Disponible En</span><span class="platform-chip" onclick="showPage('bundles')">Amazon KDP</span><span class="platform-chip" onclick="showPage('bundles')">Apple Books</span><span class="platform-chip" onclick="showPage('bundles')">Barnes &amp; Noble</span><span class="platform-chip" onclick="showPage('bundles')">Kobo</span><span class="platform-chip" onclick="showPage('bundles')">IngramSpark</span><span class="platform-chip" onclick="showPage('bundles')">BookBaby</span><span class="platform-chip" onclick="showPage('bundles')">Google Play Books</span></div></div></section>
  <!-- Newsletter -->
  <section class="newsletter"><div class="wrap"><div class="nl-inner"><div><h3 class="nl-title en">New Releases. <em>First Access.</em></h3><h3 class="nl-title fr">Nouvelles Sorties. <em>Premier Accès.</em></h3><h3 class="nl-title es">Nuevos Lanzamientos. <em>Primer Acceso.</em></h3><p class="nl-sub en">EN / FR / ES editions · No spam, ever.</p><p class="nl-sub fr">Éditions EN / FR / ES · Aucun spam, jamais.</p><p class="nl-sub es">Ediciones EN / FR / ES · Sin spam, nunca.</p></div><div class="nl-form-wrap"><div class="nl-form"><input type="email" class="nl-input" id="nl-input" placeholder="your@email.com"><button class="nl-submit" onclick="handleNL()"><span class="en">Subscribe</span><span class="fr">S'abonner</span><span class="es">Suscribirse</span></button></div><p id="nl-confirm"><span class="en">✓ You're on the list. Welcome.</span><span class="fr">✓ Vous êtes sur la liste. Bienvenue.</span><span class="es">✓ Estás en la lista. Bienvenido.</span></p></div></div></div></section>
</div><!-- /home -->

<!-- ════════ PAGE: SERIES LIST ════════ -->
<div id="page-series-list" class="page">
  <div style="background:var(--bg-dark);padding:3.5rem 0 4rem;">
    <div class="wrap">
      <div class="sdp-breadcrumb"><a onclick="showPage('home')" class="en">Home</a><a onclick="showPage('home')" class="fr">Accueil</a><a onclick="showPage('home')" class="es">Inicio</a><span>›</span><span class="en">All Series</span><span class="fr">Toutes les Séries</span><span class="es">Todas las Series</span></div>
      <p class="sdp-tag en">All Collections</p><p class="sdp-tag fr">Toutes les Collections</p><p class="sdp-tag es">Todas las Colecciones</p>
      <h1 class="sdp-title en">The <em>Complete</em> Series Catalog</h1><h1 class="sdp-title fr">Le <em>Catalogue Complet</em> des Séries</h1><h1 class="sdp-title es">El <em>Catálogo Completo</em> de Series</h1>
      <p class="sdp-desc en" style="margin-top:0.75rem;">Every SPY ON THE RISE series — click to explore full details, volume order, and book-level purchase links.</p>
      <p class="sdp-desc fr" style="margin-top:0.75rem;">Toutes les séries SPY ON THE RISE — cliquez pour explorer les détails complets, l'ordre des volumes et les liens d'achat.</p>
      <p class="sdp-desc es" style="margin-top:0.75rem;">Todas las series de SPY ON THE RISE — haz clic para explorar detalles, orden de volúmenes y enlaces de compra.</p>
    </div>
  </div>
  <div style="background:var(--bg-page);padding:4rem 0;">
    <div class="wrap"><div class="series-overview-grid" id="series-list-grid"></div></div>
  </div>
</div>

<!-- ════════ PAGE: SERIES DETAIL (dynamic) ════════ -->
<div id="page-series-detail" class="page series-detail-page">
  <div class="sdp-hero">
    <div class="wrap">
      <div class="sdp-breadcrumb" id="sdp-breadcrumb"></div>
      <div class="sdp-top">
        <div>
          <p class="sdp-tag" id="sdp-tag"></p>
          <h1 class="sdp-title" id="sdp-title"></h1>
          <p class="sdp-desc" id="sdp-desc"></p>
          <div class="sdp-stats" id="sdp-stats"></div>
        </div>
        <div class="sdp-actions">
          <button class="btn btn-primary en" onclick="showPage('bundles')">Bundle Offers</button>
          <button class="btn btn-primary fr" onclick="showPage('bundles')">Offres Groupées</button>
          <button class="btn btn-primary es" onclick="showPage('bundles')">Ofertas de Paquete</button>
        </div>
      </div>
    </div>
  </div>
  <div class="sdp-concept">
    <div class="wrap">
      <div class="sdp-concept-inner">
        <div><p class="sdp-concept-label en">Series Concept</p><p class="sdp-concept-label fr">Concept de la Série</p><p class="sdp-concept-label es">Concepto de la Serie</p><h3 class="sdp-concept-head" id="sdp-concept-head"></h3></div>
        <div><p class="sdp-concept-body" id="sdp-concept-body"></p></div>
      </div>
    </div>
  </div>
  <div class="sdp-books">
    <div class="wrap">
      <div class="sdp-books-header">
        <div><p class="section-label en">Volumes</p><p class="section-label fr">Volumes</p><p class="section-label es">Volúmenes</p><h2 class="section-title" style="margin-top:0.3rem;font-size:clamp(22px,2.5vw,34px);"><span class="en" id="sdp-books-head-en"></span><span class="fr" id="sdp-books-head-fr"></span><span class="es" id="sdp-books-head-es"></span></h2></div>
        <div style="font-family:var(--ui);font-size:12px;color:var(--text-muted);" id="sdp-avail-count"></div>
      </div>
      <div class="sdp-books-grid" id="sdp-books-grid"></div>
    </div>
  </div>
</div>

<!-- ════════ PAGE: BUNDLES ════════ -->
<div id="page-bundles" class="page">
  <div class="bundles-hero">
    <div class="wrap">
      <div class="sdp-breadcrumb"><a onclick="showPage('home')" class="en">Home</a><a onclick="showPage('home')" class="fr">Accueil</a><a onclick="showPage('home')" class="es">Inicio</a><span>›</span><span class="en">Bundles & Deals</span><span class="fr">Offres & Lots</span><span class="es">Paquetes</span></div>
      <p class="bh-label en">◆ Exclusive Offers · Updated Seasonally</p><p class="bh-label fr">◆ Offres Exclusives · Mises à Jour Chaque Saison</p><p class="bh-label es">◆ Ofertas Exclusivas · Actualizadas Cada Temporada</p>
      <h1 class="bh-title en">Bundles &amp; <em>Promotions</em></h1><h1 class="bh-title fr">Lots &amp; <em>Promotions</em></h1><h1 class="bh-title es">Paquetes y <em>Promociones</em></h1>
      <p class="bh-desc en">Every bundle is curated around a reading experience — not just a discount. Choose by series, by theme, by language, or by reading journey.</p>
      <p class="bh-desc fr">Chaque lot est conçu autour d'une expérience de lecture. Choisissez par série, par thème, par langue ou par parcours de lecture.</p>
      <p class="bh-desc es">Cada paquete está diseñado en torno a una experiencia de lectura. Elige por serie, tema, idioma o itinerario de lectura.</p>
    </div>
  </div>
  <div style="background:var(--bg-surface);padding:1.5rem 0;"><div class="wrap"><div class="flash-bar"><span class="flash-icon">⚡</span><p class="flash-text en"><strong>Flash Sale:</strong> Geopolitics Pack — 40% off for <span id="ct-en">—</span></p><p class="flash-text fr"><strong>Vente Flash :</strong> Pack Géopolitique — 40 % de réduction — <span id="ct-fr">—</span></p><p class="flash-text es"><strong>Venta Flash:</strong> Pack Geopolítico — 40% de descuento — <span id="ct-es">—</span></p><button class="btn btn-gold en" style="font-size:12px;padding:9px 18px;">Claim Offer</button><button class="btn btn-gold fr" style="font-size:12px;padding:9px 18px;">Saisir l'Offre</button><button class="btn btn-gold es" style="font-size:12px;padding:9px 18px;">Aprovechar</button></div></div></div>
  <div class="bundle-filters"><div class="wrap"><div class="bf-inner"><span class="bf-label en">Filter</span><span class="bf-label fr">Filtrer</span><span class="bf-label es">Filtrar</span><button class="bf-btn active" onclick="filterBundles('all',this)"><span class="en">All</span><span class="fr">Tout</span><span class="es">Todo</span></button><button class="bf-btn" onclick="filterBundles('bundle',this)"><span class="en">Bundles</span><span class="fr">Lots</span><span class="es">Paquetes</span></button><button class="bf-btn" onclick="filterBundles('promo',this)"><span class="en">Promotions</span><span class="fr">Promotions</span><span class="es">Promociones</span></button><button class="bf-btn gold-f" onclick="filterBundles('limited',this)"><span class="en">⚡ Limited Time</span><span class="fr">⚡ Durée Limitée</span><span class="es">⚡ Tiempo Limitado</span></button><button class="bf-btn" onclick="filterBundles('bilingual',this)"><span class="en">Bilingual</span><span class="fr">Bilingue</span><span class="es">Bilingüe</span></button><button class="bf-btn" onclick="filterBundles('series',this)"><span class="en">Complete Series</span><span class="fr">Séries Complètes</span><span class="es">Series Completas</span></button></div></div></div>
  <div style="background:var(--bg-page);padding:4rem 0;"><div class="wrap"><div class="bundles-grid" id="bundles-grid"></div></div></div>
</div>

<!-- FOOTER -->
<footer id="main-footer"><div class="wrap"><div class="fg-grid"><div><div class="fg-brand">SPY ON THE RISE</div><div class="fg-sub en">Independent Publishing House</div><div class="fg-sub fr">Maison d'Édition Indépendante</div><div class="fg-sub es">Editorial Independiente</div><p class="fg-tagline en">Publishing work that refuses easy categories. Bilingual. Independent. Uncompromising.</p><p class="fg-tagline fr">Publier des œuvres qui refusent les catégories faciles. Bilingue. Indépendant. Sans compromis.</p><p class="fg-tagline es">Publicando obras que rechazan las categorías fáciles. Bilingüe. Independiente. Sin compromisos.</p><div class="fg-socials"><a class="fg-soc" href="#">IG</a><a class="fg-soc" href="#">X</a><a class="fg-soc" href="#">LI</a><a class="fg-soc" href="#">FB</a></div></div><div class="fg-col"><div class="fg-col-title en">Catalog</div><div class="fg-col-title fr">Catalogue</div><div class="fg-col-title es">Catálogo</div><ul id="footer-catalog-links"></ul></div><div class="fg-col"><div class="fg-col-title en">Publishing House</div><div class="fg-col-title fr">La Maison</div><div class="fg-col-title es">La Editorial</div><ul><li><a onclick="goAbout()" class="en">About Us</a><a onclick="goAbout()" class="fr">À Propos</a><a onclick="goAbout()" class="es">Acerca de</a></li><li><a href="mailto:press@spyontherise.com" class="en">Press &amp; Media</a><a href="mailto:press@spyontherise.com" class="fr">Presse &amp; Médias</a><a href="mailto:press@spyontherise.com" class="es">Prensa</a></li><li><a href="mailto:rights@spyontherise.com" class="en">Rights &amp; Licensing</a><a href="mailto:rights@spyontherise.com" class="fr">Droits &amp; Licences</a><a href="mailto:rights@spyontherise.com" class="es">Derechos</a></li><li><a onclick="showPage('bundles')" class="en">Bundles &amp; Deals</a><a onclick="showPage('bundles')" class="fr">Lots &amp; Offres</a><a onclick="showPage('bundles')" class="es">Paquetes</a></li><li><a href="mailto:contact@spyontherise.com" class="en">Contact</a><a href="mailto:contact@spyontherise.com" class="fr">Contact</a><a href="mailto:contact@spyontherise.com" class="es">Contacto</a></li></ul></div><div class="fg-col"><div class="fg-col-title en">Buy Books On</div><div class="fg-col-title fr">Acheter Sur</div><div class="fg-col-title es">Comprar En</div><div class="fg-buy-links"><a class="fg-buy-link" href="#" target="_blank">Amazon KDP</a><a class="fg-buy-link" href="#" target="_blank">Apple Books</a><a class="fg-buy-link" href="#" target="_blank">Barnes &amp; Noble</a><a class="fg-buy-link" href="#" target="_blank">Kobo</a><a class="fg-buy-link" href="#" target="_blank">IngramSpark</a><a class="fg-buy-link" href="#" target="_blank">BookBaby</a></div></div></div><div class="footer-bottom"><span class="footer-legal">© 2026 SPY ON THE RISE, LLC · Colorado · All Rights Reserved<a href="#">Privacy Policy</a><a href="#">Terms of Use</a><a href="#">Cookie Policy</a></span><span class="footer-legal">spyontherise.com</span></div></div></footer>

<!-- BOOK MODAL -->
<div class="modal-overlay" id="modal-overlay" onclick="closeMBg(event)">
  <div class="modal" id="modal-box">
    <button class="modal-close" onclick="closeModal()">✕</button>
    <div class="modal-header" id="modal-header">
      <div class="modal-cover-box" id="modal-cover-box"></div>
      <div><div class="mh-genre" id="mh-genre"></div><div class="mh-title" id="mh-title"></div><div class="mh-subtitle" id="mh-subtitle"></div><div class="mh-author">Jems S. Pompée</div><div class="mh-meta-row" id="mh-meta"></div><div id="mh-unavail"></div></div>
    </div>
    <div class="modal-tabs" id="modal-tabs-bar">
      <button class="modal-tab active en" onclick="switchTab('synopsis',this)">Synopsis</button>
      <button class="modal-tab en" onclick="switchTab('buy',this)">Buy This Book</button>
      <button class="modal-tab en" onclick="switchTab('related',this)">Related Titles</button>
      <button class="modal-tab active fr" onclick="switchTab('synopsis',this)">Synopsis</button>
      <button class="modal-tab fr" onclick="switchTab('buy',this)">Acheter</button>
      <button class="modal-tab fr" onclick="switchTab('related',this)">Titres Liés</button>
      <button class="modal-tab active es" onclick="switchTab('synopsis',this)">Sinopsis</button>
      <button class="modal-tab es" onclick="switchTab('buy',this)">Comprar</button>
      <button class="modal-tab es" onclick="switchTab('related',this)">Relacionados</button>
    </div>
    <div id="tab-synopsis" class="modal-tab-panel active">
      <p class="synopsis-text" id="modal-synopsis"></p>
      <div class="synopsis-details" id="modal-details"></div>
    </div>
    <div id="tab-buy" class="modal-tab-panel">
      <div class="format-tabs"><button class="ft-btn active" onclick="setFmt('print',this)"><span class="en">Print</span><span class="fr">Imprimé</span><span class="es">Impreso</span></button><button class="ft-btn" onclick="setFmt('ebook',this)"><span class="en">eBook</span><span class="fr">Numérique</span><span class="es">eBook</span></button><button class="ft-btn" onclick="setFmt('audio',this)"><span class="en">Audiobook</span><span class="fr">Audio</span><span class="es">Audiolibro</span></button></div>
      <p class="platform-list-label en">Choose Your Retailer</p><p class="platform-list-label fr">Choisissez Votre Libraire</p><p class="platform-list-label es">Elige Tu Tienda</p>
      <div class="platform-list" id="platform-list"></div>
      <div class="signed-block"><p class="en">Looking for a signed copy?</p><p class="fr">Cherchez un exemplaire dédicacé ?</p><p class="es">¿Busca un ejemplar firmado?</p><a class="btn btn-ghost" href="mailto:contact@spyontherise.com?subject=Signed%20Copy%20Request" style="font-size:12px;padding:9px 18px;"><span class="en">Request Signed Copy</span><span class="fr">Demander un Exemplaire Dédicacé</span><span class="es">Solicitar Ejemplar Firmado</span></a></div>
    </div>
    <div id="tab-related" class="modal-tab-panel" id="tab-related-panel">
      <div id="related-content"></div>
    </div>
  </div>
</div>

<!-- SEARCH -->
<div class="search-overlay" id="search-overlay" onclick="closeSBg(event)">
  <div class="search-box">
    <h2 class="sr-only">Search books</h2>
    <div class="si-wrap">
      <input class="si-input" id="si-input" placeholder="Search titles, series, genres…" oninput="doSearch()" autocomplete="off">
      <button class="si-close" onclick="closeSearch()">✕</button>
    </div>
    <p class="search-hint en">Try: "spy thriller" · "geopolitics" · "Mercer" · "bilingual"</p>
    <p class="search-hint fr">Essayez : "thriller" · "géopolitique" · "Mercer" · "bilingue"</p>
    <p class="search-hint es">Prueba: "thriller" · "geopolítica" · "Mercer" · "bilingüe"</p>
    <div id="search-results"></div>
  </div>
</div>

<!-- ════════════════════
     DATA & LOGIC
════════════════════ -->`;

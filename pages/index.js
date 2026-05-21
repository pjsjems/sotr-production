import { useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script';

// ════════════════════════════════════════════════════════════
// SPY ON THE RISE: Main Application Page
//
// Architecture:
//   - Full v4 HTML renders via dangerouslySetInnerHTML
//   - Site logic (catalog data + JS functions) loads from /public/site-logic.js
//   - CSS loads globally from styles/globals.css
//
// TO UPDATE CONTENT (no code needed):
//   Edit data/catalog.js → BOOKS, SERIES, PLATFORMS, BUNDLES objects
//   Then run: npm run dev and preview at localhost:3000
//
// TO DEPLOY CHANGES:
//   git add . && git commit -m "your message" && git push
//   Vercel auto-deploys within 60 seconds.
// ════════════════════════════════════════════════════════════

export default function Home({ jsonLd = '' }) {
  return (
    <>
      <Head>
        <title>SPY ON THE RISE: Independent Publishing House</title>
        <meta
          name="description"
          content="Where Ideas Rise. Where Voices Ascend. Geopolitical essays, espionage thrillers, speculative fiction, behavioral sociology, and poetry, bilingual publishing from Fort Collins, Colorado."
        />
        <meta property="og:title" content="SPY ON THE RISE: Independent Publishing House" />
        <meta
          property="og:description"
          content="Where Ideas Rise. Where Voices Ascend. A bilingual publishing house at the intersection of bold ideas and rising voices."
        />
        <meta property="og:url" content="https://spyontherise.com" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://spyontherise.com/og-image.jpg" />
        <meta name="twitter:title" content="SPY ON THE RISE: Independent Publishing House" />
        <meta
          name="twitter:description"
          content="Where Ideas Rise. Where Voices Ascend. Geopolitical essays, espionage thrillers, speculative fiction, behavioral sociology, and poetry."
        />
        <meta name="twitter:image" content="https://spyontherise.com/og-image.jpg" />
        {jsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLd }}
          />
        )}
      </Head>

      {/* Full v4 site HTML: all pages, modals, navigation */}
      <div
        id="sotr-root"
        dangerouslySetInnerHTML={{ __html: SITE_HTML }}
        suppressHydrationWarning={true}
      />

      {/* Site logic: catalog data + all interactive functions */}
      <Script src="/site-logic.js" strategy="afterInteractive" />
    </>
  );
}

// ── STATIC PROPS: JSON-LD generation at build time ────────
export async function getStaticProps() {
  const { BOOKS } = require('../data/catalog.js');
  const avail = Object.values(BOOKS).filter(b => b.available);
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'SPY ON THE RISE: Complete Catalog',
    'description': 'Geopolitical essays, espionage thrillers, speculative fiction, behavioral sociology, and poetry from Fort Collins, Colorado.',
    'itemListElement': avail.map((b, i) => ({
      '@type': 'ListItem',
      'position': i + 1,
      'item': {
        '@type': 'Book',
        'name': b.title,
        'author': { '@type': 'Person', 'name': 'Jems S. Pompée' },
        'publisher': {
          '@type': 'Organization',
          'name': 'SPY ON THE RISE',
          'url': 'https://spyontherise.com',
        },
        'isbn': 'TBD-' + b.key,
        'inLanguage': b.lang && b.lang.includes('FR') ? ['en', 'fr'] : ['en'],
        'genre': b.genre,
        'description': (b.synopsis || '').substring(0, 300),
        'url': 'https://spyontherise.com',
      },
    })),
  });
  return { props: { jsonLd } };
}

// ── SITE HTML ──────────────────────────────────────────────
// Full v4 body content. All pages (Home, Series, Bundles) are
// embedded here as a single-page application.
// Structure preserved exactly from spyontherise_v4.html.
const SITE_HTML = `<!-- TOPBAR -->
<div class="topbar">
  <span class="en">First Publication Wave 2026: <strong>Iran: The Laboratory</strong> · The Chess-Go Game · The Teacher's Gun · and more. Pre-orders open.</span>
  <span class="fr">Première vague de publication 2026 : <strong>L'Iran: Le Laboratoire</strong> · Le Jeu Échecs-Go · Le Fusil du Professeur · et plus. Pré-commandes ouvertes.</span>
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
      <li><a class="nav-link en" href="/blog">Blog</a><a class="nav-link fr" href="/blog">Blog</a><a class="nav-link es" href="/blog">Blog</a></li>
      <li><span class="nav-link en" id="nl-contact" onclick="showPage('contact')">Contact</span><span class="nav-link fr" onclick="showPage('contact')">Contact</span><span class="nav-link es" onclick="showPage('contact')">Contacto</span></li>
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
      <button class="nav-hamburger" onclick="toggleMobileNav()" aria-label="Toggle navigation" aria-expanded="false" id="nav-hamburger">
        <svg class="hb-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        <svg class="hb-close" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="4" y1="4" x2="20" y2="20"/><line x1="20" y1="4" x2="4" y2="20"/></svg>
      </button>
    </div>
  </div>
</nav>
<div class="mobile-nav" id="mobile-nav" role="navigation" aria-label="Mobile navigation">
  <div class="mobile-nav-inner">
    <span class="mobile-nav-link en" onclick="showPage('home');closeMobileNav()">Home</span><span class="mobile-nav-link fr" onclick="showPage('home');closeMobileNav()">Accueil</span><span class="mobile-nav-link es" onclick="showPage('home');closeMobileNav()">Inicio</span>
    <span class="mobile-nav-link en" onclick="goCatalog();closeMobileNav()">Catalog</span><span class="mobile-nav-link fr" onclick="goCatalog();closeMobileNav()">Catalogue</span><span class="mobile-nav-link es" onclick="goCatalog();closeMobileNav()">Catálogo</span>
    <span class="mobile-nav-link en" onclick="showPage('series-list');closeMobileNav()">Series</span><span class="mobile-nav-link fr" onclick="showPage('series-list');closeMobileNav()">Séries</span><span class="mobile-nav-link es" onclick="showPage('series-list');closeMobileNav()">Series</span>
    <span class="mobile-nav-link en" onclick="showPage('bundles');closeMobileNav()">Bundles</span><span class="mobile-nav-link fr" onclick="showPage('bundles');closeMobileNav()">Offres</span><span class="mobile-nav-link es" onclick="showPage('bundles');closeMobileNav()">Paquetes</span>
    <span class="mobile-nav-link en" onclick="goAbout();closeMobileNav()">About</span><span class="mobile-nav-link fr" onclick="goAbout();closeMobileNav()">À Propos</span><span class="mobile-nav-link es" onclick="goAbout();closeMobileNav()">Acerca de</span>
    <a class="mobile-nav-link en" href="/blog">Blog</a><a class="mobile-nav-link fr" href="/blog">Blog</a><a class="mobile-nav-link es" href="/blog">Blog</a>
    <span class="mobile-nav-link en" onclick="showPage('contact');closeMobileNav()">Contact</span><span class="mobile-nav-link fr" onclick="showPage('contact');closeMobileNav()">Contact</span><span class="mobile-nav-link es" onclick="showPage('contact');closeMobileNav()">Contacto</span>
    <div class="mobile-nav-lang">
      <button class="mn-lang-btn" onclick="setLang('en');closeMobileNav()" id="mn-lang-en">EN</button>
      <button class="mn-lang-btn" onclick="setLang('fr');closeMobileNav()" id="mn-lang-fr">FR</button>
      <button class="mn-lang-btn" onclick="setLang('es');closeMobileNav()" id="mn-lang-es">ES</button>
    </div>
  </div>
</div>

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
      <p class="hero-desc en">Where Ideas Rise. Where Voices Ascend. Geopolitical essays, espionage thrillers, speculative fiction, behavioral sociology, and poetry, a publishing house at the intersection of bold ideas and rising voices.</p>
      <p class="hero-desc fr">Où les Idées s'Élèvent. Où les Voix Montent. Essais géopolitiques, thrillers d'espionnage, fiction spéculative, sociologie comportementale et poésie, une maison d'édition à l'intersection des idées audacieuses et des voix montantes.</p>
      <p class="hero-desc es">Donde las Ideas Ascienden. Donde las Voces se Elevan. Ensayos geopolíticos, thrillers de espionaje, ficción especulativa, sociología conductual y poesía, una editorial en la intersección de ideas audaces y voces emergentes.</p>
      <div class="hero-actions">
        <button class="btn btn-primary en" onclick="goCatalog()">Explore Catalog</button>
        <button class="btn btn-primary fr" onclick="goCatalog()">Explorer le Catalogue</button>
        <button class="btn btn-primary es" onclick="goCatalog()">Explorar Catálogo</button>
        <button class="btn btn-outline en" onclick="showPage('series-list')" style="color:#fff;border-color:rgba(255,255,255,0.4);">View Series</button>
        <button class="btn btn-outline fr" onclick="showPage('series-list')" style="color:#fff;border-color:rgba(255,255,255,0.4);">Voir les Séries</button>
        <button class="btn btn-outline es" onclick="showPage('series-list')" style="color:#fff;border-color:rgba(255,255,255,0.4);">Ver Series</button>
        <button class="btn btn-gold en" onclick="showPage('bundles')">⚡ Deals</button>
        <button class="btn btn-gold fr" onclick="showPage('bundles')">⚡ Offres</button>
        <button class="btn btn-gold es" onclick="showPage('bundles')">⚡ Ofertas</button>
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
  <section class="bundles-banner"><div class="wrap"><div class="bb-grid"><div><p class="bb-label en">◆ Exclusive Offers</p><p class="bb-label fr">◆ Offres Exclusives</p><p class="bb-label es">◆ Ofertas Exclusivas</p><h2 class="bb-title en">Bundles &amp; <em>Promotions</em></h2><h2 class="bb-title fr">Lots &amp; <em>Promotions</em></h2><h2 class="bb-title es">Paquetes y <em>Promociones</em></h2><p class="bb-body en">Read more, spend less. Curated bundles by series, theme, or reading journey, up to 40% off individual pricing. Offers refreshed seasonally.</p><p class="bb-body fr">Lire plus, dépenser moins. Lots thématiques jusqu'à 40 % de réduction. Offres renouvelées chaque saison.</p><p class="bb-body es">Lee más, gasta menos. Paquetes temáticos hasta 40% de descuento. Ofertas renovadas cada temporada.</p><button class="btn btn-gold en" onclick="showPage('bundles')" style="margin-top:0.5rem;">Browse All Deals →</button><button class="btn btn-gold fr" onclick="showPage('bundles')" style="margin-top:0.5rem;">Voir Toutes les Offres →</button><button class="btn btn-gold es" onclick="showPage('bundles')" style="margin-top:0.5rem;">Ver Todas las Ofertas →</button></div><div class="bb-previews" id="bb-previews"></div></div></div></section>
  <!-- About -->
  <section class="about-strip" id="about"><div class="wrap"><div class="about-grid"><div><p class="at-label en">The House</p><p class="at-label fr">La Maison</p><p class="at-label es">La Editorial</p><h2 class="at-title en">An Independent Voice<br>in <em>World Literature</em></h2><h2 class="at-title fr">Une Voix Indépendante<br>dans la <em>Littérature Mondiale</em></h2><h2 class="at-title es">Una Voz Independiente<br>en la <em>Literatura Mundial</em></h2><p class="at-body en">SPY ON THE RISE publishes work that refuses easy categories: analytical and literary, geopolitical and intimate, always in at least two languages. Based in Colorado. Distributed worldwide.</p><p class="at-body fr">SPY ON THE RISE publie des œuvres qui refusent les catégories faciles: analytique et littéraire, géopolitique et intime, toujours en au moins deux langues. Basé au Colorado. Distribution mondiale.</p><p class="at-body es">SPY ON THE RISE publica obras que rechazan las categorías fáciles: analítico y literario, geopolítico e íntimo, siempre en al menos dos idiomas. Con sede en Colorado. Distribución mundial.</p><div class="at-pillars" style="margin-top:2rem;"><div class="pillar"><div class="pillar-label en">Language</div><div class="pillar-label fr">Langue</div><div class="pillar-label es">Idioma</div><div class="pillar-title en">Bilingual by Design</div><div class="pillar-title fr">Bilingue par Essence</div><div class="pillar-title es">Bilingüe por Diseño</div><div class="pillar-desc en">EN / FR; Spanish editions in progress.</div><div class="pillar-desc fr">AN / FR; Éditions espagnoles en cours.</div><div class="pillar-desc es">EN / FR; Ediciones en español en proceso.</div></div><div class="pillar"><div class="pillar-label en">Distribution</div><div class="pillar-label fr">Distribution</div><div class="pillar-label es">Distribución</div><div class="pillar-title en">8 Global Platforms</div><div class="pillar-title fr">8 Plateformes Mondiales</div><div class="pillar-title es">8 Plataformas Globales</div><div class="pillar-desc en">Amazon, Apple Books, B&N, Kobo and more.</div><div class="pillar-desc fr">Amazon, Apple Books, B&N, Kobo et plus.</div><div class="pillar-desc es">Amazon, Apple Books, B&N, Kobo y más.</div></div><div class="pillar"><div class="pillar-label en">Scope</div><div class="pillar-label fr">Portée</div><div class="pillar-label es">Alcance</div><div class="pillar-title en">Multi-Genre</div><div class="pillar-title fr">Multi-Genre</div><div class="pillar-title es">Multi-Género</div><div class="pillar-desc en">Fiction, essays, poetry, geopolitics.</div><div class="pillar-desc fr">Fiction, essais, poésie, géopolitique.</div><div class="pillar-desc es">Ficción, ensayos, poesía, geopolítica.</div></div><div class="pillar"><div class="pillar-label en">Standard</div><div class="pillar-label fr">Standard</div><div class="pillar-label es">Estándar</div><div class="pillar-title en">Zero Compromise</div><div class="pillar-title fr">Zéro Compromis</div><div class="pillar-title es">Cero Compromisos</div><div class="pillar-desc en">Rigorous verification protocol on every title.</div><div class="pillar-desc fr">Protocole de vérification rigoureux.</div><div class="pillar-desc es">Protocolo de verificación riguroso.</div></div></div></div><div class="author-card"><div class="ac-monogram">JP</div><div class="ac-name">Jems S. Pompée</div><div class="ac-role en">Author · Series Director · Production Manager</div><div class="ac-role fr">Auteur · Directeur de Série · Directeur de Production</div><div class="ac-role es">Autor · Director de Serie · Director de Producción</div><p class="ac-bio en">Jems S. Pompée writes at the intersection of power, behavior, and language. Educated at Colorado State University (MBA) and National Chengchi University in Taipei, his institutional range spans the Inter-American Development Bank, Coca-Cola Haiti, Kura Technologies, Frito-Lay Denver, and international trade ministry. This cross-institutional authority forms the analytical foundation of the Anatomy of Micro-Societies series.</p><p class="ac-bio fr">Jems S. Pompée écrit à l'intersection du pouvoir, du comportement et du langage. Diplômé de Colorado State University (MBA) et de l'Université Nationale Chengchi à Taipei, son parcours institutionnel couvre la BID, Coca-Cola Haïti, Kura Technologies, Frito-Lay Denver et un ministère du commerce.</p><p class="ac-bio es">Jems S. Pompée escribe en la intersección del poder, el comportamiento y el lenguaje. Egresado de Colorado State University (MBA) y la Universidad Nacional Chengchi en Taipei, su trayectoria abarca el BID, Coca-Cola Haití, Kura Technologies, Frito-Lay Denver y un ministerio de comercio.</p><div class="ac-tags"><span class="ac-tag">MBA · Colorado State</span><span class="ac-tag">NCCU · Taipei</span><span class="ac-tag">IDB · Washington D.C.</span><span class="ac-tag">Coca-Cola · Haiti</span><span class="ac-tag">Kura Technologies</span><span class="ac-tag">Frito-Lay · Denver</span><span class="ac-tag">Milvet Navigator · CO</span></div></div></div></div></section>
  <!-- Latest from the Author -->
  <section class="latest-posts-section"><div class="wrap"><p class="section-label en">◆ From the Author</p><p class="section-label fr">◆ De l'Auteur</p><p class="section-label es">◆ Del Autor</p><h2 class="section-title" style="margin-top:0.35rem;margin-bottom:2.5rem;"><span class="en">Latest <em>Writing</em></span><span class="fr">Derniers <em>Écrits</em></span><span class="es">Últimos <em>Escritos</em></span></h2><div class="latest-posts-grid"><article class="lp-card"><div class="lp-date en">April 10, 2026</div><div class="lp-date fr">10 avril 2026</div><div class="lp-date es">10 de abril de 2026</div><div class="lp-tags"><span class="lp-tag">craft</span><span class="lp-tag">fiction</span><span class="lp-tag">geopolitics</span></div><h3 class="lp-title en">The Architecture of the Spy Novel</h3><h3 class="lp-title fr">L'Architecture du Roman d'Espionnage</h3><h3 class="lp-title es">La Arquitectura de la Novela de Espionaje</h3><p class="lp-excerpt en">What separates a spy thriller from genre fiction is not the tradecraft or the locations. It is the analytical architecture underneath: the institutional logic that makes every operation feel inevitable rather than contrived.</p><p class="lp-excerpt fr">Ce qui distingue un thriller d'espionnage de la fiction de genre, ce n'est pas les techniques ou les décors. C'est l'architecture analytique en dessous : la logique institutionnelle qui rend chaque opération inévitable plutôt que forcée.</p><p class="lp-excerpt es">Lo que separa un thriller de espionaje de la ficción de género no son las técnicas ni los escenarios. Es la arquitectura analítica subyacente: la lógica institucional que hace que cada operación parezca inevitable en lugar de forzada.</p><a href="/blog/architecture-of-the-spy-novel" class="lp-read en">Read →</a><a href="/blog/architecture-of-the-spy-novel" class="lp-read fr">Lire →</a><a href="/blog/architecture-of-the-spy-novel" class="lp-read es">Leer →</a></article><article class="lp-card"><div class="lp-date en">May 1, 2026</div><div class="lp-date fr">1er mai 2026</div><div class="lp-date es">1 de mayo de 2026</div><div class="lp-tags"><span class="lp-tag">publishing</span><span class="lp-tag">bilingual</span><span class="lp-tag">craft</span></div><h3 class="lp-title en">Bilingual by Design: Why Both Editions Must Work</h3><h3 class="lp-title fr">Bilingue par Conception : Pourquoi les Deux Éditions Doivent Fonctionner</h3><h3 class="lp-title es">Bilingüe por Diseño: Por Qué Ambas Ediciones Deben Funcionar</h3><p class="lp-excerpt en">Publishing in two languages is not translation work. It is parallel design. Each edition must earn its own reader, carry its own cadence, and justify its own existence.</p><p class="lp-excerpt fr">Publier en deux langues n'est pas un travail de traduction. C'est une conception parallèle. Chaque édition doit mériter son propre lecteur, porter son propre rythme et justifier sa propre existence.</p><p class="lp-excerpt es">Publicar en dos idiomas no es trabajo de traducción. Es diseño paralelo. Cada edición debe ganarse a su propio lector, llevar su propio ritmo y justificar su propia existencia.</p><a href="/blog/bilingual-by-design" class="lp-read en">Read →</a><a href="/blog/bilingual-by-design" class="lp-read fr">Lire →</a><a href="/blog/bilingual-by-design" class="lp-read es">Leer →</a></article></div><div style="text-align:center;margin-top:2.5rem;"><a href="/blog" class="btn btn-ghost en">All Author Notes →</a><a href="/blog" class="btn btn-ghost fr">Toutes les Notes →</a><a href="/blog" class="btn btn-ghost es">Todas las Notas →</a></div></div></section>
  <!-- Reviews -->
  <section class="reviews-section"><div class="wrap"><p class="section-label en">Reader Reviews</p><p class="section-label fr">Avis des Lecteurs</p><p class="section-label es">Reseñas de Lectores</p><h2 class="section-title" style="margin-top:0.35rem;margin-bottom:2.5rem;"><span class="en">What <em>Readers</em> Say</span><span class="fr">Ce que disent les <em>Lecteurs</em></span><span class="es">Lo que dicen los <em>Lectores</em></span></h2><div class="reviews-grid"><div class="review-card"><div class="rc-stars">★★★★★</div><p class="rc-text">"The Mercer Files rewired how I think about intelligence fiction. Architecturally serious writing."</p><div class="rc-author">Marcus T., New York</div><div class="rc-source">Amazon · Verified Purchase</div></div><div class="review-card"><div class="rc-stars">★★★★★</div><p class="rc-text">"Anatomy of Micro-Societies reads like a knife. It dismantled my assumptions about how power moves in closed groups."</p><div class="rc-author">Isabelle R., Paris</div><div class="rc-source">Goodreads · 5 Stars</div></div><div class="review-card"><div class="rc-stars">★★★★★</div><p class="rc-text">"The French edition of Atlas breathes differently. A rare bilingual literary achievement."</p><div class="rc-author">Claudette M., Montréal</div><div class="rc-source">Apple Books · Verified</div></div></div></div></section>
  <!-- Recently Viewed (7-E) -->
  <section class="rv-section" id="rv-section" style="display:none">
    <div class="wrap">
      <div class="rv-header">
        <div>
          <p class="section-label en">Recently Viewed</p><p class="section-label fr">Récemment Consultés</p><p class="section-label es">Vistos Recientemente</p>
          <h2 class="section-title" style="margin-top:0.35rem;margin-bottom:0;"><span class="en">Your <em>Viewing History</em></span><span class="fr">Votre <em>Historique</em></span><span class="es">Tu <em>Historial</em></span></h2>
        </div>
        <button class="rv-clear-btn" onclick="_rvClear()"><span class="en">Clear</span><span class="fr">Effacer</span><span class="es">Borrar</span></button>
      </div>
      <div class="rv-shelf" id="rv-shelf"></div>
    </div>
  </section>
  <!-- Platforms -->
  <section class="platforms-strip"><div class="wrap"><div class="platforms-inner"><span class="platforms-label en">Available On</span><span class="platforms-label fr">Disponible Sur</span><span class="platforms-label es">Disponible En</span><span class="platform-chip" onclick="showPage('bundles')">Amazon KDP</span><span class="platform-chip" onclick="showPage('bundles')">Apple Books</span><span class="platform-chip" onclick="showPage('bundles')">Barnes &amp; Noble</span><span class="platform-chip" onclick="showPage('bundles')">Kobo</span><span class="platform-chip" onclick="showPage('bundles')">IngramSpark</span><span class="platform-chip" onclick="showPage('bundles')">BookBaby</span><span class="platform-chip" onclick="showPage('bundles')">Google Play Books</span></div></div></section>
  <!-- Newsletter -->
  <section class="newsletter"><div class="wrap"><div class="nl-inner"><div><h3 class="nl-title en">New Releases. <em>First Access.</em></h3><h3 class="nl-title fr">Nouvelles Sorties. <em>Premier Accès.</em></h3><h3 class="nl-title es">Nuevos Lanzamientos. <em>Primer Acceso.</em></h3><p class="nl-sub en">EN / FR / ES editions · No spam, ever.</p><p class="nl-sub fr">Éditions EN / FR / ES · Aucun spam, jamais.</p><p class="nl-sub es">Ediciones EN / FR / ES · Sin spam, nunca.</p></div><div class="nl-form-wrap"><div id="nl-signup-form"><div class="nl-form"><input type="email" class="nl-input" id="nl-input" placeholder="your@email.com" aria-label="Email address for newsletter"><button class="nl-submit" onclick="handleNL()"><span class="en">Subscribe</span><span class="fr">S'abonner</span><span class="es">Suscribirse</span></button></div><p id="nl-error" style="display:none" class="nl-error"><span class="en">Please check your email and try again.</span><span class="fr">Veuillez vérifier votre e-mail et réessayer.</span><span class="es">Por favor revisa tu correo e intenta de nuevo.</span></p></div><div id="nl-prefs" class="nl-prefs" style="display:none"><p class="nl-prefs-head en">◆ You're subscribed. Manage your preferences:</p><p class="nl-prefs-head fr">◆ Vous êtes abonné. Gérez vos préférences :</p><p class="nl-prefs-head es">◆ Estás suscrito. Administra tus preferencias:</p><div class="nl-pref-group"><label class="nl-pref-item"><input type="checkbox" id="pref-releases" checked><span class="nl-pref-label"><span class="en">New release announcements</span><span class="fr">Annonces de nouvelles sorties</span><span class="es">Anuncios de nuevos lanzamientos</span></span></label><label class="nl-pref-item"><input type="checkbox" id="pref-promos" checked><span class="nl-pref-label"><span class="en">Bundle and promotional offers</span><span class="fr">Offres groupées et promotions</span><span class="es">Paquetes y ofertas promocionales</span></span></label><label class="nl-pref-item"><input type="checkbox" id="pref-editorial"><span class="nl-pref-label"><span class="en">Author notes and editorial updates</span><span class="fr">Notes de l'auteur et actualités éditoriales</span><span class="es">Notas del autor y actualizaciones editoriales</span></span></label></div><div class="nl-lang-group"><p class="nl-lang-head en">Edition preference:</p><p class="nl-lang-head fr">Préférence d'édition :</p><p class="nl-lang-head es">Preferencia de edición:</p><div class="nl-lang-opts"><label class="nl-lang-item"><input type="radio" name="nl-lang" value="en"><span class="en">EN only</span><span class="fr">EN seulement</span><span class="es">Solo EN</span></label><label class="nl-lang-item"><input type="radio" name="nl-lang" value="fr"><span class="en">FR only</span><span class="fr">FR seulement</span><span class="es">Solo FR</span></label><label class="nl-lang-item"><input type="radio" name="nl-lang" value="es"><span class="en">ES only</span><span class="fr">ES seulement</span><span class="es">Solo ES</span></label><label class="nl-lang-item"><input type="radio" name="nl-lang" value="all" checked><span class="en">All languages</span><span class="fr">Toutes les langues</span><span class="es">Todos los idiomas</span></label></div></div><button class="nl-submit nl-prefs-save" id="nl-prefs-btn" onclick="handleNLPrefs()"><span class="en">Save Preferences</span><span class="fr">Enregistrer</span><span class="es">Guardar</span></button><p id="nl-prefs-saved" style="display:none"><span class="en">✓ Preferences saved.</span><span class="fr">✓ Préférences enregistrées.</span><span class="es">✓ Preferencias guardadas.</span></p></div></div></div></div></section>
</div><!-- /home -->

<!-- ════════ PAGE: SERIES LIST ════════ -->
<div id="page-series-list" class="page">
  <div style="background:var(--bg-dark);padding:3.5rem 0 4rem;">
    <div class="wrap">
      <div class="sdp-breadcrumb"><a onclick="showPage('home')" class="en">Home</a><a onclick="showPage('home')" class="fr">Accueil</a><a onclick="showPage('home')" class="es">Inicio</a><span>›</span><span class="en">All Series</span><span class="fr">Toutes les Séries</span><span class="es">Todas las Series</span></div>
      <p class="sdp-tag en">All Collections</p><p class="sdp-tag fr">Toutes les Collections</p><p class="sdp-tag es">Todas las Colecciones</p>
      <h1 class="sdp-title en">The <em>Complete</em> Series Catalog</h1><h1 class="sdp-title fr">Le <em>Catalogue Complet</em> des Séries</h1><h1 class="sdp-title es">El <em>Catálogo Completo</em> de Series</h1>
      <p class="sdp-desc en" style="margin-top:0.75rem;">Every SPY ON THE RISE series: click to explore full details, volume order, and book-level purchase links.</p>
      <p class="sdp-desc fr" style="margin-top:0.75rem;">Toutes les séries SPY ON THE RISE: cliquez pour explorer les détails complets, l'ordre des volumes et les liens d'achat.</p>
      <p class="sdp-desc es" style="margin-top:0.75rem;">Todas las series de SPY ON THE RISE: haz clic para explorar detalles, orden de volúmenes y enlaces de compra.</p>
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
  <div id="ro-section"></div>
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
      <p class="bh-desc en">Every bundle is curated around a reading experience, not just a discount. Choose by series, by theme, by language, or by reading journey.</p>
      <p class="bh-desc fr">Chaque lot est conçu autour d'une expérience de lecture. Choisissez par série, par thème, par langue ou par parcours de lecture.</p>
      <p class="bh-desc es">Cada paquete está diseñado en torno a una experiencia de lectura. Elige por serie, tema, idioma o itinerario de lectura.</p>
    </div>
  </div>
  <div style="background:var(--bg-surface);padding:1.5rem 0;"><div class="wrap"><div class="flash-bar"><span class="flash-icon">⚡</span><p class="flash-text en"><strong>Flash Sale:</strong> Geopolitics Pack, 40% off for <span id="ct-en">--</span></p><p class="flash-text fr"><strong>Vente Flash :</strong> Pack Géopolitique, 40 % de réduction; <span id="ct-fr">--</span></p><p class="flash-text es"><strong>Venta Flash:</strong> Pack Geopolítico, 40% de descuento; <span id="ct-es">--</span></p><button class="btn btn-gold en" style="font-size:12px;padding:9px 18px;">Claim Offer</button><button class="btn btn-gold fr" style="font-size:12px;padding:9px 18px;">Saisir l'Offre</button><button class="btn btn-gold es" style="font-size:12px;padding:9px 18px;">Aprovechar</button></div></div></div>
  <div class="bundle-filters"><div class="wrap"><div class="bf-inner"><span class="bf-label en">Filter</span><span class="bf-label fr">Filtrer</span><span class="bf-label es">Filtrar</span><button class="bf-btn active" onclick="filterBundles('all',this)"><span class="en">All</span><span class="fr">Tout</span><span class="es">Todo</span></button><button class="bf-btn" onclick="filterBundles('bundle',this)"><span class="en">Bundles</span><span class="fr">Lots</span><span class="es">Paquetes</span></button><button class="bf-btn" onclick="filterBundles('promo',this)"><span class="en">Promotions</span><span class="fr">Promotions</span><span class="es">Promociones</span></button><button class="bf-btn gold-f" onclick="filterBundles('limited',this)"><span class="en">⚡ Limited Time</span><span class="fr">⚡ Durée Limitée</span><span class="es">⚡ Tiempo Limitado</span></button><button class="bf-btn" onclick="filterBundles('bilingual',this)"><span class="en">Bilingual</span><span class="fr">Bilingue</span><span class="es">Bilingüe</span></button><button class="bf-btn" onclick="filterBundles('series',this)"><span class="en">Complete Series</span><span class="fr">Séries Complètes</span><span class="es">Series Completas</span></button></div></div></div>
  <div style="background:var(--bg-page);padding:4rem 0;"><div class="wrap"><div class="bundles-grid" id="bundles-grid"></div></div></div>
</div>

<!-- ════════ PAGE: PRESS & MEDIA ════════ -->
<div id="page-press" class="page">
  <div class="bundles-hero">
    <div class="wrap">
      <div class="sdp-breadcrumb"><a onclick="showPage('home')" class="en">Home</a><a onclick="showPage('home')" class="fr">Accueil</a><a onclick="showPage('home')" class="es">Inicio</a><span>›</span><span class="en">Press &amp; Media</span><span class="fr">Presse &amp; Médias</span><span class="es">Prensa y Medios</span></div>
      <p class="bh-label en">◆ For Journalists · Critics · Media</p><p class="bh-label fr">◆ Pour les Journalistes · Critiques · Médias</p><p class="bh-label es">◆ Para Periodistas · Críticos · Medios</p>
      <h1 class="bh-title en">Press &amp; <em>Media</em></h1><h1 class="bh-title fr">Presse &amp; <em>Médias</em></h1><h1 class="bh-title es">Prensa y <em>Medios</em></h1>
      <p class="bh-desc en">Review copies, press kits, high-resolution assets, and media inquiries for SPY ON THE RISE publications.</p>
      <p class="bh-desc fr">Exemplaires de service de presse, kits médias, visuels haute définition et demandes pour les publications de SPY ON THE RISE.</p>
      <p class="bh-desc es">Ejemplares de reseña, kits de prensa, recursos de alta resolución e información para medios sobre las publicaciones de SPY ON THE RISE.</p>
    </div>
  </div>
  <!-- Press Kit Download -->
  <section class="press-section">
    <div class="wrap">
      <div class="press-kit-grid">
        <div>
          <p class="section-label en">Press Kit</p><p class="section-label fr">Kit Presse</p><p class="section-label es">Kit de Prensa</p>
          <h2 class="section-title" style="margin-top:0.35rem;"><span class="en">Publisher <em>Dossier</em></span><span class="fr">Dossier <em>Éditeur</em></span><span class="es">Dossier del <em>Editor</em></span></h2>
          <p class="press-body en">The SPY ON THE RISE press kit includes publisher biography, series overviews, author profile, high-resolution cover art, and official brand assets. Available on request.</p>
          <p class="press-body fr">Le kit presse de SPY ON THE RISE comprend la biographie de l'éditeur, les résumés de séries, le profil de l'auteur, les visuels de couvertures en haute définition et les ressources de marque officielles.</p>
          <p class="press-body es">El kit de prensa de SPY ON THE RISE incluye la biografía del editor, resúmenes de series, perfil del autor, arte de portadas en alta resolución y recursos oficiales de marca.</p>
          <div style="display:flex;gap:1rem;flex-wrap:wrap;margin-top:1.75rem;">
            <a href="mailto:press@spyontherise.com?subject=Press%20Kit%20Request" class="btn btn-primary en">Download Press Kit →</a>
            <a href="mailto:press@spyontherise.com?subject=Demande%20Kit%20Presse" class="btn btn-primary fr">Télécharger le Kit →</a>
            <a href="mailto:press@spyontherise.com?subject=Solicitud%20Kit%20de%20Prensa" class="btn btn-primary es">Descargar Kit →</a>
            <a href="mailto:press@spyontherise.com" class="btn btn-ghost en" style="color:var(--text-secondary);">press@spyontherise.com</a>
            <a href="mailto:press@spyontherise.com" class="btn btn-ghost fr" style="color:var(--text-secondary);">press@spyontherise.com</a>
            <a href="mailto:press@spyontherise.com" class="btn btn-ghost es" style="color:var(--text-secondary);">press@spyontherise.com</a>
          </div>
        </div>
        <div class="press-kit-aside">
          <div class="press-stat-card"><div class="psc-n">50+</div><div class="psc-l en">Titles</div><div class="psc-l fr">Titres</div><div class="psc-l es">Títulos</div></div>
          <div class="press-stat-card"><div class="psc-n">6</div><div class="psc-l en">Series</div><div class="psc-l fr">Séries</div><div class="psc-l es">Series</div></div>
          <div class="press-stat-card"><div class="psc-n">EN/FR</div><div class="psc-l en">Bilingual</div><div class="psc-l fr">Bilingue</div><div class="psc-l es">Bilingüe</div></div>
        </div>
      </div>
    </div>
  </section>
  <!-- Review Copy Form -->
  <section class="press-section-alt">
    <div class="wrap">
      <div class="press-form-grid">
        <div>
          <p class="section-label en">For Critics &amp; Journalists</p><p class="section-label fr">Pour les Critiques et Journalistes</p><p class="section-label es">Para Críticos y Periodistas</p>
          <h2 class="section-title" style="margin-top:0.35rem;"><span class="en">Request a <em>Review Copy</em></span><span class="fr">Demander un <em>Exemplaire de Presse</em></span><span class="es">Solicitar un <em>Ejemplar de Reseña</em></span></h2>
          <p class="press-body en">Review copies are available to qualified journalists, critics, book bloggers, and academics. Complete the form; expect a response within 5 business days.</p>
          <p class="press-body fr">Les exemplaires sont disponibles pour les journalistes, critiques, blogueurs et universitaires qualifiés. Formulaire ci-contre; réponse sous 5 jours ouvrés.</p>
          <p class="press-body es">Los ejemplares están disponibles para periodistas, críticos, bloggers y académicos calificados. Formulario al lado; respuesta en 5 días hábiles.</p>
        </div>
        <form class="press-form" id="press-form" onsubmit="handlePressForm(event)">
          <div class="press-form-row">
            <div><label class="press-label en" for="pf-name">Full Name</label><label class="press-label fr" for="pf-name">Nom Complet</label><label class="press-label es" for="pf-name">Nombre Completo</label><input class="press-input" id="pf-name" type="text" required></div>
            <div><label class="press-label en" for="pf-pub">Publication / Outlet</label><label class="press-label fr" for="pf-pub">Publication / Média</label><label class="press-label es" for="pf-pub">Publicación / Medio</label><input class="press-input" id="pf-pub" type="text" required></div>
          </div>
          <div><label class="press-label en" for="pf-email">Email Address</label><label class="press-label fr" for="pf-email">Adresse E-mail</label><label class="press-label es" for="pf-email">Correo Electrónico</label><input class="press-input" id="pf-email" type="email" required></div>
          <div><label class="press-label en" for="pf-book">Book Interested In</label><label class="press-label fr" for="pf-book">Titre Demandé</label><label class="press-label es" for="pf-book">Libro de Interés</label><select class="press-input press-select" id="pf-book" required><option value="" disabled selected>Select a title...</option></select></div>
          <div><label class="press-label en" for="pf-msg">Message</label><label class="press-label fr" for="pf-msg">Message</label><label class="press-label es" for="pf-msg">Mensaje</label><textarea class="press-input press-textarea" id="pf-msg" rows="4" required></textarea></div>
          <button type="submit" class="btn btn-primary" style="align-self:flex-start;"><span class="en">Submit Request →</span><span class="fr">Envoyer la Demande →</span><span class="es">Enviar Solicitud →</span></button>
          <p class="press-form-success" id="press-form-success"><span class="en">✓ Request received. We'll be in touch within 5 business days.</span><span class="fr">✓ Demande reçue. Nous répondrons sous 5 jours ouvrés.</span><span class="es">✓ Solicitud recibida. Responderemos en 5 días hábiles.</span></p>
          <p class="press-form-error" id="press-form-error"><span class="en">Something went wrong. Please email press@spyontherise.com directly.</span><span class="fr">Une erreur s'est produite. Écrivez à press@spyontherise.com.</span><span class="es">Algo salió mal. Escriba a press@spyontherise.com.</span></p>
        </form>
      </div>
    </div>
  </section>
  <!-- Media Quotes -->
  <section class="press-section">
    <div class="wrap">
      <p class="section-label en">In the Press</p><p class="section-label fr">Dans la Presse</p><p class="section-label es">En la Prensa</p>
      <h2 class="section-title" style="margin-top:0.35rem;margin-bottom:2.5rem;"><span class="en">Media <em>Coverage</em></span><span class="fr">Couverture <em>Médiatique</em></span><span class="es">Cobertura <em>Mediática</em></span></h2>
      <div class="reviews-grid">
        <div class="review-card"><div class="rc-stars">★★★★★</div><p class="rc-text">"[Media quote to be added. Contact press@spyontherise.com to request review copies and schedule coverage.]"</p><div class="rc-author">[Publication Name]</div><div class="rc-source">Press Review · Placeholder</div></div>
        <div class="review-card"><div class="rc-stars">★★★★★</div><p class="rc-text">"[Media quote to be added. SPY ON THE RISE welcomes coverage from literary journals, geopolitical publications, and independent media.]"</p><div class="rc-author">[Publication Name]</div><div class="rc-source">Press Review · Placeholder</div></div>
        <div class="review-card"><div class="rc-stars">★★★★★</div><p class="rc-text">"[Media quote to be added. Review copies and press interviews available upon request.]"</p><div class="rc-author">[Publication Name]</div><div class="rc-source">Press Review · Placeholder</div></div>
      </div>
    </div>
  </section>
  <!-- High-Res Assets -->
  <section class="press-section-alt">
    <div class="wrap">
      <p class="section-label en">Assets</p><p class="section-label fr">Ressources</p><p class="section-label es">Recursos</p>
      <h2 class="section-title" style="margin-top:0.35rem;margin-bottom:2.5rem;"><span class="en">High-Resolution <em>Assets</em></span><span class="fr">Ressources <em>Haute Définition</em></span><span class="es">Recursos de <em>Alta Resolución</em></span></h2>
      <div class="press-assets-grid">
        <div class="press-asset-card">
          <div class="press-asset-icon">◉</div>
          <div class="press-asset-title en">Author Photo</div><div class="press-asset-title fr">Photo de l'Auteur</div><div class="press-asset-title es">Foto del Autor</div>
          <p class="press-asset-desc en">High-resolution portrait of Jems S. Pompée. Print and web resolutions available.</p>
          <p class="press-asset-desc fr">Portrait haute résolution de Jems S. Pompée. Résolutions d'impression et web disponibles.</p>
          <p class="press-asset-desc es">Retrato de alta resolución de Jems S. Pompée. Resoluciones de impresión y web disponibles.</p>
          <a href="mailto:press@spyontherise.com?subject=Asset%20Request%3A%20Author%20Photo" class="btn btn-ghost en" style="font-size:12px;padding:9px 18px;margin-top:1rem;display:inline-block;">Request →</a>
          <a href="mailto:press@spyontherise.com?subject=Demande%20Ressource%3A%20Photo%20Auteur" class="btn btn-ghost fr" style="font-size:12px;padding:9px 18px;margin-top:1rem;display:inline-block;">Demander →</a>
          <a href="mailto:press@spyontherise.com?subject=Solicitud%20Recurso%3A%20Foto%20Autor" class="btn btn-ghost es" style="font-size:12px;padding:9px 18px;margin-top:1rem;display:inline-block;">Solicitar →</a>
        </div>
        <div class="press-asset-card">
          <div class="press-asset-icon">◆</div>
          <div class="press-asset-title en">Cover Images</div><div class="press-asset-title fr">Images de Couverture</div><div class="press-asset-title es">Imágenes de Portada</div>
          <p class="press-asset-desc en">High-resolution cover art for all available titles. Print-ready and web-optimized formats.</p>
          <p class="press-asset-desc fr">Visuels de couverture haute définition pour tous les titres disponibles. Formats impression et web.</p>
          <p class="press-asset-desc es">Arte de portada en alta resolución para todos los títulos. Formatos para impresión y web.</p>
          <a href="mailto:press@spyontherise.com?subject=Asset%20Request%3A%20Cover%20Images" class="btn btn-ghost en" style="font-size:12px;padding:9px 18px;margin-top:1rem;display:inline-block;">Request →</a>
          <a href="mailto:press@spyontherise.com?subject=Demande%20Ressource%3A%20Couvertures" class="btn btn-ghost fr" style="font-size:12px;padding:9px 18px;margin-top:1rem;display:inline-block;">Demander →</a>
          <a href="mailto:press@spyontherise.com?subject=Solicitud%20Recurso%3A%20Portadas" class="btn btn-ghost es" style="font-size:12px;padding:9px 18px;margin-top:1rem;display:inline-block;">Solicitar →</a>
        </div>
        <div class="press-asset-card">
          <div class="press-asset-icon">✦</div>
          <div class="press-asset-title en">Publisher Logo</div><div class="press-asset-title fr">Logo Éditeur</div><div class="press-asset-title es">Logo Editorial</div>
          <p class="press-asset-desc en">Official SPY ON THE RISE wordmark in vector and raster formats. Light and dark variants included.</p>
          <p class="press-asset-desc fr">Logotype officiel SPY ON THE RISE en vectoriel et matriciel. Variantes claires et sombres incluses.</p>
          <p class="press-asset-desc es">Logotipo oficial de SPY ON THE RISE en vectorial y raster. Variantes claras y oscuras incluidas.</p>
          <a href="mailto:press@spyontherise.com?subject=Asset%20Request%3A%20Publisher%20Logo" class="btn btn-ghost en" style="font-size:12px;padding:9px 18px;margin-top:1rem;display:inline-block;">Request →</a>
          <a href="mailto:press@spyontherise.com?subject=Demande%20Ressource%3A%20Logo" class="btn btn-ghost fr" style="font-size:12px;padding:9px 18px;margin-top:1rem;display:inline-block;">Demander →</a>
          <a href="mailto:press@spyontherise.com?subject=Solicitud%20Recurso%3A%20Logo" class="btn btn-ghost es" style="font-size:12px;padding:9px 18px;margin-top:1rem;display:inline-block;">Solicitar →</a>
        </div>
      </div>
    </div>
  </section>
</div><!-- /press -->

<!-- ════════ PAGE: CONTACT ════════ -->
<div id="page-contact" class="page">
  <div class="bundles-hero">
    <div class="wrap">
      <div class="sdp-breadcrumb"><a onclick="showPage('home')" class="en">Home</a><a onclick="showPage('home')" class="fr">Accueil</a><a onclick="showPage('home')" class="es">Inicio</a><span>›</span><span class="en">Contact</span><span class="fr">Contact</span><span class="es">Contacto</span></div>
      <p class="bh-label en">◆ Get In Touch</p><p class="bh-label fr">◆ Nous Contacter</p><p class="bh-label es">◆ Contactar</p>
      <h1 class="bh-title en">Contact <em>Us</em></h1><h1 class="bh-title fr"><em>Contactez-</em>nous</h1><h1 class="bh-title es">Contáctenos</h1>
      <p class="bh-desc en">Questions, wholesale inquiries, rights requests, or just to say hello. We read every message.</p>
      <p class="bh-desc fr">Questions, commandes en gros, demandes de droits ou simplement pour nous écrire; nous lisons chaque message.</p>
      <p class="bh-desc es">Preguntas, pedidos al por mayor, solicitudes de derechos o simplemente saludar; leemos cada mensaje.</p>
    </div>
  </div>
  <section class="press-section">
    <div class="wrap">
      <div class="contact-page-grid">
        <div>
          <p class="section-label en">Contact Information</p><p class="section-label fr">Informations de Contact</p><p class="section-label es">Información de Contacto</p>
          <h2 class="section-title" style="margin-top:0.35rem;margin-bottom:2rem;"><span class="en">How Can We <em>Help?</em></span><span class="fr">Comment Pouvons-Nous <em>Vous Aider?</em></span><span class="es">¿Cómo Podemos <em>Ayudar?</em></span></h2>
          <div class="contact-info-item"><div class="contact-info-label en">General Inquiries</div><div class="contact-info-label fr">Renseignements Généraux</div><div class="contact-info-label es">Consultas Generales</div><a href="mailto:contact@spyontherise.com" class="contact-info-email">contact@spyontherise.com</a></div>
          <div class="contact-info-item"><div class="contact-info-label en">Press &amp; Media</div><div class="contact-info-label fr">Presse &amp; Médias</div><div class="contact-info-label es">Prensa y Medios</div><a href="mailto:press@spyontherise.com" class="contact-info-email">press@spyontherise.com</a></div>
          <div class="contact-info-item"><div class="contact-info-label en">Rights &amp; Licensing</div><div class="contact-info-label fr">Droits &amp; Licences</div><div class="contact-info-label es">Derechos y Licencias</div><a href="mailto:rights@spyontherise.com" class="contact-info-email">rights@spyontherise.com</a></div>
          <div class="contact-info-item"><div class="contact-info-label en">Response Time</div><div class="contact-info-label fr">Délai de Réponse</div><div class="contact-info-label es">Tiempo de Respuesta</div><p class="contact-info-note en">Within 3 to 5 business days.</p><p class="contact-info-note fr">Sous 3 à 5 jours ouvrés.</p><p class="contact-info-note es">En 3 a 5 días hábiles.</p></div>
        </div>
        <form class="press-form" id="contact-form" onsubmit="handleContactForm(event)">
          <div class="press-form-row">
            <div><label class="press-label en" for="cf-name">Full Name</label><label class="press-label fr" for="cf-name">Nom Complet</label><label class="press-label es" for="cf-name">Nombre Completo</label><input class="press-input" id="cf-name" type="text" required></div>
            <div><label class="press-label en" for="cf-email">Email Address</label><label class="press-label fr" for="cf-email">Adresse E-mail</label><label class="press-label es" for="cf-email">Correo Electrónico</label><input class="press-input" id="cf-email" type="email" required></div>
          </div>
          <div>
            <label class="press-label en" for="cf-subject">Subject</label><label class="press-label fr" for="cf-subject">Sujet</label><label class="press-label es" for="cf-subject">Asunto</label>
            <select class="press-input press-select" id="cf-subject" required>
              <option value="" disabled selected>Select a subject...</option>
              <option value="General Inquiry">General Inquiry / Renseignement Général / Consulta General</option>
              <option value="Press &amp; Media">Press &amp; Media / Presse &amp; Médias / Prensa y Medios</option>
              <option value="Rights &amp; Licensing">Rights &amp; Licensing / Droits &amp; Licences / Derechos y Licencias</option>
              <option value="Wholesale Order">Wholesale Order / Commande en Gros / Pedido al Por Mayor</option>
              <option value="Signed Copy Request">Signed Copy Request / Exemplaire Dédicacé / Ejemplar Firmado</option>
              <option value="Other">Other / Autre / Otro</option>
            </select>
          </div>
          <div>
            <label class="press-label en" for="cf-lang">Language Preference</label><label class="press-label fr" for="cf-lang">Langue Préférée</label><label class="press-label es" for="cf-lang">Idioma Preferido</label>
            <select class="press-input press-select" id="cf-lang">
              <option value="EN">EN: English</option>
              <option value="FR">FR: Français</option>
              <option value="ES">ES: Español</option>
            </select>
          </div>
          <div><label class="press-label en" for="cf-msg">Message</label><label class="press-label fr" for="cf-msg">Message</label><label class="press-label es" for="cf-msg">Mensaje</label><textarea class="press-input press-textarea" id="cf-msg" rows="5" required></textarea></div>
          <button type="submit" class="btn btn-primary" id="cf-submit" style="align-self:flex-start;"><span class="en">Send Message →</span><span class="fr">Envoyer →</span><span class="es">Enviar →</span></button>
          <div class="contact-confirm" id="contact-confirm" style="display:none;">
            <div style="font-size:2rem;color:var(--gold);margin-bottom:0.75rem;">◆</div>
            <h3 class="contact-confirm-title en">Message Received</h3><h3 class="contact-confirm-title fr">Message Reçu</h3><h3 class="contact-confirm-title es">Mensaje Recibido</h3>
            <p class="contact-confirm-body en">Thank you for reaching out. We'll respond within 3 to 5 business days at the email you provided.</p>
            <p class="contact-confirm-body fr">Merci de nous avoir contactés. Nous répondrons sous 3 à 5 jours ouvrés à l'adresse fournie.</p>
            <p class="contact-confirm-body es">Gracias por escribirnos. Responderemos en 3 a 5 días hábiles a la dirección proporcionada.</p>
          </div>
          <p class="press-form-error" id="contact-form-error" style="display:none;">
            <span class="en">Something went wrong. <button type="button" class="contact-retry-btn" onclick="retryContact()">Try again</button> or email <a href="mailto:contact@spyontherise.com" style="color:var(--crimson);">contact@spyontherise.com</a> directly.</span>
            <span class="fr">Une erreur s'est produite. <button type="button" class="contact-retry-btn" onclick="retryContact()">Réessayer</button> ou écrivez à <a href="mailto:contact@spyontherise.com" style="color:var(--crimson);">contact@spyontherise.com</a>.</span>
            <span class="es">Algo salió mal. <button type="button" class="contact-retry-btn" onclick="retryContact()">Intentar de nuevo</button> o escriba a <a href="mailto:contact@spyontherise.com" style="color:var(--crimson);">contact@spyontherise.com</a>.</span>
          </p>
        </form>
      </div>
    </div>
  </section>
</div><!-- /contact -->

<!-- ════════ PAGE: ABOUT ════════ -->
<div id="page-about" class="page">
  <div class="bundles-hero">
    <div class="wrap">
      <div class="sdp-breadcrumb"><a onclick="showPage('home')" class="en">Home</a><a onclick="showPage('home')" class="fr">Accueil</a><a onclick="showPage('home')" class="es">Inicio</a><span>›</span><span class="en">About the Author</span><span class="fr">À Propos de l'Auteur</span><span class="es">Sobre el Autor</span></div>
      <p class="bh-label en">◆ The Author</p><p class="bh-label fr">◆ L'Auteur</p><p class="bh-label es">◆ El Autor</p>
      <h1 class="bh-title en">Jems S. <em>Pompée</em></h1><h1 class="bh-title fr">Jems S. <em>Pompée</em></h1><h1 class="bh-title es">Jems S. <em>Pompée</em></h1>
      <p class="bh-desc en">Author · Series Director · Publisher · SPY ON THE RISE</p>
      <p class="bh-desc fr">Auteur · Directeur de Série · Éditeur · SPY ON THE RISE</p>
      <p class="bh-desc es">Autor · Director de Serie · Editor · SPY ON THE RISE</p>
    </div>
  </div>

  <!-- Biography -->
  <section class="press-section">
    <div class="wrap">
      <div class="about-bio-grid">
        <div class="about-photo-col">
          <div class="about-photo-placeholder">
            <div class="ap-monogram">JP</div>
          </div>
          <div class="ap-name">Jems S. Pompée</div>
          <div class="ap-title en">Author · Series Director</div>
          <div class="ap-title fr">Auteur · Directeur de Série</div>
          <div class="ap-title es">Autor · Director de Serie</div>
          <div class="ap-tags">
            <span class="ac-tag">MBA · Colorado State</span>
            <span class="ac-tag">NCCU · Taipei</span>
            <span class="ac-tag">IDB · Washington D.C.</span>
          </div>
        </div>
        <div class="about-bio-col">
          <p class="section-label en">Biography</p><p class="section-label fr">Biographie</p><p class="section-label es">Biografía</p>
          <h2 class="section-title" style="margin-top:0.35rem;margin-bottom:1.75rem;"><span class="en">At the Intersection of <em>Power and Language</em></span><span class="fr">À l'Intersection du <em>Pouvoir et du Langage</em></span><span class="es">En la Intersección del <em>Poder y el Lenguaje</em></span></h2>
          <p class="about-bio-text en">Jems S. Pompée is the author and series director of SPY ON THE RISE. He writes at the intersection of power, behavior, and language, across genres that include espionage fiction, geopolitical analysis, behavioral sociology, and poetry. His work is grounded in direct institutional experience across four countries and multiple sectors.</p>
          <p class="about-bio-text fr">Jems S. Pompée est l'auteur et directeur de série de SPY ON THE RISE. Il écrit à l'intersection du pouvoir, du comportement et du langage, dans des genres qui incluent la fiction d'espionnage, l'analyse géopolitique, la sociologie comportementale et la poésie. Son œuvre est fondée sur une expérience institutionnelle directe dans quatre pays et plusieurs secteurs.</p>
          <p class="about-bio-text es">Jems S. Pompée es el autor y director de serie de SPY ON THE RISE. Escribe en la intersección del poder, el comportamiento y el lenguaje, en géneros que incluyen ficción de espionaje, análisis geopolítico, sociología conductual y poesía. Su obra está anclada en experiencia institucional directa en cuatro países y múltiples sectores.</p>
          <p class="about-bio-text en" style="margin-top:1rem;">His work at the Inter-American Development Bank in Washington D.C. introduced him to the formal architecture of multilateral institutions and development finance. At Coca-Cola Haiti, he managed international trade flows in one of the hemisphere's most operationally complex markets. His role at Kura Technologies brought him into digital finance strategy, while his time at Frito-Lay Denver placed him inside the procurement and distribution systems of a global consumer goods corporation. The Milvet Navigator program in Colorado expanded his framework to include the institutional rehabilitation of veterans in civilian entrepreneurship. Graduate research at National Chengchi University in Taipei gave him a regional lens on East Asian political economy. His MBA from Colorado State University formalized the analytical architecture underlying all of this.</p>
          <p class="about-bio-text fr" style="margin-top:1rem;">Son travail à la Banque Interaméricaine de Développement à Washington D.C. l'a initié à l'architecture formelle des institutions multilatérales et au financement du développement. Chez Coca-Cola Haïti, il a géré les flux du commerce international dans l'un des marchés les plus complexes de l'hémisphère. Son rôle chez Kura Technologies l'a conduit dans la stratégie de finance numérique, tandis que son passage chez Frito-Lay Denver l'a plongé dans les systèmes d'approvisionnement et de distribution d'une multinationale de grande consommation. Le programme Milvet Navigator au Colorado a élargi son cadre analytique à la réhabilitation institutionnelle des vétérans dans l'entrepreneuriat civil. Des recherches à l'Université Nationale Chengchi de Taipei lui ont fourni une perspective régionale sur l'économie politique est-asiatique. Son MBA de Colorado State University a formalisé l'architecture analytique qui sous-tend tout cela.</p>
          <p class="about-bio-text es" style="margin-top:1rem;">Su trabajo en el Banco Interamericano de Desarrollo en Washington D.C. lo introdujo a la arquitectura formal de las instituciones multilaterales y las finanzas para el desarrollo. En Coca-Cola Haití, gestionó flujos de comercio internacional en uno de los mercados operacionalmente más complejos del hemisferio. Su rol en Kura Technologies lo llevó a la estrategia de finanzas digitales, mientras que su tiempo en Frito-Lay Denver lo ubicó dentro de los sistemas de adquisición y distribución de una corporación global de bienes de consumo. El programa Milvet Navigator en Colorado amplió su marco para incluir la rehabilitación institucional de veteranos en el emprendimiento civil. La investigación en la Universidad Nacional Chengchi de Taipei le proporcionó una perspectiva regional sobre la economía política del Asia Oriental. Su MBA de Colorado State University formalizó la arquitectura analítica que subyace a todo esto.</p>
          <p class="about-bio-text en" style="margin-top:1rem;">This cross-institutional authority, spanning development finance, consumer goods, technology, and academic research across the Americas, the Caribbean, and Asia, forms the analytical foundation of the Anatomy of Micro-Societies series and informs the geopolitical architecture of The Mercer Files.</p>
          <p class="about-bio-text fr" style="margin-top:1rem;">Cette autorité institutionnelle transversale, couvrant la finance du développement, les biens de consommation, la technologie et la recherche académique dans les Amériques, les Caraïbes et l'Asie, constitue le fondement analytique de la série Anatomie des Micro-Sociétés et informe l'architecture géopolitique de The Mercer Files.</p>
          <p class="about-bio-text es" style="margin-top:1rem;">Esta autoridad institucional transversal, que abarca las finanzas del desarrollo, bienes de consumo, tecnología e investigación académica en las Américas, el Caribe y Asia, forma la base analítica de la serie Anatomía de las Micro-Sociedades e informa la arquitectura geopolítica de The Mercer Files.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Credentials Timeline -->
  <section class="about-creds-section">
    <div class="wrap">
      <p class="section-label en">Institutional Record</p><p class="section-label fr">Parcours Institutionnel</p><p class="section-label es">Trayectoria Institucional</p>
      <h2 class="section-title" style="margin-top:0.35rem;margin-bottom:3rem;"><span class="en">Credentials &amp; <em>Experience</em></span><span class="fr">Formation &amp; <em>Expérience</em></span><span class="es">Credenciales y <em>Experiencia</em></span></h2>
      <div class="credentials-timeline">
        <div class="cred-item">
          <div class="cred-icon">IDB</div>
          <div class="cred-body">
            <div class="cred-org">Inter-American Development Bank</div>
            <div class="cred-loc">Washington D.C., USA</div>
            <p class="cred-desc en">Multilateral development finance institution. Research and analysis of regional economic development programs across Latin America and the Caribbean.</p>
            <p class="cred-desc fr">Institution financière de développement multilatéral. Recherche et analyse des programmes de développement économique régional en Amérique latine et dans les Caraïbes.</p>
            <p class="cred-desc es">Institución financiera multilateral de desarrollo. Investigación y análisis de programas de desarrollo económico regional en América Latina y el Caribe.</p>
          </div>
        </div>
        <div class="cred-item">
          <div class="cred-icon">CC</div>
          <div class="cred-body">
            <div class="cred-org">Coca-Cola Haiti</div>
            <div class="cred-loc">Haiti, Caribbean</div>
            <p class="cred-desc en">International trade and distribution operations. Supply chain and commercial logistics in one of the hemisphere's most operationally complex markets.</p>
            <p class="cred-desc fr">Opérations de commerce international et de distribution. Chaîne d'approvisionnement et logistique commerciale dans l'un des marchés les plus complexes de l'hémisphère.</p>
            <p class="cred-desc es">Operaciones de comercio internacional y distribución. Cadena de suministro y logística comercial en uno de los mercados operacionalmente más complejos del hemisferio.</p>
          </div>
        </div>
        <div class="cred-item">
          <div class="cred-icon">KT</div>
          <div class="cred-body">
            <div class="cred-org">Kura Technologies</div>
            <div class="cred-loc">Digital Finance · Technology Sector</div>
            <p class="cred-desc en">Digital finance strategy and financial technology development. Applied analysis of payment infrastructure and fintech architecture across emerging markets.</p>
            <p class="cred-desc fr">Stratégie de finance numérique et développement de technologies financières. Analyse appliquée des infrastructures de paiement et de l'architecture fintech dans les marchés émergents.</p>
            <p class="cred-desc es">Estrategia de finanzas digitales y desarrollo de tecnología financiera. Análisis aplicado de infraestructura de pagos y arquitectura fintech en mercados emergentes.</p>
          </div>
        </div>
        <div class="cred-item">
          <div class="cred-icon">FL</div>
          <div class="cred-body">
            <div class="cred-org">Frito-Lay</div>
            <div class="cred-loc">Denver, Colorado, USA</div>
            <p class="cred-desc en">Corporate operations within a global consumer goods corporation. Procurement, distribution systems, and organizational process analysis at scale.</p>
            <p class="cred-desc fr">Opérations d'entreprise au sein d'une multinationale de grande consommation. Approvisionnement, systèmes de distribution et analyse des processus organisationnels à grande échelle.</p>
            <p class="cred-desc es">Operaciones corporativas dentro de una corporación global de bienes de consumo. Adquisición, sistemas de distribución y análisis de procesos organizacionales a escala.</p>
          </div>
        </div>
        <div class="cred-item">
          <div class="cred-icon">MV</div>
          <div class="cred-body">
            <div class="cred-org">Milvet Navigator</div>
            <div class="cred-loc">Colorado, USA</div>
            <p class="cred-desc en">Veteran entrepreneurship development program. Institutional analysis of career transition frameworks and the organizational rehabilitation of veterans in civilian business contexts.</p>
            <p class="cred-desc fr">Programme de développement de l'entrepreneuriat des vétérans. Analyse institutionnelle des cadres de transition professionnelle et de la réhabilitation des vétérans dans les contextes commerciaux civils.</p>
            <p class="cred-desc es">Programa de desarrollo del emprendimiento para veteranos. Análisis institucional de marcos de transición profesional y la rehabilitación organizacional de veteranos en contextos empresariales civiles.</p>
          </div>
        </div>
        <div class="cred-item">
          <div class="cred-icon">NC</div>
          <div class="cred-body">
            <div class="cred-org">National Chengchi University</div>
            <div class="cred-loc">Taipei, Taiwan</div>
            <p class="cred-desc en">Graduate-level research in East Asian political economy and regional institutional analysis. Comparative study of governance structures, trade policy, and geopolitical frameworks in the Asia-Pacific.</p>
            <p class="cred-desc fr">Recherche de troisième cycle en économie politique est-asiatique et analyse institutionnelle régionale. Étude comparative des structures de gouvernance, des politiques commerciales et des cadres géopolitiques en Asie-Pacifique.</p>
            <p class="cred-desc es">Investigación de posgrado en economía política del Asia Oriental y análisis institucional regional. Estudio comparativo de estructuras de gobernanza, política comercial y marcos geopolíticos en Asia-Pacífico.</p>
          </div>
        </div>
        <div class="cred-item">
          <div class="cred-icon">CSU</div>
          <div class="cred-body">
            <div class="cred-org">Colorado State University</div>
            <div class="cred-loc">Fort Collins, Colorado, USA</div>
            <p class="cred-desc en">Master of Business Administration. Formal analytical architecture in organizational behavior, strategic management, financial systems, and cross-cultural leadership. Foundation of the publishing house's operational framework.</p>
            <p class="cred-desc fr">Master of Business Administration. Architecture analytique formelle en comportement organisationnel, gestion stratégique, systèmes financiers et leadership interculturel. Fondement du cadre opérationnel de la maison d'édition.</p>
            <p class="cred-desc es">Master of Business Administration. Arquitectura analítica formal en comportamiento organizacional, gestión estratégica, sistemas financieros y liderazgo intercultural. Fundamento del marco operacional de la editorial.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- SOTR Mission -->
  <section class="press-section about-mission-section">
    <div class="wrap">
      <div class="about-mission-grid">
        <div>
          <p class="section-label en">The House</p><p class="section-label fr">La Maison</p><p class="section-label es">La Editorial</p>
          <h2 class="section-title" style="margin-top:0.35rem;margin-bottom:1.5rem;"><span class="en">SPY ON THE RISE: <em>Mission</em></span><span class="fr">SPY ON THE RISE : <em>Mission</em></span><span class="es">SPY ON THE RISE: <em>Misión</em></span></h2>
          <p class="about-mission-text en">SPY ON THE RISE was founded on a single conviction: that the most important books are the ones that refuse easy categories. Publishing at the intersection of analytical rigor and literary ambition, the house produces work that is simultaneously geopolitical and intimate, institutional and personal, always in at least two languages.</p>
          <p class="about-mission-text fr">SPY ON THE RISE a été fondée sur une conviction : que les livres les plus importants sont ceux qui refusent les catégories faciles. Publiant à l'intersection de la rigueur analytique et de l'ambition littéraire, la maison produit des œuvres à la fois géopolitiques et intimes, institutionnelles et personnelles, toujours en au moins deux langues.</p>
          <p class="about-mission-text es">SPY ON THE RISE fue fundada con una convicción: que los libros más importantes son los que rechazan las categorías fáciles. Publicando en la intersección del rigor analítico y la ambición literaria, la editorial produce obras que son simultáneamente geopolíticas e íntimas, institucionales y personales, siempre en al menos dos idiomas.</p>
          <p class="about-mission-text en" style="margin-top:1rem;">Based in Fort Collins, Colorado, and distributed through eight global platforms, SPY ON THE RISE operates with zero institutional backing and zero compromise on editorial standards. Every title carries a verification protocol. Every series is designed as a complete analytical architecture before the first word is written.</p>
          <p class="about-mission-text fr" style="margin-top:1rem;">Basée à Fort Collins, Colorado, et distribuée sur huit plateformes mondiales, SPY ON THE RISE opère sans aucun soutien institutionnel et sans compromis sur les standards éditoriaux. Chaque titre porte un protocole de vérification. Chaque série est conçue comme une architecture analytique complète avant que le premier mot ne soit écrit.</p>
          <p class="about-mission-text es" style="margin-top:1rem;">Con sede en Fort Collins, Colorado, y distribuida a través de ocho plataformas globales, SPY ON THE RISE opera sin ningún respaldo institucional y sin compromisos en los estándares editoriales. Cada título lleva un protocolo de verificación. Cada serie está diseñada como una arquitectura analítica completa antes de que se escriba la primera palabra.</p>
        </div>
        <div class="about-mission-pillars">
          <div class="about-pillar-card">
            <div class="apc-label en">Principle 01</div><div class="apc-label fr">Principe 01</div><div class="apc-label es">Principio 01</div>
            <div class="apc-title en">Bilingual by Design</div><div class="apc-title fr">Bilingue par Essence</div><div class="apc-title es">Bilingüe por Diseño</div>
            <p class="apc-desc en">Every title is developed simultaneously in English and French. Spanish editions in active development. Language is not translation; it is a parallel design problem.</p>
            <p class="apc-desc fr">Chaque titre est développé simultanément en anglais et en français. Les éditions espagnoles sont en cours de développement. La langue n'est pas une traduction; c'est un problème de conception parallèle.</p>
            <p class="apc-desc es">Cada título se desarrolla simultáneamente en inglés y francés. Las ediciones en español están en desarrollo activo. El idioma no es traducción; es un problema de diseño paralelo.</p>
          </div>
          <div class="about-pillar-card">
            <div class="apc-label en">Principle 02</div><div class="apc-label fr">Principe 02</div><div class="apc-label es">Principio 02</div>
            <div class="apc-title en">Zero Compromise</div><div class="apc-title fr">Zéro Compromis</div><div class="apc-title es">Cero Compromisos</div>
            <p class="apc-desc en">Rigorous verification protocol on every title. Institutional claims are sourced; analytical frameworks are tested. No shortcuts in non-fiction. No shortcuts in fiction either.</p>
            <p class="apc-desc fr">Protocole de vérification rigoureux sur chaque titre. Les affirmations institutionnelles sont sourcées; les cadres analytiques sont testés. Aucun raccourci dans la non-fiction, ni dans la fiction.</p>
            <p class="apc-desc es">Protocolo de verificación riguroso en cada título. Las afirmaciones institucionales tienen fuentes; los marcos analíticos se prueban. Sin atajos en la no ficción ni en la ficción.</p>
          </div>
          <div class="about-pillar-card">
            <div class="apc-label en">Principle 03</div><div class="apc-label fr">Principe 03</div><div class="apc-label es">Principio 03</div>
            <div class="apc-title en">Series Architecture</div><div class="apc-title fr">Architecture de Série</div><div class="apc-title es">Arquitectura de Serie</div>
            <p class="apc-desc en">Every series is fully architected before publication begins. Each volume advances a structural argument. Reading one book is complete; reading the series is a different intellectual experience.</p>
            <p class="apc-desc fr">Chaque série est entièrement architecturée avant le début de la publication. Chaque volume fait avancer un argument structurel. Lire un livre est complet; lire la série est une expérience intellectuelle différente.</p>
            <p class="apc-desc es">Cada serie está completamente arquitecturada antes de que comience la publicación. Cada volumen avanza un argumento estructural. Leer un libro es completo; leer la serie es una experiencia intelectual diferente.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Editorial Method -->
  <section class="about-method-section">
    <div class="wrap">
      <p class="section-label en">Process</p><p class="section-label fr">Méthode</p><p class="section-label es">Proceso</p>
      <h2 class="section-title" style="margin-top:0.35rem;margin-bottom:0.75rem;"><span class="en">The <em>Pompée Analytical Triad</em></span><span class="fr">La <em>Triade Analytique Pompée</em></span><span class="es">La <em>Tríada Analítica Pompée</em></span></h2>
      <p class="about-method-intro en">The analytical framework underlying every SPY ON THE RISE title: three interlocking lenses that together account for how institutions actually function.</p>
      <p class="about-method-intro fr">Le cadre analytique qui sous-tend chaque titre SPY ON THE RISE : trois prismes interdépendants qui rendent compte ensemble du fonctionnement réel des institutions.</p>
      <p class="about-method-intro es">El marco analítico que subyace a cada título de SPY ON THE RISE: tres lentes interconectadas que juntas explican cómo funcionan realmente las instituciones.</p>
      <div class="method-triad">
        <div class="triad-item">
          <div class="triad-num">I</div>
          <div class="triad-title en">Power Architecture</div><div class="triad-title fr">Architecture du Pouvoir</div><div class="triad-title es">Arquitectura del Poder</div>
          <p class="triad-desc en">How authority is structured, distributed, and defended within any institution. The formal hierarchy and the shadow hierarchy. The rules and the rules behind the rules.</p>
          <p class="triad-desc fr">Comment l'autorité est structurée, distribuée et défendue au sein de toute institution. La hiérarchie formelle et la hiérarchie de l'ombre. Les règles et les règles derrière les règles.</p>
          <p class="triad-desc es">Cómo se estructura, distribuye y defiende la autoridad dentro de cualquier institución. La jerarquía formal y la jerarquía en la sombra. Las reglas y las reglas detrás de las reglas.</p>
        </div>
        <div class="triad-item">
          <div class="triad-num">II</div>
          <div class="triad-title en">Behavioral Mapping</div><div class="triad-title fr">Cartographie Comportementale</div><div class="triad-title es">Mapeo Conductual</div>
          <p class="triad-desc en">How individuals adapt their behavior to institutional incentives and constraints. The gap between stated values and revealed preferences. The calculus of loyalty, risk, and defection.</p>
          <p class="triad-desc fr">Comment les individus adaptent leur comportement aux incitations et aux contraintes institutionnelles. L'écart entre les valeurs déclarées et les préférences révélées. Le calcul de la loyauté, du risque et de la défection.</p>
          <p class="triad-desc es">Cómo los individuos adaptan su comportamiento a los incentivos y restricciones institucionales. La brecha entre los valores declarados y las preferencias reveladas. El cálculo de la lealtad, el riesgo y la defección.</p>
        </div>
        <div class="triad-item">
          <div class="triad-num">III</div>
          <div class="triad-title en">Institutional Memory</div><div class="triad-title fr">Mémoire Institutionnelle</div><div class="triad-title es">Memoria Institucional</div>
          <p class="triad-desc en">What institutions learn, what they fail to learn, and what they are constitutionally unable to learn. The residue that operations leave in the systems that ran them. The weight of precedent on present decisions.</p>
          <p class="triad-desc fr">Ce que les institutions apprennent, ce qu'elles ne parviennent pas à apprendre, et ce qu'elles sont constitutionnellement incapables d'apprendre. Le résidu que les opérations laissent dans les systèmes qui les ont gérées. Le poids du précédent sur les décisions présentes.</p>
          <p class="triad-desc es">Lo que las instituciones aprenden, lo que no logran aprender y lo que son constitucionalmente incapaces de aprender. El residuo que las operaciones dejan en los sistemas que las ejecutaron. El peso del precedente en las decisiones actuales.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Speaking & Interviews -->
  <section class="press-section about-speaking-section">
    <div class="wrap">
      <div class="about-speaking-grid">
        <div>
          <p class="section-label en">Speaking &amp; Interviews</p><p class="section-label fr">Conférences &amp; Entretiens</p><p class="section-label es">Conferencias y Entrevistas</p>
          <h2 class="section-title" style="margin-top:0.35rem;margin-bottom:1.5rem;"><span class="en">Available for <em>Speaking Engagements</em></span><span class="fr">Disponible pour des <em>Conférences</em></span><span class="es">Disponible para <em>Conferencias</em></span></h2>
          <p class="about-speaking-text en">Jems S. Pompée is available for speaking engagements, panel discussions, academic presentations, and media interviews. Topics include institutional behavior and micro-sociology, bilingual publishing and international distribution, geopolitical fiction and the architecture of the spy novel, and independent publishing in the post-platform era.</p>
          <p class="about-speaking-text fr">Jems S. Pompée est disponible pour des conférences, des discussions en panel, des présentations académiques et des entretiens médias. Les sujets incluent le comportement institutionnel et la micro-sociologie, l'édition bilingue et la distribution internationale, la fiction géopolitique et l'architecture du roman d'espionnage, et l'édition indépendante à l'ère post-plateforme.</p>
          <p class="about-speaking-text es">Jems S. Pompée está disponible para conferencias, discusiones en panel, presentaciones académicas y entrevistas en medios. Los temas incluyen el comportamiento institucional y la micro-sociología, la publicación bilingüe y la distribución internacional, la ficción geopolítica y la arquitectura de la novela de espionaje, y la publicación independiente en la era post-plataforma.</p>
          <div style="margin-top:2rem;display:flex;gap:1rem;flex-wrap:wrap;">
            <a href="mailto:press@spyontherise.com" class="btn btn-primary en">Contact for Speaking →</a>
            <a href="mailto:press@spyontherise.com" class="btn btn-primary fr">Contacter pour une Conférence →</a>
            <a href="mailto:press@spyontherise.com" class="btn btn-primary es">Contactar para Conferencia →</a>
            <button class="btn btn-ghost en" onclick="showPage('press')">Press &amp; Media Kit</button>
            <button class="btn btn-ghost fr" onclick="showPage('press')">Dossier de Presse</button>
            <button class="btn btn-ghost es" onclick="showPage('press')">Dossier de Prensa</button>
          </div>
        </div>
        <div class="about-speaking-topics">
          <div class="ast-label en">◆ Speaking Topics</div><div class="ast-label fr">◆ Sujets de Conférence</div><div class="ast-label es">◆ Temas de Conferencia</div>
          <ul class="ast-list">
            <li><span class="en">Institutional behavior and micro-sociology</span><span class="fr">Comportement institutionnel et micro-sociologie</span><span class="es">Comportamiento institucional y micro-sociología</span></li>
            <li><span class="en">Bilingual publishing: design, market, distribution</span><span class="fr">Édition bilingue : conception, marché, distribution</span><span class="es">Publicación bilingüe: diseño, mercado, distribución</span></li>
            <li><span class="en">Geopolitical fiction and the architecture of the spy novel</span><span class="fr">Fiction géopolitique et architecture du roman d'espionnage</span><span class="es">Ficción geopolítica y arquitectura de la novela de espionaje</span></li>
            <li><span class="en">Independent publishing post-platform: tools, strategy, reach</span><span class="fr">Édition indépendante post-plateforme : outils, stratégie, portée</span><span class="es">Publicación independiente post-plataforma: herramientas, estrategia, alcance</span></li>
            <li><span class="en">Development finance and emerging market strategy</span><span class="fr">Finance du développement et stratégie des marchés émergents</span><span class="es">Finanzas para el desarrollo y estrategia en mercados emergentes</span></li>
            <li><span class="en">Veteran entrepreneurship and institutional transition</span><span class="fr">Entrepreneuriat des vétérans et transition institutionnelle</span><span class="es">Emprendimiento de veteranos y transición institucional</span></li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</div><!-- /about -->

<!-- ════════ PAGE: RIGHTS ════════ -->
<div id="page-rights" class="page">
  <div class="bundles-hero">
    <div class="wrap">
      <div class="sdp-breadcrumb"><a onclick="showPage('home')" class="en">Home</a><a onclick="showPage('home')" class="fr">Accueil</a><a onclick="showPage('home')" class="es">Inicio</a><span>›</span><span class="en">Rights &amp; Licensing</span><span class="fr">Droits &amp; Licences</span><span class="es">Derechos y Licencias</span></div>
      <p class="bh-label en">◆ Licensing</p><p class="bh-label fr">◆ Licences</p><p class="bh-label es">◆ Licencias</p>
      <h1 class="bh-title en">Rights &amp; <em>Licensing</em></h1><h1 class="bh-title fr">Droits &amp; <em>Licences</em></h1><h1 class="bh-title es">Derechos y <em>Licencias</em></h1>
      <p class="bh-desc en">Translation, audio, film, and educational rights for all SPY ON THE RISE titles.</p>
      <p class="bh-desc fr">Droits de traduction, audio, cinéma et éducatifs pour tous les titres SPY ON THE RISE.</p>
      <p class="bh-desc es">Derechos de traducción, audio, cine y educativos para todos los títulos de SPY ON THE RISE.</p>
    </div>
  </div>

  <!-- Rights intro + inquiry form -->
  <section class="press-section">
    <div class="wrap">
      <div class="rights-main-grid">
        <div class="rights-intro-col">
          <p class="section-label en">Available Rights</p><p class="section-label fr">Droits Disponibles</p><p class="section-label es">Derechos Disponibles</p>
          <h2 class="section-title" style="margin-top:0.35rem;margin-bottom:1.75rem;"><span class="en">Publishing Rights <em>Overview</em></span><span class="fr">Aperçu des <em>Droits d'Édition</em></span><span class="es">Descripción de los <em>Derechos de Publicación</em></span></h2>

          <div class="rights-type-list">
            <div class="rights-type-item">
              <div class="rti-icon">TR</div>
              <div>
                <div class="rti-title en">Translation Rights</div><div class="rti-title fr">Droits de Traduction</div><div class="rti-title es">Derechos de Traducción</div>
                <p class="rti-desc en">All SPY ON THE RISE titles are currently published in English and French. Translation rights into all other languages are available for licensing on a title-by-title basis. Contact us with the target language, territory, and title of interest.</p>
                <p class="rti-desc fr">Tous les titres SPY ON THE RISE sont actuellement publiés en anglais et en français. Les droits de traduction dans toutes les autres langues sont disponibles à la licence sur une base titre par titre. Contactez-nous avec la langue cible, le territoire et le titre souhaité.</p>
                <p class="rti-desc es">Todos los títulos de SPY ON THE RISE se publican actualmente en inglés y francés. Los derechos de traducción a todos los demás idiomas están disponibles para licencia título por título. Contáctenos con el idioma de destino, el territorio y el título de interés.</p>
              </div>
            </div>
            <div class="rights-type-item">
              <div class="rti-icon">AU</div>
              <div>
                <div class="rti-title en">Audio Rights</div><div class="rti-title fr">Droits Audio</div><div class="rti-title es">Derechos de Audio</div>
                <p class="rti-desc en">Audiobook production rights are available for all currently published titles. Rights are negotiated per title, per language edition. Please indicate whether the interest is for an existing or newly produced recording.</p>
                <p class="rti-desc fr">Les droits de production d'audilivres sont disponibles pour tous les titres actuellement publiés. Les droits sont négociés par titre et par édition linguistique. Veuillez indiquer si l'intérêt porte sur un enregistrement existant ou nouvellement produit.</p>
                <p class="rti-desc es">Los derechos de producción de audiolibros están disponibles para todos los títulos publicados actualmente. Los derechos se negocian por título y por edición de idioma. Por favor indique si el interés es para una grabación existente o de nueva producción.</p>
              </div>
            </div>
            <div class="rights-type-item">
              <div class="rti-icon">FM</div>
              <div>
                <div class="rti-title en">Film &amp; Television Adaptation Rights</div><div class="rti-title fr">Droits d'Adaptation Cinéma et Télévision</div><div class="rti-title es">Derechos de Adaptación para Cine y Televisión</div>
                <p class="rti-desc en">Adaptation rights for film, television, streaming, and related formats are available for all SPY ON THE RISE series. Inquiries from production companies, studios, and independent producers are welcome. Please include a brief outline of the proposed project.</p>
                <p class="rti-desc fr">Les droits d'adaptation pour le cinéma, la télévision, le streaming et les formats connexes sont disponibles pour toutes les séries SPY ON THE RISE. Les demandes des sociétés de production, studios et producteurs indépendants sont les bienvenues. Veuillez inclure un bref résumé du projet proposé.</p>
                <p class="rti-desc es">Los derechos de adaptación para cine, televisión, streaming y formatos relacionados están disponibles para todas las series de SPY ON THE RISE. Se dan la bienvenida a consultas de productoras, estudios y productores independientes. Por favor incluya un breve resumen del proyecto propuesto.</p>
              </div>
            </div>
            <div class="rights-type-item">
              <div class="rti-icon">ED</div>
              <div>
                <div class="rti-title en">Educational &amp; Academic Rights</div><div class="rti-title fr">Droits Éducatifs &amp; Académiques</div><div class="rti-title es">Derechos Educativos y Académicos</div>
                <p class="rti-desc en">Classroom adoption, course pack licensing, and excerpt permissions for educational use are handled directly. University presses and academic publishers are welcome to inquire about co-publication or licensed academic editions.</p>
                <p class="rti-desc fr">L'adoption en classe, la licence de recueil de cours et les autorisations d'extraits à des fins éducatives sont gérées directement. Les presses universitaires et les éditeurs académiques sont invités à s'enquérir de la co-publication ou des éditions académiques sous licence.</p>
                <p class="rti-desc es">La adopción en el aula, la licencia de paquetes de cursos y los permisos de extractos para uso educativo se manejan directamente. Las editoriales universitarias y los editores académicos son bienvenidos a consultar sobre co-publicación o ediciones académicas con licencia.</p>
              </div>
            </div>
          </div>

          <div class="rights-direct-contact">
            <div class="rdc-label en">Direct Rights Inquiries</div>
            <div class="rdc-label fr">Demandes de Droits Directes</div>
            <div class="rdc-label es">Consultas de Derechos Directas</div>
            <a href="mailto:rights@spyontherise.com" class="contact-info-email">rights@spyontherise.com</a>
            <p class="rdc-note en">Response within 5 to 7 business days. Please include the title, rights type, territory, and your organization in the subject line.</p>
            <p class="rdc-note fr">Réponse sous 5 à 7 jours ouvrés. Veuillez inclure le titre, le type de droits, le territoire et votre organisation dans l'objet.</p>
            <p class="rdc-note es">Respuesta en 5 a 7 días hábiles. Por favor incluya el título, el tipo de derechos, el territorio y su organización en el asunto.</p>
          </div>
        </div>

        <form class="press-form" id="rights-form" onsubmit="handleRightsForm(event)">
          <p class="section-label en" style="margin-bottom:1.25rem;">Rights Inquiry Form</p>
          <p class="section-label fr" style="margin-bottom:1.25rem;">Formulaire de Demande de Droits</p>
          <p class="section-label es" style="margin-bottom:1.25rem;">Formulario de Consulta de Derechos</p>
          <div class="press-form-row">
            <div><label class="press-label en" for="rf-name">Full Name</label><label class="press-label fr" for="rf-name">Nom Complet</label><label class="press-label es" for="rf-name">Nombre Completo</label><input class="press-input" id="rf-name" type="text" required></div>
            <div><label class="press-label en" for="rf-org">Organization / Publisher</label><label class="press-label fr" for="rf-org">Organisation / Éditeur</label><label class="press-label es" for="rf-org">Organización / Editorial</label><input class="press-input" id="rf-org" type="text"></div>
          </div>
          <div><label class="press-label en" for="rf-email">Email Address</label><label class="press-label fr" for="rf-email">Adresse E-mail</label><label class="press-label es" for="rf-email">Correo Electrónico</label><input class="press-input" id="rf-email" type="email" required></div>
          <div>
            <label class="press-label en" for="rf-type">Rights Type</label><label class="press-label fr" for="rf-type">Type de Droits</label><label class="press-label es" for="rf-type">Tipo de Derechos</label>
            <select class="press-input press-select" id="rf-type" required>
              <option value="" disabled selected>Select rights type...</option>
              <option value="Translation Rights">Translation Rights / Droits de Traduction / Derechos de Traducción</option>
              <option value="Audio Rights">Audio Rights / Droits Audio / Derechos de Audio</option>
              <option value="Film &amp; TV Adaptation">Film &amp; TV Adaptation / Adaptation Cinéma &amp; TV / Adaptación Cine y TV</option>
              <option value="Educational Rights">Educational Rights / Droits Éducatifs / Derechos Educativos</option>
              <option value="Other Rights">Other / Autre / Otro</option>
            </select>
          </div>
          <div><label class="press-label en" for="rf-title">Title or Series of Interest</label><label class="press-label fr" for="rf-title">Titre ou Série Concerné</label><label class="press-label es" for="rf-title">Título o Serie de Interés</label><input class="press-input" id="rf-title" type="text" placeholder="e.g. The Mercer Files, Anatomy of Micro-Societies..."></div>
          <div><label class="press-label en" for="rf-territory">Target Language / Territory</label><label class="press-label fr" for="rf-territory">Langue / Territoire Cible</label><label class="press-label es" for="rf-territory">Idioma / Territorio Objetivo</label><input class="press-input" id="rf-territory" type="text" placeholder="e.g. German / Germany and Austria"></div>
          <div><label class="press-label en" for="rf-msg">Project Description</label><label class="press-label fr" for="rf-msg">Description du Projet</label><label class="press-label es" for="rf-msg">Descripción del Proyecto</label><textarea class="press-input press-textarea" id="rf-msg" rows="4" required></textarea></div>
          <button type="submit" class="btn btn-primary" id="rf-submit" style="align-self:flex-start;"><span class="en">Submit Inquiry →</span><span class="fr">Envoyer la Demande →</span><span class="es">Enviar Consulta →</span></button>
          <div class="contact-confirm" id="rights-confirm" style="display:none;">
            <div style="font-size:2rem;color:var(--gold);margin-bottom:0.75rem;">◆</div>
            <h3 class="contact-confirm-title en">Inquiry Received</h3><h3 class="contact-confirm-title fr">Demande Reçue</h3><h3 class="contact-confirm-title es">Consulta Recibida</h3>
            <p class="contact-confirm-body en">Thank you for your rights inquiry. We'll respond within 5 to 7 business days at the email you provided.</p>
            <p class="contact-confirm-body fr">Merci pour votre demande de droits. Nous répondrons sous 5 à 7 jours ouvrés à l'adresse fournie.</p>
            <p class="contact-confirm-body es">Gracias por su consulta de derechos. Responderemos en 5 a 7 días hábiles a la dirección proporcionada.</p>
          </div>
          <p class="press-form-error" id="rights-form-error" style="display:none;">
            <span class="en">Something went wrong. <button type="button" class="contact-retry-btn" onclick="retryRights()">Try again</button> or email <a href="mailto:rights@spyontherise.com" style="color:var(--crimson);">rights@spyontherise.com</a> directly.</span>
            <span class="fr">Une erreur s'est produite. <button type="button" class="contact-retry-btn" onclick="retryRights()">Réessayer</button> ou écrivez à <a href="mailto:rights@spyontherise.com" style="color:var(--crimson);">rights@spyontherise.com</a>.</span>
            <span class="es">Algo salió mal. <button type="button" class="contact-retry-btn" onclick="retryRights()">Intentar de nuevo</button> o escriba a <a href="mailto:rights@spyontherise.com" style="color:var(--crimson);">rights@spyontherise.com</a>.</span>
          </p>
        </form>
      </div>
    </div>
  </section>

  <!-- Rights availability table -->
  <section class="about-creds-section">
    <div class="wrap">
      <p class="section-label en">Catalog Rights Status</p><p class="section-label fr">État des Droits du Catalogue</p><p class="section-label es">Estado de Derechos del Catálogo</p>
      <h2 class="section-title" style="margin-top:0.35rem;margin-bottom:2.5rem;"><span class="en">Rights <em>Availability Table</em></span><span class="fr">Tableau de <em>Disponibilité des Droits</em></span><span class="es">Tabla de <em>Disponibilidad de Derechos</em></span></h2>
      <div class="rights-table-wrap">
        <table class="rights-table">
          <thead>
            <tr>
              <th class="en">Series / Title</th><th class="fr">Série / Titre</th><th class="es">Serie / Título</th>
              <th class="en">Translation</th><th class="fr">Traduction</th><th class="es">Traducción</th>
              <th class="en">Audio</th><th class="fr">Audio</th><th class="es">Audio</th>
              <th class="en">Film / TV</th><th class="fr">Cinéma / TV</th><th class="es">Cine / TV</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong class="en">The Mercer Files</strong><strong class="fr">The Mercer Files</strong><strong class="es">The Mercer Files</strong><br><small class="en">Books 1 to 3 (available), Books 4 to 7 (forthcoming)</small><small class="fr">Livres 1 à 3 (disponibles), Livres 4 à 7 (à paraître)</small><small class="es">Libros 1 a 3 (disponibles), Libros 4 a 7 (próximamente)</small></td>
              <td><span class="rights-badge available en">Available</span><span class="rights-badge available fr">Disponible</span><span class="rights-badge available es">Disponible</span></td>
              <td><span class="rights-badge available en">Available</span><span class="rights-badge available fr">Disponible</span><span class="rights-badge available es">Disponible</span></td>
              <td><span class="rights-badge available en">Available</span><span class="rights-badge available fr">Disponible</span><span class="rights-badge available es">Disponible</span></td>
            </tr>
            <tr>
              <td><strong class="en">Anatomy of Micro-Societies</strong><strong class="fr">Anatomie des Micro-Sociétés</strong><strong class="es">Anatomía de las Micro-Sociedades</strong><br><small class="en">Books 1 to 3 (available), Book 4 (forthcoming)</small><small class="fr">Livres 1 à 3 (disponibles), Livre 4 (à paraître)</small><small class="es">Libros 1 a 3 (disponibles), Libro 4 (próximamente)</small></td>
              <td><span class="rights-badge available en">Available</span><span class="rights-badge available fr">Disponible</span><span class="rights-badge available es">Disponible</span></td>
              <td><span class="rights-badge available en">Available</span><span class="rights-badge available fr">Disponible</span><span class="rights-badge available es">Disponible</span></td>
              <td><span class="rights-badge available en">Available</span><span class="rights-badge available fr">Disponible</span><span class="rights-badge available es">Disponible</span></td>
            </tr>
            <tr>
              <td><strong class="en">Atlas of Borrowed Identities</strong><strong class="fr">Atlas des Identités Empruntées</strong><strong class="es">Atlas de las Identidades Prestadas</strong><br><small class="en">Books 1 to 2 (available), Books 3 to 5 (forthcoming)</small><small class="fr">Livres 1 à 2 (disponibles), Livres 3 à 5 (à paraître)</small><small class="es">Libros 1 a 2 (disponibles), Libros 3 a 5 (próximamente)</small></td>
              <td><span class="rights-badge available en">Available</span><span class="rights-badge available fr">Disponible</span><span class="rights-badge available es">Disponible</span></td>
              <td><span class="rights-badge available en">Available</span><span class="rights-badge available fr">Disponible</span><span class="rights-badge available es">Disponible</span></td>
              <td><span class="rights-badge available en">Available</span><span class="rights-badge available fr">Disponible</span><span class="rights-badge available es">Disponible</span></td>
            </tr>
            <tr>
              <td><strong class="en">The Geopolitics of Silence</strong><strong class="fr">La Géopolitique du Silence</strong><strong class="es">La Geopolítica del Silencio</strong><br><small class="en">Books 1 to 3 (available)</small><small class="fr">Livres 1 à 3 (disponibles)</small><small class="es">Libros 1 a 3 (disponibles)</small></td>
              <td><span class="rights-badge available en">Available</span><span class="rights-badge available fr">Disponible</span><span class="rights-badge available es">Disponible</span></td>
              <td><span class="rights-badge available en">Available</span><span class="rights-badge available fr">Disponible</span><span class="rights-badge available es">Disponible</span></td>
              <td><span class="rights-badge available en">Available</span><span class="rights-badge available fr">Disponible</span><span class="rights-badge available es">Disponible</span></td>
            </tr>
          </tbody>
        </table>
        <p class="rights-table-note en">EN / FR rights held by SPY ON THE RISE. All other language and format rights available. Contact <a href="mailto:rights@spyontherise.com" class="inline-link">rights@spyontherise.com</a> for current availability and deal terms.</p>
        <p class="rights-table-note fr">Les droits EN / FR sont détenus par SPY ON THE RISE. Tous les autres droits de langue et de format sont disponibles. Contactez <a href="mailto:rights@spyontherise.com" class="inline-link">rights@spyontherise.com</a> pour la disponibilité actuelle et les conditions.</p>
        <p class="rights-table-note es">Los derechos EN / FR son propiedad de SPY ON THE RISE. Todos los demás derechos de idioma y formato están disponibles. Contacte <a href="mailto:rights@spyontherise.com" class="inline-link">rights@spyontherise.com</a> para disponibilidad actual y términos.</p>
      </div>
    </div>
  </section>
</div><!-- /rights -->

<!-- ════════ PAGE: WHOLESALE ════════ -->
<div id="page-wholesale" class="page">
  <div class="bundles-hero">
    <div class="wrap">
      <div class="sdp-breadcrumb"><a onclick="showPage('home')" class="en">Home</a><a onclick="showPage('home')" class="fr">Accueil</a><a onclick="showPage('home')" class="es">Inicio</a><span>›</span><span class="en">Wholesale &amp; Libraries</span><span class="fr">Vente en Gros &amp; Bibliothèques</span><span class="es">Mayoristas y Bibliotecas</span></div>
      <p class="bh-label en">◆ Trade Orders</p><p class="bh-label fr">◆ Commandes Professionnelles</p><p class="bh-label es">◆ Pedidos al Por Mayor</p>
      <h1 class="bh-title en">Wholesale &amp; <em>Libraries</em></h1><h1 class="bh-title fr">Vente en Gros &amp; <em>Bibliothèques</em></h1><h1 class="bh-title es">Mayoristas y <em>Bibliotecas</em></h1>
      <p class="bh-desc en">Discounted bulk pricing for bookstores, libraries, schools, and academic institutions.</p>
      <p class="bh-desc fr">Tarifs en gros pour les librairies, bibliothèques, écoles et établissements d'enseignement.</p>
      <p class="bh-desc es">Precios al por mayor para librerías, bibliotecas, escuelas e instituciones académicas.</p>
    </div>
  </div>

  <!-- Pricing tiers -->
  <section class="press-section">
    <div class="wrap">
      <p class="section-label en">Pricing Tiers</p><p class="section-label fr">Niveaux de Tarification</p><p class="section-label es">Niveles de Precios</p>
      <h2 class="section-title" style="margin-top:0.35rem;margin-bottom:2.5rem;"><span class="en">Wholesale <em>Discount Structure</em></span><span class="fr">Structure de <em>Remise Grossiste</em></span><span class="es">Estructura de <em>Descuento Mayorista</em></span></h2>
      <div class="ws-tiers">
        <div class="ws-tier">
          <div class="wst-qty">10+</div>
          <div class="wst-label en">Starter</div><div class="wst-label fr">Départ</div><div class="wst-label es">Inicio</div>
          <div class="wst-discount">20% off</div>
          <p class="wst-desc en">Minimum 10 copies per title. Ideal for independent bookstores, school libraries, and classroom sets.</p>
          <p class="wst-desc fr">Minimum 10 exemplaires par titre. Idéal pour les librairies indépendantes, bibliothèques scolaires et sets de classe.</p>
          <p class="wst-desc es">Mínimo 10 copias por título. Ideal para librerías independientes, bibliotecas escolares y conjuntos de aula.</p>
        </div>
        <div class="ws-tier ws-tier-featured">
          <div class="wst-badge en">Most Popular</div><div class="wst-badge fr">Plus Populaire</div><div class="wst-badge es">Más Popular</div>
          <div class="wst-qty">25+</div>
          <div class="wst-label en">Standard</div><div class="wst-label fr">Standard</div><div class="wst-label es">Estándar</div>
          <div class="wst-discount">30% off</div>
          <p class="wst-desc en">Minimum 25 copies per title. Standard trade discount for retail bookstores and public library systems.</p>
          <p class="wst-desc fr">Minimum 25 exemplaires par titre. Remise commerciale standard pour les librairies et les réseaux de bibliothèques publiques.</p>
          <p class="wst-desc es">Mínimo 25 copias por título. Descuento comercial estándar para librerías minoristas y sistemas de bibliotecas públicas.</p>
        </div>
        <div class="ws-tier">
          <div class="wst-qty">50+</div>
          <div class="wst-label en">Volume</div><div class="wst-label fr">Volume</div><div class="wst-label es">Volumen</div>
          <div class="wst-discount">38% off</div>
          <p class="wst-desc en">Minimum 50 copies per title. For academic institutions, library consortia, and multi-location booksellers.</p>
          <p class="wst-desc fr">Minimum 50 exemplaires par titre. Pour les établissements académiques, consortiums de bibliothèques et libraires multi-sites.</p>
          <p class="wst-desc es">Mínimo 50 copias por título. Para instituciones académicas, consorcios de bibliotecas y libreros con múltiples ubicaciones.</p>
        </div>
        <div class="ws-tier">
          <div class="wst-qty">100+</div>
          <div class="wst-label en">Institutional</div><div class="wst-label fr">Institutionnel</div><div class="wst-label es">Institucional</div>
          <div class="wst-discount">45% off</div>
          <p class="wst-desc en">Minimum 100 copies per title. For university systems, national library networks, and large-scale institutional procurement.</p>
          <p class="wst-desc fr">Minimum 100 exemplaires par titre. Pour les systèmes universitaires, réseaux de bibliothèques nationales et approvisionnement institutionnel à grande échelle.</p>
          <p class="wst-desc es">Mínimo 100 copias por título. Para sistemas universitarios, redes de bibliotecas nacionales y adquisiciones institucionales a gran escala.</p>
        </div>
      </div>
      <p class="ws-tier-note en">All prices are based on list retail price. Shipping and handling billed separately. Mixed-title orders accepted at the 25+ tier and above. Contact us to discuss multi-series or standing order arrangements.</p>
      <p class="ws-tier-note fr">Tous les prix sont basés sur le prix de vente au détail. Frais d'expédition et de manutention facturés séparément. Les commandes multi-titres sont acceptées au niveau 25+ et au-delà. Contactez-nous pour discuter des arrangements multi-séries ou de commandes permanentes.</p>
      <p class="ws-tier-note es">Todos los precios se basan en el precio de venta al público. Los gastos de envío y manejo se facturan por separado. Se aceptan pedidos de títulos mixtos en el nivel 25+ y superiores. Contáctenos para hablar sobre arreglos de múltiples series o pedidos permanentes.</p>
    </div>
  </section>

  <!-- Order form + library info -->
  <section class="about-creds-section">
    <div class="wrap">
      <div class="ws-order-grid">
        <div>
          <p class="section-label en">Library &amp; Academic Ordering</p><p class="section-label fr">Commandes Bibliothèques &amp; Académiques</p><p class="section-label es">Pedidos para Bibliotecas e Instituciones Académicas</p>
          <h2 class="section-title" style="margin-top:0.35rem;margin-bottom:1.5rem;"><span class="en">Library <em>Ordering Information</em></span><span class="fr">Informations pour les <em>Bibliothèques</em></span><span class="es">Información para <em>Bibliotecas</em></span></h2>
          <p class="about-mission-text en">SPY ON THE RISE titles are available for library ordering through major library wholesalers including IngramSpark and Baker &amp; Taylor. For direct institutional orders, please use the inquiry form or contact us by email. Library purchase orders are accepted.</p>
          <p class="about-mission-text fr">Les titres SPY ON THE RISE sont disponibles pour les commandes de bibliothèques via les principaux grossistes, notamment IngramSpark et Baker &amp; Taylor. Pour les commandes institutionnelles directes, utilisez le formulaire de demande ou contactez-nous par e-mail. Les bons de commande de bibliothèques sont acceptés.</p>
          <p class="about-mission-text es">Los títulos de SPY ON THE RISE están disponibles para pedidos de bibliotecas a través de los principales mayoristas, incluidos IngramSpark y Baker &amp; Taylor. Para pedidos institucionales directos, use el formulario de consulta o contáctenos por correo electrónico. Se aceptan órdenes de compra de bibliotecas.</p>
          <div class="ws-info-items">
            <div class="ws-info-item">
              <div class="ws-info-label en">MARC Records</div><div class="ws-info-label fr">Notices MARC</div><div class="ws-info-label es">Registros MARC</div>
              <p class="ws-info-val en">Available via IngramSpark for all currently published titles.</p>
              <p class="ws-info-val fr">Disponibles via IngramSpark pour tous les titres actuellement publiés.</p>
              <p class="ws-info-val es">Disponibles a través de IngramSpark para todos los títulos publicados actualmente.</p>
            </div>
            <div class="ws-info-item">
              <div class="ws-info-label en">Formats Available</div><div class="ws-info-label fr">Formats Disponibles</div><div class="ws-info-label es">Formatos Disponibles</div>
              <p class="ws-info-val en">Print (paperback and hardcover where available), eBook (EPUB and PDF), Audiobook.</p>
              <p class="ws-info-val fr">Imprimé (broché et relié selon disponibilité), eBook (EPUB et PDF), Audioliv re.</p>
              <p class="ws-info-val es">Impreso (rústica y tapa dura según disponibilidad), eBook (EPUB y PDF), Audiolibro.</p>
            </div>
            <div class="ws-info-item">
              <div class="ws-info-label en">Returns Policy</div><div class="ws-info-label fr">Politique de Retour</div><div class="ws-info-label es">Política de Devoluciones</div>
              <p class="ws-info-val en">Returns accepted within 90 days of purchase for undamaged copies. Contact us before shipping returns.</p>
              <p class="ws-info-val fr">Retours acceptés dans les 90 jours suivant l'achat pour les exemplaires non endommagés. Contactez-nous avant d'expédier les retours.</p>
              <p class="ws-info-val es">Se aceptan devoluciones dentro de los 90 días de la compra para copias sin daños. Contáctenos antes de enviar las devoluciones.</p>
            </div>
            <div class="ws-info-item">
              <div class="ws-info-label en">Bilingual Editions</div><div class="ws-info-label fr">Éditions Bilingues</div><div class="ws-info-label es">Ediciones Bilingües</div>
              <p class="ws-info-val en">EN and FR editions available separately. Combined EN/FR print editions available on select titles. Contact us for availability.</p>
              <p class="ws-info-val fr">Éditions EN et FR disponibles séparément. Éditions imprimées EN/FR combinées disponibles sur certains titres. Contactez-nous pour la disponibilité.</p>
              <p class="ws-info-val es">Ediciones EN y FR disponibles por separado. Ediciones impresas EN/FR combinadas disponibles en títulos seleccionados. Contáctenos para disponibilidad.</p>
            </div>
          </div>
        </div>

        <form class="press-form" id="wholesale-form" onsubmit="handleWholesaleForm(event)">
          <p class="section-label en" style="margin-bottom:1.25rem;">Wholesale Order Inquiry</p>
          <p class="section-label fr" style="margin-bottom:1.25rem;">Demande de Commande en Gros</p>
          <p class="section-label es" style="margin-bottom:1.25rem;">Consulta de Pedido al Por Mayor</p>
          <div class="press-form-row">
            <div><label class="press-label en" for="wf-name">Full Name</label><label class="press-label fr" for="wf-name">Nom Complet</label><label class="press-label es" for="wf-name">Nombre Completo</label><input class="press-input" id="wf-name" type="text" required></div>
            <div><label class="press-label en" for="wf-org">Organization</label><label class="press-label fr" for="wf-org">Organisation</label><label class="press-label es" for="wf-org">Organización</label><input class="press-input" id="wf-org" type="text" required></div>
          </div>
          <div><label class="press-label en" for="wf-email">Email Address</label><label class="press-label fr" for="wf-email">Adresse E-mail</label><label class="press-label es" for="wf-email">Correo Electrónico</label><input class="press-input" id="wf-email" type="email" required></div>
          <div>
            <label class="press-label en" for="wf-type">Order Type</label><label class="press-label fr" for="wf-type">Type de Commande</label><label class="press-label es" for="wf-type">Tipo de Pedido</label>
            <select class="press-input press-select" id="wf-type" required>
              <option value="" disabled selected>Select order type...</option>
              <option value="Bookstore">Bookstore / Librairie / Librería</option>
              <option value="Public Library">Public Library / Bibliothèque Publique / Biblioteca Pública</option>
              <option value="School / Academic">School or Academic Institution / Scolaire ou Académique / Escolar o Académico</option>
              <option value="University System">University System / Système Universitaire / Sistema Universitario</option>
              <option value="Other Institution">Other Institution / Autre Institution / Otra Institución</option>
            </select>
          </div>
          <div><label class="press-label en" for="wf-qty">Estimated Quantity</label><label class="press-label fr" for="wf-qty">Quantité Estimée</label><label class="press-label es" for="wf-qty">Cantidad Estimada</label><input class="press-input" id="wf-qty" type="text" placeholder="e.g. 50 copies of The Mercer Files Book 1..."></div>
          <div><label class="press-label en" for="wf-msg">Additional Details</label><label class="press-label fr" for="wf-msg">Détails Supplémentaires</label><label class="press-label es" for="wf-msg">Detalles Adicionales</label><textarea class="press-input press-textarea" id="wf-msg" rows="4"></textarea></div>
          <button type="submit" class="btn btn-primary" id="wf-submit" style="align-self:flex-start;"><span class="en">Submit Order Inquiry →</span><span class="fr">Envoyer la Demande →</span><span class="es">Enviar Consulta →</span></button>
          <div class="contact-confirm" id="wholesale-confirm" style="display:none;">
            <div style="font-size:2rem;color:var(--gold);margin-bottom:0.75rem;">◆</div>
            <h3 class="contact-confirm-title en">Inquiry Received</h3><h3 class="contact-confirm-title fr">Demande Reçue</h3><h3 class="contact-confirm-title es">Consulta Recibida</h3>
            <p class="contact-confirm-body en">Thank you for your wholesale inquiry. We'll respond within 3 to 5 business days with pricing and order details.</p>
            <p class="contact-confirm-body fr">Merci pour votre demande de commande en gros. Nous répondrons sous 3 à 5 jours ouvrés avec les prix et détails de commande.</p>
            <p class="contact-confirm-body es">Gracias por su consulta mayorista. Responderemos en 3 a 5 días hábiles con precios y detalles del pedido.</p>
          </div>
          <p class="press-form-error" id="wholesale-form-error" style="display:none;">
            <span class="en">Something went wrong. <button type="button" class="contact-retry-btn" onclick="retryWholesale()">Try again</button> or email <a href="mailto:contact@spyontherise.com" style="color:var(--crimson);">contact@spyontherise.com</a>.</span>
            <span class="fr">Une erreur s'est produite. <button type="button" class="contact-retry-btn" onclick="retryWholesale()">Réessayer</button> ou écrivez à <a href="mailto:contact@spyontherise.com" style="color:var(--crimson);">contact@spyontherise.com</a>.</span>
            <span class="es">Algo salió mal. <button type="button" class="contact-retry-btn" onclick="retryWholesale()">Intentar de nuevo</button> o escriba a <a href="mailto:contact@spyontherise.com" style="color:var(--crimson);">contact@spyontherise.com</a>.</span>
          </p>
        </form>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section class="press-section ws-faq-section">
    <div class="wrap">
      <p class="section-label en">FAQ</p><p class="section-label fr">FAQ</p><p class="section-label es">Preguntas Frecuentes</p>
      <h2 class="section-title" style="margin-top:0.35rem;margin-bottom:2rem;"><span class="en">Frequently Asked <em>Questions</em></span><span class="fr">Questions <em>Fréquentes</em></span><span class="es">Preguntas <em>Frecuentes</em></span></h2>
      <div class="ws-faq-list">
        <details class="ws-faq-item">
          <summary class="ws-faq-q">
            <span class="en">Can I mix titles within a single order?</span>
            <span class="fr">Puis-je mélanger des titres au sein d'une même commande ?</span>
            <span class="es">¿Puedo mezclar títulos dentro de un solo pedido?</span>
          </summary>
          <p class="ws-faq-a en">Yes, mixed-title orders are accepted at the 25+ tier and above. The discount applies to the total quantity ordered, not per-title quantity. Please list all desired titles and quantities in your inquiry.</p>
          <p class="ws-faq-a fr">Oui, les commandes multi-titres sont acceptées au niveau 25+ et au-dessus. La remise s'applique à la quantité totale commandée, pas à la quantité par titre. Veuillez lister tous les titres et quantités souhaités dans votre demande.</p>
          <p class="ws-faq-a es">Sí, se aceptan pedidos de títulos mixtos en el nivel 25+ y superiores. El descuento se aplica a la cantidad total del pedido, no por cantidad por título. Por favor liste todos los títulos y cantidades deseadas en su consulta.</p>
        </details>
        <details class="ws-faq-item">
          <summary class="ws-faq-q">
            <span class="en">Are EN and FR editions priced separately?</span>
            <span class="fr">Les éditions EN et FR sont-elles tarifées séparément ?</span>
            <span class="es">¿Las ediciones EN y FR tienen precio por separado?</span>
          </summary>
          <p class="ws-faq-a en">Yes. English and French editions are treated as separate titles for pricing purposes. Orders combining EN and FR editions of the same title qualify for quantity tiers based on total combined copies.</p>
          <p class="ws-faq-a fr">Oui. Les éditions anglaise et française sont traitées comme des titres séparés pour les besoins de la tarification. Les commandes combinant les éditions EN et FR du même titre sont éligibles aux niveaux de quantité sur la base du total combiné.</p>
          <p class="ws-faq-a es">Sí. Las ediciones en inglés y francés se tratan como títulos separados para fines de precios. Los pedidos que combinan ediciones EN y FR del mismo título califican para niveles de cantidad basados en el total combinado.</p>
        </details>
        <details class="ws-faq-item">
          <summary class="ws-faq-q">
            <span class="en">How long does fulfillment take?</span>
            <span class="fr">Quel est le délai d'exécution ?</span>
            <span class="es">¿Cuánto tiempo tarda el cumplimiento del pedido?</span>
          </summary>
          <p class="ws-faq-a en">Standard wholesale orders ship within 7 to 10 business days after order confirmation. Large institutional orders (100+) may require 14 to 21 business days. Rush fulfillment is available for an additional fee; please inquire.</p>
          <p class="ws-faq-a fr">Les commandes grossistes standard sont expédiées sous 7 à 10 jours ouvrés après confirmation de commande. Les grandes commandes institutionnelles (100+) peuvent nécessiter 14 à 21 jours ouvrés. L'exécution accélérée est disponible moyennant des frais supplémentaires; veuillez vous renseigner.</p>
          <p class="ws-faq-a es">Los pedidos mayoristas estándar se envían dentro de los 7 a 10 días hábiles después de la confirmación del pedido. Los grandes pedidos institucionales (100+) pueden requerir de 14 a 21 días hábiles. El cumplimiento urgente está disponible por una tarifa adicional; por favor consulte.</p>
        </details>
        <details class="ws-faq-item">
          <summary class="ws-faq-q">
            <span class="en">Do you offer consignment terms?</span>
            <span class="fr">Proposez-vous des conditions de consignation ?</span>
            <span class="es">¿Ofrecen términos de consignación?</span>
          </summary>
          <p class="ws-faq-a en">Consignment arrangements are considered case by case for independent bookstores. Please provide your store name, location, and an estimate of typical SPY ON THE RISE audience in your inquiry, and we will respond with options.</p>
          <p class="ws-faq-a fr">Les arrangements de consignation sont étudiés au cas par cas pour les librairies indépendantes. Veuillez fournir le nom de votre librairie, sa localisation et une estimation du public SPY ON THE RISE typique dans votre demande, et nous vous répondrons avec des options.</p>
          <p class="ws-faq-a es">Los acuerdos de consignación se consideran caso por caso para librerías independientes. Por favor proporcione el nombre de su tienda, ubicación y una estimación del público típico de SPY ON THE RISE en su consulta, y le responderemos con opciones.</p>
        </details>
      </div>
    </div>
  </section>
</div><!-- /wholesale -->

<!-- SERIES BUNDLE BANNER -->
<div id="sb-banner" class="sb-banner">
  <div class="wrap">
    <div class="sb-banner-inner">
      <div class="sb-banner-text">
        <div class="sb-label"><span class="en">Complete Collection</span><span class="fr">Collection Complète</span><span class="es">Colección Completa</span></div>
        <div class="sb-series-name" id="sb-series-name"></div>
        <div class="sb-discount" id="sb-discount"></div>
      </div>
      <div class="sb-banner-actions">
        <button class="btn btn-primary sb-view-btn en" onclick="viewSeriesBundle()">View Bundle →</button>
        <button class="btn btn-primary sb-view-btn fr" onclick="viewSeriesBundle()">Voir le Lot →</button>
        <button class="btn btn-primary sb-view-btn es" onclick="viewSeriesBundle()">Ver Paquete →</button>
        <button class="sb-close" onclick="dismissBundleBanner()" aria-label="Close">✕</button>
      </div>
    </div>
  </div>
</div>

<!-- FOOTER -->
<footer id="main-footer"><div class="wrap"><div class="fg-grid"><div><div class="fg-brand">SPY ON THE RISE</div><div class="fg-sub en">Independent Publishing House</div><div class="fg-sub fr">Maison d'Édition Indépendante</div><div class="fg-sub es">Editorial Independiente</div><p class="fg-tagline en">Publishing work that refuses easy categories. Bilingual. Independent. Uncompromising.</p><p class="fg-tagline fr">Publier des œuvres qui refusent les catégories faciles. Bilingue. Indépendant. Sans compromis.</p><p class="fg-tagline es">Publicando obras que rechazan las categorías fáciles. Bilingüe. Independiente. Sin compromisos.</p><div class="fg-socials"><a class="fg-soc" href="#" aria-label="Instagram">IG</a><a class="fg-soc" href="#" aria-label="X (Twitter)">X</a><a class="fg-soc" href="#" aria-label="LinkedIn">LI</a><a class="fg-soc" href="#" aria-label="Facebook">FB</a></div></div><div class="fg-col"><div class="fg-col-title en">Catalog</div><div class="fg-col-title fr">Catalogue</div><div class="fg-col-title es">Catálogo</div><ul id="footer-catalog-links"></ul></div><div class="fg-col"><div class="fg-col-title en">Publishing House</div><div class="fg-col-title fr">La Maison</div><div class="fg-col-title es">La Editorial</div><ul><li><a onclick="goAbout()" class="en">About Us</a><a onclick="goAbout()" class="fr">À Propos</a><a onclick="goAbout()" class="es">Acerca de</a></li><li><a onclick="showPage('press')" class="en">Press &amp; Media</a><a onclick="showPage('press')" class="fr">Presse &amp; Médias</a><a onclick="showPage('press')" class="es">Prensa</a></li><li><a href="/blog" class="en">Author Notes</a><a href="/blog" class="fr">Notes de l'Auteur</a><a href="/blog" class="es">Notas del Autor</a></li><li><a onclick="showPage('rights')" class="en">Rights &amp; Licensing</a><a onclick="showPage('rights')" class="fr">Droits &amp; Licences</a><a onclick="showPage('rights')" class="es">Derechos</a></li><li><a onclick="showPage('wholesale')" class="en">Wholesale &amp; Libraries</a><a onclick="showPage('wholesale')" class="fr">Vente en Gros</a><a onclick="showPage('wholesale')" class="es">Mayoristas</a></li><li><a onclick="showPage('bundles')" class="en">Bundles &amp; Deals</a><a onclick="showPage('bundles')" class="fr">Lots &amp; Offres</a><a onclick="showPage('bundles')" class="es">Paquetes</a></li><li><a onclick="showPage('contact')" class="en">Contact</a><a onclick="showPage('contact')" class="fr">Contact</a><a onclick="showPage('contact')" class="es">Contacto</a></li></ul></div><div class="fg-col"><div class="fg-col-title en">Buy Books On</div><div class="fg-col-title fr">Acheter Sur</div><div class="fg-col-title es">Comprar En</div><div class="fg-buy-links"><a class="fg-buy-link" href="#" target="_blank">Amazon KDP</a><a class="fg-buy-link" href="#" target="_blank">Apple Books</a><a class="fg-buy-link" href="#" target="_blank">Barnes &amp; Noble</a><a class="fg-buy-link" href="#" target="_blank">Kobo</a><a class="fg-buy-link" href="#" target="_blank">IngramSpark</a><a class="fg-buy-link" href="#" target="_blank">BookBaby</a></div></div></div><div class="footer-bottom"><span class="footer-legal">© 2026 SPY ON THE RISE, LLC · Colorado · All Rights Reserved<a href="#">Privacy Policy</a><a href="#">Terms of Use</a><a href="#">Cookie Policy</a></span><span class="footer-legal">spyontherise.com</span></div></div></footer>

<!-- BOOK MODAL -->
<div class="modal-overlay" id="modal-overlay" onclick="closeMBg(event)">
  <div class="modal" id="modal-box" role="dialog" aria-modal="true" aria-labelledby="mh-title">
    <button class="modal-close" onclick="closeModal()" aria-label="Close">✕</button>
    <div class="modal-header" id="modal-header">
      <div class="modal-cover-box" id="modal-cover-box"></div>
      <div><div class="mh-genre" id="mh-genre"></div><div class="mh-title" id="mh-title"></div><div class="mh-subtitle" id="mh-subtitle"></div><div class="mh-author">Jems S. Pompée</div><div class="mh-meta-row" id="mh-meta"></div><div id="mh-unavail"></div></div>
    </div>
    <div class="modal-tabs" id="modal-tabs-bar">
      <button class="modal-tab active en" onclick="switchTab('synopsis',this)">Synopsis</button>
      <button class="modal-tab en" onclick="switchTab('buy',this)"><span class="tab-lbl-full">Buy This Book</span><span class="tab-lbl-short">Buy</span></button>
      <button class="modal-tab en" onclick="switchTab('related',this)"><span class="tab-lbl-full">Related Titles</span><span class="tab-lbl-short">Related</span></button>
      <button class="modal-tab active fr" onclick="switchTab('synopsis',this)">Synopsis</button>
      <button class="modal-tab fr" onclick="switchTab('buy',this)">Acheter</button>
      <button class="modal-tab fr" onclick="switchTab('related',this)"><span class="tab-lbl-full">Titres Liés</span><span class="tab-lbl-short">Liés</span></button>
      <button class="modal-tab active es" onclick="switchTab('synopsis',this)">Sinopsis</button>
      <button class="modal-tab es" onclick="switchTab('buy',this)">Comprar</button>
      <button class="modal-tab es" onclick="switchTab('related',this)"><span class="tab-lbl-full">Relacionados</span><span class="tab-lbl-short">Relac.</span></button>
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
<div class="search-overlay" id="search-overlay" onclick="closeSBg(event)" role="dialog" aria-modal="true" aria-labelledby="search-heading">
  <div class="search-box">
    <h2 class="sr-only" id="search-heading">Search books</h2>
    <div class="si-wrap">
      <input class="si-input" id="si-input" placeholder="Search titles, series, genres…" oninput="doSearch()" autocomplete="off" aria-label="Search titles and books">
      <button class="si-close" onclick="closeSearch()" aria-label="Close search">✕</button>
    </div>
    <p class="search-hint en">Try: "spy thriller" · "geopolitics" · "Mercer" · "bilingual"</p>
    <p class="search-hint fr">Essayez : "thriller" · "géopolitique" · "Mercer" · "bilingue"</p>
    <p class="search-hint es">Prueba: "thriller" · "geopolítica" · "Mercer" · "bilingüe"</p>
    <div id="search-results"></div>
  </div>
</div>

<!-- BACK TO TOP -->
<button id="back-to-top" class="back-to-top" onclick="window.scrollTo({top:0,behavior:'smooth'})" aria-label="Back to top / Retour en haut / Volver arriba">
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
</button>

<!-- COOKIE CONSENT BANNER -->
<div id="consent-banner" class="consent-banner" role="alertdialog" aria-live="polite">
  <div class="wrap consent-wrap">
    <div class="consent-text">
      <p class="en">We use analytics cookies to understand how readers find our books. You can decline and still access all content.</p>
      <p class="fr">Nous utilisons des cookies d'analyse pour comprendre comment les lecteurs trouvent nos livres. Vous pouvez refuser et accéder à tout le contenu.</p>
      <p class="es">Usamos cookies de análisis para entender cómo los lectores encuentran nuestros libros. Puedes rechazar y seguir accediendo al contenido.</p>
    </div>
    <div class="consent-actions">
      <button class="btn btn-primary en" onclick="grantConsent()">Accept Analytics</button>
      <button class="btn btn-primary fr" onclick="grantConsent()">Accepter</button>
      <button class="btn btn-primary es" onclick="grantConsent()">Aceptar</button>
      <button class="btn btn-ghost en" onclick="denyConsent()" style="color:rgba(255,255,255,0.75);border-color:rgba(255,255,255,0.25);">Decline</button>
      <button class="btn btn-ghost fr" onclick="denyConsent()" style="color:rgba(255,255,255,0.75);border-color:rgba(255,255,255,0.25);">Refuser</button>
      <button class="btn btn-ghost es" onclick="denyConsent()" style="color:rgba(255,255,255,0.75);border-color:rgba(255,255,255,0.25);">Rechazar</button>
    </div>
  </div>
</div>

<!-- ════════════════════
     DATA & LOGIC
════════════════════ -->`;

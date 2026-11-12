export const SERIES_CATEGORY_OPTIONS = [
  'Behavioral Sociology',
  'Bilingual Poetry',
  "Children's Educational Books",
  "Children's Illustrated Fiction",
  "Children's Non-Fiction",
  "Children's Picture Books",
  "Children's Poetry",
  "Children's Science & Discovery",
  'Crime Fiction',
  'Cultural Criticism',
  'Essay Collection',
  'Espionage Fiction',
  'Fantasy',
  'Geopolitics',
  'Geopolitical Theory',
  'Historical Fiction',
  'Horror',
  'Literary Fiction',
  'Memoir & Biography',
  'Philosophy',
  'Political Thriller',
  'Poetry',
  'Psychological Thriller',
  'Science Fiction',
  'Short Stories',
  'Social Essay',
  'Socio-Political Essay',
  'Speculative Fiction',
  'Spy Thriller',
  'Technology & Society',
];

const SITE_CONTENT_VERSION = 2;

const BOOK_LANGUAGE_OPTIONS = [
  { value: 'EN', labels: { en: 'English only', fr: 'Anglais seulement', es: 'Solo inglés' } },
  { value: 'FR', labels: { en: 'French only', fr: 'Français seulement', es: 'Solo francés' } },
  { value: 'ES', labels: { en: 'Spanish only', fr: 'Espagnol seulement', es: 'Solo español' } },
  { value: 'EN / FR', labels: { en: 'English & French', fr: 'Anglais et français', es: 'Inglés y francés' } },
  { value: 'EN / ES', labels: { en: 'English & Spanish', fr: 'Anglais et espagnol', es: 'Inglés y español' } },
  { value: 'FR / ES', labels: { en: 'French & Spanish', fr: 'Français et espagnol', es: 'Francés y español' } },
  { value: 'EN / FR / ES', labels: { en: 'English, French & Spanish', fr: 'Anglais, français et espagnol', es: 'Inglés, francés y español' } },
];

export const DEFAULT_SITE_CONTENT = {
  version: SITE_CONTENT_VERSION,
  socialLabels: {
    instagram: 'IG',
    x: 'X',
    linkedin: 'LI',
    facebook: 'FB',
    youtube: 'YT',
    tiktok: 'TT',
  },
  pages: [{
    id: 'home',
    name: 'Homepage',
    route: '/',
    fields: [
      {
        id: 'home-logo', label: 'Site name', selector: '.nav-logo-main',
        en: 'Spy on the Rise', fr: 'Spy on the Rise', es: 'Spy on the Rise',
      },
      {
        id: 'home-nav-subtitle', label: 'Navigation subtitle', selector: '.nav-logo-sub',
        en: 'Independent Publishing House', fr: "Maison d'Édition Indépendante", es: 'Editorial Independiente',
      },
      {
        id: 'home-eyebrow', label: 'Hero eyebrow', selector: '.hero-eyebrow',
        en: 'Independent Publishing House', fr: "Maison d'Édition Indépendante", es: 'Editorial Independiente',
      },
      {
        id: 'home-description', label: 'Hero description', selector: '.hero-desc',
        en: 'Where Ideas Rise. Where Voices Ascend. Geopolitical essays, espionage thrillers, speculative fiction, behavioral sociology, and poetry: a publishing house at the intersection of bold ideas and rising voices.',
        fr: "Où les Idées s'Élèvent. Où les Voix Montent. Essais géopolitiques, thrillers d'espionnage, fiction spéculative, sociologie comportementale et poésie : une maison d'édition à l'intersection des idées audacieuses et des voix montantes.",
        es: 'Donde las Ideas Ascienden. Donde las Voces se Elevan. Ensayos geopolíticos, thrillers de espionaje, ficción especulativa, sociología conductual y poesía: una editorial en la intersección de ideas audaces y voces emergentes.',
      },
      {
        id: 'home-primary-cta', label: 'Primary button', selector: '.hero-actions .btn-primary',
        en: 'Explore Catalog', fr: 'Explorer le Catalogue', es: 'Explorar Catálogo',
      },
      {
        id: 'home-secondary-cta', label: 'Series button', selector: '.hero-actions .btn-outline',
        en: 'View Series', fr: 'Voir les Séries', es: 'Ver Series',
      },
      {
        id: 'home-deals-cta', label: 'Deals button', selector: '.hero-actions .btn-gold',
        en: '⚡ Deals', fr: '⚡ Offres', es: '⚡ Ofertas',
      },
    ],
  }, {
    id: 'blog', name: 'Blog', route: '/blog', fields: [],
  }, {
    id: 'blog-article', name: 'Blog article', route: '/blog/[slug]', fields: [],
  }, {
    id: 'texts', name: 'Texts of the Month', route: '/textes', fields: [],
  }, {
    id: 'text-archive', name: 'Text archive', route: '/textes/archive', fields: [],
  }, {
    id: 'text-article', name: 'Text article', route: '/textes/[slug]', fields: [],
  }, {
    id: 'text-reading', name: 'Text reading page', route: '/textes/read/[id]', fields: [],
  }, {
    id: 'atlas-series', name: 'Atlas series', route: '/series/atlas', fields: [],
  }],
  options: {
    seriesGenres: [
      ...SERIES_CATEGORY_OPTIONS,
    ],
    bookGenres: [...SERIES_CATEGORY_OPTIONS],
    bookLanguages: BOOK_LANGUAGE_OPTIONS,
    bookStatuses: [
      { value: 'false', labels: { en: 'Locked / Forthcoming', fr: 'Verrouillé / À venir', es: 'Bloqueado / Próximamente' } },
      { value: 'true', labels: { en: 'Available now', fr: 'Disponible', es: 'Disponible ahora' } },
    ],
    textCategories: [
      ['Geopolitics', 'Géopolitique', 'Geopolítica'],
      ['Social Issues', 'Enjeux sociaux', 'Problemas sociales'],
      ['Human Psychology', 'Psychologie humaine', 'Psicología humana'],
      ['Technology and AI', 'Technologie et IA', 'Tecnología e IA'],
      ['Philosophy and Meaning', 'Philosophie et sens', 'Filosofía y sentido'],
      ['Power and Influence', 'Pouvoir et influence', 'Poder e influencia'],
      ['Culture and Identity', 'Culture et identité', 'Cultura e identidad'],
      ['Economics and Global Trends', 'Économie et tendances mondiales', 'Economía y tendencias globales'],
      ['Modern Relationships', 'Relations modernes', 'Relaciones modernas'],
    ],
  },
};

export function normalizeSiteContent(value) {
  const content = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const options = content.options && typeof content.options === 'object' && !Array.isArray(content.options)
    ? content.options
    : {};
  const migrateGenres = content.version !== SITE_CONTENT_VERSION;
  const toStringList = (value, fallback) => Array.isArray(value)
      ? value.filter(item => typeof item === 'string').map(item => item.trim().slice(0, 120)).filter(Boolean).slice(0, 200)
    : fallback;
  const toLocalizedList = (value, fallback) => Array.isArray(value)
    ? value.filter(item => item && typeof item === 'object' && typeof item.value === 'string')
      .map(item => ({
          value: item.value.trim().slice(0, 120),
        labels: Object.fromEntries(['en', 'fr', 'es'].map(lang => [
          lang,
            typeof item.labels?.[lang] === 'string' ? item.labels[lang].trim().slice(0, 120) : '',
        ])),
      }))
      .filter(item => item.value)
        .slice(0, 200)
    : fallback;
  const toCategories = (value, fallback) => Array.isArray(value)
    ? value.filter(row => Array.isArray(row))
        .map(row => ['en', 'fr', 'es'].map((_, index) => typeof row[index] === 'string' ? row[index].trim().slice(0, 120) : ''))
      .filter(row => row.some(Boolean))
        .slice(0, 200)
    : fallback;
  const configuredLanguages = toLocalizedList(options.bookLanguages, DEFAULT_SITE_CONTENT.options.bookLanguages);
  const bookLanguages = BOOK_LANGUAGE_OPTIONS.map(defaultOption => {
    const configuredOption = configuredLanguages.find(item => item.value === defaultOption.value);
    return configuredOption
      ? { ...defaultOption, labels: Object.fromEntries(['en', 'fr', 'es'].map(lang => [
          lang, configuredOption.labels[lang] || defaultOption.labels[lang],
        ])) }
      : defaultOption;
  });
  const pages = Array.isArray(content.pages)
    ? content.pages.filter(page => page && typeof page === 'object' && !Array.isArray(page))
      .map((page, index) => ({
        id: typeof page.id === 'string' ? page.id.slice(0, 120) : `page-${index}`,
        name: typeof page.name === 'string' ? page.name.slice(0, 120) : '',
        route: typeof page.route === 'string' ? page.route.slice(0, 300) : '/',
        fields: Array.isArray(page.fields) ? page.fields
          .filter(field => field && typeof field === 'object' && !Array.isArray(field))
          .map((field, fieldIndex) => ({
            id: typeof field.id === 'string' ? field.id.slice(0, 120) : `field-${fieldIndex}`,
            label: typeof field.label === 'string' ? field.label.slice(0, 160) : '',
            selector: typeof field.selector === 'string' ? field.selector.slice(0, 500) : '',
            icon: typeof field.icon === 'string' ? field.icon.slice(0, 100) : '',
            en: typeof field.en === 'string' ? field.en.slice(0, 1500) : '',
            fr: typeof field.fr === 'string' ? field.fr.slice(0, 1500) : '',
            es: typeof field.es === 'string' ? field.es.slice(0, 1500) : '',
          }))
          .slice(0, 30) : [],
      }))
      .slice(0, 15)
    : DEFAULT_SITE_CONTENT.pages;

  return {
    version: SITE_CONTENT_VERSION,
    socialLabels: Object.fromEntries(Object.keys(DEFAULT_SITE_CONTENT.socialLabels).map(key => [
      key,
      typeof content.socialLabels?.[key] === 'string'
        ? content.socialLabels[key].slice(0, 20)
        : DEFAULT_SITE_CONTENT.socialLabels[key],
    ])),
    pages,
    options: {
      seriesGenres: migrateGenres
        ? [...SERIES_CATEGORY_OPTIONS]
        : toStringList(options.seriesGenres, DEFAULT_SITE_CONTENT.options.seriesGenres),
      bookGenres: migrateGenres
        ? [...SERIES_CATEGORY_OPTIONS]
        : toStringList(options.bookGenres, DEFAULT_SITE_CONTENT.options.bookGenres),
      bookLanguages,
      bookStatuses: toLocalizedList(options.bookStatuses, DEFAULT_SITE_CONTENT.options.bookStatuses),
      textCategories: toCategories(options.textCategories, DEFAULT_SITE_CONTENT.options.textCategories),
    },
  };
}

export const PUBLISHING_SCHEMA_VERSION = 1;

export const PUBLISHING_CATEGORIES = [
  {
    id: 'biographies-memoirs',
    name: 'Biographies & Memoirs',
    subcategories: ['Biography', 'Memoir'],
  },
  {
    id: 'childrens-books',
    name: "Children's Books",
    subcategories: [
      "Children's Action & Adventure",
      "Children's Educational Books",
      "Children's Fairy Tales, Folktales & Myths",
      "Children's History & Geography",
      "Children's Illustrated Fiction",
      "Children's Mysteries & Detectives",
      "Children's Non-Fiction",
      "Children's Picture Books",
      "Children's Poetry",
      "Children's Science, Nature & Discovery",
      "Children's Science Fiction & Fantasy",
    ],
  },
  {
    id: 'history',
    name: 'History',
    subcategories: ['Historical Research', 'History & Civilization'],
  },
  {
    id: 'literature-fiction',
    name: 'Literature & Fiction',
    subcategories: ['Fantasy', 'Historical Fiction', 'Horror', 'Literary Fiction', 'Short Stories', 'Speculative Fiction'],
  },
  {
    id: 'mystery-thriller-suspense',
    name: 'Mystery, Thriller & Suspense',
    subcategories: ['Crime Fiction', 'Espionage Fiction', 'Political Thriller', 'Psychological Thriller', 'Spy Thriller'],
  },
  {
    id: 'poetry',
    name: 'Poetry',
    subcategories: ['Bilingual Poetry', 'Poetry'],
  },
  {
    id: 'politics-social-sciences',
    name: 'Politics & Social Sciences',
    subcategories: [
      'Behavioral Sociology',
      'Cultural Criticism',
      'Geopolitics',
      'Geopolitical Theory',
      'Philosophy',
      'Social Essay',
      'Socio-Political Essay',
      'Technology & Society',
    ],
  },
  {
    id: 'essays-literary-collections',
    name: 'Essays & Literary Collections',
    subcategories: ['Essay Collection'],
  },
];

export const PUBLISHING_GENRE_SEEDS = [
  'Behavioral Sociology', 'Bilingual Poetry', "Children's Educational Books",
  "Children's Illustrated Fiction", "Children's Non-Fiction", "Children's Picture Books",
  "Children's Poetry", "Children's Science & Discovery", 'Crime Fiction', 'Cultural Criticism',
  'Essay Collection', 'Espionage Fiction', 'Fantasy', 'Geopolitics', 'Geopolitical Theory',
  'Historical Fiction', 'Horror', 'Literary Fiction', 'Memoir & Biography', 'Philosophy',
  'Political Thriller', 'Poetry', 'Psychological Thriller', 'Science Fiction', 'Short Stories',
  'Social Essay', 'Socio-Political Essay', 'Speculative Fiction', 'Spy Thriller',
  'Technology & Society', 'Biography', 'Memoir', 'Essay',
];

export const PUBLISHING_SUBJECT_SEEDS = [
  'Behavioral Sociology', 'Cultural Criticism', 'Geopolitics', 'Geopolitical Theory',
  'History & Civilization', 'International Relations', 'Philosophy', 'Social Issues',
  'Society & Culture', 'Technology & Society', 'Political Science', 'Science', 'Nature', 'Education',
];

export const PUBLISHING_CONTENT_TYPES = [
  { id: 'fiction', label: 'Fiction' },
  { id: 'nonfiction', label: 'Nonfiction' },
  { id: 'poetry', label: 'Poetry' },
  { id: 'educational', label: 'Educational' },
  { id: 'essay', label: 'Essay' },
  { id: 'memoir', label: 'Memoir' },
  { id: 'hybrid', label: 'Hybrid' },
];

export const PUBLISHING_AUDIENCES = [
  { id: 'children', label: 'Children' },
  { id: 'young-adult', label: 'Young Adult' },
  { id: 'adult', label: 'Adult' },
  { id: 'all-ages', label: 'All Ages' },
];

export const PUBLISHING_READING_LEVELS = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

export const PUBLISHING_FORMATS = [
  { id: 'kindle-ebook', label: 'Kindle eBook' },
  { id: 'paperback', label: 'Paperback' },
  { id: 'hardcover', label: 'Hardcover' },
  { id: 'epub', label: 'EPUB' },
  { id: 'pdf', label: 'PDF' },
  { id: 'audiobook', label: 'Audiobook' },
  { id: 'print-unspecified', label: 'Print (unspecified)' },
  { id: 'ebook-unspecified', label: 'eBook (unspecified)' },
  { id: 'audio-unspecified', label: 'Audio (unspecified)' },
  { id: 'other', label: 'Other' },
];

export const PUBLISHING_LANGUAGES = [
  { id: 'en', label: 'English', code: 'EN' },
  { id: 'fr', label: 'French', code: 'FR' },
  { id: 'es', label: 'Spanish', code: 'ES' },
];

const slug = value => String(value).toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const validationError = message => Object.assign(new Error(message), { status: 400 });

function ensureCatalogCollections(catalog) {
  for (const key of [
    'PUBLISHING_CATEGORIES', 'PUBLISHING_SUBCATEGORIES', 'PUBLISHING_GENRES',
    'PUBLISHING_SUBJECTS', 'PUBLISHING_CONTENT_TYPES', 'PUBLISHING_AUDIENCES',
    'PUBLISHING_READING_LEVELS', 'PUBLISHING_FORMATS', 'PUBLISHING_LANGUAGES',
    'BOOK_SERIES', 'BOOK_GENRES', 'BOOK_SUBJECTS', 'AUTHORS', 'BOOK_CONTRIBUTORS',
    'PUBLISHERS', 'COLLECTIONS', 'BOOK_COLLECTIONS', 'EDITIONS',
    'DISTRIBUTION_CHANNELS', 'LISTINGS', 'KDP_MAPPINGS',
  ]) {
    if (!catalog[key] || typeof catalog[key] !== 'object') catalog[key] = {};
  }
}

function addNamedValues(target, labels) {
  for (const label of labels) {
    const id = slug(label);
    if (!target[id]) target[id] = { id, label, active: true };
  }
}

export function migratePublishingCatalog(input) {
  const catalog = input;
  ensureCatalogCollections(catalog);
  const report = {
    booksPreserved: Object.keys(catalog.BOOKS || {}).length,
    booksMigrated: 0,
    booksUpdated: 0,
    booksSkipped: 0,
    seriesMembershipsCreated: 0,
    publishersCreated: 0,
    editionsCreated: 0,
    listingsCreated: 0,
    flaggedBooks: [],
    alreadyMigrated: false,
  };
  if ((catalog.PUBLISHING_SCHEMA_VERSION || 0) >= PUBLISHING_SCHEMA_VERSION) {
    report.alreadyMigrated = true;
    return { catalog, report };
  }

  for (const parent of PUBLISHING_CATEGORIES) {
    catalog.PUBLISHING_CATEGORIES[parent.id] = {
      ...catalog.PUBLISHING_CATEGORIES[parent.id],
      id: parent.id,
      label: parent.name,
      active: catalog.PUBLISHING_CATEGORIES[parent.id]?.active !== false,
    };
    for (const label of parent.subcategories) {
      const id = slug(label);
      catalog.PUBLISHING_SUBCATEGORIES[id] = {
        ...catalog.PUBLISHING_SUBCATEGORIES[id],
        id,
        label,
        parentId: parent.id,
        active: catalog.PUBLISHING_SUBCATEGORIES[id]?.active !== false,
      };
    }
  }

  const legacyGenres = Object.values(catalog.BOOKS || {}).map(book => book.genre).filter(Boolean);
  addNamedValues(catalog.PUBLISHING_GENRES, [...PUBLISHING_GENRE_SEEDS, ...legacyGenres]);
  addNamedValues(catalog.PUBLISHING_SUBJECTS, PUBLISHING_SUBJECT_SEEDS);
  for (const group of [
    ['PUBLISHING_CONTENT_TYPES', PUBLISHING_CONTENT_TYPES],
    ['PUBLISHING_AUDIENCES', PUBLISHING_AUDIENCES],
    ['PUBLISHING_READING_LEVELS', PUBLISHING_READING_LEVELS],
    ['PUBLISHING_FORMATS', PUBLISHING_FORMATS],
    ['PUBLISHING_LANGUAGES', PUBLISHING_LANGUAGES],
  ]) {
    for (const item of group[1]) {
      catalog[group[0]][item.id] ||= { ...item, active: true };
    }
  }

  let nextBookId = 1;
  const usedBookIds = new Set();
  for (const [bookKey, book] of Object.entries(catalog.BOOKS || {})) {
    const genreId = book.genre ? slug(book.genre) : null;
    const mappedSubcategory = book.genre
      ? Object.values(catalog.PUBLISHING_SUBCATEGORIES).find(item => item.label === book.genre)
      : null;
    const savedSubcategory = book.publishingSubcategoryId
      ? catalog.PUBLISHING_SUBCATEGORIES[book.publishingSubcategoryId]
      : null;
    const savedCategory = book.publishingCategoryId
      ? catalog.PUBLISHING_CATEGORIES[book.publishingCategoryId]
      : null;
    const savedClassificationValid = (!book.publishingSubcategoryId && savedCategory) ||
      (savedCategory && savedSubcategory && savedSubcategory.parentId === savedCategory.id);
    if ((book.publishingCategoryId || book.publishingSubcategoryId) && !savedClassificationValid) {
      book.legacyPublishingClassification ||= {
        categoryId: book.publishingCategoryId || null,
        subcategoryId: book.publishingSubcategoryId || null,
      };
      report.flaggedBooks.push({
        key: bookKey,
        reason: 'Existing publishing category relationship was invalid and has been retained for review',
        value: book.legacyPublishingClassification,
      });
    }
    const matchedSeries = new Set([
      ...(book.seriesKey ? [book.seriesKey] : []),
      ...Object.values(catalog.SERIES || {}).filter(series => (series.volumes || []).includes(bookKey)).map(series => series.key),
    ]);

    if (!book.sotrBookId || usedBookIds.has(book.sotrBookId)) {
      if (book.sotrBookId && usedBookIds.has(book.sotrBookId)) {
        book.legacySotrBookId ||= book.sotrBookId;
      }
      let generated;
      do {
        generated = `SOTR-BK-${String(nextBookId++).padStart(4, '0')}`;
      } while (usedBookIds.has(generated));
      book.sotrBookId = generated;
    }
    usedBookIds.add(book.sotrBookId);
    const genreIds = [...new Set([
      ...(Array.isArray(book.genreIds) ? book.genreIds : []),
      ...Object.values(catalog.BOOK_GENRES).filter(item => item.bookKey === bookKey).map(item => item.genreId),
      ...(genreId && catalog.PUBLISHING_GENRES[genreId] ? [genreId] : []),
    ])];
    const priorPrimaryGenre = Object.values(catalog.BOOK_GENRES).find(item => item.bookKey === bookKey && item.isPrimary)?.genreId;
    const primaryGenreId = genreIds.includes(book.primaryGenreId) ? book.primaryGenreId :
      genreIds.includes(priorPrimaryGenre) ? priorPrimaryGenre : genreIds[0] || null;
    genreIds.forEach((id, index) => {
      catalog.BOOK_GENRES[`${bookKey}:${id}`] ||= {
        bookKey, genreId: id, isPrimary: id === primaryGenreId, displayOrder: index,
      };
      catalog.BOOK_GENRES[`${bookKey}:${id}`].isPrimary = id === primaryGenreId;
      catalog.BOOK_GENRES[`${bookKey}:${id}`].displayOrder ??= index;
      if (!catalog.PUBLISHING_GENRES[id]) {
        report.flaggedBooks.push({ key: bookKey, reason: 'Existing genre relation references a missing genre', value: id });
      }
    });
    delete book.primaryGenreId;
    delete book.genreIds;

    const subjectIds = [...new Set([
      ...(Array.isArray(book.subjectIds) ? book.subjectIds : []),
      ...Object.values(catalog.BOOK_SUBJECTS).filter(item => item.bookKey === bookKey).map(item => item.subjectId),
    ])];
    const priorPrimarySubject = Object.values(catalog.BOOK_SUBJECTS).find(item => item.bookKey === bookKey && item.isPrimary)?.subjectId;
    const primarySubjectId = subjectIds.includes(book.primarySubjectId) ? book.primarySubjectId :
      subjectIds.includes(priorPrimarySubject) ? priorPrimarySubject : null;
    subjectIds.forEach((id, index) => {
      catalog.BOOK_SUBJECTS[`${bookKey}:${id}`] ||= {
        bookKey, subjectId: id, isPrimary: id === primarySubjectId, displayOrder: index,
      };
      catalog.BOOK_SUBJECTS[`${bookKey}:${id}`].isPrimary = id === primarySubjectId;
      catalog.BOOK_SUBJECTS[`${bookKey}:${id}`].displayOrder ??= index;
      if (!catalog.PUBLISHING_SUBJECTS[id]) {
        report.flaggedBooks.push({ key: bookKey, reason: 'Existing subject relation references a missing subject', value: id });
      }
    });
    delete book.primarySubjectId;
    delete book.subjectIds;
    if (savedClassificationValid) {
      book.publishingCategoryId = savedCategory.id;
      book.publishingSubcategoryId = savedSubcategory?.id || null;
    } else {
      book.publishingCategoryId = mappedSubcategory?.parentId || null;
      book.publishingSubcategoryId = mappedSubcategory?.id || null;
    }
    book.contentTypeId = book.contentTypeId || null;
    book.targetAudienceId = book.targetAudienceId || null;
    book.ageRangeMin = book.ageRangeMin ?? null;
    book.ageRangeMax = book.ageRangeMax ?? null;
    book.readingLevelId = book.readingLevelId || null;
    book.originalLanguageId = book.originalLanguageId || null;
    book.publicationStatus = book.publicationStatus || null;
    const publisherDetail = (book.details || []).find(detail =>
      Array.isArray(detail) && String(detail[0]).toLowerCase() === 'publisher' && String(detail[1] || '').trim(),
    );
    const publisherName = String(publisherDetail?.[1] || '').trim();
    if (publisherName) {
      const publisherId = slug(publisherName);
      if (!catalog.PUBLISHERS[publisherId]) {
        catalog.PUBLISHERS[publisherId] = { id: publisherId, name: publisherName, active: true };
        report.publishersCreated++;
      }
      book.publisherId = book.publisherId || publisherId;
    } else {
      book.publisherId = book.publisherId || null;
    }
    const collectionIds = [...new Set([
      ...(Array.isArray(book.collectionIds) ? book.collectionIds : []),
      ...Object.values(catalog.BOOK_COLLECTIONS).filter(item => item.bookKey === bookKey).map(item => item.collectionId),
    ])];
    book.collectionIds = collectionIds;
    book.contributors = Array.isArray(book.contributors) ? book.contributors : [];
    if (!Array.isArray(book.seriesMemberships)) {
      if (book.seriesMemberships != null) book.legacySeriesMemberships ||= book.seriesMemberships;
      book.seriesMemberships = [];
    }
    report.booksMigrated++;
    report.booksUpdated++;

    for (const collectionId of book.collectionIds) {
      if (catalog.COLLECTIONS[collectionId]) {
        catalog.BOOK_COLLECTIONS[`${bookKey}:${collectionId}`] ||= { bookKey, collectionId };
      } else {
        book.legacyCollectionIds ||= [];
        if (!book.legacyCollectionIds.includes(collectionId)) book.legacyCollectionIds.push(collectionId);
      }
    }
    for (const contributor of book.contributors) {
      if (contributor?.authorId && catalog.AUTHORS[contributor.authorId]) {
        catalog.BOOK_CONTRIBUTORS[`${bookKey}:${contributor.authorId}`] ||= {
          bookKey,
          authorId: contributor.authorId,
          role: contributor.role || 'author',
          displayOrder: Number(contributor.displayOrder) || 0,
        };
      } else {
        book.legacyContributors ||= [];
        book.legacyContributors.push(contributor);
        report.flaggedBooks.push({
          key: bookKey,
          reason: 'Existing contributor reference is invalid and was retained for review',
          value: contributor?.authorId || contributor,
        });
      }
    }
    delete book.collectionIds;
    delete book.contributors;

    for (const seriesKey of matchedSeries) {
      if (!catalog.SERIES?.[seriesKey]) continue;
      if (!catalog.BOOK_SERIES[`${bookKey}:${seriesKey}`]) {
        const volumeLabel = book.vol || null;
        const numericVolume = volumeLabel ? Number(String(volumeLabel).match(/\d+(?:\.\d+)?/)?.[0]) : null;
        const order = catalog.SERIES[seriesKey].volumes?.indexOf(bookKey);
        catalog.BOOK_SERIES[`${bookKey}:${seriesKey}`] = {
          bookKey,
          seriesKey,
          volumeNumber: Number.isFinite(numericVolume) ? numericVolume : null,
          volumeLabel,
          readingOrder: null,
          publicationOrder: order >= 0 ? order + 1 : null,
        };
        report.seriesMembershipsCreated++;
      }
    }
    for (const membership of book.seriesMemberships || []) {
      if (!membership?.seriesKey || !catalog.SERIES?.[membership.seriesKey]) {
        book.legacySeriesMemberships ||= [];
        book.legacySeriesMemberships.push(membership);
        report.flaggedBooks.push({
          key: bookKey,
          reason: 'Existing series membership references a missing series and was retained for review',
          value: membership?.seriesKey || membership,
        });
        continue;
      }
      const relationKey = `${bookKey}:${membership.seriesKey}`;
      if (!catalog.BOOK_SERIES[relationKey]) {
        catalog.SERIES[membership.seriesKey].volumes ||= [];
        catalog.BOOK_SERIES[relationKey] = {
          ...membership,
          bookKey,
          seriesKey: membership.seriesKey,
        };
        if (!catalog.SERIES[membership.seriesKey].volumes.includes(bookKey)) {
          catalog.SERIES[membership.seriesKey].volumes.push(bookKey);
        }
        report.seriesMembershipsCreated++;
      }
    }
    for (const [, relation] of Object.entries(catalog.BOOK_SERIES)) {
      if (relation.bookKey === bookKey) {
        if (!book.seriesMemberships.some(item => item.seriesKey === relation.seriesKey)) {
          book.seriesMemberships.push({ ...relation });
        }
      }
    }
    delete book.seriesMemberships;
    if (book.genre && !mappedSubcategory) report.flaggedBooks.push({ key: bookKey, reason: 'Legacy genre has no approved publishing subcategory mapping', value: book.genre });

    const links = book.links && typeof book.links === 'object' ? book.links : {};
    for (const [legacyFormat, platformLinks] of Object.entries(links)) {
      if (!platformLinks || typeof platformLinks !== 'object') continue;
      const entries = Object.entries(platformLinks).filter(([, url]) =>
        typeof url === 'string' && /^https?:\/\//i.test(url.trim()),
      );
      if (!entries.length) continue;
      const formatLookup = { print: 'print-unspecified', ebook: 'ebook-unspecified', audio: 'audio-unspecified' };
      const formatId = formatLookup[legacyFormat];
      if (!formatId) continue;
      const editionId = `legacy-${bookKey}-${formatId}`;
      if (!catalog.EDITIONS[editionId]) {
        const legacyLanguageCodes = String(book.lang || '').split(/[\/,|]/).map(code => code.trim().toUpperCase());
        const languageIds = PUBLISHING_LANGUAGES.filter(language => legacyLanguageCodes.includes(language.code)).map(language => language.id);
        catalog.EDITIONS[editionId] = {
          id: editionId, bookKey, name: 'Legacy edition', languageIds,
          formatId, isbn10: '', isbn13: '', publicationDate: '', status: 'unverified',
          pageCount: '', trimSize: '', price: '', currency: '',
        };
        report.editionsCreated++;
      }
      for (const [platformKey, url] of entries) {
        const platform = catalog.PLATFORMS?.[legacyFormat]?.find(item => item.key === platformKey);
        const channelId = `${legacyFormat}-${platformKey}`;
        catalog.DISTRIBUTION_CHANNELS[channelId] ||= { id: channelId, name: platform?.name || platformKey, legacyFormat, active: true };
        const listingId = `${editionId}-${platformKey}`;
        if (!catalog.LISTINGS[listingId]) {
          catalog.LISTINGS[listingId] = {
            id: listingId, editionId, channelId, marketplace: '', externalProductId: '',
            url, status: 'unverified', listPrice: '', currency: '', listingDate: '',
            lastVerifiedAt: '', notes: '',
          };
          report.listingsCreated++;
        }
      }
    }
  }

  catalog.PUBLISHING_SCHEMA_VERSION = PUBLISHING_SCHEMA_VERSION;
  catalog.PUBLISHING_MIGRATION_REPORT = {
    version: PUBLISHING_SCHEMA_VERSION,
    completedAt: new Date().toISOString(),
    ...report,
  };
  return { catalog, report };
}

export function validateEditorialRelations(updates, catalog, currentBook = {}) {
  const values = { ...currentBook, ...updates };
  const categoryId = values.publishingCategoryId || null;
  const subcategoryId = values.publishingSubcategoryId || null;
  if (subcategoryId) {
    const subcategory = catalog.PUBLISHING_SUBCATEGORIES?.[subcategoryId];
    if (!subcategory || (!subcategory.active && subcategoryId !== currentBook.publishingSubcategoryId)) {
      throw validationError('Publishing subcategory is missing or inactive.');
    }
    if (subcategory.parentId !== categoryId) throw validationError('Publishing subcategory does not belong to the selected publishing category.');
    if (!catalog.PUBLISHING_CATEGORIES?.[categoryId] ||
        (!catalog.PUBLISHING_CATEGORIES[categoryId].active && categoryId !== currentBook.publishingCategoryId)) {
      throw validationError('Publishing category is missing or inactive.');
    }
  } else if (categoryId && (!catalog.PUBLISHING_CATEGORIES?.[categoryId] ||
      (!catalog.PUBLISHING_CATEGORIES[categoryId].active && categoryId !== currentBook.publishingCategoryId))) {
    throw validationError('Publishing category is invalid.');
  }

  for (const field of ['genreIds', 'subjectIds']) {
    const table = field === 'genreIds' ? catalog.PUBLISHING_GENRES : catalog.PUBLISHING_SUBJECTS;
    const priorIds = currentBook[field] || [];
    if (values[field] !== undefined && (!Array.isArray(values[field]) || values[field].some(id =>
      !table?.[id] || (!table[id].active && !priorIds.includes(id)),
    ))) {
      throw validationError(`One or more selected ${field === 'genreIds' ? 'genres' : 'subjects'} are invalid or inactive.`);
    }
  }
  if (values.primaryGenreId && !values.genreIds?.includes(values.primaryGenreId)) {
    throw validationError('The primary genre must be included in the selected genres.');
  }
  if (values.primarySubjectId && !values.subjectIds?.includes(values.primarySubjectId)) {
    throw validationError('The primary subject must be included in the selected subjects.');
  }
  for (const [field, table, message] of [
    ['contentTypeId', catalog.PUBLISHING_CONTENT_TYPES, 'Content type is invalid or inactive.'],
    ['targetAudienceId', catalog.PUBLISHING_AUDIENCES, 'Target audience is invalid or inactive.'],
    ['readingLevelId', catalog.PUBLISHING_READING_LEVELS, 'Reading level is invalid or inactive.'],
    ['originalLanguageId', catalog.PUBLISHING_LANGUAGES, 'Original language is invalid or inactive.'],
  ]) {
    if (values[field] && (!table?.[values[field]] ||
        (!table[values[field]].active && values[field] !== currentBook[field]))) throw validationError(message);
  }
  if (values.publisherId && (!catalog.PUBLISHERS?.[values.publisherId] ||
      (!catalog.PUBLISHERS[values.publisherId].active && values.publisherId !== currentBook.publisherId))) {
    throw validationError('Publisher is invalid or inactive.');
  }
  if (values.ageRangeMin !== null && values.ageRangeMin !== undefined && values.ageRangeMin !== '' &&
      (!Number.isInteger(Number(values.ageRangeMin)) || Number(values.ageRangeMin) < 0)) throw validationError('Minimum age must be a non-negative whole number.');
  if (values.ageRangeMax !== null && values.ageRangeMax !== undefined && values.ageRangeMax !== '' &&
      (!Number.isInteger(Number(values.ageRangeMax)) || Number(values.ageRangeMax) < 0)) throw validationError('Maximum age must be a non-negative whole number.');
  if (values.ageRangeMin !== null && values.ageRangeMin !== undefined && values.ageRangeMin !== '' &&
      values.ageRangeMax !== null && values.ageRangeMax !== undefined && values.ageRangeMax !== '' &&
      Number(values.ageRangeMin) > Number(values.ageRangeMax)) throw validationError('Minimum age cannot exceed maximum age.');
  const requiresClassification = ['ready-for-publication', 'published'].includes(values.publicationStatus);
  if (!['draft', 'in-development', 'ready-for-publication', 'published', 'discontinued'].includes(values.publicationStatus || 'draft')) {
    throw validationError('Publication status is invalid.');
  }
  if (requiresClassification && (!categoryId || !subcategoryId)) {
    throw validationError('A publishing category and subcategory are required before publication.');
  }
}

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../lib/publishingSchema.js', import.meta.url), 'utf8');
const schema = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const { PUBLISHING_CATEGORIES, migratePublishingCatalog, validateEditorialRelations } = schema;
const siteContentSource = await readFile(new URL('../lib/siteContent.js', import.meta.url), 'utf8');
const siteContent = await import(`data:text/javascript;base64,${Buffer.from(siteContentSource).toString('base64')}`);

function fixture() {
  return {
    BOOKS: {
      spy1: {
        key: 'spy1',
        title: 'The Existing Spy Novel',
        title_en: 'The Existing Spy Novel',
        title_fr: 'Le Roman Espion Existant',
        title_es: 'La Novela de Espías Existente',
        genre: 'Spy Thriller',
        lang: 'EN / FR',
        seriesKey: 'mercer',
        series: 'The Mercer Files',
        vol: 'Vol. 1',
        available: true,
        image: '/covers/spy1.webp',
        genreIds: ['spy-thriller', 'crime-fiction'],
        primaryGenreId: 'spy-thriller',
        subjectIds: ['geopolitics'],
        primarySubjectId: 'geopolitics',
        collectionIds: ['spy-readers'],
        contributors: [{ authorId: 'jane-doe', role: 'author', displayOrder: 0 }],
        seriesMemberships: [{ seriesKey: 'mercer', volumeNumber: 1, volumeLabel: 'Vol. 1' }],
        details: [['Publisher', 'SPY ON THE RISE']],
        links: { ebook: { amazon: 'https://example.com/book' } },
      },
      standalone: {
        key: 'standalone',
        title: 'A Standalone Book',
        genre: 'Science Fiction',
        lang: 'EN',
        seriesKey: null,
        series: 'Standalone',
        vol: '',
        available: false,
        links: { print: { amazon: '#' } },
      },
    },
    SERIES: {
      mercer: {
        key: 'mercer', name: 'The Mercer Files', name_en: 'The Mercer Files',
        name_fr: 'Les Dossiers Mercer', name_es: 'Los Archivos Mercer',
        desc_en: 'English description', desc_fr: 'Description française', desc_es: 'Descripción española',
        volumes: ['spy1'],
      },
    },
    AUTHORS: {
      'jane-doe': { id: 'jane-doe', name: 'Jane Doe', active: true },
    },
    COLLECTIONS: {
      'spy-readers': { id: 'spy-readers', name: 'Spy Readers', status: 'active' },
    },
    PLATFORMS: {
      ebook: [{ key: 'amazon', name: 'Amazon' }],
    },
    BUNDLES: [],
  };
}

test('seeds the eight approved publishing parents and all 37 children', () => {
  assert.equal(PUBLISHING_CATEGORIES.length, 8);
  assert.equal(PUBLISHING_CATEGORIES.reduce((count, item) => count + item.subcategories.length, 0), 37);
});

test('migration preserves books and legacy values, creates relational data, and is repeatable', () => {
  const catalog = fixture();
  const originalSpyBook = JSON.parse(JSON.stringify(catalog.BOOKS.spy1));
  const first = migratePublishingCatalog(catalog);

  assert.equal(first.report.booksPreserved, 2);
  assert.equal(first.report.booksMigrated, 2);
  assert.equal(first.catalog.BOOKS.spy1.title, originalSpyBook.title);
  assert.equal(first.catalog.BOOKS.spy1.title_fr, originalSpyBook.title_fr);
  assert.equal(first.catalog.SERIES.mercer.name_fr, 'Les Dossiers Mercer');
  assert.equal(first.catalog.SERIES.mercer.desc_es, 'Descripción española');
  assert.equal(first.catalog.BOOKS.spy1.image, originalSpyBook.image);
  assert.deepEqual(first.catalog.BOOKS.spy1.links, originalSpyBook.links);
  assert.match(first.catalog.BOOKS.spy1.sotrBookId, /^SOTR-BK-\d{4}$/);
  assert.equal(first.catalog.BOOKS.spy1.publishingCategoryId, 'mystery-thriller-suspense');
  assert.equal(first.catalog.BOOKS.spy1.publishingSubcategoryId, 'spy-thriller');
  assert.equal(first.catalog.BOOKS.spy1.publisherId, 'spy-on-the-rise');
  assert.equal(first.catalog.BOOKS.standalone.seriesKey, null);
  assert.equal(first.catalog.BOOK_SERIES['spy1:mercer'].volumeNumber, 1);
  assert.equal(first.catalog.BOOK_GENRES['spy1:spy-thriller'].isPrimary, true);
  assert.equal(first.catalog.BOOK_GENRES['spy1:crime-fiction'].isPrimary, false);
  assert.equal(first.catalog.BOOK_SUBJECTS['spy1:geopolitics'].isPrimary, true);
  assert.equal(first.catalog.BOOK_COLLECTIONS['spy1:spy-readers'].collectionId, 'spy-readers');
  assert.equal(first.catalog.BOOK_CONTRIBUTORS['spy1:jane-doe'].authorId, 'jane-doe');
  assert.equal(first.catalog.BOOKS.spy1.genreIds, undefined);
  assert.equal(first.catalog.BOOKS.spy1.subjectIds, undefined);
  assert.equal(first.catalog.BOOKS.spy1.collectionIds, undefined);
  assert.equal(first.catalog.BOOKS.spy1.contributors, undefined);
  assert.equal(first.catalog.BOOKS.spy1.seriesMemberships, undefined);
  assert.equal(first.catalog.EDITIONS['legacy-spy1-ebook-unspecified'].formatId, 'ebook-unspecified');
  assert.equal(first.catalog.LISTINGS['legacy-spy1-ebook-unspecified-amazon'].url, originalSpyBook.links.ebook.amazon);
  assert.equal(first.catalog.LISTINGS['legacy-spy1-ebook-unspecified-amazon'].externalProductId, '');
  assert.equal(first.catalog.EDITIONS['legacy-standalone-print-unspecified'], undefined);
  assert.equal(Object.values(first.catalog.LISTINGS).some(item => item.url === '#'), false);
  assert.equal(first.catalog.BOOKS.spy1.isbn13, undefined);
  assert.equal(first.catalog.EDITIONS['legacy-spy1-ebook-unspecified'].asin, undefined);
  assert.equal(first.report.flaggedBooks.some(item => item.key === 'standalone' && item.value === 'Science Fiction'), true);

  const serialized = JSON.stringify(first.catalog);
  const second = migratePublishingCatalog(first.catalog);
  assert.equal(second.report.alreadyMigrated, true);
  assert.equal(JSON.stringify(second.catalog), serialized);
});

test('server validation rejects an unrelated child category and accepts its valid parent', () => {
  const { catalog } = migratePublishingCatalog(fixture());
  assert.throws(
    () => validateEditorialRelations({
      publishingCategoryId: 'poetry',
      publishingSubcategoryId: 'spy-thriller',
    }, catalog),
    /does not belong/,
  );
  assert.doesNotThrow(() => validateEditorialRelations({
    publishingCategoryId: 'mystery-thriller-suspense',
    publishingSubcategoryId: 'spy-thriller',
    genreIds: ['spy-thriller'],
    primaryGenreId: 'spy-thriller',
    publicationStatus: 'draft',
  }, catalog));
});

test('migration retains an inconsistent existing classification for editorial review', () => {
  const catalog = fixture();
  catalog.BOOKS.standalone.publishingCategoryId = 'poetry';
  catalog.BOOKS.standalone.publishingSubcategoryId = 'spy-thriller';
  const result = migratePublishingCatalog(catalog);

  assert.deepEqual(result.catalog.BOOKS.standalone.legacyPublishingClassification, {
    categoryId: 'poetry',
    subcategoryId: 'spy-thriller',
  });
  assert.equal(result.report.flaggedBooks.some(item => item.key === 'standalone' && item.reason.includes('invalid')), true);
});

test('a publishable book requires both controlled publishing levels', () => {
  const { catalog } = migratePublishingCatalog(fixture());
  assert.throws(
    () => validateEditorialRelations({ publicationStatus: 'published' }, catalog),
    /required before publication/,
  );
});

test('language options include all single, paired, and triple platform languages', () => {
  const content = siteContent.normalizeSiteContent({
    version: 2,
    options: {
      bookLanguages: [
        { value: 'EN / FR', labels: { en: 'English & French', fr: '', es: '' } },
      ],
    },
  });
  const options = content.options.bookLanguages;
  assert.deepEqual(options.map(option => option.value), [
    'EN', 'FR', 'ES', 'EN / FR', 'EN / ES', 'FR / ES', 'EN / FR / ES',
  ]);
  assert.equal(options.find(option => option.value === 'EN / FR').labels.fr, 'Anglais et français');
});

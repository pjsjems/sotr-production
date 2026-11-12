import { parseCatalog, readSiteLock, readSiteConfig } from '../../lib/adminData';
import { normalizeSiteContent } from '../../lib/siteContent';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const [catalog, locked, config] = await Promise.all([parseCatalog(), readSiteLock(), readSiteConfig()]);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    const categories = Object.values(catalog.PUBLISHING_CATEGORIES || {});
    const subcategories = Object.values(catalog.PUBLISHING_SUBCATEGORIES || {});
    const activeCategories = categories.filter(category => category.active);
    const editions = Object.values(catalog.EDITIONS || {});
    const hiddenSeriesKeys = new Set(Object.values(catalog.SERIES || {}).filter(series => series.hidden).map(series => series.key));
    const hiddenSeriesBooks = new Set(Object.values(catalog.BOOK_SERIES || {})
      .filter(relation => hiddenSeriesKeys.has(relation.seriesKey))
      .map(relation => relation.bookKey));
    for (const seriesKey of hiddenSeriesKeys) {
      for (const bookKey of catalog.SERIES?.[seriesKey]?.volumes || []) hiddenSeriesBooks.add(bookKey);
    }
    const relationsFor = (table, bookKey) => Object.values(catalog[table] || {})
      .filter(relation => relation.bookKey === bookKey)
      .sort((left, right) => Number(left.displayOrder || 0) - Number(right.displayOrder || 0));
    const BOOKS = Object.fromEntries(Object.entries(catalog.BOOKS || {}).filter(([key]) => !hiddenSeriesBooks.has(key)).map(([key, book]) => {
      const { publishingCategoryId, publishingSubcategoryId, ...publicBook } = book;
      const genreRelations = relationsFor('BOOK_GENRES', key);
      const subjectRelations = relationsFor('BOOK_SUBJECTS', key);
      const contributorRelations = relationsFor('BOOK_CONTRIBUTORS', key);
      const editoriallyPublished = book.publicationStatus === 'published';
      const publishedEditions = editoriallyPublished ? editions.filter(edition => edition.bookKey === key && edition.status === 'published') : [];
      const editionLanguageIds = [...new Set(publishedEditions.flatMap(edition => edition.languageIds || []))];
      const formatIds = [...new Set(publishedEditions.map(edition => edition.formatId).filter(Boolean))];
      const basePrice = book.price_en || publicBook.price || '';
      const comingSoon = !book.available && /^coming soon$/i.test(basePrice);
      return [key, {
        key,
        color: publicBook.color,
        orn: publicBook.orn,
        genre: publicBook.genre,
        title: publicBook.title,
        titles: {
          en: book.title_en || publicBook.title || '',
          fr: book.title_fr || book.title_en || publicBook.title || '',
          es: book.title_es || book.title_en || publicBook.title || '',
        },
        subtitles: {
          en: book.subtitle_en || publicBook.subtitle || '',
          fr: book.subtitle_fr || book.subtitle_en || publicBook.subtitle || '',
          es: book.subtitle_es || book.subtitle_en || publicBook.subtitle || '',
        },
        genreLabels: {
          en: book.genre_en || publicBook.genre || '',
          fr: book.genre_fr || book.genre_en || publicBook.genre || '',
          es: book.genre_es || book.genre_en || publicBook.genre || '',
        },
        prices: {
          en: basePrice,
          fr: book.price_fr || (comingSoon ? 'À venir' : basePrice),
          es: book.price_es || (comingSoon ? 'Próximamente' : basePrice),
        },
        releases: {
          en: book.release_en || publicBook.release || '',
          fr: book.release_fr || book.release_en || publicBook.release || '',
          es: book.release_es || book.release_en || publicBook.release || '',
        },
        volumeLabels: {
          en: book.vol_en || publicBook.vol || '',
          fr: book.vol_fr || book.vol_en || publicBook.vol || '',
          es: book.vol_es || book.vol_en || publicBook.vol || '',
        },
        seriesNames: {
          en: catalog.SERIES?.[book.seriesKey]?.name_en || catalog.SERIES?.[book.seriesKey]?.name || publicBook.series || '',
          fr: catalog.SERIES?.[book.seriesKey]?.name_fr || catalog.SERIES?.[book.seriesKey]?.name_en || publicBook.series || '',
          es: catalog.SERIES?.[book.seriesKey]?.name_es || catalog.SERIES?.[book.seriesKey]?.name_en || publicBook.series || '',
        },
        subtitle: publicBook.subtitle,
        lang: publicBook.lang,
        pages: publicBook.pages,
        series: publicBook.series,
        seriesKey: publicBook.seriesKey,
        vol: publicBook.vol,
        available: publicBook.available,
        hidden: publicBook.hidden,
        price: publicBook.price,
        release: publicBook.release,
        image: publicBook.image,
        images: {
          en: book.image_en || publicBook.image || '',
          fr: book.image_fr || book.image_en || publicBook.image || '',
          es: book.image_es || book.image_en || publicBook.image || '',
        },
        synopsis: publicBook.synopsis,
        synopsis_en: publicBook.synopsis_en,
        synopsis_fr: publicBook.synopsis_fr,
        synopsis_es: publicBook.synopsis_es,
        links: publicBook.links,
        details: publicBook.details,
        publishingCategory: categories.find(item => item.id === publishingCategoryId)?.label || '',
        publishingSubcategory: subcategories.find(item => item.id === publishingSubcategoryId)?.label || '',
        subjects: editoriallyPublished ? (subjectRelations.length
          ? subjectRelations.map(relation => relation.subjectId)
          : book.subjectIds || []).map(id => catalog.PUBLISHING_SUBJECTS?.[id]?.label).filter(Boolean) : [],
        targetAudience: editoriallyPublished ? catalog.PUBLISHING_AUDIENCES?.[book.targetAudienceId]?.label || '' : '',
        contentType: editoriallyPublished ? catalog.PUBLISHING_CONTENT_TYPES?.[book.contentTypeId]?.label || '' : '',
        ageRangeMin: editoriallyPublished ? book.ageRangeMin ?? null : null,
        ageRangeMax: editoriallyPublished ? book.ageRangeMax ?? null : null,
        authors: editoriallyPublished ? [...(contributorRelations.length ? contributorRelations : book.contributors || [])]
          .filter(contributor => catalog.AUTHORS?.[contributor.authorId]?.active !== false)
          .sort((left, right) => Number(left.displayOrder || 0) - Number(right.displayOrder || 0))
          .map(contributor => catalog.AUTHORS?.[contributor.authorId]?.name).filter(Boolean) : [],
        editionLanguages: editoriallyPublished ? editionLanguageIds.map(id => catalog.PUBLISHING_LANGUAGES?.[id]?.label).filter(Boolean) : [],
        formats: editoriallyPublished ? formatIds.map(id => catalog.PUBLISHING_FORMATS?.[id]?.label).filter(Boolean) : [],
        genres: (genreRelations.length ? genreRelations.map(relation => relation.genreId) : book.genreIds || [])
          .map(id => catalog.PUBLISHING_GENRES?.[id]?.label).filter(Boolean),
      }];
    }));
    const publicSeries = Object.fromEntries(Object.entries(catalog.SERIES || {})
      .filter(([, series]) => !series.hidden)
      .map(([key, series]) => {
        const volumes = (series.volumes || []).filter(bookKey =>
          catalog.BOOKS?.[bookKey] && !catalog.BOOKS[bookKey].hidden && !hiddenSeriesBooks.has(bookKey),
        );
        const available = volumes.filter(bookKey => catalog.BOOKS[bookKey].available).length;
        const stats = Array.isArray(series.stats) ? series.stats.map((stat, index) => ({
          ...stat,
          n: String(index === 0 ? volumes.length : index === 1 ? available : index === 2 ? volumes.length - available : stat?.n ?? ''),
        })) : [];
        return [key, {
          ...series,
          covers: {
            en: series.cover_en || '',
            fr: series.cover_fr || series.cover_en || '',
            es: series.cover_es || series.cover_en || '',
          },
          volumes,
          totalVols: volumes.length,
          stats,
        }];
      }));
    return res.status(200).json({
      BOOKS,
      SERIES: publicSeries,
      BUNDLES:    catalog.BUNDLES   || [],
      PLATFORMS:  catalog.PLATFORMS || {},
      PUBLISHING_TAXONOMY: activeCategories.map(category => ({
        label: category.label,
        subcategories: subcategories.filter(item => item.parentId === category.id && item.active).map(item => item.label),
      })),
      siteLocked: locked,
      config: {
        socialLinks: config.socialLinks || {},
        footerTagline: config.footerTagline || {},
        headerTagline: config.headerTagline || {},
        content: normalizeSiteContent(config.content),
      },
    });
  } catch (e) { return res.status(500).json({ error: e.message }); }
}

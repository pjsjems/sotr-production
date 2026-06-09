// lib/queries.js
// All GROQ queries for FreeText ("Texte du mois") and Atlas series.
// Sanity client is only active when NEXT_PUBLIC_SANITY_PROJECT_ID is set.

import { createClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '';
const DATASET    = process.env.NEXT_PUBLIC_SANITY_DATASET    || 'production';

export const sanityClient = createClient({
  projectId:  PROJECT_ID || 'placeholder',
  dataset:    DATASET,
  apiVersion: '2024-01-01',
  useCdn:     process.env.NODE_ENV === 'production',
});

const builder = imageUrlBuilder(sanityClient);
export const urlFor = (source) => builder.image(source);

export const isSanityConfigured = () => !!PROJECT_ID;

// ── Free Text queries ──────────────────────────────────────────────────────

export const ALL_FREE_TEXTS_QUERY = `
  *[_type == "freeText"] | order(is_featured desc, createdAt desc) {
    _id, slug, author, is_featured, sectionLabel, createdAt, coverImage,
    title_fr, subtitle_fr, synopsis_fr,
    title_en, subtitle_en, synopsis_en,
    title_es, subtitle_es, synopsis_es,
  }
`;

export const FREE_TEXT_BY_SLUG_QUERY = `
  *[_type == "freeText" && slug.current == $slug][0] {
    _id, slug, author, is_featured, sectionLabel, createdAt, coverImage,
    title_fr, subtitle_fr, synopsis_fr, preview_fr, full_fr,
    title_en, subtitle_en, synopsis_en, preview_en, full_en,
    title_es, subtitle_es, synopsis_es, preview_es, full_es,
    seo_title_fr, seo_desc_fr, seo_title_en, seo_desc_en, seo_title_es, seo_desc_es,
  }
`;

export const FEATURED_FREE_TEXT_QUERY = `
  *[_type == "freeText" && is_featured == true][0] {
    _id, slug, author, coverImage,
    title_fr, subtitle_fr, synopsis_fr,
    title_en, subtitle_en, synopsis_en,
    title_es, subtitle_es, synopsis_es,
  }
`;

export const FREE_TEXT_SLUGS_QUERY = `
  *[_type == "freeText"] { "slug": slug.current }
`;

// ── Atlas series query ─────────────────────────────────────────────────────

export const ATLAS_SERIES_QUERY = `
  *[_type == "atlasSeries"][0] {
    _id, seriesId, author, languages, totalPoems,
    seriesTitle_en, seriesTitle_fr, seriesTitle_es,
    seriesTagline_en, seriesTagline_fr, seriesTagline_es,
    seriesOverview_en, seriesOverview_fr, seriesOverview_es,
    genre_en, genre_fr, genre_es,
    tome1_subtitle_en, tome1_subtitle_fr, tome1_subtitle_es,
    tome1_synopsis_en, tome1_synopsis_fr, tome1_synopsis_es,
    tome1_poemCount, tome1_cover_en, tome1_cover_fr,
    tome1_isbn_en_print, tome1_isbn_fr_print, tome1_isbn_ebook,
    tome1_price, tome1_isAvailable,
    tome1_link_amazon, tome1_link_bookbaby, tome1_link_etsy,
    tome2_subtitle_en, tome2_subtitle_fr, tome2_subtitle_es,
    tome2_synopsis_en, tome2_synopsis_fr, tome2_synopsis_es,
    tome2_poemCount, tome2_cover_en, tome2_cover_fr,
    tome2_isbn_en_print, tome2_isbn_fr_print, tome2_isbn_ebook,
    tome2_price, tome2_isAvailable,
    tome2_link_amazon, tome2_link_bookbaby, tome2_link_etsy,
    bundle_link, bundle_price,
    seo_title_en, seo_desc_en, seo_title_fr, seo_desc_fr, seo_og_image,
  }
`;

// ── Language helpers ───────────────────────────────────────────────────────

export function pickLang(doc, lang = 'fr') {
  const l = ['fr', 'en', 'es'].includes(lang) ? lang : 'fr';
  return {
    title:    doc[`title_${l}`]    || doc.title_fr    || '',
    subtitle: doc[`subtitle_${l}`] || '',
    synopsis: doc[`synopsis_${l}`] || doc.synopsis_fr || '',
    preview:  doc[`preview_${l}`]  || doc.preview_fr  || [],
    full:     doc[`full_${l}`]     || doc.full_fr     || [],
    seoTitle: doc[`seo_title_${l}`]|| doc[`title_${l}`] || '',
    seoDesc:  doc[`seo_desc_${l}`] || doc[`synopsis_${l}`] || '',
  };
}

export function pickAtlasTome(doc, tome, lang = 'en') {
  const l   = ['en', 'fr', 'es'].includes(lang) ? lang : 'en';
  const pfx = `tome${tome}_`;
  return {
    subtitle:    doc[`${pfx}subtitle_${l}`] || '',
    synopsis:    doc[`${pfx}synopsis_${l}`] || '',
    cover:       doc[`${pfx}cover_${l}`]    || doc[`${pfx}cover_en`] || null,
    poemCount:   doc[`${pfx}poemCount`]     || 0,
    isbn_print:  l === 'fr' ? doc[`${pfx}isbn_fr_print`] : doc[`${pfx}isbn_en_print`],
    isbn_ebook:  doc[`${pfx}isbn_ebook`],
    price:       doc[`${pfx}price`],
    isAvailable: doc[`${pfx}isAvailable`],
    links: {
      amazon:   doc[`${pfx}link_amazon`]   || null,
      bookbaby: doc[`${pfx}link_bookbaby`] || null,
      etsy:     doc[`${pfx}link_etsy`]     || null,
    },
  };
}

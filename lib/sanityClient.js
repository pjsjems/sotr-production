// lib/sanityClient.js
// Sanity CMS client. Only active when NEXT_PUBLIC_SANITY_PROJECT_ID is set.
// Without it, the site uses data/catalog.json as before.

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset   = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

export const sanityEnabled = !!(projectId && projectId !== 'your-project-id');

export async function sanityFetch(query) {
  if (!sanityEnabled) return null;
  try {
    const url = `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${encodeURIComponent(query)}`;
    const r = await fetch(url, { next: { revalidate: 30 } });
    const data = await r.json();
    return data.result || null;
  } catch (e) {
    console.warn('[Sanity] Fetch failed:', e.message);
    return null;
  }
}

export async function fetchSanityBooks() {
  return sanityFetch(`*[_type == "book"]{
    "key": slug.current,
    title, subtitle, genre, available, hidden,
    price, release, lang, pages, series, vol,
    "color": coverColor.hex,
    synopsis, synopsis_en, synopsis_fr, synopsis_es,
    "image": coverImage.asset->url,
  }`);
}

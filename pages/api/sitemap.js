// ════════════════════════════════════════════════
// Dynamic Sitemap Generator
// Accessible at: https://spyontherise.com/sitemap.xml
// Submitted to Google Search Console after launch.
// ════════════════════════════════════════════════

import { readTexts } from '../../lib/adminData';
import { getPublicTexts } from '../../lib/textSchedule';

export default async function handler(req, res) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://spyontherise.com';
  const date = new Date().toISOString().split('T')[0];

  // Only list URLs that actually resolve. The book/series catalog is a
  // single-page client-rendered experience (no /book/[key] or
  // /series/[key] routes exist — those are opened via in-page JS state,
  // not distinct URLs), and the ?page=... query params below are never
  // read by any code, so they just reload the homepage. Listing either
  // in a sitemap only sends Google's crawler into 404s or duplicate
  // content. /series/atlas is the one real dedicated series page.
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/textes', priority: '0.8', changefreq: 'weekly' },
    { url: '/textes/archive', priority: '0.6', changefreq: 'weekly' },
    { url: '/series/atlas', priority: '0.6', changefreq: 'monthly' },
  ];

  let textPages = [];
  try {
    const allTexts = await readTexts();
    const publicTexts = getPublicTexts(Array.isArray(allTexts) ? allTexts : []);
    textPages = publicTexts.map(t => ({
      url: `/textes/read/${t.id}`,
      priority: '0.6',
      changefreq: 'monthly',
    }));
  } catch { /* sitemap still serves the static pages above */ }

  const allPages = [...staticPages, ...textPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${allPages.map(page => `  <url>
    <loc>${base}${page.url}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${base}${page.url}"/>
    <xhtml:link rel="alternate" hreflang="fr" href="${base}/fr${page.url}"/>
    <xhtml:link rel="alternate" hreflang="es" href="${base}/es${page.url}"/>
  </url>`).join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(sitemap);
}

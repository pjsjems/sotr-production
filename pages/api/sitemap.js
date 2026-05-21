// ════════════════════════════════════════════════
// Dynamic Sitemap Generator
// Accessible at: https://spyontherise.com/sitemap.xml
// Submitted to Google Search Console after launch.
// ════════════════════════════════════════════════

const { BOOKS, SERIES } = require('../../data/catalog.js');

export default function handler(req, res) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://spyontherise.com';
  const date = new Date().toISOString().split('T')[0];

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/#catalog', priority: '0.9', changefreq: 'weekly' },
    { url: '/?page=series-list', priority: '0.8', changefreq: 'monthly' },
    { url: '/?page=bundles', priority: '0.7', changefreq: 'weekly' },
  ];

  const bookPages = Object.keys(BOOKS).map(key => ({
    url: `/book/${key}`,
    priority: '0.8',
    changefreq: 'monthly',
  }));

  const seriesPages = Object.keys(SERIES).map(key => ({
    url: `/series/${key}`,
    priority: '0.8',
    changefreq: 'monthly',
  }));

  const allPages = [...staticPages, ...bookPages, ...seriesPages];

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

 SPY ON THE RISE: Production Website

**spyontherise.com** | Fort Collins, Colorado | Independent Publishing House

---

## Quick Start

```bash
# 1. Install dependencies (run once)
npm install

# 2. Start local preview server
npm run dev

# 3. Open in browser
# → http://localhost:3000
```

---

## Project Structure

```
sotr-production/
├── pages/
│   ├── index.js          ← Main site (all pages as SPA)
│   ├── _app.js           ← App wrapper, language context, global CSS
│   ├── _document.js      ← HTML document, Google Fonts
│   ├── 404.js            ← Custom 404 page
│   └── api/
│       ├── newsletter.js  ← Newsletter signup endpoint
│       ├── contact.js     ← Contact form endpoint
│       └── sitemap.js     ← Dynamic XML sitemap
├── data/
│   └── catalog.js        ← ALL book data: BOOKS, SERIES, PLATFORMS, BUNDLES
├── styles/
│   └── globals.css       ← All CSS (design tokens in :root)
├── public/
│   ├── site-logic.js     ← Site JavaScript (auto-generated from v4)
│   ├── covers/           ← Book cover images (add JPGs here)
│   ├── robots.txt
│   └── site.webmanifest
├── lib/
│   └── analytics.js      ← Google Analytics 4 event helpers
├── .env.local.example    ← Environment variables template
├── next.config.js        ← Next.js configuration
├── vercel.json           ← Vercel deployment settings
└── package.json
```

---

## Updating Content

### Add or update a book
Edit `data/catalog.js` → find the book's entry by its key → update any field.

**To unlock a book** (make it visible to readers):
```js
available: false  →  available: true
```

**To update a synopsis**:
```js
synopsis: 'Your new synopsis text here.'
```

**To add a real book cover**:
1. Place the image in `public/covers/` (e.g. `mercer1.jpg`)
2. Add `image: '/covers/mercer1.jpg'` to the book's entry in `catalog.js`

### Add a bundle offer
Edit `data/catalog.js` → find the `BUNDLES` array → add a new entry:
```js
{
  id: 'your-unique-id',
  types: ['bundle'],          // types: bundle, promo, limited, bilingual, series
  badge: 'bundle',            // badge: bundle, promo, limited, new
  title: 'Bundle Name',
  subtitle: 'Short description',
  books: ['Title 1', 'Title 2', 'Title 3'],
  orig: '$49.97',
  disc: '$34.97',
  save: '30% Off. Save $15.00',
  isGold: false,              // true = gold border highlight
  timer: false,               // true = shows countdown timer
}
```

---

## Deployment to spyontherise.com

Follow **Lesson 12** of the Web Developer 101 course book (delivered separately).

Summary:
1. `npm run build`: verify no errors
2. Push to GitHub: `git add . && git commit -m "initial" && git push`
3. Connect GitHub repo to Vercel at vercel.com
4. Add custom domain `spyontherise.com` in Vercel settings
5. Update DNS records in Namecheap (values provided by Vercel)

---

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

| Variable | Purpose | Where to get it |
|----------|---------|-----------------|
| `NEXT_PUBLIC_SITE_URL` | Your domain | `https://spyontherise.com` |
| `NEXT_PUBLIC_GA_ID` | Google Analytics | analytics.google.com |
| `NEXT_PUBLIC_MAILCHIMP_URL` | Newsletter form | Mailchimp → Embedded forms |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | CMS (Phase 2) | sanity.io/manage |

---

## Technical Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 |
| Hosting | Vercel (free tier) |
| CSS | Custom (no framework) |
| Fonts | Google Fonts: Playfair Display, Source Sans 3, Source Serif 4 |
| Analytics | Google Analytics 4 |
| Newsletter | Mailchimp |
| CMS (Phase 2) | Sanity.io |
| Domain | Namecheap → spyontherise.com |

---

## Commands Reference

```bash
npm run dev       # Start development server at localhost:3000
npm run build     # Build production version (run before deploying)
npm run start     # Run production build locally
git add .         # Stage all changes
git commit -m ""  # Commit with message
git push          # Deploy to Vercel (auto-triggered)
```

---

*SPY ON THE RISE, LLC · Fort Collins, Colorado · spyontherise.com*
*Where Ideas Rise. Where Voices Ascend.*

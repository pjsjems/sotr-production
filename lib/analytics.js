// ════════════════════════════════════════════════
// Google Analytics 4: Helper
//
// SETUP:
//   1. Create GA4 property at analytics.google.com
//   2. Add your Measurement ID to .env.local:
//      NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
//   3. The tracking code in _document.js will activate automatically.
// ════════════════════════════════════════════════

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

// Log a page view
export function pageView(url) {
  if (!GA_ID || typeof window === 'undefined') return;
  window.gtag('config', GA_ID, { page_path: url });
}

// Log a custom event
export function event({ action, category, label, value }) {
  if (!GA_ID || typeof window === 'undefined') return;
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
  });
}

// ── Pre-built SOTR event trackers ─────────────────────────

// Track when a reader clicks a "Buy" button
// Call: trackRetailerClick({ bookKey: 'mercer1', platform: 'Amazon KDP', format: 'print' })
export function trackRetailerClick({ bookKey, platform, format }) {
  event({
    action: 'retailer_click',
    category: 'Purchase',
    label: `${bookKey}: ${platform}: ${format}`,
  });
}

// Track when a reader opens a book modal
export function trackBookView(bookKey) {
  event({ action: 'book_modal_open', category: 'Catalog', label: bookKey });
}

// Track newsletter signup
export function trackNewsletterSignup(lang) {
  event({ action: 'newsletter_signup', category: 'Engagement', label: lang });
}

// Track language switch
export function trackLangSwitch(lang) {
  event({ action: 'language_switch', category: 'UX', label: lang });
}

// Track search query
export function trackSearch(query) {
  event({ action: 'search', category: 'Engagement', label: query });
}

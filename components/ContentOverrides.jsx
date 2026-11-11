import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

function routeMatches(route, pathname) {
  if (route === pathname) return true;
  const pattern = route.split('/').map(segment => (
    /^\[[^/]+\]$/.test(segment) ? '[^/]+' : segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  )).join('/');
  return new RegExp(`^${pattern}$`).test(pathname);
}

function applyField(field, language) {
  let elements;
  try {
    elements = document.querySelectorAll(field.selector);
  } catch (error) {
    console.error(`[content] Invalid selector "${field.selector}":`, error.message);
    return;
  }

  elements.forEach(target => {
    const localized = ['en', 'fr', 'es'].flatMap(lang => {
      const matches = [];
      if (target.matches(`.${lang}`)) matches.push(target);
      matches.push(...target.querySelectorAll(`.${lang}`));
      return matches.map(element => [element, lang]);
    });

    const targets = localized.length ? localized : [[target, language]];
    targets.forEach(([element, lang]) => {
      const text = field[lang];
      if (typeof text !== 'string' || !text) return;
      const next = field.icon ? `${field.icon} ${text}` : text;
      if (element.textContent !== next) element.textContent = next;
    });
  });
}

export default function ContentOverrides() {
  const router = useRouter();
  const [content, setContent] = useState(null);

  useEffect(() => {
    let active = true;
    fetch('/api/content')
      .then(async response => {
        if (!response.ok) throw new Error(`Content request failed (${response.status})`);
        return response.json();
      })
      .then(data => { if (active) setContent(data.content); })
      .catch(error => console.error('[content] Failed to load public content:', error.message));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!content || router.pathname.startsWith('/admin')) return undefined;
    const page = (content.pages || []).find(item => routeMatches(item.route || '/', router.pathname));
    if (!page) return undefined;

    const apply = () => {
      const language = document.body.getAttribute('data-lang') || 'en';
      (page.fields || []).forEach(field => {
        if (field.selector) applyField(field, language);
      });
    };

    apply();
    const contentObserver = new MutationObserver(apply);
    contentObserver.observe(document.body, { childList: true, subtree: true });
    const languageObserver = new MutationObserver(apply);
    languageObserver.observe(document.body, { attributes: true, attributeFilter: ['data-lang'] });

    return () => {
      contentObserver.disconnect();
      languageObserver.disconnect();
    };
  }, [content, router.pathname]);

  return null;
}

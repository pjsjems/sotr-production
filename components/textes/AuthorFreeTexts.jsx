// components/textes/AuthorFreeTexts.jsx
// "Textes gratuits" section for the author page.

import Link from 'next/link';
import { urlFor } from '../../lib/queries';

const UI = {
  fr: { sectionTitle:'Textes gratuits', badge:'Gratuit', cta:"Lire l'extrait", empty:"Cet auteur n'a pas encore publié de textes gratuits.", seeAll:'Voir tous les textes gratuits →' },
  en: { sectionTitle:'Free Texts', badge:'Free', cta:'Read the excerpt', empty:'This author has not published any free texts yet.', seeAll:'See all free texts →' },
  es: { sectionTitle:'Textos gratuitos', badge:'Gratis', cta:'Leer el extracto', empty:'Este autor aún no ha publicado textos gratuitos.', seeAll:'Ver todos los textos gratuitos →' },
};

export default function AuthorFreeTexts({ texts = [], lang = 'fr' }) {
  const ui = UI[lang] || UI.fr;
  return (
    <section className="author-free-texts" aria-label={ui.sectionTitle}>
      <div className="author-free-texts__header">
        <h2 className="author-free-texts__title">{ui.sectionTitle}</h2>
        {texts.length > 0 && (
          <Link href={`/textes?lang=${lang}`} className="author-free-texts__see-all">{ui.seeAll}</Link>
        )}
      </div>
      {texts.length === 0 ? (
        <p className="author-free-texts__empty">{ui.empty}</p>
      ) : (
        <div className="author-free-texts__grid">
          {texts.map((doc) => {
            const title    = doc[`title_${lang}`]    || doc.title_fr || '';
            const synopsis = doc[`synopsis_${lang}`] || doc.synopsis_fr || '';
            const coverSrc = doc.coverImage ? urlFor(doc.coverImage).width(360).height(200).fit('crop').url() : null;
            return (
              <article key={doc._id} className="author-text-card">
                {coverSrc && <div className="author-text-card__cover"><img src={coverSrc} alt={title} loading="lazy" /></div>}
                <div className="author-text-card__body">
                  <span className="author-text-card__badge">{ui.badge}</span>
                  {doc.is_featured && <span className="author-text-card__star" aria-label="Texte du mois">★</span>}
                  <h3 className="author-text-card__title">{title}</h3>
                  <p className="author-text-card__synopsis">{synopsis}</p>
                  <Link href={`/textes/${doc.slug.current}?lang=${lang}`} className="author-text-card__cta">{ui.cta}</Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

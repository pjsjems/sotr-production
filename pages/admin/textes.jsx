// pages/admin/textes.jsx — Free Texts management in admin dashboard
// Route: /admin/textes

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { sanityClient, ALL_FREE_TEXTS_QUERY, isSanityConfigured } from '../../lib/queries';
import { validateSession, parseCookies } from '../../lib/adminAuth';

const SANITY_STUDIO_URL = process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || 'https://spyontherise.sanity.studio';

function TextRow({ doc, onToggleFeatured }) {
  const title   = doc.title_fr || doc.title_en || '—';
  const langs   = ['fr','en','es'].filter(l => !!(doc[`title_${l}`]));
  const date    = doc.createdAt
    ? new Date(doc.createdAt).toLocaleDateString('fr-FR', { year:'numeric', month:'short', day:'numeric' })
    : '—';
  const editUrl = `${SANITY_STUDIO_URL}/structure/freeText;${doc._id}`;

  return (
    <tr className={`admin-text-row${doc.is_featured ? ' admin-text-row--featured' : ''}`}>
      <td className="admin-td">
        <span className="admin-text-title">{title}</span>
        {doc.is_featured && <span className="admin-badge admin-badge--gold">★ Featured</span>}
      </td>
      <td className="admin-td">
        {langs.map(l => <span key={l} className={`admin-lang-pill admin-lang-pill--${l}`}>{l.toUpperCase()}</span>)}
      </td>
      <td className="admin-td admin-td--author">{doc.author}</td>
      <td className="admin-td admin-td--date">{date}</td>
      <td className="admin-td admin-td--actions">
        <a href={editUrl} target="_blank" rel="noopener noreferrer" className="admin-action-btn admin-action-btn--edit">Edit in Sanity ↗</a>
        <button type="button"
          className={`admin-action-btn ${doc.is_featured ? 'admin-action-btn--unfeature' : 'admin-action-btn--feature'}`}
          onClick={() => onToggleFeatured(doc._id, !doc.is_featured)}>
          {doc.is_featured ? 'Unfeature' : '★ Feature'}
        </button>
      </td>
    </tr>
  );
}

export default function AdminTextesPage({ texts: initialTexts }) {
  const router = useRouter();
  const [texts,  setTexts]  = useState(initialTexts || []);
  const [status, setStatus] = useState('');

  const addNewUrl = `${SANITY_STUDIO_URL}/structure/freeText`;

  const handleToggleFeatured = async (id, newValue) => {
    setStatus('Updating…');
    try {
      const res = await fetch('/api/admin/toggle-featured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_featured: newValue }),
      });
      if (!res.ok) throw new Error('Failed');
      setTexts(prev => prev.map(t => ({
        ...t,
        is_featured: newValue ? t._id === id : (t._id === id ? false : t.is_featured),
      })));
      setStatus(newValue ? '⭐ Featured updated.' : 'Unfeatured.');
      setTimeout(() => setStatus(''), 3000);
    } catch {
      setStatus('Error — try again.');
    }
  };

  return (
    <div className="admin-textes">
      <div className="admin-textes__header">
        <div>
          <h1 className="admin-textes__title">Textes du mois</h1>
          <p className="admin-textes__sub">{texts.length} text{texts.length !== 1 ? 's' : ''} published</p>
        </div>
        <a href={addNewUrl} target="_blank" rel="noopener noreferrer" className="admin-action-btn admin-action-btn--new">
          + New Text in Sanity
        </a>
      </div>
      {!isSanityConfigured() && (
        <div style={{ background:'#fef9e7', border:'1px solid #f0c040', borderRadius:6, padding:'1rem', marginBottom:'1rem', fontSize:13 }}>
          Sanity is not configured. Set <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> in .env.local to enable content management.
        </div>
      )}
      {status && <p className="admin-textes__status">{status}</p>}
      {texts.length === 0 ? (
        <div className="admin-textes__empty"><p>No texts yet. Click &ldquo;New Text in Sanity&rdquo; to publish the first one.</p></div>
      ) : (
        <div className="admin-textes__table-wrap">
          <table className="admin-table">
            <thead><tr>
              <th className="admin-th">Title (FR)</th>
              <th className="admin-th">Languages</th>
              <th className="admin-th">Author</th>
              <th className="admin-th">Published</th>
              <th className="admin-th">Actions</th>
            </tr></thead>
            <tbody>{texts.map(doc => <TextRow key={doc._id} doc={doc} onToggleFeatured={handleToggleFeatured} />)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps({ req }) {
  const session = validateSession(parseCookies(req)['sotr-admin-session']);
  if (!session) return { redirect: { destination: '/admin', permanent: false } };
  if (!isSanityConfigured()) return { props: { texts: [] } };
  try {
    const texts = await sanityClient.fetch(ALL_FREE_TEXTS_QUERY);
    return { props: { texts: texts || [] } };
  } catch { return { props: { texts: [] } }; }
}

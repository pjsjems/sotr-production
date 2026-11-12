import { useState } from 'react';

function fieldStyle() {
  return { width: '100%', minHeight: 36, padding: '.45rem .6rem', border: '1px solid var(--border2)', borderRadius: 'var(--r2)', background: 'var(--surface2)', color: 'var(--tx)' };
}

function Field({ label, children }) {
  return <div className="field-row"><label className="field-label">{label}</label>{children}</div>;
}

function selected(item, values) {
  return values.includes(item);
}

export function PublishingFields({ form, setForm, publishing = {}, series = [] }) {
  const categories = (publishing.categories || []).filter(item => item.active || item.id === form.publishingCategoryId);
  const subcategories = (publishing.subcategories || []).filter(item =>
    item.parentId === form.publishingCategoryId && (item.active || item.id === form.publishingSubcategoryId),
  );
  const genres = (publishing.genres || []).filter(item => item.active || (form.genreIds || []).includes(item.id));
  const subjects = (publishing.subjects || []).filter(item => item.active || (form.subjectIds || []).includes(item.id));
  const collections = (publishing.collections || []).filter(item => item.status === 'active' || (form.collectionIds || []).includes(item.id));
  const authors = (publishing.authors || []).filter(item => item.active !== false || (form.contributors || []).some(value => value.authorId === item.id));
  const publishers = (publishing.publishers || []).filter(item => item.active !== false || item.id === form.publisherId);
  const activeSeries = series || [];
  const editions = form.editions || [];
  const updateEdition = (index, update) => setForm(current => ({
    ...current,
    editions: current.editions.map((edition, i) => i === index ? { ...edition, ...update } : edition),
  }));
  const updateListing = (editionIndex, listingIndex, update) => setForm(current => ({
    ...current,
    editions: current.editions.map((edition, i) => i !== editionIndex ? edition : ({
      ...edition,
      listings: (edition.listings || []).map((listing, j) => j === listingIndex ? { ...listing, ...update } : listing),
    })),
  }));
  const toggleValue = (field, id, checked) => setForm(current => {
    const values = current[field] || [];
    const next = checked ? [...new Set([...values, id])] : values.filter(value => value !== id);
    const primaryField = field === 'genreIds' ? 'primaryGenreId' : 'primarySubjectId';
    const nextPrimary = checked ? (current[primaryField] || id) : current[primaryField] === id ? (next[0] || '') : current[primaryField];
    const update = { [field]: next, [primaryField]: nextPrimary };
    if (field === 'genreIds') {
      update.genre = genres.find(genre => genre.id === nextPrimary)?.label || '';
    }
    return { ...current, ...update };
  });
  const seriesMemberships = form.seriesMemberships || [];
  const toggleSeries = (seriesKey, checked) => setForm(current => {
    const currentMemberships = current.seriesMemberships || [];
    const next = checked
      ? [...currentMemberships, { seriesKey, volumeNumber: null, volumeLabel: '', readingOrder: null, publicationOrder: null }]
      : currentMemberships.filter(item => item.seriesKey !== seriesKey);
    const primary = next[0];
    const primarySeries = activeSeries.find(item => item.key === primary?.seriesKey);
    return {
      ...current,
      seriesMemberships: next,
      seriesKey: primary?.seriesKey || null,
      series: primarySeries?.name || 'Standalone',
      vol: primary?.volumeLabel || '',
    };
  });
  const toggleContributor = (authorId, checked) => setForm(current => {
    const contributors = current.contributors || [];
    return {
      ...current,
      contributors: checked
        ? [...contributors, { authorId, role: 'author', displayOrder: contributors.length }]
        : contributors.filter(item => item.authorId !== authorId),
    };
  });

  return (
    <div style={{ borderTop: '1px solid var(--border2)', marginTop: '1.25rem', paddingTop: '1rem' }}>
      <h3 style={{ margin: '0 0 .75rem', color: 'var(--tx)' }}>Publishing record</h3>
      <div className="field-hint" style={{ marginBottom: '.75rem' }}>
        Publishing categories, genres, subjects, audience, editions and distribution are stored as separate related records.
      </div>
      {form.sotrBookId && <Field label="SOTR Book ID"><input className="field-input" style={fieldStyle()} value={form.sotrBookId} readOnly /></Field>}
      <Field label="Publisher">
        <select className="field-input field-select" style={fieldStyle()} value={form.publisherId || ''} onChange={event => setForm(current => ({ ...current, publisherId: event.target.value }))}>
          <option value="">Not specified</option>
          {publishers.map(item => <option key={item.id} value={item.id} disabled={!item.active}>{item.name}{item.active ? '' : ' (inactive)'}</option>)}
        </select>
      </Field>
      <div className="two-col">
        <Field label="Publishing category">
          <select className="field-input field-select" style={fieldStyle()} value={form.publishingCategoryId || ''} onChange={event => {
            const publishingCategoryId = event.target.value;
            const childStillValid = (publishing.subcategories || []).some(item =>
              item.id === form.publishingSubcategoryId && item.parentId === publishingCategoryId,
            );
            setForm(current => ({ ...current, publishingCategoryId, publishingSubcategoryId: childStillValid ? current.publishingSubcategoryId : '' }));
          }}>
            <option value="">Select category…</option>
            {categories.map(item => <option key={item.id} value={item.id} disabled={!item.active}>{item.label}{item.active ? '' : ' (inactive)'}</option>)}
          </select>
        </Field>
        <Field label="Publishing subcategory">
          <select className="field-input field-select" style={fieldStyle()} value={form.publishingSubcategoryId || ''} disabled={!form.publishingCategoryId}
            onChange={event => setForm(current => ({ ...current, publishingSubcategoryId: event.target.value }))}>
            <option value="">{form.publishingCategoryId ? 'Select subcategory…' : 'Select a publishing category first'}</option>
            {subcategories.map(item => <option key={item.id} value={item.id} disabled={!item.active}>{item.label}{item.active ? '' : ' (inactive)'}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Authors & contributors">
        {authors.length ? authors.map(author => {
          const contributor = (form.contributors || []).find(item => item.authorId === author.id);
          return <div key={author.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginRight: 12, marginBottom: 6, fontSize: 12 }}>
            <label><input type="checkbox" checked={!!contributor} onChange={event => toggleContributor(author.id, event.target.checked)} />{' '}{author.name}</label>
            {contributor && <select aria-label={`${author.name} role`} value={contributor.role || 'author'} onChange={event => setForm(current => ({
              ...current,
              contributors: current.contributors.map(item => item.authorId === author.id ? { ...item, role: event.target.value } : item),
            }))}>
              {['author', 'co-author', 'editor', 'illustrator', 'translator', 'foreword-author', 'preface-author', 'other'].map(role => <option key={role} value={role}>{role}</option>)}
            </select>}
          </div>;
        }) : <div className="field-hint">No author profiles yet. Add them in Publishing.</div>}
      </Field>
      <div className="two-col">
        <Field label="Content type">
          <select className="field-input field-select" style={fieldStyle()} value={form.contentTypeId || ''} onChange={event => setForm(current => ({ ...current, contentTypeId: event.target.value }))}>
            <option value="">Not specified</option>
            {(publishing.contentTypes || []).filter(item => item.active).map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </Field>
        <Field label="Target audience">
          <select className="field-input field-select" style={fieldStyle()} value={form.targetAudienceId || ''} onChange={event => setForm(current => ({ ...current, targetAudienceId: event.target.value }))}>
            <option value="">Not specified</option>
            {(publishing.audiences || []).filter(item => item.active).map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </Field>
      </div>
      <div className="two-col">
        <Field label="Publication workflow status">
          <select className="field-input field-select" style={fieldStyle()} value={form.publicationStatus || ''} onChange={event => setForm(current => ({ ...current, publicationStatus: event.target.value }))}>
            <option value="">Not classified / review</option>
            <option value="draft">Draft</option>
            <option value="in-development">In Development</option>
            <option value="ready-for-publication">Ready for Publication</option>
            <option value="published">Published</option>
            <option value="discontinued">Discontinued</option>
          </select>
        </Field>
        <Field label="Original language">
          <select className="field-input field-select" style={fieldStyle()} value={form.originalLanguageId || ''} onChange={event => setForm(current => ({ ...current, originalLanguageId: event.target.value }))}>
            <option value="">Not specified</option>
            {(publishing.languages || []).filter(item => item.active).map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </Field>
      </div>
      <div className="two-col">
        <Field label="Age range (minimum)">
          <input type="number" min="0" className="field-input" style={fieldStyle()} value={form.ageRangeMin ?? ''} onChange={event => setForm(current => ({ ...current, ageRangeMin: event.target.value }))} />
        </Field>
        <Field label="Age range (maximum)">
          <input type="number" min="0" className="field-input" style={fieldStyle()} value={form.ageRangeMax ?? ''} onChange={event => setForm(current => ({ ...current, ageRangeMax: event.target.value }))} />
        </Field>
      </div>
      <div className="two-col">
        <Field label="Reading level">
          <select className="field-input field-select" style={fieldStyle()} value={form.readingLevelId || ''} onChange={event => setForm(current => ({ ...current, readingLevelId: event.target.value }))}>
            <option value="">Not specified</option>
            {(publishing.readingLevels || []).filter(item => item.active).map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </Field>
        <div />
      </div>
      <div className="two-col">
        <Field label="Genres (select all that apply)">
          <div style={{ maxHeight: 150, overflowY: 'auto', border: '1px solid var(--border2)', borderRadius: 'var(--r2)', padding: '.4rem .6rem' }}>
            {genres.map(item => <label key={item.id} style={{ display: 'block', fontSize: 12, padding: '.15rem 0' }}>
              <input type="checkbox" checked={selected(item.id, form.genreIds || [])} disabled={!item.active} onChange={event => toggleValue('genreIds', item.id, event.target.checked)} />{' '}{item.label}{item.active ? '' : ' (inactive)'}
            </label>)}
          </div>
        </Field>
        <Field label="Subjects (select all that apply)">
          <div style={{ maxHeight: 150, overflowY: 'auto', border: '1px solid var(--border2)', borderRadius: 'var(--r2)', padding: '.4rem .6rem' }}>
            {subjects.map(item => <label key={item.id} style={{ display: 'block', fontSize: 12, padding: '.15rem 0' }}>
              <input type="checkbox" checked={selected(item.id, form.subjectIds || [])} disabled={!item.active} onChange={event => toggleValue('subjectIds', item.id, event.target.checked)} />{' '}{item.label}{item.active ? '' : ' (inactive)'}
            </label>)}
          </div>
        </Field>
      </div>
      <div className="two-col">
        <Field label="Primary genre">
          <select className="field-input field-select" style={fieldStyle()} value={form.primaryGenreId || ''} onChange={event => setForm(current => {
            const primaryGenreId = event.target.value;
            const genreIds = primaryGenreId && !(current.genreIds || []).includes(primaryGenreId) ? [...(current.genreIds || []), primaryGenreId] : current.genreIds || [];
            return { ...current, primaryGenreId, genreIds, genre: genres.find(item => item.id === primaryGenreId)?.label || '' };
          })}>
            <option value="">None</option>
            {genres.filter(item => (form.genreIds || []).includes(item.id)).map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </Field>
        <Field label="Primary subject">
          <select className="field-input field-select" style={fieldStyle()} value={form.primarySubjectId || ''} onChange={event => setForm(current => {
            const primarySubjectId = event.target.value;
            const subjectIds = primarySubjectId && !(current.subjectIds || []).includes(primarySubjectId) ? [...(current.subjectIds || []), primarySubjectId] : current.subjectIds || [];
            return { ...current, primarySubjectId, subjectIds };
          })}>
            <option value="">None</option>
            {subjects.filter(item => (form.subjectIds || []).includes(item.id)).map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Thematic collections">
        {collections.length ? collections.map(item => <label key={item.id} style={{ display: 'inline-block', marginRight: '1rem', fontSize: 12 }}>
          <input type="checkbox" checked={selected(item.id, form.collectionIds || [])} disabled={item.status !== 'active'} onChange={event => toggleValue('collectionIds', item.id, event.target.checked)} />{' '}{item.name}{item.status !== 'active' ? ' (inactive)' : ''}
        </label>) : <div className="field-hint">No collections yet. Create one in Publishing.</div>}
      </Field>
      <Field label="Series memberships (optional)">
        {activeSeries.map(item => {
          const membership = seriesMemberships.find(value => value.seriesKey === item.key);
          return <div key={item.key} style={{ display: 'grid', gridTemplateColumns: 'minmax(150px,1fr) repeat(4,minmax(70px,.5fr))', gap: 8, alignItems: 'center', marginBottom: 6 }}>
            <label style={{ fontSize: 12 }}><input type="checkbox" checked={!!membership} onChange={event => toggleSeries(item.key, event.target.checked)} />{' '}{item.name}</label>
            {membership && ['volumeNumber', 'volumeLabel', 'readingOrder', 'publicationOrder'].map(field => <input key={field} className="field-input" style={fieldStyle()}
              aria-label={`${item.name} ${field}`} placeholder={field === 'volumeNumber' ? 'Volume #' : field === 'volumeLabel' ? 'Volume label' : field === 'readingOrder' ? 'Reading order' : 'Publication order'}
              value={membership[field] ?? ''} onChange={event => setForm(current => ({
                ...current,
                seriesMemberships: current.seriesMemberships.map(value => value.seriesKey === item.key ? { ...value, [field]: event.target.value } : value),
              }))} />)}
            {!membership && <span />}
          </div>;
        })}
      </Field>

      <div style={{ borderTop: '1px solid var(--border2)', paddingTop: '.8rem', marginTop: '.8rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.6rem' }}>
          <strong style={{ fontSize: 13 }}>Editions, formats & distribution</strong>
          <button type="button" className="btn btn-s btn-sm" onClick={() => setForm(current => ({ ...current, editions: [...(current.editions || []), { name: '', languageIds: [], formatId: '', isbn10: '', isbn13: '', asin: '', publicationDate: '', status: 'draft', pageCount: '', trimSize: '', price: '', currency: '', listings: [] }] }))}>+ Add edition</button>
        </div>
        {editions.map((edition, index) => (
          <div key={edition.id || index} style={{ border: '1px solid var(--border2)', borderRadius: 6, padding: '.75rem', marginBottom: '.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: 12 }}>Edition {index + 1}</strong>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => setForm(current => ({ ...current, editions: current.editions.filter((_, i) => i !== index) }))}>Remove</button>
            </div>
            <div className="two-col">
              <Field label="Edition name"><input className="field-input" style={fieldStyle()} value={edition.name || ''} onChange={event => updateEdition(index, { name: event.target.value })} placeholder="First Edition / French Edition" /></Field>
              <Field label="Format">
                <select className="field-input field-select" style={fieldStyle()} value={edition.formatId || ''} onChange={event => updateEdition(index, { formatId: event.target.value })}>
                  <option value="">Select format…</option>
                  {(publishing.formats || []).filter(item => item.active).map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </Field>
            </div>
            <div className="two-col">
              <Field label="Edition languages">
                <div>{(publishing.languages || []).filter(item => item.active).map(language => <label key={language.id} style={{ marginRight: 10, fontSize: 12 }}>
                  <input type="checkbox" checked={selected(language.id, edition.languageIds || [])} onChange={event => {
                    const languageIds = event.target.checked ? [...new Set([...(edition.languageIds || []), language.id])] : (edition.languageIds || []).filter(id => id !== language.id);
                    updateEdition(index, { languageIds });
                  }} />{' '}{language.label}
                </label>)}</div>
              </Field>
              <Field label="Publication date"><input type="date" className="field-input" style={fieldStyle()} value={edition.publicationDate || ''} onChange={event => updateEdition(index, { publicationDate: event.target.value })} /></Field>
            </div>
            <div className="two-col">
              <Field label="ISBN-10"><input className="field-input" style={fieldStyle()} value={edition.isbn10 || ''} onChange={event => updateEdition(index, { isbn10: event.target.value })} /></Field>
              <Field label="ISBN-13"><input className="field-input" style={fieldStyle()} value={edition.isbn13 || ''} onChange={event => updateEdition(index, { isbn13: event.target.value })} /></Field>
            </div>
            <div className="two-col">
              <Field label="ASIN (edition/listing identifier)"><input className="field-input" style={fieldStyle()} value={edition.asin || ''} onChange={event => updateEdition(index, { asin: event.target.value })} /></Field>
              <Field label="Edition status"><select className="field-input field-select" style={fieldStyle()} value={edition.status || 'draft'} onChange={event => updateEdition(index, { status: event.target.value })}>
                {['draft', 'in-development', 'published', 'discontinued'].map(value => <option key={value} value={value}>{value}</option>)}
              </select></Field>
            </div>
            <div className="two-col">
              <Field label="Page count"><input type="number" min="0" className="field-input" style={fieldStyle()} value={edition.pageCount || ''} onChange={event => updateEdition(index, { pageCount: event.target.value })} /></Field>
              <Field label="Trim size"><input className="field-input" style={fieldStyle()} value={edition.trimSize || ''} onChange={event => updateEdition(index, { trimSize: event.target.value })} /></Field>
            </div>
            <div className="two-col">
              <Field label="Price"><input className="field-input" style={fieldStyle()} value={edition.price || ''} onChange={event => updateEdition(index, { price: event.target.value })} /></Field>
              <Field label="Currency"><input className="field-input" style={fieldStyle()} value={edition.currency || ''} onChange={event => updateEdition(index, { currency: event.target.value.toUpperCase() })} placeholder="USD" /></Field>
            </div>
            <div style={{ marginTop: '.5rem', paddingTop: '.6rem', borderTop: '1px solid var(--border2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.5rem' }}>
                <strong style={{ fontSize: 12 }}>Distribution listings & KDP mapping</strong>
                <button type="button" className="btn btn-s btn-sm" onClick={() => updateEdition(index, { listings: [...(edition.listings || []), { channelName: '', marketplace: '', externalProductId: '', url: '', status: 'not-submitted', listPrice: '', currency: '', listingDate: '', lastVerifiedAt: '', notes: '', kdpMapping: null }] })}>+ Add listing</button>
              </div>
              {(edition.listings || []).map((listing, listingIndex) => (
                <div key={listing.id || listingIndex} style={{ background: 'var(--surface2)', borderRadius: 4, padding: '.6rem', marginBottom: '.5rem' }}>
                  <div className="two-col">
                    <Field label="Distribution channel"><input className="field-input" style={fieldStyle()} value={listing.channelName || ''} onChange={event => updateListing(index, listingIndex, { channelName: event.target.value, channelId: '' })} placeholder="Amazon KDP / Direct Sales" /></Field>
                    <Field label="Marketplace / territory"><input className="field-input" style={fieldStyle()} value={listing.marketplace || ''} onChange={event => updateListing(index, listingIndex, { marketplace: event.target.value })} placeholder="Amazon.com" /></Field>
                  </div>
                  <div className="two-col">
                    <Field label="External product ID"><input className="field-input" style={fieldStyle()} value={listing.externalProductId || ''} onChange={event => updateListing(index, listingIndex, { externalProductId: event.target.value })} /></Field>
                    <Field label="Listing status"><select className="field-input field-select" style={fieldStyle()} value={listing.status || 'not-submitted'} onChange={event => updateListing(index, listingIndex, { status: event.target.value })}>
                      {['not-submitted', 'in-review', 'published', 'unavailable', 'discontinued'].map(value => <option key={value} value={value}>{value}</option>)}
                    </select></Field>
                  </div>
                  <Field label="Listing URL"><input type="url" className="field-input" style={fieldStyle()} value={listing.url || ''} onChange={event => updateListing(index, listingIndex, { url: event.target.value })} /></Field>
                  <Field label="KDP category paths (only after verification in KDP)">
                    {[0, 1, 2].map(categoryIndex => <input key={categoryIndex} className="field-input" style={{ ...fieldStyle(), marginBottom: 4 }}
                      value={listing.kdpMapping?.categories?.[categoryIndex] || ''}
                      aria-label={`KDP category ${categoryIndex + 1}`} placeholder={`KDP category ${categoryIndex + 1}`}
                      onChange={event => {
                        const categories = [...(listing.kdpMapping?.categories || ['', '', ''])];
                        categories[categoryIndex] = event.target.value;
                        updateListing(index, listingIndex, { kdpMapping: { ...(listing.kdpMapping || {}), categories, marketplace: listing.marketplace || '' } });
                      }} />)}
                    <input type="date" className="field-input" style={fieldStyle()} aria-label="KDP categories last verified"
                      value={listing.kdpMapping?.lastVerifiedAt || ''} onChange={event => updateListing(index, listingIndex, {
                        kdpMapping: { ...(listing.kdpMapping || {}), categories: listing.kdpMapping?.categories || [], marketplace: listing.marketplace || '', lastVerifiedAt: event.target.value },
                      })} />
                  </Field>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => updateEdition(index, { listings: edition.listings.filter((_, i) => i !== listingIndex) })}>Remove listing</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PublishingAdmin({ data, toast, loadCatalog }) {
  const [collectionName, setCollectionName] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [publisherName, setPublisherName] = useState('');
  const [busy, setBusy] = useState(false);
  const publishing = data?.publishing || {};

  async function runAction(action, payload = {}) {
    setBusy(true);
    try {
      const response = await fetch('/api/admin/publishing-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Publishing data action failed.');
      toast(action === 'migrate' ? 'Publishing catalogue migration completed.' : 'Collection created.', 'success');
      setCollectionName('');
      setCollectionDescription('');
      await loadCatalog();
    } catch (error) {
      toast(error.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function createAuthor() {
    setBusy(true);
    try {
      const response = await fetch('/api/admin/publishing-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-author', author: { name: authorName } }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Author creation failed.');
      setAuthorName('');
      toast('Author profile created.', 'success');
      await loadCatalog();
    } catch (error) {
      toast(error.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function createPublisher() {
    setBusy(true);
    try {
      const response = await fetch('/api/admin/publishing-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-publisher', publisher: { name: publisherName } }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Publisher creation failed.');
      setPublisherName('');
      toast('Publisher created.', 'success');
      await loadCatalog();
    } catch (error) {
      toast(error.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="panel" style={{ marginBottom: '1rem' }}>
        <div className="panel-head"><span className="panel-title">Publishing catalogue schema</span></div>
        <div className="panel-body">
          <p style={{ color: 'var(--tx2)', fontSize: 13, lineHeight: 1.7 }}>
            Schema version {publishing.schemaVersion || 0}. The migration adds normalized publishing classifications and relationships while retaining the legacy catalogue fields.
          </p>
          {publishing.schemaVersion < 1 ? (
            <button className="btn btn-p" disabled={busy} onClick={() => {
              if (confirm('Create a backup and migrate the catalogue? Existing book records and purchase links will be preserved.')) runAction('migrate');
            }}>{busy ? 'Migrating…' : 'Back up and migrate catalogue'}</button>
          ) : <>
            <div className="field-hint">
              Migration report: {publishing.migrationReport?.booksPreserved ?? data?.books?.length ?? 0} books preserved;
              {' '}{publishing.migrationReport?.booksMigrated || 0} migrated;
              {' '}{publishing.migrationReport?.booksUpdated || 0} updated;
              {' '}{publishing.migrationReport?.booksSkipped || 0} skipped;
              {' '}{publishing.migrationReport?.seriesMembershipsCreated || 0} series links;
              {' '}{publishing.migrationReport?.publishersCreated || 0} publishers;
              {' '}{publishing.migrationReport?.editionsCreated || 0} editions;
              {' '}{publishing.migrationReport?.listingsCreated || 0} listings;
              {' '}{publishing.migrationReport?.flaggedBooks?.length || 0} classification flags.
            </div>
            {(publishing.migrationReport?.flaggedBooks || []).map((item, index) => <div key={`${item.key}-${index}`} style={{ fontSize: 12, marginTop: 4, color: 'var(--crb)' }}>
              {item.key}: “{item.value}” — {item.reason}
            </div>)}
          </>}
        </div>
      </div>
      {publishing.schemaVersion >= 1 && <>
        <div className="panel" style={{ marginBottom: '1rem' }}>
          <div className="panel-head"><span className="panel-title">Publishing taxonomy</span></div>
          <div className="panel-body">
            <div className="field-hint" style={{ marginBottom: '.75rem' }}>Eight parent categories, with dependent subcategories. Genre and subject remain separate dimensions.</div>
            {(publishing.categories || []).map(category => <div key={category.id} style={{ padding: '.4rem 0', borderBottom: '1px solid var(--border2)' }}>
              <strong>{category.label}</strong>
              <div style={{ color: 'var(--tx2)', fontSize: 12, marginTop: 3 }}>
                {(publishing.subcategories || []).filter(item => item.parentId === category.id).map(item => item.label).join(' · ')}
              </div>
            </div>)}
          </div>
        </div>
        <div className="panel">
          <div className="panel-head"><span className="panel-title">Thematic collections</span></div>
          <div className="panel-body">
            <div className="two-col">
              <div className="field-row"><label className="field-label">Collection name</label><input className="field-input" value={collectionName} onChange={event => setCollectionName(event.target.value)} /></div>
              <div className="field-row"><label className="field-label">Description</label><input className="field-input" value={collectionDescription} onChange={event => setCollectionDescription(event.target.value)} /></div>
            </div>
            <button className="btn btn-p btn-sm" disabled={busy || !collectionName.trim()} onClick={() => runAction('create-collection', { collection: { name: collectionName, description: collectionDescription } })}>Create collection</button>
            <div style={{ marginTop: '.8rem' }}>{(publishing.collections || []).map(collection => <div key={collection.id} style={{ fontSize: 12, padding: '.25rem 0' }}>{collection.name}{collection.description ? ` — ${collection.description}` : ''}</div>)}</div>
          </div>
        </div>
        <div className="panel" style={{ marginTop: '1rem' }}>
          <div className="panel-head"><span className="panel-title">Authors & contributors</span></div>
          <div className="panel-body">
            <div className="two-col">
              <div className="field-row"><label className="field-label">Author / contributor name</label><input className="field-input" value={authorName} onChange={event => setAuthorName(event.target.value)} /></div>
              <div style={{ display: 'flex', alignItems: 'end', paddingBottom: '.75rem' }}><button className="btn btn-p btn-sm" disabled={busy || !authorName.trim()} onClick={createAuthor}>Add profile</button></div>
            </div>
            {(publishing.authors || []).map(author => <div key={author.id} style={{ fontSize: 12, padding: '.25rem 0' }}>{author.name}</div>)}
          </div>
        </div>
        <div className="panel" style={{ marginTop: '1rem' }}>
          <div className="panel-head"><span className="panel-title">Publishers</span></div>
          <div className="panel-body">
            <div className="two-col">
              <div className="field-row"><label className="field-label">Publisher name</label><input className="field-input" value={publisherName} onChange={event => setPublisherName(event.target.value)} /></div>
              <div style={{ display: 'flex', alignItems: 'end', paddingBottom: '.75rem' }}><button className="btn btn-p btn-sm" disabled={busy || !publisherName.trim()} onClick={createPublisher}>Add publisher</button></div>
            </div>
            {(publishing.publishers || []).map(publisher => <div key={publisher.id} style={{ fontSize: 12, padding: '.25rem 0' }}>{publisher.name}</div>)}
          </div>
        </div>
      </>}
    </div>
  );
}

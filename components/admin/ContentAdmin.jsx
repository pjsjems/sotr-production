import { useEffect, useState } from 'react';

const LANGUAGES = ['en', 'fr', 'es'];
const LANGUAGE_LABELS = { en: 'English', fr: 'Français', es: 'Español' };

function createField() {
  return { id: `field-${Date.now()}`, label: '', selector: '', icon: '', en: '', fr: '', es: '' };
}

function updateAt(list, index, updates) {
  return list.map((item, i) => i === index ? { ...item, ...updates } : item);
}

export default function ContentAdmin({ content, chrome, onSave, saving }) {
  const [draft, setDraft] = useState(content);
  const [chromeDraft, setChromeDraft] = useState(chrome || { headerTagline: {}, footerTagline: {} });
  const [selectedPage, setSelectedPage] = useState(0);
  const [activeTab, setActiveTab] = useState('pages');
  const [listText, setListText] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    setDraft(content);
    setSelectedPage(index => Math.min(index, Math.max(0, (content.pages || []).length - 1)));
  }, [content]);

  useEffect(() => {
    setChromeDraft(chrome || { headerTagline: {}, footerTagline: {} });
  }, [chrome]);

  const pages = Array.isArray(draft.pages) ? draft.pages : [];
  const page = pages[selectedPage];

  function updatePage(updates) {
    setDraft(current => ({ ...current, pages: updateAt(current.pages, selectedPage, updates) }));
  }

  function addPage() {
    const next = [...pages, { id: `page-${Date.now()}`, name: 'New page', route: '/', fields: [] }];
    setDraft(current => ({ ...current, pages: next }));
    setSelectedPage(next.length - 1);
    setActiveTab('pages');
  }

  function addField() {
    if (!page) return;
    updatePage({ fields: [...(page.fields || []), createField()] });
  }

  function updateField(index, updates) {
    updatePage({ fields: updateAt(page.fields || [], index, updates) });
  }

  function removeField(index) {
    updatePage({ fields: page.fields.filter((_, i) => i !== index) });
  }

  function removePage() {
    if (!page || !window.confirm(`Remove the "${page.name}" page's content mappings?`)) return;
    const next = pages.filter((_, i) => i !== selectedPage);
    setDraft(current => ({ ...current, pages: next }));
    setSelectedPage(Math.max(0, selectedPage - 1));
  }

  function updateOptionList(key, value) {
    setDraft(current => ({ ...current, options: { ...current.options, [key]: value } }));
  }

  function readLines(key, format) {
    if (listText[key] !== undefined) return listText[key];
    const list = draft.options[key] || [];
    if (format === 'category') return list.map(row => row.join(' | ')).join('\n');
    if (format === 'localized') return list.map(row => `${row.value} | ${LANGUAGES.map(lang => row.labels?.[lang] || '').join(' | ')}`).join('\n');
    return list.join('\n');
  }

  function editList(key, value, format) {
    setListText(current => ({ ...current, [key]: value }));
    const rows = value.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    if (format === 'category') {
      updateOptionList(key, rows.map(line => {
        const [en = '', fr = '', es = ''] = line.split('|').map(part => part.trim());
        return [en, fr, es];
      }));
      return;
    }
    if (format === 'localized') {
      updateOptionList(key, rows.map(line => {
        const [optionValue = '', en = '', fr = '', es = ''] = line.split('|').map(part => part.trim());
        return { value: optionValue, labels: { en, fr, es } };
      }));
      return;
    }
    updateOptionList(key, rows);
  }

  async function save() {
    setError('');
    const routes = pages.map(item => item.route.trim());
    if (routes.some(route => !route.startsWith('/')) || new Set(routes).size !== routes.length) {
      setError('Each page needs a unique route starting with /.');
      return;
    }
    for (const contentPage of pages) {
      for (const field of contentPage.fields || []) {
        if (!field.selector.trim()) {
          setError(`Add a CSS selector for "${field.label || 'untitled field'}".`);
          return;
        }
        try {
          document.querySelectorAll(field.selector);
        } catch {
          setError(`The selector "${field.selector}" is not valid CSS.`);
          return;
        }
      }
    }
    const optionLists = draft.options || {};
    for (const key of ['seriesGenres', 'bookGenres', 'bookLanguages', 'textCategories']) {
      if (!Array.isArray(optionLists[key]) || optionLists[key].length === 0) {
        setError(`Keep at least one choice in ${key}.`);
        return;
      }
    }
    const languageValues = optionLists.bookLanguages.map(option => option.value);
    if (languageValues.some(value => !value?.trim()) || new Set(languageValues).size !== languageValues.length) {
      setError('Book language values must be present and unique.');
      return;
    }
    if (optionLists.textCategories.some(row => !Array.isArray(row) || row.length < 3 || row.some(value => !value.trim()))) {
      setError('Provide each text category in English, French, and Spanish.');
      return;
    }
    if (new Set(optionLists.bookGenres).size !== optionLists.bookGenres.length) {
      setError('Book genres must be unique.');
      return;
    }
    const statusValues = (draft.options.bookStatuses || []).map(option => option.value);
    if (statusValues.length !== 2 || !statusValues.includes('true') || !statusValues.includes('false')) {
      setError('Book status keys must remain "true" and "false"; edit their labels, not their values.');
      return;
    }
    await onSave(draft, chromeDraft);
  }

  return (
    <div>
      <div className="panel" style={{ marginBottom: '1rem' }}>
        <div className="panel-head">
          <span className="panel-title">Content controls</span>
          <button className="btn btn-p btn-sm" onClick={save} disabled={saving}>
            {saving ? <><span className="spinner" /> Saving...</> : 'Save content'}
          </button>
        </div>
        <div className="panel-body" style={{ color: 'var(--tx3)', fontSize: 13, lineHeight: 1.6 }}>
          Edit page copy by mapping a CSS selector to text in each language. Choose the element whose
          copy should be replaced (for example <code>.hero-title</code>). Its existing inline formatting
          is replaced with plain text; the value can include an emoji or other icon.
          Dropdown choices below are shared with the content-creation forms.
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: '1rem' }}>
        <button className={`tab-btn ${activeTab === 'pages' ? 'active' : ''}`} onClick={() => setActiveTab('pages')}>Page content</button>
        <button className={`tab-btn ${activeTab === 'lists' ? 'active' : ''}`} onClick={() => setActiveTab('lists')}>Dropdown lists</button>
        <button className={`tab-btn ${activeTab === 'chrome' ? 'active' : ''}`} onClick={() => setActiveTab('chrome')}>Header &amp; footer</button>
      </div>

      {error && <div className="panel" style={{ color: 'var(--redb)', marginBottom: '1rem' }}>{error}</div>}

      {activeTab === 'pages' ? (
        <div className="panel">
          <div className="panel-head" style={{ gap: 8, flexWrap: 'wrap' }}>
            <span className="panel-title" style={{ flex: 1 }}>Editable page fields</span>
            <select className="field-input field-select" value={selectedPage}
              onChange={e => setSelectedPage(Number(e.target.value))} style={{ maxWidth: 240 }}>
              {pages.map((item, index) => <option key={item.id || index} value={index}>{item.name || item.route || `Page ${index + 1}`}</option>)}
            </select>
            <button className="btn btn-s btn-sm" onClick={addPage}>+ Add page</button>
          </div>
          {page ? (
            <div className="panel-body">
              <div className="two-col">
                <div className="field-row">
                  <label className="field-label">Page name</label>
                  <input className="field-input" value={page.name || ''} onChange={e => updatePage({ name: e.target.value })} />
                </div>
                <div className="field-row">
                  <label className="field-label">Page route</label>
                  <input className="field-input" value={page.route || ''} onChange={e => updatePage({ route: e.target.value })} placeholder="/ or /textes" />
                </div>
              </div>
              {(page.fields || []).map((field, index) => (
                <div key={field.id || index} style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem' }}>
                  <div className="two-col">
                    <div className="field-row">
                      <label className="field-label">Field name</label>
                      <input className="field-input" value={field.label || ''} onChange={e => updateField(index, { label: e.target.value })} placeholder="Homepage title" />
                    </div>
                    <div className="field-row">
                      <label className="field-label">CSS selector</label>
                      <input className="field-input" value={field.selector || ''} onChange={e => updateField(index, { selector: e.target.value })} placeholder=".hero-title" />
                    </div>
                  </div>
                  <div className="field-row">
                    <label className="field-label">Icon / emoji (optional)</label>
                    <input className="field-input" value={field.icon || ''} onChange={e => updateField(index, { icon: e.target.value })} placeholder="✦" />
                  </div>
                  <div className="two-col">
                    {LANGUAGES.map(lang => (
                      <div className="field-row" key={lang}>
                        <label className="field-label">{LANGUAGE_LABELS[lang]}</label>
                        <textarea className="field-input field-textarea" value={field[lang] || ''}
                          onChange={e => updateField(index, { [lang]: e.target.value })} />
                      </div>
                    ))}
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => removeField(index)}>Remove field</button>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: '1rem' }}>
                <button className="btn btn-s" onClick={addField}>+ Add text / icon</button>
                <button className="btn btn-danger btn-sm" onClick={removePage}>Remove page</button>
              </div>
              {!page.fields?.length && <div className="field-hint">Add a field to start customizing this page.</div>}
            </div>
          ) : (
            <div className="panel-body" style={{ color: 'var(--tx3)' }}>No page content mappings yet. Add a page to get started.</div>
          )}
        </div>
      ) : activeTab === 'lists' ? (
        <div className="panel">
          <div className="panel-head"><span className="panel-title">Choices used in admin forms</span></div>
          <div className="panel-body">
            <div className="field-row">
              <label className="field-label">Series genres (one per line)</label>
              <textarea className="field-input field-textarea" value={readLines('seriesGenres')}
                onChange={e => editList('seriesGenres', e.target.value)} />
            </div>
            <div className="field-row">
              <label className="field-label">Book genres (one per line)</label>
              <textarea className="field-input field-textarea" value={readLines('bookGenres')}
                onChange={e => editList('bookGenres', e.target.value)} />
            </div>
            <div className="field-row">
              <label className="field-label">Book languages (value | English | Français | Español)</label>
              <textarea className="field-input field-textarea" value={readLines('bookLanguages', 'localized')}
                onChange={e => editList('bookLanguages', e.target.value, 'localized')} />
            </div>
            <div className="field-row">
              <label className="field-label">Book statuses (keep keys true / false; value | English | Français | Español)</label>
              <textarea className="field-input field-textarea" value={readLines('bookStatuses', 'localized')}
                onChange={e => editList('bookStatuses', e.target.value, 'localized')} />
            </div>
            <div className="field-row">
              <label className="field-label">Text categories (English | Français | Español)</label>
              <textarea className="field-input field-textarea" value={readLines('textCategories', 'category')}
                onChange={e => editList('textCategories', e.target.value, 'category')} />
            </div>
            <div className="field-hint">
              Series names remain connected to the catalog and are managed in the Series section.
            </div>
          </div>
        </div>
      ) : (
        <div className="panel">
          <div className="panel-head"><span className="panel-title">Announcement banner and footer tagline</span></div>
          <div className="panel-body">
            {LANGUAGES.map(lang => (
              <div className="two-col" key={lang}>
                <div className="field-row">
                  <label className="field-label">Announcement — {LANGUAGE_LABELS[lang]}</label>
                  <textarea className="field-input field-textarea"
                    value={chromeDraft.headerTagline?.[lang] || ''}
                    onChange={e => setChromeDraft(current => ({
                      ...current,
                      headerTagline: { ...current.headerTagline, [lang]: e.target.value },
                    }))} placeholder="Leave blank to keep the default announcement." />
                </div>
                <div className="field-row">
                  <label className="field-label">Footer tagline — {LANGUAGE_LABELS[lang]}</label>
                  <textarea className="field-input field-textarea"
                    value={chromeDraft.footerTagline?.[lang] || ''}
                    onChange={e => setChromeDraft(current => ({
                      ...current,
                      footerTagline: { ...current.footerTagline, [lang]: e.target.value },
                    }))} placeholder="Leave blank to keep the default tagline." />
                </div>
              </div>
            ))}
            <div className="two-col" style={{ marginTop: '1rem' }}>
              {Object.entries(draft.socialLabels || {}).map(([platform, label]) => (
                <div className="field-row" key={platform}>
                  <label className="field-label">Footer icon / label — {platform}</label>
                  <input className="field-input" value={label}
                    onChange={e => setDraft(current => ({
                      ...current,
                      socialLabels: { ...current.socialLabels, [platform]: e.target.value },
                    }))} />
                </div>
              ))}
            </div>
            <div className="field-hint">Blank values keep the current built-in text. Saved text is displayed as plain text.</div>
          </div>
        </div>
      )}
    </div>
  );
}

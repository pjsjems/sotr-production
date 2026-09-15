// pages/admin/texts.jsx — Texts of the Month manager
// Route: /admin/texts
//
// Three-step workflow, matching how the admin actually thinks about this:
//   1. Add a text (same rich editor as before: languages, category,
//      attachments, podcast platform links).
//   2. Schedule when it goes live (date + time), or Publish Now.
//   3. Hide/unhide at any time — independent of the schedule, so a live
//      or archived text can be pulled from public view without touching
//      its date, and restored later without re-scheduling.
//
// "Current Text of the Month" is never stored — it's computed (see
// lib/textSchedule.js) as whichever visible text has the latest
// scheduledAt. That keeps the public API and this page's status pills
// permanently in agreement.

import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ADMIN_CSS } from '../../lib/adminCss';
import { getAdminStatus } from '../../lib/textSchedule';
import { PLATFORM_LABELS as PODCAST_PLATFORM_LABELS } from '../../components/textes/PodcastModal';

const CATEGORY_PRESETS = [
  ['Geopolitics','Géopolitique','Geopolítica'],
  ['Social Issues','Enjeux sociaux','Problemas sociales'],
  ['Human Psychology','Psychologie humaine','Psicología humana'],
  ['Technology and AI','Technologie et IA','Tecnología e IA'],
  ['Philosophy and Meaning','Philosophie et sens','Filosofía y sentido'],
  ['Power and Influence','Pouvoir et influence','Poder e influencia'],
  ['Culture and Identity','Culture et identité','Cultura e identidad'],
  ['Economics and Global Trends','Économie et tendances mondiales','Economía y tendencias globales'],
  ['Modern Relationships','Relations modernes','Relaciones modernas'],
];
const CAT_IDX = { en:0, fr:1, es:2 };
const LANG_LABELS = { en:'🇬🇧 English', fr:'🇫🇷 French', es:'🇪🇸 Spanish' };
const CATEGORY_TITLE_LABEL = { en:'Category (EN)', fr:'Catégorie (FR)', es:'Categoría (ES)' };
const ATTACHMENT_LABEL = { en:'Attachment — English (PDF or Word, max 5MB)', fr:'Pièce jointe — Français (PDF ou Word, max 5MB)', es:'Adjunto — Español (PDF o Word, máx. 5MB)' };
const FIELDS = {
  en: [
    ['title_en','Title (EN)'],
    ['subtitle_en','Subtitle (EN): optional'],
    ['description_en','One-line description (EN): shown in archive'],
    ['preview_en','Preview: first ~25% of text (EN)'],
    ['full_en','Full text (EN)'],
  ],
  fr: [
    ['title_fr','Titre (FR)'],
    ['subtitle_fr','Sous-titre (FR): optionnel'],
    ['description_fr',"Description d'une ligne (FR): affichée dans l'archive"],
    ['preview_fr','Extrait: premiers ~25% du texte (FR)'],
    ['full_fr','Texte complet (FR)'],
  ],
  es: [
    ['title_es','Título (ES)'],
    ['subtitle_es','Subtítulo (ES): opcional'],
    ['description_es','Descripción de una línea (ES): mostrada en el archivo'],
    ['preview_es','Extracto: primeros ~25% del texto (ES)'],
    ['full_es','Texto completo (ES)'],
  ],
};

const STATUS_META = {
  live:      { label:'Live Now',  pill:'status-live',      icon:'⭐' },
  scheduled: { label:'Scheduled', pill:'status-scheduled',  icon:'📅' },
  draft:     { label:'Draft',     pill:'status-draft',      icon:'📝' },
  archived:  { label:'Archived',  pill:'status-archived',   icon:'📦' },
  hidden:    { label:'Hidden',    pill:'status-hidden',     icon:'🙈' },
};

// datetime-local wants "YYYY-MM-DDTHH:mm" in local time, no timezone.
function toDatetimeLocal(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function TextsScheduleManager() {
  const [auth, setAuth] = useState(null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [texts, setTexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const [editText, setEditText] = useState(null); // {} = new, object = editing, null = closed
  const [textForm, setTextForm] = useState({});
  const [textTab, setTextTab] = useState('en');
  const [textSaving, setTextSaving] = useState(false);

  const [schedulingId, setSchedulingId] = useState(null);
  const [scheduleDraft, setScheduleDraft] = useState('');
  const [busyId, setBusyId] = useState(null);

  const toast = (msg, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };

  useEffect(() => {
    fetch('/api/admin/verify')
      .then(r => r.json())
      .then(d => setAuth(d.authenticated ? true : false))
      .catch(() => setAuth(false));
  }, []);

  function loadTexts() {
    setLoading(true);
    fetch('/api/admin/texts')
      .then(r => r.json())
      .then(d => setTexts(Array.isArray(d.texts) ? d.texts : []))
      .catch(() => toast('Failed to load texts', 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { if (auth === true) loadTexts(); }, [auth]);

  async function doLogin(e) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const r = await fetch('/api/admin/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const d = await r.json();
      if (d.success) { setAuth(true); setPassword(''); }
      else setLoginError(d.error || 'Invalid password');
    } catch { setLoginError('Connection error'); }
    setLoginLoading(false);
  }

  async function doLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAuth(false);
  }

  // ── Draft autosave (same convention as the dashboard editor) ──────
  const NEW_DRAFT_KEY = 'sotr-text-draft-new';
  const isNewDraft = editText !== null && Object.keys(editText).length === 0;
  const draftKey = textForm.id ? (isNewDraft ? NEW_DRAFT_KEY : `sotr-text-draft-${textForm.id}`) : null;

  function loadDraft(key) { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch { return null; } }
  function persistDraft(key, data) { try { localStorage.setItem(key, JSON.stringify(data)); } catch {} }
  function clearDraft(key) { try { localStorage.removeItem(key); } catch {} }
  function updateTextForm(updater) {
    setTextForm(f => {
      const next = typeof updater === 'function' ? updater(f) : updater;
      persistDraft(draftKey, next);
      return next;
    });
  }

  function openNew() {
    const draft = loadDraft(NEW_DRAFT_KEY);
    if (draft && draft.id) {
      setEditText({});
      setTextForm(draft);
      toast('Restored your unsaved draft', 'warning');
      setTextTab('en');
      return;
    }
    const id = 'text-' + Date.now();
    const fresh = {
      id, title_en:'', title_fr:'', title_es:'',
      subtitle_en:'', subtitle_fr:'', subtitle_es:'',
      category_en:'', category_fr:'', category_es:'',
      description_en:'', description_fr:'', description_es:'',
      preview_en:'', preview_fr:'', preview_es:'',
      full_en:'', full_fr:'', full_es:'',
      hasAttachment_en:false, attachmentName_en:'',
      hasAttachment_fr:false, attachmentName_fr:'',
      hasAttachment_es:false, attachmentName_es:'',
      podcastPlatforms: {},
      scheduledAt: null, hidden: false, publishedAt: null,
      author:'Jems S. Pompée',
    };
    setEditText({});
    setTextForm(fresh);
    persistDraft(NEW_DRAFT_KEY, fresh);
    setTextTab('en');
  }

  function openEdit(t) {
    const key = `sotr-text-draft-${t.id}`;
    const draft = loadDraft(key);
    setEditText(t);
    if (draft) {
      setTextForm(draft);
      toast('Restored your unsaved draft for this text', 'warning');
    } else {
      const migrated = {
        ...t,
        category_en: t.category_en ?? t.category ?? '',
        category_fr: t.category_fr ?? '',
        category_es: t.category_es ?? '',
        hasAttachment_en: t.hasAttachment_en ?? t.hasAttachment ?? false,
        attachmentName_en: t.attachmentName_en ?? t.attachmentName ?? '',
        hasAttachment_fr: t.hasAttachment_fr ?? false,
        attachmentName_fr: t.attachmentName_fr ?? '',
        hasAttachment_es: t.hasAttachment_es ?? false,
        attachmentName_es: t.attachmentName_es ?? '',
        podcastPlatforms: t.podcastPlatforms || {},
        scheduledAt: t.scheduledAt ?? null,
        hidden: !!t.hidden,
      };
      setTextForm(migrated);
      persistDraft(key, migrated);
    }
    setTextTab('en');
  }

  function discardDraft() {
    clearDraft(draftKey);
    setEditText(null);
  }

  async function saveText() {
    if (!textForm.id || !textForm.title_en) { toast('Title (EN) is required', 'error'); return; }
    const payload = { ...textForm };
    ['en','fr','es'].forEach(l => {
      if (payload[`category_${l}`] === '__new__') payload[`category_${l}`] = payload[`customCategory_${l}`] || '';
      delete payload[`customCategory_${l}`];
    });
    const podcastPlatforms = {};
    Object.entries(payload.podcastPlatforms || {}).forEach(([key, url]) => {
      const trimmed = (url || '').trim();
      if (!trimmed) return;
      try {
        const parsed = new URL(trimmed);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') podcastPlatforms[key] = trimmed;
      } catch {}
    });
    payload.podcastPlatforms = podcastPlatforms;

    setTextSaving(true);
    try {
      const r = await fetch('/api/admin/texts', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ action:'save', text: payload }),
      });
      const d = await r.json();
      if (d.success) {
        toast('Text saved', 'success');
        clearDraft(draftKey);
        setEditText(null);
        loadTexts();
      } else toast(d.error || 'Save failed', 'error');
    } catch { toast('Error saving text', 'error'); }
    setTextSaving(false);
  }

  function uploadAttachment(lang, file) {
    if (!file) return;
    if (!textForm.id) { toast('Save the text first, then upload the attachment.', 'warning'); return; }
    const fd = new FormData();
    fd.append('textId', textForm.id);
    fd.append('lang', lang);
    fd.append('attachment', file);
    toast('Uploading attachment...', 'warning');
    fetch('/api/admin/upload-text', { method:'POST', body: fd })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          toast(`Uploaded: ${d.fileName}`, 'success');
          updateTextForm(f => ({ ...f, [`hasAttachment_${lang}`]: true, [`attachmentName_${lang}`]: d.fileName }));
        } else toast(d.error || 'Upload failed', 'error');
      })
      .catch(() => toast('Upload failed', 'error'));
  }

  // ── Row-level actions ──────────────────────────────────────
  async function publishNow(t) {
    if (!confirm(`Publish "${t.title_en}" live right now?`)) return;
    setBusyId(t.id);
    try {
      const r = await fetch('/api/admin/texts', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ action:'publish-now', id: t.id }),
      });
      const d = await r.json();
      if (d.success) { toast(`"${t.title_en}" is now live`, 'success'); loadTexts(); }
      else toast(d.error || 'Failed', 'error');
    } catch { toast('Failed to publish', 'error'); }
    setBusyId(null);
  }

  function startScheduling(t) {
    setSchedulingId(t.id);
    setScheduleDraft(toDatetimeLocal(t.scheduledAt || t.publishedAt) || toDatetimeLocal(new Date().toISOString()));
  }

  async function saveSchedule(t) {
    if (!scheduleDraft) { toast('Pick a date and time', 'error'); return; }
    setBusyId(t.id);
    try {
      const r = await fetch('/api/admin/texts', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ action:'schedule', id: t.id, scheduledAt: new Date(scheduleDraft).toISOString() }),
      });
      const d = await r.json();
      if (d.success) { toast('Release scheduled', 'success'); setSchedulingId(null); loadTexts(); }
      else toast(d.error || 'Failed', 'error');
    } catch { toast('Failed to schedule', 'error'); }
    setBusyId(null);
  }

  async function unschedule(t) {
    if (!confirm(`Pull "${t.title_en}" back to draft? It will no longer be public.`)) return;
    setBusyId(t.id);
    try {
      const r = await fetch('/api/admin/texts', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ action:'schedule', id: t.id, scheduledAt: null }),
      });
      const d = await r.json();
      if (d.success) { toast('Reverted to draft', 'success'); loadTexts(); }
      else toast(d.error || 'Failed', 'error');
    } catch { toast('Failed', 'error'); }
    setBusyId(null);
  }

  async function toggleHidden(t) {
    setBusyId(t.id);
    try {
      const r = await fetch('/api/admin/texts', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ action:'toggle-hidden', id: t.id }),
      });
      const d = await r.json();
      if (d.success) { toast(d.hidden ? 'Hidden from public view' : 'Unhidden — visible again', 'success'); loadTexts(); }
      else toast(d.error || 'Failed', 'error');
    } catch { toast('Failed', 'error'); }
    setBusyId(null);
  }

  async function deleteText(t) {
    if (!confirm(`Delete "${t.title_en}"? This cannot be undone.`)) return;
    setBusyId(t.id);
    try {
      const r = await fetch('/api/admin/texts', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ action:'delete', id: t.id }),
      });
      const d = await r.json();
      if (d.success) { toast('Deleted', 'success'); setTexts(prev => prev.filter(x => x.id !== t.id)); }
      else toast(d.error || 'Failed', 'error');
    } catch { toast('Failed', 'error'); }
    setBusyId(null);
  }

  // ════════════════════════════════════════════════════════
  if (auth === null) return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0D0D0D' }}>
      <div style={{ width:20, height:20, border:'2px solid #333', borderTopColor:'#C87070', borderRadius:'50%', animation:'spin .7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (auth === false) return (
    <>
      <Head><title>Admin Login: SPY ON THE RISE</title></Head>
      <style>{ADMIN_CSS}</style>
      <div className="login-page">
        <div className="login-box">
          <div className="login-brand">
            <div className="login-logo">◆</div>
            <div className="login-name">SPY ON THE RISE</div>
            <div className="login-sub">Texts of the Month</div>
          </div>
          <form onSubmit={doLogin}>
            <div className="field-row">
              <label className="field-label">Password</label>
              <input type="password" className="field-input" autoFocus
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password" />
            </div>
            {loginError && <div className="login-error">{loginError}</div>}
            <button type="submit" className="btn btn-p" style={{ width:'100%', justifyContent:'center', padding:'.65rem' }} disabled={loginLoading}>
              {loginLoading ? <span className="spinner" /> : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </>
  );

  const now = Date.now();
  const withStatus = texts.map(t => ({ t, status: getAdminStatus(t, texts, now) }));
  const groupOrder = ['live', 'scheduled', 'draft', 'archived', 'hidden'];
  const groups = groupOrder.map(status => ({
    status,
    items: withStatus.filter(x => x.status === status).map(x => x.t)
      .sort((a, b) => new Date(b.scheduledAt || b.publishedAt || 0) - new Date(a.scheduledAt || a.publishedAt || 0)),
  }));

  const lang = textTab;
  const catField = `category_${lang}`;
  const customField = `customCategory_${lang}`;
  const attField = `hasAttachment_${lang}`;
  const attNameField = `attachmentName_${lang}`;
  const catIdx = CAT_IDX[lang] ?? 0;

  function row(t) {
    const status = getAdminStatus(t, texts, now);
    const meta = STATUS_META[status];
    const busy = busyId === t.id;
    return (
      <div key={t.id} className="panel" style={{ marginBottom:'.75rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'.85rem 1rem', flexWrap:'wrap' }}>
          <span className={`status-pill ${meta.pill}`}>{meta.icon} {meta.label}</span>
          <div style={{ flex:1, minWidth:180 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'var(--tx)' }}>{t.title_en || '(untitled)'}</div>
            <div style={{ fontSize:11, color:'var(--tx3)' }}>
              {(t.category_en || t.category) && `${t.category_en || t.category} · `}
              {t.scheduledAt ? new Date(t.scheduledAt).toLocaleString() : (t.publishedAt ? `${t.publishedAt} (legacy date)` : 'no schedule set')}
            </div>
          </div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {status !== 'live' && (
              <button className="btn btn-g btn-sm" disabled={busy} onClick={() => publishNow(t)}>🚀 Publish Now</button>
            )}
            <button className="btn btn-s btn-sm" disabled={busy} onClick={() => startScheduling(t)}>📅 Schedule</button>
            {!!t.scheduledAt && (
              <button className="btn btn-s btn-sm" disabled={busy} onClick={() => unschedule(t)}>↩ Unschedule</button>
            )}
            <button className={`btn btn-sm ${t.hidden ? 'btn-g' : 'btn-warn'}`} disabled={busy} onClick={() => toggleHidden(t)}>
              {t.hidden ? '👁 Unhide' : '🙈 Hide'}
            </button>
            <button className="btn btn-s btn-sm" onClick={() => openEdit(t)}>✏️ Edit</button>
            <button className="btn btn-danger btn-sm" disabled={busy} onClick={() => deleteText(t)}>✕</button>
          </div>
        </div>
        {schedulingId === t.id && (
          <div style={{ display:'flex', gap:8, alignItems:'center', padding:'0 1rem .85rem', flexWrap:'wrap' }}>
            <input type="datetime-local" className="field-input" style={{ width:220 }}
              value={scheduleDraft} onChange={e => setScheduleDraft(e.target.value)} />
            <button className="btn btn-p btn-sm" disabled={busy} onClick={() => saveSchedule(t)}>Set Release</button>
            <button className="btn btn-s btn-sm" onClick={() => setSchedulingId(null)}>Cancel</button>
            <span className="field-hint">Goes live automatically at this date/time — no further action needed.</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <Head><title>Texts of the Month: SPY ON THE RISE</title></Head>
      <style>{ADMIN_CSS}</style>
      <div className="main" style={{ width:'100%' }}>
        <div className="topbar">
          <Link href="/admin" className="btn btn-s btn-sm">← Dashboard</Link>
          <span className="tb-title">Texts of the Month</span>
          <div className="tb-actions">
            <button className="btn btn-p" onClick={openNew}>+ New Text</button>
            <button className="btn-logout" style={{ width:'auto', padding:'.45rem .9rem' }} onClick={doLogout}>Log Out</button>
          </div>
        </div>

        <div className="content">
          <p style={{ fontSize:13, color:'var(--tx3)', marginBottom:'1.25rem' }}>
            Add a text, schedule when it goes live, then hide or unhide it at any time — independent of its schedule.{' '}
            <a href="/textes/archive" target="_blank" rel="noopener" style={{ color:'var(--crb)' }}>View public archive →</a>
          </p>

          {loading && <div className="loading-row"><span className="spinner"/> Loading texts...</div>}

          {!loading && texts.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              No texts yet. Click &quot;+ New Text&quot; to add your first Text of the Month.
            </div>
          )}

          {!loading && groups.map(({ status, items }) => items.length > 0 && (
            <div key={status} style={{ marginBottom:'2rem' }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--tx3)', marginBottom:'.6rem' }}>
                {STATUS_META[status].icon} {STATUS_META[status].label} ({items.length})
              </div>
              {items.map(row)}
            </div>
          ))}
        </div>
      </div>

      {/* Edit/Create Modal — ported from the dashboard editor, plus scheduling */}
      {editText !== null && (
        <div className="modal-ov open">
          <div className="modal-box" style={{ maxWidth:720 }}>
            <div className="modal-head">
              <span className="modal-title">{textForm.title_en || 'New Text of the Month'}</span>
            </div>
            <div style={{ padding:'.6rem 1.5rem 0', fontSize:12, color:'var(--tx3)' }}>
              Draft auto-saved as you type. Use Save or Cancel below to close this form — clicking outside won&apos;t close it.
            </div>
            <div className="modal-body">
              <div style={{ display:'flex', gap:12, marginBottom:'1rem', flexWrap:'wrap' }}>
                <div className="field-row" style={{ flex:'1 1 160px', marginBottom:0 }}>
                  <label className="field-label">Author</label>
                  <input className="field-input" value={textForm.author||''} onChange={e=>updateTextForm(f=>({...f,author:e.target.value}))}/>
                </div>
                <div className="field-row" style={{ flex:'1 1 200px', marginBottom:0 }}>
                  <label className="field-label">Release Date &amp; Time</label>
                  <input className="field-input" type="datetime-local"
                    value={toDatetimeLocal(textForm.scheduledAt)}
                    onChange={e => updateTextForm(f => {
                      // Keep publishedAt (the date shown on public pages) in
                      // sync with scheduledAt (what actually gates visibility)
                      // so the two never drift apart — matches the dedicated
                      // Schedule/Publish Now row actions below.
                      if (!e.target.value) return { ...f, scheduledAt: null, publishedAt: null };
                      const iso = new Date(e.target.value).toISOString();
                      return { ...f, scheduledAt: iso, publishedAt: iso.slice(0, 10) };
                    })}/>
                  <div className="field-hint">Empty = draft, never public.</div>
                </div>
                <div className="field-row" style={{ flex:'0 0 auto', marginBottom:0, display:'flex', alignItems:'flex-end' }}>
                  <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--tx2)', cursor:'pointer', paddingBottom:2 }}>
                    <input type="checkbox" checked={!!textForm.hidden} onChange={e=>updateTextForm(f=>({...f,hidden:e.target.checked}))} style={{accentColor:'var(--cr)',width:15,height:15}}/>
                    Hidden
                  </label>
                </div>
              </div>

              <div className="tabs" style={{ marginBottom:'1rem' }}>
                {Object.entries(LANG_LABELS).map(([l,label])=>(
                  <button key={l} className={`tab-btn${textTab===l?' active':''}`} onClick={()=>setTextTab(l)}>{label}</button>
                ))}
              </div>

              <div className="field-row">
                <label className="field-label">{CATEGORY_TITLE_LABEL[lang]}</label>
                {textForm[catField] === '__new__' ? (
                  <div style={{ display:'flex', gap:8 }}>
                    <input className="field-input"
                      placeholder="Type new category name..."
                      value={textForm[customField] || ''}
                      onChange={e => { const v = e.target.value; updateTextForm(f => ({ ...f, [customField]: v })); }}
                    />
                    <button className="btn btn-s btn-sm"
                      onClick={() => updateTextForm(f => ({ ...f, [catField]: f[customField] || '', [customField]: '' }))}>
                      Set
                    </button>
                    <button className="btn btn-s btn-sm"
                      onClick={() => updateTextForm(f => ({ ...f, [catField]: '', [customField]: '' }))}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <select className="field-input field-select"
                    value={textForm[catField] || ''}
                    onChange={e => {
                      const val = e.target.value;
                      updateTextForm(f => {
                        const next = { ...f, [catField]: val };
                        if (val !== '__new__') {
                          const idx = CATEGORY_PRESETS.findIndex(row2 => row2[catIdx] === val);
                          if (idx >= 0) {
                            ['en','fr','es'].forEach((l2, i) => {
                              const otherField = `category_${l2}`;
                              if (l2 !== lang && !f[otherField]) next[otherField] = CATEGORY_PRESETS[idx][i];
                            });
                          }
                        }
                        return next;
                      });
                    }}>
                    <option value="">Select a category...</option>
                    {CATEGORY_PRESETS.map(row2 => (
                      <option key={row2[catIdx]} value={row2[catIdx]}>{row2[catIdx]}</option>
                    ))}
                    <option value="__new__">+ Add New Category</option>
                  </select>
                )}
              </div>

              <div className="field-row">
                <label className="field-label">{ATTACHMENT_LABEL[lang]}</label>
                <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                  {textForm[attField] && (
                    <a href={`/api/texts/download?id=${textForm.id}&lang=${lang}`}
                      target="_blank" rel="noopener" className="btn btn-s btn-sm">
                      Download: {textForm[attNameField] || 'File'}
                    </a>
                  )}
                  <input type="file" accept=".pdf,.doc,.docx"
                    id={`text-attachment-input-${lang}`}
                    style={{ display:'none' }}
                    onChange={e => { const file = e.target.files[0]; uploadAttachment(lang, file); e.target.value = ''; }}
                  />
                  <button className="btn btn-s btn-sm"
                    onClick={() => document.getElementById(`text-attachment-input-${lang}`).click()}>
                    {textForm[attField] ? 'Replace File' : 'Upload PDF or Word'}
                  </button>
                </div>
                <div className="field-hint">Save the text first before uploading an attachment. Each language keeps its own file.</div>
              </div>

              {(FIELDS[textTab]||[]).map(([field, label])=>(
                <div className="field-row" key={field}>
                  <label className="field-label">{label}</label>
                  {field.startsWith('preview') || field.startsWith('full')
                    ? <textarea className="field-input field-textarea" style={{minHeight: field.startsWith('full') ? 200 : 100}}
                        value={textForm[field]||''} onChange={e=>updateTextForm(f=>({...f,[field]:e.target.value}))}
                        placeholder={field.startsWith('preview') ? 'Paste the first ~25% of the text here' : 'Paste the complete text here'}/>
                    : <input className="field-input" value={textForm[field]||''} onChange={e=>updateTextForm(f=>({...f,[field]:e.target.value}))}/>
                  }
                  {field.startsWith('preview') && <div className="field-hint">{(textForm[field]||'').length} chars, aim for 400-800 chars</div>}
                  {field.startsWith('full') && <div className="field-hint">{(textForm[field]||'').length} chars total</div>}
                </div>
              ))}

              <div className="field-row">
                <label className="field-label">🎙 Podcast Platforms</label>
                <div className="field-hint" style={{marginBottom:'.5rem'}}>
                  Paste a link for any platform this text&apos;s podcast episode is on. Leave blank to hide a platform from the &quot;Listen to this podcast&quot; menu.
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:'.6rem'}}>
                  {Object.entries(PODCAST_PLATFORM_LABELS).map(([key,label])=>(
                    <div key={key} style={{display:'flex',flexDirection:'column',gap:2}}>
                      <label style={{fontSize:11,color:'var(--tx3)'}}>{label}</label>
                      <input className="field-input" type="url" placeholder="https://..."
                        value={(textForm.podcastPlatforms||{})[key] || ''}
                        onChange={e => {
                          const val = e.target.value;
                          updateTextForm(f => ({ ...f, podcastPlatforms: { ...(f.podcastPlatforms||{}), [key]: val } }));
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-s" onClick={discardDraft} title="Close and delete this unsaved draft" style={{marginRight:'auto'}}>Discard Draft</button>
              <button className="btn btn-s" onClick={()=>setEditText(null)} title="Close, keeping your progress as a draft">Cancel (Keep as Draft)</button>
              <button className="btn btn-p" onClick={saveText} disabled={textSaving}>
                {textSaving ? <><span className="spinner"/> Saving...</> : 'Save Text'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="toast-container">
        {toasts.map(t => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}
      </div>
    </div>
  );
}

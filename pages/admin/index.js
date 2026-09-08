// ════════════════════════════════════════════════════════════
// pages/admin/index.js: SPY ON THE RISE Admin Dashboard
// Full CRUD catalog management, analytics, backups, settings.
// Protected by cookie-based session auth.
// ════════════════════════════════════════════════════════════

import Head from 'next/head';
import { useState, useEffect, useCallback } from 'react';

// ── Bundle Management Component ────────────────────────────
function BundleAdmin({ toast, books = [] }) {
  const [bundles, setBundles] = useState(null);
  const [editBundle, setEditBundle] = useState(null);
  const [bundleForm, setBundleForm] = useState({});
  const [bundleSaving, setBundleSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const BADGE_OPTIONS = ['bundle','promo','limited','new'];
  const TYPE_OPTIONS = ['bundle','promo','limited','bilingual','series','new'];

  useEffect(() => {
    fetch('/api/admin/bundle')
      .then(r => r.json())
      .then(d => setBundles(d.bundles || []))
      .catch(() => setBundles([]));
  }, []);

  function openEdit(b) {
    setIsNew(false);
    setBundleForm({
      id: b.id, title: b.title, subtitle: b.subtitle || '',
      badge: b.badge || 'bundle',
      types: (b.types || ['bundle']).join(','),
      books: (b.books || []).join('\n'),
      orig: b.orig || '', disc: b.disc || '', save: b.save || '',
      discountRate: b.discountRate || '',
      isGold: b.isGold || false, timer: b.timer || false,
      limited: b.limited || false, saleEnd: b.saleEnd || '2026-06-30',
      notes: b.notes || '',
    });
    setEditBundle(b);
  }

  function openNew() {
    setIsNew(true);
    setBundleForm({
      id: 'bundle-' + Date.now(), title: '', subtitle: '',
      badge: 'bundle', types: 'bundle', books: '',
      orig: '', disc: '', save: '', discountRate: '',
      isGold: false, timer: false, limited: false, saleEnd: '2026-06-30', notes: '',
    });
    setEditBundle({});
  }

  function calcDiscount() {
    const rate = parseFloat(bundleForm.discountRate);
    const orig = parseFloat((bundleForm.orig || '').replace(/[^0-9.]/g, ''));
    if (!rate || !orig || isNaN(rate) || isNaN(orig)) return;
    const discAmt = orig * (rate / 100);
    setBundleForm(f => ({
      ...f,
      disc: `$${(orig - discAmt).toFixed(2)}`,
      save: `${rate}% Off. Save $${discAmt.toFixed(2)}`,
    }));
  }

  async function saveB() {
    setBundleSaving(true);
    try {
      const payload = {
        ...bundleForm,
        types: bundleForm.types.split(',').map(t => t.trim()).filter(Boolean),
        books: bundleForm.books.split('\n').map(b => b.trim()).filter(Boolean),
        isGold: bundleForm.isGold === true || bundleForm.isGold === 'true',
        timer: bundleForm.timer === true || bundleForm.timer === 'true',
        limited: bundleForm.limited === true || bundleForm.limited === 'true',
      };
      const r = await fetch('/api/admin/bundle', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', bundle: payload }),
      });
      const d = await r.json();
      if (d.success) {
        toast(isNew ? 'Bundle created' : 'Bundle updated', 'success');
        setEditBundle(null);
        const r2 = await fetch('/api/admin/bundle');
        const d2 = await r2.json();
        setBundles(d2.bundles || []);
      } else toast(d.error, 'error');
    } catch { toast('Save failed', 'error'); }
    setBundleSaving(false);
  }

  async function deleteB(id, title) {
    if (!confirm(`Delete bundle "${title}"? This cannot be undone.`)) return;
    try {
      const r = await fetch('/api/admin/bundle', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      });
      const d = await r.json();
      if (d.success) {
        toast('Bundle deleted', 'success');
        setBundles(prev => prev.filter(b => b.id !== id));
      } else toast(d.error, 'error');
    } catch { toast('Delete failed', 'error'); }
  }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
        <span style={{fontSize:13,color:'var(--tx3)'}}>{bundles ? bundles.length : 'N/A'} bundle offers</span>
        <button className="btn btn-p" onClick={openNew}>+ New Bundle</button>
      </div>

      {!bundles ? (
        <div className="loading-row"><span className="spinner"/> Loading bundles...</div>
      ) : (
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">All Bundle Offers</span>
            <span style={{fontSize:11,color:'var(--tx3)'}}>Click any row to edit</span>
          </div>
          {bundles.map(b => (
            <div key={b.id} onClick={() => openEdit(b)}
              style={{display:'flex',alignItems:'center',gap:12,padding:'.75rem 1rem',borderTop:'1px solid var(--border)',cursor:'pointer',transition:'background .12s'}}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.03)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <span style={{fontSize:18}}>{b.timer?'⚡':'🎁'}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600,color:'var(--tx)',marginBottom:1}}>{b.title}</div>
                <div style={{fontSize:11,color:'var(--tx3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{b.subtitle}</div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontSize:13,fontWeight:700,color:'var(--crb)'}}>{b.disc}</div>
                <div style={{fontSize:10,color:'var(--tx3)',textDecoration:'line-through'}}>{b.orig}</div>
              </div>
              <span className={`badge ${b.timer?'badge-locked':b.isGold?'badge-avail':'badge-genre'}`} style={{marginLeft:4}}>
                {b.timer ? 'Limited' : b.isGold ? 'Featured' : 'Active'}
              </span>
              <button className="btn btn-danger btn-sm" onClick={e=>{e.stopPropagation();deleteB(b.id,b.title);}}>✕</button>
            </div>
          ))}
        </div>
      )}

      {editBundle && (
        <div className="modal-ov open" onClick={e=>e.target.className==='modal-ov'&&setEditBundle(null)}>
          <div className="modal-box" style={{maxWidth:680}}>
            <div className="modal-head">
              <span className="modal-title">{isNew ? '+ New Bundle' : `Edit: ${editBundle.title||'Bundle'}`}</span>
              <button className="modal-cls" onClick={()=>setEditBundle(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="two-col">
                <div className="field-row">
                  <label className="field-label">Bundle Title *</label>
                  <input className="field-input" value={bundleForm.title||''} onChange={e=>setBundleForm(f=>({...f,title:e.target.value}))} placeholder="e.g. The Complete Mercer Files" />
                </div>
                <div className="field-row">
                  <label className="field-label">Badge Type</label>
                  <select className="field-input field-select" value={bundleForm.badge||'bundle'} onChange={e=>setBundleForm(f=>({...f,badge:e.target.value}))}>
                    {BADGE_OPTIONS.map(o=><option key={o} value={o}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div className="field-row">
                <label className="field-label">Subtitle / Description</label>
                <input className="field-input" value={bundleForm.subtitle||''} onChange={e=>setBundleForm(f=>({...f,subtitle:e.target.value}))} placeholder="e.g. All 7 volumes of the flagship spy thriller series" />
              </div>
              <div className="field-row">
                <label className="field-label">Titles Included</label>
                {books.length > 0 && (() => {
                  const groups = {};
                  books.forEach(b => { const k = b.series||'Standalone'; if(!groups[k])groups[k]=[]; groups[k].push(b); });
                  return (
                    <select className="field-input field-select" style={{marginBottom:'.5rem'}}
                      value="" onChange={e => {
                        const val = e.target.value; if (!val) return;
                        const existing = (bundleForm.books||'').split('\n').map(l=>l.trim()).filter(Boolean);
                        if (!existing.includes(val)) {
                          const newLines = [...existing, val];
                          const total = newLines.reduce((sum, title) => {
                            const book = books.find(b => b.title === title);
                            if (!book || !book.price) return sum;
                            const m = book.price.match(/[\d.]+/);
                            return sum + (m ? parseFloat(m[0]) : 0);
                          }, 0);
                          setBundleForm(f => ({
                            ...f,
                            books: newLines.join('\n'),
                            orig: total > 0 ? `$${total.toFixed(2)}` : f.orig,
                          }));
                        }
                      }}>
                      <option value="">+ Pick a title to add...</option>
                      {Object.entries(groups).map(([series, bks]) => (
                        <optgroup key={series} label={series}>
                          {bks.map(b=><option key={b.key} value={b.title}>{b.title}{b.vol?' ('+b.vol+')':''}</option>)}
                        </optgroup>
                      ))}
                    </select>
                  );
                })()}
                {(bundleForm.books||'').split('\n').filter(Boolean).length > 0 && (
                  <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:'.5rem'}}>
                    {(bundleForm.books||'').split('\n').filter(Boolean).map((t,i)=>(
                      <span key={i} style={{display:'inline-flex',alignItems:'center',gap:4,background:'var(--crp)',color:'var(--crb)',border:'1px solid rgba(200,112,112,.3)',borderRadius:3,padding:'2px 8px',fontSize:11}}>
                        {t}
                        <button type="button" style={{background:'none',border:'none',color:'var(--crb)',cursor:'pointer',padding:0,lineHeight:1,fontSize:14}} onClick={()=>{
                          const lines = bundleForm.books.split('\n').map(l=>l.trim()).filter(x=>x&&x!==t.trim());
                          const total = lines.reduce((sum, title) => {
                            const book = books.find(b => b.title === title);
                            if (!book || !book.price) return sum;
                            const m = book.price.match(/[\d.]+/);
                            return sum + (m ? parseFloat(m[0]) : 0);
                          }, 0);
                          setBundleForm(f => ({
                            ...f,
                            books: lines.join('\n'),
                            orig: total > 0 ? `$${total.toFixed(2)}` : f.orig,
                          }));
                        }}>×</button>
                      </span>
                    ))}
                  </div>
                )}
                <textarea className="field-input field-textarea" style={{minHeight:80}} value={bundleForm.books||''} onChange={e=>setBundleForm(f=>({...f,books:e.target.value}))} placeholder={'Book 1: The Kremlin Coup\nBook 2: The Prague Protocol'} />
                <div className="field-hint">{(bundleForm.books||'').split('\n').filter(Boolean).length} titles listed · or type manually above</div>
              </div>
              <div style={{background:'rgba(212,168,32,.07)',border:'1px solid rgba(212,168,32,.2)',borderRadius:6,padding:'1rem',marginBottom:'1rem'}}>
                <div style={{fontSize:12,fontWeight:700,color:'var(--amberb)',marginBottom:'.75rem',letterSpacing:'.08em',textTransform:'uppercase'}}>Pricing</div>
                <div className="two-col" style={{marginBottom:'.75rem'}}>
                  <div className="field-row" style={{marginBottom:0}}>
                    <label className="field-label">Original Price</label>
                    <input className="field-input" value={bundleForm.orig||''} onChange={e=>setBundleForm(f=>({...f,orig:e.target.value}))} placeholder="$104.93" />
                    <div className="field-hint">Auto-calculated from selected titles. Edit manually to override.</div>
                  </div>
                  <div className="field-row" style={{marginBottom:0}}>
                    <label className="field-label">Discount Rate (%)</label>
                    <div style={{display:'flex',gap:6}}>
                      <input className="field-input" type="number" min="0" max="90" value={bundleForm.discountRate||''} onChange={e=>setBundleForm(f=>({...f,discountRate:e.target.value}))} placeholder="35" />
                      <button className="btn btn-warn btn-sm" onClick={calcDiscount} type="button">Calc</button>
                    </div>
                    <div className="field-hint">Calc auto-fills discounted price and savings</div>
                  </div>
                </div>
                <div className="two-col">
                  <div className="field-row" style={{marginBottom:0}}>
                    <label className="field-label">Discounted Price</label>
                    <input className="field-input" value={bundleForm.disc||''} onChange={e=>setBundleForm(f=>({...f,disc:e.target.value}))} placeholder="$68.20" />
                  </div>
                  <div className="field-row" style={{marginBottom:0}}>
                    <label className="field-label">Savings Label</label>
                    <input className="field-input" value={bundleForm.save||''} onChange={e=>setBundleForm(f=>({...f,save:e.target.value}))} placeholder="35% Off. Save $36.73" />
                  </div>
                </div>
              </div>
              <div style={{background:'rgba(255,255,255,.04)',border:'1px solid var(--border)',borderRadius:6,padding:'1rem',marginBottom:'1rem'}}>
                <div style={{fontSize:12,fontWeight:700,color:'var(--tx2)',marginBottom:'.75rem',letterSpacing:'.08em',textTransform:'uppercase'}}>Offer Settings</div>
                <div className="two-col">
                  <div className="field-row" style={{marginBottom:0}}>
                    <label className="field-label">Types (comma-separated)</label>
                    <input className="field-input" value={bundleForm.types||''} onChange={e=>setBundleForm(f=>({...f,types:e.target.value}))} placeholder="bundle,series" />
                    <div className="field-hint">Options: {TYPE_OPTIONS.join(', ')}</div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:'.6rem',paddingTop:'.3rem'}}>
                    <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13,color:'var(--tx2)'}}>
                      <input type="checkbox" checked={!!bundleForm.isGold} onChange={e=>setBundleForm(f=>({...f,isGold:e.target.checked}))} />
                      Gold / Featured border
                    </label>
                    <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13,color:'var(--tx2)'}}>
                      <input type="checkbox" checked={!!bundleForm.timer} onChange={e=>setBundleForm(f=>({...f,timer:e.target.checked}))} />
                      Show countdown timer
                    </label>
                    <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13,color:'var(--tx2)'}}>
                      <input type="checkbox" checked={!!bundleForm.limited} onChange={e=>setBundleForm(f=>({...f,limited:e.target.checked}))} />
                      Limited time offer
                    </label>
                  </div>
                </div>
                {(bundleForm.timer || bundleForm.limited) && (
                  <div className="field-row" style={{marginTop:'.75rem',marginBottom:0}}>
                    <label className="field-label">Sale End Date</label>
                    <input className="field-input" type="date" value={bundleForm.saleEnd||'2026-06-30'} onChange={e=>setBundleForm(f=>({...f,saleEnd:e.target.value}))} />
                    <div className="field-hint">Update SALE_END in public/site-logic.js to match.</div>
                  </div>
                )}
              </div>
              <div className="field-row">
                <label className="field-label">Internal Notes (not shown to readers)</label>
                <textarea className="field-input field-textarea" style={{minHeight:60}} value={bundleForm.notes||''} onChange={e=>setBundleForm(f=>({...f,notes:e.target.value}))} placeholder="e.g. Seasonal offer, renew quarterly" />
              </div>
            </div>
            <div className="modal-foot">
              {!isNew && <button className="btn btn-danger" onClick={()=>{deleteB(editBundle.id,editBundle.title);setEditBundle(null);}}>Delete Bundle</button>}
              <button className="btn btn-s" onClick={()=>setEditBundle(null)}>Cancel</button>
              <button className="btn btn-p" onClick={saveB} disabled={bundleSaving}>
                {bundleSaving?<><span className="spinner"/> Saving...</>:isNew?'Create Bundle':'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Platform Management Component ──────────────────────────
function PlatformsAdmin({ toast }) {
  const [platforms, setPlatforms] = useState(null);
  const [newPlatform, setNewPlatform] = useState({ name:'', abbr:'', color:'#333333', note:'', type:'print' });
  const [platformSaving, setPlatformSaving] = useState(false);
  const [editKey, setEditKey] = useState(null); // `${type}:${key}` of row being edited
  const [editRow, setEditRow] = useState({});
  const [rowSaving, setRowSaving] = useState(false);

  async function reload() {
    const r2 = await fetch('/api/admin/catalog');
    const d2 = await r2.json();
    setPlatforms(d2.platforms || {});
  }

  useEffect(() => {
    fetch('/api/admin/catalog')
      .then(r => r.json())
      .then(d => setPlatforms(d.platforms || {}))
      .catch(() => setPlatforms({}));
  }, []);

  function openEditRow(p) {
    setEditKey(`${p.type}:${p.key}`);
    setEditRow({ name:p.name, abbr:p.abbr, color:p.color, note:p.note || '' });
  }

  async function saveEditRow(p) {
    setRowSaving(true);
    try {
      const r = await fetch('/api/admin/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-platform',
          platformType: p.type,
          platform: { key: p.key, ...editRow, abbr: editRow.abbr.slice(0,3).toUpperCase() },
        }),
      });
      const d = await r.json();
      if (d.success) {
        toast('Platform updated', 'success');
        setEditKey(null);
        await reload();
      } else toast(d.error, 'error');
    } catch { toast('Failed to update platform', 'error'); }
    setRowSaving(false);
  }

  async function deletePlatformRow(p) {
    if (!confirm(`Delete "${p.name}"? This removes it from every book that links to it.`)) return;
    try {
      const r = await fetch('/api/admin/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete-platform', platformType: p.type, platform: { key: p.key } }),
      });
      const d = await r.json();
      if (d.success) { toast('Platform deleted', 'success'); await reload(); }
      else toast(d.error, 'error');
    } catch { toast('Failed to delete platform', 'error'); }
  }

  async function addPlatformEntry() {
    if (!newPlatform.name || !newPlatform.abbr) {
      toast('Name and abbreviation are required', 'error');
      return;
    }
    setPlatformSaving(true);
    try {
      const r = await fetch('/api/admin/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add-platform',
          platform: {
            name: newPlatform.name,
            abbr: newPlatform.abbr.slice(0, 3).toUpperCase(),
            color: newPlatform.color,
            note: newPlatform.note,
            key: newPlatform.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            url: '#',
          },
          platformType: newPlatform.type,
        }),
      });
      const d = await r.json();
      if (d.success) {
        toast(`Platform "${newPlatform.name}" added`, 'success');
        setNewPlatform({ name:'', abbr:'', color:'#333333', note:'', type:'print' });
        await reload();
      } else toast(d.error, 'error');
    } catch { toast('Failed to add platform', 'error'); }
    setPlatformSaving(false);
  }

  const allPlatforms = platforms
    ? Object.entries(platforms).flatMap(([type, list]) =>
        (list || []).map(p => ({ ...p, type })))
    : [];

  return (
    <div>
      <div className="panel" style={{ marginBottom:'1.25rem' }}>
        <div className="panel-head"><span className="panel-title">Current Platforms</span></div>
        {!platforms ? (
          <div className="loading-row"><span className="spinner"/> Loading...</div>
        ) : allPlatforms.length === 0 ? (
          <div className="panel-body" style={{ textAlign:'center', color:'var(--tx3)' }}>No platforms configured.</div>
        ) : (
          <div className="panel-body" style={{ padding:0 }}>
            <table className="tbl">
              <thead><tr><th>Platform</th><th>Type</th><th>Note</th><th>Color</th><th>Actions</th></tr></thead>
              <tbody>
                {allPlatforms.map((p, i) => {
                  const rowKey = `${p.type}:${p.key}`;
                  const editing = editKey === rowKey;
                  return (
                    <tr key={i}>
                      {editing ? (
                        <>
                          <td>
                            <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                              <input className="field-input" value={editRow.abbr} onChange={e=>setEditRow(f=>({...f,abbr:e.target.value.toUpperCase().slice(0,3)}))} style={{ width:60, fontFamily:'monospace', fontSize:11 }} />
                              <input className="field-input" value={editRow.name} onChange={e=>setEditRow(f=>({...f,name:e.target.value}))} style={{ flex:1 }} />
                            </div>
                          </td>
                          <td><span className="badge badge-series">{p.type}</span></td>
                          <td><input className="field-input" value={editRow.note} onChange={e=>setEditRow(f=>({...f,note:e.target.value}))} style={{ fontSize:12 }} /></td>
                          <td>
                            <input type="color" value={editRow.color} onChange={e=>setEditRow(f=>({...f,color:e.target.value}))} style={{ width:32, height:26, border:'1px solid var(--border)', borderRadius:4, cursor:'pointer', background:'none' }} />
                          </td>
                          <td>
                            <div style={{ display:'flex', gap:4 }}>
                              <button className="btn btn-p btn-sm" disabled={rowSaving} onClick={()=>saveEditRow(p)}>
                                {rowSaving ? <span className="spinner"/> : 'Save'}
                              </button>
                              <button className="btn btn-s btn-sm" onClick={()=>setEditKey(null)}>Cancel</button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>
                            <span style={{ background:p.color, color:'#fff', fontWeight:700, fontSize:10, padding:'2px 7px', borderRadius:3, marginRight:8 }}>{p.abbr}</span>
                            <span style={{ fontWeight:500, color:'var(--tx)' }}>{p.name}</span>
                          </td>
                          <td><span className="badge badge-series">{p.type}</span></td>
                          <td style={{ fontSize:12, color:'var(--tx3)' }}>{p.note}</td>
                          <td><span style={{ display:'inline-block', width:18, height:18, borderRadius:3, background:p.color, border:'1px solid var(--border)' }}/></td>
                          <td>
                            <div style={{ display:'flex', gap:4 }}>
                              <button className="btn btn-s btn-sm" onClick={()=>openEditRow(p)}>✏️ Edit</button>
                              <button className="btn btn-danger btn-sm" onClick={()=>deletePlatformRow(p)}>✕</button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="panel">
        <div className="panel-head"><span className="panel-title">Add New Platform</span></div>
        <div className="panel-body">
          <div className="two-col">
            <div className="field-row">
              <label className="field-label">Platform Name</label>
              <input className="field-input" value={newPlatform.name} onChange={e => setNewPlatform(f => ({...f, name:e.target.value}))} placeholder="e.g. Payhip" />
            </div>
            <div className="field-row">
              <label className="field-label">Abbreviation (3 letters)</label>
              <input className="field-input" value={newPlatform.abbr} onChange={e => setNewPlatform(f => ({...f, abbr:e.target.value.toUpperCase().slice(0,3)}))} placeholder="PAY" style={{ fontFamily:'monospace' }} />
            </div>
          </div>
          <div className="two-col">
            <div className="field-row">
              <label className="field-label">Type</label>
              <select className="field-input field-select" value={newPlatform.type} onChange={e => setNewPlatform(f => ({...f, type:e.target.value}))}>
                <option value="print">Print</option>
                <option value="ebook">eBook</option>
                <option value="audio">Audio</option>
              </select>
            </div>
            <div className="field-row">
              <label className="field-label">Brand Color</label>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <input type="color" value={newPlatform.color} onChange={e => setNewPlatform(f => ({...f, color:e.target.value}))} style={{ width:38, height:32, border:'1px solid var(--border)', borderRadius:4, cursor:'pointer', background:'none' }} />
                <input className="field-input" value={newPlatform.color} onChange={e => setNewPlatform(f => ({...f, color:e.target.value}))} style={{ fontFamily:'monospace', fontSize:12 }} />
              </div>
            </div>
          </div>
          <div className="field-row">
            <label className="field-label">Short Description</label>
            <input className="field-input" value={newPlatform.note} onChange={e => setNewPlatform(f => ({...f, note:e.target.value}))} placeholder="e.g. Digital downloads direct" />
          </div>
          <button className="btn btn-p" onClick={addPlatformEntry} disabled={platformSaving}>
            {platformSaving ? <><span className="spinner"/> Adding...</> : 'Add Platform'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Compact inline "add platform" used from the book links editor ──
function AddPlatformInline({ type, toast, loadCatalog }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  async function add() {
    if (!name.trim()) { toast('Platform name is required', 'error'); return; }
    setSaving(true);
    try {
      const r = await fetch('/api/admin/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add-platform',
          platform: {
            name: name.trim(),
            abbr: name.trim().slice(0, 3).toUpperCase(),
            color: '#333333',
            note: '',
            key: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            url: '#',
          },
          platformType: type,
        }),
      });
      const d = await r.json();
      if (d.success) {
        toast(`Platform "${name.trim()}" added`, 'success');
        setName(''); setOpen(false);
        await loadCatalog();
      } else toast(d.error, 'error');
    } catch { toast('Failed to add platform', 'error'); }
    setSaving(false);
  }

  if (!open) {
    return (
      <button className="btn btn-s btn-sm" onClick={() => setOpen(true)}>+ Add New Platform</button>
    );
  }
  return (
    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
      <input className="field-input" value={name} onChange={e => setName(e.target.value)}
        placeholder="Platform name" style={{ maxWidth:220 }} autoFocus />
      <button className="btn btn-p btn-sm" disabled={saving} onClick={add}>
        {saving ? <span className="spinner"/> : 'Add'}
      </button>
      <button className="btn btn-s btn-sm" onClick={() => { setOpen(false); setName(''); }}>Cancel</button>
    </div>
  );
}

// ── Series Management Component ────────────────────────────
const NEW_BOOK_GENRES = ['Spy Thriller','Behavioral Sociology','Historical Fiction','Geopolitical Theory','Literary Fiction','Speculative Fiction','Social Essay','Socio-Political Essay','Bilingual Poetry',"Children's Illustrated Fiction"];

function SeriesAdmin({ data, toast, loadCatalog }) {
  const [editSeries, setEditSeries] = useState(null);
  const [seriesForm, setSeriesForm] = useState({});
  const [seriesSaving, setSeriesSaving] = useState(false);
  const [addBookKey, setAddBookKey] = useState('');
  const [membershipBusy, setMembershipBusy] = useState(false);

  // ── Add New Series ────────────────────────────────────────
  // Everything — series info, picking existing books, and staging brand
  // new ones — lives in one form. Nothing hits the server until "Create
  // Series" is clicked, which creates the series and then attaches every
  // selected/staged book in one action.
  const [showNewSeries, setShowNewSeries] = useState(false);
  const [newSeriesForm, setNewSeriesForm] = useState({ name:'', tag:'', desc:'' });
  const [creatingSeries, setCreatingSeries] = useState(false);
  const [selectedExisting, setSelectedExisting] = useState([]); // book keys
  const [showEmbeddedAddBook, setShowEmbeddedAddBook] = useState(false);
  const [newBookForm, setNewBookForm] = useState({});
  const [newBookAutoKey, setNewBookAutoKey] = useState('');
  const [newBookDrafts, setNewBookDrafts] = useState([]); // staged, not yet saved

  function closeNewSeries() {
    setShowNewSeries(false);
    setNewSeriesForm({ name:'', tag:'', desc:'' });
    setSelectedExisting([]);
    setShowEmbeddedAddBook(false);
    setNewBookForm({});
    setNewBookAutoKey('');
    setNewBookDrafts([]);
  }

  function toggleExistingBook(key) {
    setSelectedExisting(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  }

  function stageNewBook() {
    if (!newBookForm.title) { toast('Title is required', 'error'); return; }
    setNewBookDrafts(prev => [...prev, { ...newBookForm, _previewKey: newBookAutoKey }]);
    setNewBookForm({});
    setNewBookAutoKey('');
    setShowEmbeddedAddBook(false);
  }

  function removeDraft(idx) {
    setNewBookDrafts(prev => prev.filter((_, i) => i !== idx));
  }

  // Auto-generate a key preview for the embedded new-book form, same
  // approach as the main "+ Add New Title" form elsewhere in the admin.
  useEffect(() => {
    if (!showEmbeddedAddBook || !newBookForm.title || newBookForm.title.length < 3) { setNewBookAutoKey(''); return; }
    const t = setTimeout(async () => {
      try {
        const r = await fetch('/api/admin/add-book', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ previewKey: newBookForm.title }),
        });
        const d = await r.json();
        if (d.key) setNewBookAutoKey(d.key);
      } catch {}
    }, 400);
    return () => clearTimeout(t);
  }, [newBookForm.title, showEmbeddedAddBook]);

  async function createSeriesWithBooks() {
    if (!newSeriesForm.name.trim()) { toast('Series name is required', 'error'); return; }
    setCreatingSeries(true);
    try {
      const r = await fetch('/api/admin/book', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add-series', series: newSeriesForm }),
      });
      const d = await r.json();
      if (!d.success) { toast(d.error || 'Failed to create series', 'error'); setCreatingSeries(false); return; }

      const seriesKey = d.key, seriesName = d.name;
      let failures = 0;

      for (const bookKey of selectedExisting) {
        try {
          const rr = await fetch('/api/admin/book', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'series-add-book', seriesKey, bookKey }),
          });
          const dd = await rr.json();
          if (!dd.success) failures++;
        } catch { failures++; }
      }

      // Sequential on purpose: each new book's key is generated from the
      // catalog's current state, so parallel creates could collide.
      for (const draft of newBookDrafts) {
        try {
          const { _previewKey, ...bookData } = draft;
          const rr = await fetch('/api/admin/add-book', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookData: { ...bookData, series: seriesName, seriesKey } }),
          });
          const dd = await rr.json();
          if (!dd.success) failures++;
        } catch { failures++; }
      }

      const bookCount = selectedExisting.length + newBookDrafts.length;
      if (failures === 0) {
        toast(`Series "${seriesName}" created${bookCount ? ` with ${bookCount} book${bookCount>1?'s':''}` : ''}`, 'success');
      } else {
        toast(`Series "${seriesName}" created, but ${failures} of ${bookCount} books failed to attach — add them via Edit Series`, 'warning');
      }
      closeNewSeries();
      await loadCatalog();
    } catch { toast('Failed to create series', 'error'); }
    setCreatingSeries(false);
  }

  const seriesList = data?.series || null;

  // Keep the open modal's book list/counts fresh after add/remove/refresh.
  useEffect(() => {
    if (editSeries && data?.series) {
      const updated = data.series.find(s => s.key === editSeries.key);
      if (updated) setEditSeries(updated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  async function saveSeries() {
    setSeriesSaving(true);
    try {
      const r = await fetch('/api/admin/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-series', series: seriesForm }),
      });
      const d = await r.json();
      if (d.success) {
        toast('Series updated', 'success');
        setEditSeries(null);
        await loadCatalog();
      } else toast(d.error, 'error');
    } catch { toast('Failed to save series', 'error'); }
    setSeriesSaving(false);
  }

  async function addBookToSeries() {
    if (!addBookKey) return;
    setMembershipBusy(true);
    try {
      const r = await fetch('/api/admin/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'series-add-book', seriesKey: editSeries.key, bookKey: addBookKey }),
      });
      const d = await r.json();
      if (d.success) {
        toast('Book added to series', 'success');
        setAddBookKey('');
        await loadCatalog();
      } else toast(d.error, 'error');
    } catch { toast('Failed to add book', 'error'); }
    setMembershipBusy(false);
  }

  async function removeBookFromSeries(bookKey, title, seriesKeyOverride) {
    if (!confirm(`Remove "${title}" from this series? It becomes a Standalone title.`)) return;
    setMembershipBusy(true);
    try {
      const r = await fetch('/api/admin/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'series-remove-book', seriesKey: seriesKeyOverride || editSeries.key, bookKey }),
      });
      const d = await r.json();
      if (d.success) {
        toast('Book removed from series', 'success');
        await loadCatalog();
      } else toast(d.error, 'error');
    } catch { toast('Failed to remove book', 'error'); }
    setMembershipBusy(false);
  }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:'.75rem'}}>
        <button className="btn btn-p" onClick={() => setShowNewSeries(true)}>+ Add New Series</button>
      </div>

      {!seriesList ? (
        <div className="loading-row"><span className="spinner"/> Loading...</div>
      ) : (
        <div className="panel">
          <div className="panel-head"><span className="panel-title">All Series</span></div>
          {seriesList.map(s => (
            <div key={s.key} style={{ display:'flex', alignItems:'center', gap:12, padding:'.85rem 1rem', borderTop:'1px solid var(--border)', cursor:'pointer' }}
              onClick={() => { setEditSeries(s); setSeriesForm({ key:s.key, name:s.name, tag:s.tag }); }}>
              <span style={{ fontSize:16 }}>📖</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--tx)' }}>{s.name}</div>
                <div style={{ fontSize:11, color:'var(--tx3)' }}>{s.tag} · {s.total} titles · {s.available} live · {s.locked} locked</div>
              </div>
              <span style={{ fontSize:12, color:'var(--crb)' }}>Edit →</span>
            </div>
          ))}
        </div>
      )}

      {editSeries && (
        <div className="modal-ov open" onClick={e => e.target.className.includes('modal-ov') && setEditSeries(null)}>
          <div className="modal-box">
            <div className="modal-head">
              <span className="modal-title">Edit Series: {editSeries.name}</span>
              <button className="modal-cls" onClick={() => setEditSeries(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="field-row">
                <label className="field-label">Series Name</label>
                <input className="field-input" value={seriesForm.name || ''} onChange={e => setSeriesForm(f => ({...f, name:e.target.value}))} />
              </div>
              <div className="field-row">
                <label className="field-label">Genre Tag</label>
                <input className="field-input" value={seriesForm.tag || ''} onChange={e => setSeriesForm(f => ({...f, tag:e.target.value}))} />
              </div>
              <div className="panel" style={{ marginTop:'.75rem' }}>
                <div className="panel-head"><span className="panel-title">Books in this series</span></div>
                <div className="panel-body" style={{ padding:'.5rem 0' }}>
                  {data && data.books.filter(b => b.seriesKey === editSeries.key).map(b => (
                    <div key={b.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, padding:'.5rem 1rem', borderTop:'1px solid var(--border)' }}>
                      <span style={{ fontSize:12, color:'var(--tx2)', flex:1 }}>{b.title}</span>
                      <span className={`badge ${b.available ? 'badge-avail' : 'badge-locked'}`}>{b.available ? 'Live' : 'Locked'}</span>
                      <button className="btn btn-danger btn-sm" disabled={membershipBusy}
                        onClick={() => removeBookFromSeries(b.key, b.title)} title="Remove from series">✕</button>
                    </div>
                  ))}
                  {data && data.books.filter(b => b.seriesKey === editSeries.key).length === 0 && (
                    <div style={{ padding:'.5rem 1rem', fontSize:12, color:'var(--tx3)' }}>No books in this series yet.</div>
                  )}
                </div>
                <div className="panel-body" style={{ borderTop:'1px solid var(--border)', display:'flex', gap:8 }}>
                  <select className="field-input field-select" style={{ flex:1 }}
                    value={addBookKey} onChange={e => setAddBookKey(e.target.value)}>
                    <option value="">+ Pick a book to add...</option>
                    {data && data.books.filter(b => b.seriesKey !== editSeries.key).map(b => (
                      <option key={b.key} value={b.key}>{b.title}{b.series && b.series !== 'Standalone' ? ` (currently: ${b.series})` : ''}</option>
                    ))}
                  </select>
                  <button className="btn btn-s btn-sm" disabled={!addBookKey || membershipBusy} onClick={addBookToSeries}>
                    {membershipBusy ? <span className="spinner"/> : 'Add'}
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-s" onClick={() => setEditSeries(null)}>Cancel</button>
              <button className="btn btn-p" onClick={saveSeries} disabled={seriesSaving}>
                {seriesSaving ? <><span className="spinner"/> Saving...</> : 'Save Series'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewSeries && (
        <div className="modal-ov open">
          <div className="modal-box">
            <div className="modal-head">
              <span className="modal-title">+ Add New Series</span>
              <button className="modal-cls" onClick={closeNewSeries}>✕</button>
            </div>
            <div className="modal-body">
              <div className="field-row">
                <label className="field-label">Series Name <span style={{color:'var(--crb)'}}>*</span></label>
                <input className="field-input" autoFocus value={newSeriesForm.name}
                  onChange={e => setNewSeriesForm(f => ({...f, name:e.target.value}))}
                  placeholder="e.g. The Atlas Protocol" />
              </div>
              <div className="field-row">
                <label className="field-label">Genre Tag</label>
                <input className="field-input" value={newSeriesForm.tag}
                  onChange={e => setNewSeriesForm(f => ({...f, tag:e.target.value}))}
                  placeholder="e.g. Spy Thriller" />
              </div>
              <div className="field-row">
                <label className="field-label">Short Description</label>
                <textarea className="field-input field-textarea" style={{minHeight:60}} value={newSeriesForm.desc}
                  onChange={e => setNewSeriesForm(f => ({...f, desc:e.target.value}))}
                  placeholder="One or two sentences about the series…" />
                <div className="field-hint">You can add richer series-page copy later.</div>
              </div>

              <div className="panel" style={{marginTop:'.75rem'}}>
                <div className="panel-head"><span className="panel-title">Pick Existing Books to Include</span></div>
                <div className="panel-body" style={{ padding:'.5rem 0', maxHeight:220, overflowY:'auto' }}>
                  {data && data.books.map(b => (
                    <label key={b.key} style={{ display:'flex', alignItems:'center', gap:10, padding:'.5rem 1rem', borderTop:'1px solid var(--border)', cursor:'pointer' }}>
                      <input type="checkbox" checked={selectedExisting.includes(b.key)} onChange={() => toggleExistingBook(b.key)}
                        style={{accentColor:'var(--crb)',width:15,height:15,flexShrink:0}} />
                      <span style={{ fontSize:12, color:'var(--tx2)', flex:1 }}>{b.title}</span>
                      {b.series && b.series !== 'Standalone' && <span style={{fontSize:11,color:'var(--tx3)'}}>currently: {b.series}</span>}
                    </label>
                  ))}
                  {(!data || data.books.length === 0) && (
                    <div style={{ padding:'.5rem 1rem', fontSize:12, color:'var(--tx3)' }}>No books in the catalog yet.</div>
                  )}
                </div>
              </div>

              <div className="panel" style={{marginTop:'.75rem'}}>
                <div className="panel-head"><span className="panel-title">New Books to Create ({newBookDrafts.length})</span></div>
                <div className="panel-body" style={{ padding:'.5rem 0' }}>
                  {newBookDrafts.map((d, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, padding:'.5rem 1rem', borderTop:'1px solid var(--border)' }}>
                      <span style={{ fontSize:12, color:'var(--tx2)', flex:1 }}>{d.title}</span>
                      <button className="btn btn-danger btn-sm" onClick={() => removeDraft(i)} title="Remove">✕</button>
                    </div>
                  ))}
                  {newBookDrafts.length === 0 && (
                    <div style={{ padding:'.5rem 1rem', fontSize:12, color:'var(--tx3)' }}>None staged yet.</div>
                  )}
                </div>
                <div className="panel-head" style={{cursor:'pointer', borderTop:'1px solid var(--border)'}} onClick={() => setShowEmbeddedAddBook(v => !v)}>
                  <span className="panel-title">+ Stage a Brand New Book</span>
                  <span style={{fontSize:12,color:'var(--tx3)'}}>{showEmbeddedAddBook ? '▲ Hide' : '▼ Show'}</span>
                </div>
                {showEmbeddedAddBook && (
                  <div className="panel-body" style={{display:'flex',flexDirection:'column',gap:0}}>
                    <div style={{background:'var(--crp)',border:'1px solid rgba(200,112,112,.25)',borderRadius:6,padding:'.5rem .85rem',margin:'.75rem 1rem 0',display:'flex',alignItems:'center',gap:'.6rem'}}>
                      <span style={{fontSize:10,fontWeight:700,color:'var(--crb)',letterSpacing:'.1em',textTransform:'uppercase',flexShrink:0}}>Auto Key</span>
                      <code style={{fontSize:12,color:'var(--crb)'}}>{newBookAutoKey || 'Type a title to generate key…'}</code>
                    </div>
                    <div className="field-row" style={{margin:'.75rem 1rem 0'}}>
                      <label className="field-label">Title <span style={{color:'var(--crb)'}}>*</span></label>
                      <input className="field-input" value={newBookForm.title||''} onChange={e=>setNewBookForm(f=>({...f,title:e.target.value}))} placeholder="e.g. The Atlas Protocol: Book 1" />
                    </div>
                    <div className="field-row" style={{margin:'.75rem 1rem 0'}}>
                      <label className="field-label">Subtitle</label>
                      <input className="field-input" value={newBookForm.subtitle||''} onChange={e=>setNewBookForm(f=>({...f,subtitle:e.target.value}))} />
                    </div>
                    <div className="two-col" style={{margin:'.75rem 1rem 0'}}>
                      <div className="field-row">
                        <label className="field-label">Genre</label>
                        <select className="field-input field-select" value={newBookForm.genre||''} onChange={e=>setNewBookForm(f=>({...f,genre:e.target.value}))}>
                          <option value="">Select genre…</option>
                          {NEW_BOOK_GENRES.map(g=><option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                      <div className="field-row">
                        <label className="field-label">Volume / Number</label>
                        <input className="field-input" value={newBookForm.vol||''} onChange={e=>setNewBookForm(f=>({...f,vol:e.target.value}))} placeholder="e.g. Vol. 1" />
                      </div>
                    </div>
                    <div className="two-col" style={{margin:'.75rem 1rem 0'}}>
                      <div className="field-row">
                        <label className="field-label">Language</label>
                        <select className="field-input field-select" value={newBookForm.lang||'EN / FR'} onChange={e=>setNewBookForm(f=>({...f,lang:e.target.value}))}>
                          <option value="EN / FR">EN / FR</option>
                          <option value="EN">English only</option>
                          <option value="EN / FR / ES">EN / FR / ES</option>
                        </select>
                      </div>
                      <div className="field-row">
                        <label className="field-label">Status</label>
                        <select className="field-input field-select" value={newBookForm.available===true?'true':'false'} onChange={e=>setNewBookForm(f=>({...f,available:e.target.value==='true'}))}>
                          <option value="false">Locked / Forthcoming</option>
                          <option value="true">Available now</option>
                        </select>
                      </div>
                    </div>
                    <div className="field-row" style={{margin:'.75rem 1rem 0'}}>
                      <label className="field-label">{newBookForm.available ? 'Price' : 'Expected Release Year'}</label>
                      <input className="field-input"
                        value={newBookForm.available ? (newBookForm.price||'') : (newBookForm.release||'')}
                        onChange={e=>setNewBookForm(f=>newBookForm.available ? {...f,price:e.target.value} : {...f,release:e.target.value})}
                        placeholder={newBookForm.available ? 'From $15.99' : '2027'} />
                    </div>
                    <div className="field-row" style={{margin:'.75rem 1rem 0'}}>
                      <label className="field-label">Synopsis (English)</label>
                      <textarea className="field-input field-textarea" style={{minHeight:60}} value={newBookForm.synopsis||''} onChange={e=>setNewBookForm(f=>({...f,synopsis:e.target.value}))} placeholder="Brief description for readers…" />
                    </div>
                    <div style={{display:'flex',justifyContent:'flex-end',padding:'.75rem 1rem'}}>
                      <button className="btn btn-s btn-sm" disabled={!newBookForm.title} onClick={stageNewBook}>
                        + Stage This Book
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-s" onClick={closeNewSeries}>Cancel</button>
              <button className="btn btn-p" onClick={createSeriesWithBooks} disabled={creatingSeries || !newSeriesForm.name.trim()}>
                {creatingSeries ? <><span className="spinner"/> Creating...</> : 'Create Series'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Publish to Live Site ───────────────────────────────────
function PublishButton({ addToast }) {
  const [publishing, setPublishing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [commitMsg, setCommitMsg] = useState('');
  const [msg, setMsg] = useState('');
  const [showMsg, setShowMsg] = useState(false);

  async function doPublish(mode = 'new') {
    setPublishing(true);
    setShowForm(false);
    try {
      const r = await fetch('/api/admin/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: commitMsg || 'Admin: content update via dashboard',
          forceRefresh: mode === 'all',
        }),
      });
      const d = await r.json();
      setMsg(d.message);
      setShowMsg(true);
      setTimeout(() => setShowMsg(false), 6000);
      if (d.success) addToast(d.deployed ? '▲ Published to live site' : '✓ Saved locally', 'success');
      else addToast(d.message, 'error');
    } catch {
      addToast('Publish failed: push manually with git push', 'error');
    }
    setPublishing(false);
    setCommitMsg('');
  }

  return (
    <div style={{position:'relative'}}>
      <button className="btn btn-p" onClick={() => setShowForm(f => !f)} disabled={publishing}
        title="Commit & push to GitHub: Vercel auto-deploys">
        {publishing ? <><span className="spinner" /> Publishing...</> : '▲ Publish to Live'}
      </button>
      {showForm && (
        <div style={{
          position:'absolute', top:'calc(100% + 8px)', right:0,
          background:'var(--surface)', border:'1px solid var(--border2)',
          borderRadius:8, padding:'1rem', minWidth:320, zIndex:100,
          boxShadow:'0 8px 32px rgba(0,0,0,.4)',
        }}>
          <div style={{fontSize:12,fontWeight:700,color:'var(--tx2)',marginBottom:'.5rem',letterSpacing:'.06em',textTransform:'uppercase'}}>
            Publish Changes
          </div>
          <div style={{fontSize:12,color:'var(--tx3)',marginBottom:'.75rem',lineHeight:1.5}}>
            What do you want to push to the live site?
          </div>
          <input className="field-input" placeholder="Optional note about what changed"
            value={commitMsg} onChange={e=>setCommitMsg(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&doPublish('new')}
            style={{marginBottom:'.75rem',fontSize:12}}/>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            <button className="btn btn-p" onClick={()=>doPublish('new')} style={{justifyContent:'center'}}>
              ▲ Publish New Changes Only
            </button>
            <button className="btn btn-warn" onClick={()=>doPublish('all')} style={{justifyContent:'center'}}>
              ↻ Refresh All Live Content
            </button>
            <button className="btn btn-s" onClick={()=>setShowForm(false)} style={{justifyContent:'center'}}>Cancel</button>
          </div>
          <div style={{fontSize:11,color:'var(--tx3)',marginTop:'.6rem',lineHeight:1.5}}>
            <strong>New Changes:</strong> pushes only what changed since last publish.<br/>
            <strong>Refresh All:</strong> forces Vercel to redeploy everything (use if public pages look outdated).
          </div>
        </div>
      )}
    </div>
  );
}

// ── Messages + Notifications Board ────────────────────────
function MessagesBoard({ toast, setUnreadCount }) {
  const [msgs, setMsgs] = useState(null);
  const [notifs, setNotifs] = useState([]);
  const [activeMsg, setActiveMsg] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [msgTab, setMsgTab] = useState('messages');

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      const r = await fetch('/api/admin/messages');
      const d = await r.json();
      setMsgs(d.messages || []);
      setNotifs(d.notifications || []);
      setUnreadCount((d.unreadMessages || 0) + (d.unreadNotifications || 0));
    } catch { setMsgs([]); setNotifs([]); }
  }

  async function patchItem(id, action, extra = {}, store = 'messages') {
    await fetch('/api/admin/messages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action, store, ...extra }),
    });
  }

  async function markRead(msg) {
    if (msg.read) return;
    await patchItem(msg.id, 'read');
    setMsgs(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }

  async function deleteItem(id, store) {
    if (!confirm('Delete this item?')) return;
    await patchItem(id, 'delete', {}, store);
    if (store === 'notifications') {
      setNotifs(prev => prev.filter(n => n.id !== id));
    } else {
      setMsgs(prev => prev.filter(m => m.id !== id));
      if (activeMsg?.id === id) setActiveMsg(null);
    }
    toast('Deleted', 'success');
  }

  async function markNotified(id) {
    await patchItem(id, 'notified', {}, 'notifications');
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, notified: true } : n));
  }

  async function saveReply(msg) {
    if (!replyText.trim()) return;
    setReplying(true);
    await patchItem(msg.id, 'reply', { replyText });
    setMsgs(prev => prev.map(m => m.id === msg.id ? { ...m, replied: true, replyText, repliedAt: new Date().toISOString() } : m));
    setActiveMsg(prev => ({ ...prev, replied: true, replyText, repliedAt: new Date().toISOString() }));
    toast('Reply saved', 'success');
    setReplyText('');
    setReplying(false);
  }

  if (!msgs) return <div className="loading-row"><span className="spinner" /> Loading messages...</div>;

  const unreadMsgCount = msgs.filter(m => !m.read).length;
  const unreadNotifCount = notifs.filter(n => !n.notified).length;

  return (
    <div>
      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: '1.25rem' }}>
        <button className={`tab-btn${msgTab === 'messages' ? ' active' : ''}`} onClick={() => { setMsgTab('messages'); setActiveMsg(null); }}>
          ✉️ Contact Messages {unreadMsgCount > 0 && <span className="sb-badge" style={{ marginLeft: 6 }}>{unreadMsgCount}</span>}
        </button>
        <button className={`tab-btn${msgTab === 'notifications' ? ' active' : ''}`} onClick={() => { setMsgTab('notifications'); setActiveMsg(null); }}>
          🔔 Release Notifications {unreadNotifCount > 0 && <span className="sb-badge" style={{ marginLeft: 6 }}>{unreadNotifCount}</span>}
        </button>
      </div>

      {/* MESSAGES TAB */}
      {msgTab === 'messages' && (
        <div style={{ display: 'flex', gap: '1rem', height: 'calc(100vh - 280px)', minHeight: 400 }}>
          {/* List */}
          <div style={{ width: 280, flexShrink: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '.65rem 1rem', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 600, color: 'var(--tx2)', display: 'flex', justifyContent: 'space-between' }}>
              <span>{msgs.length} messages · {unreadMsgCount} unread</span>
              <button className="btn btn-s btn-sm" onClick={loadAll}>↻</button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {msgs.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--tx3)', fontSize: 13 }}>No messages yet.</div>}
              {msgs.map(m => (
                <div key={m.id}
                  onClick={() => { setActiveMsg(m); markRead(m); }}
                  style={{ padding: '.65rem 1rem', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: activeMsg?.id === m.id ? 'var(--crp)' : m.read ? 'transparent' : 'rgba(122,21,21,.06)', borderLeft: m.read ? '3px solid transparent' : '3px solid var(--cr)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: m.read ? 500 : 700, color: 'var(--tx)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
                    {m.replied && <span style={{ fontSize: 9, background: 'var(--greenbg)', color: 'var(--greenb)', padding: '1px 4px', borderRadius: 2, fontWeight: 700, flexShrink: 0 }}>REPLIED</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--tx3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.subject}</div>
                  <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 2 }}>{new Date(m.receivedAt || m.date).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Detail */}
          <div style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {!activeMsg ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--tx3)', fontSize: 13 }}>Select a message</div>
            ) : (
              <>
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: 'var(--tx)', marginBottom: 4 }}>{activeMsg.subject}</div>
                    <div style={{ fontSize: 12, color: 'var(--tx3)' }}>
                      From: <strong style={{ color: 'var(--tx2)' }}>{activeMsg.name}</strong>{' '}
                      <a href={`mailto:${activeMsg.email}`} style={{ color: 'var(--crb)', textDecoration: 'none' }}>{activeMsg.email}</a>
                      {' · '}{new Date(activeMsg.receivedAt || activeMsg.date).toLocaleString()}
                    </div>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteItem(activeMsg.id, 'messages')}>Delete</button>
                </div>
                <div style={{ padding: '1.25rem', flex: 1, overflowY: 'auto' }}>
                  <div style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--tx2)', whiteSpace: 'pre-wrap', marginBottom: '1.25rem' }}>{activeMsg.message}</div>
                  {activeMsg.replied && (
                    <div style={{ background: 'var(--greenbg)', border: '1px solid rgba(74,199,122,.2)', borderRadius: 6, padding: '.75rem', marginBottom: '1rem' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--greenb)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.4rem' }}>Your Reply</div>
                      <div style={{ fontSize: 13, color: 'var(--tx2)', whiteSpace: 'pre-wrap' }}>{activeMsg.replyText}</div>
                    </div>
                  )}
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    <textarea className="field-input field-textarea" style={{ minHeight: 90, marginBottom: '.6rem' }}
                      placeholder={`Reply to ${activeMsg.name}…`} value={replyText} onChange={e => setReplyText(e.target.value)} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <a href={`mailto:${activeMsg.email}?subject=Re: ${encodeURIComponent(activeMsg.subject || '')}&body=${encodeURIComponent(replyText)}`}
                        className="btn btn-s btn-sm">✉️ Open in Email</a>
                      <button className="btn btn-p btn-sm" onClick={() => saveReply(activeMsg)} disabled={replying || !replyText.trim()}>
                        {replying ? <><span className="spinner" /> Saving…</> : 'Save Reply'}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* NOTIFICATIONS TAB */}
      {msgTab === 'notifications' && (
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">Release Notification Requests</span>
            <span style={{ fontSize: 11, color: 'var(--tx3)' }}>{notifs.length} total · {unreadNotifCount} pending</span>
          </div>
          {notifs.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🔔</div>
              <div className="empty-msg">No notification requests yet. They appear here when readers sign up for book launch alerts.</div>
            </div>
          )}
          {notifs.length > 0 && (
            <table className="tbl">
              <thead><tr><th>Email</th><th>Book</th><th>Language</th><th>Requested</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {notifs.map(n => (
                  <tr key={n.id}>
                    <td><a href={`mailto:${n.email}`} style={{ color: 'var(--crb)', textDecoration: 'none', fontSize: 12 }}>{n.email}</a></td>
                    <td style={{ fontSize: 12, color: 'var(--tx2)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.bookTitle || n.bookKey}</td>
                    <td><span className="badge badge-series" style={{ fontSize: 9 }}>{(n.lang || 'en').toUpperCase()}</span></td>
                    <td style={{ fontSize: 11, color: 'var(--tx3)' }}>{new Date(n.requestedAt).toLocaleDateString()}</td>
                    <td><span className={`badge ${n.notified ? 'badge-avail' : 'badge-locked'}`}>{n.notified ? 'Notified' : 'Pending'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {!n.notified && (
                          <button className="btn btn-g btn-sm" onClick={() => markNotified(n.id)}>✓ Mark Notified</button>
                        )}
                        <button className="btn btn-danger btn-sm" onClick={() => deleteItem(n.id, 'notifications')}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// ── Site Lock Panel ────────────────────────────────────────
function SiteLockPanel({ siteLocked, setSiteLocked, toast }) {
  const [toggling, setToggling] = useState(false);

  async function toggleLock() {
    setToggling(true);
    try {
      const r = await fetch('/api/admin/sitelock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locked: !siteLocked }),
      });
      const d = await r.json();
      if (d.success) {
        setSiteLocked(d.locked);
        toast(
          d.locked
            ? 'Website locked: visitors see the Coming Soon screen'
            : 'Website unlocked: full site is visible to all visitors',
          d.locked ? 'warning' : 'success'
        );
      } else {
        toast(d.error || 'Failed to change lock status', 'error');
      }
    } catch {
      toast('Connection error', 'error');
    }
    setToggling(false);
  }

  const isLocked = siteLocked === true;

  return (
    <div>
      <div className="panel" style={{ marginBottom:'1.25rem' }}>
        <div className="panel-head"><span className="panel-title">Website Status</span></div>
        <div className="panel-body">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
              <div style={{
                width:56, height:56, borderRadius:'50%',
                background: isLocked ? 'var(--amberbg)' : 'var(--greenbg)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:24, flexShrink:0,
              }}>
                {isLocked ? '🔒' : '🌐'}
              </div>
              <div>
                <div style={{ fontSize:18, fontWeight:700, color: isLocked ? 'var(--amberb)' : 'var(--greenb)', marginBottom:4 }}>
                  {siteLocked === null ? 'Loading…' : isLocked ? 'Site Locked' : 'Site Live'}
                </div>
                <div style={{ fontSize:13, color:'var(--tx2)' }}>
                  {isLocked
                    ? 'Visitors see the Coming Soon screen. The site is not accessible.'
                    : 'The full site is visible to all visitors at spyontherise.com.'}
                </div>
              </div>
            </div>
            <button
              className={`btn ${isLocked ? 'btn-g' : 'btn-warn'}`}
              style={{ minWidth:160, justifyContent:'center', padding:'.7rem 1.5rem', fontSize:14 }}
              onClick={toggleLock}
              disabled={toggling || siteLocked === null}>
              {toggling
                ? <><span className="spinner"/> Updating…</>
                : isLocked ? '🌐 Unlock: Go Live' : '🔒 Lock: Coming Soon'}
            </button>
          </div>
        </div>
      </div>

      <div className="two-col">
        <div className="panel">
          <div className="panel-head"><span className="panel-title" style={{ color:'var(--amberb)' }}>🔒 When Locked</span></div>
          <div className="panel-body" style={{ fontSize:13, color:'var(--tx2)', lineHeight:1.9 }}>
            Visitors to spyontherise.com see a branded Coming Soon screen with no
            access to the catalog, books, or any site content.<br/><br/>
            <strong style={{ color:'var(--tx)' }}>Full site still accessible via:</strong><br/>
            sotr-production.vercel.app: always open<br/>
            spyontherise.com/?preview=sotr2026: bypass on main domain<br/>
            localhost:3000: always open in development
          </div>
        </div>
        <div className="panel">
          <div className="panel-head"><span className="panel-title" style={{ color:'var(--greenb)' }}>🌐 When Live</span></div>
          <div className="panel-body" style={{ fontSize:13, color:'var(--tx2)', lineHeight:1.9 }}>
            All visitors see the full site with the complete catalog,
            book cards, series pages, bundles, and all features.<br/><br/>
            <strong style={{ color:'var(--tx)' }}>The admin dashboard is always accessible</strong>
            {' '}regardless of lock status, the lock only affects public pages.
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><span className="panel-title">Quick Access</span></div>
        <div className="panel-body" style={{ display:'flex', gap:'.75rem', flexWrap:'wrap' }}>
          <a href="https://spyontherise.com" target="_blank" rel="noopener" className="btn btn-s">🌐 spyontherise.com</a>
          <a href="https://spyontherise.com/?preview=sotr2026" target="_blank" rel="noopener" className="btn btn-s">👁 Preview bypass</a>
          <a href="https://sotr-production.vercel.app" target="_blank" rel="noopener" className="btn btn-s">▲ Vercel preview URL</a>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [auth, setAuth] = useState(null); // null=checking, false=login, true=dashboard
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [filterSeries, setFilterSeries] = useState('all');
  const [filterAvail, setFilterAvail] = useState('all');
  const [editBook, setEditBook] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [synopsisBook, setSynopsisBook] = useState(null);
  const [synopsisForm, setSynopsisForm] = useState({ en:'', fr:'', es:'', links:{} });
  const [toasts, setToasts] = useState([]);
  const [activeTab, setActiveTab] = useState('en');
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ current:'', next:'', confirm:'' });
  const [pwMsg, setPwMsg] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [fwdEmail, setFwdEmail] = useState('');
  const [fwdMsg, setFwdMsg] = useState(null);
  const [footerForm, setFooterForm] = useState({
    socialLinks: { instagram:'', x:'', linkedin:'', facebook:'', youtube:'', tiktok:'' },
    tagline_en:'', tagline_fr:'', tagline_es:'',
  });
  const [footerMsg, setFooterMsg] = useState(null);
  const [footerSaving, setFooterSaving] = useState(false);
  const [showAddTitle, setShowAddTitle] = useState(false);
  const [addForm, setAddForm] = useState({});
  const [addSaving, setAddSaving] = useState(false);
  const [autoKey, setAutoKey] = useState('');
  const [siteLocked, setSiteLocked] = useState(null);
  const [lockToggling, setLockToggling] = useState(false);
  const [texts, setTexts] = useState([]);
  const [textsLoading, setTextsLoading] = useState(false);
  const [editText, setEditText] = useState(null);
  const [textForm, setTextForm] = useState({});
  const [textSaving, setTextSaving] = useState(false);
  const [textTab, setTextTab] = useState('en');

  // ── Auth check ──────────────────────────────────────────
  useEffect(() => {
    fetch('/api/admin/verify')
      .then(r => r.json())
      .then(d => setAuth(d.authenticated ? true : false))
      .catch(() => setAuth(false));
  }, []);

  // ── Load catalog ────────────────────────────────────────
  const loadCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/catalog');
      if (!r.ok) { setAuth(false); return; }
      const d = await r.json();
      setData(d);
      if (typeof d.siteLocked === 'boolean') setSiteLocked(d.siteLocked);
    } catch (e) {
      toast('Failed to load catalog data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (auth === true) loadCatalog(); }, [auth, loadCatalog]);

  // Load unread message + notification count
  useEffect(() => {
    if (auth !== true) return;
    fetch('/api/admin/messages').then(r=>r.json()).then(d=>{
      setUnreadCount((d.unreadMessages||0) + (d.unreadNotifications||0));
    }).catch(()=>{});
  }, [auth]);

  // Load config when settings section opens
  useEffect(() => {
    if (activeSection !== 'settings' || auth !== true) return;
    fetch('/api/admin/config').then(r=>r.json()).then(d=>{
      const cfg = d.config || {};
      setFwdEmail(cfg.forwardEmail || d.forwardEmail || '');
      setFooterForm({
        socialLinks: {
          instagram:'', x:'', linkedin:'', facebook:'', youtube:'', tiktok:'',
          ...(cfg.socialLinks || {}),
        },
        tagline_en: cfg.footerTagline?.en || '',
        tagline_fr: cfg.footerTagline?.fr || '',
        tagline_es: cfg.footerTagline?.es || '',
      });
    }).catch(()=>{});
  }, [activeSection, auth]);

  // Load texts when texts section opens
  useEffect(() => {
    if (activeSection === 'texts') {
      setTextsLoading(true);
      fetch('/api/admin/texts')
        .then(r => r.json())
        .then(d => setTexts(d.texts || []))
        .catch(() => {})
        .finally(() => setTextsLoading(false));
    }
  }, [activeSection]);

  // Auto-generate book key as user types title
  useEffect(() => {
    if (!addForm.title || addForm.title.length < 3) { setAutoKey(''); return; }
    const timer = setTimeout(() => {
      fetch('/api/admin/add-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ previewKey: addForm.title }),
      })
        .then(r => r.json())
        .then(d => { if (d.key) setAutoKey(d.key); })
        .catch(() => {});
    }, 400);
    return () => clearTimeout(timer);
  }, [addForm.title]);

  // ── Toast ────────────────────────────────────────────────
  const toast = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  // ── Login ────────────────────────────────────────────────
  async function doLogin(e) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const r = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const d = await r.json();
      if (d.success) { setAuth(true); setPassword(''); }
      else setLoginError(d.error || 'Invalid password');
    } catch { setLoginError('Connection error'); }
    setLoginLoading(false);
  }

  // ── Logout ───────────────────────────────────────────────
  async function doLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAuth(false);
    setData(null);
  }

  // ── Toggle availability ──────────────────────────────────
  async function toggleAvail(key, currentState) {
    try {
      const r = await fetch('/api/admin/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', key }),
      });
      const d = await r.json();
      if (d.success) {
        toast(`${key} → ${currentState ? 'locked' : 'unlocked'}, live in ~10s`, 'success');
        await loadCatalog();
      } else toast(d.error, 'error');
    } catch { toast('Failed to toggle availability', 'error'); }
  }

  // ── Save book edits ──────────────────────────────────────
  async function saveBookEdit() {
    if (!editBook) return;
    setSaving(true);
    try {
      const r = await fetch('/api/admin/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', key: editBook.key, updates: editForm }),
      });
      const d = await r.json();
      if (d.success) {
        toast('Book updated, live in ~10s', 'success');
        setEditBook(null);
        await loadCatalog();
      } else toast(d.error, 'error');
    } catch { toast('Failed to save changes', 'error'); }
    setSaving(false);
  }

  // ── Save synopsis ────────────────────────────────────────
  async function saveSynopsis() {
    if (!synopsisBook) return;
    setSaving(true);
    try {
      const r = await fetch('/api/admin/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'synopsis', key: synopsisBook.key, synopsis: { en:synopsisForm.en, fr:synopsisForm.fr, es:synopsisForm.es }, links: synopsisForm.links }),
      });
      const d = await r.json();
      if (d.success) {
        toast('Synopsis saved, live in ~10s', 'success');
        setSynopsisBook(null);
        await loadCatalog();
      } else toast(d.error, 'error');
    } catch { toast('Failed to save synopsis', 'error'); }
    setSaving(false);
  }

  // ── Change password ──────────────────────────────────────
  async function changePassword() {
    setPwMsg(null);
    if (!pwForm.current || !pwForm.next) { setPwMsg({ type:'error', text:'All fields required.' }); return; }
    if (pwForm.next !== pwForm.confirm) { setPwMsg({ type:'error', text:'New passwords do not match.' }); return; }
    if (pwForm.next.length < 8) { setPwMsg({ type:'error', text:'Password must be at least 8 characters.' }); return; }
    try {
      const r = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current: pwForm.current, next: pwForm.next }),
      });
      const d = await r.json();
      if (d.success) {
        setPwMsg({ type:'success', text: d.message });
        setPwForm({ current:'', next:'', confirm:'' });
      } else {
        setPwMsg({ type:'error', text: d.error });
      }
    } catch { setPwMsg({ type:'error', text:'Request failed.' }); }
  }

  // ── Save forwarding email ────────────────────────────────
  async function saveForwardEmail() {
    setFwdMsg(null);
    try {
      const r = await fetch('/api/admin/config', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forwardEmail: fwdEmail.trim() }),
      });
      const d = await r.json();
      if (d.success) setFwdMsg({ type:'success', text:'Forwarding email saved.' });
      else setFwdMsg({ type:'error', text: d.error || 'Save failed.' });
    } catch { setFwdMsg({ type:'error', text:'Request failed.' }); }
  }

  // ── Save footer settings (social links + tagline) ────────
  async function saveFooterSettings() {
    setFooterMsg(null);
    setFooterSaving(true);
    try {
      const r = await fetch('/api/admin/config', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          socialLinks: footerForm.socialLinks,
          footerTagline: { en: footerForm.tagline_en, fr: footerForm.tagline_fr, es: footerForm.tagline_es },
        }),
      });
      const d = await r.json();
      if (d.success) setFooterMsg({ type:'success', text:'Footer settings saved, live in ~10s.' });
      else setFooterMsg({ type:'error', text: d.error || 'Save failed.' });
    } catch { setFooterMsg({ type:'error', text:'Request failed.' }); }
    setFooterSaving(false);
  }

  // ── Restore backup ───────────────────────────────────────
  async function restoreBackup(filename) {
    if (!confirm(`Restore catalog from ${filename}?\nCurrent catalog will be backed up first.`)) return;
    try {
      const r = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
      });
      const d = await r.json();
      if (d.success) { toast('Catalog restored', 'success'); await loadCatalog(); }
      else toast(d.error, 'error');
    } catch { toast('Restore failed', 'error'); }
  }

  const [creatingBackup, setCreatingBackup] = useState(false);
  async function createBackupNow() {
    setCreatingBackup(true);
    try {
      const r = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create' }),
      });
      const d = await r.json();
      if (d.success) { toast('Backup created', 'success'); await loadCatalog(); }
      else toast(d.error || 'Backup failed', 'error');
    } catch { toast('Backup failed', 'error'); }
    setCreatingBackup(false);
  }

  // ── Filtered books ───────────────────────────────────────
  const filteredBooks = data ? data.books.filter(b => {
    const q = searchQ.toLowerCase();
    const matchQ = !q || b.title.toLowerCase().includes(q) || b.genre.toLowerCase().includes(q) ||
      b.series.toLowerCase().includes(q) || b.key.toLowerCase().includes(q);
    const matchSeries = filterSeries === 'all' || b.seriesKey === filterSeries || (!b.seriesKey && filterSeries === 'standalone');
    const matchAvail = filterAvail === 'all' || (filterAvail === 'available' ? b.available : !b.available);
    return matchQ && matchSeries && matchAvail;
  }) : [];

  // ════════════════════════════════════════════════════════
  // LOGIN SCREEN
  // ════════════════════════════════════════════════════════
  if (auth === null) return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0D0D0D', fontFamily:'Source Sans 3, system-ui, sans-serif' }}>
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
            <div className="login-sub">Admin Dashboard</div>
          </div>
          <form onSubmit={doLogin}>
            <div className="field-row">
              <label className="field-label">Password</label>
              <input
                type="password" className="field-input" autoFocus
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
              />
            </div>
            {loginError && <div className="login-error">{loginError}</div>}
            <button type="submit" className="btn btn-p" style={{ width:'100%', justifyContent:'center', padding:'.65rem' }} disabled={loginLoading}>
              {loginLoading ? <span className="spinner" /> : 'Sign In'}
            </button>
          </form>
          <div className="login-hint">
            Set password via ADMIN_PASSWORD in .env.local
          </div>
        </div>
      </div>
    </>
  );

  // ════════════════════════════════════════════════════════
  // DASHBOARD SECTIONS
  // ════════════════════════════════════════════════════════

  function renderDashboard() {
    if (!data) return <div className="loading-row"><span className="spinner" /> Loading catalog data...</div>;
    const { stats } = data;
    return (
      <div>
        <div className="stats-row">
          <div className="stat-card" style={{ '--accent':'#C87070' }}>
            <div className="stat-n">{stats.totalTitles}</div>
            <div className="stat-l">Total Titles</div>
            <div className="stat-sub">{stats.availableTitles} available · {stats.lockedTitles} locked</div>
          </div>
          <div className="stat-card" style={{ '--accent':'#4AC77A' }}>
            <div className="stat-n">{stats.availableTitles}</div>
            <div className="stat-l">Published</div>
            <div className="stat-sub">Live to readers now</div>
          </div>
          <div className="stat-card" style={{ '--accent':'#D4A820' }}>
            <div className="stat-n">{stats.lockedTitles}</div>
            <div className="stat-l">In Pipeline</div>
            <div className="stat-sub">Forthcoming titles</div>
          </div>
          <div className="stat-card" style={{ '--accent':'#5B9BD4' }}>
            <div className="stat-n">{stats.totalSeries}</div>
            <div className="stat-l">Series</div>
            <div className="stat-sub">{stats.totalBundles} bundle offers</div>
          </div>
        </div>

        <div className="two-col">
          <div className="panel">
            <div className="panel-head">
              <span className="panel-title">Series Overview</span>
              <button className="btn btn-s btn-sm" onClick={() => setActiveSection('catalog')}>View All</button>
            </div>
            <div className="panel-body" style={{ padding:0 }}>
              <table className="tbl">
                <thead><tr><th>Series</th><th>Available</th><th>Locked</th><th>Total</th></tr></thead>
                <tbody>
                  {data.series.map(s => (
                    <tr key={s.key}>
                      <td><span className="badge badge-series">{s.name}</span></td>
                      <td><span style={{ color:'var(--greenb)', fontWeight:600 }}>{s.available}</span></td>
                      <td><span style={{ color:'var(--amberb)' }}>{s.locked}</span></td>
                      <td style={{ color:'var(--tx3)' }}>{s.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <span className="panel-title">Genre Breakdown</span>
            </div>
            <div className="panel-body">
              {Object.entries(stats.genreBreakdown || {}).sort((a,b) => b[1]-a[1]).map(([genre, count]) => (
                <div key={genre} style={{ marginBottom:'.6rem' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'.2rem' }}>
                    <span style={{ fontSize:12, color:'var(--tx2)' }}>{genre}</span>
                    <span style={{ fontSize:12, fontWeight:600, color:'var(--tx)' }}>{count}</span>
                  </div>
                  <div style={{ height:4, background:'var(--border)', borderRadius:2, overflow:'hidden' }}>
                    <div style={{ height:'100%', background:'var(--cr)', borderRadius:2, width:`${(count/stats.totalTitles)*100}%`, transition:'width .5s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">Quick Actions</span>
          </div>
          <div className="panel-body" style={{ display:'flex', gap:'.75rem', flexWrap:'wrap' }}>
            <button className="btn btn-p" onClick={() => setActiveSection('catalog')}>📚 Manage Catalog</button>
            <button className="btn btn-s" onClick={() => setActiveSection('synopses')}>✍️ Edit Synopses</button>
            <button className="btn btn-s" onClick={() => setActiveSection('availability')}>🔓 Toggle Availability</button>
            <button className="btn btn-warn" onClick={() => setActiveSection('backups')}>💾 Backups</button>
            <a href="/" target="_blank" rel="noopener" className="btn btn-s">🌐 View Live Site</a>
            <a href="https://vercel.com" target="_blank" rel="noopener" className="btn btn-s">▲ Vercel Dashboard</a>
            <a href="https://analytics.google.com" target="_blank" rel="noopener" className="btn btn-s">📊 Analytics</a>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><span className="panel-title">Catalog Last Modified</span></div>
          <div className="panel-body">
            <span style={{ fontSize:13, color:'var(--tx3)' }}>{stats.lastModified ? new Date(stats.lastModified).toLocaleString() : 'N/A'}</span>
          </div>
        </div>
      </div>
    );
  }

  function renderCatalog() {
    return (
      <div>
        <div className="panel" style={{ marginBottom:'1rem' }}>
          <div className="panel-body" style={{ display:'flex', gap:.5, flexWrap:'wrap', alignItems:'center', padding:'.75rem' }}>
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input className="field-input search-inp" placeholder="Search titles, keys, genres…"
                value={searchQ} onChange={e => setSearchQ(e.target.value)} />
            </div>
            <select className="field-input field-select" style={{ width:'auto', marginLeft:'.5rem' }}
              value={filterSeries} onChange={e => setFilterSeries(e.target.value)}>
              <option value="all">All Series</option>
              <option value="mercer">The Mercer Files</option>
              <option value="anatomy">Anatomy of Micro-Societies</option>
              <option value="crooked">Crooked Cross Chronicles</option>
              <option value="ir">IR Theory Works</option>
              <option value="poetry">Poetry</option>
              <option value="little">Mr / Ms Little</option>
              <option value="standalone">Standalone</option>
            </select>
            <select className="field-input field-select" style={{ width:'auto', marginLeft:'.5rem' }}
              value={filterAvail} onChange={e => setFilterAvail(e.target.value)}>
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="locked">Locked</option>
            </select>
            <span style={{ marginLeft:'auto', fontSize:12, color:'var(--tx3)' }}>{filteredBooks.length} titles</span>
            <button className="btn btn-p btn-sm" onClick={() => { setAddForm({}); setAutoKey(''); setShowAddTitle(true); }}>+ Add Title</button>
          </div>
        </div>

        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width:50 }}>Cover</th>
                <th>Key</th>
                <th>Title</th>
                <th>Series</th>
                <th>Genre</th>
                <th>Status</th>
                <th>Price</th>
                <th style={{ width:120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign:'center', padding:'2rem', color:'var(--tx3)' }}>No titles match your filters</td></tr>
              )}
              {filteredBooks.map(b => (
                <tr key={b.key}>
                  <td>
                    <div
                      style={{width:32,height:48,borderRadius:2,background:b.color||'#1C1C1C',
                        display:'flex',alignItems:'center',justifyContent:'center',
                        fontSize:8,color:'rgba(255,255,255,.4)',cursor:'pointer',
                        overflow:'hidden',position:'relative',flexShrink:0}}
                      title="Click to upload cover image"
                      onClick={()=>document.getElementById(`cover-input-${b.key}`).click()}>
                      {b.image
                        ? <img src={b.image} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                        : <span style={{opacity:.5}}>{b.orn||'◆'}</span>}
                      <input id={`cover-input-${b.key}`} type="file" accept="image/jpeg,image/png,image/webp"
                        style={{display:'none'}}
                        onChange={async(e)=>{
                          const file=e.target.files[0]; if(!file)return;
                          const fd=new FormData();
                          fd.append('bookKey',b.key);
                          fd.append('cover',file);
                          toast('Uploading cover...','warning');
                          try{
                            const r=await fetch('/api/admin/upload-image',{method:'POST',body:fd});
                            const d=await r.json();
                            if(d.success){toast(`Cover uploaded for ${b.title}`,'success');await loadCatalog();}
                            else toast(d.error||'Upload failed','error');
                          }catch{toast('Upload failed','error');}
                          e.target.value='';
                        }}/>
                    </div>
                  </td>
                  <td><code style={{ fontSize:11, color:'var(--tx3)', background:'var(--surface2)', padding:'1px 5px', borderRadius:3 }}>{b.key}</code></td>
                  <td>
                    <div style={{ fontWeight:500, color:'var(--tx)', marginBottom:1 }}>{b.title}</div>
                    {b.subtitle && <div style={{ fontSize:11, color:'var(--tx3)' }}>{b.subtitle}</div>}
                  </td>
                  <td><span className="badge badge-series" style={{ fontSize:10 }}>{b.series?.replace('Anatomy of Micro-Societies','AMS').replace('The Mercer Files','Mercer').replace('The Crooked Cross Chronicles','CCC') || 'N/A'}</span></td>
                  <td><span className="badge badge-genre">{b.genre}</span></td>
                  <td>
                    <button className="avail-toggle" onClick={() => toggleAvail(b.key, b.available)}>
                      <span className={`badge ${b.available ? 'badge-avail' : 'badge-locked'}`}>
                        {b.available ? '✓ Live' : '🔒 Locked'}
                      </span>
                    </button>
                    {b.hidden && <span className="badge" style={{background:'rgba(139,26,26,.15)',color:'var(--redb)',marginLeft:4}}>Hidden</span>}
                  </td>
                  <td style={{ fontSize:12, color:'var(--tx3)' }}>{b.price}</td>
                  <td>
                    <div style={{ display:'flex', gap:4 }}>
                      <button className="btn btn-s btn-sm btn-icon" title="Edit book details"
                        onClick={() => { setEditBook(b); setEditForm({ title:b.title, subtitle:b.subtitle, price:b.price, release:b.release, color:b.color, lang:b.lang, genre:b.genre, vol:b.vol, pages:b.pages, series:b.series, seriesKey:b.seriesKey }); }}>
                        ✏️
                      </button>
                      <button className="btn btn-s btn-sm btn-icon" title="Edit synopses"
                        onClick={() => { setSynopsisBook(b); setSynopsisForm({ en:b.synopsis_en||b.synopsis||'', fr:b.synopsis_fr||'', es:b.synopsis_es||'', links:b.links||{} }); setActiveTab('en'); }}>
                        📝
                      </button>
                      <button className="btn btn-s btn-sm btn-icon"
                        title={b.hidden ? 'Show on public site' : 'Hide from public site'}
                        style={{ opacity: b.hidden ? 1 : 0.7 }}
                        onClick={async () => {
                          try {
                            const r = await fetch('/api/admin/book', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ action: 'hide', key: b.key }),
                            });
                            const d = await r.json();
                            if (d.success) {
                              toast(`${b.key}: ${d.hidden ? 'hidden from public' : 'visible to public'}`, 'success');
                              await loadCatalog();
                            } else toast(d.error, 'error');
                          } catch { toast('Failed', 'error'); }
                        }}>
                        {b.hidden ? '👁' : '🙈'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function renderAvailability() {
    const available = data ? data.books.filter(b => b.available) : [];
    const locked = data ? data.books.filter(b => !b.available) : [];
    return (
      <div className="two-col">
        <div>
          <div className="panel">
            <div className="panel-head">
              <span className="panel-title" style={{ color:'var(--greenb)' }}>✓ Live to Readers ({available.length})</span>
            </div>
            <div style={{ padding:0 }}>
              {available.map(b => (
                <div key={b.key} style={{ display:'flex', alignItems:'center', gap:.75, padding:'.6rem 1rem', borderTop:'1px solid var(--border)' }}>
                  <div className="cover-mini" style={{ background:b.color||'#1C1C1C' }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:500, color:'var(--tx)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{b.title}</div>
                    <div style={{ fontSize:10, color:'var(--tx3)' }}>{b.series}</div>
                  </div>
                  <button className="btn btn-warn btn-sm" onClick={() => toggleAvail(b.key, true)}>Lock</button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="panel">
            <div className="panel-head">
              <span className="panel-title" style={{ color:'var(--amberb)' }}>🔒 Locked / Forthcoming ({locked.length})</span>
            </div>
            <div style={{ padding:0 }}>
              {locked.map(b => (
                <div key={b.key} style={{ display:'flex', alignItems:'center', gap:.75, padding:'.6rem 1rem', borderTop:'1px solid var(--border)' }}>
                  <div className="cover-mini" style={{ background:b.color||'#1C1C1C', filter:'grayscale(.7)' }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:500, color:'var(--tx2)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{b.title}</div>
                    <div style={{ fontSize:10, color:'var(--tx3)' }}>{b.release ? `Expected ${b.release}` : b.series}</div>
                  </div>
                  <button className="btn btn-g btn-sm" onClick={() => toggleAvail(b.key, false)}>Unlock</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderSynopses() {
    return (
      <div>
        <div className="panel" style={{ marginBottom:'1rem', padding:'.75rem 1rem' }}>
          <span style={{ fontSize:13, color:'var(--tx2)' }}>
            Click <strong>📝</strong> next to any title to edit its synopsis in all three languages. Changes are saved to <code>data/catalog.js</code> with automatic backup.
          </span>
        </div>
        {renderCatalog()}
      </div>
    );
  }

  function renderBackups() {
    const backups = data?.backups || [];
    return (
      <div>
        <div className="panel" style={{ marginBottom:'1rem' }}>
          <div className="panel-head">
            <span className="panel-title">Catalog Backups</span>
            <button className="btn btn-p btn-sm" onClick={createBackupNow} disabled={creatingBackup}>
              {creatingBackup ? <><span className="spinner"/> Creating...</> : '+ Create New Backup'}
            </button>
          </div>
          <div className="panel-body">
            <p style={{ fontSize:13, color:'var(--tx2)', marginBottom:'1rem', lineHeight:1.6 }}>
              A backup is created automatically before every save operation, or on demand with the button above. You can restore any backup: the current catalog is backed up first before restoring. Keep the last 20 backups maximum.
            </p>
            {backups.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">💾</div><div className="empty-msg">No backups yet: they are created automatically on first save.</div></div>
            ) : (
              <table className="tbl">
                <thead><tr><th>Backup File</th><th>Date</th><th>Size</th><th>Action</th></tr></thead>
                <tbody>
                  {backups.map(b => (
                    <tr key={b.filename}>
                      <td><code style={{ fontSize:11 }}>{b.filename}</code></td>
                      <td style={{ fontSize:12, color:'var(--tx3)' }}>{b.date}</td>
                      <td style={{ fontSize:12, color:'var(--tx3)' }}>{(b.size / 1024).toFixed(1)} KB</td>
                      <td><button className="btn btn-warn btn-sm" onClick={() => restoreBackup(b.filename)}>Restore</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderSettings() {
    return (
      <div className="two-col">
        <div className="panel">
          <div className="panel-head"><span className="panel-title">Change Admin Password</span></div>
          <div className="panel-body">
            {pwMsg && <div className={pwMsg.type === 'success' ? 'success-box' : 'error-box'} style={{ marginBottom:'1rem' }}>{pwMsg.text}</div>}
            <div className="field-row">
              <label className="field-label">Current Password</label>
              <input className="field-input" type="password" value={pwForm.current} onChange={e => setPwForm(f => ({...f,current:e.target.value}))} autoComplete="current-password" />
            </div>
            <div className="field-row">
              <label className="field-label">New Password</label>
              <input className="field-input" type="password" value={pwForm.next} onChange={e => setPwForm(f => ({...f,next:e.target.value}))} autoComplete="new-password" />
            </div>
            <div className="field-row">
              <label className="field-label">Confirm New Password</label>
              <input className="field-input" type="password" value={pwForm.confirm} onChange={e => setPwForm(f => ({...f,confirm:e.target.value}))} autoComplete="new-password" />
            </div>
            <button className="btn btn-p" onClick={changePassword} style={{ marginTop:'.5rem' }}>Update Password</button>
            <p style={{ fontSize:11, color:'var(--tx3)', marginTop:'.75rem', lineHeight:1.5 }}>
              In production: also update ADMIN_PASSWORD in Vercel Environment Variables.
            </p>
          </div>
        </div>
        <div className="panel" style={{marginBottom:'1.25rem'}}>
          <div className="panel-head"><span className="panel-title">Contact Forwarding Email</span></div>
          <div className="panel-body">
            <p style={{fontSize:12,color:'var(--tx3)',marginBottom:'1rem',lineHeight:1.6}}>
              Set an email address to receive a copy of reader contact messages. Requires Resend or SendGrid to be configured.
            </p>
            {fwdMsg && <div className={fwdMsg.type==='success'?'success-box':'error-box'} style={{marginBottom:'1rem'}}>{fwdMsg.text}</div>}
            <div className="field-row">
              <label className="field-label">Forwarding Email Address</label>
              <input className="field-input" type="email" value={fwdEmail} onChange={e=>setFwdEmail(e.target.value)} placeholder="contact@spyontherise.com" />
            </div>
            <button className="btn btn-p" onClick={saveForwardEmail} style={{marginTop:'.25rem'}}>Save Forwarding Email</button>
          </div>
        </div>
        <div className="panel" style={{ gridColumn:'1 / -1' }}>
          <div className="panel-head"><span className="panel-title">Footer: Social Links &amp; Tagline</span></div>
          <div className="panel-body">
            <p style={{fontSize:12,color:'var(--tx3)',marginBottom:'1rem',lineHeight:1.6}}>
              Leave a field blank to hide that social icon in the footer. Changes go live within ~10 seconds of saving.
            </p>
            {footerMsg && <div className={footerMsg.type==='success'?'success-box':'error-box'} style={{marginBottom:'1rem'}}>{footerMsg.text}</div>}
            <div className="two-col">
              {[
                ['instagram','Instagram'],['x','X (Twitter)'],['linkedin','LinkedIn'],
                ['facebook','Facebook'],['youtube','YouTube'],['tiktok','TikTok'],
              ].map(([key,label]) => (
                <div className="field-row" key={key}>
                  <label className="field-label">{label}</label>
                  <input className="field-input" type="url" placeholder="https://"
                    value={footerForm.socialLinks[key] || ''}
                    onChange={e => setFooterForm(f => ({...f, socialLinks:{...f.socialLinks,[key]:e.target.value}}))} />
                </div>
              ))}
            </div>
            <div className="field-row" style={{marginTop:'.5rem'}}>
              <label className="field-label">Footer Tagline (EN)</label>
              <input className="field-input" value={footerForm.tagline_en} onChange={e=>setFooterForm(f=>({...f,tagline_en:e.target.value}))} placeholder="Publishing work that refuses easy categories. Bilingual. Independent. Uncompromising." />
            </div>
            <div className="field-row">
              <label className="field-label">Footer Tagline (FR)</label>
              <input className="field-input" value={footerForm.tagline_fr} onChange={e=>setFooterForm(f=>({...f,tagline_fr:e.target.value}))} />
            </div>
            <div className="field-row">
              <label className="field-label">Footer Tagline (ES)</label>
              <input className="field-input" value={footerForm.tagline_es} onChange={e=>setFooterForm(f=>({...f,tagline_es:e.target.value}))} />
            </div>
            <button className="btn btn-p" onClick={saveFooterSettings} disabled={footerSaving} style={{marginTop:'.25rem'}}>
              {footerSaving ? <><span className="spinner"/> Saving...</> : 'Save Footer Settings'}
            </button>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head"><span className="panel-title">External Services</span></div>
          <div className="panel-body" style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
            {[
              ['▲ Vercel Dashboard', 'https://vercel.com', 'Deployments, environment variables, domain management'],
              ['⬡ GitHub Repository', 'https://github.com/pjsjems/spyontherise-website', 'Source code, commit history'],
              ['📊 Google Analytics', 'https://analytics.google.com', 'Reader traffic and behavior'],
              ['🔍 Search Console', 'https://search.google.com/search-console', 'SEO and indexing status'],
              ['✉️ Mailchimp', 'https://mailchimp.com', 'Newsletter subscribers'],
              ['⚡ Sanity Studio', 'https://www.sanity.io/manage', 'CMS (Phase 2)'],
            ].map(([label, url, desc]) => (
              <a key={url} href={url} target="_blank" rel="noopener" style={{ display:'block', padding:'.7rem', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'var(--r2)', transition:'border-color .15s' }}>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--tx)', marginBottom:2 }}>{label}</div>
                <div style={{ fontSize:11, color:'var(--tx3)' }}>{desc}</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderTexts() {
    // 9 preset categories, translated so grouping stays consistent while
    // each language shows its own label. [en, fr, es] per row.
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

    // Drafts autosave to localStorage as the admin types, so the form can
    // never lose in-progress work — it's only cleared once a real Save
    // succeeds. "text-draft-new" holds whatever brand-new text is in
    // progress; existing texts get their own key by id.
    const NEW_DRAFT_KEY = 'sotr-text-draft-new';
    const isNewDraft = editText !== null && Object.keys(editText).length === 0;
    const draftKey = textForm.id ? (isNewDraft ? NEW_DRAFT_KEY : `sotr-text-draft-${textForm.id}`) : null;

    function loadDraft(key) {
      try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch { return null; }
    }
    function persistDraft(key, data) {
      try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
    }
    function clearDraft(key) {
      try { localStorage.removeItem(key); } catch {}
    }
    // Every field change goes through this so the draft is always current.
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
        author:'Jems S. Pompée', publishedAt: new Date().toISOString().slice(0,10), featured: false,
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
        // Migrate legacy single-category/single-attachment records so
        // editing them doesn't lose what was already there.
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
      if (!textForm.id || !textForm.title_en) { toast('Title (EN) is required','error'); return; }
      // If "+ Add New Category" was opened but never confirmed with "Set",
      // resolve it here instead of saving the literal "__new__" marker.
      const payload = { ...textForm };
      ['en','fr','es'].forEach(l => {
        if (payload[`category_${l}`] === '__new__') {
          payload[`category_${l}`] = payload[`customCategory_${l}`] || '';
        }
        delete payload[`customCategory_${l}`];
      });
      setTextSaving(true);
      try {
        const r = await fetch('/api/admin/texts', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ action:'save', text: payload }),
        });
        const d = await r.json();
        if (d.success) {
          toast('Text saved','success');
          clearDraft(draftKey);
          setEditText(null);
          const r2 = await fetch('/api/admin/texts');
          const d2 = await r2.json();
          setTexts(Array.isArray(d2.texts) ? d2.texts : []);
        } else toast(d.error||'Save failed','error');
      } catch { toast('Error saving text','error'); }
      setTextSaving(false);
    }

    async function featureText(id) {
      try {
        await fetch('/api/admin/texts', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'feature', id }) });
        const r = await fetch('/api/admin/texts');
        const d = await r.json();
        setTexts(Array.isArray(d.texts) ? d.texts : []);
        toast('Featured text updated','success');
      } catch { toast('Error','error'); }
    }

    async function deleteText(id, title) {
      if (!confirm(`Delete "${title}"?`)) return;
      try {
        await fetch('/api/admin/texts', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'delete', id }) });
        setTexts(prev => prev.filter(t => t.id !== id));
        toast('Deleted','success');
      } catch { toast('Error','error'); }
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

    const lang = textTab;
    const catField = `category_${lang}`;
    const customField = `customCategory_${lang}`;
    const attField = `hasAttachment_${lang}`;
    const attNameField = `attachmentName_${lang}`;
    const catIdx = CAT_IDX[lang] ?? 0;

    return (
      <div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
          <span style={{fontSize:13,color:'var(--tx3)'}}>{texts.length} texts · <a href="/textes" target="_blank" rel="noopener" style={{color:'var(--crb)'}}>View public page →</a></span>
          <button className="btn btn-p" onClick={openNew}>+ New Text</button>
        </div>

        {textsLoading && <div className="loading-row"><span className="spinner"/> Loading texts...</div>}

        {!textsLoading && texts.length === 0 && (
          <div className="panel" style={{padding:'2rem',textAlign:'center',color:'var(--tx3)'}}>
            No texts yet. Click &quot;+ New Text&quot; to add your first Text of the Month.
          </div>
        )}

        {!textsLoading && texts.length > 0 && (() => {
          const featured = texts.find(t => t.featured);
          const archived = texts.filter(t => !t.featured);
          const row = t => (
            <div key={t.id} className="panel" style={{marginBottom:'.75rem'}}>
              <div style={{display:'flex',alignItems:'center',gap:12,padding:'.85rem 1rem'}}>
                <span style={{fontSize:18}}>{t.featured ? '⭐' : '📄'}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:'var(--tx)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.title_en}</div>
                  <div style={{fontSize:11,color:'var(--tx3)'}}>
                    {(t.category_en || t.category) && `${t.category_en || t.category} · `}{t.publishedAt}
                    {t.featured && <span style={{marginLeft:6,background:'var(--crp)',color:'var(--crb)',padding:'1px 6px',borderRadius:2,fontSize:10,fontWeight:700}}>FEATURED</span>}
                  </div>
                </div>
                <div style={{display:'flex',gap:6,flexShrink:0}}>
                  {!t.featured && <button className="btn btn-s btn-sm" onClick={()=>featureText(t.id)} title="Set as Text of the Month">⭐ Feature</button>}
                  <button className="btn btn-s btn-sm" onClick={()=>openEdit(t)}>✏️ Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={()=>deleteText(t.id, t.title_en)}>✕</button>
                </div>
              </div>
            </div>
          );
          return (
            <>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--tx3)',marginBottom:'.5rem'}}>
                ⭐ Current Text of the Month
              </div>
              {featured ? row(featured) : (
                <div className="panel" style={{padding:'1.25rem',textAlign:'center',color:'var(--tx3)',marginBottom:'.75rem',fontSize:13}}>
                  No text is currently featured. Click &quot;Feature&quot; on one below, or create a new one.
                </div>
              )}

              <div style={{fontSize:11,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--tx3)',margin:'1.5rem 0 .5rem'}}>
                📚 Archived Texts ({archived.length})
              </div>
              {archived.length === 0 ? (
                <div className="panel" style={{padding:'1.25rem',textAlign:'center',color:'var(--tx3)',fontSize:13}}>
                  Past texts will appear here once a new one is featured.
                </div>
              ) : archived.map(row)}
            </>
          );
        })()}

        {/* Edit/Create Modal */}
        {editText !== null && (
          <div className="modal-ov open">
            <div className="modal-box" style={{maxWidth:720}}>
              <div className="modal-head">
                <span className="modal-title">{textForm.title_en || 'New Text of the Month'}</span>
              </div>
              <div style={{padding:'.6rem 1.5rem 0', fontSize:12, color:'var(--tx3)'}}>
                Draft auto-saved as you type. Use Save or Cancel below to close this form — clicking outside won&apos;t close it.
              </div>
              <div className="modal-body">
                {/* Meta row */}
                <div style={{display:'flex',gap:12,marginBottom:'1rem',flexWrap:'wrap'}}>
                  <div className="field-row" style={{flex:'1 1 160px',marginBottom:0}}>
                    <label className="field-label">Author</label>
                    <input className="field-input" value={textForm.author||''} onChange={e=>updateTextForm(f=>({...f,author:e.target.value}))}/>
                  </div>
                  <div className="field-row" style={{flex:'1 1 140px',marginBottom:0}}>
                    <label className="field-label">Date</label>
                    <input className="field-input" type="date" value={textForm.publishedAt||''} onChange={e=>updateTextForm(f=>({...f,publishedAt:e.target.value}))}/>
                  </div>
                </div>

                {/* Language tabs — category, attachment and text fields below all follow the active tab */}
                <div className="tabs" style={{marginBottom:'1rem'}}>
                  {Object.entries(LANG_LABELS).map(([l,label])=>(
                    <button key={l} className={`tab-btn${textTab===l?' active':''}`} onClick={()=>setTextTab(l)}>{label}</button>
                  ))}
                </div>

                {/* Category — separate value per language */}
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
                        onClick={() => updateTextForm(f => ({
                          ...f,
                          [catField]: f[customField] || '',
                          [customField]: '',
                        }))}>
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
                          // Convenience: prefill the other two languages with the
                          // matching translated preset if they're still empty.
                          if (val !== '__new__') {
                            const idx = CATEGORY_PRESETS.findIndex(row => row[catIdx] === val);
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
                      {CATEGORY_PRESETS.map(row => (
                        <option key={row[catIdx]} value={row[catIdx]}>{row[catIdx]}</option>
                      ))}
                      <option value="__new__">+ Add New Category</option>
                    </select>
                  )}
                </div>

                {/* Attachment — separate file slot per language */}
                <div className="field-row">
                  <label className="field-label">{ATTACHMENT_LABEL[lang]}</label>
                  <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                    {textForm[attField] && (
                      <a href={`/api/texts/download?id=${textForm.id}&lang=${lang}`}
                        target="_blank" rel="noopener"
                        className="btn btn-s btn-sm">
                        Download: {textForm[attNameField] || 'File'}
                      </a>
                    )}
                    <input type="file" accept=".pdf,.doc,.docx"
                      id={`text-attachment-input-${lang}`}
                      style={{ display:'none' }}
                      onChange={e => {
                        const file = e.target.files[0];
                        uploadAttachment(lang, file);
                        e.target.value = '';
                      }}
                    />
                    <button className="btn btn-s btn-sm"
                      onClick={() => document.getElementById(`text-attachment-input-${lang}`).click()}>
                      {textForm[attField] ? 'Replace File' : 'Upload PDF or Word'}
                    </button>
                  </div>
                  <div className="field-hint">
                    Save the text first before uploading an attachment. Each language keeps its own file.
                  </div>
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
              </div>
              <div className="modal-foot">
                <label style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'var(--tx2)',marginRight:'auto',cursor:'pointer'}}>
                  <input type="checkbox" checked={!!textForm.featured} onChange={e=>updateTextForm(f=>({...f,featured:e.target.checked}))} style={{accentColor:'var(--crb)',width:15,height:15}}/>
                  Set as Text of the Month (featured)
                </label>
                <button className="btn btn-s" onClick={discardDraft} title="Close and delete this unsaved draft">Discard Draft</button>
                <button className="btn btn-s" onClick={()=>setEditText(null)} title="Close, keeping your progress as a draft">Cancel (Keep as Draft)</button>
                <button className="btn btn-p" onClick={saveText} disabled={textSaving}>
                  {textSaving ? <><span className="spinner"/> Saving...</> : 'Save Text'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const sections = {
    sitelock: { label:'Site Lock', icon:'🔒', render: () => <SiteLockPanel siteLocked={siteLocked} setSiteLocked={setSiteLocked} toast={toast} /> },
    platforms: { label:'Platforms', icon:'🛒', render: () => <PlatformsAdmin toast={toast} /> },
    series: { label:'Series', icon:'📖', render: () => <SeriesAdmin data={data} toast={toast} loadCatalog={loadCatalog} /> },
    dashboard: { label:'Dashboard', icon:'⬡', render: renderDashboard },
    catalog: { label:'Catalog', icon:'📚', render: renderCatalog },
    availability: { label:'Availability', icon:'🔓', render: renderAvailability },
    synopses: { label:'Synopses', icon:'✍️', render: renderSynopses },
    texts: { label:'Texts', icon:'✍️', render: renderTexts },
    bundles: { label:'Bundles', icon:'📦', render: () => <BundleAdmin toast={toast} books={data?.books||[]} /> },
    messages: { label:'Messages', icon:'✉️', render: () => <MessagesBoard toast={toast} setUnreadCount={setUnreadCount} /> },
    backups: { label:'Backups', icon:'💾', render: renderBackups },
    settings: { label:'Settings', icon:'⚙️', render: renderSettings },
  };

  const currentSection = sections[activeSection] || sections.dashboard;

  return (
    <>
      <Head>
        <title>Admin: SPY ON THE RISE</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <style>{ADMIN_CSS}</style>

      <div className="admin-shell">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sb-brand">
            <div className="sb-brand-name">Spy on the Rise</div>
            <div className="sb-brand-sub">Admin Dashboard</div>
          </div>
          <nav className="sb-section">
            <div className="sb-label">Management</div>
            {Object.entries(sections).map(([key, s]) => (
              <button key={key} className={`sb-item ${activeSection === key ? 'active' : ''}`}
                onClick={() => setActiveSection(key)}>
                <span className="sb-icon">{s.icon}</span>
                {s.label}
                {key === 'sitelock' && siteLocked === true && <span className="sb-badge" style={{background:'#D4A820',color:'#000'}}>LOCKED</span>}
                {key === 'availability' && data && <span className="sb-badge">{data.books.filter(b=>!b.available).length}</span>}
                {key === 'messages' && unreadCount > 0 && <span className="sb-badge">{unreadCount}</span>}
              </button>
            ))}
            <div className="sb-divider" />
            <div className="sb-label">External</div>
            <a href="/" target="_blank" rel="noopener" className="sb-item">
              <span className="sb-icon">🌐</span> Live Site
            </a>
            <a href="https://vercel.com" target="_blank" rel="noopener" className="sb-item">
              <span className="sb-icon">▲</span> Vercel
            </a>
            <a href="https://analytics.google.com" target="_blank" rel="noopener" className="sb-item">
              <span className="sb-icon">📊</span> Analytics
            </a>
          </nav>
          <div className="sb-footer">
            <div className="sb-user">Signed in as admin</div>
            <button className="btn-logout" onClick={doLogout}>Sign Out</button>
          </div>
        </aside>

        {/* MAIN */}
        <div className="main">
          <header className="topbar">
            <div>
              <div className="tb-title">{currentSection.icon} {currentSection.label}</div>
              {data && <div className="tb-sub">SPY ON THE RISE · {data.stats.totalTitles} titles · {data.stats.availableTitles} live{data.stats.hiddenTitles > 0 ? ` · ${data.stats.hiddenTitles} hidden` : ''}</div>}
            </div>
            <div className="tb-actions">
              <button className="btn btn-s btn-sm" onClick={loadCatalog} disabled={loading}>
                {loading ? <span className="spinner" /> : '↻ Refresh'}
              </button>
              <a href="/" target="_blank" rel="noopener" className="btn btn-s btn-sm">
                🌐 View Site
              </a>
              <button
                className={`btn btn-sm ${siteLocked ? 'btn-g' : 'btn-warn'}`}
                style={{ minWidth: 130 }}
                disabled={lockToggling || siteLocked === null}
                onClick={async () => {
                  setLockToggling(true);
                  try {
                    const r = await fetch('/api/admin/sitelock', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ locked: !siteLocked }),
                    });
                    const d = await r.json();
                    if (d.success) {
                      setSiteLocked(d.locked);
                      toast(d.locked ? '🔒 Site locked: Coming Soon visible' : '🌐 Site unlocked: fully live', d.locked ? 'warning' : 'success');
                    } else {
                      toast(d.error || 'Lock toggle failed', 'error');
                    }
                  } catch { toast('Lock toggle failed', 'error'); }
                  setLockToggling(false);
                }}>
                {lockToggling
                  ? <><span className="spinner" /> Updating...</>
                  : siteLocked === null ? '...'
                  : siteLocked ? '🌐 Unlock Site' : '🔒 Lock Site'}
              </button>
              <PublishButton addToast={toast} />
            </div>
          </header>

          <div className="content">
            {loading ? (
              <div className="loading-row"><span className="spinner" /> Loading...</div>
            ) : (
              currentSection.render()
            )}
          </div>
        </div>
      </div>

      {/* EDIT BOOK MODAL */}
      {editBook && (
        <div className="modal-ov open" onClick={e => e.target.className.includes('modal-ov') && setEditBook(null)}>
          <div className="modal-box">
            <div className="modal-head">
              <span className="modal-title">Edit: {editBook.title}</span>
              <button className="modal-cls" onClick={() => setEditBook(null)}>✕</button>
            </div>
            <div className="modal-body">
              {/* Cover Image Upload */}
              <div className="field-row" style={{marginBottom:'1.25rem'}}>
                <label className="field-label">Book Cover Image</label>
                <div style={{display:'flex',gap:'1rem',alignItems:'flex-start'}}>
                  <div style={{width:80,height:120,borderRadius:4,background:editBook?.color||'#1C1C1C',flexShrink:0,overflow:'hidden',border:'1px solid var(--border2)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',position:'relative'}}
                    onClick={()=>document.getElementById('cover-upload-input').click()} title="Click to upload cover image">
                    {editBook?.image
                      ? <img src={editBook.image} alt="cover" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                      : <span style={{fontSize:11,color:'rgba(255,255,255,.3)',textAlign:'center',padding:4}}>Click to upload</span>}
                    <div style={{position:'absolute',bottom:0,left:0,right:0,background:'rgba(0,0,0,.5)',padding:'3px',textAlign:'center',fontSize:9,color:'rgba(255,255,255,.6)'}}>Upload</div>
                  </div>
                  <div style={{flex:1}}>
                    <input id="cover-upload-input" type="file" accept="image/jpeg,image/png,image/webp" style={{display:'none'}}
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const fd = new FormData();
                        fd.append('bookKey', editBook.key);
                        fd.append('cover', file);
                        toast('Uploading cover...', 'warning');
                        try {
                          const r = await fetch('/api/admin/upload-image', {method:'POST',body:fd});
                          const d = await r.json();
                          if (d.success) { toast('Cover uploaded', 'success'); await loadCatalog(); }
                          else toast(d.error, 'error');
                        } catch { toast('Upload failed', 'error'); }
                      }} />
                    <div style={{fontSize:12,color:'var(--tx2)',lineHeight:1.7}}>
                      Click the cover preview to upload a new image.<br/>
                      Accepted: JPG, PNG, WebP. Max 5MB.<br/>
                      Recommended: 800×1200px (2:3 ratio).
                    </div>
                    {editBook?.image && <div style={{marginTop:'.5rem',fontSize:11,color:'var(--tx3)',fontFamily:'monospace'}}>{editBook.image}</div>}
                  </div>
                </div>
              </div>
              <div className="two-col">
                <div className="field-row">
                  <label className="field-label">Title</label>
                  <input className="field-input" value={editForm.title||''} onChange={e => setEditForm(f => ({...f,title:e.target.value}))} />
                </div>
                <div className="field-row">
                  <label className="field-label">Subtitle</label>
                  <input className="field-input" value={editForm.subtitle||''} onChange={e => setEditForm(f => ({...f,subtitle:e.target.value}))} />
                </div>
              </div>
              <div className="two-col">
                <div className="field-row">
                  <label className="field-label">Price</label>
                  <input className="field-input" value={editForm.price||''} onChange={e => setEditForm(f => ({...f,price:e.target.value}))} placeholder="From $15.99" />
                </div>
                <div className="field-row">
                  <label className="field-label">Release Year</label>
                  <input className="field-input" value={editForm.release||''} onChange={e => setEditForm(f => ({...f,release:e.target.value}))} placeholder="2027" />
                </div>
              </div>
              <div className="two-col">
                <div className="field-row">
                  <label className="field-label">Language</label>
                  <select className="field-input field-select" value={editForm.lang||'EN / FR'} onChange={e => setEditForm(f => ({...f,lang:e.target.value}))}>
                    <option value="EN / FR">EN / FR</option>
                    <option value="EN">EN only</option>
                    <option value="EN / FR / ES">EN / FR / ES</option>
                  </select>
                </div>
                <div className="field-row">
                  <label className="field-label">Cover Color</label>
                  <div style={{ display:'flex', gap:'.5rem', alignItems:'center' }}>
                    <input type="color" value={editForm.color||'#1C2B4A'} onChange={e => setEditForm(f => ({...f,color:e.target.value}))} style={{ width:40, height:32, border:'1px solid var(--border2)', borderRadius:'var(--r2)', background:'none', cursor:'pointer' }} />
                    <input className="field-input" value={editForm.color||''} onChange={e => setEditForm(f => ({...f,color:e.target.value}))} style={{ fontFamily:'monospace', fontSize:12 }} />
                  </div>
                </div>
              </div>
              <div className="two-col">
                <div className="field-row">
                  <label className="field-label">Genre</label>
                  <select className="field-input field-select" value={editForm.genre||''} onChange={e => setEditForm(f => ({...f,genre:e.target.value}))}>
                    <option value="Spy Thriller">Spy Thriller</option>
                    <option value="Behavioral Sociology">Behavioral Sociology</option>
                    <option value="Geopolitical Theory">Geopolitical Theory</option>
                    <option value="Historical Fiction">Historical Fiction</option>
                    <option value="Literary Fiction">Literary Fiction</option>
                    <option value="Social Essay">Social Essay</option>
                    <option value="Socio-Political Essay">Socio-Political Essay</option>
                    <option value="Speculative Fiction">Speculative Fiction</option>
                    <option value="Bilingual Poetry">Bilingual Poetry</option>
                  </select>
                </div>
                <div className="field-row">
                  <label className="field-label">Pages</label>
                  <input className="field-input" value={editForm.pages||''} onChange={e => setEditForm(f => ({...f,pages:e.target.value}))} placeholder="320" />
                </div>
              </div>
              <div className="two-col">
                <div className="field-row">
                  <label className="field-label">Series Name</label>
                  <input className="field-input" value={editForm.series||''} onChange={e => setEditForm(f => ({...f,series:e.target.value}))} placeholder="The Mercer Files" />
                </div>
                <div className="field-row">
                  <label className="field-label">Volume</label>
                  <input className="field-input" value={editForm.vol||''} onChange={e => setEditForm(f => ({...f,vol:e.target.value}))} placeholder="1" />
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-s" onClick={() => setEditBook(null)}>Cancel</button>
              <button className="btn btn-p" onClick={saveBookEdit} disabled={saving}>
                {saving ? <><span className="spinner" /> Saving…</> : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SYNOPSIS MODAL */}
      {synopsisBook && (
        <div className="modal-ov open" onClick={e => e.target.className.includes('modal-ov') && setSynopsisBook(null)}>
          <div className="modal-box" style={{ maxWidth:720 }}>
            <div className="modal-head">
              <span className="modal-title">Synopses: {synopsisBook.title}</span>
              <button className="modal-cls" onClick={() => setSynopsisBook(null)}>✕</button>
            </div>
            <div className="modal-body">
              {/* Cover Image Upload */}
              <div className="field-row" style={{marginBottom:'1.25rem'}}>
                <label className="field-label">Book Cover Image</label>
                <div style={{display:'flex',gap:'1rem',alignItems:'flex-start'}}>
                  <div style={{width:60,height:90,borderRadius:4,background:synopsisBook?.color||'#1C1C1C',flexShrink:0,overflow:'hidden',border:'1px solid var(--border2)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',position:'relative'}}
                    onClick={()=>document.getElementById('syn-cover-upload-input').click()} title="Click to upload cover image">
                    {synopsisBook?.image
                      ? <img src={synopsisBook.image} alt="cover" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                      : <span style={{fontSize:9,color:'rgba(255,255,255,.3)',textAlign:'center',padding:4}}>Upload</span>}
                    <div style={{position:'absolute',bottom:0,left:0,right:0,background:'rgba(0,0,0,.5)',padding:'2px',textAlign:'center',fontSize:8,color:'rgba(255,255,255,.6)'}}>Upload</div>
                  </div>
                  <div style={{flex:1}}>
                    <input id="syn-cover-upload-input" type="file" accept="image/jpeg,image/png,image/webp" style={{display:'none'}}
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const fd = new FormData();
                        fd.append('bookKey', synopsisBook.key);
                        fd.append('cover', file);
                        toast('Uploading cover...', 'warning');
                        try {
                          const r = await fetch('/api/admin/upload-image', {method:'POST',body:fd});
                          const d = await r.json();
                          if (d.success) { toast('Cover uploaded', 'success'); await loadCatalog(); }
                          else toast(d.error, 'error');
                        } catch { toast('Upload failed', 'error'); }
                      }} />
                    {synopsisBook?.image && <div style={{fontSize:11,color:'var(--tx3)',fontFamily:'monospace'}}>{synopsisBook.image}</div>}
                    {!synopsisBook?.image && <div style={{fontSize:12,color:'var(--tx3)'}}>No cover image yet: click thumbnail to upload.</div>}
                  </div>
                </div>
              </div>
              <div className="tabs">
                {[['en','🇬🇧 English'],['fr','🇫🇷 French'],['es','🇪🇸 Spanish'],['urls','🔗 Retail Links']].map(([lang, label]) => (
                  <button key={lang} className={`tab-btn ${activeTab===lang?'active':''}`} onClick={() => setActiveTab(lang)}>{label}</button>
                ))}
              </div>
              {activeTab !== 'urls' ? (
                <>
                  <div className="field-row">
                    <label className="field-label">
                      {activeTab==='en'?'English Synopsis':activeTab==='fr'?'French Synopsis (FR edition only, no EN in FR text)':'Spanish Synopsis (ES edition only, no EN in ES text)'}
                    </label>
                    <textarea className="field-input field-textarea" style={{ minHeight:200 }}
                      value={synopsisForm[activeTab]||''} onChange={e => setSynopsisForm(f => ({...f,[activeTab]:e.target.value}))}
                      placeholder={`Write the ${activeTab.toUpperCase()} synopsis here...`} />
                    <div className="field-hint">{(synopsisForm[activeTab]||'').length} characters</div>
                  </div>
                  <div style={{ padding:'.6rem .75rem', background:'var(--surface2)', borderRadius:'var(--r2)', fontSize:12, color:'var(--tx3)', lineHeight:1.6 }}>
                    Rule: each language synopsis stands alone. No cross-language title references. No translation markers.
                  </div>
                </>
              ) : (
                <div style={{ marginTop:'1rem' }}>
                  <div style={{ padding:'.6rem .75rem', background:'var(--surface2)', borderRadius:'var(--r2)', fontSize:12, color:'var(--tx3)', lineHeight:1.6, marginBottom:'1rem' }}>
                    Enter this book's purchase link for each platform. Removing a platform here removes it everywhere, since platforms are shared across the whole catalog.
                  </div>
                  {['print','ebook','audio'].map(type => (
                    <div key={type} style={{ marginBottom:'1.5rem' }}>
                      <div style={{ fontSize:12, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--tx3)', marginBottom:'.5rem' }}>
                        {type === 'print' ? 'Print' : type === 'ebook' ? 'eBook' : 'Audiobook'}
                      </div>
                      {(data?.platforms?.[type] || []).length === 0 && (
                        <div style={{ fontSize:12, color:'var(--tx3)', marginBottom:'.5rem' }}>No platforms yet for this format.</div>
                      )}
                      {(data?.platforms?.[type] || []).map(p => (
                        <div key={p.key} style={{ display:'flex', alignItems:'flex-end', gap:8, marginBottom:'.6rem' }}>
                          <div className="field-row" style={{ flex:1, marginBottom:0 }}>
                            <label className="field-label">{p.name}</label>
                            <input className="field-input" type="url"
                              value={(synopsisForm.links?.[type] || {})[p.key] || ''}
                              onChange={e => setSynopsisForm(f => ({
                                ...f, links: { ...f.links, [type]: { ...(f.links?.[type]||{}), [p.key]: e.target.value } },
                              }))}
                              placeholder="https://" />
                          </div>
                          <button className="btn btn-danger btn-sm" title={`Remove ${p.name} from all platforms`}
                            onClick={async () => {
                              if (!confirm(`Remove "${p.name}" from all platforms? This affects every book.`)) return;
                              try {
                                const r = await fetch('/api/admin/book', {
                                  method:'POST', headers:{'Content-Type':'application/json'},
                                  body: JSON.stringify({ action:'delete-platform', platformType:type, platform:{ key:p.key } }),
                                });
                                const d = await r.json();
                                if (d.success) { toast('Platform removed', 'success'); await loadCatalog(); }
                                else toast(d.error, 'error');
                              } catch { toast('Failed to remove platform', 'error'); }
                            }}>✕</button>
                        </div>
                      ))}
                      <AddPlatformInline type={type} toast={toast} loadCatalog={loadCatalog} />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-foot">
              <button className="btn btn-s" onClick={() => setSynopsisBook(null)}>Cancel</button>
              <button className="btn btn-p" onClick={saveSynopsis} disabled={saving}>
                {saving ? <><span className="spinner" /> Saving…</> : 'Save All Languages'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD TITLE MODAL */}
      {showAddTitle && (
        <div className="modal-ov open" onClick={e => { if(e.target.className==='modal-ov open') setShowAddTitle(false); }}>
          <div className="modal-box" style={{maxWidth:640}}>
            <div className="modal-head">
              <span className="modal-title">+ Add New Title to Catalog</span>
              <button className="modal-cls" onClick={() => setShowAddTitle(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{background:'var(--crp)',border:'1px solid rgba(200,112,112,.25)',borderRadius:6,padding:'.65rem 1rem',marginBottom:'1rem',display:'flex',alignItems:'center',gap:'.75rem'}}>
                <span style={{fontSize:11,fontWeight:700,color:'var(--crb)',letterSpacing:'.1em',textTransform:'uppercase',flexShrink:0}}>Auto Key</span>
                <code style={{fontSize:13,color:'var(--crb)',flex:1}}>{autoKey || 'Type a title to generate key…'}</code>
                {autoKey && <span style={{fontSize:10,color:'var(--tx3)'}}>Used internally only.</span>}
              </div>
              <div className="two-col">
                <div className="field-row">
                  <label className="field-label">Title <span style={{color:'var(--crb)'}}>*</span></label>
                  <input className="field-input" value={addForm.title||''} onChange={e=>setAddForm(f=>({...f,title:e.target.value}))} placeholder="e.g. The Mercer Files: Book 8" autoFocus />
                </div>
                <div className="field-row">
                  <label className="field-label">Subtitle</label>
                  <input className="field-input" value={addForm.subtitle||''} onChange={e=>setAddForm(f=>({...f,subtitle:e.target.value}))} placeholder="e.g. The Geneva Exposure" />
                </div>
              </div>
              <div className="two-col">
                <div className="field-row">
                  <label className="field-label">Genre</label>
                  <select className="field-input field-select" value={addForm.genre||''} onChange={e=>setAddForm(f=>({...f,genre:e.target.value}))}>
                    <option value="">Select genre…</option>
                    {['Spy Thriller','Behavioral Sociology','Historical Fiction','Geopolitical Theory','Literary Fiction','Speculative Fiction','Social Essay','Socio-Political Essay','Bilingual Poetry',"Children's Illustrated Fiction"].map(g=><option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="field-row">
                  <label className="field-label">Series</label>
                  <select className="field-input field-select" value={addForm.series||''} onChange={e=>{
                    const sel = data?.series?.find(s=>s.name===e.target.value);
                    setAddForm(f=>({...f,series:e.target.value,seriesKey:sel?.key||null}));
                  }}>
                    <option value="">Standalone</option>
                    {data?.series?.map(s=><option key={s.key} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="two-col">
                <div className="field-row">
                  <label className="field-label">Language</label>
                  <select className="field-input field-select" value={addForm.lang||'EN / FR'} onChange={e=>setAddForm(f=>({...f,lang:e.target.value}))}>
                    <option value="EN / FR">EN / FR</option>
                    <option value="EN">English only</option>
                    <option value="EN / FR / ES">EN / FR / ES</option>
                  </select>
                </div>
                <div className="field-row">
                  <label className="field-label">Volume / Number</label>
                  <input className="field-input" value={addForm.vol||''} onChange={e=>setAddForm(f=>({...f,vol:e.target.value}))} placeholder="e.g. Vol. 8" />
                </div>
              </div>
              <div className="two-col">
                <div className="field-row">
                  <label className="field-label">Status</label>
                  <select className="field-input field-select" value={addForm.available===true?'true':'false'} onChange={e=>setAddForm(f=>({...f,available:e.target.value==='true'}))}>
                    <option value="false">Locked / Forthcoming</option>
                    <option value="true">Available now</option>
                  </select>
                </div>
                <div className="field-row">
                  <label className="field-label">{addForm.available ? 'Price' : 'Expected Release Year'}</label>
                  <input className="field-input"
                    value={addForm.available ? (addForm.price||'') : (addForm.release||'')}
                    onChange={e=>setAddForm(f=>addForm.available ? {...f,price:e.target.value} : {...f,release:e.target.value})}
                    placeholder={addForm.available ? 'From $15.99' : '2027'} />
                </div>
              </div>
              <div className="two-col">
                <div className="field-row">
                  <label className="field-label">Pages</label>
                  <input className="field-input" value={addForm.pages||''} onChange={e=>setAddForm(f=>({...f,pages:e.target.value}))} placeholder="~290p" />
                </div>
                <div className="field-row">
                  <label className="field-label">Cover Color</label>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <input type="color" value={addForm.color||'#1C2B4A'} onChange={e=>setAddForm(f=>({...f,color:e.target.value}))} style={{width:38,height:32,border:'1px solid var(--border2)',borderRadius:4,cursor:'pointer',background:'none'}} />
                    <input className="field-input" value={addForm.color||'#1C2B4A'} onChange={e=>setAddForm(f=>({...f,color:e.target.value}))} style={{fontFamily:'monospace',fontSize:12}} />
                  </div>
                </div>
              </div>
              <div className="field-row">
                <label className="field-label">Synopsis (English)</label>
                <textarea className="field-input field-textarea" style={{minHeight:80}} value={addForm.synopsis||''} onChange={e=>setAddForm(f=>({...f,synopsis:e.target.value}))} placeholder="Brief description for readers…" />
                <div className="field-hint">You can add FR and ES synopses later via the 📝 editor.</div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-s" onClick={() => setShowAddTitle(false)}>Cancel</button>
              <button className="btn btn-p" disabled={addSaving || !addForm.title} onClick={async () => {
                if (!addForm.title) { toast('Title is required', 'error'); return; }
                setAddSaving(true);
                try {
                  const r = await fetch('/api/admin/add-book', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bookData: { ...addForm, key: autoKey } }),
                  });
                  const d = await r.json();
                  if (d.success) {
                    toast(`"${addForm.title}" added to catalog (key: ${d.key})`, 'success');
                    setShowAddTitle(false);
                    setAddForm({});
                    setAutoKey('');
                    await loadCatalog();
                  } else {
                    toast(d.error || 'Failed to add title', 'error');
                  }
                } catch { toast('Request failed', 'error'); }
                setAddSaving(false);
              }}>
                {addSaving ? <><span className="spinner" /> Adding…</> : 'Add to Catalog'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOASTS */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>
        ))}
      </div>
    </>
  );
}

// ── CSS ────────────────────────────────────────────────────
const ADMIN_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Source+Sans+3:wght@400;500;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{--bg:#0D0D0D;--surface:#141414;--surface2:#1C1C1C;--surface3:#242424;--border:#2A2A2A;--border2:#333;--cr:#7A1515;--crh:#961A1A;--crp:rgba(122,21,21,.12);--crb:#C87070;--tx:#F0EDE8;--tx2:#B8B0A5;--tx3:#6B6560;--green:#1A7A3A;--greenbg:rgba(26,122,58,.12);--greenb:#4AC77A;--amber:#8A5C00;--amberbg:rgba(138,92,0,.12);--amberb:#D4A820;--blue:#1565C0;--bluebg:rgba(21,101,192,.12);--blueb:#5B9BD4;--red:#8B1A1A;--redbg:rgba(139,26,26,.12);--redb:#E57373;--dp:'Playfair Display',Georgia,serif;--ui:'Source Sans 3',system-ui,sans-serif;--r:8px;--r2:4px}
  html,body{height:100%;font-family:var(--ui);background:var(--bg);color:var(--tx);font-size:14px;line-height:1.5}
  a{color:inherit;text-decoration:none}button{cursor:pointer;font-family:var(--ui)}input,textarea,select{font-family:var(--ui)}
  :focus-visible{outline:2px solid var(--cr);outline-offset:2px}
  ::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-track{background:var(--surface)}::-webkit-scrollbar-thumb{background:var(--border2);border-radius:3px}
  .admin-shell{display:flex;height:100vh;overflow:hidden}
  .sidebar{width:240px;flex-shrink:0;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow-y:auto}
  .main{flex:1;overflow-y:auto;display:flex;flex-direction:column;min-width:0}
  .sb-brand{padding:1.25rem 1.25rem .75rem;border-bottom:1px solid var(--border)}
  .sb-brand-name{font-family:var(--dp);font-size:15px;font-weight:700;color:var(--tx)}
  .sb-brand-sub{font-size:10px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--cr);margin-top:1px}
  .sb-section{padding:.75rem 0}
  .sb-label{font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--tx3);padding:.25rem 1.25rem .5rem}
  .sb-item{display:flex;align-items:center;gap:.6rem;padding:.55rem 1.25rem;font-size:13px;font-weight:500;color:var(--tx2);border-left:2px solid transparent;transition:all .15s;cursor:pointer;border:none;background:none;width:100%;text-align:left}
  .sb-item:hover{background:var(--surface2);color:var(--tx)}.sb-item.active{background:var(--crp);color:var(--crb);border-left-color:var(--cr)}
  .sb-icon{width:16px;text-align:center;flex-shrink:0;font-size:14px}
  .sb-badge{margin-left:auto;background:var(--cr);color:#fff;font-size:9px;font-weight:700;padding:1px 6px;border-radius:10px}
  .sb-divider{height:1px;background:var(--border);margin:.5rem 1.25rem}
  .sb-footer{margin-top:auto;padding:1rem 1.25rem;border-top:1px solid var(--border)}
  .sb-user{font-size:12px;color:var(--tx3);margin-bottom:.5rem}
  .btn-logout{width:100%;background:var(--surface2);border:1px solid var(--border2);color:var(--tx2);padding:.5rem;border-radius:var(--r2);font-size:12px;font-weight:600;transition:all .15s;cursor:pointer}
  .btn-logout:hover{border-color:var(--redb);color:var(--redb);background:var(--redbg)}
  .topbar{height:56px;border-bottom:1px solid var(--border);background:var(--surface);display:flex;align-items:center;padding:0 1.5rem;gap:1rem;flex-shrink:0}
  .tb-title{font-family:var(--dp);font-size:18px;font-weight:700;color:var(--tx);flex:1}
  .tb-sub{font-size:11px;color:var(--tx3);margin-top:1px}
  .tb-actions{display:flex;gap:.5rem;align-items:center}
  .btn{display:inline-flex;align-items:center;gap:.4rem;padding:.45rem .9rem;border-radius:var(--r2);font-size:12px;font-weight:600;letter-spacing:.04em;border:1px solid transparent;transition:all .15s;white-space:nowrap;cursor:pointer}
  .btn-p{background:var(--cr);color:#fff;border-color:var(--cr)}.btn-p:hover{background:var(--crh)}.btn-p:disabled{opacity:.5}
  .btn-s{background:var(--surface2);color:var(--tx2);border-color:var(--border2)}.btn-s:hover{border-color:var(--crb);color:var(--crb)}
  .btn-g{background:var(--greenbg);color:var(--greenb);border-color:rgba(74,199,122,.25)}.btn-g:hover{background:rgba(26,122,58,.2)}
  .btn-warn{background:var(--amberbg);color:var(--amberb);border-color:rgba(212,168,32,.25)}.btn-warn:hover{background:rgba(138,92,0,.2)}
  .btn-danger{background:var(--redbg);color:var(--redb);border-color:rgba(229,115,115,.25)}.btn-danger:hover{background:rgba(139,26,26,.2)}
  .btn-sm{padding:.3rem .6rem;font-size:11px}.btn-icon{padding:.3rem .4rem;font-size:13px}
  .content{flex:1;padding:1.5rem;overflow-y:auto}
  .stats-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1rem;margin-bottom:1.5rem}
  .stat-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:1.1rem;position:relative;overflow:hidden}
  .stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--accent,var(--cr))}
  .stat-n{font-family:var(--dp);font-size:32px;font-weight:700;color:var(--tx);line-height:1}
  .stat-l{font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--tx3);margin-top:.3rem}
  .stat-sub{font-size:11px;color:var(--tx3);margin-top:.25rem}
  .table-wrap{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);overflow:hidden}
  .tbl{width:100%;border-collapse:collapse}
  .tbl th{background:var(--surface2);padding:.55rem .85rem;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--tx3);text-align:left;white-space:nowrap}
  .tbl td{padding:.65rem .85rem;border-top:1px solid var(--border);font-size:13px;color:var(--tx2);vertical-align:middle}
  .tbl tr:hover td{background:rgba(255,255,255,.02)}
  .badge{display:inline-block;font-size:10px;font-weight:700;letter-spacing:.05em;padding:2px 7px;border-radius:20px;white-space:nowrap}
  .badge-avail{background:var(--greenbg);color:var(--greenb)}.badge-locked{background:var(--amberbg);color:var(--amberb)}.badge-genre{background:var(--bluebg);color:var(--blueb)}.badge-series{background:var(--crp);color:var(--crb)}
  .field-row{margin-bottom:1rem}
  .field-label{display:block;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--tx3);margin-bottom:.35rem}
  .field-input{width:100%;background:var(--surface2);border:1px solid var(--border2);border-radius:var(--r2);padding:.55rem .75rem;font-size:13px;color:var(--tx);transition:border-color .15s;outline:none}
  .field-input:focus{border-color:var(--crb)}
  .field-textarea{min-height:100px;resize:vertical;line-height:1.65}
  .field-select{appearance:none;padding-right:2rem;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%236B6560'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right .7rem center;background-color:var(--surface2)}
  .field-hint{font-size:11px;color:var(--tx3);margin-top:.3rem}
  .panel{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;margin-bottom:1.25rem}
  .panel-head{padding:.75rem 1rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
  .panel-title{font-size:13px;font-weight:600;color:var(--tx)}
  .panel-body{padding:1rem}
  .modal-ov{display:none;position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:200;align-items:center;justify-content:center;padding:1rem}
  .modal-ov.open{display:flex}
  .modal-box{background:var(--surface);border:1px solid var(--border2);border-radius:var(--r);width:100%;max-width:600px;max-height:92vh;overflow-y:auto;display:flex;flex-direction:column}
  .modal-head{padding:1rem 1.25rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
  .modal-title{font-family:var(--dp);font-size:16px;font-weight:700;color:var(--tx)}
  .modal-cls{background:none;border:none;color:var(--tx3);font-size:18px;padding:.25rem;border-radius:var(--r2);transition:color .15s;cursor:pointer}
  .modal-cls:hover{color:var(--tx)}
  .modal-body{padding:1.25rem;flex:1}
  .modal-foot{padding:.75rem 1.25rem;border-top:1px solid var(--border);display:flex;gap:.5rem;justify-content:flex-end;flex-shrink:0;background:var(--surface2)}
  .tabs{display:flex;border-bottom:1px solid var(--border);margin-bottom:1.25rem;overflow-x:auto}
  .tab-btn{background:none;border:none;font-size:12px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:var(--tx3);padding:.6rem 1rem;border-bottom:2px solid transparent;margin-bottom:-1px;transition:all .15s;white-space:nowrap;cursor:pointer}
  .tab-btn:hover{color:var(--tx)}.tab-btn.active{color:var(--crb);border-bottom-color:var(--cr)}
  .search-wrap{position:relative}
  .search-icon{position:absolute;left:.6rem;top:50%;transform:translateY(-50%);color:var(--tx3);pointer-events:none}
  .search-inp{padding-left:2rem!important;width:220px}
  .toast-container{position:fixed;bottom:1.5rem;right:1.5rem;z-index:500;display:flex;flex-direction:column;gap:.5rem;pointer-events:none}
  .toast{background:var(--surface2);border:1px solid var(--border2);border-radius:var(--r);padding:.7rem 1rem;font-size:13px;color:var(--tx);min-width:240px;max-width:360px;pointer-events:auto;animation:toastIn .25s ease;border-left:3px solid var(--cr)}
  .toast.success{border-left-color:var(--greenb)}.toast.error{border-left-color:var(--redb)}.toast.warning{border-left-color:var(--amberb)}
  @keyframes toastIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
  .cover-mini{width:32px;height:48px;border-radius:2px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;font-size:8px;color:rgba(255,255,255,.5)}
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem}
  .spinner{width:14px;height:14px;border:2px solid rgba(255,255,255,.2);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;display:inline-block}
  @keyframes spin{to{transform:rotate(360deg)}}
  .loading-row{display:flex;align-items:center;justify-content:center;gap:.75rem;padding:3rem;color:var(--tx3);font-size:13px}
  .empty-state{padding:3rem;text-align:center;color:var(--tx3)}
  .empty-icon{font-size:28px;margin-bottom:.5rem}
  .avail-toggle{background:none;border:none;padding:0;cursor:pointer;display:inline-flex;align-items:center}
  .login-page{height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg)}
  .login-box{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:2rem;width:100%;max-width:360px}
  .login-brand{text-align:center;margin-bottom:1.75rem}
  .login-logo{font-size:28px;color:var(--cr);margin-bottom:.5rem}
  .login-name{font-family:var(--dp);font-size:20px;font-weight:700;color:var(--tx)}
  .login-sub{font-size:11px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:var(--tx3);margin-top:3px}
  .login-error{background:var(--redbg);border:1px solid rgba(229,115,115,.3);color:var(--redb);padding:.6rem .75rem;border-radius:var(--r2);font-size:12px;margin-bottom:.75rem}
  .login-hint{font-size:11px;color:var(--tx3);margin-top:1rem;line-height:1.7;text-align:center}
  .login-hint code{background:var(--surface2);padding:1px 5px;border-radius:3px;font-family:monospace;font-size:11px;color:var(--crb)}
  code{font-family:'Consolas','Monaco',monospace;font-size:11px;color:var(--crb)}
  .success-box{background:var(--greenbg);border:1px solid rgba(74,222,128,.3);color:var(--greenb);padding:.6rem .75rem;border-radius:var(--r2);font-size:12px}
  .error-box{background:var(--redbg);border:1px solid rgba(229,115,115,.3);color:var(--redb);padding:.6rem .75rem;border-radius:var(--r2);font-size:12px}
`;

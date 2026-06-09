// ════════════════════════════════════════════════════════════
// pages/admin/index.js — SPY ON THE RISE Admin Dashboard
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
      save: `${rate}% Off — Save $${discAmt.toFixed(2)}`,
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
        <span style={{fontSize:13,color:'var(--tx3)'}}>{bundles ? bundles.length : '—'} bundle offers</span>
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
                    <input className="field-input" value={bundleForm.save||''} onChange={e=>setBundleForm(f=>({...f,save:e.target.value}))} placeholder="35% Off — Save $36.73" />
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

// ── Publish to Live Site ───────────────────────────────────
function PublishButton({ addToast }) {
  const [publishing, setPublishing] = useState(false);
  async function publish() {
    setPublishing(true);
    try {
      const r = await fetch('/api/admin/publish', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Admin: catalog and content update via dashboard' }),
      });
      const d = await r.json();
      addToast(d.message || (d.success ? 'Published' : d.error || 'Publish failed'), d.success ? 'success' : 'error');
    } catch (e) { addToast('Publish error: ' + e.message, 'error'); }
    setPublishing(false);
  }
  return (
    <button className="btn btn-p" onClick={publish} disabled={publishing} title="Commit & push to GitHub — Vercel auto-deploys">
      {publishing ? <><span className="spinner" /> Publishing...</> : '▲ Publish to Live'}
    </button>
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
            ? 'Website locked — visitors see the Coming Soon screen'
            : 'Website unlocked — full site is visible to all visitors',
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
                : isLocked ? '🌐 Unlock — Go Live' : '🔒 Lock — Coming Soon'}
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
            sotr-production.vercel.app — always open<br/>
            spyontherise.com/?preview=sotr2026 — bypass on main domain<br/>
            localhost:3000 — always open in development
          </div>
        </div>
        <div className="panel">
          <div className="panel-head"><span className="panel-title" style={{ color:'var(--greenb)' }}>🌐 When Live</span></div>
          <div className="panel-body" style={{ fontSize:13, color:'var(--tx2)', lineHeight:1.9 }}>
            All visitors see the full site with the complete catalog,
            book cards, series pages, bundles, and all features.<br/><br/>
            <strong style={{ color:'var(--tx)' }}>The admin dashboard is always accessible</strong>
            {' '}regardless of lock status — the lock only affects public pages.
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
  const [synopsisForm, setSynopsisForm] = useState({ en:'', fr:'', es:'', urls:{} });
  const [toasts, setToasts] = useState([]);
  const [activeTab, setActiveTab] = useState('en');
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ current:'', next:'', confirm:'' });
  const [pwMsg, setPwMsg] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [fwdEmail, setFwdEmail] = useState('');
  const [fwdMsg, setFwdMsg] = useState(null);
  const [showAddTitle, setShowAddTitle] = useState(false);
  const [addForm, setAddForm] = useState({});
  const [addSaving, setAddSaving] = useState(false);
  const [autoKey, setAutoKey] = useState('');
  const [siteLocked, setSiteLocked] = useState(null);
  const [lockToggling, setLockToggling] = useState(false);

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
    fetch('/api/admin/config').then(r=>r.json()).then(d=>setFwdEmail(d.config?.forwardEmail||d.forwardEmail||'')).catch(()=>{});
  }, [activeSection, auth]);

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
        toast(`${key} → ${currentState ? 'locked' : 'unlocked'} — live in ~10s`, 'success');
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
        toast('Book updated — live in ~10s', 'success');
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
        body: JSON.stringify({ action: 'synopsis', key: synopsisBook.key, synopsis: { en:synopsisForm.en, fr:synopsisForm.fr, es:synopsisForm.es }, retailerUrls: synopsisForm.urls }),
      });
      const d = await r.json();
      if (d.success) {
        toast('Synopsis saved — live in ~10s', 'success');
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
      <Head><title>Admin Login — SPY ON THE RISE</title></Head>
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
            <span style={{ fontSize:13, color:'var(--tx3)' }}>{stats.lastModified ? new Date(stats.lastModified).toLocaleString() : '—'}</span>
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
                  <td><span className="badge badge-series" style={{ fontSize:10 }}>{b.series?.replace('Anatomy of Micro-Societies','AMS').replace('The Mercer Files','Mercer').replace('The Crooked Cross Chronicles','CCC') || '—'}</span></td>
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
                        onClick={() => { setSynopsisBook(b); setSynopsisForm({ en:b.synopsis_en||b.synopsis||'', fr:b.synopsis_fr||'', es:b.synopsis_es||'', urls:b.retailerUrls||{} }); setActiveTab('en'); }}>
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
          <div className="panel-head"><span className="panel-title">Catalog Backups</span></div>
          <div className="panel-body">
            <p style={{ fontSize:13, color:'var(--tx2)', marginBottom:'1rem', lineHeight:1.6 }}>
              A backup is created automatically before every save operation. You can restore any backup — the current catalog is backed up first before restoring. Keep the last 20 backups maximum.
            </p>
            {backups.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">💾</div><div className="empty-msg">No backups yet — they are created automatically on first save.</div></div>
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

  const sections = {
    sitelock: { label:'Site Lock', icon:'🔒', render: () => <SiteLockPanel siteLocked={siteLocked} setSiteLocked={setSiteLocked} toast={toast} /> },
    dashboard: { label:'Dashboard', icon:'⬡', render: renderDashboard },
    catalog: { label:'Catalog', icon:'📚', render: renderCatalog },
    availability: { label:'Availability', icon:'🔓', render: renderAvailability },
    synopses: { label:'Synopses', icon:'✍️', render: renderSynopses },
    bundles: { label:'Bundles', icon:'📦', render: () => <BundleAdmin toast={toast} books={data?.books||[]} /> },
    messages: { label:'Messages', icon:'✉️', render: () => <MessagesBoard toast={toast} setUnreadCount={setUnreadCount} /> },
    backups: { label:'Backups', icon:'💾', render: renderBackups },
    settings: { label:'Settings', icon:'⚙️', render: renderSettings },
  };

  const currentSection = sections[activeSection] || sections.dashboard;

  return (
    <>
      <Head>
        <title>Admin — SPY ON THE RISE</title>
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
                      toast(d.locked ? '🔒 Site locked — Coming Soon visible' : '🌐 Site unlocked — fully live', d.locked ? 'warning' : 'success');
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
                    {!synopsisBook?.image && <div style={{fontSize:12,color:'var(--tx3)'}}>No cover image yet — click thumbnail to upload.</div>}
                  </div>
                </div>
              </div>
              <div className="tabs">
                {[['en','🇬🇧 English'],['fr','🇫🇷 French'],['es','🇪🇸 Spanish'],['urls','🔗 Retailer URLs']].map(([lang, label]) => (
                  <button key={lang} className={`tab-btn ${activeTab===lang?'active':''}`} onClick={() => setActiveTab(lang)}>{label}</button>
                ))}
              </div>
              {activeTab !== 'urls' ? (
                <>
                  <div className="field-row">
                    <label className="field-label">
                      {activeTab==='en'?'English Synopsis':activeTab==='fr'?'French Synopsis (FR edition only — no EN in FR text)':'Spanish Synopsis (ES edition only — no EN in ES text)'}
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
                <div className="two-col" style={{ marginTop:'1rem' }}>
                  {[
                    ['amazon_print','Amazon Print'],['amazon_ebook','Amazon eBook'],['amazon_audio','Amazon Audible'],
                    ['apple_books','Apple Books'],['apple_audio','Apple Audio'],['kobo','Kobo'],
                    ['bn','Barnes & Noble'],['smashwords','Smashwords'],['direct','Direct / Website'],
                  ].map(([key,label]) => (
                    <div className="field-row" key={key}>
                      <label className="field-label">{label}</label>
                      <input className="field-input" type="url" value={(synopsisForm.urls||{})[key]||''} onChange={e => setSynopsisForm(f => ({...f, urls:{...f.urls,[key]:e.target.value}}))} placeholder="https://" />
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
                  <input className="field-input" value={addForm.title||''} onChange={e=>setAddForm(f=>({...f,title:e.target.value}))} placeholder="e.g. The Mercer Files — Book 8" autoFocus />
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

// lib/adminCss.js — shared inline stylesheet for admin pages (dashboard,
// Texts of the Month manager). Kept as one string so every admin screen
// looks and behaves identically without duplicating the CSS per page.
export const ADMIN_CSS = `
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
  .status-pill{display:inline-flex;align-items:center;gap:5px;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:3px 9px;border-radius:20px;white-space:nowrap}
  .status-live{background:var(--greenbg);color:var(--greenb)}
  .status-scheduled{background:var(--bluebg);color:var(--blueb)}
  .status-draft{background:var(--surface3);color:var(--tx3)}
  .status-archived{background:var(--surface3);color:var(--tx2)}
  .status-hidden{background:var(--redbg);color:var(--redb)}
`;

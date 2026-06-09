// components/textes/EmailCaptureModal.jsx
// Modal for email capture — shown when user clicks "Read full text".

import { useState, useEffect, useRef } from 'react';

const UI = {
  fr: {
    title: 'Recevoir le texte complet',
    description: 'Entrez votre adresse email et nous vous envoyons le texte complet immédiatement.',
    placeholder: 'votre@email.com', submit: 'Envoyer le texte', sending: 'Envoi en cours…',
    successTitle: 'Envoyé !', successMsg: 'Vérifiez votre boîte de réception. Le texte complet vous a été envoyé.',
    close: 'Fermer', error: 'Une erreur est survenue. Veuillez réessayer.',
    invalid: 'Adresse email invalide.',
    privacy: "Votre email ne sera utilisé qu'à cette fin. Pas de spam.",
  },
  en: {
    title: 'Receive the full text',
    description: 'Enter your email address and we will send you the full text immediately.',
    placeholder: 'your@email.com', submit: 'Send me the text', sending: 'Sending…',
    successTitle: 'Sent!', successMsg: 'Check your inbox. The full text has been sent to you.',
    close: 'Close', error: 'An error occurred. Please try again.',
    invalid: 'Invalid email address.',
    privacy: 'Your email will only be used for this purpose. No spam.',
  },
  es: {
    title: 'Recibir el texto completo',
    description: 'Introduce tu dirección de email y te enviaremos el texto completo de inmediato.',
    placeholder: 'tu@email.com', submit: 'Enviarme el texto', sending: 'Enviando…',
    successTitle: '¡Enviado!', successMsg: 'Revisa tu bandeja de entrada. El texto completo te ha sido enviado.',
    close: 'Cerrar', error: 'Ocurrió un error. Por favor, inténtalo de nuevo.',
    invalid: 'Dirección de email inválida.',
    privacy: 'Tu email solo se usará para este fin. Sin spam.',
  },
};

export default function EmailCaptureModal({ isOpen, onClose, onSuccess, slug, lang = 'fr', title }) {
  const [email,  setEmail]  = useState('');
  const [status, setStatus] = useState('idle');
  const [errMsg, setErrMsg] = useState('');
  const inputRef = useRef(null);
  const ui = UI[lang] || UI.fr;

  useEffect(() => {
    if (isOpen) { setTimeout(() => inputRef.current?.focus(), 50); }
    else { setEmail(''); setStatus('idle'); setErrMsg(''); }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const validate = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate(email)) { setErrMsg(ui.invalid); return; }
    setErrMsg('');
    setStatus('loading');
    try {
      const res  = await fetch('/api/capture-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, slug, lang }),
      });
      const data = await res.json();
      if (!res.ok) { setErrMsg(data.error || ui.error); setStatus('error'); return; }
      setStatus('success');
      onSuccess?.();
    } catch {
      setErrMsg(ui.error); setStatus('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={ui.title}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <button className="modal__close" aria-label={ui.close} onClick={onClose} type="button">✕</button>
        {status === 'success' ? (
          <div className="modal__success">
            <div className="modal__success-icon" aria-hidden="true">✉</div>
            <h2 className="modal__success-title">{ui.successTitle}</h2>
            <p className="modal__success-msg">{ui.successMsg}</p>
            <button className="modal__submit" onClick={onClose} type="button">{ui.close}</button>
          </div>
        ) : (
          <>
            <h2 className="modal__title">{ui.title}</h2>
            {title && <p className="modal__book-title">« {title} »</p>}
            <p className="modal__description">{ui.description}</p>
            <form className="modal__form" onSubmit={handleSubmit} noValidate>
              <label htmlFor="modal-email" className="modal__label sr-only">Email</label>
              <input id="modal-email" ref={inputRef} type="email" inputMode="email" autoComplete="email"
                value={email} onChange={(e) => { setEmail(e.target.value); setErrMsg(''); }}
                placeholder={ui.placeholder}
                className={`modal__input${errMsg ? ' modal__input--error' : ''}`}
                disabled={status === 'loading'} required />
              {errMsg && <p className="modal__error" role="alert">{errMsg}</p>}
              <button type="submit" className="modal__submit" disabled={status === 'loading' || !email}>
                {status === 'loading' ? ui.sending : ui.submit}
              </button>
            </form>
            <p className="modal__privacy">{ui.privacy}</p>
          </>
        )}
      </div>
    </div>
  );
}

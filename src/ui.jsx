import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { SOURCES } from './lib/sources.js';

export function Cite({ id }) {
  const s = SOURCES[id];
  if (!s) return null;
  return (
    <a className="cite" href={s.url} target="_blank" rel="noreferrer" title={s.label} aria-label={`Source: ${s.label}`}>
      source
    </a>
  );
}

const TAG_TEXT = {
  published: 'Published',
  proposed: 'Proposed',
  sample: 'Sample',
  unstated: 'Not published',
};

export function Tag({ kind, children }) {
  return <span className={`tag tag-${kind}`}>{children ?? TAG_TEXT[kind]}</span>;
}

export function PageHead({ step, title, lede }) {
  return (
    <div className="pagehead">
      {step && <p className="eyebrow">Step {step}</p>}
      <h1>{title}</h1>
      {lede && <p className="lede">{lede}</p>}
    </div>
  );
}

export function NextStep({ href, label }) {
  return (
    <div className="nextstep">
      <a className="btn btn-dark" href={href}>
        {label}
      </a>
    </div>
  );
}

export function Modal({ title, onClose, children, footer }) {
  const ref = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    ref.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      prev?.focus?.();
    };
  }, [onClose]);
  return (
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref}>
        <div className="sheet-head">
          <button className="iconbtn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
          <h2>{title}</h2>
        </div>
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function Stepper({ value, onChange, min = 0, max = 9, label }) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`Remove one ${label}`}>
        −
      </button>
      <span aria-live="polite">{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`Add one ${label}`}>
        +
      </button>
    </div>
  );
}

export function Radio({ checked, onChange, title, sub, right, disabled, name }) {
  return (
    <label className={`radio ${checked ? 'on' : ''} ${disabled ? 'off' : ''}`}>
      <input type="radio" name={name} checked={checked} onChange={onChange} disabled={disabled} />
      <span className="radio-body">
        <strong>{title}</strong>
        {sub && <small>{sub}</small>}
      </span>
      {right && <span className="radio-right">{right}</span>}
      <i aria-hidden="true" />
    </label>
  );
}

export const MODELS = {
  agent: { name: 'Collection agent', sub: 'Partner stays the seller' },
  mor: { name: 'Merchant of record', sub: 'Airbnb resells the service' },
};

export function ModelToggle({ model, setModel }) {
  return (
    <div className="chips" role="group" aria-label="Payment model">
      {Object.entries(MODELS).map(([id, m]) => (
        <button key={id} className={`chip ${model === id ? 'on' : ''}`} aria-pressed={model === id} onClick={() => setModel(id)}>
          <strong>{m.name}</strong><small>{m.sub}</small>
        </button>
      ))}
    </div>
  );
}

// Illustration used in place of listing photography.
export function CottageArt({ className = '' }) {
  return (
    <svg className={`art ${className}`} viewBox="0 0 320 200" role="img" aria-label="Illustration of a small cottage at dusk" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3D4A7A" />
          <stop offset="0.65" stopColor="#E98A77" />
          <stop offset="1" stopColor="#F6C89F" />
        </linearGradient>
      </defs>
      <rect width="320" height="200" fill="url(#sky)" />
      <circle cx="252" cy="52" r="15" fill="#FBE6C4" />
      <path d="M0 158 Q 90 126 170 150 T 320 140 V200 H0Z" fill="#2F4A3C" />
      <path d="M0 178 Q 120 160 320 176 V200 H0Z" fill="#22382D" />
      <rect x="104" y="98" width="112" height="66" fill="#F3EBDD" />
      <path d="M92 102 L160 58 L228 102Z" fill="#7A3B3B" />
      <rect x="148" y="124" width="24" height="40" fill="#34495E" />
      <rect x="116" y="116" width="22" height="20" fill="#FFD27A" />
      <rect x="182" y="116" width="22" height="20" fill="#FFD27A" />
      <rect x="96" y="160" width="128" height="6" fill="#B79F85" />
    </svg>
  );
}

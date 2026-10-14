import React from 'react';
import { ArrowRight } from './Icons';
import { portalCards } from '../data/sampleData';

export const CustomerPortal: React.FC = () => {
  const totalCards = portalCards.reduce((sum, c) => sum + c.count, 0);

  return (
    <div style={{
      background: 'var(--color-white)',
      borderRadius: '14px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06)',
      overflow: 'hidden',
      width: '100%',
      maxWidth: '480px',
      border: '1px solid var(--color-border)',
      fontSize: '0.82rem',
    }}>
      {/* Portal header */}
      <div style={{
        background: 'var(--color-navy)',
        padding: '14px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.92rem', letterSpacing: '0.02em' }}>THE CARD VAULT</span>
        <div style={{ display: 'flex', gap: '20px' }}>
          {['Sell Cards', 'How It Works', 'FAQ', 'Contact'].map((l) => (
            <span key={l} style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.72rem', cursor: 'pointer' }}>{l}</span>
          ))}
        </div>
      </div>

      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-navy) 0%, var(--color-navy-light) 100%)',
        padding: '24px 20px',
        color: '#fff',
      }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '6px' }}>Sell Your Cards to The Card Vault</h3>
        <p style={{ fontSize: '0.78rem', opacity: 0.75, lineHeight: 1.5 }}>Get a fair offer for your trading cards. Fast, easy and secure.</p>
      </div>

      {/* Steps */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--color-border)',
      }}>
        {[
          { num: '1', label: 'Add Cards', active: false, done: true },
          { num: '2', label: 'Review', active: true, done: false },
          { num: '3', label: 'Submit', active: false, done: false },
        ].map((step, i) => (
          <div key={i} style={{
            flex: 1,
            padding: '14px',
            textAlign: 'center',
            borderBottom: step.active ? '3px solid var(--color-blue)' : '3px solid transparent',
            background: step.active ? 'var(--color-bg)' : 'transparent',
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: step.done ? 'var(--color-green)' : step.active ? 'var(--color-blue)' : 'var(--color-border)',
              color: '#fff',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.72rem', fontWeight: 700, marginBottom: '5px',
            }}>
              {step.done ? '✓' : step.num}
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: step.active ? 600 : 400, color: step.active ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
              {step.label}
            </div>
          </div>
        ))}
      </div>

      {/* Card thumbnails row */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Uploaded Photos</span>
          <button style={{
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            padding: '5px 12px',
            fontSize: '0.72rem',
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}>
            + Add More
          </button>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['/images/cards-fanned.png', '/images/cards-grid.png', '/images/cards-collection.png', '/images/cards-display.png'].map((src, i) => (
            <div key={i} style={{
              width: '52px', height: '52px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0,
            }}>
              <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
            </div>
          ))}
          <div style={{
            width: '52px', height: '52px', borderRadius: '6px',
            border: '1.5px dashed var(--color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-text-muted)', fontSize: '1.2rem', flexShrink: 0,
          }}>+</div>
        </div>
      </div>

      {/* Collection summary */}
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h4 style={{ fontSize: '0.88rem', fontWeight: 700 }}>Collection Summary</h4>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{totalCards} cards added</span>
        </div>

        {portalCards.map((card, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '11px 0',
            borderBottom: i < portalCards.length - 1 ? '1px solid var(--color-border)' : 'none',
          }}>
            <div>
              <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{card.game}</span>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', marginLeft: '8px' }}>({card.count})</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{card.value}</span>
          </div>
        ))}

        {/* Estimated offer */}
        <div style={{
          marginTop: '18px',
          padding: '18px',
          background: 'var(--color-bg)',
          borderRadius: '10px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginBottom: '5px' }}>Estimated Offer</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em' }}>£620 – £710</div>
          <div style={{ fontSize: '0.66rem', color: 'var(--color-text-muted)', marginTop: '3px' }}>Final offer after review</div>
        </div>

        <button style={{
          width: '100%',
          marginTop: '14px',
          background: 'var(--color-blue)',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          padding: '14px',
          fontWeight: 700,
          fontSize: '0.92rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontFamily: 'inherit',
        }}>
          Continue <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

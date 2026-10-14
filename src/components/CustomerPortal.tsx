import React from 'react';
import { ArrowRight } from './Icons';
import { portalCards } from '../data/sampleData';

export const CustomerPortal: React.FC = () => {
  const totalCards = portalCards.reduce((sum, c) => sum + c.count, 0);

  return (
    <div style={{
      background: 'var(--color-white)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-xl)',
      overflow: 'hidden',
      width: '100%',
      maxWidth: '480px',
      border: '1px solid var(--color-border)',
      fontSize: '0.8rem',
    }}>
      {/* Portal header */}
      <div style={{
        background: 'var(--color-navy)',
        padding: 'var(--space-md) var(--space-lg)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>THE CARD VAULT</span>
        <div style={{ display: 'flex', gap: 'var(--space-lg)' }}>
          {['Sell Cards', 'How It Works', 'FAQ', 'Contact'].map((l) => (
            <span key={l} style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', cursor: 'pointer' }}>{l}</span>
          ))}
        </div>
      </div>

      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-navy) 0%, var(--color-navy-light) 100%)',
        padding: 'var(--space-xl) var(--space-lg)',
        color: '#fff',
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '4px' }}>Sell Your Cards to The Card Vault</h3>
        <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>Get a fair offer for your trading cards. Fast, easy and secure.</p>
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
            padding: 'var(--space-md)',
            textAlign: 'center',
            borderBottom: step.active ? '3px solid var(--color-blue)' : '3px solid transparent',
            background: step.active ? 'var(--color-bg)' : 'transparent',
          }}>
            <div style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: step.done ? 'var(--color-green)' : step.active ? 'var(--color-blue)' : 'var(--color-border)',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              fontWeight: 700,
              marginBottom: '4px',
            }}>
              {step.done ? '✓' : step.num}
            </div>
            <div style={{ fontSize: '0.7rem', fontWeight: step.active ? 600 : 400, color: step.active ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
              {step.label}
            </div>
          </div>
        ))}
      </div>

      {/* Add More button */}
      <div style={{ padding: 'var(--space-md) var(--space-lg)', borderBottom: '1px solid var(--color-border)', textAlign: 'right' }}>
        <button style={{
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '6px 14px',
          fontSize: '0.75rem',
          fontWeight: 500,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}>
          + Add More
        </button>
      </div>

      {/* Collection summary */}
      <div style={{ padding: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Collection Summary</h4>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{totalCards} cards added</span>
        </div>

        {portalCards.map((card, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 0',
            borderBottom: i < portalCards.length - 1 ? '1px solid var(--color-border)' : 'none',
          }}>
            <div>
              <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{card.game}</span>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem', marginLeft: '6px' }}>({card.count})</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{card.value}</span>
          </div>
        ))}

        {/* Estimated offer */}
        <div style={{
          marginTop: 'var(--space-lg)',
          padding: 'var(--space-md)',
          background: 'var(--color-bg)',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Estimated Offer</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>£620 – £710</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>Final offer after review</div>
        </div>

        <button style={{
          width: '100%',
          marginTop: 'var(--space-md)',
          background: 'var(--color-blue)',
          color: '#fff',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          padding: '14px',
          fontWeight: 700,
          fontSize: '0.9rem',
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

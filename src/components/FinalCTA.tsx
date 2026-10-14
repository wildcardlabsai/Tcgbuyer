import React from 'react';
import { Button } from './Button';
import { ArrowRight } from './Icons';

export const FinalCTA: React.FC = () => (
  <section style={{
    padding: 'var(--space-5xl) 0',
    background: 'var(--color-navy)',
    color: '#fff',
  }}>
    <div className="container" style={{ textAlign: 'center', maxWidth: '600px' }}>
      <h2 style={{
        fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
        fontWeight: 900,
        lineHeight: 1.15,
        marginBottom: 'var(--space-md)',
        letterSpacing: '-0.02em',
      }}>
        Make buying collections<br />easier to manage.
      </h2>
      <p style={{
        fontSize: '1rem',
        opacity: 0.8,
        lineHeight: 1.7,
        marginBottom: 'var(--space-xl)',
      }}>
        Give your shop a more organised way to receive submissions, review collections and manage buying activity.
      </p>
      <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button variant="primary">Get Started <ArrowRight size={14} /></Button>
        <button style={{
          background: 'transparent',
          color: '#fff',
          border: '1.5px solid rgba(255,255,255,0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 28px',
          fontSize: '0.95rem',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'}
        >
          Explore the features
        </button>
      </div>
    </div>
  </section>
);

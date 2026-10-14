import React from 'react';
import { DealerDashboard } from './DealerDashboard';

export const ProductShowcase: React.FC = () => (
  <section id="features" style={{
    padding: 'var(--space-4xl) 0',
    background: 'var(--color-bg)',
  }}>
    <div className="container" style={{ maxWidth: '1100px' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)', maxWidth: '620px', margin: '0 auto var(--space-2xl)' }}>
        <p className="section-label" style={{ textAlign: 'center' }}>INSIDE TCGBUYER</p>
        <h2 style={{
          fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
          fontWeight: 900,
          lineHeight: 1.15,
          marginBottom: 'var(--space-md)',
          letterSpacing: '-0.02em',
        }}>
          One buying workflow.<br />From submission to purchase.
        </h2>
        <p style={{
          fontSize: '1.05rem',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.7,
        }}>
          Give your team a clearer view of incoming collections, the offers you&rsquo;re making and what needs attention next.
        </p>
      </div>

      <DealerDashboard />
    </div>
  </section>
);

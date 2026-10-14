import React from 'react';

const BenefitIcon: React.FC<{ d: string }> = ({ d }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-navy)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const benefits = [
  {
    icon: <BenefitIcon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />,
    text: 'Built for TCG dealers',
  },
  {
    icon: <BenefitIcon d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />,
    text: 'Your own buying portal',
  },
  {
    icon: <BenefitIcon d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M8 2h8v4H8z" />,
    text: 'Collection management',
  },
  {
    icon: <BenefitIcon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    text: 'Designed around the buying process',
  },
];

export const CredibilityStrip: React.FC = () => (
  <section style={{
    borderTop: '1px solid var(--color-border)',
    borderBottom: '1px solid var(--color-border)',
    padding: 'var(--space-xl) 0',
    background: 'var(--color-white)',
  }}>
    <div className="container">
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 'var(--space-3xl)',
        flexWrap: 'wrap',
      }} className="credibility-items">
        {benefits.map((b, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.85rem',
            fontWeight: 500,
            color: 'var(--color-text-secondary)',
          }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'var(--color-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {b.icon}
            </div>
            {b.text}
          </div>
        ))}
      </div>
    </div>
  </section>
);

import React from 'react';
import { UploadIcon, ClipboardIcon, SettingsIcon } from './Icons';

const steps = [
  {
    num: '01',
    icon: <UploadIcon />,
    title: 'Give collectors a clear place to sell',
    desc: 'Give customers a dedicated online destination where they can submit their cards to your shop.',
  },
  {
    num: '02',
    icon: <ClipboardIcon />,
    title: 'Keep submissions organised',
    desc: 'Review incoming collections, track progress and keep buying activity in one place.',
  },
  {
    num: '03',
    icon: <SettingsIcon />,
    title: 'Stay in control of your offers',
    desc: "Build a buying workflow around your shop's own approach to pricing and purchasing.",
  },
];

export const ProblemSolution: React.FC = () => (
  <section id="for-dealers" style={{ padding: 'var(--space-4xl) 0', background: 'var(--color-white)' }}>
    <div className="container">
      <div className="problem-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--space-3xl)',
        alignItems: 'center',
        marginBottom: 'var(--space-3xl)',
      }}>
        <div>
          <p className="section-label">THE BUYING PROCESS, SIMPLIFIED</p>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            marginBottom: 'var(--space-lg)',
            letterSpacing: '-0.02em',
          }}>
            Buying collections shouldn&rsquo;t mean juggling everything else.
          </h2>
          <p style={{
            fontSize: '1rem',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.7,
            maxWidth: '480px',
          }}>
            Between incoming enquiries, card lists, pricing, offers and customer messages, buying collections can quickly become difficult to manage. TCGBuyer is designed to bring that process into one organised workflow.
          </p>
        </div>
        <div style={{ position: 'relative' }}>
          <img
            src="/images/cards-stacked.png"
            alt="Trading card collections on a dealer's desk"
            style={{
              width: '100%',
              borderRadius: 'var(--radius-lg)',
              objectFit: 'cover',
              aspectRatio: '4/3',
            }}
          />
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--space-xl)',
      }} className="steps-grid">
        {steps.map((step) => (
          <div key={step.num} style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <span style={{
                background: 'var(--color-blue)',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
              }}>{step.num}</span>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'var(--color-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-navy)',
              }}>
                {step.icon}
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>{step.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

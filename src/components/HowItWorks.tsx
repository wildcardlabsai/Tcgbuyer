import React from 'react';
import { UploadIcon, SearchIcon, CheckIcon, ArrowRight } from './Icons';

const steps = [
  {
    num: '01',
    icon: <UploadIcon />,
    title: 'Collect',
    desc: 'Give collectors a dedicated place to submit their cards or collections.',
    color: 'var(--color-blue)',
  },
  {
    num: '02',
    icon: <SearchIcon />,
    title: 'Review',
    desc: 'Assess incoming submissions and review the information needed to make an offer.',
    color: 'var(--color-violet)',
  },
  {
    num: '03',
    icon: <CheckIcon />,
    title: 'Complete',
    desc: 'Manage the next steps and track progress through your buying workflow.',
    color: 'var(--color-green)',
  },
];

export const HowItWorks: React.FC = () => (
  <section id="how-it-works" style={{ padding: 'var(--space-4xl) 0', background: 'var(--color-bg)' }}>
    <div className="container">
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
        <p className="section-label" style={{ textAlign: 'center' }}>A CLEARER WAY TO BUY CARDS</p>
        <h2 style={{
          fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
          fontWeight: 900,
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
        }}>
          From first submission to final offer.
        </h2>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--space-xl)',
        position: 'relative',
      }} className="how-it-works-grid">
        {steps.map((step, i) => (
          <React.Fragment key={step.num}>
            <div style={{
              background: 'var(--color-white)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-xl)',
              border: '1px solid var(--color-border)',
              textAlign: 'center',
              position: 'relative',
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)', alignItems: 'center' }}>
                <span style={{
                  background: step.color,
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
                  color: step.color,
                }}>
                  {step.icon}
                </div>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>{step.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{step.desc}</p>
            </div>
            {i < steps.length - 1 && (
              <div className="step-arrow" style={{
                position: 'absolute',
                left: `${(i + 1) * 33.33 - 2}%`,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
                zIndex: 1,
              }}>
                <ArrowRight size={20} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  </section>
);

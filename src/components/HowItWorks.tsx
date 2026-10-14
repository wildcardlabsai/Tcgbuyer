import React from 'react';
import { ArrowRight } from './Icons';

const steps = [
  {
    num: '01',
    title: 'Collect',
    desc: 'Give collectors a dedicated place to submit their cards or collections.',
    color: 'var(--color-blue)',
    image: '/images/phone-app.png',
  },
  {
    num: '02',
    title: 'Review',
    desc: 'Assess incoming submissions and review the information needed to make an offer.',
    color: 'var(--color-violet)',
    image: '/images/handoff.png',
  },
  {
    num: '03',
    title: 'Complete',
    desc: 'Manage the next steps and track progress through your buying workflow.',
    color: 'var(--color-green)',
    image: '/images/cards-cash.png',
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
              borderRadius: '14px',
              border: '1px solid var(--color-border)',
              overflow: 'hidden',
              position: 'relative',
            }}>
              <div style={{
                width: '100%',
                height: '140px',
                overflow: 'hidden',
                background: 'var(--color-bg)',
              }}>
                <img
                  src={step.image}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  loading="lazy"
                />
              </div>
              <div style={{ padding: '20px 22px 24px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
                  <span style={{
                    background: step.color,
                    color: '#fff',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '6px',
                  }}>{step.num}</span>
                </div>
                <h3 style={{ fontSize: '1.12rem', fontWeight: 700, marginBottom: '8px' }}>{step.title}</h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
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

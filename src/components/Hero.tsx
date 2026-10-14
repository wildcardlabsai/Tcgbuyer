import React from 'react';
import { Button } from './Button';
import { ArrowRight, PlayIcon } from './Icons';
import { HeroPreview } from './HeroPreview';

export const Hero: React.FC = () => (
  <section style={{
    paddingTop: 'calc(var(--nav-height) + 48px)',
    paddingBottom: 'var(--space-4xl)',
    position: 'relative',
    overflow: 'visible',
  }}>
    <div className="container">
      <div className="hero-grid" style={{
        display: 'grid',
        gridTemplateColumns: '0.45fr 0.55fr',
        gap: 'var(--space-2xl)',
        alignItems: 'center',
      }}>
        <div>
          <p className="section-label">TCG BUYING SOFTWARE FOR DEALERS</p>
          <h1 style={{
            fontSize: 'clamp(2rem, 3.5vw, 3rem)',
            fontWeight: 900,
            lineHeight: 1.08,
            marginBottom: 'var(--space-lg)',
            color: 'var(--color-text)',
            letterSpacing: '-0.02em',
          }}>
            Your next<br />collection<br />
            <span style={{
              background: 'linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>starts here.</span>
          </h1>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.7,
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-xl)',
            maxWidth: '440px',
          }}>
            TCGBuyer gives trading card shops their own online buying portal, making it easier for collectors to submit cards and for dealers to manage the buying process from one place.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
            <Button variant="primary">Get Started <ArrowRight size={14} /></Button>
            <Button variant="secondary"><PlayIcon size={16} /> See How It Works</Button>
          </div>
          <p style={{
            marginTop: 'var(--space-md)',
            fontSize: '0.8rem',
            color: 'var(--color-text-muted)',
          }}>
            Built for the shops that buy cards.
          </p>
        </div>

        <div className="hero-preview" style={{
          position: 'relative',
          paddingBottom: '40px',
          paddingRight: '16px',
        }}>
          <HeroPreview />
        </div>
      </div>
    </div>
  </section>
);

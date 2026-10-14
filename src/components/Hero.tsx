import React from 'react';
import { Button } from './Button';
import { ArrowRight, PlayIcon } from './Icons';
import { HeroPreview } from './HeroPreview';

export const Hero: React.FC = () => (
  <section style={{
    paddingTop: 'calc(var(--nav-height) + 56px)',
    paddingBottom: '120px',
    position: 'relative',
    overflow: 'visible',
    background: 'var(--color-white)',
  }}>
    <div className="container" style={{ maxWidth: '1280px' }}>
      <div className="hero-grid" style={{
        display: 'grid',
        gridTemplateColumns: '0.42fr 0.58fr',
        gap: 'var(--space-3xl)',
        alignItems: 'center',
      }}>
        <div>
          <p className="section-label" style={{ marginBottom: 'var(--space-md)' }}>TCG BUYING SOFTWARE FOR DEALERS</p>
          <h1 style={{
            fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)',
            fontWeight: 900,
            lineHeight: 1.06,
            marginBottom: 'var(--space-lg)',
            color: 'var(--color-text)',
            letterSpacing: '-0.025em',
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
            fontSize: '1.05rem',
            lineHeight: 1.7,
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-xl)',
            maxWidth: '420px',
          }}>
            TCGBuyer gives trading card shops their own online buying portal, making it easier for collectors to submit cards and for dealers to manage the buying process from one place.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
            <Button variant="primary">Get Started <ArrowRight size={14} /></Button>
            <Button variant="secondary"><PlayIcon size={16} /> See How It Works</Button>
          </div>
          <p style={{
            fontSize: '0.82rem',
            color: 'var(--color-text-muted)',
          }}>
            Built for the shops that buy cards.
          </p>
        </div>

        <div className="hero-preview" style={{
          position: 'relative',
          paddingBottom: '48px',
          paddingRight: '20px',
        }}>
          <HeroPreview />
        </div>
      </div>
    </div>
  </section>
);

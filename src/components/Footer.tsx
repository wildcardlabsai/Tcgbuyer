import React from 'react';
import { Logo } from './Logo';

const footerLinks = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'For Dealers', href: '#for-dealers' },
  { label: 'Features', href: '#features' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
];

const legalLinks = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
];

export const Footer: React.FC = () => (
  <footer style={{
    padding: 'var(--space-2xl) 0',
    background: 'var(--color-white)',
    borderTop: '1px solid var(--color-border)',
  }}>
    <div className="container">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 'var(--space-lg)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
          <Logo height={24} />
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            TCGBuyer is buying software designed<br />for trading card game dealers.
          </span>
        </div>

        <nav style={{ display: 'flex', gap: 'var(--space-xl)', flexWrap: 'wrap' }}>
          {footerLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <nav style={{ display: 'flex', gap: 'var(--space-lg)' }}>
          {legalLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  </footer>
);

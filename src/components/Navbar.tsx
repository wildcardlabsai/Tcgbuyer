import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { Button } from './Button';
import { MenuIcon, CloseIcon, ArrowRight } from './Icons';

const navLinks = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'For Dealers', href: '#for-dealers' },
  { label: 'Features', href: '#features' },
  { label: 'FAQ', href: '#faq' },
];

export const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      height: 'var(--nav-height)',
      display: 'flex',
      alignItems: 'center',
      background: scrolled ? 'rgba(255,255,255,0.95)' : 'var(--color-white)',
      backdropFilter: scrolled ? 'blur(10px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--color-border)' : '1px solid transparent',
      transition: 'all 0.3s ease',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <a href="#" aria-label="TCGBuyer home"><Logo height={30} /></a>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xl)' }}>
          <ul style={{
            display: 'flex',
            listStyle: 'none',
            gap: 'var(--space-xl)',
            alignItems: 'center',
          }} className="nav-links">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    color: 'var(--color-text-secondary)',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <Button variant="primary" size="sm">
            Get Started <ArrowRight size={14} />
          </Button>
        </div>

        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          style={{ display: 'none' }}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-menu" style={{
          position: 'absolute',
          top: 'var(--nav-height)',
          left: 0,
          right: 0,
          background: 'var(--color-white)',
          borderBottom: '1px solid var(--color-border)',
          padding: 'var(--space-lg) var(--space-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-md)',
        }}>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{ fontSize: '1rem', fontWeight: 500, padding: 'var(--space-sm) 0', color: 'var(--color-text)' }}
            >
              {link.label}
            </a>
          ))}
          <Button variant="primary" size="sm">
            Get Started <ArrowRight size={14} />
          </Button>
        </div>
      )}
    </nav>
  );
};

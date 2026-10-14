import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../../components/Logo';

export const NotFoundPage: React.FC = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--color-bg)', padding: '16px',
  }}>
    <div style={{ textAlign: 'center', maxWidth: '480px' }}>
      <Link to="/" style={{ display: 'inline-block', marginBottom: '32px' }}>
        <Logo height={28} />
      </Link>
      <h1 style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '8px' }}>404</h1>
      <p style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '12px' }}>Page not found</p>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', marginBottom: '32px', lineHeight: 1.6 }}>
        The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
      </p>
      <Link
        to="/"
        style={{
          display: 'inline-block', padding: '12px 32px', background: 'var(--color-blue)',
          color: '#fff', borderRadius: '8px', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none',
        }}
      >
        Go home
      </Link>
    </div>
  </div>
);

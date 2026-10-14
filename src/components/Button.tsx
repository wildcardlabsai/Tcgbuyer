import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

const styles: Record<string, React.CSSProperties> = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: 600,
    borderRadius: '10px',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  primary: {
    background: 'var(--color-blue)',
    color: '#fff',
    padding: '14px 28px',
    fontSize: '0.95rem',
  },
  secondary: {
    background: 'var(--color-white)',
    color: 'var(--color-text)',
    padding: '14px 28px',
    fontSize: '0.95rem',
    border: '1.5px solid var(--color-border)',
  },
  outline: {
    background: 'transparent',
    color: 'var(--color-text)',
    padding: '14px 28px',
    fontSize: '0.95rem',
    border: '1.5px solid var(--color-border)',
  },
  sm: { padding: '10px 20px', fontSize: '0.875rem' },
  lg: { padding: '16px 32px', fontSize: '1rem' },
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  className,
}) => (
  <button
    onClick={onClick}
    className={className}
    style={{
      ...styles.base,
      ...styles[variant],
      ...(size !== 'md' ? styles[size] : {}),
    }}
    onMouseEnter={(e) => {
      if (variant === 'primary') e.currentTarget.style.background = '#1d4ed8';
      else e.currentTarget.style.background = 'var(--color-bg)';
    }}
    onMouseLeave={(e) => {
      if (variant === 'primary') e.currentTarget.style.background = 'var(--color-blue)';
      else e.currentTarget.style.background = variant === 'secondary' ? 'var(--color-white)' : 'transparent';
    }}
  >
    {children}
  </button>
);

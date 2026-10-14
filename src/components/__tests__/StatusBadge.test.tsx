import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge', () => {
  it('renders the status text', () => {
    render(<StatusBadge status="New" />);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('applies known status colours', () => {
    render(<StatusBadge status="Declined" />);
    const badge = screen.getByText('Declined');
    expect(badge.style.background).toBe('rgb(254, 226, 226)');
    expect(badge.style.color).toBe('rgb(153, 27, 27)');
  });

  it('falls back to neutral style for unknown statuses', () => {
    render(<StatusBadge status="Unknown" />);
    const badge = screen.getByText('Unknown');
    expect(badge.style.background).toBe('rgb(243, 244, 246)');
  });
});

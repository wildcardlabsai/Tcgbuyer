import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { NotFoundPage } from '../public/NotFoundPage';

describe('NotFoundPage', () => {
  it('renders 404 heading', () => {
    render(<MemoryRouter><NotFoundPage /></MemoryRouter>);
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('shows descriptive message', () => {
    render(<MemoryRouter><NotFoundPage /></MemoryRouter>);
    expect(screen.getByText('Page not found')).toBeInTheDocument();
  });

  it('has a link back to home', () => {
    render(<MemoryRouter><NotFoundPage /></MemoryRouter>);
    const link = screen.getByText('Go home');
    expect(link).toHaveAttribute('href', '/');
  });
});

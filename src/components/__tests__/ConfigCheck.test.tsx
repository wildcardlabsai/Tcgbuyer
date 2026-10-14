import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

describe('ConfigCheck', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('renders children when supabase is configured', async () => {
    vi.doMock('../../lib/supabase', () => ({
      supabaseConfigured: true,
    }));
    const { ConfigCheck } = await import('../ConfigCheck');
    render(<ConfigCheck><p>App content</p></ConfigCheck>);
    expect(screen.getByText('App content')).toBeInTheDocument();
  });

  it('shows configuration warning when supabase is not configured', async () => {
    vi.doMock('../../lib/supabase', () => ({
      supabaseConfigured: false,
    }));
    const { ConfigCheck } = await import('../ConfigCheck');
    render(<ConfigCheck><p>App content</p></ConfigCheck>);
    expect(screen.getByText('Configuration Required')).toBeInTheDocument();
    expect(screen.queryByText('App content')).not.toBeInTheDocument();
    expect(screen.getByText(/VITE_SUPABASE_URL/)).toBeInTheDocument();
  });
});

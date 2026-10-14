import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('supabase module', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('exports supabaseConfigured as false when env vars are missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
    const mod = await import('../supabase');
    expect(mod.supabaseConfigured).toBe(false);
  });

  it('exports supabaseConfigured as true when env vars are set', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key-123');
    const mod = await import('../supabase');
    expect(mod.supabaseConfigured).toBe(true);
  });
});

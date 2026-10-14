import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Logo } from '../../components/Logo';
import type { DealerApplication } from '../../lib/database.types';

const TCG_CATEGORIES = [
  'Pokémon', 'Magic: The Gathering', 'Yu-Gi-Oh!', 'Dragon Ball Super',
  'One Piece', 'Flesh and Blood', 'Lorcana', 'Other',
];

const BUSINESS_TYPES = [
  'Independent card shop', 'Online retailer', 'Market stall / fair trader',
  'Game café or club', 'Established dealer / wholesaler', 'Other',
];

const PURCHASE_VOLUMES = [
  'Just starting out', 'Under £500/month', '£500–£2,000/month',
  '£2,000–£5,000/month', '£5,000–£10,000/month', 'Over £10,000/month',
];

interface FormData {
  business_name: string;
  applicant_name: string;
  email: string;
  phone: string;
  country: string;
  business_address: string;
  website_url: string;
  business_type: string;
  tcg_categories: string[];
  has_physical_shop: boolean;
  has_online_shop: boolean;
  estimated_monthly_purchases: string;
  business_description: string;
  agreed_to_terms: boolean;
}

const initial: FormData = {
  business_name: '', applicant_name: '', email: '', phone: '',
  country: 'United Kingdom', business_address: '', website_url: '',
  business_type: '', tcg_categories: [],
  has_physical_shop: false, has_online_shop: false,
  estimated_monthly_purchases: '', business_description: '',
  agreed_to_terms: false,
};

export const ApplyPage: React.FC = () => {
  const [form, setForm] = useState<FormData>(initial);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<DealerApplication | null>(null);
  const [serverError, setServerError] = useState('');

  const set = (field: keyof FormData, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const toggleCategory = (cat: string) => {
    setForm(prev => ({
      ...prev,
      tcg_categories: prev.tcg_categories.includes(cat)
        ? prev.tcg_categories.filter(c => c !== cat)
        : [...prev.tcg_categories, cat],
    }));
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.business_name.trim()) e.business_name = 'Business name is required';
    if (!form.applicant_name.trim()) e.applicant_name = 'Your name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.country.trim()) e.country = 'Country is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!form.business_type) e.business_type = 'Select a business type';
    if (form.tcg_categories.length === 0) e.tcg_categories = 'Select at least one category';
    if (!form.has_physical_shop && !form.has_online_shop) e.has_physical_shop = 'Select at least one';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const e: Record<string, string> = {};
    if (!form.agreed_to_terms) e.agreed_to_terms = 'You must agree to the terms';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;
    setSubmitting(true);
    setServerError('');

    const { data, error } = await supabase
      .from('dealer_applications')
      .insert({
        business_name: form.business_name.trim(),
        applicant_name: form.applicant_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || null,
        country: form.country,
        business_address: form.business_address.trim() || null,
        website_url: form.website_url.trim() || null,
        business_type: form.business_type,
        tcg_categories: form.tcg_categories,
        has_physical_shop: form.has_physical_shop,
        has_online_shop: form.has_online_shop,
        estimated_monthly_purchases: form.estimated_monthly_purchases || null,
        business_description: form.business_description.trim() || null,
        agreed_to_terms: true,
        agreed_at: new Date().toISOString(),
        status: 'submitted',
        reference: '', // trigger generates this
      })
      .select()
      .single();

    setSubmitting(false);
    if (error) {
      setServerError(error.message);
    } else {
      setSubmitted(data as DealerApplication);
    }
  };

  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-bg)', padding: '16px',
      }}>
        <div style={{
          width: '100%', maxWidth: '520px', background: 'var(--color-white)',
          borderRadius: '16px', border: '1px solid var(--color-border)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.08)', padding: '48px', textAlign: 'center',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: '#dcfce7',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', fontSize: '1.8rem', color: '#16a34a',
          }}>✓</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '12px' }}>Application submitted</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '20px' }}>
            Thank you for applying to join TCGBuyer. Your application reference is:
          </p>
          <div style={{
            background: 'var(--color-bg)', borderRadius: '10px', padding: '16px',
            fontSize: '1.3rem', fontWeight: 800, letterSpacing: '0.02em', marginBottom: '24px',
          }}>
            {submitted.reference}
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '32px' }}>
            We&rsquo;ll review your application and get back to you by email at <strong>{submitted.email}</strong>.
            This usually takes one to two working days.
          </p>
          <Link to="/" style={{
            display: 'inline-block', padding: '12px 28px', background: 'var(--color-blue)',
            color: '#fff', borderRadius: '8px', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none',
          }}>
            Back to homepage
          </Link>
        </div>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    border: '1px solid var(--color-border)', fontSize: '0.92rem',
    fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  };

  const errorInputStyle: React.CSSProperties = { ...inputStyle, borderColor: '#ef4444' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '32px 16px' }}>
      <div style={{ maxWidth: '620px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ display: 'inline-block', marginBottom: '24px' }}>
            <Logo height={28} />
          </Link>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '8px' }}>Apply to join TCGBuyer</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Tell us about your business and we&rsquo;ll set up your dealer account
          </p>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
          {['Business Info', 'Business Details', 'Review & Submit'].map((label, i) => (
            <div key={label} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                height: '4px', borderRadius: '2px', marginBottom: '8px',
                background: step > i ? 'var(--color-blue)' : step === i + 1 ? 'var(--color-blue)' : 'var(--color-border)',
                opacity: step === i + 1 ? 1 : step > i ? 0.5 : 0.3,
              }} />
              <span style={{ fontSize: '0.76rem', fontWeight: step === i + 1 ? 700 : 400, color: step === i + 1 ? 'var(--color-blue)' : 'var(--color-text-muted)' }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        <div style={{
          background: 'var(--color-white)', borderRadius: '16px', border: '1px solid var(--color-border)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)', padding: '32px',
        }}>
          {serverError && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
              padding: '12px 16px', marginBottom: '20px', color: '#dc2626', fontSize: '0.88rem',
            }}>{serverError}</div>
          )}

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '20px' }}>Business information</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '6px' }}>Business name *</label>
                    <input value={form.business_name} onChange={e => set('business_name', e.target.value)} style={errors.business_name ? errorInputStyle : inputStyle} placeholder="The Card Vault" />
                    {errors.business_name && <span style={{ color: '#ef4444', fontSize: '0.78rem' }}>{errors.business_name}</span>}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '6px' }}>Your name *</label>
                    <input value={form.applicant_name} onChange={e => set('applicant_name', e.target.value)} style={errors.applicant_name ? errorInputStyle : inputStyle} placeholder="John Smith" />
                    {errors.applicant_name && <span style={{ color: '#ef4444', fontSize: '0.78rem' }}>{errors.applicant_name}</span>}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '6px' }}>Email *</label>
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)} style={errors.email ? errorInputStyle : inputStyle} placeholder="you@business.com" />
                    {errors.email && <span style={{ color: '#ef4444', fontSize: '0.78rem' }}>{errors.email}</span>}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '6px' }}>Phone</label>
                    <input value={form.phone} onChange={e => set('phone', e.target.value)} style={inputStyle} placeholder="+44 7700 900000" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '6px' }}>Country *</label>
                    <input value={form.country} onChange={e => set('country', e.target.value)} style={errors.country ? errorInputStyle : inputStyle} />
                    {errors.country && <span style={{ color: '#ef4444', fontSize: '0.78rem' }}>{errors.country}</span>}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '6px' }}>Business address</label>
                    <input value={form.business_address} onChange={e => set('business_address', e.target.value)} style={inputStyle} placeholder="Optional" />
                  </div>
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '6px' }}>Website</label>
                  <input value={form.website_url} onChange={e => set('website_url', e.target.value)} style={inputStyle} placeholder="https://yourcardshop.com" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={handleNext} style={{
                    padding: '12px 32px', background: 'var(--color-blue)', color: '#fff', border: 'none',
                    borderRadius: '8px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit',
                  }}>Continue</button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '20px' }}>Business details</h2>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '8px' }}>Type of business *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {BUSINESS_TYPES.map(bt => (
                      <button key={bt} type="button" onClick={() => set('business_type', bt)} style={{
                        padding: '10px 14px', borderRadius: '8px', textAlign: 'left', fontSize: '0.86rem',
                        border: form.business_type === bt ? '2px solid var(--color-blue)' : '1px solid var(--color-border)',
                        background: form.business_type === bt ? '#eff6ff' : 'var(--color-white)',
                        fontWeight: form.business_type === bt ? 600 : 400, cursor: 'pointer', fontFamily: 'inherit',
                      }}>{bt}</button>
                    ))}
                  </div>
                  {errors.business_type && <span style={{ color: '#ef4444', fontSize: '0.78rem' }}>{errors.business_type}</span>}
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '8px' }}>TCG categories you buy *</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {TCG_CATEGORIES.map(cat => (
                      <button key={cat} type="button" onClick={() => toggleCategory(cat)} style={{
                        padding: '8px 14px', borderRadius: '20px', fontSize: '0.84rem',
                        border: form.tcg_categories.includes(cat) ? '2px solid var(--color-blue)' : '1px solid var(--color-border)',
                        background: form.tcg_categories.includes(cat) ? '#eff6ff' : 'var(--color-white)',
                        fontWeight: form.tcg_categories.includes(cat) ? 600 : 400, cursor: 'pointer', fontFamily: 'inherit',
                      }}>{cat}</button>
                    ))}
                  </div>
                  {errors.tcg_categories && <span style={{ color: '#ef4444', fontSize: '0.78rem' }}>{errors.tcg_categories}</span>}
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '8px' }}>How do you operate? *</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
                      <input type="checkbox" checked={form.has_physical_shop} onChange={e => set('has_physical_shop', e.target.checked)} />
                      Physical shop
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
                      <input type="checkbox" checked={form.has_online_shop} onChange={e => set('has_online_shop', e.target.checked)} />
                      Online
                    </label>
                  </div>
                  {errors.has_physical_shop && <span style={{ color: '#ef4444', fontSize: '0.78rem' }}>{errors.has_physical_shop}</span>}
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '6px' }}>Estimated monthly purchasing volume</label>
                  <select value={form.estimated_monthly_purchases} onChange={e => set('estimated_monthly_purchases', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Select...</option>
                    {PURCHASE_VOLUMES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '6px' }}>About your business</label>
                  <textarea value={form.business_description} onChange={e => set('business_description', e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Tell us about your TCG business, what you specialise in and why you'd like to use TCGBuyer..." />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button type="button" onClick={() => setStep(1)} style={{
                    padding: '12px 24px', background: 'var(--color-bg)', color: 'var(--color-text)',
                    border: '1px solid var(--color-border)', borderRadius: '8px', fontWeight: 600,
                    fontSize: '0.92rem', cursor: 'pointer', fontFamily: 'inherit',
                  }}>Back</button>
                  <button type="button" onClick={handleNext} style={{
                    padding: '12px 32px', background: 'var(--color-blue)', color: '#fff', border: 'none',
                    borderRadius: '8px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit',
                  }}>Continue</button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '20px' }}>Review your application</h2>
                <div style={{ background: 'var(--color-bg)', borderRadius: '10px', padding: '20px', marginBottom: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.88rem' }}>
                    <div><strong>Business:</strong> {form.business_name}</div>
                    <div><strong>Name:</strong> {form.applicant_name}</div>
                    <div><strong>Email:</strong> {form.email}</div>
                    <div><strong>Phone:</strong> {form.phone || '—'}</div>
                    <div><strong>Country:</strong> {form.country}</div>
                    <div><strong>Type:</strong> {form.business_type}</div>
                    <div style={{ gridColumn: '1 / -1' }}><strong>TCG categories:</strong> {form.tcg_categories.join(', ')}</div>
                    <div><strong>Physical shop:</strong> {form.has_physical_shop ? 'Yes' : 'No'}</div>
                    <div><strong>Online:</strong> {form.has_online_shop ? 'Yes' : 'No'}</div>
                    {form.estimated_monthly_purchases && <div style={{ gridColumn: '1 / -1' }}><strong>Monthly volume:</strong> {form.estimated_monthly_purchases}</div>}
                    {form.business_description && <div style={{ gridColumn: '1 / -1' }}><strong>About:</strong> {form.business_description}</div>}
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '24px', cursor: 'pointer', fontSize: '0.88rem' }}>
                  <input type="checkbox" checked={form.agreed_to_terms} onChange={e => set('agreed_to_terms', e.target.checked)} style={{ marginTop: '3px' }} />
                  <span>
                    I agree to the TCGBuyer <Link to="/terms" target="_blank" style={{ color: 'var(--color-blue)' }}>Terms of Service</Link> and <Link to="/privacy" target="_blank" style={{ color: 'var(--color-blue)' }}>Privacy Policy</Link>, and confirm the information I have provided is accurate.
                  </span>
                </label>
                {errors.agreed_to_terms && <div style={{ color: '#ef4444', fontSize: '0.78rem', marginBottom: '16px' }}>{errors.agreed_to_terms}</div>}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button type="button" onClick={() => setStep(2)} style={{
                    padding: '12px 24px', background: 'var(--color-bg)', color: 'var(--color-text)',
                    border: '1px solid var(--color-border)', borderRadius: '8px', fontWeight: 600,
                    fontSize: '0.92rem', cursor: 'pointer', fontFamily: 'inherit',
                  }}>Back</button>
                  <button type="submit" disabled={submitting} style={{
                    padding: '12px 32px', background: 'var(--color-blue)', color: '#fff', border: 'none',
                    borderRadius: '8px', fontWeight: 700, fontSize: '0.95rem',
                    cursor: submitting ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: submitting ? 0.7 : 1,
                  }}>{submitting ? 'Submitting...' : 'Submit application'}</button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

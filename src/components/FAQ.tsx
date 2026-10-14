import React, { useState } from 'react';

const faqs = [
  {
    q: 'What is TCGBuyer?',
    a: 'TCGBuyer is buying software designed for trading card game dealers. It gives your shop a branded online portal where collectors can submit their cards, and provides you with tools to manage the entire buying workflow from submission to purchase.',
  },
  {
    q: 'Which trading card games does TCGBuyer support?',
    a: 'TCGBuyer is designed to work with all major trading card games including Pokémon, Magic: The Gathering, Yu-Gi-Oh, and more. The platform is flexible enough to handle mixed collections across multiple games.',
  },
  {
    q: 'How does the customer submission process work?',
    a: 'Customers visit your branded buying portal, upload photos of their cards, provide details about their collection, and submit it for review. You then receive the submission in your dashboard where you can assess the cards and make an offer.',
  },
  {
    q: 'Can I customise the buying portal with my own branding?',
    a: 'Yes. Your buying portal carries your shop name and branding, giving customers a professional and familiar experience. The portal is hosted on your own subdomain so it feels like a natural part of your business.',
  },
  {
    q: 'Is there a cost to get started?',
    a: 'TCGBuyer offers a free tier to help you get started. You can set up your buying portal and start receiving submissions at no cost. Additional features and higher submission volumes are available on paid plans.',
  },
  {
    q: 'Do I need any technical knowledge to use TCGBuyer?',
    a: 'No. TCGBuyer is designed to be straightforward for both dealers and their customers. You can set up your buying portal and start receiving submissions in minutes without any technical expertise.',
  },
];

const FAQItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderBottom: '1px solid var(--color-border)',
    }}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--space-lg) 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)', paddingRight: 'var(--space-md)' }}>{q}</span>
        <span style={{
          fontSize: '1.3rem',
          color: 'var(--color-text-muted)',
          flexShrink: 0,
          transition: 'transform 0.2s',
          transform: open ? 'rotate(45deg)' : 'none',
          lineHeight: 1,
        }}>+</span>
      </button>
      {open && (
        <div style={{
          paddingBottom: 'var(--space-lg)',
          fontSize: '0.95rem',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.7,
          maxWidth: '640px',
        }}>
          {a}
        </div>
      )}
    </div>
  );
};

export const FAQ: React.FC = () => (
  <section id="faq" style={{ padding: 'var(--space-4xl) 0', background: 'var(--color-white)' }}>
    <div className="container" style={{ maxWidth: '720px' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
        <p className="section-label" style={{ textAlign: 'center' }}>FAQ</p>
        <h2 style={{
          fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
          fontWeight: 900,
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
        }}>
          Frequently asked questions
        </h2>
      </div>
      <div>
        {faqs.map((faq, i) => (
          <FAQItem key={i} {...faq} />
        ))}
      </div>
    </div>
  </section>
);

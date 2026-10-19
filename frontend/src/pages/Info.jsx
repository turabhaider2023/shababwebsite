import { useEffect } from 'react';

const PAGES = {
  about: {
    title: 'About ZAYVORN',
    paragraphs: [
      'ZAYVORN is a contemporary fashion store for men, women and kids. The edit covers clothing, shoes, watches, bags and the smaller things that finish an outfit.',
      'Prices on the site are the amount you pay. When a piece is on offer, the crossed price stays visible next to the discounted one.',
      'This is a demo shop. Orders are saved so you can see the full path from catalogue to delivery status, and no real payment is collected.',
    ],
  },
  shipping: {
    title: 'Shipping',
    paragraphs: [
      'Orders of ₹1,999 and above ship free across India. Below that, a flat delivery charge of ₹99 is added at checkout.',
      'A placed order moves to confirmed, then shipped, then delivered. You can follow that status from your orders page. The admin desk updates it.',
      'Demo orders are not sent to a courier.',
    ],
  },
  returns: {
    title: 'Returns',
    paragraphs: [
      'Unworn items with tags can be returned within 3 days of delivery. Sale pieces follow the same window in this demo.',
      'If an order is cancelled before it ships, the pieces go back into stock.',
      'Write to hello@zayvorn.store and we will pretend, very sincerely, to have a returns desk.',
    ],
  },
};

export default function Info({ page }) {
  const content = PAGES[page] || PAGES.about;
  useEffect(() => {
    document.title = `${content.title} — ZAYVORN`;
  }, [content.title]);

  return (
    <article className="wrap page">
      {page === 'about' && <img src="/logo-header.png" alt="ZAYVORN" className="brand-logo-full" />}
      <h1>{content.title}</h1>
      {content.paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </article>
  );
}

import React from 'react';
import { PageHead, Tag } from '../ui.jsx';
import { SOURCES } from '../lib/sources.js';

const REAL = [
  ['Partner names and the merchant of record', 'CarTrawler, Instacart, Welcome Pickups and Bounce. Airbnb says it is not the merchant of record for them.', 'offers'],
  ['Airbnb Credit limits', 'Can\'t be used on third-party services. Welcome Pickups also excludes gift cards and coupons.', 'offers'],
  ['Partner offers', '20% off rides, 15% off storage, $0 delivery and $10 off $50+, 20% car credit capped at $200.', 'offers'],
  ['Car handoff and cancellation', '"Continue to book on CarTrawler". Cancelling a stay doesn\'t cancel the car.', 'car'],
  ['Moderate cancellation rules', 'Full refund until 5 days out; then 1 night plus 50% of unspent nights kept.', 'cancel'],
  ['Experience and service windows', 'Most 24 hours, select ones 72 hours.', 'svcCancel'],
  ['72-hour reporting', 'Homes, services and experiences.', 'rebook'],
  ['Refund timing', 'Credit and PayPal in 24 hours, cards up to 15 business days.', 'refundTiming'],
  ['US payment entity', 'Airbnb Payments, Inc. Klarna is the creditor for pay-over-time.', 'payTerms'],
  ['Expedia owns CarTrawler', 'Deal completed by September 2026.', 'expediaCt'],
  ['One contract for native products', 'Accommodations, Experiences and Services are all "Host Services".', 'terms'],
  ['Collection agent model', 'Each Host appoints Airbnb Payments as its payment collection agent.', 'payTerms'],
  ['Fees by product', 'Most home hosts 15.5%, services typically 15% with a $6 minimum, experiences typically 20%.', 'fees'],
  ['Payments platform design', 'Airbnb says payment logic is decoupled from stays, experiences and services.', 'payLocal'],
];

const ASSUMED = [
  ['Listing, host, dates and all prices', 'Invented sample data, including the 15% tax rate.', 'sample'],
  ['Saved card and $75 Airbnb Credit', 'Sample. The prototype never asks for real card details.', 'sample'],
  ['Welcome Pickups and Bounce in Nashville', 'Airbnb hasn\'t published US coverage for them. Assumed so the trip works.', 'unstated'],
  ['Payment model for partners', 'Collection agent and merchant of record are both proposals. Neither is how it works today.', 'proposed'],
  ['Card disputes reach Airbnb first', 'Assumed because Airbnb would take the payment. Airbnb\'s guest terms don\'t cover chargebacks.', 'proposed'],
  ['Hotel payment entity and rules', 'Not published. A summary of the Terms names Airbnb Travel, LLC for certain hotels; the exact US wording wasn\'t verified.', 'unstated'],
  ['Generic pricing and tax models', 'From a search summary of an older engineering post that couldn\'t be opened.', 'unstated'],
  ['Partner cancellation windows', '48 hours for cars, 24 for rides, and so on. Partner terms weren\'t in the pages reviewed.', 'proposed'],
  ['15% grocery hold', 'Assumption to cover substitutions.', 'proposed'],
  ['Liability split and make-good limits', 'Proposed contract terms, to test with partners, legal and finance.', 'proposed'],
  ['Cleaning fee refund before check-in', 'Modeled as refunded; the policy page doesn\'t address it directly.', 'proposed'],
  ['"Pay Later" due date of Dec 5', 'Sample. Airbnb shows the actual date at checkout.', 'sample'],
  ['Stage ownership in Step 3', 'Our read of public information. Unknown stages are marked as such.', 'proposed'],
  ['Hotel checkout steps', 'Not published. Modeled on the home checkout.', 'unstated'],
];

export default function SourcesPage() {
  return (
    <>
      <PageHead title="What's real and what's assumed" lede="Public facts were checked on Nov 6, 2026 and may change. Every number that isn't sourced below is sample data." />
      <section className="section" style={{ marginTop: 0 }}>
        <h2 style={{ marginBottom: 12 }}>Published facts</h2>
        <div className="tablewrap"><table>
          <thead><tr><th>Item</th><th>What it says</th><th>Source</th></tr></thead>
          <tbody>{REAL.map(([a, b, s]) => <tr key={a}><th style={{ whiteSpace: 'normal' }}>{a}</th><td>{b}</td><td><a href={SOURCES[s].url} target="_blank" rel="noreferrer">{SOURCES[s].label}</a></td></tr>)}</tbody>
        </table></div>
      </section>
      <section className="section">
        <h2 style={{ marginBottom: 12 }}>Assumed, proposed or sample</h2>
        <div className="tablewrap"><table>
          <thead><tr><th>Item</th><th>Why</th><th>Type</th></tr></thead>
          <tbody>{ASSUMED.map(([a, b, k]) => <tr key={a}><th style={{ whiteSpace: 'normal' }}>{a}</th><td>{b}</td><td><Tag kind={k} /></td></tr>)}</tbody>
        </table></div>
      </section>
      <section className="section">
        <h2 style={{ marginBottom: 12 }}>All sources</h2>
        <ul style={{ paddingLeft: 18, margin: 0, display: 'grid', gap: 4 }}>
          {Object.values(SOURCES).map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.label}</a></li>)}
        </ul>
      </section>
    </>
  );
}

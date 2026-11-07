import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Cite, Tag, PageHead, NextStep } from '../ui.jsx';

const PATTERNS = [
  {
    id: 'link', n: 1, name: 'Link-out with an offer', short: 'Platform refers, partner sells',
    how: 'The platform shows the service, then sends the customer to the partner to finish. It is fast to launch and needs little engineering.',
    examples: [<>Airbnb with CarTrawler, Instacart, Welcome Pickups and Bounce today<Cite id="offers" /></>, <>ChatGPT after March 2026: discovery in chat, checkout with the merchant<Cite id="acpBack" /></>],
    good: 'Fastest route to coverage, and the partner carries most of the risk.',
    bad: 'A separate checkout, a separate charge, and loyalty that stops at the door.',
  },
  {
    id: 'whitelabel', n: 2, name: 'White-label flow', short: 'Partner hosts, platform brand',
    how: 'The partner builds and runs a booking flow that wears the platform\'s brand inside its journey.',
    examples: [<>Ryanair: CarTrawler embedded in the booking journey and the myRyanair app<Cite id="ryanair" /></>, <>Southwest moved from an in-house tool to CarTrawler's Connect Platform<Cite id="southwest" /></>, <>Mozio white-label for airport transfers<Cite id="mozio" /></>],
    good: 'Looks native at launch with little build effort.',
    bad: 'The partner still owns the logic, so post-booking changes are hard to unify.',
  },
  {
    id: 'api', n: 3, name: 'API supply, own checkout', short: 'Platform owns UI and payment',
    how: 'The platform pulls inventory over APIs, builds its own screens, takes payment, and pays suppliers. This is the classic online travel agency merchant model.',
    examples: [<>Expedia acts as merchant of record for hotels, cars and more<Cite id="expediaMoR" /></>, <>Booking.com exposes car search and booking through its Demand API<Cite id="bookingApi" /></>, <>Mozio offers an API plus iOS and Android SDKs<Cite id="mozio" /></>],
    good: 'One cart, one charge, full control of the experience.',
    bad: 'The platform takes on refunds, chargebacks, tax and customer care.',
  },
  {
    id: 'mini', n: 4, name: 'Partner mini-apps', short: 'Partner code, platform runtime',
    how: 'Partners ship small apps that run inside the host app and use its login and wallet. The customer stays inside, but each partner\'s screens still differ.',
    examples: [<>WeChat Mini Programs: payment stays inside WeChat<Cite id="wechat" /></>, <>Grab Partner Apps: no new account, integrated checkout, GrabPay, at the same price as direct<Cite id="grab" /></>],
    good: 'Scales to many partners without building each one.',
    bad: 'One checkout per partner, so it does not give a single cart for the trip.',
  },
  {
    id: 'cross', n: 5, name: 'Inventory inside a tab', short: 'Partner stock, platform surface',
    how: 'Two companies connect inventory so one app sells the other\'s supply in a native tab, and the booking flows back to the partner\'s system.',
    examples: [<>Uber Eats Dine Out: book OpenTable tables, with a ride offer afterwards<Cite id="uberOtDive" /></>, <>Instacart's Restaurants tab, served by Uber Eats<Cite id="instacartUber" /></>],
    good: 'Feels like one product, and each side keeps its core business.',
    bad: 'It needs a deep bilateral deal, and doesn\'t scale past a few partners.',
  },
  {
    id: 'token', n: 6, name: 'Tokenized checkout protocol', short: 'Platform checkout, merchant fulfils',
    how: 'The platform collects payment and passes a scoped token to the merchant, who stays merchant of record and handles the order.',
    examples: [<>ChatGPT Instant Checkout with Stripe's Shared Payment Token<Cite id="stripeAcp" /></>, <>Shopify Checkout Kit puts Shop Pay into other apps<Cite id="shop" /></>],
    good: 'Keeps a native feel with less liability for the platform.',
    bad: 'Refunds still belong to the merchant. OpenAI reportedly scaled it back after weak adoption.',
  },
];

const OWN = [
  { name: 'Airbnb car rental today', sub: 'Link-out', cells: ['platform', 'partner', 'partner', 'shared', 'partner'] },
  { name: 'Ryanair + CarTrawler', sub: 'White-label', cells: ['platform', 'shared', 'unknown', 'unknown', 'unknown'] },
  { name: 'Expedia car rental', sub: 'Merchant model', cells: ['platform', 'platform', 'platform', 'unknown', 'unknown'] },
  { name: 'Grab Partner Apps', sub: 'Mini-apps', cells: ['platform', 'partner', 'platform', 'unknown', 'unknown'] },
  { name: 'Uber + OpenTable', sub: 'Inventory in a tab', cells: ['platform', 'shared', 'unknown', 'unknown', 'unknown'] },
  { name: 'ChatGPT Instant Checkout', sub: 'At launch', cells: ['platform', 'platform', 'shared', 'partner', 'partner'] },
  { name: 'This concept', sub: 'API + own checkout', cells: ['platform', 'platform', 'platform', 'platform', 'platform'], hl: true },
];
const CELL = { platform: 'Platform', shared: 'Shared', partner: 'Partner', unknown: 'Not public' };

const RECO = [
  {
    title: 'Car rental', tag: 'Pattern 3, with a hedge',
    body: <>Build native screens on a supply API. But CarTrawler now belongs to Expedia,<Cite id="expediaCt" /> a direct competitor, so a rival now controls this supply. Line up a second source before deepening the integration.</>,
  },
  {
    title: 'Airport pickup', tag: 'Pattern 3',
    body: <>A fixed-price ride is simple to quote, so it suits native checkout. Mozio publishes an API and SDKs,<Cite id="mozio" /> which makes it a fallback for US airports Welcome Pickups doesn't reach.</>,
  },
  {
    title: 'Groceries', tag: 'Pattern 3, needs a bespoke deal',
    body: <>Prices change after checkout through substitutions, so hold first and charge on delivery. Instacart Connect is built for retailers,<Cite id="instacartConnect" /> so a platform like Airbnb would need a custom agreement.</>,
  },
  {
    title: 'Luggage and long tail', tag: 'Pattern 4 later',
    body: <>Low value and many possible partners. Use the same cart now. If the catalog grows beyond a handful, a mini-app layer scales better than a custom build for each.</>,
  },
];

export default function StepIndustry() {
  const [sel, setSel] = useState('api');
  const p = PATTERNS.find((x) => x.id === sel);
  return (
    <>
      <PageHead
        step="3"
        title="How other platforms keep customers inside"
        lede="There are six ways to sell someone else's service. They differ on one question: how much of the journey does the platform own, and how much liability comes with it?"
      />

      <div className="spectrum" role="group" aria-label="Integration patterns">
        {PATTERNS.map((x) => (
          <button key={x.id} className={`spec ${sel === x.id ? 'on' : ''}`} onClick={() => setSel(x.id)} aria-pressed={sel === x.id}>
            <b>{x.n}</b><strong>{x.name}</strong><small>{x.short}</small>
          </button>
        ))}
      </div>

      <div className="card pattern">
        <div className="stack">
          <h2>{p.name}</h2>
          <p>{p.how}</p>
          <div><h4 style={{ marginBottom: 6 }}>Who does this</h4><ul>{p.examples.map((e, i) => <li key={i}>{e}</li>)}</ul></div>
        </div>
        <div className="stack">
          <div className="note note-ok"><span><strong>Works because:</strong> {p.good}</span></div>
          <div className="note note-bad"><span><strong>Costs:</strong> {p.bad}</span></div>
        </div>
      </div>

      <section className="section">
        <h2>Who owns each stage of the journey</h2>
        <p className="sub">Our read of public information. Where a company hasn't published how a stage works, it's marked "Not public" instead of guessed.</p>
        <div className="own">
          <div className="own-head"><div />{['Discover', 'Book', 'Pay', 'Manage', 'Support'].map((h) => <div key={h} style={{ textAlign: 'center' }}>{h}</div>)}</div>
          {OWN.map((o) => (
            <div className={`own-row ${o.hl ? 'hl' : ''}`} key={o.name}>
              <div>{o.name}<small>{o.sub}</small></div>
              {o.cells.map((c, i) => <div key={i} className={`cell c-${c}`}>{CELL[c]}</div>)}
            </div>
          ))}
        </div>
        <div className="legend">
          <span><i className="c-platform" />Platform owns it</span>
          <span><i className="c-shared" />Shared</span>
          <span><i className="c-partner" />Partner owns it</span>
          <span><i className="c-unknown" />Not public</span>
        </div>
      </section>

      <section className="section">
        <h2>What went wrong for others</h2>
        <p className="sub">Three lessons that shaped this design.</p>
        <div className="lessons">
          <div className="card stack">
            <h3>A cart isn't a connected trip</h3>
            <p>Booking.com said under 10% of its transactions were "connected" in 2024.<Cite id="connected" /> A 2026 critique says the trip still lacks real itinerary integration.<Cite id="connectedOp" /></p>
            <small><strong>So:</strong> items here share dates, address and flight, and they react to each other.</small>
          </div>
          <div className="card stack">
            <h3>Checkout without loyalty stalls</h3>
            <p>Instant Checkout reportedly launched without loyalty, promotions or combined orders, and retailers pushed back.<Cite id="acpBack" /></p>
            <small><strong>So:</strong> offers and Airbnb Credit work across every item from day one.</small>
          </div>
          <div className="card stack">
            <h3>Your partner can change sides</h3>
            <p>Airbnb's car rentals run on CarTrawler. Expedia, a direct competitor, completed its purchase of CarTrawler around September 2026.<Cite id="expediaCt" /></p>
            <small><strong>So:</strong> the cart talks to a supply layer, so a partner can be swapped without changing what the guest sees.</small>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Recommendation for each service <Tag kind="proposed" /></h2>
        <p className="sub">Own the checkout, payment, changes and support. Let partners own supply and fulfilment. The tradeoff is real: Airbnb takes on refunds and chargebacks it doesn't carry today, which Step 4 works through.</p>
        <div className="reco">
          {RECO.map((r) => (
            <div className="card stack" key={r.title}>
              <div className="between"><h3>{r.title}</h3><small>{r.tag}</small></div>
              <p>{r.body}</p>
            </div>
          ))}
        </div>
        <div className="note note-warn" style={{ marginTop: 14 }}>
          <AlertTriangle size={16} aria-hidden="true" />
          <span>Becoming merchant of record for rentals and groceries needs legal and tax review, including seller-of-travel rules, sales tax on goods, and insurance sold with a car. This concept doesn't resolve those.</span>
        </div>
      </section>

      <NextStep href="#/after" label="Step 4: What happens after booking" />
    </>
  );
}

import React, { useState } from 'react';
import { Home, Hotel, Compass, ChefHat, Car, ShoppingBasket, PlaneLanding, Luggage, ExternalLink, AlertTriangle, CheckCircle2, CircleSlash, Mail } from 'lucide-react';
import { Cite, Tag, PageHead, NextStep, Radio, CottageArt } from '../ui.jsx';
import { money, stayCost, buildLines, DEFAULT_CART, STAY } from '../lib/pricing.js';

const s = stayCost();
// Same sample cart as Step 2, so partner prices match across steps.
const sampleTotal = (id) => buildLines(DEFAULT_CART).find((l) => l.id === id).total;

const NATIVE = [
  {
    id: 'home', icon: Home, name: 'Homes', blurb: 'The core booking, paid on Airbnb.',
    title: STAY.title, sub: `${STAY.place} · ${STAY.nights} nights, ${STAY.checkIn} to ${STAY.checkOut}`,
    rows: [[`${STAY.nights} nights x $${STAY.nightly}`, s.lodging], ['Cleaning fee', s.cleaning], ['Taxes', s.taxes]], total: s.total,
    pay: ['full', 'later', 'part', 'klarna'], policy: <>Moderate: full refund until 5 days before check-in.<Cite id="cancel" /></>,
    perk: <>AirCover on every home booking.<Cite id="aircover" /></>, hero: null,
  },
  {
    id: 'hotel', icon: Hotel, name: 'Boutique hotels', blurb: 'Select cities, including New York.',
    title: 'Boutique hotel in New York', sub: 'Sample listing · 2 nights', rows: [['2 nights x $240', 480], ['Taxes and fees', 76.8]], total: 556.8,
    pay: ['full'], policy: <>Rate policy varies. Some non-refundable hotel listings are exempt from the 24-hour rule.<Cite id="cancel" /></>,
    perk: <>Price match credit up to $400 on eligible listings, and up to 15% back toward a future home.<Cite id="priceMatch" /></>,
    hero: 'hero-plum', note: 'Airbnb does not publish the hotel checkout steps. This screen is modeled on the home checkout.',
  },
  {
    id: 'experience', icon: Compass, name: 'Experiences', blurb: 'Hosted activities, paid on Airbnb.',
    title: 'Music Row walking tour', sub: 'Sample experience · 2 guests', rows: [['2 guests x $65', 130], ['Taxes', 12.35]], total: 142.35,
    pay: ['full'], policy: <>Most have a full refund until 24 hours before the start. Select ones use 72 hours.<Cite id="svcCancel" /></>,
    perk: <>Host cancels or is over 15 minutes late: a covered issue, reported within 72 hours.<Cite id="svcRefund" /></>, hero: 'hero-sea',
  },
  {
    id: 'service', icon: ChefHat, name: 'Services', blurb: 'Chefs, massage, photography and more.',
    title: 'Private chef dinner at your stay', sub: 'Sample service · 4 guests', rows: [['4 guests x $85', 340], ['Taxes', 32.3]], total: 372.3,
    pay: ['full'], policy: <>Most have a full refund until 24 hours before the start. Select ones use 72 hours.<Cite id="svcCancel" /></>,
    perk: <>Same covered issues as Experiences.<Cite id="svcRefund" /></>, hero: 'hero-rose',
  },
];

const PARTNERS = [
  {
    id: 'car', icon: Car, name: 'Car rentals', partner: 'CarTrawler', blurb: 'Via CarTrawler. Live in select US locations.',
    entryTitle: 'Rent a car for your trip', entryWhere: <>From Trips or Services<Cite id="car" /></>,
    handoff: 'Continue to book on CarTrawler',
    stepsOnPartner: 'Search, pick a car, choose add-ons and protection, then enter contact, driver and payment details.', price: sampleTotal('car'),
    fields: ['Driver name', 'Date of birth', 'Email and phone', 'Card number'],
    after: [
      <>The booking appears in Trips, with an email and a CarTrawler reference.<Cite id="car" /></>,
      <>Cancelling the stay does not cancel the car. It has to be cancelled separately.<Cite id="car" /></>,
      <>Support runs through CarTrawler's help page.<Cite id="car" /></>,
    ],
    offer: <>Up to 20% off, plus 20% back as Airbnb Credit on a first rental, capped at $200 and issued within 60 days.<Cite id="offers" /></>,
    merchant: 'CarTrawler and the vehicle supplier', cancelVia: 'Modify reservation in Trips, on partner terms', support: 'CarTrawler',
  },
  {
    id: 'grocery', icon: ShoppingBasket, name: 'Grocery delivery', partner: 'Instacart', blurb: 'Via Instacart. 25+ US cities.',
    entryTitle: 'Get groceries delivered', entryWhere: <>Exact entry point is not published<Tag kind="unstated" /></>,
    handoff: 'Continue to Instacart',
    stepsOnPartner: 'Order on Instacart. The Airbnb discount is applied at Instacart checkout through an offer link.', price: sampleTotal('grocery'),
    fields: ['Instacart account', 'Delivery address', 'Card number'],
    after: [
      <>Refunds follow Instacart's own terms.<Cite id="offers" /></>,
      <>Whether the order shows in Trips is not published.<Tag kind="unstated" /></>,
      <>Support runs through Instacart.<Cite id="offers" /></>,
    ],
    offer: <>$0 delivery on $10+ and $10 off $50+ at listed destinations. Alcohol, pickup and restaurant orders are excluded.<Cite id="offers" /></>,
    merchant: 'Instacart', cancelVia: 'Instacart', support: 'Instacart',
  },
  {
    id: 'ride', icon: PlaneLanding, name: 'Airport pickup', partner: 'Welcome Pickups', blurb: 'Via Welcome Pickups. 160+ cities worldwide.',
    entryTitle: 'Book a private car service', entryWhere: <>From the Trips tab<Cite id="pickups" /></>,
    handoff: 'Continue to Welcome Pickups',
    stepsOnPartner: 'Book on the Welcome Pickups page. Airbnb passes the listing address to the partner.', price: sampleTotal('ride'),
    fields: ['Flight number', 'Passenger details', 'Card number'],
    after: [
      <>An email arrives with the driver's name, photo and contact details.<Cite id="pickups" /></>,
      <>Airbnb gift cards, coupons and Credit cannot pay for the ride.<Cite id="pickups" /></>,
      <>Changes and help go through Welcome Pickups. Airbnb's news post says changes can be made in the app, so the two sources differ.<Cite id="pickupsNews" /></>,
    ],
    offer: <>20% off the ride price, excluding taxes, fees, tolls and waiting time.<Cite id="offers" /></>,
    usNote: 'Airbnb has not said which US airports are live. Nashville is assumed here.',
    merchant: 'Welcome Pickups', cancelVia: 'Welcome Pickups', support: 'Welcome Pickups',
  },
  {
    id: 'luggage', icon: Luggage, name: 'Luggage storage', partner: 'Bounce', blurb: 'Via Bounce. 15,000+ locations in 175 cities.',
    entryTitle: 'Store your bags nearby', entryWhere: <>Nearby drop-off spots shown in the app<Cite id="summer" /></>,
    handoff: 'Continue to Bounce',
    stepsOnPartner: 'Book on Bounce. Storage is provided by a local shop or venue in its network.', price: sampleTotal('luggage'),
    fields: ['Bounce details', 'Drop-off time', 'Card number'],
    after: [
      <>Support belongs to the third party.<Cite id="offers" /></>,
      <>Change, cancel and refund steps are not published in Airbnb's pages.<Tag kind="unstated" /></>,
    ],
    offer: <>15% off the storage price on a qualifying stay.<Cite id="offers" /></>,
    usNote: 'Airbnb has not published a US city list. Nashville is assumed here.',
    merchant: 'Bounce', cancelVia: 'Not published', support: 'Bounce',
  },
];

const PAY = {
  full: (t) => ({ title: 'Pay in full', sub: 'Pay the total now.', right: money(t) }),
  later: (t) => ({ title: 'Reserve Now, Pay Later', sub: 'Flexible and Moderate listings. No extra fee. Charged on the date shown.', right: '$0.00 today' }),
  part: (t) => ({ title: 'Pay part now, part later', sub: 'Depends on listing and payment method. No extra fee.', right: `${money(t / 2)} today` }),
  klarna: () => ({ title: 'Pay over time with Klarna', sub: 'Klarna, not Airbnb, becomes your creditor.', right: 'Klarna' }),
};

function NativeFlow({ p }) {
  const [stage, setStage] = useState(0);
  const [pay, setPay] = useState('full');
  const labels = ['Listing', 'Confirm and pay', 'Trips'];
  return (
    <div>
      <div className="flowbar">{labels.map((l, i) => <span key={l} className={i === stage ? 'on' : ''}>{i + 1}. {l}</span>)}</div>
      <div className="device">
        <div className="device-head"><span className="brand">airbnb</span></div>
        <div className="device-body">
          {stage === 0 && (
            <>
              {p.hero ? <div className={`product-hero ${p.hero}`}><p.icon size={40} aria-hidden="true" /></div> : <CottageArt className="hero-art" />}
              <div>
                <h3>{p.title}</h3>
                <small>{p.sub}</small>
              </div>
              <div className="between"><span className="muted">Total price</span><strong className="num">{money(p.total)}</strong></div>
              <button className="btn btn-brand btn-block" onClick={() => setStage(1)}>Reserve</button>
            </>
          )}
          {stage === 1 && (
            <>
              <h3>Confirm and pay</h3>
              <div className="stack">
                {p.pay.map((k) => {
                  const o = PAY[k](p.total);
                  return <Radio key={k} name={`pay-${p.id}`} checked={pay === k} onChange={() => setPay(k)} {...o} />;
                })}
              </div>
              <div className="field"><label>Pay with</label><div>Visa ending 4242 <Tag kind="sample" /></div></div>
              <div className="pricerows">
                {p.rows.map(([l, v]) => <div className="between" key={l}><span>{l}</span><span className="num">{money(v)}</span></div>)}
                <div className="between total"><span>Total</span><span className="num">{money(p.total)}</span></div>
              </div>
              <small>{p.policy}</small>
              {p.note && <div className="note note-warn"><AlertTriangle size={15} aria-hidden="true" /><span>{p.note}</span></div>}
              <button className="btn btn-brand btn-block" onClick={() => setStage(2)}>Confirm and pay</button>
            </>
          )}
          {stage === 2 && (
            <>
              <div className="note note-ok"><CheckCircle2 size={16} aria-hidden="true" /><span>Booked. It now lives in Trips.</span></div>
              <h3>{p.title}</h3>
              <small>{p.perk}</small>
              <small>Charged by Airbnb Payments, Inc. for US guests.<Cite id="payTerms" /></small>
              <button className="link" onClick={() => setStage(0)} style={{ justifySelf: 'start' }}>Start over</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PartnerFlow({ p }) {
  const [stage, setStage] = useState(0);
  const labels = ['Airbnb', 'Handoff', `${p.partner} checkout`, 'Afterwards'];
  return (
    <div>
      <div className="flowbar">{labels.map((l, i) => <span key={l} className={`${i === stage ? 'on' : ''} ${i === 2 ? 'partner' : ''}`}>{i + 1}. {l}</span>)}</div>
      <div className="device">
        {stage === 2 ? (
          <div className="device-head partner"><ExternalLink size={14} aria-hidden="true" /> {p.partner} operates this flow</div>
        ) : (
          <div className="device-head"><span className="brand">airbnb</span></div>
        )}
        <div className="device-body">
          {stage === 0 && (
            <>
              <div className="tripcard">
                <CottageArt />
                <div><strong>{STAY.title}</strong><br /><small>{STAY.checkIn} to {STAY.checkOut}</small></div>
              </div>
              <button className="btn btn-block" onClick={() => setStage(1)}><p.icon size={16} aria-hidden="true" /> {p.entryTitle}</button>
              <small>{p.entryWhere}</small>
              {p.usNote && <div className="note note-warn"><AlertTriangle size={15} aria-hidden="true" /><span>{p.usNote}</span></div>}
            </>
          )}
          {stage === 1 && (
            <>
              <h3>You're about to book with {p.partner}</h3>
              <p className="muted">{p.partner}'s terms and privacy policy apply. Airbnb is not the merchant of record.<Cite id="offers" /></p>
              <small>{p.offer}</small>
              <button className="btn btn-partner btn-block" onClick={() => setStage(2)}>{p.handoff} <ExternalLink size={15} aria-hidden="true" /></button>
            </>
          )}
          {stage === 2 && (
            <>
              <p>{p.stepsOnPartner}</p>
              <div className="field-grid">
                {p.fields.map((f) => <div className="field" key={f}><small>{f}</small><div className="muted">Entered again</div></div>)}
              </div>
              <div className="between"><span>Sample total</span><strong className="num">{money(p.price)}</strong></div>
              <div className="note note-bad"><CircleSlash size={15} aria-hidden="true" /><span>Airbnb Credit can't pay for this.<Cite id="offers" /></span></div>
              <button className="btn btn-partner btn-block" onClick={() => setStage(3)}>Pay {p.partner}</button>
              <small>Third-party flows may appear inside the Airbnb app with Airbnb branding, but the partner still runs them.<Cite id="offers" /></small>
            </>
          )}
          {stage === 3 && (
            <>
              <div className="note"><Mail size={15} aria-hidden="true" /><span>Confirmation comes from {p.partner}.</span></div>
              <div className="frictions">{p.after.map((a, i) => <div key={i}><AlertTriangle size={14} color="#a14a00" aria-hidden="true" /><span>{a}</span></div>)}</div>
              <div className="field"><small>Card statement</small><div>A separate charge from {p.partner}, not Airbnb</div></div>
              <button className="link" onClick={() => setStage(0)} style={{ justifySelf: 'start' }}>Start over</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StepToday() {
  const [sel, setSel] = useState('home');
  const all = [...NATIVE, ...PARTNERS];
  const p = all.find((x) => x.id === sel);
  const isPartner = PARTNERS.some((x) => x.id === sel);

  return (
    <>
      <PageHead
        step="1"
        title="What a US guest can book on Airbnb today"
        lede="Airbnb sells eight things to a US guest, but it only runs checkout for four. The other four are shown on Airbnb and completed with a partner, as a separate purchase."
      />

      <div className="groups">
        <section className="group" aria-label="Booked and paid on Airbnb">
          <h3>Booked and paid on Airbnb</h3>
          <p>One account, one checkout, Airbnb's policies.</p>
          <div className="tiles">
            {NATIVE.map((x) => (
              <button key={x.id} className={`tile ${sel === x.id ? 'on' : ''}`} onClick={() => setSel(x.id)} aria-pressed={sel === x.id}>
                <x.icon size={22} aria-hidden="true" /><strong>{x.name}</strong><small>{x.blurb}</small>
              </button>
            ))}
          </div>
        </section>
        <section className="group" aria-label="Found on Airbnb, bought from a partner">
          <h3>Found on Airbnb, bought from a partner</h3>
          <p>The partner runs checkout and is the merchant of record.<Cite id="offers" /></p>
          <div className="tiles">
            {PARTNERS.map((x) => (
              <button key={x.id} className={`tile ${sel === x.id ? 'on' : ''}`} onClick={() => setSel(x.id)} aria-pressed={sel === x.id}>
                <x.icon size={22} color="#1f3a5f" aria-hidden="true" /><strong>{x.name}</strong><small>{x.blurb}</small>
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="today-layout">
        {isPartner ? <PartnerFlow key={p.id} p={p} /> : <NativeFlow key={p.id} p={p} />}
        <aside className="side-score">
          <div className="card">
            <h3 style={{ marginBottom: 10 }}>{p.name}: the facts</h3>
            {isPartner ? (
              <div className="facts">
                <div><strong>Merchant:</strong> {p.merchant}</div>
                <div><strong>Cancel via:</strong> {p.cancelVia}</div>
                <div><strong>Support:</strong> {p.support}</div>
                <div><strong>Airbnb Credit:</strong> <span className="no">Not accepted</span></div>
                <div><span>{p.offer}</span></div>
              </div>
            ) : (
              <div className="facts">
                <div><strong>Charged by:</strong> Airbnb Payments, Inc.</div>
                <div><span><strong>Cancellation:</strong> {p.policy}</span></div>
                <div><span><strong>Protection:</strong> {p.perk}</span></div>
              </div>
            )}
          </div>
          <small>Listings and prices on this page are sample data. Policies and partner names are published facts.</small>
        </aside>
      </div>

      <section className="section">
        <h2>One Nashville trip, booked today</h2>
        <p className="sub">A family books a stay, a car, an airport pickup, groceries and luggage storage. Each partner is its own purchase.</p>
        <div className="statgrid">
          <div className="stat"><strong>5</strong><span>separate checkouts</span></div>
          <div className="stat"><strong>5</strong><span>merchants on the card statement</span></div>
          <div className="stat"><strong>5</strong><span>sets of terms and support</span></div>
          <div className="stat"><strong>1 of 5</strong><span>can use Airbnb Credit</span></div>
        </div>
      </section>

      <section className="section">
        <h2>Everything at a glance</h2>
        <p className="sub">Who sells it, who charges the guest, and who the guest calls.</p>
        <div className="tablewrap">
          <table>
            <thead><tr><th>Product</th><th>Checkout</th><th>Charged by</th><th>Pay later</th><th>Airbnb Credit</th><th>Support</th></tr></thead>
            <tbody>
              <tr><th>Homes</th><td>Airbnb</td><td>Airbnb Payments</td><td className="yes">Yes, if eligible<Cite id="rnpl" /></td><td className="yes">Yes</td><td>Airbnb</td></tr>
              <tr><th>Boutique hotels</th><td>Airbnb</td><td>Airbnb Payments</td><td><Tag kind="unstated" /></td><td><Tag kind="unstated" /></td><td>Airbnb</td></tr>
              <tr><th>Experiences</th><td>Airbnb</td><td>Airbnb Payments</td><td><Tag kind="unstated" /></td><td className="yes">Yes</td><td>Airbnb</td></tr>
              <tr><th>Services</th><td>Airbnb</td><td>Airbnb Payments</td><td><Tag kind="unstated" /></td><td className="yes">Select services<Cite id="summer" /></td><td>Airbnb</td></tr>
              {PARTNERS.map((x) => (
                <tr key={x.id}><th>{x.name}</th><td>{x.partner}</td><td>{x.merchant}</td><td className="no">No</td><td className="no">No<Cite id="offers" /></td><td>{x.support}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <NextStep href="#/embedded" label="Step 2: Bring it all into one checkout" />
    </>
  );
}

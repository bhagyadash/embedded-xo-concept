import React, { useMemo, useState } from 'react';
import { Check, Clock, Home, Car, PlaneLanding, ShoppingBasket, Luggage, PlaneTakeoff, UserX, PackageX, CreditCard, HomeIcon, CalendarDays, AlertTriangle, Link2 } from 'lucide-react';
import { Cite, Tag, PageHead, ModelToggle, MODELS } from '../ui.jsx';
import { DEFAULT_CART, WHENS, buildLines, cancelQuote, money, schedule } from '../lib/pricing.js';

const ICONS = { stay: Home, car: Car, ride: PlaneLanding, grocery: ShoppingBasket, luggage: Luggage };
const SELLER_TODAY = { car: 'CarTrawler', ride: 'Welcome Pickups', grocery: 'Instacart', luggage: 'Bounce' };
const CREDIT = 75;

function CancelTab({ lines, plan, creditUsed }) {
  const allIds = lines.map((l) => l.id);
  const [when, setWhen] = useState('early');
  const [sel, setSel] = useState(allIds);
  const [done, setDone] = useState(false);
  const q = cancelQuote(lines, sel, when, plan, creditUsed);
  const stayOn = sel.includes('stay');
  const linkedKept = lines.filter((l) => l.id !== 'stay' && !sel.includes(l.id));

  const toggle = (id) => {
    setDone(false);
    if (id === 'stay' && !stayOn) { setSel(allIds); return; }
    setSel(sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]);
  };

  return (
    <div className="stack" style={{ gap: 20 }}>
      <div>
        <h3 style={{ marginBottom: 8 }}>When does the guest cancel?</h3>
        <div className="chips" role="group" aria-label="Cancellation date">
          {WHENS.map((w) => (
            <button key={w.id} className={`chip ${when === w.id ? 'on' : ''}`} aria-pressed={when === w.id} onClick={() => { setWhen(w.id); setDone(false); }}>
              <strong>{w.label}</strong><small>{w.sub}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="cancel-grid">
        <div className="card">
          <h3 style={{ marginBottom: 2 }}>What to cancel</h3>
          <small>Each item keeps its own rule. Cancelling the stay selects everything linked to it.</small>
          <div style={{ marginTop: 8 }}>
            {lines.map((l) => {
              const row = q.rows.find((r) => r.line.id === l.id);
              const id = `c-${l.id}`;
              return (
                <div className="qrow" key={l.id}>
                  <input id={id} type="checkbox" checked={sel.includes(l.id)} onChange={() => toggle(l.id)} />
                  <label htmlFor={id}>
                    <strong>{l.label}</strong>
                    <br />
                    {row ? <small>{row.rule} <Tag kind={row.source === 'Published' ? 'published' : 'proposed'} /></small> : <small>Stays booked</small>}
                  </label>
                  <span className="num" style={{ fontWeight: 600 }}>
                    {row ? (row.voided ? 'Not charged' : money(row.refund)) : ''}
                  </span>
                </div>
              );
            })}
          </div>
          {!stayOn && sel.length > 0 && <div className="note" style={{ marginTop: 10 }}><Link2 size={15} aria-hidden="true" /><span>The stay is unchanged, so only these items are affected.</span></div>}
          {stayOn && linkedKept.length > 0 && <div className="note note-warn" style={{ marginTop: 10 }}><AlertTriangle size={15} aria-hidden="true" /><span>You're keeping {linkedKept.map((l) => l.label.toLowerCase()).join(', ')} without a stay. Rides and groceries need a new address.</span></div>}
        </div>

        <aside className="card stack">
          <h3>Refund summary</h3>
          <div className="pricerows">
            <div className="between"><span>Back to Visa ending 4242</span><span className="num">{money(q.toCard)}</span></div>
            {q.toCredit > 0 && <div className="between"><span>Back to Airbnb Credit</span><span className="num">{money(q.toCredit)}</span></div>}
            {q.voided > 0 && <div className="between"><span>Never charged</span><span className="num">{money(q.voided)}</span></div>}
            <div className="between"><span>Not refundable</span><span className="num">{money(q.kept)}</span></div>
            <div className="between total"><span>Total refund</span><span className="num">{money(q.refund)}</span></div>
          </div>
          {done ? (
            <div className="stack" role="status">
              <div className="note note-ok"><Check size={16} aria-hidden="true" /><span>Cancelled in one step. All refunds now show in one tracker.</span></div>
              <div className="tracker">
                <div><Check size={15} color="#00783c" aria-hidden="true" /><span>Refund started by Airbnb, today</span></div>
                <div><Check size={15} color="#00783c" aria-hidden="true" /><span>Partners told through the API; bookings released</span></div>
                {q.toCredit > 0 && <div><Clock size={15} aria-hidden="true" /><span>Airbnb Credit back within 24 hours<Cite id="refundTiming" /></span></div>}
                {q.toCard > 0 && <div><Clock size={15} aria-hidden="true" /><span>Card refund within 15 business days<Cite id="refundTiming" /></span></div>}
              </div>
              <button className="link" style={{ justifySelf: 'start' }} onClick={() => setDone(false)}>Start over</button>
            </div>
          ) : (
            <button className="btn btn-dark btn-block" disabled={sel.length === 0} onClick={() => setDone(true)}>Cancel {sel.length === lines.length ? 'whole trip' : `${sel.length} item${sel.length === 1 ? '' : 's'}`}</button>
          )}
        </aside>
      </div>

      <div className="compare">
        <div className="col-today">
          <h4>The same cancellation today</h4>
          <ol>
            <li>Cancel the stay on Airbnb.</li>
            {lines.filter((l) => l.id !== 'stay').map((l) => <li key={l.id}>Separately cancel with {SELLER_TODAY[l.id]}, on its terms.</li>)}
            <li>Track {lines.length} refunds from {lines.length} merchants.</li>
          </ol>
          <p style={{ marginTop: 8 }}><small>Cancelling a stay doesn't cancel the car.<Cite id="car" /> Partners handle their own refunds.<Cite id="offers" /></small></p>
        </div>
        <div className="col-new">
          <h4>In this concept <Tag kind="proposed" /></h4>
          <ol>
            <li>Cancel once in Trips, and see each item's outcome first.</li>
            <li>Airbnb pays the refund and settles with partners afterwards.</li>
            <li>One tracker shows everything.</li>
          </ol>
          <p style={{ marginTop: 8 }}><small>Partner cancellation windows here are proposed for the concept, not partners' actual terms.</small></p>
        </div>
      </div>
    </div>
  );
}

const SCENARIOS = [
  {
    id: 'host', icon: HomeIcon, name: 'Host cancels',
    what: 'Five days before arrival, the host cancels the stay.',
    today: [<>Stay refunded in full; Airbnb generally offers it as travel credit, and the guest can ask for the original payment instead.<Cite id="rebook" /></>, 'The car, ride and groceries stay booked with the old address.', 'The guest fixes each one with each partner.'],
    next: ['Trips flags the whole trip and offers similar homes.', 'If the guest rebooks, the new address goes to the ride and groceries automatically.', 'If they give up, everything cancels and Airbnb waives partner fees.'],
    money: 'Airbnb pays any partner fee, since the guest didn\'t cause this.',
  },
  {
    id: 'flight', icon: PlaneTakeoff, name: 'Flight delayed',
    what: 'The flight lands three hours late.',
    today: [<>The Welcome Pickups driver tracks the flight.<Cite id="summer" /></>, 'The guest calls the car counter to hold the rental.', 'The guest messages the host about a late arrival.'],
    next: ['The flight number is shared once, so the driver, car counter and host all update.', 'Trips shows the new plan.', 'If the counter will be closed, the guest is offered a morning pickup and a ride that night.'],
    money: 'Proposed: no extra charge to the guest for a delay the driver can see.',
  },
  {
    id: 'noshow', icon: UserX, name: 'Driver doesn\'t show',
    what: 'No driver at the airport. The guest takes a taxi for $58.',
    today: [<>Airbnb's rebooking policy covers homes, not third-party rides.<Cite id="rebook" /></>, <>The guest contacts Welcome Pickups support.<Cite id="pickups" /></>, 'The taxi receipt goes to the partner to review.'],
    next: ['The guest reports it in Trips with a receipt photo, within 72 hours, matching Airbnb\'s window.', 'Airbnb refunds the ride right away and reimburses the taxi up to a limit.', 'Airbnb recovers the cost from the partner.'],
    money: 'Airbnb pays first. The partner repays under its service agreement.',
  },
  {
    id: 'grocery', icon: PackageX, name: 'Groceries wrong',
    what: 'Two items are missing and one is damaged.',
    today: ['The guest goes to Instacart, with a separate account and a separate support team.', <>Any refund follows Instacart's terms.<Cite id="offers" /></>],
    next: ['The guest picks items in Trips and adds a photo.', 'Item refunds are taken off the final charge before capture, or refunded if it was already captured.', 'Pre-stocked orders include a host check-off, so disputes have evidence.'],
    money: 'The partner covers it through settlement.',
  },
  {
    id: 'counter', icon: CreditCard, name: 'Car counter charge',
    what: 'A $120 upgrade is added at the counter, and the guest says they refused it.',
    today: ['The charge comes from the rental company.', 'The guest disputes it with the supplier or through CarTrawler support.'],
    next: ['Airbnb can\'t reverse it: the counter contract is between the guest and the supplier.', 'Trips shows what was prepaid, so the guest has proof.', 'Airbnb raises the case with the supplier for the guest and reports back.'],
    money: 'Stays with the supplier. This is the limit of embedding: the counter is outside Airbnb\'s checkout.',
    limit: true,
  },
  {
    id: 'home', icon: AlertTriangle, name: 'Home not as described',
    what: 'The home has no heat, so the guest leaves on the first night.',
    today: [<>The guest reports it within 72 hours of discovery. AirCover covers help rebooking or a refund.<Cite id="aircover" /></>, 'The car stays fine. The drop-off ride still goes to the old address.'],
    next: ['AirCover applies as it does now.', 'After the guest rebooks, the drop-off ride updates automatically.', 'Groceries already delivered can be credited.'],
    money: 'Published AirCover rules for the stay. Proposed credit for groceries.',
  },
  {
    id: 'dates', icon: CalendarDays, name: 'Change dates',
    what: 'The family wants to arrive a day later.',
    today: ['Change the stay on Airbnb, then the host approves.', 'Modify the car in Trips, on partner terms.', 'Contact Welcome Pickups and Instacart separately.'],
    next: ['Change once in Trips.', 'See the new price for every item before confirming.', 'One charge or refund covers the difference.'],
    money: 'Repriced item by item. If a partner can\'t move, the guest sees that first.',
  },
];

function DisputeTab() {
  const [id, setId] = useState('noshow');
  const s = SCENARIOS.find((x) => x.id === id);
  return (
    <div className="scen-grid">
      <div className="scen-list" role="group" aria-label="Scenarios">
        {SCENARIOS.map((x) => (
          <button key={x.id} className={id === x.id ? 'on' : ''} onClick={() => setId(x.id)} aria-pressed={id === x.id}>
            <x.icon size={17} aria-hidden="true" />{x.name}
          </button>
        ))}
      </div>
      <div className="stack">
        <h3>{s.what}</h3>
        <div className="compare">
          <div className="col-today"><h4>Today</h4><ol>{s.today.map((t, i) => <li key={i}>{t}</li>)}</ol></div>
          <div className="col-new"><h4>In this concept <Tag kind="proposed" /></h4><ol>{s.next.map((t, i) => <li key={i}>{t}</li>)}</ol></div>
        </div>
        <div className={`note ${s.limit ? 'note-warn' : ''}`}><span><strong>Who pays:</strong> {s.money}</span></div>
      </div>
    </div>
  );
}

const REASONS = [
  { id: 'cancelled', label: 'Cancelled, says no refund' },
  { id: 'notreceived', label: 'Service not received' },
  { id: 'notdescribed', label: 'Not as described' },
  { id: 'fraud', label: 'Guest says it wasn\'t them' },
];
const EVIDENCE = { stay: 'check-in and message history', car: 'signed rental agreement and return record', ride: 'driver GPS log and pickup time', grocery: 'delivery photo and timestamp', luggage: 'bag drop scan' };

function chargebackPath(line, reason, hasEvidence) {
  const amt = line.total;
  const partner = line.id === 'stay' ? 'Host' : line.seller;
  const item = line.label.toLowerCase();
  const start = { day: 'Day 0', text: `The guest disputes the ${item} line with their bank. Only ${money(amt)} is at issue, because each item has its own charge.` };
  if (reason === 'cancelled') {
    return {
      steps: [start,
        { day: 'Day 0-1', text: 'A pre-dispute alert reaches Airbnb, which finds the cancellation record.' },
        { day: 'Day 1', text: 'Airbnb refunds right away, and the dispute closes before it becomes a chargeback.' }],
      ledger: { guest: amt, airbnb: 0, partner: -amt }, outcome: 'Refunded', note: `${partner} repays through settlement, if the cancellation was within its window.`,
    };
  }
  if (reason === 'fraud') {
    return {
      steps: [start,
        { day: 'Day 1', text: 'Airbnb checks device, account history and whether 3-D Secure was used.' },
        { day: 'Day 3', text: 'Risk team locks the account if a takeover looks likely, and cancels other upcoming items.' },
        { day: 'By day 30', text: hasEvidence ? 'Airbnb contests, with proof the real guest used the service.' : 'Airbnb accepts the chargeback.' }],
      ledger: hasEvidence ? { guest: 0, airbnb: 0, partner: 0 } : { guest: amt, airbnb: -amt, partner: 0 }, outcome: hasEvidence ? 'Contested' : 'Airbnb absorbs it',
      note: 'Airbnb made the risk decision at checkout, so fraud loss sits with Airbnb, and the partner keeps its payment. This is a proposed contract term.',
    };
  }
  return {
    steps: [start,
      { day: 'Day 1', text: 'Airbnb pauses the partner payout for this item and asks the partner for evidence automatically.' },
      { day: 'Day 2', text: 'Airbnb messages the guest in Trips and offers a direct fix. Many disputes can end here.' },
      { day: 'By day 30', text: hasEvidence ? `Airbnb submits one evidence pack with the ${EVIDENCE[line.id]}.` : 'The partner has no proof, so Airbnb accepts the chargeback.' },
      { day: 'After', text: hasEvidence ? 'The card network process decides. Airbnb keeps the funds if it wins.' : `The amount is recovered from ${partner} at the next settlement.` }],
    ledger: hasEvidence ? { guest: 0, airbnb: 0, partner: 0 } : { guest: amt, airbnb: 0, partner: -amt },
    outcome: hasEvidence ? 'Contested with evidence' : 'Guest refunded, partner pays',
    note: 'Airbnb is on the front line with the bank. The partner carries the cost when the failure is theirs. This is a proposed contract term.',
  };
}

function ChargebackTab({ lines, model, setModel }) {
  const [item, setItem] = useState(lines.find((l) => l.id === 'ride')?.id ?? lines[0].id);
  const [reason, setReason] = useState('notreceived');
  const [evidence, setEvidence] = useState(true);
  const line = lines.find((l) => l.id === item) ?? lines[0];
  const path = chargebackPath(line, reason, evidence);
  const fmt = (n) => (n === 0 ? '$0.00' : `${n > 0 ? '+' : ''}${money(n)}`);
  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="note note-brand"><span>Airbnb takes the payment under either model, so we assume partner disputes reach Airbnb first. That's the main cost of embedding, and the reason each item gets its own charge and evidence trail. <Tag kind="proposed" /></span></div>
      <div>
        <h3 style={{ marginBottom: 8 }}>Which payment model?</h3>
        <ModelToggle model={model} setModel={setModel} />
      </div>
      <div>
        <h3 style={{ marginBottom: 8 }}>Which charge is disputed?</h3>
        <div className="chips" role="group" aria-label="Disputed item">
          {lines.map((l) => <button key={l.id} className={`chip ${line.id === l.id ? 'on' : ''}`} aria-pressed={line.id === l.id} onClick={() => setItem(l.id)}><strong>{l.id === 'stay' ? 'Stay' : l.seller}</strong><small className="num">{money(l.total)}</small></button>)}
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: 8 }}>What does the guest tell the bank?</h3>
        <div className="chips" role="group" aria-label="Dispute reason">
          {REASONS.map((r) => <button key={r.id} className={`chip ${reason === r.id ? 'on' : ''}`} aria-pressed={reason === r.id} onClick={() => setReason(r.id)}><strong>{r.label}</strong></button>)}
        </div>
      </div>
      {reason !== 'cancelled' && <label className="check"><input type="checkbox" checked={evidence} onChange={(e) => setEvidence(e.target.checked)} /><span>Evidence is available: {EVIDENCE[line.id]}</span></label>}

      <div className="cancel-grid">
        <div className="card">
          <div className="between"><h3>What happens</h3><strong>{path.outcome}</strong></div>
          <div className="cb-steps" style={{ marginTop: 8 }}>
            {path.steps.map((st) => <div className="cb-step" key={st.day}><b>{st.day}</b><span>{st.text}</span></div>)}
          </div>
        </div>
        <aside className="stack">
          <div className="ledger" style={{ gridTemplateColumns: '1fr' }}>
            <div><span>Guest</span><strong>{fmt(path.ledger.guest)}</strong></div>
            <div><span>Airbnb</span><strong>{fmt(path.ledger.airbnb)}</strong></div>
            <div><span>{line.id === 'stay' ? 'Host' : line.seller}</span><strong>{fmt(path.ledger.partner)}</strong></div>
          </div>
          <small>{path.note} Network dispute fees aren't modeled.</small>
          {line.id !== 'stay' && (
            <div className="note"><span><strong>{MODELS[model].name}:</strong> {model === 'agent'
              ? `${line.seller} is the seller, so it owes the guest. Airbnb handles the dispute and can hold funds until the service starts.`
              : `Airbnb is the seller, so it owes the guest even if ${line.seller} can't or won't repay.`}</span></div>
          )}
        </aside>
      </div>

      <div className="compare">
        <div className="col-today">
          <h4>Today</h4>
          <p style={{ fontSize: 14 }}>{line.id === 'stay' ? 'Airbnb Payments charged the guest, so the stay dispute comes to Airbnb.' : `${line.seller} is the merchant, so the dispute goes to ${line.seller}. Airbnb isn't party to it, and doesn't own the guest's experience of it.`}<Cite id="offers" /></p>
        </div>
        <div className="col-new">
          <h4>Timing to design around</h4>
          <p style={{ fontSize: 14 }}>Cardholders generally get about 120 days to dispute, and Visa merchants typically about 30 days to respond. Figures vary by reason and network.<Cite id="chargeTime" /></p>
        </div>
      </div>
    </div>
  );
}

const OWNERSHIP = [
  ['Legal seller', 'Partner', 'Partner', 'Airbnb'],
  ['Takes the payment', 'Partner', 'Airbnb, as agent', 'Airbnb'],
  ['Cancellation rules', 'Partner terms', 'Partner terms, shown in Airbnb', 'Agreed with partner, shown in Airbnb'],
  ['Issuing the refund', 'Partner', 'Airbnb, funded by partner', 'Airbnb, then recovered from partner'],
  ['Refund to Airbnb Credit', 'Not possible', 'Yes, if credit paid for it', 'Yes, if credit paid for it'],
  ['First-line support', 'Partner', 'Airbnb', 'Airbnb'],
  ['Who owes the guest on a failure', 'Partner', 'Partner', 'Airbnb, then recovers from partner'],
  ['Handling card disputes', 'Partner', 'Airbnb, with partner evidence', 'Airbnb, with partner evidence'],
  ['Fraud loss', 'Partner', 'Airbnb', 'Airbnb'],
  ['Counter or doorstep extras', 'Supplier', 'Supplier', 'Supplier'],
  ['Sales tax and regulation', 'Partner', 'Mostly partner, needs review', 'More on Airbnb, needs review'],
];

function OwnershipTab() {
  return (
    <div className="stack">
      <p className="muted" style={{ maxWidth: 700 }}>Today's column reflects Airbnb's published terms: the third party is merchant, processes payment, and handles support and refunds.<Cite id="offers" /> Both concept columns are proposals to test with partners, legal and finance.</p>
      <div className="tablewrap">
        <table>
          <thead><tr><th>Responsibility</th><th>Today</th><th>Collection agent</th><th>Merchant of record</th></tr></thead>
          <tbody>{OWNERSHIP.map(([a, b, c, d]) => <tr key={a}><th>{a}</th><td>{b}</td><td>{c}</td><td>{d}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

const TABS = [['cancel', 'Cancel and refund'], ['dispute', 'Disruptions and disputes'], ['cb', 'Chargebacks'], ['own', 'Who owns what']];

export default function StepAfter({ cart, plan, credit, booked, carFailed, model, setModel }) {
  const [tab, setTab] = useState('cancel');
  const usable = booked && Object.keys(cart).length > 0;
  const lines = useMemo(() => {
    if (!usable) return buildLines(DEFAULT_CART);
    // A car that failed to confirm was never booked, so it can't be cancelled or disputed.
    return buildLines(cart).filter((l) => !(carFailed && l.id === 'car'));
  }, [usable, cart, carFailed]);
  const effPlan = usable ? plan : 'full';
  const sched = schedule(lines, effPlan, usable && credit ? CREDIT : 0);

  return (
    <>
      <PageHead
        step="4"
        title="After booking: one trip, one place to fix it"
        lede="Embedding only pays off if it holds up when plans change. This is where the guest gets the benefit, and where Airbnb takes on the cost."
      />
      <div className="card card-soft" style={{ marginBottom: 24 }}>
        <div className="between" style={{ flexWrap: 'wrap' }}>
          <strong>{usable ? 'Your trip from Step 2' : 'Sample family trip'}: {money(sched.tripTotal)}</strong>
          <small>{usable ? (plan === 'later' ? 'Stay on Reserve Now, Pay Later' : 'Stay paid in full') : 'Book a trip in Step 2 to use your own cart'}</small>
        </div>
        <div className="row" style={{ flexWrap: 'wrap', marginTop: 10, gap: 14 }}>
          {lines.map((l) => { const Ic = ICONS[l.id]; return <span className="row" key={l.id} style={{ gap: 6, fontSize: 14 }}><Ic size={16} aria-hidden="true" />{l.label}</span>; })}
        </div>
      </div>

      <div className="tabs" role="tablist">
        {TABS.map(([id, label]) => <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>{label}</button>)}
      </div>
      {tab === 'cancel' && <CancelTab key={lines.map((l) => l.id).join()} lines={lines} plan={effPlan} creditUsed={sched.creditUsed} />}
      {tab === 'dispute' && <DisputeTab />}
      {tab === 'cb' && <ChargebackTab lines={lines} model={model} setModel={setModel} />}
      {tab === 'own' && <OwnershipTab />}
      <div className="nextstep"><a className="btn" href="#/sources">Real vs. assumed</a></div>
    </>
  );
}

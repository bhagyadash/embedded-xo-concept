import React, { useEffect, useMemo, useState } from 'react';
import { Car, ShoppingBasket, PlaneLanding, Luggage, Check, Loader2, AlertTriangle, ShieldCheck, Home, Info } from 'lucide-react';
import { Cite, Tag, PageHead, Modal, Stepper, Radio, CottageArt } from '../ui.jsx';
import { STAY, CARS, CAR_DAYS, CAR_PROTECTION_PER_DAY, GROCERIES, DEFAULT_CART, GROCERY_HOLD_BUFFER, RIDE, BAG, buildLines, schedule, groceryCost, money, r2 } from '../lib/pricing.js';

const CREDIT = 75;
const ICONS = { stay: Home, car: Car, ride: PlaneLanding, grocery: ShoppingBasket, luggage: Luggage };

const ADDONS = [
  { id: 'ride', title: 'Airport pickup and drop-off', provider: 'Welcome Pickups', blurb: 'A private car meets you at BNA and tracks your flight.', offer: '20% off rides' },
  { id: 'car', title: 'Car rental', provider: 'CarTrawler', blurb: 'Pick up at BNA, return when you leave.', offer: '20% back as Airbnb Credit on a first rental' },
  { id: 'grocery', title: 'Groceries', provider: 'Instacart', blurb: 'Arrive to a stocked kitchen, or get it delivered.', offer: '$0 delivery, $10 off $50+' },
  { id: 'luggage', title: 'Luggage storage', provider: 'Bounce', blurb: 'Your flight is late on Monday. Checkout is at 11.', offer: '15% off' },
];

function Provided({ name }) {
  return <p className="provided">Provided by {name}. Payment, changes and support stay in Airbnb.</p>;
}

function CarSheet({ value, onSave, onClose }) {
  const [v, setV] = useState(value ?? DEFAULT_CART.car);
  const line = buildLines({ car: v }).find((l) => l.id === 'car');
  return (
    <Modal title="Add a car" onClose={onClose} footer={<><div><strong className="num">{money(line.total)}</strong><br /><small>{CAR_DAYS} days, taxes included</small></div><button className="btn btn-dark" onClick={() => onSave(v)}>Add to trip</button></>}>
      <Provided name="CarTrawler" />
      <div className="field-grid">
        <div className="field"><small>Pickup</small><div>BNA, Dec 10, 3:30 pm</div></div>
        <div className="field"><small>Return</small><div>BNA, Dec 14, 4:00 pm</div></div>
      </div>
      <div className="stack">
        {CARS.map((c) => (
          <Radio key={c.id} name="car" checked={v.carId === c.id} onChange={() => setV({ ...v, carId: c.id })} title={`${c.name} · ${c.supplier}`} sub={`${c.model} · ${c.seats} seats, ${c.bags} bags`} right={`$${c.perDay}/day`} />
        ))}
      </div>
      <label className="check"><input type="checkbox" checked={v.protection} onChange={(e) => setV({ ...v, protection: e.target.checked })} /><span>Add full protection, ${CAR_PROTECTION_PER_DAY}/day</span></label>
      <div className="note"><ShieldCheck size={16} aria-hidden="true" /><span>Your verified Airbnb name and license carry over, so there's no form to fill in. You'll still show your license and a card at the counter.</span></div>
      <small>Prices are sample data. Suppliers shown are ones reported on Airbnb's car rentals.<Cite id="cartrawlerUs" /></small>
    </Modal>
  );
}

function RideSheet({ value, onSave, onClose }) {
  const [v, setV] = useState(value ?? DEFAULT_CART.ride);
  const line = buildLines({ ride: v }).find((l) => l.id === 'ride');
  return (
    <Modal title="Add airport rides" onClose={onClose} footer={<><div><strong className="num">{line ? money(line.total) : '$0.00'}</strong><br /><small>After 20% off</small></div><button className="btn btn-dark" disabled={!line} onClick={() => onSave(v)}>Add to trip</button></>}>
      <Provided name="Welcome Pickups" />
      <label className="check"><input type="checkbox" checked={v.arrival} onChange={(e) => setV({ ...v, arrival: e.target.checked })} /><span><strong>Pickup</strong><br /><small>BNA to {STAY.title}, Dec 10. ${RIDE.oneWay} before discount.</small></span></label>
      <label className="check"><input type="checkbox" checked={v.departure} onChange={(e) => setV({ ...v, departure: e.target.checked })} /><span><strong>Drop-off</strong><br /><small>{STAY.title} to BNA, Dec 14. ${RIDE.oneWay} before discount.</small></span></label>
      <div className="field"><small>Flight, from your trip</small><div>{v.flight} · lands 2:45 pm</div></div>
      <div className="note"><Info size={16} aria-hidden="true" /><span>The listing address is shared with your driver automatically. Your driver tracks the flight and meets you at the curb.<Cite id="summer" /></span></div>
      <div className="note note-warn"><AlertTriangle size={16} aria-hidden="true" /><span>Airbnb hasn't said which US airports Welcome Pickups covers. Nashville is assumed. If a city had no coverage, this row would be hidden or use a second partner.</span></div>
    </Modal>
  );
}

function GrocerySheet({ value, onSave, onClose }) {
  const [v, setV] = useState(value ?? DEFAULT_CART.grocery);
  const g = groceryCost(v);
  const setQty = (id, q) => setV({ ...v, items: { ...v.items, [id]: q } });
  const toFifty = r2(50 - g.subtotal);
  return (
    <Modal title="Add groceries" onClose={onClose} footer={<><div><strong className="num">{money(g.total)}</strong><br /><small>Estimate. Charged on delivery.</small></div><button className="btn btn-dark" disabled={g.subtotal < 10} onClick={() => onSave(v)}>Add to trip</button></>}>
      <Provided name="Instacart" />
      <div className="stack">
        <Radio name="gm" checked={v.mode === 'prestock'} onChange={() => setV({ ...v, mode: 'prestock' })} title="Stocked before you arrive" sub="Your host receives the order. Select cities only." />
        <Radio name="gm" checked={v.mode === 'deliver'} onChange={() => setV({ ...v, mode: 'deliver' })} title="Delivered after check-in" sub="Dec 10, 5 to 6 pm" />
      </div>
      <div>
        {GROCERIES.map((i) => (
          <div className="grocery-row" key={i.id}>
            <div><div>{i.name}</div><small className="num">{money(i.price)}</small></div>
            <Stepper label={i.name} value={v.items[i.id] ?? 0} onChange={(q) => setQty(i.id, q)} />
          </div>
        ))}
      </div>
      <div className="pricerows">
        <div className="between"><span>Items</span><span className="num">{money(g.subtotal)}</span></div>
        <div className="between"><span>Delivery</span><span className="sum-disc">$0.00</span></div>
        {g.discount > 0 && <div className="between sum-disc"><span>Offer: $10 off $50+</span><span className="num">-{money(g.discount)}</span></div>}
      </div>
      {g.subtotal < 10 && <div className="note note-warn"><AlertTriangle size={16} aria-hidden="true" /><span>$0 delivery needs a $10 minimum order.<Cite id="offers" /></span></div>}
      {g.subtotal >= 10 && g.subtotal < 50 && <div className="note note-ok"><Info size={16} aria-hidden="true" /><span>Add {money(toFifty)} more to get $10 off.</span></div>}
      <small>Alcohol isn't sold here: the offer excludes it and delivery needs an ID check.<Cite id="offers" /> Items and prices are sample data.</small>
    </Modal>
  );
}

function LuggageSheet({ value, onSave, onClose }) {
  const [v, setV] = useState(value ?? DEFAULT_CART.luggage);
  const line = buildLines({ luggage: v }).find((l) => l.id === 'luggage');
  return (
    <Modal title="Add luggage storage" onClose={onClose} footer={<><div><strong className="num">{line ? money(line.total) : '$0.00'}</strong><br /><small>After 15% off</small></div><button className="btn btn-dark" disabled={!line} onClick={() => onSave(v)}>Add to trip</button></>}>
      <Provided name="Bounce" />
      <div className="between"><div><strong>Bags</strong><br /><small>${BAG.perBag} per bag, sample rate</small></div><Stepper label="bag" value={v.bags} onChange={(bags) => setV({ bags })} min={0} max={6} /></div>
      <div className="field"><small>Nearest drop-off</small><div>Coffee shop, 0.3 miles from the cottage</div></div>
      <div className="field"><small>When</small><div>Mon, Dec 14, 11:00 am to 3:00 pm</div></div>
    </Modal>
  );
}

const SHEETS = { car: CarSheet, ride: RideSheet, grocery: GrocerySheet, luggage: LuggageSheet };

const PROCESS = ['Check risk once for the whole trip', 'Hold partner inventory', 'Authorize your card', 'Confirm the stay', 'Confirm partner bookings', 'Capture what is due today'];

function Processing({ onDone }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (i >= PROCESS.length) { onDone(); return undefined; }
    const t = setTimeout(() => setI(i + 1), 520);
    return () => clearTimeout(t);
  }, [i, onDone]);
  return (
    <div className="card" style={{ maxWidth: 480, margin: '40px auto' }} role="status">
      <h2 style={{ marginBottom: 16 }}>Booking your trip</h2>
      <div className="progress">
        {PROCESS.map((p, n) => (
          <div key={p} className={n < i ? 'done' : n === i ? 'now' : ''}>
            {n < i ? <Check size={17} color="#00783c" aria-hidden="true" /> : n === i ? <Loader2 size={17} className="spin" aria-hidden="true" /> : <span style={{ width: 17 }} />}
            {p}
          </div>
        ))}
      </div>
    </div>
  );
}

const TL_DATES = { stay: 'Dec 10', ride: 'Dec 10', car: 'Dec 10', grocery: 'Dec 10', luggage: 'Dec 14' };

function Confirmed({ lines, sched, carFailed, onSwapCar, onDropCar, plan, go, reset }) {
  return (
    <div className="confirm">
      <PageHead step="2" title="Your whole trip is booked" lede={`One booking in Trips, one receipt, one place to get help. ${money(sched.today)} charged today.`} />
      {carFailed && (
        <div className="note note-warn">
          <AlertTriangle size={17} aria-hidden="true" />
          <div className="stack" style={{ gap: 8 }}>
            <span><strong>The Midsize SUV sold out just as you paid.</strong> Your stay and everything else are confirmed, and you weren't charged for the car.</span>
            <div className="row" style={{ flexWrap: 'wrap' }}>
              <button className="btn btn-dark" onClick={onSwapCar}>Switch to a Minivan</button>
              <button className="btn" onClick={onDropCar}>Skip the car</button>
            </div>
          </div>
        </div>
      )}
      <div className="card">
        <div className="timeline">
          {lines.map((l) => {
            const Ic = ICONS[l.id];
            const failed = carFailed && l.id === 'car';
            return (
              <div className="tl" key={l.id}>
                <span className="tl-date">{TL_DATES[l.id]}</span>
                <Ic size={20} aria-hidden="true" />
                <div><strong>{l.label}</strong><br /><small>{l.sub}{l.id !== 'stay' && ` · by ${l.seller}`}</small></div>
                <span className="tl-state" style={{ color: failed ? '#a14a00' : '#00783c' }}>{failed ? 'Not booked' : 'Confirmed'}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="card card-soft stack">
        <h3>What the guest sees on their statement</h3>
        <small>One merchant, one line per item, so each charge is easy to recognize. Format is proposed.</small>
        <div className="pricerows num">
          {lines.filter((l) => !(carFailed && l.id === 'car')).map((l) => {
            const when = l.id === 'grocery' ? 'on delivery' : l.id === 'stay' && plan === 'later' ? 'Dec 5' : 'today';
            return <div className="between" key={l.id}><span>AIRBNB* {l.id === 'stay' ? 'STAY' : l.id === 'grocery' ? 'GROCERY' : l.id === 'ride' ? 'AIRPORT CAR' : l.id === 'car' ? 'CAR RENTAL' : 'LUGGAGE'} NASHVILLE <small>{when}</small></span><span>{money(l.total)}</span></div>;
          })}
        </div>
      </div>
      <div className="row" style={{ flexWrap: 'wrap' }}>
        <button className="btn btn-dark" onClick={() => go('after')}>Step 4: See what happens after booking</button>
        <button className="btn" onClick={reset}>Book again</button>
      </div>
    </div>
  );
}

export default function StepEmbedded({ go, cart, setCart, plan, setPlan, credit, setCredit, booked, setBooked, carFailed, setCarFailed }) {
  const [sheet, setSheet] = useState(null);
  const [consent, setConsent] = useState(false);
  const [phase, setPhase] = useState(booked ? 'done' : 'checkout');
  const [simFail, setSimFail] = useState(false);

  const lines = useMemo(() => buildLines(cart), [cart]);
  const payable = carFailed ? lines.filter((l) => l.id !== 'car') : lines;
  const sched = schedule(payable, plan, credit ? CREDIT : 0);
  const partnerCount = lines.length - 1;
  const needsConsent = partnerCount > 0;
  const Sheet = sheet ? SHEETS[sheet] : null;
  const maxLine = Math.max(...lines.map((l) => l.total));
  const finish = React.useCallback(() => {
    setBooked(true);
    setPhase('done');
  }, [setBooked]);

  const canFail = simFail && cart.car;

  if (phase === 'processing') return <Processing onDone={finish} />;
  if (phase === 'done') {
    return (
      <Confirmed
        lines={lines} sched={sched} carFailed={carFailed} plan={plan} go={go}
        onSwapCar={() => { setCart({ ...cart, car: { ...cart.car, carId: 'minivan' } }); setCarFailed(false); }}
        onDropCar={() => { const { car, ...rest } = cart; setCart(rest); setCarFailed(false); }}
        reset={() => { setBooked(false); setCarFailed(false); setConsent(false); setPhase('checkout'); }}
      />
    );
  }

  return (
    <>
      <PageHead
        step="2"
        title="The whole trip in one Airbnb checkout"
        lede="Partners supply the car, the ride, the groceries and the storage. The guest never leaves Airbnb: one cart, one payment method, one receipt, one place to get help."
      />
      <div style={{ marginBottom: 20 }}>
        <button className="link" onClick={() => setCart(DEFAULT_CART)}>Fill the cart with a sample family trip</button>
      </div>

      <div className="xo">
        <div className="xo-main">
          <section className="xo-section" aria-label="Add to your trip">
            <h2>Add to your trip</h2>
            {ADDONS.map((a) => {
              const Ic = ICONS[a.id];
              const line = lines.find((l) => l.id === a.id);
              return (
                <div className={`addon ${line ? 'on' : ''}`} key={a.id}>
                  <div className="addon-ic"><Ic size={22} aria-hidden="true" /></div>
                  <div className="grow">
                    <strong>{line ? line.label : a.title}</strong><br />
                    <small>{line ? line.sub : a.blurb}</small><br />
                    <span className="offer">{a.offer}</span>
                  </div>
                  <div className="addon-actions">
                    {line ? (
                      <>
                        <strong className="num">{money(line.total)}</strong>
                        <button className="link" onClick={() => setSheet(a.id)}>Edit</button>
                        <button className="link" onClick={() => { const n = { ...cart }; delete n[a.id]; setCart(n); }} aria-label={`Remove ${a.title}`}>Remove</button>
                      </>
                    ) : (
                      <button className="btn" onClick={() => setSheet(a.id)} aria-label={`Add ${a.title}`}>Add</button>
                    )}
                  </div>
                </div>
              );
            })}
          </section>

          <section className="xo-section" aria-label="Choose when to pay">
            <h2>Choose when to pay for your stay</h2>
            <Radio name="plan" checked={plan === 'full'} onChange={() => setPlan('full')} title="Pay in full" sub="Pay for the stay now." />
            <Radio name="plan" checked={plan === 'later'} onChange={() => setPlan('later')} title="Reserve Now, Pay Later" sub="$0 for the stay today, charged Dec 5. This listing is Moderate, so it's eligible." />
            {partnerCount > 0 && <small>Pay Later covers the stay only. Partner items follow the schedule in your summary.</small>}
          </section>

          <section className="xo-section" aria-label="Payment method">
            <h2>Pay with</h2>
            <div className="field"><small>One payment method for everything</small><div>Visa ending 4242 <Tag kind="sample" /></div></div>
            <label className="check"><input type="checkbox" checked={credit} onChange={(e) => setCredit(e.target.checked)} /><span>Use {money(CREDIT)} Airbnb Credit <Tag kind="sample" /><br /><small>Works on partner items here. Today it can't be used on them.<Cite id="offers" /></small></span></label>
          </section>

          <section className="xo-section" aria-label="Terms">
            <h2>Review and pay</h2>
            {lines.map((l) => (
              <div className="between" key={l.id} style={{ fontSize: 14 }}>
                <span><strong>{l.id === 'stay' ? 'Stay' : l.seller}:</strong> {POLICY[l.id]}</span>
              </div>
            ))}
            {needsConsent && (
              <label className="check">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <span>Share only what's needed with {lines.filter((l) => l.id !== 'stay').map((l) => l.seller).join(', ')}, and I agree to their service terms.</span>
              </label>
            )}
            <div className="demo">
              <strong>Prototype control</strong>
              <label className="check"><input type="checkbox" checked={simFail} onChange={(e) => setSimFail(e.target.checked)} /><span>Make the car sell out during payment</span></label>
              {simFail && !cart.car && <small>Add a car first.</small>}
            </div>
            <button
              className="btn btn-brand btn-block"
              disabled={needsConsent && !consent}
              onClick={() => { setCarFailed(Boolean(canFail)); setPhase('processing'); }}
            >
              {sched.today === 0 ? 'Confirm trip' : `Confirm and pay ${money(sched.today)}`}
            </button>
            {needsConsent && !consent && <small>Tick the box above to continue.</small>}
          </section>
        </div>

        <aside className="summary card" aria-label="Trip summary">
          <div className="sum-head">
            <CottageArt />
            <div><strong>{STAY.title}</strong><br /><small>{STAY.place}</small><br /><small>{STAY.checkIn} to {STAY.checkOut} · {STAY.guests} guests</small></div>
          </div>
          {lines.map((l) => (
            <div className="sum-line" key={l.id}>
              <span>{l.label}<small>{l.id === 'stay' ? 'Taxes and fees included' : `by ${l.seller}`}</small></span>
              <span className="num">{money(l.total)}</span>
            </div>
          ))}
          <div className="sum-block">
            <div className="sum-line"><strong>Trip total</strong><strong className="num">{money(sched.tripTotal)}</strong></div>
            {sched.savings > 0 && <div className="sum-line sum-disc"><span>Offers already applied</span><span className="num">{money(sched.savings)}</span></div>}
            {sched.creditBack > 0 && <div className="sum-line sum-disc"><span>Airbnb Credit you'll earn on the car</span><span className="num">{money(sched.creditBack)}</span></div>}
          </div>
          <div className="sum-block">
            <div className="sum-line due"><span>Due today</span><span className="num">{money(sched.today)}</span></div>
            {sched.creditUsed > 0 && <div className="sum-line sum-disc"><span>After Airbnb Credit</span><span className="num">-{money(sched.creditUsed)}</span></div>}
            {sched.later > 0 && <div className="sum-line"><span>Due Dec 5, the stay</span><span className="num">{money(sched.later)}</span></div>}
            {sched.onDelivery > 0 && <div className="sum-line"><span>On delivery, groceries<small>Estimate. We hold {money(sched.hold)} in case of substitutions.</small></span><span className="num">{money(sched.onDelivery)}</span></div>}
          </div>
        </aside>
      </div>

      <section className="section">
        <h2>Behind the scenes</h2>
        <p className="sub">The guest sees one checkout. Airbnb splits it into separate orders and pays each seller. This updates as you change the cart.</p>
        <div className="behind">
          <div className="card">
            <h3 style={{ marginBottom: 14 }}>Where the guest's money goes</h3>
            <div className="flow-rows">
              {lines.map((l) => (
                <div className="flow-row" key={l.id}>
                  <span>{l.id === 'stay' ? 'Host' : l.seller}</span>
                  <div className="bar"><b className={l.id === 'stay' ? '' : 'p'} style={{ width: `${(l.total / maxLine) * 100}%` }} /></div>
                  <span className="num" style={{ textAlign: 'right' }}>{money(l.total)}</span>
                </div>
              ))}
            </div>
            <p style={{ marginTop: 14 }}><small>Gross by seller, before commissions. Airbnb's host fee is reported at 15.5%.<Cite id="hostFee" /> Partner commission terms aren't public, so none are shown.</small></p>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: 14 }}>Proposed payment model <Tag kind="proposed" /></h3>
            <ol className="seq">
              <li><b>1</b><span><strong>Airbnb is merchant of record</strong> for partner items, so one name appears on the card.</span></li>
              <li><b>2</b><span><strong>Each item is its own order</strong> with its own charge, refund and dispute trail.</span></li>
              <li><b>3</b><span><strong>Partners confirm by API</strong> and get paid net on a settlement schedule.</span></li>
              <li><b>4</b><span><strong>A partner failure never blocks the stay.</strong> The stay confirms first; a failed add-on isn't charged.</span></li>
              <li><b>5</b><span><strong>Variable amounts are held, not charged.</strong> Groceries capture the final amount on delivery. The {Math.round(GROCERY_HOLD_BUFFER * 100)}% hold buffer is an assumption.</span></li>
            </ol>
          </div>
        </div>
      </section>

      <div className="nextstep"><a className="btn btn-dark" href="#/industry">Step 3: How others have done this</a></div>

      {Sheet && (
        <Sheet value={cart[sheet]} onClose={() => setSheet(null)} onSave={(v) => { setCart({ ...cart, [sheet]: v }); setSheet(null); }} />
      )}
    </>
  );
}

const POLICY = {
  stay: 'Moderate. Full refund until 5 days before check-in.',
  car: 'Free cancellation until 48 hours before pickup.',
  ride: 'Free cancellation until 24 hours before each ride.',
  grocery: 'Free to cancel until shopping starts.',
  luggage: 'Free to cancel until drop-off.',
};

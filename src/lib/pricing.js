// Pure trip, payment and refund logic. Used by every step and covered by tests/pricing.test.js.
// All prices are SAMPLE data. Offer mechanics and home refund rules follow published Airbnb terms.

export const r2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
export const money = (n) =>
  `${n < 0 ? '-' : ''}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const STAY = {
  title: 'Porchlight Cottage',
  place: 'East Nashville, Tennessee',
  host: 'Dana',
  nights: 4,
  nightly: 189,
  cleaning: 95,
  taxRate: 0.15,
  checkIn: 'Thu, Dec 10',
  checkOut: 'Mon, Dec 14',
  policy: 'Moderate',
  guests: 4,
};

export const CARS = [
  { id: 'economy', name: 'Economy', model: 'Nissan Versa or similar', seats: 5, bags: 2, perDay: 48, supplier: 'Budget' },
  { id: 'suv', name: 'Midsize SUV', model: 'Toyota RAV4 or similar', seats: 5, bags: 4, perDay: 67, supplier: 'Hertz' },
  { id: 'minivan', name: 'Minivan', model: 'Chrysler Pacifica or similar', seats: 7, bags: 5, perDay: 84, supplier: 'Avis' },
];
export const CAR_DAYS = 4;
export const CAR_PROTECTION_PER_DAY = 14;
export const CAR_TAX_RATE = 0.18;

export const RIDE = { oneWay: 62, taxesPerRide: 4 };

export const GROCERIES = [
  { id: 'coffee', name: 'Whole bean coffee', price: 12.99 },
  { id: 'eggs', name: 'Eggs, 12 count', price: 4.49 },
  { id: 'milk', name: 'Whole milk, half gallon', price: 3.79 },
  { id: 'bread', name: 'Sourdough loaf', price: 5.99 },
  { id: 'fruit', name: 'Seasonal fruit box', price: 14.99 },
  { id: 'snacks', name: 'Kids snack pack', price: 9.49 },
  { id: 'pasta', name: 'Pasta and sauce dinner kit', price: 11.99 },
  { id: 'water', name: 'Sparkling water, 12 pack', price: 7.99 },
];
export const GROCERY_SERVICE_FEE = 4.5;
export const GROCERY_HOLD_BUFFER = 0.15;

export const BAG = { perBag: 8 };

export const DEFAULT_CART = {
  car: { carId: 'suv', protection: true },
  ride: { arrival: true, departure: true, flight: 'AA 2417' },
  grocery: { items: { coffee: 1, eggs: 1, milk: 1, bread: 1, fruit: 1, pasta: 2 }, mode: 'prestock' },
  luggage: { bags: 2 },
};

export const stayCost = () => {
  const lodging = STAY.nights * STAY.nightly;
  const taxes = r2((lodging + STAY.cleaning) * STAY.taxRate);
  return { lodging, cleaning: STAY.cleaning, taxes, total: r2(lodging + STAY.cleaning + taxes) };
};

export const groceryCost = (g) => {
  const subtotal = r2(Object.entries(g.items).reduce((s, [id, q]) => s + (GROCERIES.find((x) => x.id === id)?.price ?? 0) * q, 0));
  // Offer: $0 delivery on $10+, and $10 off $50+ (Airbnb Help 4271, section 2.6).
  const discount = subtotal >= 50 ? 10 : 0;
  const total = subtotal > 0 ? r2(subtotal - discount + GROCERY_SERVICE_FEE) : 0;
  return { subtotal, discount, total, hold: r2(total * (1 + GROCERY_HOLD_BUFFER)) };
};

// Builds one normalized line per item in the cart.
export function buildLines(cart) {
  const s = stayCost();
  const lines = [
    { id: 'stay', label: STAY.title, sub: `${STAY.nights} nights, ${STAY.checkIn} to ${STAY.checkOut}`, seller: 'Host', gross: s.total, discount: 0, total: s.total, creditBack: 0 },
  ];
  if (cart.car) {
    const c = CARS.find((x) => x.id === cart.car.carId);
    const base = c.perDay * CAR_DAYS;
    const extras = cart.car.protection ? CAR_PROTECTION_PER_DAY * CAR_DAYS : 0;
    const taxes = r2(base * CAR_TAX_RATE);
    // First rental: 20% back as Airbnb Credit, on subtotal only, capped at $200 (Help 4271, section 2.4).
    lines.push({ id: 'car', label: `${c.name} rental`, sub: `${c.supplier}, ${CAR_DAYS} days from BNA`, seller: 'CarTrawler', gross: r2(base + extras + taxes), discount: 0, total: r2(base + extras + taxes), creditBack: Math.min(r2(base * 0.2), 200), base });
  }
  if (cart.ride && (cart.ride.arrival || cart.ride.departure)) {
    const rides = (cart.ride.arrival ? 1 : 0) + (cart.ride.departure ? 1 : 0);
    const base = RIDE.oneWay * rides;
    const discount = r2(base * 0.2); // 20% off ride price, excludes taxes and fees (section 2.10)
    const taxes = RIDE.taxesPerRide * rides;
    lines.push({ id: 'ride', label: rides === 2 ? 'Airport pickup and drop-off' : cart.ride.arrival ? 'Airport pickup' : 'Airport drop-off', sub: 'Private car, BNA and the cottage', seller: 'Welcome Pickups', gross: base + taxes, discount, total: r2(base + taxes - discount), creditBack: 0, rides });
  }
  if (cart.grocery) {
    const g = groceryCost(cart.grocery);
    if (g.subtotal > 0) {
      lines.push({ id: 'grocery', label: 'Groceries', sub: cart.grocery.mode === 'prestock' ? 'Host pre-stocks before check-in' : 'Delivered Dec 10, 5 to 6 pm', seller: 'Instacart', gross: r2(g.subtotal + GROCERY_SERVICE_FEE), discount: g.discount, total: g.total, creditBack: 0, hold: g.hold });
    }
  }
  if (cart.luggage && cart.luggage.bags > 0) {
    const base = BAG.perBag * cart.luggage.bags;
    const discount = r2(base * 0.15); // 15% off storage price (section 2.2)
    lines.push({ id: 'luggage', label: 'Luggage storage', sub: `${cart.luggage.bags} bags on Dec 14 after checkout`, seller: 'Bounce', gross: base, discount, total: r2(base - discount), creditBack: 0 });
  }
  return lines;
}

// Splits the trip into a charge schedule. plan: 'full' | 'later'. credit: Airbnb Credit to apply.
export function schedule(lines, plan, credit = 0) {
  const stay = lines.find((l) => l.id === 'stay');
  const grocery = lines.find((l) => l.id === 'grocery');
  const others = lines.filter((l) => !['stay', 'grocery'].includes(l.id));
  const rawToday = r2(others.reduce((s, l) => s + l.total, 0) + (plan === 'full' ? stay.total : 0));
  const creditUsed = Math.min(credit, rawToday);
  return {
    today: r2(rawToday - creditUsed),
    creditUsed,
    later: plan === 'later' ? stay.total : 0,
    onDelivery: grocery ? grocery.total : 0,
    hold: grocery ? grocery.hold : 0,
    tripTotal: r2(lines.reduce((s, l) => s + l.total, 0)),
    savings: r2(lines.reduce((s, l) => s + l.discount, 0)),
    creditBack: r2(lines.reduce((s, l) => s + l.creditBack, 0)),
  };
}

export const WHENS = [
  { id: 'same', label: 'Today, Nov 6', sub: 'Within 24 hours of booking' },
  { id: 'early', label: 'Dec 2', sub: '8 days before check-in' },
  { id: 'late', label: 'Dec 9, 6 pm', sub: 'Under 24 hours before check-in' },
  { id: 'mid', label: 'Dec 12', sub: 'Mid-stay, after 2 nights' },
];

// Home refund: published Moderate policy (Help 475). Cleaning fee treatment before check-in is an assumption.
export function stayRefund(when, plan) {
  const s = stayCost();
  if (when === 'same' || when === 'early') {
    if (plan === 'later') return { refund: 0, voided: s.total, kept: 0, rule: 'Cancelled before the pay-later due date, so nothing was charged.', source: 'Published' };
    return { refund: s.total, kept: 0, rule: when === 'same' ? '24-hour free cancellation: booked more than 7 days before check-in.' : 'Moderate: full refund until 5 days before check-in.', source: 'Published' };
  }
  if (when === 'late') {
    const hostNights = 1 + 0.5 * (STAY.nights - 1);
    const kept = r2(hostNights * STAY.nightly);
    return { refund: r2(s.total - kept), kept, rule: 'Moderate, under 5 days: host keeps 1 night plus 50% of remaining nights. Taxes come back in full.', source: 'Published' };
  }
  const stayed = 2;
  const unspent = STAY.nights - stayed - 1;
  const hostNights = stayed + 1 + 0.5 * unspent;
  const lodgingBack = r2((STAY.nights - hostNights) * STAY.nightly);
  // Taxes are pro-rated on the lodging portion for the nights not stayed.
  const taxBack = r2(STAY.nightly * STAY.nights * STAY.taxRate * ((STAY.nights - stayed) / STAY.nights));
  const refund = r2(lodgingBack + taxBack);
  return { refund, kept: r2(s.total - refund), rule: 'Moderate, after check-in: host keeps nights stayed, 1 more night, and 50% of unspent nights. Taxes are pro-rated.', source: 'Published' };
}

// Partner refund rules are PROPOSED for the concept. Partners' actual terms were not in the Airbnb pages reviewed.
export function partnerRefund(line, when) {
  const t = line.total;
  switch (line.id) {
    case 'car':
      if (when === 'same' || when === 'early') return { refund: t, kept: 0, rule: 'Free until 48 hours before pickup.', source: 'Proposed' };
      if (when === 'late') {
        const fee = r2(line.base / CAR_DAYS);
        return { refund: r2(t - fee), kept: fee, rule: 'Inside 48 hours: one rental day is kept.', source: 'Proposed' };
      }
      return { refund: 0, kept: t, rule: 'Rental started: unused days are not refunded.', source: 'Proposed' };
    case 'ride': {
      if (when === 'same' || when === 'early') return { refund: t, kept: 0, rule: 'Free until 24 hours before each ride.', source: 'Proposed' };
      if (line.rides === 1) {
        return line.label.includes('drop-off')
          ? { refund: t, kept: 0, rule: 'Drop-off is more than 24 hours away.', source: 'Proposed' }
          : { refund: 0, kept: t, rule: 'Inside 24 hours of the ride, or already taken.', source: 'Proposed' };
      }
      const half = r2(t / 2);
      return { refund: half, kept: r2(t - half), rule: 'Arrival ride is inside 24 hours or taken. Drop-off is still free to cancel.', source: 'Proposed' };
    }
    case 'grocery':
      if (when === 'mid') return { refund: 0, kept: t, rule: 'Already delivered. Item issues go through a dispute.', source: 'Proposed' };
      return { refund: 0, voided: t, kept: 0, rule: 'Charged on delivery, so the hold is released.', source: 'Proposed' };
    case 'luggage':
      return { refund: t, kept: 0, rule: 'Free until bags are dropped off.', source: 'Proposed' };
    default:
      return { refund: 0, kept: t, rule: '', source: 'Proposed' };
  }
}

export function cancelQuote(lines, selected, when, plan, creditUsed = 0) {
  const rows = lines
    .filter((l) => selected.includes(l.id))
    .map((l) => ({ line: l, ...(l.id === 'stay' ? stayRefund(when, plan) : partnerRefund(l, when)) }));
  const refund = r2(rows.reduce((s, r) => s + r.refund, 0));
  const kept = r2(rows.reduce((s, r) => s + r.kept, 0));
  const voided = r2(rows.reduce((s, r) => s + (r.voided ?? 0), 0));
  const toCredit = Math.min(creditUsed, refund);
  return { rows, refund, kept, voided, toCredit, toCard: r2(refund - toCredit) };
}

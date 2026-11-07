import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLines, schedule, stayCost, stayRefund, partnerRefund, cancelQuote, groceryCost, DEFAULT_CART } from '../src/lib/pricing.js';

test('stay total is lodging + cleaning + 15% sample tax', () => {
  assert.deepEqual(stayCost(), { lodging: 756, cleaning: 95, taxes: 127.65, total: 978.65 });
});

test('grocery offer only triggers at $50', () => {
  assert.equal(groceryCost({ items: { coffee: 1 } }).discount, 0);
  assert.equal(groceryCost({ items: { fruit: 4 } }).discount, 10);
});

test('car credit is 20% of base subtotal only, capped at $200', () => {
  const car = buildLines({ car: { carId: 'suv', protection: true } }).find((l) => l.id === 'car');
  assert.equal(car.creditBack, 53.6);
});

test('ride discount excludes taxes', () => {
  const ride = buildLines({ ride: { arrival: true, departure: true } }).find((l) => l.id === 'ride');
  assert.equal(ride.discount, 24.8);
  assert.equal(ride.total, 107.2);
});

test('pay later moves the stay off today but groceries stay on delivery', () => {
  const lines = buildLines(DEFAULT_CART);
  const full = schedule(lines, 'full');
  const later = schedule(lines, 'later');
  assert.equal(later.later, 978.65);
  assert.equal(Math.round((full.today - later.today) * 100), 97865);
  assert.equal(full.onDelivery, later.onDelivery);
  assert.equal(full.tripTotal, later.tripTotal);
});

test('credit cannot exceed what is due today', () => {
  const lines = buildLines({ luggage: { bags: 1 } });
  const s = schedule(lines, 'later', 75);
  assert.equal(s.creditUsed, 6.8);
  assert.equal(s.today, 0);
});

test('moderate: full refund early, void when pay later not yet charged', () => {
  assert.equal(stayRefund('early', 'full').refund, 978.65);
  const v = stayRefund('early', 'later');
  assert.equal(v.refund, 0);
  assert.equal(v.voided, 978.65);
});

test('moderate late: host keeps 2.5 nights', () => {
  const r = stayRefund('late', 'full');
  assert.equal(r.kept, 472.5);
  assert.equal(r.refund, 506.15);
});

test('moderate mid-stay: refund + kept = total', () => {
  const r = stayRefund('mid', 'full');
  assert.equal(Math.round((r.refund + r.kept) * 100), 97865);
  assert.equal(r.refund, 94.5 + 56.7);
});

test('refund + kept + voided equals each line total at all times', () => {
  const lines = buildLines(DEFAULT_CART);
  for (const w of ['same', 'early', 'late', 'mid']) {
    for (const l of lines.filter((x) => x.id !== 'stay')) {
      const r = partnerRefund(l, w);
      assert.equal(Math.round((r.refund + r.kept + (r.voided ?? 0)) * 100), Math.round(l.total * 100), `${l.id} ${w}`);
    }
  }
});

test('refund returns credit first', () => {
  const lines = buildLines(DEFAULT_CART);
  const q = cancelQuote(lines, ['stay'], 'early', 'full', 75);
  assert.equal(q.toCredit, 75);
  assert.equal(q.toCard, 903.65);
});

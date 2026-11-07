# Embedded Trip Checkout (concept)

**Live demo:** LIVE_URL

An interactive product concept: what if a guest could book a stay, rental car, airport ride, groceries and luggage storage in one Airbnb checkout, without ever leaving for a partner's site or app?

> Independent concept for product discussion. Not affiliated with or endorsed by Airbnb or any partner named. It makes no real bookings, takes no payments, and never asks for card details.

## The four steps

1. **Today.** What a US guest can book now, with clickable flows. Homes, boutique hotels, Experiences and Services are paid on Airbnb. Car rentals, groceries, airport pickups and luggage storage are shown on Airbnb, but the partner runs checkout and is merchant of record.
2. **Embedded checkout.** One cart, one payment method, one receipt. Offers and Airbnb Credit work across every item, and a live panel shows where the money goes. You can simulate a car selling out mid-payment.
3. **Industry patterns.** Six ways platforms sell other companies' services, who owns each stage of the journey, lessons from what stalled, and a recommendation per service.
4. **After booking.** A cancellation simulator with item-level refunds, seven disruption and dispute scenarios, a chargeback simulator with a liability ledger, and a table of who owns what.

## The key finding

Airbnb launched partner services in 2026, so the gap isn't what guests can buy. It's that each partner purchase is a separate transaction: its own checkout, charge, terms and support, and Airbnb Credit can't be used. One more thing matters for strategy: Expedia, a direct competitor, completed its purchase of CarTrawler, Airbnb's car rental partner.

## What's real vs. assumed

Public facts were checked on Nov 6, 2026. The same tables, with links, are in the app under **Real vs. assumed**.

| Item | Status | Basis |
| --- | --- | --- |
| Partner names; Airbnb is not merchant of record for them | Real | [Help 4271](https://www.airbnb.com/help/article/4271) |
| Airbnb Credit can't pay for third-party services | Real | [Help 4271](https://www.airbnb.com/help/article/4271) |
| Partner offers (20% rides, 15% storage, $0 delivery and $10 off $50+, 20% car credit capped at $200) | Real | [Help 4271](https://www.airbnb.com/help/article/4271) |
| "Continue to book on CarTrawler"; cancelling a stay doesn't cancel the car | Real | [Help 4194](https://www.airbnb.com/help/article/4194) |
| Moderate cancellation rules and the 24-hour rule | Real | [Help 475](https://www.airbnb.com/help/article/475) |
| Service and experience windows (24 or 72 hours) | Real | [Help 1593](https://www.airbnb.com/help/article/1593) |
| 72-hour issue reporting | Real | [Help 2868](https://www.airbnb.com/help/article/2868), [Help 2278](https://www.airbnb.com/help/article/2278) |
| Refund timing (24 hours for credit, up to 15 business days for cards) | Real | [Help 1967](https://www.airbnb.com/help/article/1967) |
| Expedia owns CarTrawler | Real | [Expedia Group](https://partner.expediagroup.com/en-us/resources/blog/expedia-group-completes-cartrawler-acquisition) |
| About 120 days to dispute, about 30 to respond | Indicative | [Vendor guide](https://chargebacks911.com/visa-chargeback-time-limit/); varies by network and reason |
| 15.5% host fee | Third-party | [Hostfully](https://www.hostfully.com/blog/airbnb-host-fees/) |
| Listing, host, dates, all prices, 15% tax rate | Sample | Invented for the demo |
| Welcome Pickups and Bounce in Nashville | Assumed | US coverage isn't published |
| Airbnb as merchant of record for partner items | Proposed | The core idea, not how it works today |
| Partner cancellation windows | Proposed | Partner terms weren't in the pages reviewed |
| 15% grocery hold, liability split, make-good limits | Proposed | To test with partners, legal and finance |
| Cleaning fee refunded before check-in | Assumed | The policy page doesn't address it directly |
| Stage ownership in Step 3 | Our read | Unknown stages are marked "Not public" |

Partner commission rates aren't public, so the prototype doesn't show any. Becoming merchant of record would need legal and tax review, including seller-of-travel rules, sales tax on goods, and insurance sold with a car.

## Run it

```bash
npm install
npm run dev
```

```bash
npm test
```

The tests cover trip pricing, offers, the charge schedule and refund math in `src/lib/pricing.js`.

Built with Vite and React. Illustrations are original; no third-party logos or photos are used.

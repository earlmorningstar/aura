// import Stripe from 'stripe';

// export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2025-04-01.preview',
// });


/**
 * lib/stripe.ts — Stripe SDK singleton.
 *
 * Fix: changed from preview API version to the latest stable version.
 * Preview versions receive breaking changes without notice and are
 * unsuitable for production.
 */

import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia", // Latest stable — update when new stable releases
  typescript: true,
});
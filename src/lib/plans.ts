export const PLANS = {
    [process.env.STRIPE_STARTER_PRICE_ID!]: "starter",
    [process.env.STRIPE_PRO_PRICE_ID!]: "pro",
} as Record<string, string>;
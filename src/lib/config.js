/**
 * Centralized configuration for the SaaS template.
 * All environment variables are validated and exported from here.
 */

const config = {
  appName: "Kalium",
  tagline: "Type words. Get art.",
  auth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    secret: process.env.NEXTAUTH_SECRET,
    url: process.env.NEXTAUTH_URL || "http://localhost:3000",
    webhook_url: process.env.WEBHOOK_URL || process.env.NEXTAUTH_URL || "http://localhost:3000",
  },
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    // Must stay in sync with PLANS in src/app/pricing/page.js
    plans: {
      basic: { name: "Basic Pack", credits: 100, price: 500, currency: "usd" },
      standard: { name: "Standard Pack", credits: 250, price: 1000, currency: "usd" },
      pro: { name: "Professional Pack", credits: 600, price: 2000, currency: "usd" },
      business: { name: "Business Pack", credits: 2000, price: 5000, currency: "usd" },
    }
  },
  ai: {
    fal: {
      apiKey: process.env.FAL_KEY,
      // Swap for "fal-ai/nano-banana-pro" or "fal-ai/nano-banana" as needed.
      model: process.env.FAL_MODEL || "fal-ai/nano-banana-2",
    }
  },
  db: {
    url: process.env.DATABASE_URL,
  }
};

// Simple validation to warn if critical keys are missing
const requiredKeys = [
  ["GOOGLE_CLIENT_ID", config.auth.google.clientId],
  ["GOOGLE_CLIENT_SECRET", config.auth.google.clientSecret],
  ["STRIPE_SECRET_KEY", config.stripe.secretKey],
  ["DATABASE_URL", config.db.url],
  ["FAL_KEY", config.ai.fal.apiKey],
];

if (typeof window === "undefined") {
  requiredKeys.forEach(([name, value]) => {
    if (!value) {
      console.warn(`[CONFIG] Warning: Missing critical environment variable: ${name}`);
    }
  });
}

export default config;

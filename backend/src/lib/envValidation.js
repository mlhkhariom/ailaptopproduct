// ══════════════════════════════════════════════════════════
// ENV VALIDATION — Checks required env vars on startup
// ══════════════════════════════════════════════════════════

const REQUIRED = {
  DATABASE_URL: { fallback: 'postgresql://localhost:5432/ailaptopwala', critical: true },
  JWT_SECRET: { fallback: 'ailaptopwala-secret-2024', critical: true },
};

const OPTIONAL = {
  PORT: '5000',
  FRONTEND_URL: 'https://ailaptopwala.com',
  BACKEND_URL: 'https://ailaptopwala.com',
  OWNER_PHONE: '9893496163',
  SMTP_HOST: '',
  SMTP_PORT: '587',
  SMTP_USER: '',
  SMTP_PASS: '',
  NODE_ENV: 'production',
};

export function validateEnv() {
  const warnings = [];
  const errors = [];

  for (const [key, config] of Object.entries(REQUIRED)) {
    if (!process.env[key]) {
      if (config.fallback) {
        process.env[key] = config.fallback;
        warnings.push(`${key} not set — using fallback`);
      } else {
        errors.push(`${key} is REQUIRED but not set`);
      }
    }
  }

  for (const [key, fallback] of Object.entries(OPTIONAL)) {
    if (!process.env[key] && fallback) {
      process.env[key] = fallback;
    }
  }

  if (warnings.length) console.log(`⚠️ Env warnings: ${warnings.join(', ')}`);
  if (errors.length) {
    console.error(`❌ Env errors: ${errors.join(', ')}`);
    if (process.env.NODE_ENV === 'production') process.exit(1);
  }

  return { warnings, errors };
}

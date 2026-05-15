// ── Input validation helpers ──────────────────────────────
// Lightweight validation without external deps (no joi/zod needed)

export function validateRequired(obj, fields) {
  const missing = fields.filter(f => !obj[f] && obj[f] !== 0);
  if (missing.length > 0) return { valid: false, error: `Missing required fields: ${missing.join(', ')}` };
  return { valid: true };
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone) {
  const clean = phone?.replace(/[^0-9]/g, '') || '';
  return clean.length === 10 || clean.length === 12;
}

export function sanitizeString(str, maxLength = 500) {
  if (!str) return '';
  return String(str).trim().slice(0, maxLength).replace(/<[^>]*>/g, '');
}

export function validatePrice(price) {
  const n = Number(price);
  return !isNaN(n) && n >= 0 && n <= 10000000;
}

export function validatePagination(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

import crypto from 'crypto';

export const uuid = () => crypto.randomUUID();
export const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
export const formatINR = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const isValidPhone = (phone) => /^[6-9]\d{9}$/.test((phone || '').replace(/\D/g, '').slice(-10));
export const paginate = (page = 1, limit = 20) => ({ offset: (Math.max(1, page) - 1) * limit, limit: Math.min(100, limit) });
export const sanitize = (str) => (str || '').replace(/[<>]/g, '');
export const hashPassword = async (password) => { const { default: bcrypt } = await import('bcryptjs'); return bcrypt.hash(password, 10); };
export const comparePassword = async (password, hash) => { const { default: bcrypt } = await import('bcryptjs'); return bcrypt.compare(password, hash); };

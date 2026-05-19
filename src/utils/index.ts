// Utility functions
export const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
export const truncate = (str: string, len: number) => str.length > len ? str.slice(0, len) + '...' : str;
export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
export const debounce = <T extends (...args: any[]) => any>(fn: T, ms: number) => { let t: any; return (...args: Parameters<T>) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); }; };
export const generateId = () => crypto.randomUUID();
export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const isValidPhone = (phone: string) => /^[6-9]\d{9}$/.test(phone.replace(/\D/g, '').slice(-10));
export const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
export const timeAgo = (date: string | Date) => {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

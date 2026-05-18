// Safe localStorage wrapper — handles private browsing, quota exceeded, etc.

export const storage = {
  get(key: string, fallback: any = null) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set(key: string, value: any) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch { /* quota exceeded or private browsing */ }
  },
  remove(key: string) {
    try { localStorage.removeItem(key); } catch {}
  },
  getString(key: string, fallback = '') {
    try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
  },
  setString(key: string, value: string) {
    try { localStorage.setItem(key, value); } catch {}
  },
};

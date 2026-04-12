// Central API client — all backend calls go through here
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('apsoncure_token');

const req = async (method: string, path: string, body?: unknown) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

export const api = {
  // Payment
  getShipping: (subtotal: number) => req('GET', `/payment/shipping?subtotal=${subtotal}`),
  getPaymentMethods: () => req('GET', '/payment/methods'),
  createRazorpayOrder: (amount: number) => req('POST', '/payment/razorpay/create-order', { amount }),
  verifyRazorpay: (data: unknown) => req('POST', '/payment/razorpay/verify', data),

  // Site Settings
  getSiteSettings: () => req('GET', '/site-settings'),
  updateSiteSettings: (data: unknown) => req('PUT', '/site-settings', data),
  getAppSettings: (category?: string) => req('GET', '/app-settings' + (category ? `?category=${category}` : '')),
  updateAppSettings: (data: unknown) => req('PUT', '/app-settings', data),

  // Auth
  login: (email: string, password: string) => req('POST', '/auth/login', { email, password }),
  register: (name: string, email: string, password: string, phone?: string) => req('POST', '/auth/register', { name, email, password, phone }),
  me: () => req('GET', '/auth/me'),
  updateProfile: (data: unknown) => req('PUT', '/auth/me', data),
  changePassword: (currentPassword: string, newPassword: string) => req('PUT', '/auth/change-password', { currentPassword, newPassword }),

  // Products
  getProducts: (params?: Record<string, string>) => req('GET', '/products' + (params ? '?' + new URLSearchParams(params) : '')),
  getProduct: (slug: string) => req('GET', `/products/${slug}`),
  createProduct: (data: unknown) => req('POST', '/products', data),
  updateProduct: (id: string, data: unknown) => req('PUT', `/products/${id}`, data),
  deleteProduct: (id: string) => req('DELETE', `/products/${id}`),

  // Orders
  placeOrder: (data: unknown) => req('POST', '/orders', data),
  myOrders: () => req('GET', '/orders/my'),
  trackOrder: (orderNumber: string) => req('GET', `/orders/track/${orderNumber}`),
  getOrders: (params?: Record<string, string>) => req('GET', '/orders' + (params ? '?' + new URLSearchParams(params) : '')),
  updateOrderStatus: (id: string, data: unknown) => req('PUT', `/orders/${id}/status`, data),

  // Coupons
  validateCoupon: (code: string, subtotal: number) => req('POST', '/coupons/validate', { code, subtotal }),
  getCoupons: () => req('GET', '/coupons'),
  createCoupon: (data: unknown) => req('POST', '/coupons', data),
  updateCoupon: (id: string, data: unknown) => req('PUT', `/coupons/${id}`, data),
  deleteCoupon: (id: string) => req('DELETE', `/coupons/${id}`),

  // CMS
  getCMS: (section: string) => req('GET', `/cms/${section}`),
  createCMS: (data: unknown) => req('POST', '/cms', data),
  updateCMS: (id: string, data: unknown) => req('PUT', `/cms/${id}`, data),
  deleteCMS: (id: string) => req('DELETE', `/cms/${id}`),

  // Blog
  getPosts: (params?: Record<string, string>) => req('GET', '/blog' + (params ? '?' + new URLSearchParams(params) : '')),
  getPost: (slug: string) => req('GET', `/blog/${slug}`),
  createPost: (data: unknown) => req('POST', '/blog', data),
  updatePost: (id: string, data: unknown) => req('PUT', `/blog/${id}`, data),
  deletePost: (id: string) => req('DELETE', `/blog/${id}`),

  // Contacts
  submitContact: (data: unknown) => req('POST', '/contacts', data),
  getContacts: (params?: Record<string, string>) => req('GET', '/contacts' + (params ? '?' + new URLSearchParams(params) : '')),
  updateContact: (id: string, data: unknown) => req('PUT', `/contacts/${id}`, data),

  // WhatsApp
  waStatus: () => req('GET', '/whatsapp/status'),
  waConnect: () => req('POST', '/whatsapp/connect'),
  waDisconnect: () => req('POST', '/whatsapp/disconnect'),
  waSend: (phone: string, message: string) => req('POST', '/whatsapp/send', { phone, message }),
  waChats: () => req('GET', '/whatsapp/chats'),
  waMessages: (phone: string) => req('GET', `/whatsapp/messages/${phone}`),
  waMarkRead: (phone: string) => req('PUT', `/whatsapp/messages/${phone}/read`),
  waRules: () => req('GET', '/whatsapp/rules'),
  waCreateRule: (data: unknown) => req('POST', '/whatsapp/rules', data),
  waUpdateRule: (id: string, data: unknown) => req('PUT', `/whatsapp/rules/${id}`, data),
  waDeleteRule: (id: string) => req('DELETE', `/whatsapp/rules/${id}`),
  waSimulate: (message: string) => req('POST', '/whatsapp/simulate', { message }),
  waAnalytics: () => req('GET', '/whatsapp/analytics'),

  // Media Library
  getMedia: (params?: Record<string, string>) => req('GET', '/media' + (params ? '?' + new URLSearchParams(params) : '')),
  getMediaStats: () => req('GET', '/media/stats'),
  updateMedia: (id: string, data: unknown) => req('PUT', `/media/${id}`, data),
  deleteMedia: (id: string) => req('DELETE', `/media/${id}`),
  uploadMedia: async (files: FileList, folder = 'general') => {
    const formData = new FormData();
    Array.from(files).forEach(f => formData.append('files', f));
    formData.append('folder', folder);
    const res = await fetch(`${BASE}/media/upload`, {
      method: 'POST',
      headers: { ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
  },

  // Categories
  getCategories: () => req('GET', '/categories'),
  createCategory: (data: unknown) => req('POST', '/categories', data),
  updateCategory: (id: string, data: unknown) => req('PUT', `/categories/${id}`, data),
  deleteCategory: (id: string) => req('DELETE', `/categories/${id}`),

  // Social Media
  getSocialSettings: () => req('GET', '/social/settings'),
  saveSocialSettings: (data: unknown) => req('PUT', '/social/settings', data),
  verifySocialSettings: () => req('POST', '/social/settings/verify'),
  getSocialPosts: (params?: Record<string, string>) => req('GET', '/social/posts' + (params ? '?' + new URLSearchParams(params) : '')),
  createSocialPost: (data: unknown) => req('POST', '/social/posts', data),
  updateSocialPost: (id: string, data: unknown) => req('PUT', `/social/posts/${id}`, data),
  deleteSocialPost: (id: string) => req('DELETE', `/social/posts/${id}`),
  publishPost: (id: string) => req('POST', `/social/publish/${id}`),
  publishBoth: (id: string) => req('POST', `/social/publish-both/${id}`),
  getSocialStats: () => req('GET', '/social/stats'),
  uploadVideo: async (file: File) => {
    const formData = new FormData();
    formData.append('video', file);
    const res = await fetch(`${BASE}/social/upload`, {
      method: 'POST',
      headers: { ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
  },

  // Reels
  getReels: (params?: Record<string, string>) => req('GET', '/reels' + (params ? '?' + new URLSearchParams(params) : '')),
  createReel: (data: unknown) => req('POST', '/reels', data),
  updateReel: (id: string, data: unknown) => req('PUT', `/reels/${id}`, data),
  deleteReel: (id: string) => req('DELETE', `/reels/${id}`),
  fetchInstagramReel: (url: string) => req('POST', '/reels/instagram', { url }),

  // Customers
  getCustomers: () => req('GET', '/customers'),
  updateCustomer: (id: string, data: unknown) => req('PUT', `/customers/${id}`, data),

  // Notifications
  getNotifications: () => req('GET', '/notifications'),
  markRead: (id: string) => req('PUT', `/notifications/${id}/read`),
  markAllRead: () => req('PUT', '/notifications/read-all'),

  // Reports
  dashboard: () => req('GET', '/reports/dashboard'),
  salesReport: (period = '30d') => req('GET', `/reports/sales?period=${period}`),
  productsReport: () => req('GET', '/reports/products'),
  customersReport: () => req('GET', '/reports/customers'),
  salesReport: (period = '30d') => req('GET', `/reports/sales?period=${period}`),
  productsReport: () => req('GET', '/reports/products'),
  customersReport: () => req('GET', '/reports/customers'),
};

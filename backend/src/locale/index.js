// Locale configuration for invoices, PDFs, notifications
export const LOCALE = {
  currency: 'INR',
  currencySymbol: '₹',
  locale: 'en-IN',
  dateFormat: 'DD/MM/YYYY',
  country: 'India',
  state: 'Madhya Pradesh',
  gstPrefix: '23', // MP state code
};

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

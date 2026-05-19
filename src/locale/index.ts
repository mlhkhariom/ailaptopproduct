// Locale/i18n support (ready for multi-language)
export const LOCALE = {
  currency: 'INR',
  currencySymbol: '₹',
  locale: 'en-IN',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: 'hh:mm A',
};

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export const formatDateTime = (date: string | Date) =>
  new Date(date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

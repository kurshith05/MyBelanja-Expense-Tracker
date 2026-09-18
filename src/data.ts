import { Category } from './types';

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: '#7C3AED',
  Transportation: '#3B82F6',
  Bills: '#EF4444',
  Shopping: '#F59E0B',
  Education: '#10B981',
  Entertainment: '#EC4899',
  Health: '#06B6D4',
  Other: '#6B7280',
};

export const CATEGORY_ICONS: Record<Category, string> = {
  Food: '🍽️',
  Transportation: '🚗',
  Bills: '📋',
  Shopping: '🛍️',
  Education: '📚',
  Entertainment: '🎬',
  Health: '❤️',
  Other: '📦',
};

export const CATEGORIES: Category[] = [
  'Food', 'Transportation', 'Bills', 'Shopping',
  'Education', 'Entertainment', 'Health', 'Other',
];

export const PAYMENT_METHODS = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Digital Wallet'] as const;

// ---------- Currency ----------
// MYR is the app default. Add new currencies here and they show up in Settings.
export const DEFAULT_CURRENCY = 'MYR';

export const CURRENCIES: { code: string; label: string; symbol: string; locale: string }[] = [
  { code: 'MYR', label: 'Malaysian Ringgit (RM)', symbol: 'RM', locale: 'en-MY' },
  { code: 'SGD', label: 'Singapore Dollar (S$)', symbol: 'S$', locale: 'en-SG' },
  { code: 'USD', label: 'US Dollar ($)', symbol: '$', locale: 'en-US' },
  { code: 'EUR', label: 'Euro (€)', symbol: '€', locale: 'en-IE' },
  { code: 'GBP', label: 'British Pound (£)', symbol: '£', locale: 'en-GB' },
  { code: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥', locale: 'ja-JP' },
  { code: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$', locale: 'en-AU' },
  { code: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$', locale: 'en-CA' },
  { code: 'INR', label: 'Indian Rupee (₹)', symbol: '₹', locale: 'en-IN' },
];

export function currencyMeta(code: string) {
  return CURRENCIES.find(c => c.code === code) ?? { code, label: code, symbol: code, locale: 'en-US' };
}

export function currencySymbol(code: string) {
  return currencyMeta(code).symbol;
}
export function currencyInputPadding(code: string, leftRem = 0.75) {
  const sym = currencySymbol(code);
  return `${(leftRem + sym.length * 0.62 + 0.4).toFixed(2)}rem`;
}
/** Format an amount in the given currency. `decimals: false` drops the cents. */
export function formatCurrency(amount: number, code: string, decimals = true) {
  const { locale } = currencyMeta(code);
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      ...(decimals ? {} : { maximumFractionDigits: 0 }),
    }).format(amount || 0);
  } catch {
    return `${currencySymbol(code)}${(amount || 0).toFixed(decimals ? 2 : 0)}`;
  }
}

/** Compact axis label, e.g. RM1.2k */
export function formatCompact(amount: number, code: string) {
  const s = currencySymbol(code);
  return amount >= 1000 ? `${s}${(amount / 1000).toFixed(1)}k` : `${s}${Math.round(amount)}`;
}

import type { CurrencyCode } from '../../types/entities';

const LOCALE_BY_CURRENCY: Record<CurrencyCode, string> = {
  EGP: 'en-EG',
  USD: 'en-US',
  EUR: 'de-DE',
};

export function formatCurrency(amount: number, currency: CurrencyCode = 'EGP'): string {
  try {
    return new Intl.NumberFormat(LOCALE_BY_CURRENCY[currency], {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export function formatCompactCurrency(amount: number, currency: CurrencyCode = 'EGP'): string {
  if (Math.abs(amount) < 1000) return formatCurrency(amount, currency);
  try {
    return new Intl.NumberFormat(LOCALE_BY_CURRENCY[currency], {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  } catch {
    return formatCurrency(amount, currency);
  }
}

export function formatPercentage(value: number, fractionDigits = 0): string {
  return `${value.toFixed(fractionDigits)}%`;
}

export function formatSignedCurrency(amount: number, currency: CurrencyCode = 'EGP'): string {
  const formatted = formatCurrency(Math.abs(amount), currency);
  return amount < 0 ? `-${formatted}` : `+${formatted}`;
}

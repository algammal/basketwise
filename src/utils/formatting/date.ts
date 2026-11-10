export function formatReceiptDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatMonthLabel(isoMonth: string): string {
  const [year, month] = isoMonth.split('-').map(Number);
  const date = new Date(year, (month ?? 1) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function currentMonthIso(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function daysSince(isoDate: string, now: Date = new Date()): number {
  return Math.floor((now.getTime() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24));
}

import { format } from 'date-fns';

export function formatDate(date: Date): string {
  return format(date, 'd. MMMM yyyy.');
}

export function formatDateShort(date: Date): string {
  return format(date, 'd.MM.yyyy.');
}

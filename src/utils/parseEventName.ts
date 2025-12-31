import type { GalleryEventType, EventCategory } from '../types/gallery';

export interface ParsedEvent {
  title: string;
  date?: string;
  dateRange?: string;
  month?: number;
  eventType: GalleryEventType;
  category: EventCategory;
}

// Regex patterns for date extraction
const DATE_PATTERN = /(\d{1,2})\.(\d{1,2})\.(\d{4})/; // 06.04.2007
const DATE_RANGE_PATTERN = /(\d{1,2})-(\d{1,2})\.(\d{1,2})\.(\d{4})/; // 13-14.09.2008

// Month names mapping (Serbian)
const MONTH_NAMES: { [key: string]: number } = {
  'januar': 1, 'januara': 1,
  'februar': 2, 'februara': 2,
  'mart': 3, 'marta': 3,
  'april': 4, 'aprila': 4,
  'maj': 5, 'maja': 5,
  'jun': 6, 'juna': 6,
  'jul': 7, 'jula': 7,
  'avgust': 8, 'avgusta': 8,
  'septembar': 9, 'septembra': 9,
  'oktobar': 10, 'oktobra': 10,
  'novembar': 11, 'novembra': 11,
  'decembar': 12, 'decembra': 12,
  'secanj': 1, // Alternative spelling
};

/**
 * Detect event type from folder name
 */
function detectEventType(folderName: string): GalleryEventType {
  const lower = folderName.toLowerCase();

  if (lower.includes('turnir')) return 'turnir';
  if (lower.includes('utakmica')) return 'utakmica';
  if (lower.includes('trening')) return 'trening';
  if (lower.includes('kamp')) return 'kamp';
  if (lower.includes('promocija')) return 'promocija';
  if (lower.includes('slava')) return 'slava';

  return 'mixed';
}

/**
 * Detect category (muški, ženski, opšte) from folder name
 */
function detectCategory(folderName: string): EventCategory {
  const lower = folderName.toLowerCase();

  // Ženski keywords
  const zenskiKeywords = [
    'žkk', 'zkk', 'devojčice', 'devojcice', 'seniorke',
    'kadetkinje', 'pionirke', 'zenski', 'ženski'
  ];

  // Muški keywords
  const muskiKeywords = [
    'kkk', 'kk ', 'juniori', 'pioniri', 'seniori',
    'kadeti', 'muski', 'muški'
  ];

  for (const keyword of zenskiKeywords) {
    if (lower.includes(keyword)) return 'ženski';
  }

  for (const keyword of muskiKeywords) {
    if (lower.includes(keyword)) return 'muški';
  }

  return 'opšte';
}

/**
 * Extract month from date string or month name
 */
function extractMonth(text: string): number | undefined {
  // Try to find month number from date pattern
  const dateMatch = text.match(DATE_PATTERN);
  if (dateMatch) {
    return parseInt(dateMatch[2], 10);
  }

  const dateRangeMatch = text.match(DATE_RANGE_PATTERN);
  if (dateRangeMatch) {
    return parseInt(dateRangeMatch[3], 10);
  }

  // Try to find month name in text
  const lower = text.toLowerCase();
  for (const [monthName, monthNumber] of Object.entries(MONTH_NAMES)) {
    if (lower.includes(monthName)) {
      return monthNumber;
    }
  }

  return undefined;
}

/**
 * Clean title by removing dates and extra whitespace
 */
function cleanTitle(text: string): string {
  let cleaned = text;

  // Remove date patterns
  cleaned = cleaned.replace(DATE_RANGE_PATTERN, '');
  cleaned = cleaned.replace(DATE_PATTERN, '');

  // Remove common separators and extra whitespace
  cleaned = cleaned.replace(/,\s*$/, ''); // Trailing comma
  cleaned = cleaned.replace(/\s*,\s*$/, ''); // Trailing comma with spaces
  cleaned = cleaned.replace(/\s{2,}/g, ' '); // Multiple spaces
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Parse event name to extract metadata
 *
 * Examples:
 * - "Uskrsnji turnir - Secanj, 06.04.2007"
 * - "Turnir ''Nikola i Branka'',13-14.09.2008"
 * - "KK Karadjordjevo - Reprezentacija Saudijske Arabije, 04.07.2011"
 * - "Memorijalni turnir - Nikola i Branka, 2011"
 * - "Sve selekcije, 2010"
 */
export function parseEventName(folderName: string, year: number): ParsedEvent {
  let title = folderName;
  let date: string | undefined;
  let dateRange: string | undefined;
  let month: number | undefined;

  // Check for date range pattern (e.g., "13-14.09.2008")
  const dateRangeMatch = folderName.match(DATE_RANGE_PATTERN);
  if (dateRangeMatch) {
    dateRange = dateRangeMatch[0];
    month = parseInt(dateRangeMatch[3], 10);
  } else {
    // Check for single date pattern (e.g., "06.04.2007")
    const dateMatch = folderName.match(DATE_PATTERN);
    if (dateMatch) {
      date = dateMatch[0];
      month = parseInt(dateMatch[2], 10);
    }
  }

  // If no date found in pattern, try to extract month from name
  if (!month) {
    month = extractMonth(folderName);
  }

  // Clean title
  title = cleanTitle(title);

  // Detect event type and category
  const eventType = detectEventType(folderName);
  const category = detectCategory(folderName);

  return {
    title,
    date,
    dateRange,
    month,
    eventType,
    category,
  };
}

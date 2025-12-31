import type { GalleryEvent } from '../types/gallery';
import { parse, differenceInDays } from 'date-fns';

export interface MatchResult {
  galleryEvent: GalleryEvent;
  score: number;
  reasons: string[];
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,    // deletion
          dp[i][j - 1] + 1,    // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Calculate string similarity (0-1) based on Levenshtein distance
 */
function stringSimilarity(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  const maxLength = Math.max(str1.length, str2.length);
  return maxLength === 0 ? 1 : 1 - distance / maxLength;
}

/**
 * Normalize title for comparison
 */
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\wšđčćžа-я]/gi, ' ') // Keep letters (including Serbian)
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract keywords from title (tournament names, opponents, etc.)
 */
function extractKeywords(title: string): string[] {
  const normalized = normalizeTitle(title);
  const commonWords = new Set([
    'i', 'u', 'na', 'sa', 'od', 'do', 'za', 'po', 'kk', 'košarkaški', 'klub',
    'protiv', 'turnir', 'memorijalni', 'utakmica', 'trening', 'kamp',
    'seniorke', 'seniori', 'juniori', 'juniorke', 'kadeti', 'kadetkinje'
  ]);

  return normalized
    .split(' ')
    .filter(word => word.length > 2 && !commonWords.has(word));
}

/**
 * Parse date from various formats
 */
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  // Try ISO format (YYYY-MM-DD)
  const isoMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return new Date(dateStr);
  }

  // Try DD.MM.YYYY format
  const ddmmyyyyMatch = dateStr.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  // Try DD-MM.YYYY format (range)
  const rangeMatch = dateStr.match(/(\d{1,2})-(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (rangeMatch) {
    const [, , endDay, month, year] = rangeMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(endDay));
  }

  return null;
}

/**
 * Calculate date difference in days
 */
function dateDifferenceInDays(date1Str: string, date2Str: string): number {
  const date1 = parseDate(date1Str);
  const date2 = parseDate(date2Str);

  if (!date1 || !date2) return Infinity;

  return Math.abs(differenceInDays(date1, date2));
}

/**
 * Match content (news or tournament) to gallery events with fuzzy matching
 */
export function matchContentToGallery(
  contentTitle: string,
  contentDate: string | undefined,
  galleryEvents: GalleryEvent[]
): MatchResult[] {
  const results: MatchResult[] = [];

  for (const event of galleryEvents) {
    let score = 0;
    const reasons: string[] = [];

    // 1. Date proximity scoring (40 points max)
    if (contentDate && (event.date || event.dateRange)) {
      const eventDateStr = event.dateRange || event.date || '';
      const daysDiff = dateDifferenceInDays(contentDate, eventDateStr);

      if (daysDiff === 0) {
        score += 40;
        reasons.push('Tačno poklapanje datuma');
      } else if (daysDiff <= 7) {
        const dateScore = Math.max(0, 40 - daysDiff * 5);
        score += dateScore;
        reasons.push(`Datum u razlici od ${daysDiff} dana`);
      }
    }

    // 2. Title similarity scoring (40 points max)
    const normalizedContentTitle = normalizeTitle(contentTitle);
    const normalizedEventTitle = normalizeTitle(event.title);
    const titleSimilarity = stringSimilarity(normalizedContentTitle, normalizedEventTitle);

    const titleScore = titleSimilarity * 40;
    score += titleScore;

    if (titleSimilarity > 0.3) {
      reasons.push(`Sličnost naslova: ${(titleSimilarity * 100).toFixed(0)}%`);
    }

    // 3. Keyword matching (20 points max)
    const contentKeywords = extractKeywords(contentTitle);
    const eventKeywords = extractKeywords(event.title);

    const matchedKeywords = contentKeywords.filter(kw =>
      eventKeywords.some(ekw => ekw.includes(kw) || kw.includes(ekw))
    );

    if (contentKeywords.length > 0) {
      const keywordScore = (matchedKeywords.length / contentKeywords.length) * 20;
      score += keywordScore;

      if (matchedKeywords.length > 0) {
        reasons.push(`Ključne reči: ${matchedKeywords.join(', ')}`);
      }
    }

    // Only include results with score above threshold
    if (score > 20) {
      results.push({
        galleryEvent: event,
        score,
        reasons
      });
    }
  }

  // Sort by score (highest first)
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Get top N matches
 */
export function getTopMatches(
  contentTitle: string,
  contentDate: string | undefined,
  galleryEvents: GalleryEvent[],
  topN: number = 3
): MatchResult[] {
  const matches = matchContentToGallery(contentTitle, contentDate, galleryEvents);
  return matches.slice(0, topN);
}

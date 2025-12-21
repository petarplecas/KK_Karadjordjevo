import { truncateText } from './truncateText';

/**
 * Extracts excerpt from content blocks
 * @param content Array of content blocks
 * @param maxLength Maximum length of excerpt (default: 150)
 * @returns Excerpt text
 */
export function getExcerpt(content: any[], maxLength: number = 150): string {
  const firstText = content.find(item => item.type === 'text');
  return firstText ? truncateText(firstText.value, maxLength) : '';
}

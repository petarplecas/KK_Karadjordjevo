/**
 * Extracts the first image URL from content blocks
 * @param content Array of content blocks
 * @returns First image URL or undefined
 */
export function getFirstImage(content: any[]): string | undefined {
  const firstImage = content.find(block => block.type === 'image');
  if (!firstImage) return undefined;

  return firstImage.url || firstImage.value || undefined;
}

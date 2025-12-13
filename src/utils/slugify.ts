export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/đ/g, 'dj')
    .replace(/ž/g, 'z')
    .replace(/š/g, 's')
    .replace(/č/g, 'c')
    .replace(/ć/g, 'c')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

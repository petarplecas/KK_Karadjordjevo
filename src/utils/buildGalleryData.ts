import type { GalleryData, GalleryPeriod, GalleryEvent, GalleryImage } from '../types/gallery';
import { scanGalleryFolders, type ScannedYear, type ScannedEvent } from './scanGalleryFolders';
import { parseEventName } from './parseEventName';
import path from 'path';

/**
 * Generate slugified ID from text
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Convert scanned event to GalleryEvent
 */
function buildGalleryEvent(scannedEvent: ScannedEvent, yearNumber: number): GalleryEvent {
  const parsed = parseEventName(scannedEvent.folderName, yearNumber);

  // Build images array
  const images: GalleryImage[] = scannedEvent.images.map((fileName, index) => {
    const relativePath = path.posix.join('/images/Galerija', scannedEvent.folderPath.split('Galerija')[1].replace(/\\/g, '/'));
    const fullPath = path.posix.join(relativePath, fileName);

    return {
      fileName,
      path: relativePath,
      fullPath,
      alt: `${parsed.title} - ${index + 1}`,
      index: index + 1,
    };
  });

  // Cover image is the first image
  const coverImage = images[0];

  // Generate unique ID
  const id = slugify(`${yearNumber}-${scannedEvent.folderName}`);

  return {
    id,
    slug: slugify(scannedEvent.folderName),
    title: parsed.title,
    date: parsed.date,
    dateRange: parsed.dateRange,
    year: yearNumber,
    month: parsed.month,
    rawFolderName: scannedEvent.folderName,
    folderPath: scannedEvent.folderPath,
    images,
    coverImage,
    imageCount: images.length,
    category: parsed.category,
    eventType: parsed.eventType,
  };
}

/**
 * Build direct images "virtual event" for years with direct images
 */
function buildDirectImagesEvent(year: string, yearNumber: number, directImages: string[], yearPath: string): GalleryEvent {
  const images: GalleryImage[] = directImages.map((fileName, index) => {
    const relativePath = `/images/Galerija/${year}`;
    const fullPath = `${relativePath}/${fileName}`;

    return {
      fileName,
      path: relativePath,
      fullPath,
      alt: `Razne slike iz ${year} - ${index + 1}`,
      index: index + 1,
    };
  });

  const coverImage = images[0];
  const id = slugify(`${yearNumber}-razne-slike`);

  return {
    id,
    slug: 'razne-slike',
    title: `Razne slike iz ${year}`,
    year: yearNumber,
    rawFolderName: year,
    folderPath: yearPath,
    images,
    coverImage,
    imageCount: images.length,
    category: 'opšte',
    eventType: 'mixed',
  };
}

/**
 * Convert scanned year to GalleryPeriod
 */
function buildGalleryPeriod(scannedYear: ScannedYear): GalleryPeriod {
  const events: GalleryEvent[] = [];

  // Add regular events
  for (const scannedEvent of scannedYear.events) {
    const event = buildGalleryEvent(scannedEvent, scannedYear.yearNumber);
    events.push(event);
  }

  // Add direct images as virtual event if they exist
  let directImages: GalleryImage[] | undefined;
  if (scannedYear.directImages.length > 0) {
    const yearPath = path.join(process.cwd(), 'public/images/Galerija', scannedYear.year);
    const virtualEvent = buildDirectImagesEvent(
      scannedYear.year,
      scannedYear.yearNumber,
      scannedYear.directImages,
      yearPath
    );
    events.push(virtualEvent);
    directImages = virtualEvent.images;
  }

  // Calculate totals
  const totalImages = events.reduce((sum, event) => sum + event.imageCount, 0);
  const eventCount = events.length;

  // Determine accent color (alternate between amber and blue)
  const accentColor = scannedYear.yearNumber % 2 === 0 ? 'amber' : 'blue';

  // Generate description
  const description = eventCount > 0
    ? `Pregled događaja i slika iz ${scannedYear.year}. godine`
    : `Galerija iz ${scannedYear.year}. godine`;

  return {
    id: slugify(scannedYear.year),
    year: scannedYear.year,
    yearNumber: scannedYear.yearNumber,
    title: `Galerija ${scannedYear.year}`,
    description,
    accentColor,
    events,
    directImages,
    totalImages,
    eventCount,
  };
}

/**
 * Build complete gallery data structure from folder scan
 * This is the main entry point for gallery data generation
 */
export function buildGalleryData(): GalleryData {
  // Scan folders
  const scannedYears = scanGalleryFolders();

  // Convert to periods
  const periods: GalleryPeriod[] = scannedYears.map(buildGalleryPeriod);

  // Calculate totals
  const totalImages = periods.reduce((sum, period) => sum + period.totalImages, 0);
  const totalEvents = periods.reduce((sum, period) => sum + period.eventCount, 0);

  // Determine year range
  const years = periods.map(p => p.yearNumber).filter(y => y > 0).sort();
  const yearRange = years.length > 0
    ? `${Math.min(...years)}-${Math.max(...years)}`
    : '';

  return {
    periods,
    totalImages,
    totalEvents,
    yearRange,
  };
}

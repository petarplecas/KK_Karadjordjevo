import fs from 'fs';
import path from 'path';

export interface ScannedEvent {
  folderName: string;
  folderPath: string;
  images: string[];
}

export interface ScannedYear {
  year: string;
  yearNumber: number;
  yearPath: string;
  events: ScannedEvent[];
  directImages: string[];
}

const GALLERY_ROOT = path.join(process.cwd(), 'public/images/Galerija');
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.JPG', '.JPEG', '.PNG', '.GIF', '.WEBP'];

/**
 * Check if file is an image
 */
function isImageFile(fileName: string): boolean {
  return IMAGE_EXTENSIONS.some(ext => fileName.endsWith(ext));
}

/**
 * Scan a single event folder
 */
function scanEventFolder(eventPath: string, eventName: string): ScannedEvent | null {
  try {
    const items = fs.readdirSync(eventPath);
    const images = items.filter(isImageFile).sort();

    if (images.length === 0) {
      return null;
    }

    return {
      folderName: eventName,
      folderPath: eventPath,
      images,
    };
  } catch (error) {
    console.error(`Error scanning event folder ${eventPath}:`, error);
    return null;
  }
}

/**
 * Scan a single year folder
 */
function scanYearFolder(yearPath: string, year: string): ScannedYear | null {
  try {
    if (!fs.existsSync(yearPath)) {
      return null;
    }

    const items = fs.readdirSync(yearPath, { withFileTypes: true });
    const events: ScannedEvent[] = [];
    const directImages: string[] = [];

    for (const item of items) {
      if (item.isDirectory()) {
        // It's an event folder
        const eventPath = path.join(yearPath, item.name);
        const scannedEvent = scanEventFolder(eventPath, item.name);
        if (scannedEvent) {
          events.push(scannedEvent);
        }
      } else if (isImageFile(item.name)) {
        // It's a direct image in the year folder
        directImages.push(item.name);
      }
    }

    // Parse year number
    const yearNumber = parseInt(year, 10);
    if (isNaN(yearNumber)) {
      return null;
    }

    return {
      year,
      yearNumber,
      yearPath,
      events,
      directImages: directImages.sort(),
    };
  } catch (error) {
    console.error(`Error scanning year folder ${yearPath}:`, error);
    return null;
  }
}

/**
 * Scan all gallery folders and return structured data
 */
export function scanGalleryFolders(): ScannedYear[] {
  try {
    if (!fs.existsSync(GALLERY_ROOT)) {
      console.warn(`Gallery root does not exist: ${GALLERY_ROOT}`);
      return [];
    }

    const items = fs.readdirSync(GALLERY_ROOT, { withFileTypes: true });
    const scannedYears: ScannedYear[] = [];

    for (const item of items) {
      if (item.isDirectory()) {
        const yearPath = path.join(GALLERY_ROOT, item.name);
        const scannedYear = scanYearFolder(yearPath, item.name);
        if (scannedYear) {
          scannedYears.push(scannedYear);
        }
      }
    }

    // Sort by year descending (newest first)
    scannedYears.sort((a, b) => b.yearNumber - a.yearNumber);

    return scannedYears;
  } catch (error) {
    console.error(`Error scanning gallery folders:`, error);
    return [];
  }
}

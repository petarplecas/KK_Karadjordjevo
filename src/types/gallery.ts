export type GalleryEventType =
  | 'turnir'
  | 'utakmica'
  | 'trening'
  | 'kamp'
  | 'promocija'
  | 'slava'
  | 'mixed';

export type EventCategory = 'muški' | 'ženski' | 'opšte';

export interface GalleryImage {
  fileName: string;
  path: string;
  fullPath: string; // Za <img src="">
  alt: string;
  index: number;
}

export interface GalleryEvent {
  id: string; // Slugified ID
  slug: string;
  title: string; // Parsiran naslov
  date?: string; // "06.04.2007"
  dateRange?: string; // "13-14.09.2008"
  year: number;
  month?: number; // 1-12
  rawFolderName: string;
  folderPath: string;
  images: GalleryImage[];
  coverImage: GalleryImage;
  imageCount: number;
  category: EventCategory;
  eventType: GalleryEventType;
}

export interface GalleryPeriod {
  id: string;
  year: string; // "2011", "2003 i pre"
  yearNumber: number;
  title: string; // "Galerija 2011"
  description: string;
  accentColor: 'amber' | 'blue';
  events: GalleryEvent[];
  directImages?: GalleryImage[]; // Za godine bez podfoldera
  totalImages: number;
  eventCount: number;
}

export interface GalleryData {
  periods: GalleryPeriod[];
  totalImages: number;
  totalEvents: number;
  yearRange: string; // "2003-2019"
}

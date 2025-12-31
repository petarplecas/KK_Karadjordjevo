export interface ContentGalleryLink {
  contentType: 'vesti' | 'turniri';
  contentId: string; // e.g., "vest_001" or "turnir_001"
  galleryEventId: string; // e.g., "2023-radivoj-korac-21022023"
  matchType: 'auto' | 'manual';
  confidence: number; // 0-1
  confirmedBy?: string;
  confirmedAt?: string;
}

export interface ContentGalleryLinksData {
  version: string;
  lastUpdated: string;
  links: ContentGalleryLink[];
}

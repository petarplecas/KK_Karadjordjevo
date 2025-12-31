import type { GalleryEvent } from '../types/gallery';
import contentLinksData from '../data/contentGalleryLinks.json';
import { buildGalleryData } from './buildGalleryData';

let galleryEventsCache: GalleryEvent[] | null = null;

function getAllGalleryEvents(): GalleryEvent[] {
  if (!galleryEventsCache) {
    const galleryData = buildGalleryData();
    galleryEventsCache = galleryData.periods.flatMap(p => p.events);
  }
  return galleryEventsCache;
}

export function getGalleryLinkForContent(
  contentType: 'vesti' | 'turniri',
  contentId: string
): GalleryEvent | null {
  const link = contentLinksData.links.find(
    l => l.contentType === contentType && l.contentId === contentId
  );

  if (!link) return null;

  const allEvents = getAllGalleryEvents();
  const event = allEvents.find(e => e.id === link.galleryEventId);

  return event || null;
}

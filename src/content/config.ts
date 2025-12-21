import { z, defineCollection } from 'astro:content';

// Shared content schema for news, tournaments, and about pages
const contentSchema = z.object({
  id: z.number().optional(),
  url: z.string().url().optional(),
  title: z.string(),
  date: z.string().nullable().transform((str) => str ? new Date(str) : null),
  date_formatted: z.string().nullable(),
  content: z.array(
    z.discriminatedUnion('type', [
      z.object({
        type: z.literal('text'),
        value: z.string(),
      }),
      z.object({
        type: z.literal('image'),
        filename: z.string().optional(),
        value: z.string().optional(), // For old format with URL
        url: z.string().optional(), // Allow both URLs and local paths like /images/...
        originalUrl: z.string().url().optional(), // Original URL from old site
        note: z.string().optional(), // Optional note about the image
        alt: z.string().default('Fotografija sa događaja'), // Alt text for accessibility
        caption: z.string().optional(), // Optional caption
      }),
      z.object({
        type: z.literal('video'),
        platform: z.enum(['youtube']),
        video_id: z.string(),
        title: z.string().optional(),
        url: z.string().url().optional(),
        thumbnail: z.string().url().optional(),
      }),
      z.object({
        type: z.literal('gallery_link'),
        title: z.string().optional(),
        value: z.string().optional(), // For old format
        url: z.string().url().optional(),
      }),
    ])
  ),
});

const vestiCollection = defineCollection({
  type: 'data',
  schema: contentSchema,
});

const turniriCollection = defineCollection({
  type: 'data',
  schema: contentSchema,
});

const aboutCollection = defineCollection({
  type: 'data',
  schema: contentSchema,
});

export const collections = {
  vesti: vestiCollection,
  turniri: turniriCollection,
  about: aboutCollection,
};

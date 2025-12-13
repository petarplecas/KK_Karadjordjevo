import { z, defineCollection } from 'astro:content';

const vestiCollection = defineCollection({
  type: 'data',
  schema: z.object({
    id: z.number().optional(),
    url: z.string().url(),
    title: z.string(),
    date: z.string().transform((str) => new Date(str)),
    date_formatted: z.string(),
    content: z.array(
      z.discriminatedUnion('type', [
        z.object({
          type: z.literal('text'),
          value: z.string(),
        }),
        z.object({
          type: z.literal('image'),
          filename: z.string(),
          url: z.string().url().optional(),
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
          title: z.string(),
          url: z.string().url(),
        }),
      ])
    ),
  }),
});

export const collections = {
  vesti: vestiCollection,
};

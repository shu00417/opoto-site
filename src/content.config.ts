import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const works = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/works' }),
  schema: z.object({
    title: z.string(),
    category: z.enum(['studio', 'gallery', 'other']).default('other'),
    date: z.date(),
    image: z.string(),
    description: z.string().optional(),
  }),
});

const exhibitions = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/exhibitions' }),
  schema: z.object({
    title: z.string(),
    artist: z.string().optional(),
    exhibitionType: z.string().optional(),
    status: z.enum(['current', 'next', 'upcoming', 'past']).default('past'),
    period: z.string().optional(),
    image: z.string().optional(),
    images: z.array(z.string()).optional(),
    description: z.string().optional(),
    note: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    status: z.enum(['upcoming', 'past']).default('past'),
    period: z.string().optional(),
    image: z.string().optional(),
    description: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { works, exhibitions, events };

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

export const collections = { works };

import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro:schema';

const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    tags: z.union([z.array(z.string()), z.string()]).optional(),
    date: z.coerce.date().optional(),
  }),
});

export const collections = { notes };

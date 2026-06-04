import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const books = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/books' }),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    coverURL: z.string().optional().default(''),
    status: z.enum(['Read', 'Reading', 'Unread', 'Wishlist']).default('Unread'),
    genres: z.array(z.string()).default([]),
    dateAdded: z.string().optional(),
  }),
});

const wishlist = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/wishlist' }),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    coverURL: z.string().optional().default(''),
    buyLink: z.string().optional().default(''),
    priority: z.enum(['High', 'Medium', 'Low']).default('Medium'),
    price: z.string().optional().default(''),
    note: z.string().optional().default(''),
    dateAdded: z.string().optional(),
  }),
});

export const collections = { books, wishlist };

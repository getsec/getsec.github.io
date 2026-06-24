import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Blog posts: Markdown files in src/content/blog/<slug>.md
const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
  }),
});

export const collections = { blog };

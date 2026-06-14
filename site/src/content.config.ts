import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const stories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: '../stories' }),
  schema: z.object({
    cluster: z.string(),
    concept: z.string(),
    status: z.string(),
    sources: z.array(z.string().url()).default([]),
    generated_at: z.coerce.date(),
    // Optional authored content for the guess-before-reveal flow. When absent,
    // the UI scaffolds a fallback (see src/lib/story-extras.ts):
    //   bridge      — one sentence linking fable → mechanism
    //   distractors — 2 plausible wrong concept labels for the "先猜" step
    //   related     — sibling concept ids to surface as lateral links
    bridge: z.string().optional(),
    distractors: z.array(z.string()).optional(),
    related: z.array(z.string()).optional(),
  }),
});

export const collections = { stories };

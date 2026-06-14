import type { CollectionEntry } from 'astro:content';
import type { Cluster } from '../data/clusters';
import { splitStory } from './split';

/**
 * Run all 4 chunk-1 consistency checks.
 * Throws on any violation so the build fails fast.
 */
export function runConsistencyChecks(
  entries: CollectionEntry<'stories'>[],
  clusters: Cluster[],
): void {
  // (a) exactly 100 entries
  if (entries.length !== 100) {
    throw new Error(`Expected 100 entries, got ${entries.length}`);
  }

  // Build lookup map
  const entryById = new Map(entries.map((e) => [e.id, e]));

  // (b) every storyOrder id maps to an entry
  for (const cluster of clusters) {
    for (const id of cluster.storyOrder) {
      const expectedId = `${cluster.slug}/${id}`;
      if (!entryById.has(expectedId)) {
        throw new Error(
          `Cluster ${cluster.slug}: storyOrder id "${id}" not found as entry id "${expectedId}". Available: ${[...entryById.keys()].filter((k) => k.startsWith(cluster.slug + '/')).join(', ')}`,
        );
      }
    }
  }

  // (c) every entry appears in exactly one storyOrder
  const allOrderedIds = new Set(
    clusters.flatMap((c) => c.storyOrder.map((id) => `${c.slug}/${id}`)),
  );
  for (const entry of entries) {
    if (!allOrderedIds.has(entry.id)) {
      throw new Error(`Entry "${entry.id}" does not appear in any storyOrder`);
    }
  }
  if (allOrderedIds.size !== 100) {
    throw new Error(`storyOrder total is ${allOrderedIds.size}, expected 100`);
  }

  // (d) splitStory returns non-empty parable AND explanation for all 100
  for (const entry of entries) {
    const { parable, explanation } = splitStory(entry.body ?? '');
    if (!parable) {
      throw new Error(`Entry "${entry.id}" has empty parable`);
    }
    if (!explanation) {
      throw new Error(`Entry "${entry.id}" has empty explanation`);
    }
  }
}

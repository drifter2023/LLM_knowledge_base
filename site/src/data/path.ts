import { clusters } from './clusters';

const PRIORITY_ORDER: Record<string, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };

/**
 * The recommended reading order across all 100 concepts — P0 clusters first,
 * then P1 → P2 → P3, and within a cluster the authored storyOrder. Drives the
 * single glowing "下一篇" pip on the home map and the "继续上次" tile.
 *
 * Each entry is a concept id (e.g. "align-sft"), matching the ids stored in the
 * localStorage read-set "llmkb.read.v1".
 */
export const readingPath: string[] = [...clusters]
  .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || a.num - b.num)
  .flatMap((c) => c.storyOrder);

/**
 * Scaffolds the three new per-story content pieces the guess-before-reveal UI
 * needs, falling back to data already in the collection when the optional
 * frontmatter fields (bridge / distractors / related) are absent.
 */

export interface SiblingConcept {
  id: string;
  concept: string;
  /** 1-based position of the sibling within its cluster. */
  n: number;
}

export interface Guess {
  id: string;
  label: string;
  correct: boolean;
}

export interface RelatedConcept {
  id: string;
  clusterSlug: string;
  n: number;
  concept: string;
}

// Deterministic per-story pick so the correct answer isn't always slot A and
// the build stays reproducible (no Math.random at build time).
function rotate<T>(arr: T[], by: number): T[] {
  const out = arr.slice();
  const k = ((by % out.length) + out.length) % out.length;
  return out.slice(k).concat(out.slice(0, k));
}

/**
 * Build the 3 guess options: the correct concept + 2 plausible distractors.
 * Distractors come from `frontmatter.distractors` if authored, otherwise from
 * sibling concepts in the same cluster (genuinely related, so plausible).
 */
export function buildGuesses(
  conceptId: string,
  concept: string,
  index: number,
  siblings: SiblingConcept[],
  authoredDistractors?: string[],
): Guess[] {
  // Resolve a sibling id for a distractor concept string, so the render layer
  // can map each option to its Chinese label by id.
  const idByConcept = new Map(siblings.map((s) => [s.concept, s.id]));
  let distractors = authoredDistractors?.slice(0, 2) ?? [];
  if (distractors.length < 2) {
    const pool = siblings.map((s) => s.concept).filter((c) => c !== concept);
    for (const c of rotate(pool, index + 1)) {
      if (distractors.length >= 2) break;
      if (!distractors.includes(c)) distractors.push(c);
    }
  }
  const options: Guess[] = [
    { id: conceptId, label: concept, correct: true },
    ...distractors.map((label) => ({ id: idByConcept.get(label) ?? '', label, correct: false })),
  ];
  // Rotate so the correct answer lands in a varying slot.
  return rotate(options, index % options.length);
}

/** One-sentence fable → mechanism bridge; authored if present, else generic. */
export function buildBridge(concept: string, authored?: string): string {
  if (authored && authored.trim()) return authored.trim();
  return `这则寓言里的情节，正是 ${concept} 的运作方式——它把抽象的机制，落成一个你能记住的画面。`;
}

/**
 * Lateral links to sibling concepts. Authored `related` ids win; otherwise the
 * adjacent concepts in the same cluster.
 */
export function buildRelated(
  clusterSlug: string,
  currentId: string,
  siblings: SiblingConcept[],
  authoredRelated?: string[],
): RelatedConcept[] {
  const byId = new Map(siblings.map((s) => [s.id, s]));
  let chosen: SiblingConcept[] = [];
  if (authoredRelated?.length) {
    chosen = authoredRelated.map((id) => byId.get(id)).filter((s): s is SiblingConcept => !!s && s.id !== currentId);
  }
  if (chosen.length === 0) {
    chosen = siblings.filter((s) => s.id !== currentId).slice(0, 3);
  }
  return chosen.slice(0, 3).map((s) => ({ id: s.id, clusterSlug, n: s.n, concept: s.concept }));
}

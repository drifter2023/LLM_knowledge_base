import { getRead } from './progress';

// Cluster slugs only — no concept names shipped client-side
const CLUSTER_SLUGS = [
  'arch', 'scaling', 'icl', 'align', 'itc',
  'interp', 'longctx', 'retrieval', 'agent', 'safety', 'eff', 'eval',
];

function isKnownId(id: string): boolean {
  return CLUSTER_SLUGS.some((slug) => id.startsWith(slug + '-'));
}

function idClusterSlug(id: string): string | null {
  for (const slug of CLUSTER_SLUGS) {
    if (id.startsWith(slug + '-')) return slug;
  }
  return null;
}

document.addEventListener('DOMContentLoaded', () => {
  const read = getRead();

  // Update story cards
  document.querySelectorAll<HTMLElement>('[data-story-id]').forEach((card) => {
    const id = card.dataset.storyId;
    if (!id || !read.has(id)) return;
    card.classList.add('read');
    const title = card.querySelector<HTMLElement>('.story-title');
    if (title) title.hidden = false;
    const mark = card.querySelector<HTMLElement>('.read-mark');
    if (mark) mark.hidden = false;
    const placeholder = card.querySelector<HTMLElement>('.story-placeholder');
    if (placeholder) placeholder.hidden = true;
  });

  // Update progress bars
  document.querySelectorAll<HTMLElement>('.progress[data-progress-scope]').forEach((bar) => {
    const scope = bar.dataset.progressScope!;
    const max = Number(bar.dataset.max) || 0;
    if (!max) return;

    let count = 0;
    if (scope === 'all') {
      // Count all read ids that belong to the 100 known story ids
      read.forEach((id) => { if (isKnownId(id)) count++; });
    } else {
      // Count read ids belonging to this cluster
      read.forEach((id) => { if (idClusterSlug(id) === scope) count++; });
    }

    const fill = bar.querySelector<HTMLElement>('.progress-fill');
    const label = bar.querySelector<HTMLElement>('.progress-label');
    const pct = max > 0 ? Math.min(100, (count / max) * 100) : 0;
    if (fill) fill.style.width = `${pct}%`;
    if (label) label.textContent = `${count} / ${max}`;
  });
});

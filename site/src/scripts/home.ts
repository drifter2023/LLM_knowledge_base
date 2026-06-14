import { getRead, getStreak } from './progress';
import { readingPath } from '../data/path';
import { clusters } from '../data/clusters';

const zhBySlug = new Map(clusters.map((c) => [c.slug, c.zh]));

// ── Persona highlight ──────────────────────────────────────────────
// Three identities; each maps to a curated set of *specific* stories (not whole
// clusters — picked per-story for genuine relevance to the role). Selecting one
// pulses exactly those story pips (cool-blue), without dimming or blocking
// anything else. Re-selecting the same persona toggles it off.
interface Persona { id: string; label: string; sub: string; stories: string[]; }
const PERSONAS: Persona[] = [
  {
    id: 'self', label: 'AI / LLM 自学者', sub: '系统打基础',
    stories: [
      'arch-self-attention-kv-cache', 'arch-tokenization', 'arch-moe', 'arch-rope-alibi-ntk',
      'arch-superposition', 'scaling-laws', 'scaling-emergent-abilities', 'scaling-phase-transitions',
      'scaling-data-quality-laws', 'scaling-grokking', 'icl-base', 'icl-cot', 'icl-induction-heads',
      'icl-bayesian-inference', 'icl-self-consistency', 'align-sft', 'align-rlhf', 'align-dpo',
      'align-reward-hacking', 'align-constitutional-ai-rlaif', 'itc-test-time-scaling', 'itc-long-cot',
      'itc-best-of-n', 'interp-probing', 'interp-sae', 'interp-linear-representation',
      'interp-activation-patching', 'interp-steering', 'longctx-lost-in-middle',
      'longctx-position-interpolation', 'longctx-external-memory', 'retrieval-dense-cross-encoders',
      'retrieval-parametric-vs-non', 'agent-react', 'agent-tool-use', 'safety-sycophancy',
      'safety-jailbreak', 'safety-scalable-oversight', 'eff-peft-lora', 'eff-quantization',
      'eff-distillation', 'eval-llm-as-judge', 'eval-calibration', 'eval-contamination',
      'eval-goodharts-law',
    ],
  },
  {
    id: 'eng', label: '工程师', sub: '落地与部署',
    stories: [
      'arch-moe', 'arch-rope-alibi-ntk', 'arch-tokenization', 'arch-self-attention-kv-cache',
      'icl-self-consistency', 'icl-prompt-tuning', 'icl-cot', 'icl-base', 'icl-tot-got', 'align-sft',
      'align-dpo', 'align-rlhf', 'itc-speculative-decoding', 'itc-token-efficiency', 'itc-best-of-n',
      'longctx-benchmarks', 'longctx-ring-flash-attention', 'longctx-lost-in-middle',
      'longctx-compressive-memory', 'longctx-position-interpolation', 'longctx-external-memory',
      'retrieval-self-rag-graphrag', 'retrieval-knowledge-editing', 'retrieval-hybrid-rrf',
      'retrieval-late-interaction', 'retrieval-dense-cross-encoders', 'retrieval-rag-failures',
      'agent-failure-modes', 'agent-multi-agent', 'agent-react', 'agent-mcp', 'agent-tool-use',
      'safety-refusal', 'safety-sycophancy', 'safety-jailbreak', 'safety-red-teaming',
      'eff-mixture-of-depths', 'eff-pruning', 'eff-speculative-decoding', 'eff-vq-kv-cache',
      'eff-quantization', 'eff-flashattention', 'eff-peft-lora', 'eff-continuous-batching',
      'eff-distillation', 'eval-llm-as-judge', 'eval-calibration', 'eval-contamination',
      'eval-real-world-bench', 'agent-benchmarks',
    ],
  },
  {
    id: 'curious', label: '了解大模型概念', sub: '抓住大思想',
    stories: [
      'scaling-laws', 'scaling-emergent-abilities', 'scaling-grokking', 'icl-cot', 'icl-base',
      'icl-self-consistency', 'icl-tot-got', 'align-rlhf', 'align-dpo', 'align-constitutional-ai-rlaif',
      'align-reward-hacking', 'itc-long-cot', 'itc-test-time-scaling', 'agent-react', 'agent-tool-use',
      'agent-mcp', 'agent-multi-agent', 'retrieval-parametric-vs-non', 'retrieval-self-rag-graphrag',
      'arch-moe', 'arch-tokenization', 'safety-jailbreak', 'safety-sycophancy',
      'safety-deceptive-alignment', 'safety-sleeper-agents', 'safety-scalable-oversight',
      'safety-red-teaming', 'eval-goodharts-law', 'eval-contamination', 'eval-llm-as-judge',
      'interp-sae',
    ],
  },
];
let activePersona: string | null = null;

function applyPersona(): void {
  document.querySelectorAll<HTMLButtonElement>('#persona-bar .pbtn').forEach((b) => {
    b.classList.toggle('active', !!activePersona && b.dataset.p === activePersona);
  });
  document.querySelectorAll('.pip.rel').forEach((p) => p.classList.remove('rel'));
  const relLegend = document.querySelector('.legend-rel');
  const persona = PERSONAS.find((p) => p.id === activePersona);
  if (relLegend) relLegend.classList.toggle('show', !!persona);
  if (!persona) return;
  const wanted = new Set(persona.stories);
  document.querySelectorAll<HTMLElement>('.pip[data-story-id]').forEach((pip) => {
    if (wanted.has(pip.dataset.storyId!)) pip.classList.add('rel');
  });
}

function renderPersonas(): void {
  const bar = document.getElementById('persona-bar');
  if (!bar) return;
  bar.innerHTML = PERSONAS.map(
    (p) => `<button class="pbtn" data-p="${p.id}"><span class="pl">${p.label}</span><span class="ps">${p.sub}</span></button>`,
  ).join('');
  bar.querySelectorAll<HTMLButtonElement>('.pbtn').forEach((b) => {
    b.addEventListener('click', () => {
      activePersona = activePersona === b.dataset.p ? null : b.dataset.p!;
      applyPersona();
    });
  });
}

function paintMap(): void {
  const read = getRead();

  // Pips
  const pips = Array.from(document.querySelectorAll<HTMLAnchorElement>('.pip[data-story-id]'));
  const counts = new Map<string, number>();
  let total = 0;
  for (const pip of pips) {
    const id = pip.dataset.storyId!;
    pip.classList.remove('read', 'next');
    if (read.has(id)) {
      pip.classList.add('read');
      counts.set(pip.dataset.cluster!, (counts.get(pip.dataset.cluster!) ?? 0) + 1);
      total++;
    }
  }

  // Per-row + global counts
  document.querySelectorAll<HTMLElement>('.km-row').forEach((row) => {
    const slug = row.dataset.cluster!;
    const el = row.querySelector<HTMLElement>('.km-read');
    if (el) el.textContent = String(counts.get(slug) ?? 0);
  });
  const mapCount = document.getElementById('map-count');
  if (mapCount) mapCount.textContent = String(total);

  // The single recommended "next" pip = first unread on the reading path.
  const nextId = readingPath.find((id) => !read.has(id));
  let nextPip: HTMLAnchorElement | null = null;
  if (nextId) {
    nextPip = pips.find((p) => p.dataset.storyId === nextId) ?? null;
    if (nextPip) nextPip.classList.add('next');
  }

  paintKeepGoing(nextPip);
}

function paintKeepGoing(nextPip: HTMLAnchorElement | null): void {
  const strip = document.getElementById('mstrip');
  if (!strip) return;

  // Continue tile — cluster + story number only, never the concept name.
  let resume = '';
  if (nextPip) {
    const slug = nextPip.dataset.cluster!;
    const n = nextPip.dataset.n!;
    const zh = zhBySlug.get(slug) ?? '';
    resume = `
      <a class="mtile resume" href="/stories/${slug}/${n}/">
        <span class="rtext"><span class="lab">继续上次</span><b>${zh} · 故事 #${n}</b></span>
        <span class="go">接着读 →</span>
      </a>`;
  } else {
    resume = `
      <div class="mtile resume" style="cursor:default">
        <span class="rtext"><span class="lab">全部读完</span><b>整片版图已点亮 ✦</b></span>
      </div>`;
  }

  // Streak tile
  const { streak } = getStreak();
  const dots = Array.from({ length: 7 }, (_, i) => {
    const cls = i < streak - 1 ? 'on' : i === streak - 1 ? 'today' : '';
    return `<i class="${cls}"></i>`;
  }).join('');
  const streakTile = `
    <div class="mtile streak">
      <span class="lab">连续</span>
      <span class="big">${streak} 天</span>
      <span class="streak-dots">${dots}</span>
    </div>`;

  strip.innerHTML = resume + streakTile;
}

document.addEventListener('DOMContentLoaded', () => {
  paintMap();
  renderPersonas();
});

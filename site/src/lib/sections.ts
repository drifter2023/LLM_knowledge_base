import { renderExplanation, renderCJKMarkdown } from './markdown';

export interface Layer {
  pill: string; // short Chinese tag for the accordion header
  title: string; // section title (its original heading / label)
  html: string; // rendered body
}

interface RawSection {
  label: string;
  body: string;
}

export interface DigestSection {
  pill: string;
  title: string;
  body: string; // Chinese markdown
}

/**
 * Build the collapsible 中文速览 layers from an authored Chinese digest
 * (src/data/digests.json) instead of the English explanation. Bodies are still
 * run through the markdown renderer so formulas / `code` spans survive.
 */
export function layersFromDigest(sections: DigestSection[]): Layer[] {
  return sections.map((s) => ({ pill: s.pill, title: s.title, html: renderCJKMarkdown(s.body) }));
}

// Map an English (or Chinese) section heading to a short pill + Chinese title.
const PILL_MAP: { test: RegExp; pill: string; title: string }[] = [
  { test: /concept|field|definition|overview|what is|背景|定义|是什么/i, pill: '速览', title: '概念与领域' },
  { test: /mechanism|how it works|how it|method|approach|机制|原理|做法/i, pill: '机制', title: '关键机制' },
  { test: /why|matter|importance|significance|impact|重要|意义/i, pill: '为何重要', title: '为何重要' },
  { test: /open|controvers|question|debate|limitation|frontier|challenge|future|前沿|争议|局限/i, pill: '前沿', title: '争议与前沿' },
];
const REF_RE = /reference|sources|bibliograph|参考|来源/i;

const BOLD_LEAD_RE = /(?:^|\n)\s*\*\*([^*\n]{1,80}?)[.:：]\*\*/g;

/**
 * Strip a leading "## Title" line and any trailing references section from an
 * explanation so it can be rendered as the flowing English deep-read essay.
 * (References render separately from frontmatter.sources[].)
 */
export function deepReadSource(explanation: string): string {
  let src = explanation.trim();
  const hasBoldLeads = (src.match(BOLD_LEAD_RE) || []).length >= 2;
  // Bold-lead style opens with a "## SFT — Alignment cluster" title that just
  // duplicates the styled concept name; drop it. Heading style ("## Concept and
  // field") keeps all its headings, which become section labels.
  if (hasBoldLeads) src = src.replace(/^\s*#{1,6}\s+[^\n]*\n+/, '');
  // Cut a trailing references section (heading or bold lead-in).
  src = src.replace(
    /\n+(?:#{2,6}\s*[^\n]*(?:reference|sources|参考|来源)[^\n]*|\*\*[^*\n]*(?:reference|sources|参考|来源)[^\n]*\*\*)[\s\S]*$/i,
    '',
  );
  return src.trim();
}

export function renderDeepRead(explanation: string): string {
  return renderExplanation(deepReadSource(explanation));
}

/**
 * Split an explanation into its labelled sections and render each as a
 * collapsible layer (中文速览). Handles both authoring styles:
 *  - run-in bold lead-ins (`**Concept and field.** …`)
 *  - `## Heading` sections
 */
export function parseLayers(explanation: string): Layer[] {
  let src = explanation.trim();
  const boldLeads = (src.match(BOLD_LEAD_RE) || []).length;
  const raw: RawSection[] = [];

  if (boldLeads >= 2) {
    src = src.replace(/^\s*#{1,6}\s+[^\n]*\n+/, ''); // drop the title heading
    const parts = src.split(/(?=(?:^|\n)\s*\*\*[^*\n]{1,80}?[.:：]\*\*)/);
    for (const part of parts) {
      const t = part.trim();
      if (!t) continue;
      const m = t.match(/^\*\*([^*\n]{1,80}?)[.:：]\*\*\s*([\s\S]*)$/);
      if (m) raw.push({ label: m[1].trim(), body: m[2].trim() });
      else raw.push({ label: '', body: t }); // preamble before first lead-in
    }
  } else {
    const parts = src.split(/(?=^#{2,6}\s+)/m);
    for (const part of parts) {
      const t = part.trim();
      if (!t) continue;
      const m = t.match(/^#{2,6}\s+([^\n]+)\n*([\s\S]*)$/);
      if (m) raw.push({ label: m[1].trim(), body: m[2].trim() });
      else raw.push({ label: '', body: t });
    }
  }

  const kept = raw.filter((c) => c.body && !REF_RE.test(c.label));
  if (kept.length === 0) {
    // Nothing parsed cleanly — show the whole thing as one layer.
    return [{ pill: '速览', title: '速览', html: renderExplanation(deepReadSource(explanation)) }];
  }

  return kept.map((c, i) => {
    const mapped = PILL_MAP.find((p) => p.test.test(c.label));
    const pill = mapped ? mapped.pill : i === 0 ? '速览' : '细节';
    const title = c.label || (mapped ? mapped.title : '要点');
    return { pill, title, html: renderExplanation(c.body) };
  });
}

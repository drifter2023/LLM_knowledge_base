import MarkdownIt from 'markdown-it';
import katexPlugin from '@vscode/markdown-it-katex';

export const md = new MarkdownIt({ html: false, linkify: true });

// Explanations carry math in two forms: real LaTeX ($…$ / $$…$$) in a handful
// of stories, and Unicode-math inside `code` spans in many more. Only the
// explanation renderer enables KaTeX so parables (which never use $) are
// untouched.
const mdExplain = new MarkdownIt({ html: false, linkify: true });
mdExplain.use(katexPlugin.default ?? katexPlugin, {
  throwOnError: false,
  errorColor: 'var(--accent)',
});

export function renderMd(src: string): string {
  return md.render(src);
}

// A `code` span reads as a set-piece equation (display block) rather than an
// inline symbol when it is long-ish and carries an operator/relation. Short
// spans like `π_θ` or `W ∈ ℝ` stay inline.
const MATH_OP = /[=≈≤≥≠<>→↦∝∑∏∫·×‖]|softmax|argmax|\bclip\b|\bexp\b|\blog\b/;
function tagFormulaCodeSpans(html: string): string {
  // Swallow any sentence punctuation trailing a display formula — once the
  // equation is lifted onto its own line, the prose period left behind would
  // orphan on a line of its own.
  return html.replace(/<code>([^<]+)<\/code>([.,;:，。；：]?)/g, (full, body, punct) => {
    const text = body.replace(/&[a-z]+;/g, '_'); // length-only normalization
    const isFormula = text.length >= 24 && MATH_OP.test(body);
    return isFormula ? `<code class="formula">${body}</code>` : full;
  });
}

/**
 * Render an explanation section:
 *  - KaTeX renders $…$ / $$…$$ LaTeX.
 *  - Run-in bold labels (`**Field.**`, `**Cluster:**`) ending in `.`/`:` become
 *    section labels; sentence subjects like `**Grokking** is …` stay inline.
 *  - Long Unicode-math code spans become display formulas.
 */
export function renderExplanation(src: string): string {
  let html = mdExplain.render(src);
  html = html.replace(
    /<p><strong>([^<]{1,80}[.:：。])<\/strong>/g,
    '<p><strong class="section-label">$1</strong>'
  );
  html = tagFormulaCodeSpans(html);
  return html;
}

// markdown-it follows CommonMark emphasis flanking rules, which break for
// `**bold**` / `*italic*` sitting flush against a CJK character (e.g.
// `**组相对策略优化）**属于…` renders literal asterisks). The 中文速览 digests are
// full of that pattern, so we lift emphasis out before parsing and restore it
// after — bypassing the flanking check entirely.
const SENT = { bo: '', bc: '', io: '', ic: '' };
function protectEmphasis(src: string): string {
  return src
    .replace(/\*\*(?=\S)([^\n]+?)\*\*/g, (_, t) => `${SENT.bo}${t}${SENT.bc}`)
    .replace(/(?<![*\w])\*(?=\S)([^*\n]+?)\*(?!\*)/g, (_, t) => `${SENT.io}${t}${SENT.ic}`);
}
function restoreEmphasis(html: string): string {
  return html
    .replaceAll(SENT.bo, '<strong>')
    .replaceAll(SENT.bc, '</strong>')
    .replaceAll(SENT.io, '<em>')
    .replaceAll(SENT.ic, '</em>');
}

/** Render Chinese digest markdown (CJK-safe emphasis + KaTeX + formula spans). */
export function renderCJKMarkdown(src: string): string {
  let html = mdExplain.render(protectEmphasis(src));
  html = restoreEmphasis(html);
  html = tagFormulaCodeSpans(html);
  return html;
}

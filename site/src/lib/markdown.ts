import MarkdownIt from 'markdown-it';
import katexPlugin from '@vscode/markdown-it-katex';
import katex from 'katex';

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

// A code span is real math worth typesetting when it carries a LaTeX
// sub/superscript brace, a caret, or a Unicode math symbol. Plain snake_case
// identifiers, file paths, and things like `O(N)` carry none of these.
const MATH_MARK =
  /[_^]\{|\^|[·×÷∈∉⊂⊆⊕⊗⊙≤≥≠≈≡≃≅≪≫∝∼→←↦⇒⇔∑∏∫∮√∂∇∞±∓⌈⌉⌊⌋‖⟨⟩∀∃∄¬∧∨ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθϑικλμνξοπϖρςστυφϕχψω∈ℝℕℤℚℂ𝔼ℒ]/;

// A bare subscripted/superscripted single variable (`h_t`, `x_t`, `v_j`, `a^2`,
// `x_i^2`) carries no Unicode marker but is still math. Restricting the base to a
// single letter keeps snake_case identifiers (`data_quality`) out.
const SIMPLE_VAR = /^[A-Za-z](?:_[A-Za-z0-9]{1,3}|\^[A-Za-z0-9]{1,3})+['′]?$/;

const HTML_ENT: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" };
function htmlDecode(s: string): string {
  return s.replace(/&(?:amp|lt|gt|quot|#39);/g, (m) => HTML_ENT[m] ?? m);
}

// Code spans in these explanations are overwhelmingly inline math, authored with
// a mix of Unicode symbols and LaTeX sub/superscripts (`h_t = A · h_{t-1}`).
// The markdown-it KaTeX plugin only typesets $…$, so those code spans render as
// literal text (braces and all). Here we KaTeX-render the math-looking ones,
// falling back to the original code span when KaTeX can't parse it — so real
// code like `getCollection('stories')` is never mangled.
function tagFormulaCodeSpans(html: string): string {
  return html.replace(/<code>([^<]+)<\/code>([.,;:，。；：]?)/g, (full, body, punct) => {
    const text = htmlDecode(body);
    if (MATH_MARK.test(text) || SIMPLE_VAR.test(text)) {
      try {
        const rendered = katex.renderToString(text, { throwOnError: true, strict: false });
        return `<span class="math-inline">${rendered}</span>${punct}`;
      } catch {
        /* not parseable as math — fall through to the legacy code-span handling */
      }
    }
    // Legacy: a long, operator-heavy span with no math markers (rare) still gets
    // lifted onto its own line as a styled display block. Swallow trailing
    // punctuation so the orphaned period doesn't land on a line of its own.
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

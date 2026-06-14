import { getRead, markRead } from './progress';

interface AskContext {
  concept: string;
  cluster: string;
  bridge: string;
  explanation: string;
  fable: string;
}

const PRO_KEY = 'llmkb.pro.v1';
const ASK_KEY = 'llmkb.ask.v1';
const FREE_PER_DAY = 1;

const article = document.querySelector<HTMLElement>('.story-wrap');
const conceptId = article?.dataset.storyId ?? '';

const guessBlock = document.getElementById('guess-block');
const panel = document.getElementById('concept-panel');
const revealBtn = document.getElementById('reveal-btn');
const revealHint = document.getElementById('reveal-hint');
const skipBtn = document.getElementById('skip-guess');
const feedback = document.getElementById('gfeedback');

let revealed = false;
let picked: { label: string; correct: boolean } | null = null;

function todayStr(): string { return new Date().toISOString().slice(0, 10); }

let toastTimer: number | undefined;
function toast(msg: string): void {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => t.classList.remove('show'), 2600);
}

/* ── 先猜: guess selection ──────────────────────────────────── */
function bindGuesses(): void {
  document.querySelectorAll<HTMLButtonElement>('#guess-block .gchip:not(.skip)').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#guess-block .gchip').forEach((x) => x.classList.remove('sel'));
      chip.classList.add('sel');
      picked = {
        label: chip.querySelector('.glabel')?.textContent ?? '',
        correct: chip.dataset.correct === 'true',
      };
      if (revealHint) revealHint.textContent = '已押注 · 揭晓看看？';
    });
  });
  skipBtn?.addEventListener('click', () => { picked = null; reveal(); });
  revealBtn?.addEventListener('click', () => reveal());
}

/* ── 揭晓: reveal the concept ───────────────────────────────── */
function reveal(): void {
  if (revealed || !panel) return;
  revealed = true;
  if (conceptId) markRead(conceptId);
  document.body.classList.add('cooled');

  if (picked && feedback) {
    feedback.hidden = false;
    if (picked.correct) {
      feedback.classList.add('right');
      feedback.textContent = `✓ 猜对了！你押的「${picked.label}」正是答案——这下更记得牢了。`;
    } else {
      feedback.classList.add('wrong');
      feedback.textContent = `↺ 你押的是「${picked.label}」。再看一眼——其实是下面这个。猜错的瞬间，记忆最深。`;
    }
  }

  if (guessBlock) guessBlock.style.display = 'none';
  panel.hidden = false;
  bindLayers();
  initAsk();
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── collapsible 中文速览 layers ────────────────────────────── */
function bindLayers(): void {
  panel?.querySelectorAll<HTMLButtonElement>('.layer-h').forEach((h) => {
    h.addEventListener('click', () => h.parentElement?.classList.toggle('open'));
  });
}

/* ── keyboard A/B/C + Enter ─────────────────────────────────── */
document.addEventListener('keydown', (e) => {
  if (revealed) return;
  const tag = (e.target as HTMLElement)?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  const k = e.key.toUpperCase();
  if (['A', 'B', 'C', 'D'].includes(k)) {
    const chip = document.querySelector<HTMLButtonElement>(`#guess-block .gchip[data-i="${k.charCodeAt(0) - 65}"]`);
    chip?.click();
  } else if (e.key === 'Enter') {
    revealBtn?.click();
  }
});

/* ── 追问: premium Ask module ───────────────────────────────── */
function getAskCount(): number {
  try {
    const s = JSON.parse(localStorage.getItem(ASK_KEY) ?? 'null');
    return s && s.date === todayStr() ? s.count : 0;
  } catch { return 0; }
}
function bumpAskCount(): void {
  localStorage.setItem(ASK_KEY, JSON.stringify({ date: todayStr(), count: getAskCount() + 1 }));
}
function isMember(): boolean { return localStorage.getItem(PRO_KEY) === '1'; }

function initAsk(): void {
  const mod = document.getElementById('ask-module');
  if (!mod) return;

  const ctxEl = document.getElementById('ask-context');
  let ctx: AskContext | null = null;
  try { ctx = JSON.parse(ctxEl?.textContent ?? 'null'); } catch { /* ignore */ }

  const field = mod.querySelector<HTMLInputElement>('#ask-field');
  const sendBtn = mod.querySelector<HTMLButtonElement>('#ask-send');
  const qa = mod.querySelector<HTMLElement>('#qa-live');
  const quota = mod.querySelector<HTMLElement>('#ask-quota');
  const unlockBtn = mod.querySelector<HTMLButtonElement>('#unlock-btn');
  const chips = mod.querySelectorAll<HTMLButtonElement>('#ask-chips .chip');

  // tempFree grants exactly one free question this visit before the paywall.
  let tempFree = false;

  function freeLeft(): number { return Math.max(0, FREE_PER_DAY - getAskCount()); }

  function syncLock(): void {
    if (isMember() || tempFree) {
      mod!.classList.remove('locked');
    } else {
      mod!.classList.add('locked');
    }
    if (unlockBtn) {
      unlockBtn.textContent = freeLeft() > 0 ? '🔓 免费试问 1 次' : '🔒 解锁会员 · 无限追问';
      unlockBtn.dataset.mode = freeLeft() > 0 ? 'free' : 'member';
    }
    if (quota) {
      quota.textContent = isMember()
        ? '会员 · 无限追问'
        : freeLeft() > 0
          ? '今日免费 1 次'
          : '今日免费额度已用，解锁会员可无限提问';
    }
  }

  unlockBtn?.addEventListener('click', () => {
    if (unlockBtn.dataset.mode === 'free') {
      tempFree = true;
    } else {
      // Demo unlock — a real build would gate this behind a purchase/entitlement.
      localStorage.setItem(PRO_KEY, '1');
      toast('已解锁「追问」会员（演示）');
    }
    syncLock();
    field?.focus();
  });

  let streaming = false;
  async function ask(question: string): Promise<void> {
    if (!question || streaming) return;
    if (!isMember() && !tempFree) { syncLock(); return; }

    streaming = true;
    if (sendBtn) sendBtn.disabled = true;
    qa?.insertAdjacentHTML('beforeend', `<div class="bub u"></div>`);
    (qa?.lastElementChild as HTMLElement).textContent = question;
    const answer = document.createElement('div');
    answer.className = 'bub a';
    answer.textContent = '…';
    qa?.appendChild(answer);
    answer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question, context: ctx }),
      });
      if (!res.ok || !res.body) throw new Error(String(res.status));
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        answer.textContent = text;
        answer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      if (!text.trim()) answer.textContent = '（没有收到回答，请再试一次）';
    } catch {
      answer.textContent = '追问服务暂时不可用——本地预览需要部署带 ANTHROPIC_API_KEY 的 Worker 才能连到模型。';
    }

    streaming = false;
    if (sendBtn) sendBtn.disabled = false;

    if (!isMember()) {
      bumpAskCount();
      tempFree = false;
      syncLock();
    }
  }

  function submit(): void {
    if (!field) return;
    const q = field.value.trim();
    field.value = '';
    ask(q);
  }
  sendBtn?.addEventListener('click', submit);
  field?.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
  chips.forEach((c) => c.addEventListener('click', () => {
    if (field) field.value = c.textContent ?? '';
    submit();
  }));

  syncLock();
}

/* ── related concepts: reveal the name only for stories already read ── */
function paintRelated(): void {
  const read = getRead();
  document.querySelectorAll<HTMLAnchorElement>('.rchip[data-story-id]').forEach((chip) => {
    const id = chip.dataset.storyId ?? '';
    const nameEl = chip.querySelector<HTMLElement>('.rc-name');
    if (read.has(id)) {
      chip.classList.remove('locked');
      chip.classList.add('seen');
      if (nameEl && chip.dataset.concept) nameEl.textContent = chip.dataset.concept;
    }
  });
}

/* ── boot ───────────────────────────────────────────────────── */
bindGuesses();
paintRelated();
// If this concept was already read, jump straight to the reveal.
if (conceptId && getRead().has(conceptId)) reveal();

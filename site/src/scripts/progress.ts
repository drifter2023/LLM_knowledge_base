const KEY = 'llmkb.read.v1';
const STREAK_KEY = 'llmkb.streak.v1';

export function getRead(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]')); } catch { return new Set(); }
}

interface Streak { streak: number; lastDate: string; }

function todayStr(): string { return new Date().toISOString().slice(0, 10); }
function yesterdayStr(): string { return new Date(Date.now() - 864e5).toISOString().slice(0, 10); }

export function getStreak(): Streak {
  try {
    const s = JSON.parse(localStorage.getItem(STREAK_KEY) ?? 'null');
    if (s && typeof s.streak === 'number') return s;
  } catch { /* ignore */ }
  return { streak: 0, lastDate: '' };
}

/** Bump the daily streak: +1 on a new consecutive day, reset to 1 after a gap. */
function bumpStreak(): void {
  const s = getStreak();
  const t = todayStr();
  if (s.lastDate === t) return;
  s.streak = s.lastDate === yesterdayStr() ? s.streak + 1 : 1;
  s.lastDate = t;
  localStorage.setItem(STREAK_KEY, JSON.stringify(s));
}

export function markRead(id: string): void {
  const s = getRead();
  s.add(id);
  localStorage.setItem(KEY, JSON.stringify([...s]));
  bumpStreak();
}

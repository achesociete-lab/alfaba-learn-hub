// BUG 3 FIX: Fisher-Yates shuffle + ordre stable par session via localStorage.

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getOrCreateShuffledOrder(storageKey: string, length: number): number[] {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed: number[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === length) return parsed;
    }
  } catch { /* ignore */ }
  const shuffled = shuffleArray(Array.from({ length }, (_, i) => i));
  try { localStorage.setItem(storageKey, JSON.stringify(shuffled)); } catch { /* ignore */ }
  return shuffled;
}

export function clearShuffledOrder(storageKey: string): void {
  try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
}

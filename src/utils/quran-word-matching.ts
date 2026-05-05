// Arabic word matching utility for Tarteel-style real-time Quran correction.
//
// Strips diacritics + normalizes letter variants so that a recited word is
// considered correct even if the student didn't pronounce/transcribe every
// haraka perfectly. Then performs greedy alignment with a small look-ahead
// window so we can detect skipped words.

export type WordStatus = "pending" | "correct" | "incorrect" | "skipped" | "current";

export interface AlignmentResult {
  statuses: WordStatus[];
  cursorIndex: number;
  correctCount: number;
  errorCount: number;
  skippedCount: number;
  totalRecited: number;
}

/**
 * Normalize Arabic text for comparison.
 * - Removes Arabic diacritics (fatha, damma, kasra, sukun, shadda, tanwin...)
 * - Removes Tatweel (ـ)
 * - Removes Quranic recitation marks
 * - Folds alef variants (إ أ آ ٱ) → ا
 * - Folds ya variants (ى) → ي
 * - Folds ta marbuta (ة) → ه
 * - Folds hamza on waw/ya seats (ؤ ئ) → و / ي  (seat is grapheme noise)
 * - KEEPS standalone hamza (ء) — it carries phonemic meaning in recitation
 *   (e.g. سَأَلَ vs سَلَ); a quality model like whisper-quran will output it.
 * - Strips punctuation and zero-width chars
 */
export function normalizeArabic(text: string): string {
  if (!text) return "";
  return text
    // Diacritics: fatha (064B-064F), damma, kasra, sukun, shadda, tanwin, dagger alef (0670), tatweel (0640)
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    // Quranic recitation marks (small high letters, sajdah, hizb, etc.)
    .replace(/[\u06D6-\u06ED\u08F0-\u08FF\uFC5E-\uFC63]/g, "")
    // Zero-width / formatting characters
    .replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, "")
    // Alef variants → bare alef
    .replace(/[\u0622\u0623\u0625\u0671\u0672\u0673\u0675]/g, "\u0627")
    // Ya alif maqsura → ya
    .replace(/\u0649/g, "\u064A")
    // Ta marbuta → ha (most common transcription confusion)
    .replace(/\u0629/g, "\u0647")
    // Hamza on waw seat → waw  (the seat is just a grapheme convention)
    .replace(/\u0624/g, "\u0648")
    // Hamza on ya seat → ya
    .replace(/\u0626/g, "\u064A")
    // NOTE: standalone hamza (\u0621) intentionally KEPT — see header comment.
    // Punctuation + symbols + Latin chars (some STT may insert)
    .replace(/[^\u0600-\u06FF\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Split a verse into words. Strips ayah-end markers (e.g. "۝", "۞") which
 * are sometimes embedded in the API text for visual purposes.
 */
export function tokenizeArabic(text: string): string[] {
  if (!text) return [];
  return text
    .replace(/[\u06DD\u06DE\u06DA-\u06DC]/g, " ") // ayah/sajdah marks
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => normalizeArabic(w).length > 0);
}

/**
 * Levenshtein distance — used as a tie-breaker for "near match" so that a
 * single-letter pronunciation slip doesn't mark the whole word incorrect.
 */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const m = a.length;
  const n = b.length;
  const prev = new Array(n + 1).fill(0).map((_, i) => i);
  const cur = new Array(n + 1).fill(0);
  for (let i = 1; i <= m; i++) {
    cur[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= n; j++) prev[j] = cur[j];
  }
  return prev[n];
}

/**
 * Returns true if two normalized words are "close enough".
 *
 * Tightened for Quran recitation: every letter matters. We do NOT want a
 * mispronunciation of a short word to silently pass.
 *
 *   maxLen ≤ 4    → exact match required
 *   maxLen 5–7    → ≤ 1 edit allowed (one letter slip on a longer word)
 *   maxLen ≥ 8    → ≤ 2 edits allowed (long word, possible STT slip)
 */
function isCloseMatch(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  if (maxLen <= 4) return dist === 0;
  if (maxLen <= 7) return dist <= 1;
  return dist <= 2;
}

const LOOKAHEAD = 3; // how many expected words to look forward when aligning
                     // (3 is enough — students rarely skip more than 2-3 words
                     //  in a row; smaller window means fewer false "skipped"
                     //  classifications when STT just hears garbage)

/**
 * Align expected verse words with what the student actually transcribed.
 *
 * Greedy walk through expected words. For each transcribed token:
 *  - exact-norm match → mark current as correct
 *  - close match (≤ 1-2 edits) → mark current as correct
 *  - look ahead up to LOOKAHEAD positions → if found, mark intermediates as skipped
 *  - otherwise → mark current as incorrect, advance both
 *
 * Returns per-word statuses + cursor (next pending word) + counts.
 */
export function alignWords(expected: string[], transcribed: string[]): AlignmentResult {
  const N = expected.length;
  const statuses: WordStatus[] = new Array(N).fill("pending");
  const expNorm = expected.map(normalizeArabic);
  const trNorm = transcribed.map(normalizeArabic).filter((s) => s.length > 0);

  let i = 0; // pointer into expected
  let j = 0; // pointer into transcribed

  while (j < trNorm.length && i < N) {
    const cur = trNorm[j];

    if (isCloseMatch(expNorm[i], cur)) {
      statuses[i] = "correct";
      i++;
      j++;
      continue;
    }

    // Look ahead in expected: maybe student skipped one or two words
    let foundOffset = -1;
    for (let k = 1; k <= LOOKAHEAD && i + k < N; k++) {
      if (isCloseMatch(expNorm[i + k], cur)) {
        foundOffset = k;
        break;
      }
    }

    if (foundOffset > 0) {
      for (let k = 0; k < foundOffset; k++) {
        if (statuses[i + k] === "pending") statuses[i + k] = "skipped";
      }
      statuses[i + foundOffset] = "correct";
      i = i + foundOffset + 1;
      j++;
      continue;
    }

    // No match found → student said something not in the next N words
    // Mark expected[i] as incorrect, advance both pointers
    statuses[i] = "incorrect";
    i++;
    j++;
  }

  const cursorIndex = statuses.findIndex((s) => s === "pending");
  return {
    statuses,
    cursorIndex: cursorIndex === -1 ? N : cursorIndex,
    correctCount: statuses.filter((s) => s === "correct").length,
    errorCount: statuses.filter((s) => s === "incorrect").length,
    skippedCount: statuses.filter((s) => s === "skipped").length,
    totalRecited: i,
  };
}

/**
 * Helper: build a flat word list from multiple verses, with a back-pointer
 * to which verse / position each word came from. Used by the renderer.
 */
export interface FlatWord {
  text: string;
  verseNumber: number;
  positionInVerse: number;
  globalIndex: number;
}

export function flattenVerses(
  verses: { number: number; arabic: string }[],
): FlatWord[] {
  const out: FlatWord[] = [];
  let g = 0;
  for (const v of verses) {
    const tokens = tokenizeArabic(v.arabic);
    tokens.forEach((t, idx) => {
      out.push({
        text: t,
        verseNumber: v.number,
        positionInVerse: idx,
        globalIndex: g++,
      });
    });
  }
  return out;
}

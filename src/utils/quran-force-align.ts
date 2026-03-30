/**
 * Force-alignment engine for Quran recitation correction.
 *
 * Inspired by Tarteel AI's approach:
 * 1. Deep Arabic normalisation (remove ALL diacritics, unify letter forms)
 * 2. Force-align spoken words against the flat expected-word stream
 *    using a greedy best-match window instead of strict 1:1 comparison
 * 3. Only flag errors when the best candidate is truly bad
 *
 * This drastically reduces false positives caused by generic STT models
 * that are not fine-tuned for Quranic Arabic.
 */

// ── Arabic normalisation (much more aggressive than the old normalizeArabic) ──

const DIACRITICS_RE = /[\u064B-\u065F\u0670\u06D6-\u06ED\u0610-\u061A\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06EC]/g;
const FORMATTING_RE = /[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g;
const TATWEEL_RE = /\u0640/g; // kashida

const LETTER_MAP: Record<string, string> = {
  "\u0671": "\u0627", // alef wasla → alef
  "\u0622": "\u0627", // alef madda → alef
  "\u0623": "\u0627", // alef hamza above → alef
  "\u0625": "\u0627", // alef hamza below → alef
  "\u0624": "\u0648", // waw hamza → waw
  "\u0626": "\u064A", // ya hamza → ya
  "\u0649": "\u064A", // alef maqsura → ya
  "\u0629": "\u0647", // ta marbuta → ha
  "\u0621": "",        // standalone hamza → remove
};

export function deepNormalizeArabic(text: string): string {
  let s = text;
  s = s.replace(DIACRITICS_RE, "");
  s = s.replace(FORMATTING_RE, "");
  s = s.replace(TATWEEL_RE, "");
  for (const [from, to] of Object.entries(LETTER_MAP)) {
    s = s.replaceAll(from, to);
  }
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

function splitWords(text: string): string[] {
  return deepNormalizeArabic(text).split(" ").filter(Boolean);
}

// ── Levenshtein similarity ──

function levSim(a: string, b: string): number {
  if (a === b) return 1;
  const la = a.length;
  const lb = b.length;
  if (la === 0 || lb === 0) return 0;
  const matrix: number[][] = Array.from({ length: la + 1 }, (_, i) => [i]);
  for (let j = 0; j <= lb; j++) matrix[0][j] = j;
  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }
  return 1 - matrix[la][lb] / Math.max(la, lb);
}

// ── Force-alignment ──

export type WordStatus = "correct" | "wrong" | "pending";

export interface AlignmentResult {
  /** Per-verse array of per-word statuses */
  verseStatuses: Map<number, WordStatus[]>;
  /** Set of verse indices that contain errors */
  errorVerses: Set<number>;
  /** Set of verse indices that have been reached */
  revealedVerses: Set<number>;
  /** Current active verse index */
  activeVerseIndex: number;
  /** Current active word index within the verse */
  activeWordIndex: number;
}

/**
 * Thresholds — tuned to be very forgiving.
 * ElevenLabs generic STT often drops diacritics, merges/splits words,
 * or substitutes visually-similar letters. We only flag a word as wrong
 * when the best candidate similarity is *really* low.
 */
const MATCH_THRESHOLD = 0.55;      // above this → correct
const SKIP_AHEAD_WINDOW = 3;       // look-ahead for the best match

export function forceAlignTranscript(
  verses: { arabic: string }[],
  transcript: string,
): AlignmentResult {
  const spokenWords = splitWords(transcript);
  const verseWordsList = verses.map((v) => splitWords(v.arabic));

  // Flatten all expected words with verse/word indices
  const flatExpected: Array<{ word: string; vi: number; wi: number }> = [];
  for (let vi = 0; vi < verseWordsList.length; vi++) {
    for (let wi = 0; wi < verseWordsList[vi].length; wi++) {
      flatExpected.push({ word: verseWordsList[vi][wi], vi, wi });
    }
  }

  const verseStatuses = new Map<number, WordStatus[]>();
  for (let vi = 0; vi < verseWordsList.length; vi++) {
    verseStatuses.set(vi, verseWordsList[vi].map(() => "pending"));
  }

  const errorVerses = new Set<number>();
  const revealedVerses = new Set<number>([0]);

  let expCursor = 0;
  let spkCursor = 0;

  while (spkCursor < spokenWords.length && expCursor < flatExpected.length) {
    const spoken = spokenWords[spkCursor];

    // Find best match in a window around expCursor
    let bestSim = -1;
    let bestOffset = 0;

    const windowEnd = Math.min(expCursor + SKIP_AHEAD_WINDOW, flatExpected.length);
    for (let k = expCursor; k < windowEnd; k++) {
      const sim = levSim(flatExpected[k].word, spoken);
      if (sim > bestSim) {
        bestSim = sim;
        bestOffset = k - expCursor;
      }
    }

    // Also check if the spoken word might match if we concatenate it with the next spoken word
    // (STT sometimes splits one Arabic word into two)
    if (spkCursor + 1 < spokenWords.length && expCursor < flatExpected.length) {
      const merged = spoken + spokenWords[spkCursor + 1];
      const mergedSim = levSim(flatExpected[expCursor].word, merged);
      if (mergedSim > bestSim && mergedSim >= MATCH_THRESHOLD) {
        // The merged spoken words match the expected word → consume both spoken words
        const { vi, wi } = flatExpected[expCursor];
        revealedVerses.add(vi);
        verseStatuses.get(vi)![wi] = "correct";
        expCursor += 1;
        spkCursor += 2;
        continue;
      }
    }

    // Also check if one spoken word matches two expected words merged
    // (STT sometimes merges two Arabic words into one)
    if (expCursor + 1 < flatExpected.length) {
      const mergedExp = flatExpected[expCursor].word + flatExpected[expCursor + 1].word;
      const mergedExpSim = levSim(mergedExp, spoken);
      if (mergedExpSim > bestSim && mergedExpSim >= MATCH_THRESHOLD) {
        // One spoken word covers two expected words
        for (let m = 0; m < 2; m++) {
          const { vi, wi } = flatExpected[expCursor + m];
          revealedVerses.add(vi);
          verseStatuses.get(vi)![wi] = "correct";
        }
        expCursor += 2;
        spkCursor += 1;
        continue;
      }
    }

    if (bestSim >= MATCH_THRESHOLD) {
      // Mark any skipped expected words as "correct" too (STT may have just
      // not emitted them yet, or they were merged — we give benefit of doubt)
      for (let sk = 0; sk < bestOffset; sk++) {
        const { vi, wi } = flatExpected[expCursor + sk];
        revealedVerses.add(vi);
        // Don't mark skipped as wrong — STT might just not have caught them yet
        // Leave as pending so they don't flash red
      }

      const { vi, wi } = flatExpected[expCursor + bestOffset];
      revealedVerses.add(vi);
      verseStatuses.get(vi)![wi] = "correct";
      expCursor = expCursor + bestOffset + 1;
      spkCursor += 1;
    } else {
      // Truly wrong word — but only flag if we've been at this position for a while
      // Check: does the spoken word match ANY expected word in the next several positions?
      // If not at all, it's likely an STT artefact → skip the spoken word, don't flag error
      const isArtefact = bestSim < 0.3;

      if (isArtefact) {
        // Skip the spoken word entirely — it's noise
        spkCursor += 1;
      } else {
        // Genuinely mispronounced
        const { vi, wi } = flatExpected[expCursor];
        revealedVerses.add(vi);
        verseStatuses.get(vi)![wi] = "wrong";
        errorVerses.add(vi);
        expCursor += 1;
        spkCursor += 1;
      }
    }
  }

  // Determine active position
  let activeVerseIndex = 0;
  let activeWordIndex = 0;

  if (expCursor < flatExpected.length) {
    activeVerseIndex = flatExpected[expCursor].vi;
    activeWordIndex = flatExpected[expCursor].wi;
    revealedVerses.add(activeVerseIndex);
  } else if (flatExpected.length > 0) {
    const last = flatExpected[flatExpected.length - 1];
    activeVerseIndex = last.vi;
    activeWordIndex = last.wi;
  }

  return {
    verseStatuses,
    errorVerses,
    revealedVerses,
    activeVerseIndex,
    activeWordIndex,
  };
}
// Fetch Quran text from the public Quran API (quran.com / api.alquran.cloud)
export interface QuranVerse {
  number: number;
  arabic: string;
  translation: string;
}

export interface SurahInfo {
  number: number;
  name: string;
  nameArabic: string;
  revelationType: string;
  versesCount: number;
}

const QURAN_API = "https://api.alquran.cloud/v1";

// Cache to avoid refetching
const surahCache = new Map<number, QuranVerse[]>();
const surahListCache: SurahInfo[] = [];

export async function fetchSurahList(): Promise<SurahInfo[]> {
  if (surahListCache.length > 0) return surahListCache;

  const res = await fetch(`${QURAN_API}/surah`);
  if (!res.ok) throw new Error("Failed to fetch surah list");
  const data = await res.json();

  const list: SurahInfo[] = data.data.map((s: any) => ({
    number: s.number,
    name: s.englishName,
    nameArabic: s.name,
    revelationType: s.revelationType,
    versesCount: s.numberOfAyahs,
  }));

  surahListCache.push(...list);
  return list;
}

export async function fetchSurahVerses(surahNumber: number): Promise<QuranVerse[]> {
  if (surahCache.has(surahNumber)) return surahCache.get(surahNumber)!;

  // Fetch Arabic + French translation in parallel
  const [arRes, frRes] = await Promise.all([
    fetch(`${QURAN_API}/surah/${surahNumber}/ar.alafasy`),
    fetch(`${QURAN_API}/surah/${surahNumber}/fr.hamidullah`),
  ]);

  if (!arRes.ok || !frRes.ok) throw new Error("Failed to fetch surah verses");

  const arData = await arRes.json();
  const frData = await frRes.json();

  const verses: QuranVerse[] = arData.data.ayahs.map((ayah: any, i: number) => ({
    number: ayah.numberInSurah,
    arabic: ayah.text,
    translation: frData.data.ayahs[i]?.text || "",
  }));

  surahCache.set(surahNumber, verses);
  return verses;
}

// Get Quran page image URL (Medina Mushaf)
export function getMedinaPageUrl(page: number): string {
  const padded = String(page).padStart(3, "0");
  return `https://cdn.islamic.network/quran/images/high-resolution/${padded}.png`;
}

// Normalize Arabic text for comparison (remove diacritics for loose matching)
export function normalizeArabic(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "") // remove tashkeel
    .replace(/\u0671/g, "\u0627") // replace alef wasla
    .replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, "") // remove formatting
    .replace(/\s+/g, " ")
    .trim();
}

// Compare two Arabic strings word by word, return matching status per word
export interface WordMatch {
  expected: string;
  status: "correct" | "wrong" | "pending";
  spoken?: string;
}

export function compareVerseWords(expected: string, spoken: string): WordMatch[] {
  const expectedWords = normalizeArabic(expected).split(" ").filter(Boolean);
  const spokenWords = normalizeArabic(spoken).split(" ").filter(Boolean);

  return expectedWords.map((word, i) => {
    if (i >= spokenWords.length) {
      return { expected: word, status: "pending" as const };
    }
    // Loose match: check if the spoken word is similar enough
    const spokenWord = spokenWords[i];
    const isMatch = word === spokenWord || levenshteinSimilarity(word, spokenWord) > 0.6;
    return {
      expected: word,
      status: isMatch ? ("correct" as const) : ("wrong" as const),
      spoken: spokenWord,
    };
  });
}

function levenshteinSimilarity(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= a.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  const maxLen = Math.max(a.length, b.length);
  return maxLen === 0 ? 1 : 1 - matrix[a.length][b.length] / maxLen;
}

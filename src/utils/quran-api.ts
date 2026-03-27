// Quran API utilities — uses api.alquran.cloud
export interface QuranVerse {
  number: number;
  arabic: string;
  page: number;
  juz: number;
}

export interface SurahInfo {
  number: number;
  name: string;
  nameArabic: string;
  revelationType: string;
  versesCount: number;
}

export interface JuzInfo {
  number: number;
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
}

const QURAN_API = "https://api.alquran.cloud/v1";

// Caches
const surahCache = new Map<number, QuranVerse[]>();
let surahListCache: SurahInfo[] = [];

// Static Juz data (30 juz boundaries)
export const JUZ_DATA: JuzInfo[] = [
  { number: 1, startSurah: 1, startAyah: 1, endSurah: 2, endAyah: 141 },
  { number: 2, startSurah: 2, startAyah: 142, endSurah: 2, endAyah: 252 },
  { number: 3, startSurah: 2, startAyah: 253, endSurah: 3, endAyah: 92 },
  { number: 4, startSurah: 3, startAyah: 93, endSurah: 4, endAyah: 23 },
  { number: 5, startSurah: 4, startAyah: 24, endSurah: 4, endAyah: 147 },
  { number: 6, startSurah: 4, startAyah: 148, endSurah: 5, endAyah: 81 },
  { number: 7, startSurah: 5, startAyah: 82, endSurah: 6, endAyah: 110 },
  { number: 8, startSurah: 6, startAyah: 111, endSurah: 7, endAyah: 87 },
  { number: 9, startSurah: 7, startAyah: 88, endSurah: 8, endAyah: 40 },
  { number: 10, startSurah: 8, startAyah: 41, endSurah: 9, endAyah: 92 },
  { number: 11, startSurah: 9, startAyah: 93, endSurah: 11, endAyah: 5 },
  { number: 12, startSurah: 11, startAyah: 6, endSurah: 12, endAyah: 52 },
  { number: 13, startSurah: 12, startAyah: 53, endSurah: 14, endAyah: 52 },
  { number: 14, startSurah: 15, startAyah: 1, endSurah: 16, endAyah: 128 },
  { number: 15, startSurah: 17, startAyah: 1, endSurah: 18, endAyah: 74 },
  { number: 16, startSurah: 18, startAyah: 75, endSurah: 20, endAyah: 135 },
  { number: 17, startSurah: 21, startAyah: 1, endSurah: 22, endAyah: 78 },
  { number: 18, startSurah: 23, startAyah: 1, endSurah: 25, endAyah: 20 },
  { number: 19, startSurah: 25, startAyah: 21, endSurah: 27, endAyah: 55 },
  { number: 20, startSurah: 27, startAyah: 56, endSurah: 29, endAyah: 45 },
  { number: 21, startSurah: 29, startAyah: 46, endSurah: 33, endAyah: 30 },
  { number: 22, startSurah: 33, startAyah: 31, endSurah: 36, endAyah: 27 },
  { number: 23, startSurah: 36, startAyah: 28, endSurah: 39, endAyah: 31 },
  { number: 24, startSurah: 39, startAyah: 32, endSurah: 41, endAyah: 46 },
  { number: 25, startSurah: 41, startAyah: 47, endSurah: 45, endAyah: 37 },
  { number: 26, startSurah: 46, startAyah: 1, endSurah: 51, endAyah: 30 },
  { number: 27, startSurah: 51, startAyah: 31, endSurah: 57, endAyah: 29 },
  { number: 28, startSurah: 58, startAyah: 1, endSurah: 66, endAyah: 12 },
  { number: 29, startSurah: 67, startAyah: 1, endSurah: 77, endAyah: 50 },
  { number: 30, startSurah: 78, startAyah: 1, endSurah: 114, endAyah: 6 },
];

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

  surahListCache = list;
  return list;
}

export async function fetchSurahVerses(surahNumber: number): Promise<QuranVerse[]> {
  if (surahCache.has(surahNumber)) return surahCache.get(surahNumber)!;

  // Fetch Arabic text only (no French translation)
  const res = await fetch(`${QURAN_API}/surah/${surahNumber}/ar.alafasy`);
  if (!res.ok) throw new Error("Failed to fetch surah verses");

  const data = await res.json();

  const verses: QuranVerse[] = data.data.ayahs.map((ayah: any) => ({
    number: ayah.numberInSurah,
    arabic: ayah.text,
    page: ayah.page,
    juz: ayah.juz,
  }));

  surahCache.set(surahNumber, verses);
  return verses;
}

// Fetch a specific Juz from API
export async function fetchJuzVerses(juzNumber: number): Promise<QuranVerse[]> {
  const res = await fetch(`${QURAN_API}/juz/${juzNumber}/quran-uthmani`);
  if (!res.ok) throw new Error("Failed to fetch juz");
  const data = await res.json();

  return data.data.ayahs.map((ayah: any) => ({
    number: ayah.numberInSurah,
    arabic: ayah.text,
    page: ayah.page,
    juz: ayah.juz,
  }));
}

// Get Quran page image URL (Medina Mushaf) — high resolution
export function getMedinaPageUrl(page: number): string {
  const padded = String(page).padStart(3, "0");
  return `https://cdn.islamic.network/quran/images/high-resolution/${padded}.png`;
}

// Search for a verse by text across all surahs
export async function searchVerse(query: string): Promise<{ surah: number; ayah: number; text: string; page: number }[]> {
  const normalized = normalizeArabic(query);
  if (normalized.length < 3) return [];

  const res = await fetch(`${QURAN_API}/search/${encodeURIComponent(query)}/all/ar.alafasy`);
  if (!res.ok) return [];
  const data = await res.json();

  if (!data.data?.matches) return [];

  return data.data.matches.slice(0, 20).map((m: any) => ({
    surah: m.surah.number,
    ayah: m.numberInSurah,
    text: m.text,
    page: m.page || 1,
  }));
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

// Compare two Arabic strings word by word
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
  for (let i = 0; i <= a.length; i++) matrix[i] = [i];
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
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

// Get pages for a given surah (approximate mapping)
export function getSurahStartPage(surahNumber: number): number {
  // Known start pages for each surah in the Medina Mushaf
  const SURAH_PAGES: Record<number, number> = {
    1:1,2:2,3:50,4:77,5:106,6:128,7:151,8:177,9:187,10:208,
    11:221,12:235,13:249,14:255,15:262,16:267,17:282,18:293,19:305,20:312,
    21:322,22:332,23:342,24:350,25:359,26:367,27:377,28:385,29:396,30:404,
    31:411,32:415,33:418,34:428,35:434,36:440,37:446,38:453,39:458,40:467,
    41:477,42:483,43:489,44:496,45:499,46:502,47:507,48:511,49:515,50:518,
    51:520,52:523,53:526,54:528,55:531,56:534,57:537,58:542,59:545,60:549,
    61:551,62:553,63:554,64:556,65:558,66:560,67:562,68:564,69:566,70:568,
    71:570,72:572,73:574,74:575,75:577,76:578,77:580,78:582,79:583,80:585,
    81:586,82:587,83:587,84:589,85:590,86:591,87:591,88:592,89:593,90:594,
    91:595,92:595,93:596,94:596,95:597,96:597,97:598,98:598,99:599,100:599,
    101:600,102:600,103:601,104:601,105:601,106:602,107:602,108:602,109:603,
    110:603,111:603,112:604,113:604,114:604,
  };
  return SURAH_PAGES[surahNumber] || 1;
}

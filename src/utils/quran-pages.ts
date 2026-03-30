const QURAN_API = "https://api.alquran.cloud/v1";

export interface QuranPageAyah {
  id: string;
  surahNumber: number;
  surahNameArabic: string;
  ayahNumber: number;
  text: string;
}

const pageCache = new Map<number, QuranPageAyah[]>();

export async function fetchQuranPageAyahs(page: number): Promise<QuranPageAyah[]> {
  if (pageCache.has(page)) {
    return pageCache.get(page)!;
  }

  const response = await fetch(`${QURAN_API}/page/${page}/quran-uthmani`);
  if (!response.ok) {
    throw new Error("Impossible de charger la page du Mushaf");
  }

  const data = await response.json();
  const ayahs: QuranPageAyah[] = data.data.ayahs.map((ayah: any) => ({
    id: `${page}-${ayah.surah.number}-${ayah.numberInSurah}`,
    surahNumber: ayah.surah.number,
    surahNameArabic: ayah.surah.name,
    ayahNumber: ayah.numberInSurah,
    text: ayah.text,
  }));

  pageCache.set(page, ayahs);
  return ayahs;
}
// Professional Quran recitation audio from everyayah.com
// Provides per-ayah audio from famous reciters

export interface Reciter {
  id: string;
  name: string;
  nameArabic: string;
  subfolder: string;
}

export const RECITERS: Reciter[] = [
  {
    id: "mishary",
    name: "Mishary Rashid Alafasy",
    nameArabic: "مشاري راشد العفاسي",
    subfolder: "Alafasy_128kbps",
  },
  {
    id: "husary",
    name: "Mahmoud Khalil Al-Husary",
    nameArabic: "محمود خليل الحصري",
    subfolder: "Husary_128kbps",
  },
  {
    id: "minshawi",
    name: "Mohamed Siddiq Al-Minshawi",
    nameArabic: "محمد صديق المنشاوي",
    subfolder: "Minshawy_Murattal_128kbps",
  },
  {
    id: "abdulbasit",
    name: "Abdul Basit Abdul Samad",
    nameArabic: "عبد الباسط عبد الصمد",
    subfolder: "Abdul_Basit_Murattal_192kbps",
  },
  {
    id: "sudais",
    name: "Abdurrahman As-Sudais",
    nameArabic: "عبد الرحمن السديس",
    subfolder: "Abdurrahmaan_As-Sudais_192kbps",
  },
];

const BASE_URL = "https://everyayah.com/data";

/**
 * Get the audio URL for a specific ayah from a professional reciter.
 * Format: https://everyayah.com/data/{subfolder}/{surah_padded}{ayah_padded}.mp3
 */
export function getAyahAudioUrl(
  surahNumber: number,
  ayahNumber: number,
  reciterId: string = "mishary"
): string {
  const reciter = RECITERS.find((r) => r.id === reciterId) || RECITERS[0];
  const surah = String(surahNumber).padStart(3, "0");
  const ayah = String(ayahNumber).padStart(3, "0");
  return `${BASE_URL}/${reciter.subfolder}/${surah}${ayah}.mp3`;
}

/**
 * Play a single ayah from a professional reciter.
 * Returns the HTMLAudioElement for control.
 */
export function playAyahAudio(
  surahNumber: number,
  ayahNumber: number,
  reciterId: string = "mishary"
): HTMLAudioElement {
  const url = getAyahAudioUrl(surahNumber, ayahNumber, reciterId);
  const audio = new Audio(url);
  audio.play().catch((e) => console.warn("Audio playback failed:", e));
  return audio;
}

/**
 * Play multiple ayahs sequentially from a professional reciter.
 * Returns a stop function.
 */
export function playAyahSequence(
  surahNumber: number,
  ayahStart: number,
  ayahEnd: number,
  reciterId: string = "mishary",
  onAyahChange?: (ayahNumber: number) => void
): { stop: () => void } {
  let currentAudio: HTMLAudioElement | null = null;
  let stopped = false;
  let currentAyah = ayahStart;

  const playNext = () => {
    if (stopped || currentAyah > ayahEnd) return;
    onAyahChange?.(currentAyah);
    const url = getAyahAudioUrl(surahNumber, currentAyah, reciterId);
    currentAudio = new Audio(url);
    currentAudio.addEventListener("ended", () => {
      currentAyah++;
      playNext();
    });
    currentAudio.addEventListener("error", () => {
      currentAyah++;
      playNext();
    });
    currentAudio.play().catch(() => {
      currentAyah++;
      playNext();
    });
  };

  playNext();

  return {
    stop: () => {
      stopped = true;
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
    },
  };
}

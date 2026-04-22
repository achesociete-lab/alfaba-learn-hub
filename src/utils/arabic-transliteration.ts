// Translittération basique arabe → latin pour TTS français fluide
// Stratégie : on ne lit pas en arabe via ElevenLabs (souvent peu naturel mélangé au français),
// on convertit chaque mot arabe en sa forme latine approximative, lisible par une voix française.

const HARAKAT = /[\u064B-\u0652\u0670\u0640]/g; // tashkeel + tatweel

const LETTER_MAP: Record<string, string> = {
  "ا": "a", "أ": "a", "إ": "i", "آ": "aa", "ٱ": "a",
  "ب": "b",
  "ت": "t", "ة": "a",
  "ث": "th",
  "ج": "j",
  "ح": "h",
  "خ": "kh",
  "د": "d",
  "ذ": "dh",
  "ر": "r",
  "ز": "z",
  "س": "s",
  "ش": "ch",
  "ص": "s",
  "ض": "d",
  "ط": "t",
  "ظ": "z",
  "ع": "a",
  "غ": "gh",
  "ف": "f",
  "ق": "q",
  "ك": "k",
  "ل": "l",
  "م": "m",
  "ن": "n",
  "ه": "h",
  "و": "ou",
  "ي": "i", "ى": "a", "ئ": "i",
  "ء": "",
  "ؤ": "ou",
  // Chiffres arabes
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
  "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
};

// Voyelles courtes (harakat) — on les conserve via un second passage
const HARAKA_MAP: Record<string, string> = {
  "\u064E": "a",   // fatha
  "\u064F": "ou",  // damma
  "\u0650": "i",   // kasra
  "\u064B": "an",  // fathatan
  "\u064C": "oun", // dammatan
  "\u064D": "in",  // kasratan
  "\u0652": "",    // sukoun
  "\u0651": "DBL", // shadda — marque pour doublement
  "\u0670": "a",   // alif khanjariya
};

function transliterateArabicWord(word: string): string {
  let out = "";
  for (let i = 0; i < word.length; i++) {
    const ch = word[i];
    if (HARAKA_MAP[ch] !== undefined) {
      if (HARAKA_MAP[ch] === "DBL" && out.length > 0) {
        // doubler la dernière consonne
        out += out[out.length - 1];
      } else {
        out += HARAKA_MAP[ch];
      }
    } else if (LETTER_MAP[ch] !== undefined) {
      out += LETTER_MAP[ch];
    } else {
      out += ch;
    }
  }
  // nettoyage : retirer doublons "aa" en fin, etc.
  out = out.replace(/([aiou])\1+/g, "$1$1");
  return out;
}

const ARABIC_BLOCK = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

/**
 * Remplace chaque mot arabe d'un texte mixte (français + arabe) par sa translittération latine,
 * pour permettre une lecture TTS française fluide.
 */
export function transliterateArabicInText(text: string): string {
  if (!text) return "";
  // Découper en tokens (mots et espaces) tout en gardant la ponctuation
  return text.replace(/(\S+)/g, (token) => {
    if (ARABIC_BLOCK.test(token)) {
      return transliterateArabicWord(token);
    }
    return token;
  });
}

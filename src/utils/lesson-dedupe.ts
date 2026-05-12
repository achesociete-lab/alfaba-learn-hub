// Dédup inter-modules pour les leçons hors présentiel.
// Une même question / mot / phrase ne doit apparaître qu'une seule fois
// dans tous les modules d'une leçon (théorie → QCM → dictée).

const ARABIC_DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u08D3-\u08FF]/g;

export function normKey(input: unknown): string {
  if (input == null) return "";
  return String(input)
    .normalize("NFD")
    .replace(ARABIC_DIACRITICS, "")
    .replace(/[\u0640]/g, "") // tatweel
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .toLowerCase();
}

interface QcmItem { question: string; options: string[]; correctIndex: number; explanation?: string }
interface DictItem { options: string[]; correctIndex: number }

function keyForQcm(q: QcmItem): string {
  return normKey(q.question) + "::" + normKey(q.options?.[q.correctIndex]);
}
function keyForDict(d: DictItem): string {
  return "dict::" + normKey(d.options?.[d.correctIndex]);
}

export function dedupeQcmList<T extends QcmItem>(list: T[], seen: Set<string>): T[] {
  const out: T[] = [];
  for (const q of list) {
    const k = keyForQcm(q);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(q);
  }
  return out;
}

export function dedupeDictList<T extends DictItem>(list: T[], seen: Set<string>): T[] {
  const out: T[] = [];
  for (const d of list) {
    const k = keyForDict(d);
    const wordKey = normKey(d.options?.[d.correctIndex]);
    if (!wordKey || seen.has(k) || seen.has(wordKey)) continue;
    seen.add(k);
    seen.add(wordKey);
    out.push(d);
  }
  return out;
}

// Helper Niveau 1: dédup qcm puis dictée
export function dedupeNiveau1<T extends QcmItem, D extends DictItem>(qcm: T[], dictation: D[]) {
  const seen = new Set<string>();
  const dedupQcm = dedupeQcmList(qcm || [], seen);
  // Marque aussi les bonnes réponses de QCM pour éviter les doublons en dictée
  for (const q of dedupQcm) {
    const w = normKey(q.options?.[q.correctIndex]);
    if (w) seen.add(w);
  }
  const dedupDict = dedupeDictList(dictation || [], seen);
  return { qcm: dedupQcm, dictation: dedupDict };
}

// Helper Niveau 2: comprehension + qcm puis dictée
export function dedupeNiveau2<T extends QcmItem, D extends DictItem>(
  comprehension: T[],
  qcm: T[],
  dictation: D[],
) {
  const seen = new Set<string>();
  const dedupComp = dedupeQcmList(comprehension || [], seen);
  const dedupQcm = dedupeQcmList(qcm || [], seen);
  for (const q of [...dedupComp, ...dedupQcm]) {
    const w = normKey(q.options?.[q.correctIndex]);
    if (w) seen.add(w);
  }
  const dedupDict = dedupeDictList(dictation || [], seen);
  return { comprehension: dedupComp, qcm: dedupQcm, dictation: dedupDict };
}

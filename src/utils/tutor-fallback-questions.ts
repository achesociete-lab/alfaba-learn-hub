// Banque locale de questions de secours (si l'IA est lente ou indisponible).
// Style Duolingo : la réponse n'est JAMAIS visuellement identique au display.
import type { TutorQuestion } from "@/types/tutor";

export const FALLBACK_QUESTIONS: TutorQuestion[] = [
  // Nom de la lettre
  { type: "mcq", prompt_fr: "Quel est le nom de cette lettre ?", display: "ب", choices: ["Bâ", "Tâ", "Thâ", "Jîm"], correct_index: 0 },
  { type: "mcq", prompt_fr: "Quel est le nom de cette lettre ?", display: "ت", choices: ["Bâ", "Tâ", "Mîm", "Nûn"], correct_index: 1 },
  { type: "mcq", prompt_fr: "Quel est le nom de cette lettre ?", display: "م", choices: ["Lâm", "Nûn", "Mîm", "Hâ"], correct_index: 2 },
  { type: "mcq", prompt_fr: "Quel est le nom de cette lettre ?", display: "ك", choices: ["Qâf", "Kâf", "Fâ", "Sîn"], correct_index: 1 },
  // Son
  { type: "mcq", prompt_fr: "Comment se prononce cette lettre ?", display: "س", choices: ["sa", "cha", "sa (emphatique)", "za"], correct_index: 0 },
  { type: "mcq", prompt_fr: "Comment se prononce cette lettre ?", display: "ش", choices: ["sa", "cha", "tha", "ja"], correct_index: 1 },
  // Lettre en rouge dans un mot
  { type: "mcq", prompt_fr: "Quelle lettre est en rouge ?", display: "كَتَبَ", highlight: "ت", choices: ["Kâf", "Tâ", "Bâ", "Mîm"], correct_index: 1 },
  { type: "mcq", prompt_fr: "Quelle lettre est en rouge ?", display: "قَلَم", highlight: "ل", choices: ["Qâf", "Lâm", "Mîm", "Nûn"], correct_index: 1 },
  // Traduction
  { type: "mcq", prompt_fr: "Que signifie ce mot ?", display: "كِتَاب", choices: ["Stylo", "Livre", "Maison", "Porte"], correct_index: 1 },
  { type: "mcq", prompt_fr: "Quel est le mot arabe pour « Maison » ?", display: "Maison", choices: ["قَلَم", "بَيْت", "بَاب", "كَلْب"], correct_index: 1 },
];

export function getRandomFallbackQuestion(exclude: Set<string> = new Set()): TutorQuestion {
  const available = FALLBACK_QUESTIONS.filter((q) => !exclude.has(q.display));
  const pool = available.length > 0 ? available : FALLBACK_QUESTIONS;
  return pool[Math.floor(Math.random() * pool.length)];
}

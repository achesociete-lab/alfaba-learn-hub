// 28 progressive Arabic alphabet lessons for Niveau 1
// Each lesson builds on previous letters for progressive learning

export interface LetterForm {
  isolated: string;
  initial: string;
  medial: string;
  final: string;
}

export interface LessonExample {
  arabic: string;
  transliteration: string;
  meaning: string;
}

export interface LessonQCM {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface DictationItem {
  word: string;
  transliteration: string;
  options: string[];
  correctIndex: number;
}

export interface Lesson {
  id: number;
  letter: string;
  name: string;
  transliteration: string;
  pronunciation: string;
  forms: LetterForm;
  description: string;
  vowelExamples: { withFatha: string; withDamma: string; withKasra: string };
  examples: LessonExample[];
  qcm: LessonQCM[];
  dictation: DictationItem[];
}

export const niveau1Lessons: Lesson[] = [
  // ─── Leçon 1 : Alif ───
  {
    id: 1,
    letter: "ا",
    name: "Alif",
    transliteration: "a",
    pronunciation: "Comme le 'a' français. L'Alif est un support pour les voyelles (hamza) et peut aussi être une voyelle longue.",
    forms: { isolated: "ا", initial: "ا", medial: "ـا", final: "ـا" },
    description: "L'Alif est la première lettre de l'alphabet arabe. C'est une lettre spéciale car elle sert de support pour la hamza (أ) et comme voyelle longue 'â'. Elle ne se lie jamais à la lettre suivante.",
    vowelExamples: { withFatha: "أَ", withDamma: "أُ", withKasra: "إِ" },
    examples: [
      { arabic: "أَنَا", transliteration: "anâ", meaning: "je / moi" },
      { arabic: "أَبٌ", transliteration: "ab", meaning: "père" },
      { arabic: "أُمٌّ", transliteration: "umm", meaning: "mère" },
      { arabic: "أَخٌ", transliteration: "akh", meaning: "frère" },
      { arabic: "أُخْتٌ", transliteration: "ukht", meaning: "sœur" },
      { arabic: "أَسَدٌ", transliteration: "asad", meaning: "lion" },
      { arabic: "أَرْضٌ", transliteration: "arḍ", meaning: "terre" },
      { arabic: "أَمَلٌ", transliteration: "amal", meaning: "espoir" },
      { arabic: "إِسْلَامٌ", transliteration: "islâm", meaning: "islam" },
      { arabic: "أَكْلٌ", transliteration: "akl", meaning: "nourriture" },
    ],
    qcm: [
      { question: "Quel est le nom de cette lettre : ا ?", options: ["Ba", "Alif", "Ta", "Tha"], correctIndex: 1, explanation: "C'est la lettre Alif (ا), la première de l'alphabet arabe." },
      { question: "L'Alif se lie-t-elle à la lettre qui la suit ?", options: ["Oui, toujours", "Non, jamais", "Parfois", "Seulement en début de mot"], correctIndex: 1, explanation: "L'Alif ne se lie jamais à la lettre suivante, c'est une lettre non-liante." },
      { question: "Que signifie أَنَا ?", options: ["Toi", "Lui", "Moi / Je", "Nous"], correctIndex: 2, explanation: "أَنَا (anâ) signifie 'je' ou 'moi' en arabe." },
    ],
    dictation: [
      { word: "أَبٌ", transliteration: "ab (père)", options: ["أَبٌ", "إِبٌ", "أُبٌ", "آبٌ"], correctIndex: 0 },
      { word: "أُمٌّ", transliteration: "umm (mère)", options: ["أَمٌّ", "إِمٌّ", "أُمٌّ", "آمٌّ"], correctIndex: 2 },
    ],
  },

  // ─── Leçon 2 : Ba ───
  {
    id: 2,
    letter: "ب",
    name: "Ba",
    transliteration: "b",
    pronunciation: "Comme le 'b' français dans 'bateau'.",
    forms: { isolated: "ب", initial: "بـ", medial: "ـبـ", final: "ـب" },
    description: "Le Ba est la deuxième lettre de l'alphabet. Elle a un point en dessous et se prononce comme le 'b' français. Elle se lie dans les deux sens.",
    vowelExamples: { withFatha: "بَ", withDamma: "بُ", withKasra: "بِ" },
    examples: [
      { arabic: "بَابٌ", transliteration: "bâb", meaning: "porte" },
      { arabic: "أَبٌ", transliteration: "ab", meaning: "père" },
      { arabic: "بَابَا", transliteration: "bâbâ", meaning: "papa" },
      { arabic: "بَحْرٌ", transliteration: "baḥr", meaning: "mer" },
      { arabic: "بَيْتٌ", transliteration: "bayt", meaning: "maison" },
      { arabic: "بِنْتٌ", transliteration: "bint", meaning: "fille" },
      { arabic: "كِتَابٌ", transliteration: "kitâb", meaning: "livre" },
      { arabic: "بَطَلٌ", transliteration: "baṭal", meaning: "héros" },
      { arabic: "بَلَدٌ", transliteration: "balad", meaning: "pays" },
      { arabic: "بَقَرَةٌ", transliteration: "baqarah", meaning: "vache" },
    ],
    qcm: [
      { question: "Quel est le nom de cette lettre : ب ?", options: ["Ta", "Ba", "Nun", "Ya"], correctIndex: 1, explanation: "C'est la lettre Ba (ب), reconnaissable à son point en dessous." },
      { question: "Combien de points a la lettre Ba ?", options: ["Aucun", "Un en dessous", "Deux en dessus", "Trois en dessus"], correctIndex: 1, explanation: "Le Ba (ب) a un seul point en dessous." },
      { question: "Que signifie بَابٌ ?", options: ["Père", "Maison", "Porte", "Livre"], correctIndex: 2, explanation: "بَابٌ (bâb) signifie 'porte' en arabe." },
    ],
    dictation: [
      { word: "بَابٌ", transliteration: "bâb (porte)", options: ["بَابٌ", "بِيبٌ", "تَابٌ", "بَبٌ"], correctIndex: 0 },
      { word: "أَبٌ", transliteration: "ab (père)", options: ["إِبٌ", "أَبٌ", "أُبٌ", "بَأٌ"], correctIndex: 1 },
    ],
  },

  // ─── Leçon 3 : Ta ───
  {
    id: 3,
    letter: "ت",
    name: "Ta",
    transliteration: "t",
    pronunciation: "Comme le 't' français dans 'table'.",
    forms: { isolated: "ت", initial: "تـ", medial: "ـتـ", final: "ـت" },
    description: "Le Ta ressemble au Ba mais a deux points au-dessus. Il se prononce comme le 't' français.",
    vowelExamples: { withFatha: "تَ", withDamma: "تُ", withKasra: "تِ" },
    examples: [
      { arabic: "تَابَ", transliteration: "tâba", meaning: "il s'est repenti" },
      { arabic: "بِنْتٌ", transliteration: "bint", meaning: "fille" },
      { arabic: "بَيْتٌ", transliteration: "bayt", meaning: "maison" },
      { arabic: "تُفَّاحٌ", transliteration: "tuffâḥ", meaning: "pomme" },
      { arabic: "تَمْرٌ", transliteration: "tamr", meaning: "datte" },
      { arabic: "تِلْمِيذٌ", transliteration: "tilmîdh", meaning: "élève" },
      { arabic: "تَحْتَ", transliteration: "taḥta", meaning: "sous" },
      { arabic: "وَقْتٌ", transliteration: "waqt", meaning: "temps" },
      { arabic: "تُرَابٌ", transliteration: "turâb", meaning: "terre / poussière" },
      { arabic: "تِينٌ", transliteration: "tîn", meaning: "figue" },
    ],
    qcm: [
      { question: "Quel est le nom de cette lettre : ت ?", options: ["Ba", "Tha", "Ta", "Nun"], correctIndex: 2, explanation: "C'est la lettre Ta (ت), avec deux points au-dessus." },
      { question: "Quelle est la différence entre ب et ت ?", options: ["Le nombre de points", "La taille", "La forme", "Rien"], correctIndex: 0, explanation: "Le Ba a un point en dessous, le Ta a deux points au-dessus." },
      { question: "Que signifie بَيْتٌ ?", options: ["Porte", "Fille", "Maison", "Père"], correctIndex: 2, explanation: "بَيْتٌ (bayt) signifie 'maison' en arabe." },
    ],
    dictation: [
      { word: "بِنْتٌ", transliteration: "bint (fille)", options: ["بِنْتٌ", "تِنْبٌ", "بَنْتٌ", "بِنْبٌ"], correctIndex: 0 },
      { word: "تَابَ", transliteration: "tâba (il s'est repenti)", options: ["بَاتَ", "تَابَ", "تَبَا", "بَتَا"], correctIndex: 1 },
    ],
  },

  // ─── Leçon 4 : Tha ───
  {
    id: 4,
    letter: "ث",
    name: "Tha",
    transliteration: "th",
    pronunciation: "Comme le 'th' anglais dans 'think'. On place la langue entre les dents.",
    forms: { isolated: "ث", initial: "ثـ", medial: "ـثـ", final: "ـث" },
    description: "Le Tha a la même forme que le Ba et le Ta mais avec trois points au-dessus. Sa prononciation est interdentale (la langue entre les dents).",
    vowelExamples: { withFatha: "ثَ", withDamma: "ثُ", withKasra: "ثِ" },
    examples: [
      { arabic: "ثَابِتٌ", transliteration: "thâbit", meaning: "ferme / stable" },
      { arabic: "ثَلَاثَةٌ", transliteration: "thalâthatun", meaning: "trois" },
      { arabic: "ثَوْبٌ", transliteration: "thawb", meaning: "vêtement" },
      { arabic: "ثَعْلَبٌ", transliteration: "tha'lab", meaning: "renard" },
      { arabic: "ثَلْجٌ", transliteration: "thalj", meaning: "neige" },
      { arabic: "ثُمَّ", transliteration: "thumma", meaning: "ensuite" },
      { arabic: "ثَمَنٌ", transliteration: "thaman", meaning: "prix" },
      { arabic: "ثَقِيلٌ", transliteration: "thaqîl", meaning: "lourd" },
      { arabic: "ثَرْوَةٌ", transliteration: "tharwah", meaning: "richesse" },
      { arabic: "أَثَاثٌ", transliteration: "athâth", meaning: "meubles" },
    ],
    qcm: [
      { question: "Combien de points a la lettre ث ?", options: ["Un", "Deux", "Trois", "Aucun"], correctIndex: 2, explanation: "Le Tha (ث) a trois points au-dessus." },
      { question: "Comment se prononce ث ?", options: ["Comme le 's'", "Comme le 'th' anglais de 'think'", "Comme le 'f'", "Comme le 'z'"], correctIndex: 1, explanation: "Le Tha se prononce comme le 'th' anglais dans 'think', c'est un son interdental." },
      { question: "Quelle lettre a trois points au-dessus : ب، ت، ث ?", options: ["ب", "ت", "ث", "Aucune"], correctIndex: 2, explanation: "ث (Tha) est la lettre avec trois points au-dessus." },
    ],
    dictation: [
      { word: "ثَابِتٌ", transliteration: "thâbit (ferme)", options: ["تَابِتٌ", "ثَابِتٌ", "ثَبِيتٌ", "بَاثِتٌ"], correctIndex: 1 },
      { word: "ثَلَاثَةٌ", transliteration: "thalâthatun (trois)", options: ["تَلَاثَةٌ", "ثَلَاثَةٌ", "ثَلَاتَةٌ", "تَلَاتَةٌ"], correctIndex: 1 },
    ],
  },

  // ─── Leçon 5 : Jim ───
  {
    id: 5,
    letter: "ج",
    name: "Jim",
    transliteration: "j",
    pronunciation: "Comme le 'j' français dans 'jardin'.",
    forms: { isolated: "ج", initial: "جـ", medial: "ـجـ", final: "ـج" },
    description: "Le Jim a une forme arrondie avec un point au milieu. Il se prononce comme le 'j' français. Nouvelle forme à bien distinguer des précédentes.",
    vowelExamples: { withFatha: "جَ", withDamma: "جُ", withKasra: "جِ" },
    examples: [
      { arabic: "جَابَ", transliteration: "jâba", meaning: "il a apporté" },
      { arabic: "جَبَلٌ", transliteration: "jabal", meaning: "montagne" },
      { arabic: "جَمَلٌ", transliteration: "jamal", meaning: "chameau" },
      { arabic: "جَنَّةٌ", transliteration: "jannah", meaning: "paradis" },
      { arabic: "جَدِيدٌ", transliteration: "jadîd", meaning: "nouveau" },
      { arabic: "جَمِيلٌ", transliteration: "jamîl", meaning: "beau" },
      { arabic: "رَجُلٌ", transliteration: "rajul", meaning: "homme" },
      { arabic: "جُمْلَةٌ", transliteration: "jumlah", meaning: "phrase" },
      { arabic: "جِسْمٌ", transliteration: "jism", meaning: "corps" },
      { arabic: "جَوَابٌ", transliteration: "jawâb", meaning: "réponse" },
    ],
    qcm: [
      { question: "Quel est le nom de cette lettre : ج ?", options: ["Ha", "Jim", "Kha", "Ayn"], correctIndex: 1, explanation: "C'est la lettre Jim (ج)." },
      { question: "Que signifie جَبَلٌ ?", options: ["Porte", "Montagne", "Maison", "Père"], correctIndex: 1, explanation: "جَبَلٌ (jabal) signifie 'montagne'." },
      { question: "Où se trouve le point du Jim ?", options: ["Au-dessus", "En dessous", "Au milieu", "Il n'a pas de point"], correctIndex: 2, explanation: "Le Jim a un point au milieu de sa forme." },
    ],
    dictation: [
      { word: "جَابَ", transliteration: "jâba (il a apporté)", options: ["جَبَا", "جَابَ", "حَابَ", "خَابَ"], correctIndex: 1 },
      { word: "جَبَلٌ", transliteration: "jabal (montagne)", options: ["جَلَبٌ", "جَبَلٌ", "حَبَلٌ", "جَبَتٌ"], correctIndex: 1 },
    ],
  },

  // ─── Leçon 6 : Ha (pharyngale) ───
  {
    id: 6,
    letter: "ح",
    name: "Ha",
    transliteration: "ḥ",
    pronunciation: "Son pharyngal sans équivalent en français. C'est un souffle venant de la gorge, plus fort qu'un simple 'h'.",
    forms: { isolated: "ح", initial: "حـ", medial: "ـحـ", final: "ـح" },
    description: "Le Ha pharyngal a la même forme que le Jim mais sans point. C'est un son guttural profond spécifique à l'arabe.",
    vowelExamples: { withFatha: "حَ", withDamma: "حُ", withKasra: "حِ" },
    examples: [
      { arabic: "حُبٌّ", transliteration: "ḥubb", meaning: "amour" },
      { arabic: "بَحْثٌ", transliteration: "baḥth", meaning: "recherche" },
      { arabic: "حَلِيبٌ", transliteration: "ḥalîb", meaning: "lait" },
      { arabic: "حَيَاةٌ", transliteration: "ḥayâh", meaning: "vie" },
      { arabic: "حَقٌّ", transliteration: "ḥaqq", meaning: "vérité / droit" },
      { arabic: "حَجَرٌ", transliteration: "ḥajar", meaning: "pierre" },
      { arabic: "حِصَانٌ", transliteration: "ḥiṣân", meaning: "cheval" },
      { arabic: "حَدِيقَةٌ", transliteration: "ḥadîqah", meaning: "jardin" },
      { arabic: "حَرَامٌ", transliteration: "ḥarâm", meaning: "interdit" },
      { arabic: "حَلَالٌ", transliteration: "ḥalâl", meaning: "licite / permis" },
    ],
    qcm: [
      { question: "Quelle est la différence entre ج et ح ?", options: ["La forme", "Le point : ج a un point, ح non", "La taille", "Rien"], correctIndex: 1, explanation: "Le Jim (ج) a un point, le Ha (ح) n'en a pas." },
      { question: "Comment se prononce ح ?", options: ["Comme un 'h' aspiré doux", "Comme un souffle guttural profond", "Comme le 'k'", "Comme le 'g'"], correctIndex: 1, explanation: "Le Ha (ح) est un son pharyngal profond, plus fort qu'un simple 'h'." },
    ],
    dictation: [
      { word: "حُبٌّ", transliteration: "ḥubb (amour)", options: ["جُبٌّ", "حُبٌّ", "خُبٌّ", "حُتٌّ"], correctIndex: 1 },
      { word: "بَحْثٌ", transliteration: "baḥth (recherche)", options: ["بَحْثٌ", "بَجْثٌ", "بَخْثٌ", "تَحْثٌ"], correctIndex: 0 },
    ],
  },

  // ─── Leçon 7 : Kha ───
  {
    id: 7,
    letter: "خ",
    name: "Kha",
    transliteration: "kh",
    pronunciation: "Comme la 'jota' espagnole ou le 'ch' allemand dans 'Bach'. Son vélaire fricatif.",
    forms: { isolated: "خ", initial: "خـ", medial: "ـخـ", final: "ـخ" },
    description: "Le Kha a la même forme que le Jim et le Ha, mais avec un point au-dessus. Ces trois lettres (ج ح خ) forment une famille de formes.",
    vowelExamples: { withFatha: "خَ", withDamma: "خُ", withKasra: "خِ" },
    examples: [
      { arabic: "خُبْزٌ", transliteration: "khubz", meaning: "pain" },
      { arabic: "أَخٌ", transliteration: "akh", meaning: "frère" },
      { arabic: "خَيْرٌ", transliteration: "khayr", meaning: "bien / bonté" },
      { arabic: "خَمْسَةٌ", transliteration: "khamsah", meaning: "cinq" },
      { arabic: "خَوْفٌ", transliteration: "khawf", meaning: "peur" },
      { arabic: "خَشَبٌ", transliteration: "khashab", meaning: "bois" },
      { arabic: "تَارِيخٌ", transliteration: "târîkh", meaning: "histoire / date" },
      { arabic: "مَطْبَخٌ", transliteration: "maṭbakh", meaning: "cuisine" },
      { arabic: "خَاتَمٌ", transliteration: "khâtam", meaning: "bague" },
      { arabic: "خَرُوفٌ", transliteration: "kharûf", meaning: "mouton" },
    ],
    qcm: [
      { question: "Quelle lettre a un point au-dessus parmi ج ح خ ?", options: ["ج", "ح", "خ", "Aucune"], correctIndex: 2, explanation: "Le Kha (خ) a un point au-dessus." },
      { question: "Que signifie خُبْزٌ ?", options: ["Eau", "Pain", "Lait", "Fruit"], correctIndex: 1, explanation: "خُبْزٌ (khubz) signifie 'pain'." },
      { question: "Les lettres ج ح خ ont la même forme de base.", options: ["Vrai", "Faux"], correctIndex: 0, explanation: "Ces trois lettres partagent la même forme de base, seuls les points diffèrent." },
    ],
    dictation: [
      { word: "خُبْزٌ", transliteration: "khubz (pain)", options: ["حُبْزٌ", "خُبْزٌ", "جُبْزٌ", "خُبْتٌ"], correctIndex: 1 },
      { word: "أَخٌ", transliteration: "akh (frère)", options: ["أَحٌ", "أَخٌ", "أَجٌ", "إِخٌ"], correctIndex: 1 },
    ],
  },

  // ─── Leçon 8 : Dal ───
  {
    id: 8,
    letter: "د",
    name: "Dal",
    transliteration: "d",
    pronunciation: "Comme le 'd' français dans 'dent'.",
    forms: { isolated: "د", initial: "د", medial: "ـد", final: "ـد" },
    description: "Le Dal est une lettre non-liante (comme l'Alif) : elle ne se lie pas à la lettre suivante. Sa forme est simple, un petit crochet.",
    vowelExamples: { withFatha: "دَ", withDamma: "دُ", withKasra: "دِ" },
    examples: [
      { arabic: "دَجَاجٌ", transliteration: "dajâj", meaning: "poulet" },
      { arabic: "جَدِيدٌ", transliteration: "jadîd", meaning: "nouveau" },
      { arabic: "دَرْسٌ", transliteration: "dars", meaning: "leçon" },
      { arabic: "دَوَاءٌ", transliteration: "dawâ'", meaning: "médicament" },
      { arabic: "دِينٌ", transliteration: "dîn", meaning: "religion" },
      { arabic: "دُنْيَا", transliteration: "dunyâ", meaning: "monde" },
      { arabic: "وَلَدٌ", transliteration: "walad", meaning: "garçon" },
      { arabic: "دَمٌ", transliteration: "dam", meaning: "sang" },
      { arabic: "دُبٌّ", transliteration: "dubb", meaning: "ours" },
      { arabic: "بِلَادٌ", transliteration: "bilâd", meaning: "pays (pl.)" },
    ],
    qcm: [
      { question: "Le Dal est une lettre liante ou non-liante ?", options: ["Liante", "Non-liante", "Les deux", "Ça dépend"], correctIndex: 1, explanation: "Le Dal (د) est non-liant : il ne se lie pas à la lettre suivante." },
      { question: "Que signifie جَدِيدٌ ?", options: ["Ancien", "Grand", "Nouveau", "Petit"], correctIndex: 2, explanation: "جَدِيدٌ (jadîd) signifie 'nouveau'." },
    ],
    dictation: [
      { word: "دَجَاجٌ", transliteration: "dajâj (poulet)", options: ["دَجَاجٌ", "ذَجَاجٌ", "دَحَاحٌ", "دَجَاحٌ"], correctIndex: 0 },
      { word: "جَدِيدٌ", transliteration: "jadîd (nouveau)", options: ["جَدِيدٌ", "حَدِيدٌ", "جَدِيبٌ", "خَدِيدٌ"], correctIndex: 0 },
    ],
  },

  // ─── Leçon 9 : Dhal ───
  {
    id: 9,
    letter: "ذ",
    name: "Dhal",
    transliteration: "dh",
    pronunciation: "Comme le 'th' anglais dans 'this' ou 'the'. Son interdental voisé.",
    forms: { isolated: "ذ", initial: "ذ", medial: "ـذ", final: "ـذ" },
    description: "Le Dhal ressemble au Dal avec un point au-dessus. C'est aussi une lettre non-liante. Son interdental voisé (la langue entre les dents, avec vibration).",
    vowelExamples: { withFatha: "ذَ", withDamma: "ذُ", withKasra: "ذِ" },
    examples: [
      { arabic: "ذَهَبٌ", transliteration: "dhahab", meaning: "or" },
      { arabic: "أُسْتَاذٌ", transliteration: "ustâdh", meaning: "professeur" },
      { arabic: "ذِئْبٌ", transliteration: "dhi'b", meaning: "loup" },
      { arabic: "ذَكَرَ", transliteration: "dhakara", meaning: "il a mentionné" },
      { arabic: "ذِكْرٌ", transliteration: "dhikr", meaning: "rappel / évocation" },
      { arabic: "لَذِيذٌ", transliteration: "ladhîdh", meaning: "délicieux" },
      { arabic: "ذُنُوبٌ", transliteration: "dhunûb", meaning: "péchés" },
      { arabic: "ذُرَّةٌ", transliteration: "dhurrah", meaning: "maïs" },
      { arabic: "هَذَا", transliteration: "hâdhâ", meaning: "ceci" },
      { arabic: "إِذَا", transliteration: "idhâ", meaning: "si / quand" },
    ],
    qcm: [
      { question: "Quelle est la différence entre د et ذ ?", options: ["La taille", "ذ a un point au-dessus", "La forme", "Rien"], correctIndex: 1, explanation: "Le Dhal (ذ) a un point au-dessus, le Dal (د) n'en a pas." },
      { question: "Que signifie ذَهَبٌ ?", options: ["Argent", "Or", "Bronze", "Fer"], correctIndex: 1, explanation: "ذَهَبٌ (dhahab) signifie 'or'." },
    ],
    dictation: [
      { word: "ذَهَبٌ", transliteration: "dhahab (or)", options: ["دَهَبٌ", "ذَهَبٌ", "ذَحَبٌ", "ذَهَتٌ"], correctIndex: 1 },
      { word: "أُسْتَاذٌ", transliteration: "ustâdh (professeur)", options: ["أُسْتَادٌ", "أُسْتَاذٌ", "إِسْتَاذٌ", "أُسْتَاثٌ"], correctIndex: 1 },
    ],
  },

  // ─── Leçon 10 : Ra ───
  {
    id: 10,
    letter: "ر",
    name: "Ra",
    transliteration: "r",
    pronunciation: "Un 'r' roulé, comme en espagnol ou en italien. La langue vibre contre le palais.",
    forms: { isolated: "ر", initial: "ر", medial: "ـر", final: "ـر" },
    description: "Le Ra est une lettre non-liante. Sa forme descend sous la ligne de base. Le 'r' arabe est toujours roulé.",
    vowelExamples: { withFatha: "رَ", withDamma: "رُ", withKasra: "رِ" },
    examples: [
      { arabic: "رَجُلٌ", transliteration: "rajul", meaning: "homme" },
      { arabic: "دَارٌ", transliteration: "dâr", meaning: "maison" },
      { arabic: "بَحْرٌ", transliteration: "baḥr", meaning: "mer" },
      { arabic: "رَأْسٌ", transliteration: "ra's", meaning: "tête" },
      { arabic: "رِسَالَةٌ", transliteration: "risâlah", meaning: "lettre / message" },
      { arabic: "رَحْمَةٌ", transliteration: "raḥmah", meaning: "miséricorde" },
      { arabic: "رُوحٌ", transliteration: "rûḥ", meaning: "âme / esprit" },
      { arabic: "رَمَضَانُ", transliteration: "ramaḍân", meaning: "Ramadan" },
      { arabic: "رِزْقٌ", transliteration: "rizq", meaning: "subsistance" },
      { arabic: "نَهْرٌ", transliteration: "nahr", meaning: "fleuve" },
    ],
    qcm: [
      { question: "Comment se prononce le Ra arabe ?", options: ["Comme le 'r' français", "Comme un 'r' roulé", "Comme le 'l'", "Comme le 'gh'"], correctIndex: 1, explanation: "Le Ra arabe est un 'r' roulé, la langue vibre contre le palais." },
      { question: "Que signifie بَحْرٌ ?", options: ["Rivière", "Lac", "Mer", "Montagne"], correctIndex: 2, explanation: "بَحْرٌ (baḥr) signifie 'mer'." },
    ],
    dictation: [
      { word: "رَجُلٌ", transliteration: "rajul (homme)", options: ["رَجُلٌ", "رَحُلٌ", "دَجُلٌ", "رَجُبٌ"], correctIndex: 0 },
      { word: "دَارٌ", transliteration: "dâr (maison)", options: ["ذَارٌ", "دَارٌ", "دَاذٌ", "رَادٌ"], correctIndex: 1 },
    ],
  },

  // ─── Leçon 11 : Zay ───
  {
    id: 11,
    letter: "ز",
    name: "Zay",
    transliteration: "z",
    pronunciation: "Comme le 'z' français dans 'zoo'.",
    forms: { isolated: "ز", initial: "ز", medial: "ـز", final: "ـز" },
    description: "Le Zay ressemble au Ra avec un point au-dessus. Lettre non-liante. Forme la paire Ra/Zay comme Dal/Dhal.",
    vowelExamples: { withFatha: "زَ", withDamma: "زُ", withKasra: "زِ" },
    examples: [
      { arabic: "زَيْتٌ", transliteration: "zayt", meaning: "huile" },
      { arabic: "خُبْزٌ", transliteration: "khubz", meaning: "pain" },
      { arabic: "زَهْرَةٌ", transliteration: "zahrah", meaning: "fleur" },
      { arabic: "زَمَانٌ", transliteration: "zamân", meaning: "temps / époque" },
      { arabic: "زِيَارَةٌ", transliteration: "ziyârah", meaning: "visite" },
      { arabic: "زَوْجٌ", transliteration: "zawj", meaning: "époux" },
      { arabic: "زَوْجَةٌ", transliteration: "zawjah", meaning: "épouse" },
      { arabic: "مِيزَانٌ", transliteration: "mîzân", meaning: "balance" },
      { arabic: "عَزِيزٌ", transliteration: "'azîz", meaning: "cher / puissant" },
      { arabic: "رُزٌّ", transliteration: "ruzz", meaning: "riz" },
    ],
    qcm: [
      { question: "Quelle est la différence entre ر et ز ?", options: ["La taille", "ز a un point au-dessus", "La couleur", "Rien"], correctIndex: 1, explanation: "Le Zay (ز) a un point au-dessus, le Ra (ر) n'en a pas." },
      { question: "Que signifie زَيْتٌ ?", options: ["Pain", "Huile", "Eau", "Sel"], correctIndex: 1, explanation: "زَيْتٌ (zayt) signifie 'huile'." },
    ],
    dictation: [
      { word: "زَيْتٌ", transliteration: "zayt (huile)", options: ["رَيْتٌ", "زَيْتٌ", "زَيْبٌ", "ذَيْتٌ"], correctIndex: 1 },
      { word: "خُبْزٌ", transliteration: "khubz (pain)", options: ["خُبْزٌ", "خُبْرٌ", "حُبْزٌ", "خُبْذٌ"], correctIndex: 0 },
    ],
  },

  // ─── Leçon 12 : Sin ───
  {
    id: 12,
    letter: "س",
    name: "Sin",
    transliteration: "s",
    pronunciation: "Comme le 's' français dans 'soleil'.",
    forms: { isolated: "س", initial: "سـ", medial: "ـسـ", final: "ـس" },
    description: "Le Sin a une forme en dents de scie (trois pointes). C'est une lettre liante. Elle se prononce comme un 's' sourd.",
    vowelExamples: { withFatha: "سَ", withDamma: "سُ", withKasra: "سِ" },
    examples: [
      { arabic: "سَبَبٌ", transliteration: "sabab", meaning: "cause / raison" },
      { arabic: "دَرْسٌ", transliteration: "dars", meaning: "leçon" },
      { arabic: "سَمَاءٌ", transliteration: "samâ'", meaning: "ciel" },
      { arabic: "سَلَامٌ", transliteration: "salâm", meaning: "paix" },
      { arabic: "سَمَكٌ", transliteration: "samak", meaning: "poisson" },
      { arabic: "سَيَّارَةٌ", transliteration: "sayyârah", meaning: "voiture" },
      { arabic: "سُوقٌ", transliteration: "sûq", meaning: "marché" },
      { arabic: "سِرٌّ", transliteration: "sirr", meaning: "secret" },
      { arabic: "سَاعَةٌ", transliteration: "sâ'ah", meaning: "heure / montre" },
      { arabic: "سَهْلٌ", transliteration: "sahl", meaning: "facile" },
    ],
    qcm: [
      { question: "Combien de 'dents' a la lettre Sin ?", options: ["Deux", "Trois", "Quatre", "Une"], correctIndex: 1, explanation: "Le Sin (س) a trois petites pointes (dents de scie)." },
      { question: "Que signifie دَرْسٌ ?", options: ["Livre", "Leçon", "Stylo", "Cahier"], correctIndex: 1, explanation: "دَرْسٌ (dars) signifie 'leçon'." },
    ],
    dictation: [
      { word: "دَرْسٌ", transliteration: "dars (leçon)", options: ["دَرْسٌ", "دَرْزٌ", "ذَرْسٌ", "دَرْصٌ"], correctIndex: 0 },
      { word: "سَبَبٌ", transliteration: "sabab (cause)", options: ["صَبَبٌ", "سَبَبٌ", "سَتَبٌ", "ثَبَبٌ"], correctIndex: 1 },
    ],
  },

  // ─── Leçon 13 : Shin ───
  {
    id: 13,
    letter: "ش",
    name: "Shin",
    transliteration: "sh",
    pronunciation: "Comme le 'ch' français dans 'chat'.",
    forms: { isolated: "ش", initial: "شـ", medial: "ـشـ", final: "ـش" },
    description: "Le Shin a la même forme que le Sin mais avec trois points au-dessus. Paire Sin/Shin comme Dal/Dhal et Ra/Zay.",
    vowelExamples: { withFatha: "شَ", withDamma: "شُ", withKasra: "شِ" },
    examples: [
      { arabic: "شَجَرَةٌ", transliteration: "shajarah", meaning: "arbre" },
      { arabic: "شَمْسٌ", transliteration: "shams", meaning: "soleil" },
      { arabic: "شَايٌ", transliteration: "shây", meaning: "thé" },
      { arabic: "شَارِعٌ", transliteration: "shâri'", meaning: "rue" },
      { arabic: "شَتَاءٌ", transliteration: "shitâ'", meaning: "hiver" },
      { arabic: "شَخْصٌ", transliteration: "shakhṣ", meaning: "personne" },
      { arabic: "شُكْرٌ", transliteration: "shukr", meaning: "remerciement" },
      { arabic: "شَرِيكٌ", transliteration: "sharîk", meaning: "associé" },
      { arabic: "شَهْرٌ", transliteration: "shahr", meaning: "mois" },
      { arabic: "عَشَرَةٌ", transliteration: "'asharah", meaning: "dix" },
    ],
    qcm: [
      { question: "Quelle est la différence entre س et ش ?", options: ["La forme", "ش a trois points au-dessus", "La taille", "La prononciation uniquement"], correctIndex: 1, explanation: "Le Shin (ش) a trois points au-dessus, le Sin (س) n'en a pas." },
      { question: "Que signifie شَمْسٌ ?", options: ["Lune", "Étoile", "Soleil", "Nuage"], correctIndex: 2, explanation: "شَمْسٌ (shams) signifie 'soleil'." },
    ],
    dictation: [
      { word: "شَمْسٌ", transliteration: "shams (soleil)", options: ["سَمْسٌ", "شَمْسٌ", "شَمْصٌ", "شَمْزٌ"], correctIndex: 1 },
      { word: "شَجَرَةٌ", transliteration: "shajarah (arbre)", options: ["سَجَرَةٌ", "شَحَرَةٌ", "شَجَرَةٌ", "شَجَذَةٌ"], correctIndex: 2 },
    ],
  },

  // ─── Leçon 14 : Sad ───
  {
    id: 14,
    letter: "ص",
    name: "Sad",
    transliteration: "ṣ",
    pronunciation: "Un 's' emphatique. La langue est plus en arrière et le son est plus 'lourd' que le Sin ordinaire.",
    forms: { isolated: "ص", initial: "صـ", medial: "ـصـ", final: "ـص" },
    description: "Le Sad est la version emphatique du Sin. Les lettres emphatiques donnent un son plus grave et 'épais'. Le Sad a une forme arrondie fermée.",
    vowelExamples: { withFatha: "صَ", withDamma: "صُ", withKasra: "صِ" },
    examples: [
      { arabic: "صَبَاحٌ", transliteration: "ṣabâḥ", meaning: "matin" },
      { arabic: "صَبْرٌ", transliteration: "ṣabr", meaning: "patience" },
      { arabic: "صَلَاةٌ", transliteration: "ṣalâh", meaning: "prière" },
      { arabic: "صَدِيقٌ", transliteration: "ṣadîq", meaning: "ami" },
      { arabic: "صِحَّةٌ", transliteration: "ṣiḥḥah", meaning: "santé" },
      { arabic: "صُورَةٌ", transliteration: "ṣûrah", meaning: "image" },
      { arabic: "صَغِيرٌ", transliteration: "ṣaghîr", meaning: "petit" },
      { arabic: "صَوْتٌ", transliteration: "ṣawt", meaning: "voix / son" },
      { arabic: "صِدْقٌ", transliteration: "ṣidq", meaning: "sincérité" },
      { arabic: "قَصْرٌ", transliteration: "qaṣr", meaning: "palais" },
    ],
    qcm: [
      { question: "Le Sad est la version emphatique de quelle lettre ?", options: ["ش", "س", "ث", "ز"], correctIndex: 1, explanation: "Le Sad (ص) est la version emphatique du Sin (س)." },
      { question: "Que signifie صَبْرٌ ?", options: ["Matin", "Patience", "Force", "Joie"], correctIndex: 1, explanation: "صَبْرٌ (ṣabr) signifie 'patience'." },
    ],
    dictation: [
      { word: "صَبَاحٌ", transliteration: "ṣabâḥ (matin)", options: ["سَبَاحٌ", "صَبَاحٌ", "صَبَاخٌ", "ضَبَاحٌ"], correctIndex: 1 },
      { word: "صَبْرٌ", transliteration: "ṣabr (patience)", options: ["صَبْرٌ", "سَبْرٌ", "صَبْزٌ", "ضَبْرٌ"], correctIndex: 0 },
    ],
  },

  // ─── Leçon 15 : Dad ───
  {
    id: 15,
    letter: "ض",
    name: "Dad",
    transliteration: "ḍ",
    pronunciation: "Un 'd' emphatique. Son unique à la langue arabe, d'où son surnom 'la langue du Ḍâd'.",
    forms: { isolated: "ض", initial: "ضـ", medial: "ـضـ", final: "ـض" },
    description: "Le Dad est comme le Sad avec un point au-dessus. C'est une lettre si caractéristique de l'arabe que cette langue est parfois appelée 'la langue du Ḍâd'.",
    vowelExamples: { withFatha: "ضَ", withDamma: "ضُ", withKasra: "ضِ" },
    examples: [
      { arabic: "أَرْضٌ", transliteration: "arḍ", meaning: "terre" },
      { arabic: "بَيْضٌ", transliteration: "bayḍ", meaning: "œuf(s)" },
      { arabic: "ضَوْءٌ", transliteration: "ḍaw'", meaning: "lumière" },
      { arabic: "ضَيْفٌ", transliteration: "ḍayf", meaning: "invité" },
      { arabic: "مَرِيضٌ", transliteration: "marîḍ", meaning: "malade" },
      { arabic: "رِيَاضَةٌ", transliteration: "riyâḍah", meaning: "sport" },
      { arabic: "ضَرُورِيٌّ", transliteration: "ḍarûriyy", meaning: "nécessaire" },
      { arabic: "ضَعِيفٌ", transliteration: "ḍa'îf", meaning: "faible" },
      { arabic: "رَمَضَانُ", transliteration: "ramaḍân", meaning: "Ramadan" },
      { arabic: "فَرْضٌ", transliteration: "farḍ", meaning: "obligation" },
    ],
    qcm: [
      { question: "Quelle est la différence entre ص et ض ?", options: ["La forme", "ض a un point au-dessus", "La taille", "Rien"], correctIndex: 1, explanation: "Le Dad (ض) a un point au-dessus, le Sad (ص) n'en a pas." },
      { question: "Pourquoi l'arabe est appelé 'langue du Ḍâd' ?", options: ["Car c'est la première lettre", "Car le Dad est un son unique à l'arabe", "Car c'est la plus facile", "Car c'est la plus utilisée"], correctIndex: 1, explanation: "Le son Ḍâd est considéré comme unique à la langue arabe." },
    ],
    dictation: [
      { word: "أَرْضٌ", transliteration: "arḍ (terre)", options: ["أَرْصٌ", "أَرْضٌ", "أَرْسٌ", "إِرْضٌ"], correctIndex: 1 },
      { word: "بَيْضٌ", transliteration: "bayḍ (œuf)", options: ["بَيْصٌ", "بَيْسٌ", "بَيْضٌ", "بَيْظٌ"], correctIndex: 2 },
    ],
  },

  // ─── Leçon 16 : Ta emphatique ───
  {
    id: 16,
    letter: "ط",
    name: "Ṭa",
    transliteration: "ṭ",
    pronunciation: "Un 't' emphatique. Plus grave et lourd que le Ta ordinaire (ت).",
    forms: { isolated: "ط", initial: "طـ", medial: "ـطـ", final: "ـط" },
    description: "Le Ṭa emphatique est la version emphatique du Ta (ت). Il a une forme verticale avec une boucle. Les voyelles autour de cette lettre prennent un son plus grave.",
    vowelExamples: { withFatha: "طَ", withDamma: "طُ", withKasra: "طِ" },
    examples: [
      { arabic: "طَبِيبٌ", transliteration: "ṭabîb", meaning: "médecin" },
      { arabic: "خَطٌّ", transliteration: "khaṭṭ", meaning: "ligne / écriture" },
      { arabic: "طَالِبٌ", transliteration: "ṭâlib", meaning: "étudiant" },
      { arabic: "طَعَامٌ", transliteration: "ṭa'âm", meaning: "nourriture" },
      { arabic: "طَرِيقٌ", transliteration: "ṭarîq", meaning: "chemin / route" },
      { arabic: "طَائِرٌ", transliteration: "ṭâ'ir", meaning: "oiseau" },
      { arabic: "طِفْلٌ", transliteration: "ṭifl", meaning: "enfant" },
      { arabic: "بَسِيطٌ", transliteration: "basîṭ", meaning: "simple" },
      { arabic: "مَطَرٌ", transliteration: "maṭar", meaning: "pluie" },
      { arabic: "نَشِيطٌ", transliteration: "nashîṭ", meaning: "actif" },
    ],
    qcm: [
      { question: "Le Ṭa (ط) est la version emphatique de quelle lettre ?", options: ["ث", "ت", "د", "ذ"], correctIndex: 1, explanation: "Le Ṭa (ط) est la version emphatique du Ta (ت)." },
      { question: "Que signifie طَبِيبٌ ?", options: ["Professeur", "Ingénieur", "Médecin", "Avocat"], correctIndex: 2, explanation: "طَبِيبٌ (ṭabîb) signifie 'médecin'." },
    ],
    dictation: [
      { word: "طَبِيبٌ", transliteration: "ṭabîb (médecin)", options: ["تَبِيبٌ", "طَبِيبٌ", "ظَبِيبٌ", "طَبِيتٌ"], correctIndex: 1 },
      { word: "خَطٌّ", transliteration: "khaṭṭ (ligne)", options: ["خَتٌّ", "حَطٌّ", "خَطٌّ", "خَظٌّ"], correctIndex: 2 },
    ],
  },

  // ─── Leçon 17 : Dha ───
  {
    id: 17,
    letter: "ظ",
    name: "Dha",
    transliteration: "ẓ",
    pronunciation: "Un 'dh' emphatique, version lourde du Dhal (ذ). Son interdental emphatique.",
    forms: { isolated: "ظ", initial: "ظـ", medial: "ـظـ", final: "ـظ" },
    description: "Le Dha est comme le Ṭa avec un point au-dessus. C'est la version emphatique du Dhal (ذ). Forme la paire Ṭa/Dha comme Sad/Dad.",
    vowelExamples: { withFatha: "ظَ", withDamma: "ظُ", withKasra: "ظِ" },
    examples: [
      { arabic: "ظُهْرٌ", transliteration: "ẓuhr", meaning: "midi" },
      { arabic: "حِفْظٌ", transliteration: "ḥifẓ", meaning: "mémorisation" },
      { arabic: "ظِلٌّ", transliteration: "ẓill", meaning: "ombre" },
      { arabic: "ظَلَامٌ", transliteration: "ẓalâm", meaning: "obscurité" },
      { arabic: "نَظَرَ", transliteration: "naẓara", meaning: "il a regardé" },
      { arabic: "نَظِيفٌ", transliteration: "naẓîf", meaning: "propre" },
      { arabic: "ظَالِمٌ", transliteration: "ẓâlim", meaning: "injuste" },
      { arabic: "مَحْظُوظٌ", transliteration: "maḥẓûẓ", meaning: "chanceux" },
      { arabic: "عَظِيمٌ", transliteration: "'aẓîm", meaning: "immense / grandiose" },
      { arabic: "لَفْظٌ", transliteration: "lafẓ", meaning: "prononciation" },
    ],
    qcm: [
      { question: "Quelle est la différence entre ط et ظ ?", options: ["La forme", "ظ a un point au-dessus", "La taille", "Rien"], correctIndex: 1, explanation: "Le Dha (ظ) a un point au-dessus, le Ṭa (ط) n'en a pas." },
      { question: "Que signifie ظُهْرٌ ?", options: ["Matin", "Soir", "Midi", "Nuit"], correctIndex: 2, explanation: "ظُهْرٌ (ẓuhr) signifie 'midi'." },
    ],
    dictation: [
      { word: "ظُهْرٌ", transliteration: "ẓuhr (midi)", options: ["طُهْرٌ", "ظُهْرٌ", "ذُهْرٌ", "ظُهْزٌ"], correctIndex: 1 },
      { word: "حِفْظٌ", transliteration: "ḥifẓ (mémorisation)", options: ["حِفْطٌ", "خِفْظٌ", "حِفْظٌ", "حِفْذٌ"], correctIndex: 2 },
    ],
  },

  // ─── Leçon 18 : Ayn ───
  {
    id: 18,
    letter: "ع",
    name: "Ayn",
    transliteration: "'",
    pronunciation: "Son pharyngal voisé sans équivalent en français ni en anglais. Contraction au fond de la gorge.",
    forms: { isolated: "ع", initial: "عـ", medial: "ـعـ", final: "ـع" },
    description: "Le Ayn est l'une des lettres les plus caractéristiques de l'arabe. C'est un son guttural profond qui demande de la pratique. Sa forme ressemble à un petit crochet.",
    vowelExamples: { withFatha: "عَ", withDamma: "عُ", withKasra: "عِ" },
    examples: [
      { arabic: "عَرَبِيٌّ", transliteration: "'arabiyy", meaning: "arabe" },
      { arabic: "عِلْمٌ", transliteration: "'ilm", meaning: "science / savoir" },
      { arabic: "عَيْنٌ", transliteration: "'ayn", meaning: "œil / source" },
      { arabic: "عَمَلٌ", transliteration: "'amal", meaning: "travail" },
      { arabic: "عَالَمٌ", transliteration: "'âlam", meaning: "monde" },
      { arabic: "عَظِيمٌ", transliteration: "'aẓîm", meaning: "immense" },
      { arabic: "سَاعَةٌ", transliteration: "sâ'ah", meaning: "heure" },
      { arabic: "عَدْلٌ", transliteration: "'adl", meaning: "justice" },
      { arabic: "مَعْرِفَةٌ", transliteration: "ma'rifah", meaning: "connaissance" },
      { arabic: "عُمْرٌ", transliteration: "'umr", meaning: "âge / vie" },
    ],
    qcm: [
      { question: "Le Ayn a-t-il un équivalent en français ?", options: ["Oui, le 'a'", "Oui, le 'h'", "Non, c'est un son unique", "Oui, le 'r'"], correctIndex: 2, explanation: "Le Ayn (ع) est un son pharyngal voisé sans équivalent en français." },
      { question: "Que signifie عِلْمٌ ?", options: ["Art", "Science / Savoir", "Travail", "Voyage"], correctIndex: 1, explanation: "عِلْمٌ ('ilm) signifie 'science' ou 'savoir'." },
    ],
    dictation: [
      { word: "عَرَبِيٌّ", transliteration: "'arabiyy (arabe)", options: ["غَرَبِيٌّ", "عَرَبِيٌّ", "أَرَبِيٌّ", "عَرَتِيٌّ"], correctIndex: 1 },
      { word: "عِلْمٌ", transliteration: "'ilm (science)", options: ["غِلْمٌ", "عِلْمٌ", "أِلْمٌ", "عِلْبٌ"], correctIndex: 1 },
    ],
  },

  // ─── Leçon 19 : Ghayn ───
  {
    id: 19,
    letter: "غ",
    name: "Ghayn",
    transliteration: "gh",
    pronunciation: "Comme un 'r' grasseyé parisien ou le 'r' français guttural. Son uvulaire fricatif.",
    forms: { isolated: "غ", initial: "غـ", medial: "ـغـ", final: "ـغ" },
    description: "Le Ghayn a la même forme que le Ayn avec un point au-dessus. Il se prononce comme le 'r' grasseyé français. Paire Ayn/Ghayn.",
    vowelExamples: { withFatha: "غَ", withDamma: "غُ", withKasra: "غِ" },
    examples: [
      { arabic: "غُرَابٌ", transliteration: "ghurâb", meaning: "corbeau" },
      { arabic: "صَغِيرٌ", transliteration: "ṣaghîr", meaning: "petit" },
      { arabic: "غَدًا", transliteration: "ghadan", meaning: "demain" },
      { arabic: "غَنِيٌّ", transliteration: "ghaniyy", meaning: "riche" },
      { arabic: "غَابَةٌ", transliteration: "ghâbah", meaning: "forêt" },
      { arabic: "لُغَةٌ", transliteration: "lughah", meaning: "langue" },
      { arabic: "غَرِيبٌ", transliteration: "gharîb", meaning: "étrange / étranger" },
      { arabic: "غَيْمٌ", transliteration: "ghaym", meaning: "nuage" },
      { arabic: "فَرَاغٌ", transliteration: "farâgh", meaning: "vide / temps libre" },
      { arabic: "مَغْرِبٌ", transliteration: "maghrib", meaning: "coucher du soleil / Maghreb" },
    ],
    qcm: [
      { question: "Quelle est la différence entre ع et غ ?", options: ["La forme", "غ a un point au-dessus", "La taille", "Rien"], correctIndex: 1, explanation: "Le Ghayn (غ) a un point au-dessus, le Ayn (ع) n'en a pas." },
      { question: "Que signifie صَغِيرٌ ?", options: ["Grand", "Petit", "Beau", "Fort"], correctIndex: 1, explanation: "صَغِيرٌ (ṣaghîr) signifie 'petit'." },
    ],
    dictation: [
      { word: "غُرَابٌ", transliteration: "ghurâb (corbeau)", options: ["عُرَابٌ", "غُرَابٌ", "غُرَاتٌ", "غُذَابٌ"], correctIndex: 1 },
      { word: "صَغِيرٌ", transliteration: "ṣaghîr (petit)", options: ["صَعِيرٌ", "سَغِيرٌ", "صَغِيرٌ", "ضَغِيرٌ"], correctIndex: 2 },
    ],
  },

  // ─── Leçon 20 : Fa ───
  {
    id: 20,
    letter: "ف",
    name: "Fa",
    transliteration: "f",
    pronunciation: "Comme le 'f' français dans 'fleur'.",
    forms: { isolated: "ف", initial: "فـ", medial: "ـفـ", final: "ـف" },
    description: "Le Fa a une boucle avec un point au-dessus. Forme simple et facile à identifier. Se prononce comme le 'f' français.",
    vowelExamples: { withFatha: "فَ", withDamma: "فُ", withKasra: "فِ" },
    examples: [
      { arabic: "فَرَحٌ", transliteration: "faraḥ", meaning: "joie" },
      { arabic: "صُوفٌ", transliteration: "ṣûf", meaning: "laine" },
      { arabic: "فِيلٌ", transliteration: "fîl", meaning: "éléphant" },
      { arabic: "فَمٌ", transliteration: "fam", meaning: "bouche" },
      { arabic: "فَجْرٌ", transliteration: "fajr", meaning: "aube" },
      { arabic: "فَقِيرٌ", transliteration: "faqîr", meaning: "pauvre" },
      { arabic: "فَاكِهَةٌ", transliteration: "fâkihah", meaning: "fruit" },
      { arabic: "فِكْرَةٌ", transliteration: "fikrah", meaning: "idée" },
      { arabic: "فَصْلٌ", transliteration: "faṣl", meaning: "saison / chapitre" },
      { arabic: "مِفْتَاحٌ", transliteration: "miftâḥ", meaning: "clé" },
    ],
    qcm: [
      { question: "Combien de points a la lettre ف ?", options: ["Aucun", "Un au-dessus", "Deux", "Trois"], correctIndex: 1, explanation: "Le Fa (ف) a un seul point au-dessus." },
      { question: "Que signifie فَرَحٌ ?", options: ["Tristesse", "Colère", "Joie", "Peur"], correctIndex: 2, explanation: "فَرَحٌ (faraḥ) signifie 'joie'." },
    ],
    dictation: [
      { word: "فَرَحٌ", transliteration: "faraḥ (joie)", options: ["فَرَخٌ", "فَرَحٌ", "غَرَحٌ", "فَرَجٌ"], correctIndex: 1 },
      { word: "صُوفٌ", transliteration: "ṣûf (laine)", options: ["سُوفٌ", "صُوفٌ", "صُوغٌ", "ضُوفٌ"], correctIndex: 1 },
    ],
  },

  // ─── Leçon 21 : Qaf ───
  {
    id: 21,
    letter: "ق",
    name: "Qaf",
    transliteration: "q",
    pronunciation: "Un 'k' uvulaire prononcé au fond de la gorge, plus profond qu'un 'k' ordinaire.",
    forms: { isolated: "ق", initial: "قـ", medial: "ـقـ", final: "ـق" },
    description: "Le Qaf ressemble au Fa mais a deux points au-dessus. Son uvulaire caractéristique de l'arabe. Ne pas confondre avec le Kaf.",
    vowelExamples: { withFatha: "قَ", withDamma: "قُ", withKasra: "قِ" },
    examples: [
      { arabic: "قَلْبٌ", transliteration: "qalb", meaning: "cœur" },
      { arabic: "صَدِيقٌ", transliteration: "ṣadîq", meaning: "ami" },
      { arabic: "قَمَرٌ", transliteration: "qamar", meaning: "lune" },
      { arabic: "قُرْآنٌ", transliteration: "qur'ân", meaning: "Coran" },
      { arabic: "قَلَمٌ", transliteration: "qalam", meaning: "stylo" },
      { arabic: "قَرِيبٌ", transliteration: "qarîb", meaning: "proche" },
      { arabic: "قَوِيٌّ", transliteration: "qawiyy", meaning: "fort" },
      { arabic: "طَرِيقٌ", transliteration: "ṭarîq", meaning: "chemin" },
      { arabic: "قِصَّةٌ", transliteration: "qiṣṣah", meaning: "histoire" },
      { arabic: "حَقِيقَةٌ", transliteration: "ḥaqîqah", meaning: "vérité" },
    ],
    qcm: [
      { question: "Quelle est la différence entre ف et ق ?", options: ["La forme", "Le nombre de points : ق en a deux", "La taille", "Rien"], correctIndex: 1, explanation: "Le Qaf (ق) a deux points au-dessus, le Fa (ف) n'en a qu'un." },
      { question: "Que signifie قَلْبٌ ?", options: ["Tête", "Main", "Cœur", "Pied"], correctIndex: 2, explanation: "قَلْبٌ (qalb) signifie 'cœur'." },
    ],
    dictation: [
      { word: "قَلْبٌ", transliteration: "qalb (cœur)", options: ["فَلْبٌ", "قَلْبٌ", "قَلْتٌ", "غَلْبٌ"], correctIndex: 1 },
      { word: "صَدِيقٌ", transliteration: "ṣadîq (ami)", options: ["صَدِيقٌ", "سَدِيقٌ", "صَدِيفٌ", "ضَدِيقٌ"], correctIndex: 0 },
    ],
  },

  // ─── Leçon 22 : Kaf ───
  {
    id: 22,
    letter: "ك",
    name: "Kaf",
    transliteration: "k",
    pronunciation: "Comme le 'k' français dans 'kilo'. Plus léger que le Qaf.",
    forms: { isolated: "ك", initial: "كـ", medial: "ـكـ", final: "ـك" },
    description: "Le Kaf se prononce comme un 'k' français ordinaire. Ne pas confondre avec le Qaf (ق) qui est plus guttural.",
    vowelExamples: { withFatha: "كَ", withDamma: "كُ", withKasra: "كِ" },
    examples: [
      { arabic: "كِتَابٌ", transliteration: "kitâb", meaning: "livre" },
      { arabic: "كَبِيرٌ", transliteration: "kabîr", meaning: "grand" },
      { arabic: "كَلْبٌ", transliteration: "kalb", meaning: "chien" },
      { arabic: "كُرْسِيٌّ", transliteration: "kursiyy", meaning: "chaise" },
      { arabic: "كَلِمَةٌ", transliteration: "kalimah", meaning: "mot" },
      { arabic: "سَمَكٌ", transliteration: "samak", meaning: "poisson" },
      { arabic: "مَلِكٌ", transliteration: "malik", meaning: "roi" },
      { arabic: "كَثِيرٌ", transliteration: "kathîr", meaning: "beaucoup" },
      { arabic: "كَرِيمٌ", transliteration: "karîm", meaning: "généreux" },
      { arabic: "شَرِيكٌ", transliteration: "sharîk", meaning: "associé" },
    ],
    qcm: [
      { question: "Quelle est la différence entre ك et ق ?", options: ["Rien", "ك est un 'k' léger, ق est guttural", "Même prononciation", "ك est emphatique"], correctIndex: 1, explanation: "Le Kaf (ك) est un 'k' léger, le Qaf (ق) est un son uvulaire plus profond." },
      { question: "Que signifie كِتَابٌ ?", options: ["Stylo", "Cahier", "Livre", "Page"], correctIndex: 2, explanation: "كِتَابٌ (kitâb) signifie 'livre'." },
    ],
    dictation: [
      { word: "كِتَابٌ", transliteration: "kitâb (livre)", options: ["قِتَابٌ", "كِتَابٌ", "كِتَاتٌ", "كِطَابٌ"], correctIndex: 1 },
      { word: "كَبِيرٌ", transliteration: "kabîr (grand)", options: ["قَبِيرٌ", "كَبِيرٌ", "كَتِيرٌ", "غَبِيرٌ"], correctIndex: 1 },
    ],
  },

  // ─── Leçon 23 : Lam ───
  {
    id: 23,
    letter: "ل",
    name: "Lam",
    transliteration: "l",
    pronunciation: "Comme le 'l' français dans 'lune'.",
    forms: { isolated: "ل", initial: "لـ", medial: "ـلـ", final: "ـل" },
    description: "Le Lam est une lettre très fréquente en arabe, notamment dans l'article défini 'ال' (al-). Sa forme est verticale avec un crochet en bas.",
    vowelExamples: { withFatha: "لَ", withDamma: "لُ", withKasra: "لِ" },
    examples: [
      { arabic: "لَيْلٌ", transliteration: "layl", meaning: "nuit" },
      { arabic: "جَمَالٌ", transliteration: "jamâl", meaning: "beauté" },
      { arabic: "لُغَةٌ", transliteration: "lughah", meaning: "langue" },
      { arabic: "لَبَنٌ", transliteration: "laban", meaning: "lait fermenté" },
      { arabic: "لَوْنٌ", transliteration: "lawn", meaning: "couleur" },
      { arabic: "لَحْمٌ", transliteration: "laḥm", meaning: "viande" },
      { arabic: "عَسَلٌ", transliteration: "'asal", meaning: "miel" },
      { arabic: "قَلِيلٌ", transliteration: "qalîl", meaning: "peu" },
      { arabic: "لَطِيفٌ", transliteration: "laṭîf", meaning: "gentil / doux" },
      { arabic: "سَلَامٌ", transliteration: "salâm", meaning: "paix" },
    ],
    qcm: [
      { question: "Dans quel mot très courant trouve-t-on le Lam ?", options: ["Les pronoms", "L'article défini ال", "Les chiffres", "Les couleurs"], correctIndex: 1, explanation: "Le Lam est dans l'article défini ال (al-), très fréquent en arabe." },
      { question: "Que signifie لَيْلٌ ?", options: ["Jour", "Nuit", "Matin", "Soir"], correctIndex: 1, explanation: "لَيْلٌ (layl) signifie 'nuit'." },
    ],
    dictation: [
      { word: "لَيْلٌ", transliteration: "layl (nuit)", options: ["لَيْلٌ", "لَيْرٌ", "رَيْلٌ", "لَيْبٌ"], correctIndex: 0 },
      { word: "جَمَالٌ", transliteration: "jamâl (beauté)", options: ["حَمَالٌ", "جَمَالٌ", "جَمَارٌ", "خَمَالٌ"], correctIndex: 1 },
    ],
  },

  // ─── Leçon 24 : Mim ───
  {
    id: 24,
    letter: "م",
    name: "Mim",
    transliteration: "m",
    pronunciation: "Comme le 'm' français dans 'maman'.",
    forms: { isolated: "م", initial: "مـ", medial: "ـمـ", final: "ـم" },
    description: "Le Mim a une forme arrondie. Lettre très courante dans les mots arabes. Se prononce comme le 'm' français.",
    vowelExamples: { withFatha: "مَ", withDamma: "مُ", withKasra: "مِ" },
    examples: [
      { arabic: "مَدْرَسَةٌ", transliteration: "madrasah", meaning: "école" },
      { arabic: "مَاءٌ", transliteration: "mâ'", meaning: "eau" },
      { arabic: "مَسْجِدٌ", transliteration: "masjid", meaning: "mosquée" },
      { arabic: "مَدِينَةٌ", transliteration: "madînah", meaning: "ville" },
      { arabic: "مُعَلِّمٌ", transliteration: "mu'allim", meaning: "enseignant" },
      { arabic: "مَكْتَبَةٌ", transliteration: "maktabah", meaning: "bibliothèque" },
      { arabic: "مِفْتَاحٌ", transliteration: "miftâḥ", meaning: "clé" },
      { arabic: "مَوْعِدٌ", transliteration: "maw'id", meaning: "rendez-vous" },
      { arabic: "مُسْلِمٌ", transliteration: "muslim", meaning: "musulman" },
      { arabic: "أُمَّةٌ", transliteration: "ummah", meaning: "communauté / nation" },
    ],
    qcm: [
      { question: "Que signifie مَدْرَسَةٌ ?", options: ["Mosquée", "Hôpital", "École", "Bibliothèque"], correctIndex: 2, explanation: "مَدْرَسَةٌ (madrasah) signifie 'école'." },
      { question: "Que signifie مَاءٌ ?", options: ["Feu", "Air", "Terre", "Eau"], correctIndex: 3, explanation: "مَاءٌ (mâ') signifie 'eau'." },
    ],
    dictation: [
      { word: "مَدْرَسَةٌ", transliteration: "madrasah (école)", options: ["مَدْرَسَةٌ", "مَذْرَسَةٌ", "مَدْرَصَةٌ", "بَدْرَسَةٌ"], correctIndex: 0 },
      { word: "مَاءٌ", transliteration: "mâ' (eau)", options: ["مَاعٌ", "مَاءٌ", "بَاءٌ", "مَاغٌ"], correctIndex: 1 },
    ],
  },

  // ─── Leçon 25 : Nun ───
  {
    id: 25,
    letter: "ن",
    name: "Nun",
    transliteration: "n",
    pronunciation: "Comme le 'n' français dans 'nature'.",
    forms: { isolated: "ن", initial: "نـ", medial: "ـنـ", final: "ـن" },
    description: "Le Nun ressemble au Ba mais le point est au-dessus. Lettre très courante, notamment dans les terminaisons de mots (tanwîn).",
    vowelExamples: { withFatha: "نَ", withDamma: "نُ", withKasra: "نِ" },
    examples: [
      { arabic: "نُورٌ", transliteration: "nûr", meaning: "lumière" },
      { arabic: "نَهْرٌ", transliteration: "nahr", meaning: "fleuve / rivière" },
      { arabic: "نَارٌ", transliteration: "nâr", meaning: "feu" },
      { arabic: "نَجْمٌ", transliteration: "najm", meaning: "étoile" },
      { arabic: "نَفْسٌ", transliteration: "nafs", meaning: "âme / soi" },
      { arabic: "نِعْمَةٌ", transliteration: "ni'mah", meaning: "bienfait" },
      { arabic: "نَبِيٌّ", transliteration: "nabiyy", meaning: "prophète" },
      { arabic: "جَنَّةٌ", transliteration: "jannah", meaning: "paradis" },
      { arabic: "نَظِيفٌ", transliteration: "naẓîf", meaning: "propre" },
      { arabic: "أَمَانٌ", transliteration: "amân", meaning: "sécurité" },
    ],
    qcm: [
      { question: "Quelle est la différence entre ب et ن ?", options: ["La forme", "ب point en dessous, ن point au-dessus", "Rien", "La taille"], correctIndex: 1, explanation: "Le Ba (ب) a le point en dessous, le Nun (ن) a le point au-dessus." },
      { question: "Que signifie نُورٌ ?", options: ["Ombre", "Lumière", "Feu", "Lune"], correctIndex: 1, explanation: "نُورٌ (nûr) signifie 'lumière'." },
    ],
    dictation: [
      { word: "نُورٌ", transliteration: "nûr (lumière)", options: ["بُورٌ", "نُورٌ", "نُوزٌ", "تُورٌ"], correctIndex: 1 },
      { word: "نَهْرٌ", transliteration: "nahr (fleuve)", options: ["نَهْرٌ", "بَهْر٦", "نَحْرٌ", "نَهْزٌ"], correctIndex: 0 },
    ],
  },

  // ─── Leçon 26 : Ha ───
  {
    id: 26,
    letter: "ه",
    name: "Ha",
    transliteration: "h",
    pronunciation: "Un 'h' aspiré léger, comme en anglais dans 'house'. Plus léger que le Ha pharyngal (ح).",
    forms: { isolated: "ه", initial: "هـ", medial: "ـهـ", final: "ـه" },
    description: "Le Ha est un 'h' léger aspiré, très différent du Ha pharyngal (ح). Ne pas les confondre ! Le Ha change beaucoup de forme selon sa position.",
    vowelExamples: { withFatha: "هَ", withDamma: "هُ", withKasra: "هِ" },
    examples: [
      { arabic: "هَذَا", transliteration: "hâdhâ", meaning: "ceci / celui-ci" },
      { arabic: "كَلِمَةٌ", transliteration: "kalimah", meaning: "mot / parole" },
      { arabic: "هَدِيَّةٌ", transliteration: "hadiyyah", meaning: "cadeau" },
      { arabic: "هِلَالٌ", transliteration: "hilâl", meaning: "croissant de lune" },
      { arabic: "هَوَاءٌ", transliteration: "hawâ'", meaning: "air" },
      { arabic: "وَجْهٌ", transliteration: "wajh", meaning: "visage" },
      { arabic: "فَهِمَ", transliteration: "fahima", meaning: "il a compris" },
      { arabic: "شَهْرٌ", transliteration: "shahr", meaning: "mois" },
      { arabic: "نَهَارٌ", transliteration: "nahâr", meaning: "journée" },
      { arabic: "هُدًى", transliteration: "hudâ", meaning: "guidance" },
    ],
    qcm: [
      { question: "Quelle est la différence entre ح et هـ ?", options: ["Même son", "ح est pharyngal (profond), هـ est aspiré (léger)", "ح est léger, هـ est profond", "Rien"], correctIndex: 1, explanation: "Le Ha pharyngal (ح) est profond, le Ha (هـ) est un souffle léger comme le 'h' anglais." },
      { question: "Que signifie هَذَا ?", options: ["Celui-là", "Ceci / Celui-ci", "Où ?", "Qui ?"], correctIndex: 1, explanation: "هَذَا (hâdhâ) signifie 'ceci' ou 'celui-ci'." },
    ],
    dictation: [
      { word: "هَذَا", transliteration: "hâdhâ (ceci)", options: ["حَذَا", "هَذَا", "هَدَا", "خَذَا"], correctIndex: 1 },
      { word: "كَلِمَةٌ", transliteration: "kalimah (mot)", options: ["كَلِمَةٌ", "قَلِمَةٌ", "كَلِبَةٌ", "كَلِمَتٌ"], correctIndex: 0 },
    ],
  },

  // ─── Leçon 27 : Waw ───
  {
    id: 27,
    letter: "و",
    name: "Waw",
    transliteration: "w / û",
    pronunciation: "Comme le 'w' anglais dans 'water', ou la voyelle longue 'ou' dans 'four'.",
    forms: { isolated: "و", initial: "و", medial: "ـو", final: "ـو" },
    description: "Le Waw est une lettre non-liante. Il peut être une consonne ('w') ou une voyelle longue ('û' comme 'ou'). Double fonction très importante.",
    vowelExamples: { withFatha: "وَ", withDamma: "وُ", withKasra: "وِ" },
    examples: [
      { arabic: "وَلَدٌ", transliteration: "walad", meaning: "garçon / enfant" },
      { arabic: "نُورٌ", transliteration: "nûr", meaning: "lumière (و = voyelle longue)" },
      { arabic: "وَرْدٌ", transliteration: "ward", meaning: "rose (fleur)" },
      { arabic: "وَقْتٌ", transliteration: "waqt", meaning: "temps" },
      { arabic: "وَجْهٌ", transliteration: "wajh", meaning: "visage" },
      { arabic: "وَطَنٌ", transliteration: "waṭan", meaning: "patrie" },
      { arabic: "وَعْدٌ", transliteration: "wa'd", meaning: "promesse" },
      { arabic: "دُرُوسٌ", transliteration: "durûs", meaning: "leçons (pl.)" },
      { arabic: "وَاجِبٌ", transliteration: "wâjib", meaning: "devoir / obligatoire" },
      { arabic: "وُصُولٌ", transliteration: "wuṣûl", meaning: "arrivée" },
    ],
    qcm: [
      { question: "Le Waw peut être :", options: ["Seulement consonne", "Seulement voyelle", "Consonne ('w') ou voyelle longue ('û')", "Ni l'un ni l'autre"], correctIndex: 2, explanation: "Le Waw a une double fonction : consonne 'w' ou voyelle longue 'û'." },
      { question: "Que signifie وَلَدٌ ?", options: ["Fille", "Garçon / Enfant", "Bébé", "Homme"], correctIndex: 1, explanation: "وَلَدٌ (walad) signifie 'garçon' ou 'enfant'." },
    ],
    dictation: [
      { word: "وَلَدٌ", transliteration: "walad (garçon)", options: ["وَلَدٌ", "وَرَدٌ", "وَلَذٌ", "يَلَدٌ"], correctIndex: 0 },
      { word: "نُورٌ", transliteration: "nûr (lumière)", options: ["نُورٌ", "نُوزٌ", "بُورٌ", "نُودٌ"], correctIndex: 0 },
    ],
  },

  // ─── Leçon 28 : Ya ───
  {
    id: 28,
    letter: "ي",
    name: "Ya",
    transliteration: "y / î",
    pronunciation: "Comme le 'y' français dans 'yaourt', ou la voyelle longue 'i' dans 'ski'.",
    forms: { isolated: "ي", initial: "يـ", medial: "ـيـ", final: "ـي" },
    description: "Le Ya est la dernière lettre de l'alphabet. Comme le Waw, il a une double fonction : consonne ('y') ou voyelle longue ('î'). Il a deux points en dessous.",
    vowelExamples: { withFatha: "يَ", withDamma: "يُ", withKasra: "يِ" },
    examples: [
      { arabic: "يَدٌ", transliteration: "yad", meaning: "main" },
      { arabic: "كَبِيرٌ", transliteration: "kabîr", meaning: "grand (ي = voyelle longue)" },
      { arabic: "يَوْمٌ", transliteration: "yawm", meaning: "jour" },
      { arabic: "يَمِينٌ", transliteration: "yamîn", meaning: "droite" },
      { arabic: "يَسَارٌ", transliteration: "yasâr", meaning: "gauche" },
      { arabic: "جَمِيلٌ", transliteration: "jamîl", meaning: "beau" },
      { arabic: "طَبِيعَةٌ", transliteration: "ṭabî'ah", meaning: "nature" },
      { arabic: "يَقِينٌ", transliteration: "yaqîn", meaning: "certitude" },
      { arabic: "عَرَبِيٌّ", transliteration: "'arabiyy", meaning: "arabe" },
      { arabic: "يَسِيرٌ", transliteration: "yasîr", meaning: "facile" },
    ],
    qcm: [
      { question: "Le Ya peut être :", options: ["Seulement consonne", "Seulement voyelle", "Consonne ('y') ou voyelle longue ('î')", "Ni l'un ni l'autre"], correctIndex: 2, explanation: "Comme le Waw, le Ya a une double fonction : consonne 'y' ou voyelle longue 'î'." },
      { question: "Que signifie يَوْمٌ ?", options: ["Nuit", "Jour", "Semaine", "Mois"], correctIndex: 1, explanation: "يَوْمٌ (yawm) signifie 'jour'." },
      { question: "Félicitations ! Tu as terminé l'alphabet arabe ! Combien de lettres as-tu apprises ?", options: ["26", "27", "28", "29"], correctIndex: 2, explanation: "L'alphabet arabe compte 28 lettres. Bravo pour ce parcours ! 🎉" },
    ],
    dictation: [
      { word: "يَدٌ", transliteration: "yad (main)", options: ["يَدٌ", "يَذٌ", "بَدٌ", "يَرٌ"], correctIndex: 0 },
      { word: "يَوْمٌ", transliteration: "yawm (jour)", options: ["يَوْمٌ", "يَوْبٌ", "وَيْمٌ", "يَوْنٌ"], correctIndex: 0 },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════
// Niveau 1 — Programme thématique : 10 leçons progressives
// Programme ALFASL Niveau 1 pour francophones
// ═══════════════════════════════════════════════════════════════════

export interface LessonExample {
  arabic: string;
  transliteration: string;
  meaning: string;
}

export interface LetterInfo {
  letter: string;
  name: string;
  sound: string;
}

export interface LetterFormRow {
  letter: string;
  name: string;
  isolated: string;
  initial: string;
  medial: string;
  final: string;
}

export interface TheorySection {
  title: string;
  content: string;
  letterGrid?: LetterInfo[];
  formsTable?: LetterFormRow[];
  arabicExamples?: LessonExample[];
  tip?: string;
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
  title: string;
  subtitle: string;
  icon: string;
  videoUrl?: string;
  theory: TheorySection[];
  qcm: LessonQCM[];
  dictation: DictationItem[];
}

// ─── Leçon 1 : Les lettres isolées ───
const lesson1: Lesson = {
  id: 1,
  title: "Les lettres isolées",
  subtitle: "Découverte des 28 lettres de l'alphabet arabe",
  icon: "📖",
  theory: [
    {
      title: "Introduction à l'alphabet arabe",
      content: "L'alphabet arabe compte 28 lettres. Contrairement au français, l'arabe s'écrit de droite à gauche. Toutes les lettres sont des consonnes ; les voyelles sont indiquées par des signes diacritiques placés au-dessus ou en dessous des lettres. Dans cette première leçon, nous allons découvrir chaque lettre dans sa forme isolée.",
      tip: "Prenez le temps d'observer chaque lettre. Essayez de les regrouper par ressemblance visuelle : cela facilitera la mémorisation.",
    },
    {
      title: "Les 28 lettres de l'alphabet",
      content: "Voici les 28 lettres présentées dans l'ordre traditionnel. Cliquez sur chaque lettre pour entendre sa prononciation.",
      letterGrid: [
        { letter: "ا", name: "Alif", sound: "Support de voyelle / â long" },
        { letter: "ب", name: "Bâ'", sound: "b comme 'bateau'" },
        { letter: "ت", name: "Tâ'", sound: "t comme 'table'" },
        { letter: "ث", name: "Thâ'", sound: "th anglais de 'think'" },
        { letter: "ج", name: "Jîm", sound: "j comme 'jardin'" },
        { letter: "ح", name: "Hâ'", sound: "h guttural (souffle profond)" },
        { letter: "خ", name: "Khâ'", sound: "kh (jota espagnole)" },
        { letter: "د", name: "Dâl", sound: "d comme 'dent'" },
        { letter: "ذ", name: "Dhâl", sound: "th anglais de 'the'" },
        { letter: "ر", name: "Râ'", sound: "r roulé" },
        { letter: "ز", name: "Zây", sound: "z comme 'zèbre'" },
        { letter: "س", name: "Sîn", sound: "s comme 'soleil'" },
        { letter: "ش", name: "Shîn", sound: "ch comme 'chat'" },
        { letter: "ص", name: "Sâd", sound: "s emphatique (lourd)" },
        { letter: "ض", name: "Dâd", sound: "d emphatique (lourd)" },
        { letter: "ط", name: "Tâ'", sound: "t emphatique (lourd)" },
        { letter: "ظ", name: "Dhâ'", sound: "dh emphatique" },
        { letter: "ع", name: "'Ayn", sound: "contraction de la gorge" },
        { letter: "غ", name: "Ghayn", sound: "r grasseyé parisien" },
        { letter: "ف", name: "Fâ'", sound: "f comme 'famille'" },
        { letter: "ق", name: "Qâf", sound: "q profond (fond de gorge)" },
        { letter: "ك", name: "Kâf", sound: "k comme 'kilo'" },
        { letter: "ل", name: "Lâm", sound: "l comme 'lune'" },
        { letter: "م", name: "Mîm", sound: "m comme 'maman'" },
        { letter: "ن", name: "Nûn", sound: "n comme 'nuit'" },
        { letter: "ه", name: "Hâ'", sound: "h léger expiré" },
        { letter: "و", name: "Wâw", sound: "w comme 'oui' / ou long" },
        { letter: "ي", name: "Yâ'", sound: "y comme 'yeux' / î long" },
      ],
    },
    {
      title: "Les familles de lettres",
      content: "Pour faciliter la mémorisation, regroupons les lettres par ressemblance de forme :\n\n• **Groupe ب ت ث** : même corps, différenciées par les points (1 dessous, 2 dessus, 3 dessus)\n• **Groupe ج ح خ** : même forme arrondie (1 point au milieu, rien, 1 point dessus)\n• **Groupe د ذ** : même forme (sans point / avec point)\n• **Groupe ر ز** : même forme (sans point / avec point)\n• **Groupe س ش** : même forme (sans points / 3 points dessus)\n• **Groupe ص ض** : même forme (sans point / 1 point dessus)\n• **Groupe ط ظ** : même forme (sans point / 1 point dessus)\n• **Groupe ع غ** : même forme (sans point / 1 point dessus)\n• **Groupe ف ق** : forme similaire (1 point dessus / 2 points dessus)",
      tip: "Mémoriser les familles plutôt que les lettres individuellement. En connaissant 14 formes de base, vous maîtrisez les 28 lettres !",
    },
    {
      title: "Les lettres non-liantes",
      content: "6 lettres ne se lient jamais à la lettre suivante (elles ne s'attachent qu'à la lettre précédente). Ce sont : ا د ذ ر ز و. Toutes les autres lettres se lient des deux côtés.",
      tip: "Retenez l'astuce : les lettres non-liantes sont celles dont le tracé se termine « dans le vide » vers la gauche.",
    },
  ],
  qcm: [
    { question: "Combien de lettres compte l'alphabet arabe ?", options: ["22", "26", "28", "30"], correctIndex: 2, explanation: "L'alphabet arabe compte exactement 28 lettres." },
    { question: "Dans quel sens s'écrit l'arabe ?", options: ["De gauche à droite", "De droite à gauche", "De haut en bas", "Dans les deux sens"], correctIndex: 1, explanation: "L'arabe s'écrit de droite à gauche." },
    { question: "Quelle lettre est-ce : ب ?", options: ["Tâ'", "Bâ'", "Thâ'", "Nûn"], correctIndex: 1, explanation: "C'est la lettre Bâ' (ب), avec un point en dessous." },
    { question: "Combien de points a la lettre ث ?", options: ["Aucun", "Un", "Deux", "Trois"], correctIndex: 3, explanation: "La lettre Thâ' (ث) a trois points au-dessus." },
    { question: "Quelle lettre a un point au milieu : ج ح خ ?", options: ["ح", "خ", "ج", "Aucune"], correctIndex: 2, explanation: "Le Jîm (ج) a un point au milieu de sa forme." },
    { question: "Parmi ces lettres, laquelle est non-liante ?", options: ["ب", "د", "ل", "ك"], correctIndex: 1, explanation: "Le Dâl (د) est une lettre non-liante : elle ne se lie pas à la lettre suivante." },
    { question: "Quelle est la première lettre de l'alphabet arabe ?", options: ["ب", "ا", "ع", "و"], correctIndex: 1, explanation: "L'Alif (ا) est la première lettre de l'alphabet arabe." },
    { question: "Les lettres ص et ض se distinguent par :", options: ["La taille", "Le nombre de points", "La couleur", "La position"], correctIndex: 1, explanation: "Sâd (ص) n'a pas de point, Dâd (ض) a un point au-dessus." },
    { question: "Comment se prononce la lettre خ ?", options: ["Comme un 'k'", "Comme la jota espagnole", "Comme un 'h' léger", "Comme un 'g'"], correctIndex: 1, explanation: "Le Khâ' (خ) se prononce comme la jota espagnole ou le 'ch' allemand dans 'Bach'." },
    { question: "Quel groupe de lettres partage la même forme de base ?", options: ["ب ج د", "ب ت ث", "ا ل ك", "ف ع غ"], correctIndex: 1, explanation: "Les lettres ب ت ث partagent la même forme de base et se distinguent par leurs points." },
    { question: "Quelle lettre est-ce : ع ?", options: ["Ghayn", "'Ayn", "Fâ'", "Qâf"], correctIndex: 1, explanation: "C'est la lettre 'Ayn (ع), un son guttural propre à l'arabe." },
    { question: "Combien y a-t-il de lettres non-liantes ?", options: ["4", "5", "6", "8"], correctIndex: 2, explanation: "Il y a 6 lettres non-liantes : ا د ذ ر ز و." },
  ],
  dictation: [
    { word: "ا", transliteration: "Alif", options: ["ا", "ل", "د", "و"], correctIndex: 0 },
    { word: "ب", transliteration: "Bâ'", options: ["ت", "ب", "ث", "ن"], correctIndex: 1 },
    { word: "ج", transliteration: "Jîm", options: ["ج", "ح", "خ", "ع"], correctIndex: 0 },
    { word: "ح", transliteration: "Hâ' (guttural)", options: ["خ", "ج", "ح", "ه"], correctIndex: 2 },
    { word: "س", transliteration: "Sîn", options: ["ش", "ص", "س", "ض"], correctIndex: 2 },
    { word: "ش", transliteration: "Shîn", options: ["س", "ش", "ص", "ث"], correctIndex: 1 },
    { word: "ع", transliteration: "'Ayn", options: ["غ", "ف", "ع", "ق"], correctIndex: 2 },
    { word: "ف", transliteration: "Fâ'", options: ["ق", "ف", "غ", "ك"], correctIndex: 1 },
    { word: "ك", transliteration: "Kâf", options: ["ل", "ك", "ق", "ف"], correctIndex: 1 },
    { word: "ي", transliteration: "Yâ'", options: ["و", "ن", "ي", "ب"], correctIndex: 2 },
  ],
};

// ─── Leçon 2 : Les formes des lettres ───
const lesson2: Lesson = {
  id: 2,
  title: "Les formes des lettres",
  subtitle: "Début, milieu et fin de mot",
  icon: "✍️",
  theory: [
    {
      title: "Les 4 formes de chaque lettre",
      content: "En arabe, chaque lettre change de forme selon sa position dans le mot. Il existe 4 formes :\n\n1. **Isolée** : la lettre seule\n2. **Initiale** : au début du mot (liée à la lettre suivante)\n3. **Médiane** : au milieu du mot (liée des deux côtés)\n4. **Finale** : à la fin du mot (liée à la lettre précédente)\n\nLa bonne nouvelle : le corps de la lettre reste reconnaissable. Seules les liaisons changent.",
      tip: "La clé est de reconnaître le « squelette » de la lettre. Les points et la forme générale restent toujours les mêmes.",
    },
    {
      title: "Tableaux des formes — Groupe 1",
      content: "Voici les formes des premières familles de lettres :",
      formsTable: [
        { letter: "ب", name: "Bâ'", isolated: "ب", initial: "بـ", medial: "ـبـ", final: "ـب" },
        { letter: "ت", name: "Tâ'", isolated: "ت", initial: "تـ", medial: "ـتـ", final: "ـت" },
        { letter: "ث", name: "Thâ'", isolated: "ث", initial: "ثـ", medial: "ـثـ", final: "ـث" },
        { letter: "ج", name: "Jîm", isolated: "ج", initial: "جـ", medial: "ـجـ", final: "ـج" },
        { letter: "ح", name: "Hâ'", isolated: "ح", initial: "حـ", medial: "ـحـ", final: "ـح" },
        { letter: "خ", name: "Khâ'", isolated: "خ", initial: "خـ", medial: "ـخـ", final: "ـخ" },
      ],
    },
    {
      title: "Tableaux des formes — Groupe 2",
      content: "Les lettres non-liantes n'ont que 2 formes (isolée et finale) car elles ne se connectent jamais à gauche :",
      formsTable: [
        { letter: "د", name: "Dâl", isolated: "د", initial: "د", medial: "ـد", final: "ـد" },
        { letter: "ذ", name: "Dhâl", isolated: "ذ", initial: "ذ", medial: "ـذ", final: "ـذ" },
        { letter: "ر", name: "Râ'", isolated: "ر", initial: "ر", medial: "ـر", final: "ـر" },
        { letter: "ز", name: "Zây", isolated: "ز", initial: "ز", medial: "ـز", final: "ـز" },
        { letter: "و", name: "Wâw", isolated: "و", initial: "و", medial: "ـو", final: "ـو" },
        { letter: "ا", name: "Alif", isolated: "ا", initial: "ا", medial: "ـا", final: "ـا" },
      ],
    },
    {
      title: "Tableaux des formes — Groupe 3",
      content: "Les autres lettres liantes :",
      formsTable: [
        { letter: "س", name: "Sîn", isolated: "س", initial: "سـ", medial: "ـسـ", final: "ـس" },
        { letter: "ش", name: "Shîn", isolated: "ش", initial: "شـ", medial: "ـشـ", final: "ـش" },
        { letter: "ص", name: "Sâd", isolated: "ص", initial: "صـ", medial: "ـصـ", final: "ـص" },
        { letter: "ض", name: "Dâd", isolated: "ض", initial: "ضـ", medial: "ـضـ", final: "ـض" },
        { letter: "ط", name: "Tâ'", isolated: "ط", initial: "طـ", medial: "ـطـ", final: "ـط" },
        { letter: "ظ", name: "Dhâ'", isolated: "ظ", initial: "ظـ", medial: "ـظـ", final: "ـظ" },
        { letter: "ع", name: "'Ayn", isolated: "ع", initial: "عـ", medial: "ـعـ", final: "ـع" },
        { letter: "غ", name: "Ghayn", isolated: "غ", initial: "غـ", medial: "ـغـ", final: "ـغ" },
        { letter: "ف", name: "Fâ'", isolated: "ف", initial: "فـ", medial: "ـفـ", final: "ـف" },
        { letter: "ق", name: "Qâf", isolated: "ق", initial: "قـ", medial: "ـقـ", final: "ـق" },
        { letter: "ك", name: "Kâf", isolated: "ك", initial: "كـ", medial: "ـكـ", final: "ـك" },
        { letter: "ل", name: "Lâm", isolated: "ل", initial: "لـ", medial: "ـلـ", final: "ـل" },
        { letter: "م", name: "Mîm", isolated: "م", initial: "مـ", medial: "ـمـ", final: "ـم" },
        { letter: "ن", name: "Nûn", isolated: "ن", initial: "نـ", medial: "ـنـ", final: "ـن" },
        { letter: "ه", name: "Hâ'", isolated: "ه", initial: "هـ", medial: "ـهـ", final: "ـه" },
        { letter: "ي", name: "Yâ'", isolated: "ي", initial: "يـ", medial: "ـيـ", final: "ـي" },
      ],
    },
    {
      title: "Exemple de décomposition d'un mot",
      content: "Prenons le mot **بَيْت** (bayt = maison) :\n\n• **بـ** → Bâ' en position initiale (liée à droite)\n• **ـيـ** → Yâ' en position médiane (liée des deux côtés)\n• **ـت** → Tâ' en position finale (liée à gauche uniquement)\n\nChaque lettre garde ses points distinctifs : c'est ainsi qu'on la reconnaît quelle que soit sa forme.",
      arabicExamples: [
        { arabic: "بَيْتٌ", transliteration: "bayt", meaning: "maison" },
        { arabic: "كِتَابٌ", transliteration: "kitâb", meaning: "livre" },
        { arabic: "جَمَلٌ", transliteration: "jamal", meaning: "chameau" },
        { arabic: "دَرْسٌ", transliteration: "dars", meaning: "leçon" },
        { arabic: "شَمْسٌ", transliteration: "shams", meaning: "soleil" },
      ],
    },
  ],
  qcm: [
    { question: "Combien de formes peut prendre une lettre arabe liante ?", options: ["2", "3", "4", "5"], correctIndex: 2, explanation: "Une lettre liante a 4 formes : isolée, initiale, médiane et finale." },
    { question: "Combien de formes ont les lettres non-liantes ?", options: ["1", "2", "3", "4"], correctIndex: 1, explanation: "Les lettres non-liantes ont 2 formes : isolée et finale (attachée à la lettre précédente)." },
    { question: "Quelle est la forme initiale de ب ?", options: ["ب", "بـ", "ـبـ", "ـب"], correctIndex: 1, explanation: "La forme initiale de Bâ' est بـ (liée à la lettre suivante)." },
    { question: "Dans le mot بَيْت, quelle position occupe la lettre ي ?", options: ["Isolée", "Initiale", "Médiane", "Finale"], correctIndex: 2, explanation: "Dans بيت, le Yâ' est en position médiane, lié des deux côtés." },
    { question: "Quelle lettre est non-liante ?", options: ["ب", "ر", "ل", "ن"], correctIndex: 1, explanation: "Le Râ' (ر) est une lettre non-liante." },
    { question: "La forme finale de ج est :", options: ["جـ", "ـجـ", "ـج", "ج"], correctIndex: 2, explanation: "La forme finale de Jîm est ـج (liée à la lettre précédente)." },
    { question: "Pourquoi les lettres non-liantes n'ont-elles que 2 formes ?", options: ["Elles sont trop petites", "Elles ne se connectent jamais à la lettre suivante", "Elles n'existent qu'en fin de mot", "Elles n'ont pas de points"], correctIndex: 1, explanation: "Les lettres non-liantes ne se connectent jamais à gauche (à la lettre suivante), donc elles n'ont pas de forme initiale ou médiane distincte." },
    { question: "Quelle est la forme médiane de ع ?", options: ["عـ", "ـع", "ـعـ", "ع"], correctIndex: 2, explanation: "La forme médiane de 'Ayn est ـعـ (liée des deux côtés)." },
    { question: "Dans le mot كِتَاب, la lettre ا est en position :", options: ["Initiale", "Médiane", "Finale", "Isolée"], correctIndex: 1, explanation: "L'Alif dans كتاب est entre le Tâ' et le Bâ', mais comme elle est non-liante, elle garde sa forme isolée/finale." },
    { question: "Quelle information reste constante quelle que soit la forme d'une lettre ?", options: ["La taille", "Les points", "La largeur", "La couleur"], correctIndex: 1, explanation: "Les points (nombre et position) restent toujours les mêmes, c'est ce qui permet d'identifier la lettre." },
  ],
  dictation: [
    { word: "بـ", transliteration: "Bâ' initiale", options: ["بـ", "ب", "ـبـ", "ـب"], correctIndex: 0 },
    { word: "ـتـ", transliteration: "Tâ' médiane", options: ["تـ", "ت", "ـتـ", "ـت"], correctIndex: 2 },
    { word: "ـج", transliteration: "Jîm finale", options: ["جـ", "ج", "ـجـ", "ـج"], correctIndex: 3 },
    { word: "سـ", transliteration: "Sîn initiale", options: ["ـسـ", "سـ", "ـس", "س"], correctIndex: 1 },
    { word: "ـكـ", transliteration: "Kâf médiane", options: ["كـ", "ك", "ـكـ", "ـك"], correctIndex: 2 },
    { word: "ـن", transliteration: "Nûn finale", options: ["نـ", "ن", "ـنـ", "ـن"], correctIndex: 3 },
    { word: "عـ", transliteration: "'Ayn initiale", options: ["عـ", "ع", "ـعـ", "ـع"], correctIndex: 0 },
    { word: "ـمـ", transliteration: "Mîm médiane", options: ["مـ", "م", "ـمـ", "ـم"], correctIndex: 2 },
    { word: "فـ", transliteration: "Fâ' initiale", options: ["ـف", "ف", "فـ", "ـفـ"], correctIndex: 2 },
    { word: "ـي", transliteration: "Yâ' finale", options: ["يـ", "ي", "ـيـ", "ـي"], correctIndex: 3 },
  ],
};

// ─── Leçon 3 : Les voyelles courtes ───
const lesson3: Lesson = {
  id: 3,
  title: "Les voyelles courtes",
  subtitle: "Fatha, Damma, Kasra et Soukoun",
  icon: "🎵",
  theory: [
    {
      title: "Les voyelles en arabe",
      content: "En arabe, les voyelles ne sont pas des lettres séparées comme en français. Elles sont représentées par de petits signes (diacritiques) placés au-dessus ou en dessous des consonnes. Il existe 3 voyelles courtes et 1 signe d'absence de voyelle :\n\n• **Fatha** (  َ ) : petit trait oblique AU-DESSUS → son « a »\n• **Damma** (  ُ ) : petit wâw AU-DESSUS → son « ou »\n• **Kasra** (  ِ ) : petit trait oblique EN DESSOUS → son « i »\n• **Soukoun** (  ْ ) : petit cercle AU-DESSUS → pas de voyelle (la consonne est « morte »)",
      tip: "La Fatha est le son le plus fréquent en arabe. Le Soukoun indique que la consonne se prononce seule, sans voyelle.",
    },
    {
      title: "La Fatha — Son « a »",
      content: "La Fatha est un petit trait oblique placé au-dessus de la lettre. Elle donne le son « a » bref. Exemples :",
      arabicExamples: [
        { arabic: "بَ", transliteration: "ba", meaning: "bâ' + fatha" },
        { arabic: "تَ", transliteration: "ta", meaning: "tâ' + fatha" },
        { arabic: "جَ", transliteration: "ja", meaning: "jîm + fatha" },
        { arabic: "سَ", transliteration: "sa", meaning: "sîn + fatha" },
        { arabic: "كَ", transliteration: "ka", meaning: "kâf + fatha" },
      ],
    },
    {
      title: "La Damma — Son « ou »",
      content: "La Damma est un petit signe en forme de wâw placé au-dessus de la lettre. Elle donne le son « ou » bref :",
      arabicExamples: [
        { arabic: "بُ", transliteration: "bou", meaning: "bâ' + damma" },
        { arabic: "تُ", transliteration: "tou", meaning: "tâ' + damma" },
        { arabic: "جُ", transliteration: "jou", meaning: "jîm + damma" },
        { arabic: "سُ", transliteration: "sou", meaning: "sîn + damma" },
        { arabic: "كُ", transliteration: "kou", meaning: "kâf + damma" },
      ],
    },
    {
      title: "La Kasra — Son « i »",
      content: "La Kasra est un petit trait oblique placé en dessous de la lettre. Elle donne le son « i » bref :",
      arabicExamples: [
        { arabic: "بِ", transliteration: "bi", meaning: "bâ' + kasra" },
        { arabic: "تِ", transliteration: "ti", meaning: "tâ' + kasra" },
        { arabic: "جِ", transliteration: "ji", meaning: "jîm + kasra" },
        { arabic: "سِ", transliteration: "si", meaning: "sîn + kasra" },
        { arabic: "كِ", transliteration: "ki", meaning: "kâf + kasra" },
      ],
    },
    {
      title: "Le Soukoun — Absence de voyelle",
      content: "Le Soukoun (petit rond au-dessus) indique que la consonne n'est suivie d'aucune voyelle. On dit que la lettre est « quiescente » ou « morte ». Exemple : dans أَبْ (ab), le Bâ' porte un Soukoun — il se prononce juste « b » sans voyelle après.",
      arabicExamples: [
        { arabic: "أَبْ", transliteration: "ab", meaning: "père (sans tanwîn)" },
        { arabic: "مِنْ", transliteration: "min", meaning: "de / depuis" },
        { arabic: "قَدْ", transliteration: "qad", meaning: "certes / déjà" },
      ],
    },
  ],
  qcm: [
    { question: "Quel signe représente le son « a » ?", options: ["Damma", "Kasra", "Fatha", "Soukoun"], correctIndex: 2, explanation: "La Fatha (  َ ) donne le son « a »." },
    { question: "Où se place la Kasra ?", options: ["Au-dessus de la lettre", "En dessous de la lettre", "À droite", "À gauche"], correctIndex: 1, explanation: "La Kasra se place en dessous de la lettre." },
    { question: "Quel son donne la Damma ?", options: ["a", "i", "ou", "Pas de son"], correctIndex: 2, explanation: "La Damma donne le son « ou »." },
    { question: "Que signifie le Soukoun ?", options: ["Son 'a'", "Son 'ou'", "Son 'i'", "Pas de voyelle"], correctIndex: 3, explanation: "Le Soukoun indique l'absence de voyelle après la consonne." },
    { question: "Comment se lit بَ ?", options: ["bi", "bou", "ba", "b"], correctIndex: 2, explanation: "Bâ' avec une Fatha se lit « ba »." },
    { question: "Comment se lit كُ ?", options: ["ka", "ki", "kou", "k"], correctIndex: 2, explanation: "Kâf avec une Damma se lit « kou »." },
    { question: "Comment se lit سِ ?", options: ["sa", "si", "sou", "s"], correctIndex: 1, explanation: "Sîn avec une Kasra se lit « si »." },
    { question: "Comment se lit جْ ?", options: ["ja", "ji", "jou", "j (sans voyelle)"], correctIndex: 3, explanation: "Jîm avec un Soukoun se prononce « j » seul, sans voyelle." },
    { question: "Combien de voyelles courtes existe-t-il en arabe ?", options: ["2", "3", "4", "5"], correctIndex: 1, explanation: "Il y a 3 voyelles courtes : Fatha (a), Damma (ou), Kasra (i). Le Soukoun n'est pas une voyelle." },
    { question: "La Fatha se place :", options: ["En dessous", "Au-dessus", "À côté", "Devant"], correctIndex: 1, explanation: "La Fatha est un petit trait placé au-dessus de la lettre." },
  ],
  dictation: [
    { word: "بَ", transliteration: "ba", options: ["بَ", "بُ", "بِ", "بْ"], correctIndex: 0 },
    { word: "تُ", transliteration: "tou", options: ["تَ", "تُ", "تِ", "تْ"], correctIndex: 1 },
    { word: "سِ", transliteration: "si", options: ["سَ", "سُ", "سِ", "سْ"], correctIndex: 2 },
    { word: "كَ", transliteration: "ka", options: ["كِ", "كُ", "كْ", "كَ"], correctIndex: 3 },
    { word: "جُ", transliteration: "jou", options: ["جَ", "جُ", "جِ", "جْ"], correctIndex: 1 },
    { word: "فَ", transliteration: "fa", options: ["فَ", "فُ", "فِ", "فْ"], correctIndex: 0 },
    { word: "نِ", transliteration: "ni", options: ["نَ", "نُ", "نِ", "نْ"], correctIndex: 2 },
    { word: "لُ", transliteration: "lou", options: ["لَ", "لُ", "لِ", "لْ"], correctIndex: 1 },
    { word: "مْ", transliteration: "m (soukoun)", options: ["مَ", "مُ", "مِ", "مْ"], correctIndex: 3 },
    { word: "عَ", transliteration: "'a", options: ["عَ", "عُ", "عِ", "عْ"], correctIndex: 0 },
  ],
};

// ─── Leçon 4 : Lecture de syllabes ───
const lesson4: Lesson = {
  id: 4,
  title: "Lecture de syllabes",
  subtitle: "Combinaison lettres + voyelles",
  icon: "🔤",
  theory: [
    {
      title: "Former des syllabes",
      content: "Une syllabe arabe de base est composée d'une consonne + une voyelle courte. C'est le bloc de construction fondamental de la lecture arabe.\n\n• Consonne + Fatha = syllabe en « a » (بَ = ba)\n• Consonne + Damma = syllabe en « ou » (بُ = bou)\n• Consonne + Kasra = syllabe en « i » (بِ = bi)\n\nEn enchaînant plusieurs syllabes, on forme des mots !",
    },
    {
      title: "Syllabes ouvertes (CV)",
      content: "La syllabe la plus simple est une consonne suivie d'une voyelle (syllabe « ouverte »). Entraînez-vous à lire ces combinaisons :",
      arabicExamples: [
        { arabic: "بَ تَ ثَ", transliteration: "ba ta tha", meaning: "avec Fatha" },
        { arabic: "جُ حُ خُ", transliteration: "jou hou khou", meaning: "avec Damma" },
        { arabic: "دِ ذِ رِ", transliteration: "di dhi ri", meaning: "avec Kasra" },
        { arabic: "سَ شَ صَ", transliteration: "sa sha ṣa", meaning: "avec Fatha" },
        { arabic: "طُ ظُ عُ", transliteration: "ṭou ḍhou 'ou", meaning: "avec Damma" },
      ],
    },
    {
      title: "Syllabes fermées (CVC)",
      content: "Une syllabe fermée se compose de : consonne + voyelle + consonne avec Soukoun.\n\nExemple : بَدْ (bad) = بَ (ba) + دْ (d sans voyelle)\n\nLe Soukoun « ferme » la syllabe en ajoutant une consonne finale non voyellée.",
      arabicExamples: [
        { arabic: "بَدْ", transliteration: "bad", meaning: "syllabe fermée" },
        { arabic: "كَتْ", transliteration: "kat", meaning: "syllabe fermée" },
        { arabic: "مِنْ", transliteration: "min", meaning: "de / depuis" },
        { arabic: "قُلْ", transliteration: "qoul", meaning: "dis !" },
        { arabic: "سِرْ", transliteration: "sir", meaning: "marche !" },
      ],
    },
    {
      title: "Enchaîner les syllabes",
      content: "Pour lire un mot, il suffit de décomposer syllabe par syllabe, de droite à gauche :\n\n**كَتَبَ** (kataba = il a écrit) :\n• كَ (ka) + تَ (ta) + بَ (ba) → ka-ta-ba\n\n**جَلَسَ** (jalasa = il s'est assis) :\n• جَ (ja) + لَ (la) + سَ (sa) → ja-la-sa",
      arabicExamples: [
        { arabic: "كَتَبَ", transliteration: "kataba", meaning: "il a écrit" },
        { arabic: "جَلَسَ", transliteration: "jalasa", meaning: "il s'est assis" },
        { arabic: "ذَهَبَ", transliteration: "dhahaba", meaning: "il est parti" },
        { arabic: "فَتَحَ", transliteration: "fataḥa", meaning: "il a ouvert" },
        { arabic: "نَصَرَ", transliteration: "naṣara", meaning: "il a aidé" },
      ],
      tip: "Lisez lentement, syllabe par syllabe. La vitesse viendra avec la pratique !",
    },
  ],
  qcm: [
    { question: "Comment se lit بَ + تَ ?", options: ["bit", "bat", "bata", "bita"], correctIndex: 2, explanation: "بَ (ba) + تَ (ta) = ba-ta." },
    { question: "Quel type de syllabe est بَدْ ?", options: ["Ouverte", "Fermée", "Longue", "Double"], correctIndex: 1, explanation: "بَدْ est une syllabe fermée (CVC) : consonne + voyelle + consonne avec soukoun." },
    { question: "Comment décomposer كَتَبَ ?", options: ["ka-ta-ba", "kat-ba", "k-ataba", "kata-ba"], correctIndex: 0, explanation: "كَتَبَ se décompose en 3 syllabes ouvertes : كَ (ka) + تَ (ta) + بَ (ba)." },
    { question: "Quel son donne جُ ?", options: ["ja", "ji", "jou", "j"], correctIndex: 2, explanation: "Jîm avec Damma = jou." },
    { question: "Dans مِنْ, le Nûn porte :", options: ["Une Fatha", "Une Damma", "Une Kasra", "Un Soukoun"], correctIndex: 3, explanation: "Le Nûn dans مِنْ porte un Soukoun : il se prononce « n » sans voyelle." },
    { question: "Comment se lit فَتَحَ ?", options: ["fitaḥ", "fataḥa", "foutaḥ", "fatḥ"], correctIndex: 1, explanation: "فَتَحَ = fa-ta-ḥa (3 syllabes ouvertes)." },
    { question: "Quelle est la différence entre سَ et سِ ?", options: ["La lettre est différente", "La voyelle change : 'a' vs 'i'", "L'une est longue, l'autre courte", "Aucune"], correctIndex: 1, explanation: "سَ = sa (fatha) et سِ = si (kasra). La consonne est la même, seule la voyelle diffère." },
    { question: "Comment se lit قُلْ ?", options: ["qal", "qil", "qoul", "qol"], correctIndex: 2, explanation: "قُلْ = qoul (Qâf + damma + Lâm avec soukoun)." },
    { question: "Combien de syllabes dans ذَهَبَ ?", options: ["1", "2", "3", "4"], correctIndex: 2, explanation: "ذَهَبَ = dha-ha-ba, soit 3 syllabes ouvertes." },
    { question: "Pour lire l'arabe, on commence par :", options: ["La gauche", "La droite", "Le milieu", "N'importe où"], correctIndex: 1, explanation: "L'arabe se lit de droite à gauche." },
  ],
  dictation: [
    { word: "كَتَبَ", transliteration: "kataba (il a écrit)", options: ["كَتَبَ", "كُتِبَ", "كَتْبَ", "كِتَبَ"], correctIndex: 0 },
    { word: "جَلَسَ", transliteration: "jalasa (il s'est assis)", options: ["جُلِسَ", "جَلَسَ", "جَلْسَ", "جِلَسَ"], correctIndex: 1 },
    { word: "ذَهَبَ", transliteration: "dhahaba (il est parti)", options: ["ذَهَبَ", "ذُهِبَ", "ذَهْبَ", "ذِهَبَ"], correctIndex: 0 },
    { word: "فَتَحَ", transliteration: "fataḥa (il a ouvert)", options: ["فُتِحَ", "فَتْحَ", "فَتَحَ", "فِتَحَ"], correctIndex: 2 },
    { word: "نَصَرَ", transliteration: "naṣara (il a aidé)", options: ["نَصَرَ", "نُصِرَ", "نَصْرَ", "نِصَرَ"], correctIndex: 0 },
    { word: "مِنْ", transliteration: "min (de/depuis)", options: ["مَنْ", "مِنْ", "مُنْ", "مِنَ"], correctIndex: 1 },
    { word: "قُلْ", transliteration: "qoul (dis !)", options: ["قَلْ", "قِلْ", "قُلْ", "قَلَ"], correctIndex: 2 },
    { word: "بَدَأَ", transliteration: "bada'a (il a commencé)", options: ["بَدَأَ", "بُدِأَ", "بَدْأَ", "بِدَأَ"], correctIndex: 0 },
    { word: "سَمِعَ", transliteration: "sami'a (il a entendu)", options: ["سَمَعَ", "سَمِعَ", "سُمِعَ", "سِمِعَ"], correctIndex: 1 },
    { word: "عَلِمَ", transliteration: "'alima (il a su)", options: ["عُلِمَ", "عَلَمَ", "عَلِمَ", "عِلِمَ"], correctIndex: 2 },
  ],
};

// ─── Leçon 5 : Les voyelles longues ───
const lesson5: Lesson = {
  id: 5,
  title: "Les voyelles longues",
  subtitle: "Alif, Waw et Ya comme prolongation",
  icon: "🔊",
  theory: [
    {
      title: "Voyelles courtes vs voyelles longues",
      content: "En arabe, chaque voyelle courte a un équivalent long qui dure environ 2 fois plus longtemps :\n\n• **Fatha + Alif** (ـَا) → â long (comme dans « pâte »)\n• **Damma + Wâw** (ـُو) → û long (comme dans « route »)\n• **Kasra + Yâ'** (ـِي) → î long (comme dans « île »)\n\nLa voyelle longue est formée par la voyelle courte + la lettre de prolongation correspondante.",
      tip: "Les lettres Alif (ا), Wâw (و) et Yâ' (ي) jouent ici un double rôle : elles sont à la fois des consonnes ET des supports de voyelles longues.",
    },
    {
      title: "Le â long (Fatha + Alif)",
      content: "Quand une lettre porte une Fatha et est suivie d'un Alif, le son « a » est prolongé :",
      arabicExamples: [
        { arabic: "بَاب", transliteration: "bâb", meaning: "porte" },
        { arabic: "كِتَاب", transliteration: "kitâb", meaning: "livre" },
        { arabic: "نَام", transliteration: "nâm", meaning: "il a dormi" },
        { arabic: "قَالَ", transliteration: "qâla", meaning: "il a dit" },
        { arabic: "جَاءَ", transliteration: "jâ'a", meaning: "il est venu" },
      ],
    },
    {
      title: "Le û long (Damma + Wâw)",
      content: "Quand une lettre porte une Damma et est suivie d'un Wâw, le son « ou » est prolongé :",
      arabicExamples: [
        { arabic: "نُور", transliteration: "nûr", meaning: "lumière" },
        { arabic: "سُور", transliteration: "sûr", meaning: "mur / rempart" },
        { arabic: "يَقُول", transliteration: "yaqûl", meaning: "il dit" },
        { arabic: "رَسُول", transliteration: "rasûl", meaning: "messager" },
        { arabic: "دُرُوس", transliteration: "durûs", meaning: "leçons" },
      ],
    },
    {
      title: "Le î long (Kasra + Yâ')",
      content: "Quand une lettre porte une Kasra et est suivie d'un Yâ', le son « i » est prolongé :",
      arabicExamples: [
        { arabic: "كَبِير", transliteration: "kabîr", meaning: "grand" },
        { arabic: "صَغِير", transliteration: "ṣaghîr", meaning: "petit" },
        { arabic: "جَمِيل", transliteration: "jamîl", meaning: "beau" },
        { arabic: "طَرِيق", transliteration: "ṭarîq", meaning: "chemin" },
        { arabic: "سَعِيد", transliteration: "sa'îd", meaning: "heureux" },
      ],
    },
  ],
  qcm: [
    { question: "Quelle lettre sert de support au â long ?", options: ["و", "ي", "ا", "ه"], correctIndex: 2, explanation: "L'Alif (ا) est le support du â long." },
    { question: "Comment se forme le û long ?", options: ["Fatha + Alif", "Damma + Wâw", "Kasra + Yâ'", "Damma + Alif"], correctIndex: 1, explanation: "Le û long est formé par Damma + Wâw (ـُو)." },
    { question: "Dans le mot كِتَاب, où est la voyelle longue ?", options: ["كِـ", "ـتَا", "ـاب", "Il n'y en a pas"], correctIndex: 1, explanation: "La voyelle longue est dans ـتَاب : le Tâ' avec Fatha suivi de l'Alif donne « tâ »." },
    { question: "Comment se lit نُور ?", options: ["nar", "nîr", "nûr", "nawr"], correctIndex: 2, explanation: "نُور = nûr (Nûn + damma + Wâw = nû, puis Râ')." },
    { question: "Quelle voyelle longue est dans جَمِيل ?", options: ["â", "û", "î", "Aucune"], correctIndex: 2, explanation: "Le î long est dans جَمِيل : Mîm + kasra + Yâ' = mî." },
    { question: "La voyelle longue dure environ :", options: ["Pareil que la courte", "2 fois plus", "3 fois plus", "4 fois plus"], correctIndex: 1, explanation: "La voyelle longue dure environ 2 fois plus longtemps que la voyelle courte." },
    { question: "Comment se lit قَالَ ?", options: ["qala", "qâla", "qîla", "qûla"], correctIndex: 1, explanation: "قَالَ = qâ-la : le Qâf avec fatha + Alif donne le â long." },
    { question: "Quel mot contient un û long ?", options: ["بَاب", "كَبِير", "رَسُول", "قَلَمٌ"], correctIndex: 2, explanation: "رَسُول contient un û long (Sîn + damma + Wâw)." },
    { question: "Comment se lit صَغِير ?", options: ["ṣaghîr", "ṣughîr", "ṣaghûr", "ṣaghir"], correctIndex: 0, explanation: "صَغِير = ṣa-ghîr, avec un î long." },
    { question: "Les 3 lettres de prolongation sont :", options: ["ب ت ث", "ا و ي", "ج ح خ", "س ش ص"], correctIndex: 1, explanation: "Les 3 lettres de prolongation (madd) sont Alif (ا), Wâw (و) et Yâ' (ي)." },
  ],
  dictation: [
    { word: "بَاب", transliteration: "bâb (porte)", options: ["بَبْ", "بَاب", "بُوب", "بِيب"], correctIndex: 1 },
    { word: "نُور", transliteration: "nûr (lumière)", options: ["نَار", "نِير", "نُور", "نَوْر"], correctIndex: 2 },
    { word: "كَبِير", transliteration: "kabîr (grand)", options: ["كَبَر", "كَبُور", "كَبِير", "كُبُر"], correctIndex: 2 },
    { word: "قَالَ", transliteration: "qâla (il a dit)", options: ["قَلَ", "قَالَ", "قُولَ", "قِيلَ"], correctIndex: 1 },
    { word: "رَسُول", transliteration: "rasûl (messager)", options: ["رَسَل", "رَسِيل", "رَسُول", "رُسُل"], correctIndex: 2 },
    { word: "جَمِيل", transliteration: "jamîl (beau)", options: ["جَمَل", "جَمُول", "جَمِيل", "جُمُل"], correctIndex: 2 },
    { word: "نَام", transliteration: "nâm (il a dormi)", options: ["نَمْ", "نَام", "نُوم", "نِيم"], correctIndex: 1 },
    { word: "طَرِيق", transliteration: "ṭarîq (chemin)", options: ["طَرَق", "طَرُوق", "طَرِيق", "طُرُق"], correctIndex: 2 },
    { word: "سَعِيد", transliteration: "sa'îd (heureux)", options: ["سَعَد", "سَعُود", "سَعِيد", "سُعُد"], correctIndex: 2 },
    { word: "دُرُوس", transliteration: "durûs (leçons)", options: ["دَرَس", "دُرُوس", "دَرِيس", "دِرَاس"], correctIndex: 1 },
  ],
};

// ─── Leçon 6 : Lecture de mots simples ───
const lesson6: Lesson = {
  id: 6,
  title: "Lecture de mots simples",
  subtitle: "Premiers mots arabes",
  icon: "📝",
  theory: [
    {
      title: "Mettre en pratique",
      content: "Vous connaissez maintenant les lettres, leurs formes, les voyelles courtes et longues. Il est temps de lire vos premiers mots complets ! La méthode est toujours la même :\n\n1. Identifier chaque lettre de droite à gauche\n2. Lire la voyelle de chaque lettre\n3. Assembler les syllabes\n4. Prononcer le mot entier",
    },
    {
      title: "Mots de 2-3 lettres",
      content: "Commençons par des mots courts et fréquents :",
      arabicExamples: [
        { arabic: "أَبٌ", transliteration: "ab", meaning: "père" },
        { arabic: "أُمٌّ", transliteration: "umm", meaning: "mère" },
        { arabic: "أَخٌ", transliteration: "akh", meaning: "frère" },
        { arabic: "بَابٌ", transliteration: "bâb", meaning: "porte" },
        { arabic: "دَمٌ", transliteration: "dam", meaning: "sang" },
        { arabic: "يَدٌ", transliteration: "yad", meaning: "main" },
        { arabic: "حُبٌّ", transliteration: "ḥubb", meaning: "amour" },
        { arabic: "قَلْبٌ", transliteration: "qalb", meaning: "cœur" },
      ],
    },
    {
      title: "Mots de la vie quotidienne",
      content: "Voici des mots utiles pour enrichir votre vocabulaire :",
      arabicExamples: [
        { arabic: "كِتَابٌ", transliteration: "kitâb", meaning: "livre" },
        { arabic: "قَلَمٌ", transliteration: "qalam", meaning: "stylo" },
        { arabic: "بَيْتٌ", transliteration: "bayt", meaning: "maison" },
        { arabic: "مَاءٌ", transliteration: "mâ'", meaning: "eau" },
        { arabic: "خُبْزٌ", transliteration: "khubz", meaning: "pain" },
        { arabic: "شَمْسٌ", transliteration: "shams", meaning: "soleil" },
        { arabic: "قَمَرٌ", transliteration: "qamar", meaning: "lune" },
        { arabic: "وَلَدٌ", transliteration: "walad", meaning: "garçon" },
        { arabic: "بِنْتٌ", transliteration: "bint", meaning: "fille" },
        { arabic: "رَجُلٌ", transliteration: "rajul", meaning: "homme" },
      ],
    },
    {
      title: "Les couleurs",
      content: "Un thème amusant pour pratiquer la lecture :",
      arabicExamples: [
        { arabic: "أَبْيَضٌ", transliteration: "abyaḍ", meaning: "blanc" },
        { arabic: "أَسْوَدٌ", transliteration: "aswad", meaning: "noir" },
        { arabic: "أَحْمَرٌ", transliteration: "aḥmar", meaning: "rouge" },
        { arabic: "أَخْضَرٌ", transliteration: "akhḍar", meaning: "vert" },
        { arabic: "أَزْرَقٌ", transliteration: "azraq", meaning: "bleu" },
      ],
      tip: "Essayez de lire chaque mot lettre par lettre avant de regarder la translittération !",
    },
  ],
  qcm: [
    { question: "Que signifie كِتَابٌ ?", options: ["Stylo", "Cahier", "Livre", "Table"], correctIndex: 2, explanation: "كِتَابٌ (kitâb) signifie « livre »." },
    { question: "Comment se lit بَيْتٌ ?", options: ["bayt", "bît", "baytun", "bâtun"], correctIndex: 0, explanation: "بَيْتٌ se lit « bayt » (maison)." },
    { question: "Que signifie شَمْسٌ ?", options: ["Lune", "Étoile", "Soleil", "Ciel"], correctIndex: 2, explanation: "شَمْسٌ (shams) signifie « soleil »." },
    { question: "Que signifie قَمَرٌ ?", options: ["Soleil", "Lune", "Étoile", "Nuage"], correctIndex: 1, explanation: "قَمَرٌ (qamar) signifie « lune »." },
    { question: "Comment se lit مَاءٌ ?", options: ["mî'", "mû'", "mâ'", "maw'"], correctIndex: 2, explanation: "مَاءٌ se lit « mâ' » (eau)." },
    { question: "Que signifie وَلَدٌ ?", options: ["Fille", "Garçon", "Homme", "Femme"], correctIndex: 1, explanation: "وَلَدٌ (walad) signifie « garçon »." },
    { question: "Que signifie أَحْمَرٌ ?", options: ["Bleu", "Vert", "Rouge", "Blanc"], correctIndex: 2, explanation: "أَحْمَرٌ (aḥmar) signifie « rouge »." },
    { question: "Quel mot signifie « pain » ?", options: ["مَاءٌ", "خُبْزٌ", "حَلِيبٌ", "تُفَّاحٌ"], correctIndex: 1, explanation: "خُبْزٌ (khubz) signifie « pain »." },
    { question: "Comment se lit قَلَمٌ ?", options: ["kilam", "qalam", "qulam", "qalîm"], correctIndex: 1, explanation: "قَلَمٌ se lit « qalam » (stylo)." },
    { question: "Que signifie قَلْبٌ ?", options: ["Tête", "Main", "Cœur", "Pied"], correctIndex: 2, explanation: "قَلْبٌ (qalb) signifie « cœur »." },
  ],
  dictation: [
    { word: "أَبٌ", transliteration: "ab (père)", options: ["أَبٌ", "إِبٌ", "أُبٌ", "آبٌ"], correctIndex: 0 },
    { word: "كِتَابٌ", transliteration: "kitâb (livre)", options: ["كُتُبٌ", "كِتَابٌ", "كَتَبَ", "كَاتِبٌ"], correctIndex: 1 },
    { word: "بَيْتٌ", transliteration: "bayt (maison)", options: ["بَيْتٌ", "بَاتَ", "بِنْتٌ", "بُيُوتٌ"], correctIndex: 0 },
    { word: "شَمْسٌ", transliteration: "shams (soleil)", options: ["شَمْسٌ", "قَمَرٌ", "شَمَسَ", "شُمُسٌ"], correctIndex: 0 },
    { word: "مَاءٌ", transliteration: "mâ' (eau)", options: ["مَعَ", "مَاءٌ", "مَا", "مُوءٌ"], correctIndex: 1 },
    { word: "خُبْزٌ", transliteration: "khubz (pain)", options: ["حُبْزٌ", "خُبْزٌ", "خَبَزَ", "خُبُزٌ"], correctIndex: 1 },
    { word: "وَلَدٌ", transliteration: "walad (garçon)", options: ["وَلَدٌ", "وَالِدٌ", "وِلَادَةٌ", "أَوْلَادٌ"], correctIndex: 0 },
    { word: "قَلَمٌ", transliteration: "qalam (stylo)", options: ["كَلَمٌ", "قَلَمٌ", "قَلِمَ", "قُلُمٌ"], correctIndex: 1 },
    { word: "بِنْتٌ", transliteration: "bint (fille)", options: ["بَنَتَ", "بِنْتٌ", "بَيْتٌ", "بُنُتٌ"], correctIndex: 1 },
    { word: "رَجُلٌ", transliteration: "rajul (homme)", options: ["رَجُلٌ", "رِجَالٌ", "رَجَلَ", "رُجُلٌ"], correctIndex: 0 },
  ],
};

// ─── Leçon 7 : Le Tanwîn ───
const lesson7: Lesson = {
  id: 7,
  title: "Le Tanwîn",
  subtitle: "Les doubles voyelles",
  icon: "✨",
  theory: [
    {
      title: "Qu'est-ce que le Tanwîn ?",
      content: "Le Tanwîn (تَنْوِين) est le doublement d'une voyelle courte à la fin d'un mot. Il ajoute un son « n » à la voyelle et indique que le nom est indéfini (comme « un/une » en français).\n\n• **Tanwîn Fatha** (  ً  ) : double Fatha → son « -an »\n• **Tanwîn Damma** (  ٌ  ) : double Damma → son « -oun »\n• **Tanwîn Kasra** (  ٍ  ) : double Kasra → son « -in »",
      tip: "Le Tanwîn Fatha s'accompagne presque toujours d'un Alif support (ـًا), sauf après Tâ' marbûṭa (ة) ou Hamza sur Alif.",
    },
    {
      title: "Le Tanwîn Fatha (-an)",
      content: "Le Tanwîn Fatha donne le son « -an ». On écrit généralement un Alif de support après :",
      arabicExamples: [
        { arabic: "كِتَابًا", transliteration: "kitâban", meaning: "un livre (accusatif)" },
        { arabic: "بَيْتًا", transliteration: "baytan", meaning: "une maison (accusatif)" },
        { arabic: "وَلَدًا", transliteration: "waladan", meaning: "un garçon (accusatif)" },
      ],
    },
    {
      title: "Le Tanwîn Damma (-oun)",
      content: "Le Tanwîn Damma donne le son « -oun » (nominatif indéfini) :",
      arabicExamples: [
        { arabic: "كِتَابٌ", transliteration: "kitâboun", meaning: "un livre" },
        { arabic: "رَجُلٌ", transliteration: "rajouloun", meaning: "un homme" },
        { arabic: "بَابٌ", transliteration: "bâboun", meaning: "une porte" },
        { arabic: "قَلَمٌ", transliteration: "qalamoun", meaning: "un stylo" },
        { arabic: "دَرْسٌ", transliteration: "darsoun", meaning: "une leçon" },
      ],
    },
    {
      title: "Le Tanwîn Kasra (-in)",
      content: "Le Tanwîn Kasra donne le son « -in » (génitif indéfini) :",
      arabicExamples: [
        { arabic: "كِتَابٍ", transliteration: "kitâbin", meaning: "un livre (génitif)" },
        { arabic: "رَجُلٍ", transliteration: "rajoulin", meaning: "un homme (génitif)" },
        { arabic: "بَيْتٍ", transliteration: "baytin", meaning: "une maison (génitif)" },
      ],
    },
    {
      title: "Résumé : défini vs indéfini",
      content: "Le Tanwîn marque l'indéfinition. Comparez :\n\n• **كِتَابٌ** (kitâboun) = UN livre (indéfini)\n• **الكِتَابُ** (al-kitâbou) = LE livre (défini, avec l'article « al- »)\n\nNous verrons l'article « al- » dans les leçons suivantes.",
      tip: "Quand vous voyez ٌ ً ٍ à la fin d'un mot, c'est un Tanwîn → le nom est indéfini.",
    },
  ],
  qcm: [
    { question: "Le Tanwîn indique que le nom est :", options: ["Défini", "Indéfini", "Pluriel", "Féminin"], correctIndex: 1, explanation: "Le Tanwîn marque l'indéfinition du nom (comme « un/une » en français)." },
    { question: "Quel son donne le Tanwîn Fatha ?", options: ["-oun", "-in", "-an", "-a"], correctIndex: 2, explanation: "Le Tanwîn Fatha (  ً  ) donne le son « -an »." },
    { question: "Quel son donne le Tanwîn Damma ?", options: ["-an", "-oun", "-in", "-ou"], correctIndex: 1, explanation: "Le Tanwîn Damma (  ٌ  ) donne le son « -oun »." },
    { question: "Comment se lit كِتَابٌ ?", options: ["kitâb", "kitâboun", "kitâban", "kitâbin"], correctIndex: 1, explanation: "كِتَابٌ avec Tanwîn Damma se lit « kitâboun »." },
    { question: "Le Tanwîn Fatha est souvent accompagné de :", options: ["Un Wâw", "Un Yâ'", "Un Alif", "Rien"], correctIndex: 2, explanation: "Le Tanwîn Fatha s'accompagne presque toujours d'un Alif de support (ـًا)." },
    { question: "Comment se lit رَجُلٍ ?", options: ["rajouloun", "rajoulan", "rajoulin", "rajoul"], correctIndex: 2, explanation: "رَجُلٍ avec Tanwîn Kasra se lit « rajoulin »." },
    { question: "Quel Tanwîn dans بَابٌ ?", options: ["Tanwîn Fatha", "Tanwîn Damma", "Tanwîn Kasra", "Pas de Tanwîn"], correctIndex: 1, explanation: "Le signe ٌ est le Tanwîn Damma." },
    { question: "Combien de types de Tanwîn existe-t-il ?", options: ["1", "2", "3", "4"], correctIndex: 2, explanation: "Il y a 3 Tanwîn : Fatha (-an), Damma (-oun), Kasra (-in)." },
    { question: "Le Tanwîn ajoute quel son à la voyelle ?", options: ["m", "l", "n", "r"], correctIndex: 2, explanation: "Le Tanwîn ajoute un son « n » à la voyelle." },
    { question: "Quel est l'équivalent français du Tanwîn ?", options: ["Le/La", "Un/Une", "Ce/Cette", "Mon/Ma"], correctIndex: 1, explanation: "Le Tanwîn marque l'indéfinition, comme « un/une » en français." },
  ],
  dictation: [
    { word: "كِتَابٌ", transliteration: "kitâboun (un livre)", options: ["كِتَابٌ", "كِتَابً", "كِتَابٍ", "كِتَابُ"], correctIndex: 0 },
    { word: "رَجُلًا", transliteration: "rajoulan (un homme, acc.)", options: ["رَجُلٌ", "رَجُلًا", "رَجُلٍ", "رَجُلَ"], correctIndex: 1 },
    { word: "بَيْتٍ", transliteration: "baytin (une maison, gén.)", options: ["بَيْتٌ", "بَيْتًا", "بَيْتٍ", "بَيْتِ"], correctIndex: 2 },
    { word: "قَلَمٌ", transliteration: "qalamoun (un stylo)", options: ["قَلَمٌ", "قَلَمًا", "قَلَمٍ", "قَلَمُ"], correctIndex: 0 },
    { word: "دَرْسًا", transliteration: "darsan (une leçon, acc.)", options: ["دَرْسٌ", "دَرْسًا", "دَرْسٍ", "دَرْسَ"], correctIndex: 1 },
    { word: "بَابٍ", transliteration: "bâbin (une porte, gén.)", options: ["بَابٌ", "بَابًا", "بَابٍ", "بَابِ"], correctIndex: 2 },
    { word: "وَلَدٌ", transliteration: "waladoun (un garçon)", options: ["وَلَدٌ", "وَلَدًا", "وَلَدٍ", "وَلَدُ"], correctIndex: 0 },
    { word: "شَمْسًا", transliteration: "shamsan (un soleil, acc.)", options: ["شَمْسٌ", "شَمْسًا", "شَمْسٍ", "شَمْسَ"], correctIndex: 1 },
    { word: "مَاءٍ", transliteration: "mâ'in (une eau, gén.)", options: ["مَاءٌ", "مَاءً", "مَاءٍ", "مَاءَ"], correctIndex: 2 },
    { word: "نُورٌ", transliteration: "nûroun (une lumière)", options: ["نُورٌ", "نُورًا", "نُورٍ", "نُورُ"], correctIndex: 0 },
  ],
};

// ─── Leçon 8 : La Shadda ───
const lesson8: Lesson = {
  id: 8,
  title: "La Shadda",
  subtitle: "Le redoublement des lettres",
  icon: "💪",
  theory: [
    {
      title: "Qu'est-ce que la Shadda ?",
      content: "La Shadda (  ّ  ) est un petit signe en forme de « w » placé au-dessus d'une lettre. Elle indique que cette lettre est doublée (prononcée deux fois) :\n\n• La première occurrence est « morte » (avec Soukoun)\n• La seconde porte la voyelle indiquée\n\nExemple : **مُحَمَّد** → le Mîm est doublé : muḥam-mad (et non muḥamad).",
      tip: "La Shadda change la signification ! عَلَمَ (il a marqué) ≠ عَلَّمَ (il a enseigné). Prononcez bien le doublement.",
    },
    {
      title: "La Shadda avec les voyelles",
      content: "La Shadda se combine avec les voyelles courtes. La voyelle s'écrit au-dessus ou en dessous de la Shadda :\n\n• Shadda + Fatha : ـَّ (prononcé : consonne doublée + a)\n• Shadda + Damma : ـُّ (prononcé : consonne doublée + ou)\n• Shadda + Kasra : ـِّ (prononcé : consonne doublée + i)",
      arabicExamples: [
        { arabic: "أُمَّ", transliteration: "umma", meaning: "mère (cas direct)" },
        { arabic: "حَقٌّ", transliteration: "ḥaqq", meaning: "vérité / droit" },
        { arabic: "رَبٌّ", transliteration: "rabb", meaning: "seigneur" },
        { arabic: "حُبٌّ", transliteration: "ḥubb", meaning: "amour" },
        { arabic: "شَكٌّ", transliteration: "shakk", meaning: "doute" },
      ],
    },
    {
      title: "Exemples de mots courants avec Shadda",
      content: "La Shadda est très fréquente en arabe. Voici des mots essentiels à connaître :",
      arabicExamples: [
        { arabic: "مُحَمَّدٌ", transliteration: "muḥammad", meaning: "Muhammad (prénom)" },
        { arabic: "عَلَّمَ", transliteration: "'allama", meaning: "il a enseigné" },
        { arabic: "صَلَّى", transliteration: "ṣallâ", meaning: "il a prié" },
        { arabic: "تَعَلَّمَ", transliteration: "ta'allama", meaning: "il a appris" },
        { arabic: "كُلٌّ", transliteration: "kull", meaning: "tout / chaque" },
        { arabic: "إِنَّ", transliteration: "inna", meaning: "certes / vraiment" },
        { arabic: "أَنَّ", transliteration: "anna", meaning: "que (conjonction)" },
        { arabic: "ثُمَّ", transliteration: "thumma", meaning: "ensuite" },
      ],
    },
  ],
  qcm: [
    { question: "Que signifie la Shadda ?", options: ["La lettre est supprimée", "La lettre est doublée", "La lettre est longue", "La lettre est silencieuse"], correctIndex: 1, explanation: "La Shadda indique que la lettre est doublée (prononcée deux fois)." },
    { question: "Comment se lit حَقٌّ ?", options: ["ḥaq", "ḥaqq", "ḥâq", "ḥaqoun"], correctIndex: 1, explanation: "حَقٌّ se lit « ḥaqq » — le Qâf est doublé." },
    { question: "La Shadda ressemble à :", options: ["Un petit rond", "Un petit w", "Un trait", "Un point"], correctIndex: 1, explanation: "La Shadda est un petit signe en forme de « w » placé au-dessus de la lettre." },
    { question: "Comment se décompose مَّ ?", options: ["m seul", "m + m + voyelle", "ma + a", "mm sans voyelle"], correctIndex: 1, explanation: "La Shadda sur le Mîm = deux Mîm : le premier sans voyelle, le second avec la voyelle indiquée." },
    { question: "Que signifie عَلَّمَ ?", options: ["Il a su", "Il a marqué", "Il a enseigné", "Il a appris"], correctIndex: 2, explanation: "عَلَّمَ ('allama) signifie « il a enseigné »." },
    { question: "Comment se lit أُمٌّ ?", options: ["um", "umm", "ûm", "am"], correctIndex: 1, explanation: "أُمٌّ se lit « umm » — le Mîm est doublé." },
    { question: "La Shadda peut-elle se combiner avec le Tanwîn ?", options: ["Oui", "Non", "Seulement avec la Fatha", "Seulement en fin de mot"], correctIndex: 0, explanation: "Oui ! Exemple : حَقٌّ (ḥaqqoun) a Shadda + Tanwîn Damma." },
    { question: "Que signifie رَبٌّ ?", options: ["Porte", "Livre", "Seigneur", "Père"], correctIndex: 2, explanation: "رَبٌّ (rabb) signifie « seigneur »." },
    { question: "Comment se lit صَلَّى ?", options: ["ṣalâ", "ṣallâ", "ṣilâ", "ṣallay"], correctIndex: 1, explanation: "صَلَّى se lit « ṣallâ » — le Lâm est doublé." },
    { question: "Comment se lit كُلٌّ ?", options: ["kul", "kull", "kûl", "kal"], correctIndex: 1, explanation: "كُلٌّ se lit « kull » — le Lâm est doublé." },
  ],
  dictation: [
    { word: "أُمٌّ", transliteration: "umm (mère)", options: ["أُمٌ", "أُمٌّ", "أَمٌ", "إِمٌّ"], correctIndex: 1 },
    { word: "حَقٌّ", transliteration: "ḥaqq (vérité)", options: ["حَقٌ", "حَقٌّ", "خَقٌّ", "حَقَ"], correctIndex: 1 },
    { word: "رَبٌّ", transliteration: "rabb (seigneur)", options: ["رَبٌ", "رَبٌّ", "رُبٌّ", "رَبَ"], correctIndex: 1 },
    { word: "عَلَّمَ", transliteration: "'allama (il a enseigné)", options: ["عَلَمَ", "عَلَّمَ", "عُلِّمَ", "عَالَمَ"], correctIndex: 1 },
    { word: "مُحَمَّدٌ", transliteration: "muḥammad", options: ["مُحَمَدٌ", "مُحَمَّدٌ", "مَحْمَدٌ", "مُحَمِّدٌ"], correctIndex: 1 },
    { word: "حُبٌّ", transliteration: "ḥubb (amour)", options: ["حُبٌ", "حُبٌّ", "حَبٌّ", "خُبٌّ"], correctIndex: 1 },
    { word: "إِنَّ", transliteration: "inna (certes)", options: ["إِنَ", "إِنَّ", "أَنَّ", "إِنْ"], correctIndex: 1 },
    { word: "صَلَّى", transliteration: "ṣallâ (il a prié)", options: ["صَلَى", "صَلَّى", "صُلِّيَ", "صَالَ"], correctIndex: 1 },
    { word: "كُلٌّ", transliteration: "kull (tout)", options: ["كُلٌ", "كُلٌّ", "كَلٌّ", "كِلٌّ"], correctIndex: 1 },
    { word: "شَكٌّ", transliteration: "shakk (doute)", options: ["شَكٌ", "شَكٌّ", "شِكٌّ", "صَكٌّ"], correctIndex: 1 },
  ],
};

// ─── Leçon 9 : Lecture de phrases ───
const lesson9: Lesson = {
  id: 9,
  title: "Lecture de phrases",
  subtitle: "Construire et lire des phrases complètes",
  icon: "💬",
  theory: [
    {
      title: "Des mots aux phrases",
      content: "Vous maîtrisez maintenant les lettres, les voyelles, le Tanwîn et la Shadda. Il est temps d'assembler des phrases complètes ! En arabe, la structure de base est :\n\n• **Phrase nominale** : Sujet + Prédicat (pas de verbe « être »)\n  هٰذَا كِتَابٌ = Ceci (est) un livre\n\n• **Phrase verbale** : Verbe + Sujet + Complément\n  كَتَبَ الوَلَدُ الدَّرْسَ = Le garçon a écrit la leçon",
    },
    {
      title: "L'article défini « al- »",
      content: "Pour rendre un nom défini (le/la), on ajoute الـ (al-) devant :\n\n• كِتَابٌ → الكِتَابُ (un livre → LE livre)\n• بَيْتٌ → البَيْتُ (une maison → LA maison)\n\nAttention : avec les « lettres solaires » (ت ث د ذ ر ز س ش ص ض ط ظ ل ن), le « l » de l'article s'assimile à la lettre suivante :\n• الشَّمْسُ se prononce « ash-shamsou » (et non « al-shamsou »)",
      arabicExamples: [
        { arabic: "الكِتَابُ", transliteration: "al-kitâbou", meaning: "le livre" },
        { arabic: "البَيْتُ", transliteration: "al-baytou", meaning: "la maison" },
        { arabic: "الشَّمْسُ", transliteration: "ash-shamsou", meaning: "le soleil" },
        { arabic: "القَمَرُ", transliteration: "al-qamarou", meaning: "la lune" },
        { arabic: "الوَلَدُ", transliteration: "al-waladou", meaning: "le garçon" },
      ],
    },
    {
      title: "Phrases simples à lire",
      content: "Entraînez-vous à lire ces phrases courtes :",
      arabicExamples: [
        { arabic: "هٰذَا كِتَابٌ", transliteration: "hâdhâ kitâboun", meaning: "Ceci est un livre" },
        { arabic: "هٰذِهِ بِنْتٌ", transliteration: "hâdhihi bintoun", meaning: "Ceci est une fille" },
        { arabic: "البَيْتُ كَبِيرٌ", transliteration: "al-baytou kabîroun", meaning: "La maison est grande" },
        { arabic: "الوَلَدُ صَغِيرٌ", transliteration: "al-waladou ṣaghîroun", meaning: "Le garçon est petit" },
        { arabic: "الكِتَابُ جَدِيدٌ", transliteration: "al-kitâbou jadîdoun", meaning: "Le livre est nouveau" },
      ],
    },
    {
      title: "Phrases avec des verbes",
      content: "Voici des phrases verbales simples au passé :",
      arabicExamples: [
        { arabic: "ذَهَبَ الوَلَدُ", transliteration: "dhahaba al-waladou", meaning: "Le garçon est parti" },
        { arabic: "كَتَبَ الطَّالِبُ", transliteration: "kataba aṭ-ṭâlibou", meaning: "L'étudiant a écrit" },
        { arabic: "جَلَسَ الرَّجُلُ", transliteration: "jalasa ar-rajoulou", meaning: "L'homme s'est assis" },
        { arabic: "فَتَحَ البَابَ", transliteration: "fataḥa al-bâba", meaning: "Il a ouvert la porte" },
        { arabic: "شَرِبَ المَاءَ", transliteration: "shariba al-mâ'a", meaning: "Il a bu l'eau" },
      ],
      tip: "Remarquez que le verbe vient souvent en premier en arabe (Verbe-Sujet-Complément), contrairement au français (Sujet-Verbe-Complément).",
    },
  ],
  qcm: [
    { question: "Que signifie هٰذَا كِتَابٌ ?", options: ["Ce livre est grand", "Ceci est un livre", "Le livre est nouveau", "Un livre est ici"], correctIndex: 1, explanation: "هٰذَا كِتَابٌ = Ceci est un livre (phrase nominale)." },
    { question: "Comment dit-on « le livre » en arabe ?", options: ["كِتَابٌ", "الكِتَابُ", "كِتَابًا", "بِكِتَابٍ"], correctIndex: 1, explanation: "On ajoute l'article الـ : الكِتَابُ = le livre." },
    { question: "L'article الـ se prononce « al- » devant toutes les lettres ?", options: ["Oui, toujours", "Non, il s'assimile devant les lettres solaires", "Seulement en début de phrase", "Jamais"], correctIndex: 1, explanation: "Devant les lettres solaires, le « l » s'assimile (ex : الشَّمْسُ → ash-shamsou)." },
    { question: "Que signifie البَيْتُ كَبِيرٌ ?", options: ["La maison est petite", "La maison est grande", "Une grande maison", "La porte de la maison"], correctIndex: 1, explanation: "البَيْتُ كَبِيرٌ = La maison (est) grande." },
    { question: "Quel est l'ordre habituel en phrase verbale arabe ?", options: ["Sujet-Verbe-Complément", "Verbe-Sujet-Complément", "Complément-Verbe-Sujet", "Sujet-Complément-Verbe"], correctIndex: 1, explanation: "L'ordre classique en arabe est Verbe-Sujet-Complément." },
    { question: "Que signifie ذَهَبَ الوَلَدُ ?", options: ["Le garçon a mangé", "Le garçon est parti", "Le garçon s'est assis", "Le garçon a écrit"], correctIndex: 1, explanation: "ذَهَبَ الوَلَدُ = Le garçon est parti." },
    { question: "Comment se prononce الشَّمْسُ ?", options: ["al-shamsou", "ash-shamsou", "al-shams", "a-shams"], correctIndex: 1, explanation: "Le Shîn est une lettre solaire, donc الشَّمْسُ → ash-shamsou." },
    { question: "En phrase nominale arabe, le verbe « être » :", options: ["Est toujours exprimé", "N'est pas exprimé au présent", "Est placé à la fin", "Est conjugué"], correctIndex: 1, explanation: "En arabe, le verbe « être » au présent est sous-entendu dans la phrase nominale." },
    { question: "Que signifie فَتَحَ البَابَ ?", options: ["Il a fermé le livre", "Il a ouvert la porte", "Il a écrit la leçon", "Il a bu l'eau"], correctIndex: 1, explanation: "فَتَحَ البَابَ = Il a ouvert la porte." },
    { question: "Que signifie هٰذِهِ بِنْتٌ ?", options: ["Cette fille est belle", "Ceci est une fille", "La fille est grande", "Où est la fille ?"], correctIndex: 1, explanation: "هٰذِهِ بِنْتٌ = Ceci est une fille." },
  ],
  dictation: [
    { word: "الكِتَابُ", transliteration: "al-kitâbou (le livre)", options: ["كِتَابٌ", "الكِتَابُ", "كِتَابًا", "كُتُبٌ"], correctIndex: 1 },
    { word: "البَيْتُ", transliteration: "al-baytou (la maison)", options: ["بَيْتٌ", "البَيْتُ", "بُيُوتٌ", "بَيْتًا"], correctIndex: 1 },
    { word: "الشَّمْسُ", transliteration: "ash-shamsou (le soleil)", options: ["شَمْسٌ", "الشَّمْسُ", "شُمُوسٌ", "شَمْسًا"], correctIndex: 1 },
    { word: "هٰذَا", transliteration: "hâdhâ (ceci, masc.)", options: ["هٰذِهِ", "هٰذَا", "ذٰلِكَ", "هُوَ"], correctIndex: 1 },
    { word: "كَبِيرٌ", transliteration: "kabîroun (grand)", options: ["صَغِيرٌ", "كَبِيرٌ", "جَمِيلٌ", "جَدِيدٌ"], correctIndex: 1 },
    { word: "ذَهَبَ", transliteration: "dhahaba (il est parti)", options: ["كَتَبَ", "جَلَسَ", "ذَهَبَ", "فَتَحَ"], correctIndex: 2 },
    { word: "الوَلَدُ", transliteration: "al-waladou (le garçon)", options: ["وَلَدٌ", "الوَلَدُ", "أَوْلَادٌ", "وَلَدًا"], correctIndex: 1 },
    { word: "جَلَسَ", transliteration: "jalasa (il s'est assis)", options: ["جَلَسَ", "جُلُوسٌ", "جَالِسٌ", "جَلْسَةٌ"], correctIndex: 0 },
    { word: "القَمَرُ", transliteration: "al-qamarou (la lune)", options: ["قَمَرٌ", "القَمَرُ", "أَقْمَارٌ", "قَمَرًا"], correctIndex: 1 },
    { word: "شَرِبَ", transliteration: "shariba (il a bu)", options: ["كَتَبَ", "شَرِبَ", "ضَرَبَ", "شَرَبَ"], correctIndex: 1 },
  ],
};

// ─── Leçon 10 : Dictée finale ───
const lesson10: Lesson = {
  id: 10,
  title: "Dictée finale",
  subtitle: "Évaluation écrite du niveau 1",
  icon: "🏆",
  theory: [
    {
      title: "Bravo, vous y êtes !",
      content: "Cette dernière leçon est une évaluation complète de tout ce que vous avez appris au Niveau 1 :\n\n✅ Les 28 lettres de l'alphabet\n✅ Les 4 formes de chaque lettre\n✅ Les voyelles courtes (Fatha, Damma, Kasra, Soukoun)\n✅ La lecture de syllabes\n✅ Les voyelles longues (â, û, î)\n✅ La lecture de mots\n✅ Le Tanwîn\n✅ La Shadda\n✅ La lecture de phrases\n\nLes exercices et la dictée qui suivent couvrent l'ensemble de ces notions.",
    },
    {
      title: "Conseils pour l'évaluation",
      content: "• Lisez chaque question attentivement\n• Pour la dictée, écoutez bien le mot avant de répondre\n• Prenez votre temps : la précision est plus importante que la vitesse\n• Si vous obtenez un score parfait, vous êtes prêt(e) pour le Niveau 2 !",
      tip: "N'hésitez pas à revenir sur les leçons précédentes si certains points ne sont pas clairs. La révision fait partie de l'apprentissage !",
    },
  ],
  qcm: [
    { question: "Combien de lettres a l'alphabet arabe ?", options: ["24", "26", "28", "30"], correctIndex: 2, explanation: "28 lettres." },
    { question: "Quel signe donne le son « a » ?", options: ["Damma", "Kasra", "Fatha", "Soukoun"], correctIndex: 2, explanation: "La Fatha donne le son « a »." },
    { question: "Les voyelles longues sont formées avec :", options: ["ب ت ث", "ا و ي", "ج ح خ", "د ذ ر"], correctIndex: 1, explanation: "Les lettres de prolongation sont Alif, Wâw et Yâ'." },
    { question: "Le Tanwîn Damma donne le son :", options: ["-an", "-in", "-oun", "-a"], correctIndex: 2, explanation: "Tanwîn Damma = « -oun »." },
    { question: "La Shadda indique :", options: ["Une voyelle longue", "Un doublement de lettre", "L'absence de voyelle", "La fin du mot"], correctIndex: 1, explanation: "La Shadda indique le doublement de la lettre." },
    { question: "Comment dit-on « le soleil » en arabe ?", options: ["شَمْسٌ", "الشَّمْسُ", "شَمْسًا", "شُمُوسٌ"], correctIndex: 1, explanation: "الشَّمْسُ = le soleil (avec article défini)." },
    { question: "Que signifie كَتَبَ ?", options: ["Il a lu", "Il a écrit", "Il a bu", "Il a mangé"], correctIndex: 1, explanation: "كَتَبَ = il a écrit." },
    { question: "Combien de lettres non-liantes y a-t-il ?", options: ["4", "5", "6", "7"], correctIndex: 2, explanation: "6 lettres non-liantes : ا د ذ ر ز و." },
    { question: "Le verbe arabe en phrase verbale se place :", options: ["Après le sujet", "En premier", "À la fin", "Au milieu"], correctIndex: 1, explanation: "L'ordre classique est Verbe-Sujet-Complément." },
    { question: "Comment se lit جَمِيلٌ ?", options: ["jamal", "jamîl", "jamûl", "jumul"], correctIndex: 1, explanation: "جَمِيلٌ = jamîl (beau), avec voyelle longue î." },
    { question: "Que signifie هٰذَا بَيْتٌ ?", options: ["La maison est belle", "Ceci est une maison", "Cette maison", "Où est la maison ?"], correctIndex: 1, explanation: "هٰذَا بَيْتٌ = Ceci est une maison." },
    { question: "Quel Tanwîn est dans كِتَابٍ ?", options: ["Fatha", "Damma", "Kasra", "Pas de Tanwîn"], correctIndex: 2, explanation: "Le signe ٍ est le Tanwîn Kasra." },
  ],
  dictation: [
    { word: "مُحَمَّدٌ", transliteration: "muḥammad (prénom)", options: ["مُحَمَدٌ", "مُحَمَّدٌ", "مَحْمُودٌ", "مُحَمِّدٌ"], correctIndex: 1 },
    { word: "الكِتَابُ جَمِيلٌ", transliteration: "al-kitâbou jamîl (le livre est beau)", options: ["كِتَابٌ جَمِيلٌ", "الكِتَابُ جَمِيلٌ", "الكِتَابُ كَبِيرٌ", "كِتَابٌ جَدِيدٌ"], correctIndex: 1 },
    { word: "ذَهَبَ الرَّجُلُ", transliteration: "dhahaba ar-rajoulou (l'homme est parti)", options: ["جَلَسَ الرَّجُلُ", "ذَهَبَ الوَلَدُ", "ذَهَبَ الرَّجُلُ", "كَتَبَ الرَّجُلُ"], correctIndex: 2 },
    { word: "بَابٌ", transliteration: "bâboun (une porte)", options: ["بَابٌ", "بَابُ", "بَابًا", "بَابٍ"], correctIndex: 0 },
    { word: "هٰذِهِ شَمْسٌ", transliteration: "hâdhihi shamsoun (ceci est un soleil)", options: ["هٰذَا شَمْسٌ", "هٰذِهِ شَمْسٌ", "هٰذِهِ قَمَرٌ", "الشَّمْسُ"], correctIndex: 1 },
    { word: "عَلَّمَ", transliteration: "'allama (il a enseigné)", options: ["عَلَمَ", "عَلَّمَ", "عِلْمٌ", "عَالِمٌ"], correctIndex: 1 },
    { word: "نُورٌ", transliteration: "nûroun (lumière)", options: ["نَارٌ", "نُورٌ", "نِيرٌ", "نَوْرٌ"], correctIndex: 1 },
    { word: "كُلُّ وَلَدٍ", transliteration: "koullu waladin (chaque garçon)", options: ["كُلُّ وَلَدٍ", "كُلٌّ وَلَدٌ", "كِلَا وَلَدٌ", "كُلُّ بِنْتٍ"], correctIndex: 0 },
    { word: "فَتَحَ البَابَ", transliteration: "fataḥa al-bâba (il a ouvert la porte)", options: ["فَتَحَ البَابَ", "كَتَبَ البَابَ", "فَتَحَ الكِتَابَ", "فُتِحَ البَابُ"], correctIndex: 0 },
    { word: "القَمَرُ جَمِيلٌ", transliteration: "al-qamarou jamîl (la lune est belle)", options: ["القَمَرُ كَبِيرٌ", "القَمَرُ جَمِيلٌ", "الشَّمْسُ جَمِيلَةٌ", "قَمَرٌ جَدِيدٌ"], correctIndex: 1 },
    { word: "صَغِيرٌ", transliteration: "ṣaghîroun (petit)", options: ["صَغِيرٌ", "كَبِيرٌ", "صَغِيرًا", "صُغْرٌ"], correctIndex: 0 },
    { word: "إِنَّ الحَقَّ", transliteration: "inna al-ḥaqqa (certes la vérité)", options: ["أَنَّ الحَقَّ", "إِنَّ الحَقَّ", "إِنَّ الحُبَّ", "إِنْ حَقٌّ"], correctIndex: 1 },
  ],
};

export const niveau1Lessons: Lesson[] = [
  lesson1, lesson2, lesson3, lesson4, lesson5,
  lesson6, lesson7, lesson8, lesson9, lesson10,
];

// Static exercise data for Arabic learning

export interface QCMQuestion {
  id: string;
  letter: string;
  audio?: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ComprehensionExercise {
  id: string;
  title: string;
  text: string;
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
  }[];
}

export interface GrammarExercise {
  id: string;
  title: string;
  rule: string;
  examples: string[];
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

// ─── Niveau 1 ───

export const qcmNiveau1: QCMQuestion[] = [
  {
    id: "q1-1",
    letter: "ا",
    question: "Quel est le nom de cette lettre ?",
    options: ["Alif", "Ba", "Ta", "Tha"],
    correctIndex: 0,
    explanation: "C'est la lettre Alif (ا), la première lettre de l'alphabet arabe.",
  },
  {
    id: "q1-2",
    letter: "ب",
    question: "Quel est le nom de cette lettre ?",
    options: ["Ta", "Ba", "Nun", "Ya"],
    correctIndex: 1,
    explanation: "C'est la lettre Ba (ب), elle se prononce comme le 'b' français.",
  },
  {
    id: "q1-3",
    letter: "ت",
    question: "Quel est le nom de cette lettre ?",
    options: ["Tha", "Sin", "Ta", "Jim"],
    correctIndex: 2,
    explanation: "C'est la lettre Ta (ت), elle se prononce comme le 't' français.",
  },
  {
    id: "q1-4",
    letter: "ث",
    question: "Quel est le nom de cette lettre ?",
    options: ["Ta", "Tha", "Sin", "Shin"],
    correctIndex: 1,
    explanation: "C'est la lettre Tha (ث), elle se prononce comme le 'th' anglais dans 'think'.",
  },
  {
    id: "q1-5",
    letter: "ج",
    question: "Quel est le nom de cette lettre ?",
    options: ["Ha", "Kha", "Jim", "Dal"],
    correctIndex: 2,
    explanation: "C'est la lettre Jim (ج), elle se prononce comme le 'j' français.",
  },
  {
    id: "q1-6",
    letter: "ح",
    question: "Quel est le nom de cette lettre ?",
    options: ["Ha", "Kha", "Jim", "Ha (pharyngale)"],
    correctIndex: 3,
    explanation: "C'est la lettre Ha (ح), une consonne pharyngale sans équivalent en français.",
  },
  {
    id: "q1-7",
    letter: "خ",
    question: "Quel est le nom de cette lettre ?",
    options: ["Ha", "Kha", "Ghayn", "Qaf"],
    correctIndex: 1,
    explanation: "C'est la lettre Kha (خ), elle se prononce comme la 'jota' espagnole.",
  },
  {
    id: "q1-8",
    letter: "د",
    question: "Quel est le nom de cette lettre ?",
    options: ["Dhal", "Ra", "Dal", "Zay"],
    correctIndex: 2,
    explanation: "C'est la lettre Dal (د), elle se prononce comme le 'd' français.",
  },
  {
    id: "q1-9",
    letter: "ر",
    question: "Quel est le nom de cette lettre ?",
    options: ["Ra", "Zay", "Sin", "Dal"],
    correctIndex: 0,
    explanation: "C'est la lettre Ra (ر), elle se prononce comme un 'r' roulé.",
  },
  {
    id: "q1-10",
    letter: "س",
    question: "Quel est le nom de cette lettre ?",
    options: ["Shin", "Sad", "Sin", "Zay"],
    correctIndex: 2,
    explanation: "C'est la lettre Sin (س), elle se prononce comme le 's' français.",
  },
];

export const qcmNiveau2: QCMQuestion[] = [
  {
    id: "q2-1",
    letter: "ص",
    question: "Quel est le nom de cette lettre ?",
    options: ["Sin", "Sad", "Dad", "Shin"],
    correctIndex: 1,
    explanation: "C'est la lettre Sad (ص), une consonne emphatique.",
  },
  {
    id: "q2-2",
    letter: "ض",
    question: "Quel est le nom de cette lettre ?",
    options: ["Dad", "Ta emphatique", "Dha", "Sad"],
    correctIndex: 0,
    explanation: "C'est la lettre Dad (ض), unique à la langue arabe.",
  },
  {
    id: "q2-3",
    letter: "ط",
    question: "Quel est le nom de cette lettre ?",
    options: ["Ta", "Ta emphatique (Ṭa)", "Dha", "Sad"],
    correctIndex: 1,
    explanation: "C'est la lettre Ṭa (ط), un 't' emphatique.",
  },
  {
    id: "q2-4",
    letter: "ع",
    question: "Quel est le nom de cette lettre ?",
    options: ["Ghayn", "Ayn", "Ha", "Hamza"],
    correctIndex: 1,
    explanation: "C'est la lettre Ayn (ع), son pharyngal typique de l'arabe.",
  },
  {
    id: "q2-5",
    letter: "غ",
    question: "Quel est le nom de cette lettre ?",
    options: ["Ayn", "Ghayn", "Qaf", "Kha"],
    correctIndex: 1,
    explanation: "C'est la lettre Ghayn (غ), similaire au 'r' grasseyé parisien.",
  },
  {
    id: "q2-6",
    letter: "ف",
    question: "Quel est le nom de cette lettre ?",
    options: ["Qaf", "Fa", "Kaf", "Waw"],
    correctIndex: 1,
    explanation: "C'est la lettre Fa (ف), elle se prononce comme le 'f' français.",
  },
  {
    id: "q2-7",
    letter: "ق",
    question: "Quel est le nom de cette lettre ?",
    options: ["Kaf", "Ghayn", "Qaf", "Fa"],
    correctIndex: 2,
    explanation: "C'est la lettre Qaf (ق), un 'k' uvulaire prononcé au fond de la gorge.",
  },
  {
    id: "q2-8",
    letter: "ك",
    question: "Quel est le nom de cette lettre ?",
    options: ["Qaf", "Kaf", "Lam", "Mim"],
    correctIndex: 1,
    explanation: "C'est la lettre Kaf (ك), elle se prononce comme le 'k' français.",
  },
  {
    id: "q2-9",
    letter: "ل",
    question: "Quel est le nom de cette lettre ?",
    options: ["Mim", "Nun", "Lam", "Waw"],
    correctIndex: 2,
    explanation: "C'est la lettre Lam (ل), elle se prononce comme le 'l' français.",
  },
  {
    id: "q2-10",
    letter: "م",
    question: "Quel est le nom de cette lettre ?",
    options: ["Nun", "Mim", "Waw", "Ya"],
    correctIndex: 1,
    explanation: "C'est la lettre Mim (م), elle se prononce comme le 'm' français.",
  },
];

// ─── Compréhension ───

export const comprehensionNiveau1: ComprehensionExercise[] = [
  {
    id: "c1-1",
    title: "Les salutations",
    text: "السَّلَامُ عَلَيْكُمْ! أَنَا أَحْمَدُ. أَنَا طَالِبٌ. أَنَا مِنْ فَرَنْسَا.\n\nTraduction : Paix sur vous ! Je suis Ahmed. Je suis étudiant. Je suis de France.",
    questions: [
      {
        question: "Comment s'appelle la personne ?",
        options: ["Mohamed", "Ahmed", "Ali", "Omar"],
        correctIndex: 1,
      },
      {
        question: "Que fait Ahmed ?",
        options: ["Il est professeur", "Il est médecin", "Il est étudiant", "Il est ingénieur"],
        correctIndex: 2,
      },
      {
        question: "D'où vient Ahmed ?",
        options: ["Du Maroc", "D'Algérie", "De Tunisie", "De France"],
        correctIndex: 3,
      },
    ],
  },
  {
    id: "c1-2",
    title: "La famille",
    text: "هَذَا أَبِي وَهَذِهِ أُمِّي. عِنْدِي أَخٌ وَأُخْتٌ. اِسْمُ أَخِي يُوسُفُ.\n\nTraduction : Voici mon père et voici ma mère. J'ai un frère et une sœur. Le nom de mon frère est Youssef.",
    questions: [
      {
        question: "Combien de frères a la personne ?",
        options: ["Zéro", "Un", "Deux", "Trois"],
        correctIndex: 1,
      },
      {
        question: "Comment s'appelle le frère ?",
        options: ["Ahmed", "Mohamed", "Youssef", "Ali"],
        correctIndex: 2,
      },
      {
        question: "Qui sont les personnes mentionnées en premier ?",
        options: ["Son frère et sa sœur", "Ses amis", "Son père et sa mère", "Ses cousins"],
        correctIndex: 2,
      },
    ],
  },
];

export const comprehensionNiveau2: ComprehensionExercise[] = [
  {
    id: "c2-1",
    title: "À l'école",
    text: "أَذْهَبُ إِلَى الْمَدْرَسَةِ كُلَّ يَوْمٍ. أَدْرُسُ اللُّغَةَ الْعَرَبِيَّةَ وَالرِّيَاضِيَّاتِ وَالْعُلُومَ. مُعَلِّمِي اسْمُهُ الأُسْتَاذُ كَرِيمٌ. هُوَ مُعَلِّمٌ جَيِّدٌ.\n\nTraduction : Je vais à l'école chaque jour. J'étudie la langue arabe, les mathématiques et les sciences. Mon professeur s'appelle Monsieur Karim. C'est un bon professeur.",
    questions: [
      {
        question: "Combien de matières sont mentionnées ?",
        options: ["Deux", "Trois", "Quatre", "Cinq"],
        correctIndex: 1,
      },
      {
        question: "Comment s'appelle le professeur ?",
        options: ["Ahmed", "Karim", "Youssef", "Omar"],
        correctIndex: 1,
      },
      {
        question: "Comment est décrit le professeur ?",
        options: ["Sévère", "Bon", "Jeune", "Ancien"],
        correctIndex: 1,
      },
    ],
  },
  {
    id: "c2-2",
    title: "Au marché",
    text: "ذَهَبْتُ إِلَى السُّوقِ مَعَ أُمِّي. اشْتَرَيْنَا خُبْزًا وَحَلِيبًا وَفَوَاكِهَ. كَانَ الطَّقْسُ حَارًّا جِدًّا.\n\nTraduction : Je suis allé au marché avec ma mère. Nous avons acheté du pain, du lait et des fruits. Le temps était très chaud.",
    questions: [
      {
        question: "Avec qui est allé(e) la personne au marché ?",
        options: ["Son père", "Son frère", "Sa mère", "Son ami"],
        correctIndex: 2,
      },
      {
        question: "Qu'ont-ils acheté ?",
        options: [
          "Du pain, du lait et des fruits",
          "De la viande et des légumes",
          "Du riz et du poulet",
          "Des vêtements",
        ],
        correctIndex: 0,
      },
      {
        question: "Comment était le temps ?",
        options: ["Froid", "Pluvieux", "Très chaud", "Nuageux"],
        correctIndex: 2,
      },
    ],
  },
];

// ─── Grammaire ───

export const grammarNiveau1: GrammarExercise[] = [
  {
    id: "g1-1",
    title: "L'article défini (ال)",
    rule: "En arabe, l'article défini « ال » (al-) se place devant le nom. Il est l'équivalent de « le / la / les » en français. Il n'y a qu'un seul article défini pour tous les genres et nombres.",
    examples: ["كِتَابٌ → الكِتَابُ (un livre → le livre)", "مَدْرَسَةٌ → المَدْرَسَةُ (une école → l'école)"],
    questions: [
      {
        question: "Comment dit-on « le garçon » en arabe ?",
        options: ["وَلَدٌ", "الوَلَدُ", "وَلَدَيْنِ", "أَوْلَادٌ"],
        correctIndex: 1,
        explanation: "On ajoute ال devant وَلَدٌ pour obtenir الوَلَدُ (le garçon).",
      },
      {
        question: "Quel est l'article défini en arabe ?",
        options: ["إِلَى", "فِي", "ال", "مِنْ"],
        correctIndex: 2,
        explanation: "L'article défini en arabe est ال (al-).",
      },
    ],
  },
  {
    id: "g1-2",
    title: "Les pronoms personnels",
    rule: "Les pronoms personnels de base en arabe sont : أَنَا (je), أَنْتَ (tu, masc.), أَنْتِ (tu, fém.), هُوَ (il), هِيَ (elle).",
    examples: ["أَنَا طَالِبٌ (Je suis étudiant)", "هُوَ مُعَلِّمٌ (Il est professeur)"],
    questions: [
      {
        question: "Que signifie أَنَا ?",
        options: ["Tu", "Il", "Je", "Nous"],
        correctIndex: 2,
        explanation: "أَنَا signifie « je » en arabe.",
      },
      {
        question: "Comment dit-on « il » en arabe ?",
        options: ["أَنَا", "أَنْتَ", "هِيَ", "هُوَ"],
        correctIndex: 3,
        explanation: "هُوَ est le pronom « il » en arabe.",
      },
    ],
  },
];

export const grammarNiveau2: GrammarExercise[] = [
  {
    id: "g2-1",
    title: "La phrase nominale (الجُمْلَة الاسْمِيَّة)",
    rule: "La phrase nominale en arabe commence par un nom (المُبْتَدَأ) suivi d'un attribut (الخَبَر). Elle n'a pas de verbe « être » au présent.",
    examples: [
      "البَيْتُ كَبِيرٌ (La maison est grande)",
      "الطَّالِبُ مُجْتَهِدٌ (L'étudiant est studieux)",
    ],
    questions: [
      {
        question: "Que manque-t-il dans la phrase nominale arabe au présent ?",
        options: ["Le sujet", "Le verbe être", "L'adjectif", "L'article"],
        correctIndex: 1,
        explanation: "En arabe, le verbe « être » n'apparaît pas au présent dans la phrase nominale.",
      },
      {
        question: "Dans « البَيْتُ كَبِيرٌ », quel est le مُبْتَدَأ ?",
        options: ["كَبِيرٌ", "البَيْتُ", "فِي", "هُوَ"],
        correctIndex: 1,
        explanation: "البَيْتُ (la maison) est le sujet (مُبْتَدَأ) de la phrase.",
      },
    ],
  },
  {
    id: "g2-2",
    title: "Le duel (المُثَنَّى)",
    rule: "En arabe, le duel désigne exactement deux éléments. On ajoute le suffixe ـَانِ (nominatif) ou ـَيْنِ (accusatif/génitif) au nom singulier.",
    examples: [
      "كِتَابٌ → كِتَابَانِ (un livre → deux livres)",
      "طَالِبٌ → طَالِبَانِ (un étudiant → deux étudiants)",
    ],
    questions: [
      {
        question: "Quel suffixe marque le duel au nominatif ?",
        options: ["ـُونَ", "ـَاتٌ", "ـَانِ", "ـِينَ"],
        correctIndex: 2,
        explanation: "Le suffixe ـَانِ marque le duel au nominatif.",
      },
      {
        question: "Comment dit-on « deux professeurs » au nominatif ?",
        options: ["مُعَلِّمُونَ", "مُعَلِّمَانِ", "مُعَلِّمَاتٌ", "مُعَلِّمِينَ"],
        correctIndex: 1,
        explanation: "On ajoute ـَانِ à مُعَلِّم pour obtenir مُعَلِّمَانِ.",
      },
    ],
  },
];

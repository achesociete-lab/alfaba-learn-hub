// 12 progressive Niveau 2 lessons: Grammar, Comprehension & Advanced Dictation
// Each lesson builds on previous concepts for progressive learning

export interface GrammarRule {
  title: string;
  explanation: string;
  examples: { arabic: string; transliteration: string; meaning: string }[];
}

export interface ComprehensionText {
  title: string;
  arabic: string;
  translation: string;
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface Niveau2QCM {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Niveau2Dictation {
  sentence: string;
  transliteration: string;
  options: string[];
  correctIndex: number;
}

export interface Niveau2Lesson {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  grammar: GrammarRule[];
  comprehension: ComprehensionText;
  qcm: Niveau2QCM[];
  dictation: Niveau2Dictation[];
}

export const niveau2Lessons: Niveau2Lesson[] = [
  // ─── Leçon 1 : Révision & Lecture fluide ───
  {
    id: 1,
    title: "Révision & Lecture fluide",
    subtitle: "Consolidation des acquis du niveau 1",
    description: "Révision complète de l'alphabet, des voyelles et de la lecture fluide. Cette leçon assure que tous les fondamentaux sont maîtrisés avant d'aborder la grammaire.",
    grammar: [
      {
        title: "Les voyelles courtes — rappel",
        explanation: "Les trois voyelles courtes (Fatha, Damma, Kasra) modifient la prononciation de chaque consonne. Le Soukoun indique l'absence de voyelle.",
        examples: [
          { arabic: "كَتَبَ", transliteration: "kataba", meaning: "il a écrit" },
          { arabic: "كُتُبٌ", transliteration: "kutubun", meaning: "des livres" },
          { arabic: "كِتَابٌ", transliteration: "kitâbun", meaning: "un livre" },
        ],
      },
      {
        title: "Les voyelles longues — rappel",
        explanation: "Alif (ا), Waw (و) et Ya (ي) allongent respectivement les voyelles Fatha, Damma et Kasra.",
        examples: [
          { arabic: "بَابٌ", transliteration: "bâbun", meaning: "une porte" },
          { arabic: "نُورٌ", transliteration: "nûrun", meaning: "une lumière" },
          { arabic: "كَبِيرٌ", transliteration: "kabîrun", meaning: "grand" },
        ],
      },
    ],
    comprehension: {
      title: "Mon premier texte",
      arabic: "ذَهَبَ أَحْمَدُ إِلَى الْمَدْرَسَةِ. هُوَ تِلْمِيذٌ صَغِيرٌ. يُحِبُّ الْقِرَاءَةَ وَالْكِتَابَةَ.",
      translation: "Ahmad est allé à l'école. C'est un petit élève. Il aime la lecture et l'écriture.",
      questions: [
        { question: "Où est allé Ahmad ?", options: ["Au marché", "À l'école", "À la maison", "Au parc"], correctIndex: 1, explanation: "الْمَدْرَسَة signifie l'école." },
        { question: "Que aime Ahmad ?", options: ["Le sport", "La cuisine", "La lecture et l'écriture", "Le dessin"], correctIndex: 2, explanation: "الْقِرَاءَة (lecture) وَالْكِتَابَة (écriture)." },
      ],
    },
    qcm: [
      { question: "Quel est le Tanwin de 'un livre' ?", options: ["كِتَابَ", "كِتَابٌ", "كِتَابِ", "كِتَابُ"], correctIndex: 1, explanation: "Le Tanwin Damma (ٌ) marque l'indéfini au cas nominatif : كِتَابٌ." },
      { question: "Quelle voyelle longue est formée avec Alif ?", options: ["ou (û)", "i (î)", "a (â)", "Aucune"], correctIndex: 2, explanation: "Alif prolonge la Fatha pour donner le son 'â'." },
      { question: "Comment lit-on كُتُبٌ ?", options: ["kitâbun", "kutubun", "kataba", "kitbun"], correctIndex: 1, explanation: "Deux Damma + Tanwin Damma = kutubun (des livres)." },
    ],
    dictation: [
      { sentence: "كِتَابٌ", transliteration: "kitâbun (un livre)", options: ["كِتَابٌ", "كَتَبَ", "كُتُبٌ", "كَاتِبٌ"], correctIndex: 0 },
      { sentence: "مَدْرَسَةٌ", transliteration: "madrasatun (une école)", options: ["مُدَرِّسٌ", "مَدْرَسَةٌ", "دَرْسٌ", "دِرَاسَةٌ"], correctIndex: 1 },
      { sentence: "تِلْمِيذٌ", transliteration: "tilmîdhun (un élève)", options: ["تَلَامِيذٌ", "تَعْلِيمٌ", "تِلْمِيذٌ", "مُعَلِّمٌ"], correctIndex: 2 },
    ],
  },

  // ─── Leçon 2 : Les articles définis ───
  {
    id: 2,
    title: "Les articles définis (ال)",
    subtitle: "Le Lam Shamsi et le Lam Qamari",
    description: "L'article défini 'al' (ال) se comporte différemment selon la lettre qui suit. Les lettres solaires assimilent le Lam, les lettres lunaires le conservent.",
    grammar: [
      {
        title: "Le Lam Qamari (lunaire)",
        explanation: "Devant les lettres lunaires (ا ب ج ح خ ع غ ف ق ك م ه و ي), le Lam se prononce clairement.",
        examples: [
          { arabic: "الْكِتَابُ", transliteration: "al-kitâbu", meaning: "le livre" },
          { arabic: "الْبَيْتُ", transliteration: "al-baytu", meaning: "la maison" },
          { arabic: "الْقَمَرُ", transliteration: "al-qamaru", meaning: "la lune" },
        ],
      },
      {
        title: "Le Lam Shamsi (solaire)",
        explanation: "Devant les lettres solaires (ت ث د ذ ر ز س ش ص ض ط ظ ل ن), le Lam ne se prononce pas et la lettre suivante est doublée.",
        examples: [
          { arabic: "الشَّمْسُ", transliteration: "ash-shamsu", meaning: "le soleil" },
          { arabic: "النُّورُ", transliteration: "an-nûru", meaning: "la lumière" },
          { arabic: "الرَّجُلُ", transliteration: "ar-rajulu", meaning: "l'homme" },
        ],
      },
    ],
    comprehension: {
      title: "Le soleil et la lune",
      arabic: "الشَّمْسُ كَبِيرَةٌ وَالْقَمَرُ جَمِيلٌ. نَرَى الشَّمْسَ فِي النَّهَارِ وَنَرَى الْقَمَرَ فِي اللَّيْلِ.",
      translation: "Le soleil est grand et la lune est belle. Nous voyons le soleil le jour et nous voyons la lune la nuit.",
      questions: [
        { question: "Comment est décrit le soleil ?", options: ["Petit", "Grand", "Beau", "Lumineux"], correctIndex: 1, explanation: "كَبِيرَةٌ = grande." },
        { question: "Quand voit-on la lune ?", options: ["Le matin", "L'après-midi", "La nuit", "Toujours"], correctIndex: 2, explanation: "فِي اللَّيْلِ = la nuit." },
      ],
    },
    qcm: [
      { question: "الشَّمْسُ — le Lam est :", options: ["Lunaire", "Solaire", "Absent", "Double"], correctIndex: 1, explanation: "ش est une lettre solaire, donc le Lam est assimilé : ash-shamsu." },
      { question: "الْكِتَابُ — le Lam est :", options: ["Solaire", "Lunaire", "Silencieux", "Inexistant"], correctIndex: 1, explanation: "ك est une lettre lunaire, le Lam se prononce : al-kitâbu." },
      { question: "Comment prononce-t-on النُّورُ ?", options: ["al-nûru", "an-nûru", "nûru", "al-nawru"], correctIndex: 1, explanation: "ن est solaire, le Lam s'assimile : an-nûru." },
    ],
    dictation: [
      { sentence: "الشَّمْسُ", transliteration: "ash-shamsu (le soleil)", options: ["الشَّمْسُ", "الْشَمْسُ", "شَمْسٌ", "الصَّمْسُ"], correctIndex: 0 },
      { sentence: "الْقَمَرُ", transliteration: "al-qamaru (la lune)", options: ["القَّمَرُ", "قَمَرٌ", "الْقَمَرُ", "الْكَمَرُ"], correctIndex: 2 },
      { sentence: "الرَّجُلُ", transliteration: "ar-rajulu (l'homme)", options: ["الْرَجُلُ", "رَجُلٌ", "الرَّجُلُ", "الرَّجِلُ"], correctIndex: 2 },
    ],
  },

  // ─── Leçon 3 : Lecture de textes courts ───
  {
    id: 3,
    title: "Lecture de textes courts",
    subtitle: "Premiers textes avec vocabulaire simple",
    description: "Lecture de petits textes simples pour développer la fluidité et enrichir le vocabulaire de base.",
    grammar: [
      {
        title: "Le vocabulaire de la maison",
        explanation: "Mots essentiels pour décrire la maison et ses pièces.",
        examples: [
          { arabic: "بَيْتٌ", transliteration: "baytun", meaning: "une maison" },
          { arabic: "غُرْفَةٌ", transliteration: "ghurfatun", meaning: "une chambre" },
          { arabic: "مَطْبَخٌ", transliteration: "matbakhun", meaning: "une cuisine" },
        ],
      },
      {
        title: "Le vocabulaire de la famille",
        explanation: "Les membres de la famille en arabe.",
        examples: [
          { arabic: "أَبٌ", transliteration: "abun", meaning: "un père" },
          { arabic: "أُمٌّ", transliteration: "ummun", meaning: "une mère" },
          { arabic: "أَخٌ", transliteration: "akhun", meaning: "un frère" },
        ],
      },
    ],
    comprehension: {
      title: "La maison de Fatima",
      arabic: "فَاطِمَةُ تَسْكُنُ فِي بَيْتٍ كَبِيرٍ. فِي الْبَيْتِ ثَلَاثُ غُرَفٍ وَمَطْبَخٌ. أُمُّهَا تَطْبُخُ فِي الْمَطْبَخِ.",
      translation: "Fatima habite dans une grande maison. Dans la maison il y a trois chambres et une cuisine. Sa mère cuisine dans la cuisine.",
      questions: [
        { question: "Comment est la maison de Fatima ?", options: ["Petite", "Grande", "Vieille", "Nouvelle"], correctIndex: 1, explanation: "كَبِيرٍ = grande." },
        { question: "Combien de chambres y a-t-il ?", options: ["Deux", "Trois", "Quatre", "Cinq"], correctIndex: 1, explanation: "ثَلَاثُ غُرَفٍ = trois chambres." },
        { question: "Que fait la mère de Fatima ?", options: ["Elle lit", "Elle dort", "Elle cuisine", "Elle écrit"], correctIndex: 2, explanation: "تَطْبُخُ = elle cuisine." },
      ],
    },
    qcm: [
      { question: "Que signifie بَيْتٌ ?", options: ["École", "Maison", "Jardin", "Rue"], correctIndex: 1, explanation: "بَيْتٌ = une maison." },
      { question: "Que signifie أُمٌّ ?", options: ["Père", "Frère", "Mère", "Sœur"], correctIndex: 2, explanation: "أُمٌّ = une mère." },
      { question: "Que signifie مَطْبَخٌ ?", options: ["Salon", "Cuisine", "Chambre", "Jardin"], correctIndex: 1, explanation: "مَطْبَخٌ = une cuisine." },
    ],
    dictation: [
      { sentence: "بَيْتٌ كَبِيرٌ", transliteration: "baytun kabîrun (une grande maison)", options: ["بَيْتٌ كَبِيرٌ", "بَيْتٌ صَغِيرٌ", "بِنْتٌ كَبِيرَةٌ", "بَابٌ كَبِيرٌ"], correctIndex: 0 },
      { sentence: "ثَلَاثُ غُرَفٍ", transliteration: "thalâthu ghurafin (trois chambres)", options: ["ثَلَاثُ كُتُبٍ", "أَرْبَعُ غُرَفٍ", "ثَلَاثُ غُرَفٍ", "ثَلَاثَةُ أَوْلَادٍ"], correctIndex: 2 },
    ],
  },

  // ─── Leçon 4 : Le nom et ses catégories ───
  {
    id: 4,
    title: "Le nom et ses catégories",
    subtitle: "Masculin, féminin, singulier, pluriel",
    description: "Le nom arabe (الاسم) se décline selon le genre (masculin/féminin) et le nombre (singulier/duel/pluriel). Le Ta Marbuta (ة) marque souvent le féminin.",
    grammar: [
      {
        title: "Le masculin et le féminin",
        explanation: "En arabe, le féminin est souvent marqué par le Ta Marbuta (ة) à la fin du mot. Certains mots féminins n'ont pas cette marque (comme شَمْسٌ).",
        examples: [
          { arabic: "مُعَلِّمٌ / مُعَلِّمَةٌ", transliteration: "mu'allimun / mu'allimatun", meaning: "enseignant / enseignante" },
          { arabic: "طَالِبٌ / طَالِبَةٌ", transliteration: "tâlibun / tâlibatun", meaning: "étudiant / étudiante" },
          { arabic: "كَبِيرٌ / كَبِيرَةٌ", transliteration: "kabîrun / kabîratun", meaning: "grand / grande" },
        ],
      },
      {
        title: "Le pluriel régulier",
        explanation: "Le pluriel masculin régulier ajoute ون (ûna), le féminin remplace ة par ات (ât).",
        examples: [
          { arabic: "مُعَلِّمُونَ", transliteration: "mu'allimûna", meaning: "enseignants" },
          { arabic: "مُعَلِّمَاتٌ", transliteration: "mu'allimâtun", meaning: "enseignantes" },
          { arabic: "طَالِبَاتٌ", transliteration: "tâlibâtun", meaning: "étudiantes" },
        ],
      },
    ],
    comprehension: {
      title: "Dans la classe",
      arabic: "فِي الْفَصْلِ مُعَلِّمَةٌ وَعَشَرَةُ طُلَّابٍ. خَمْسَةُ طُلَّابٍ وَخَمْسُ طَالِبَاتٍ. الْمُعَلِّمَةُ تَشْرَحُ الدَّرْسَ.",
      translation: "Dans la classe il y a une enseignante et dix élèves. Cinq garçons et cinq filles. L'enseignante explique la leçon.",
      questions: [
        { question: "Combien d'élèves y a-t-il ?", options: ["Cinq", "Huit", "Dix", "Quinze"], correctIndex: 2, explanation: "عَشَرَةُ طُلَّابٍ = dix élèves." },
        { question: "Que fait l'enseignante ?", options: ["Elle lit", "Elle explique la leçon", "Elle écrit", "Elle questionne"], correctIndex: 1, explanation: "تَشْرَحُ الدَّرْسَ = elle explique la leçon." },
      ],
    },
    qcm: [
      { question: "Quel est le féminin de مُعَلِّمٌ ?", options: ["مُعَلِّمُونَ", "مُعَلِّمَةٌ", "مُعَلِّمَاتٌ", "مَعْلُومٌ"], correctIndex: 1, explanation: "On ajoute le Ta Marbuta (ة) pour le féminin." },
      { question: "Quel est le pluriel féminin de طَالِبَةٌ ?", options: ["طُلَّابٌ", "طَالِبُونَ", "طَالِبَاتٌ", "طَالِبَتَانِ"], correctIndex: 2, explanation: "Le pluriel féminin régulier remplace ة par ات." },
      { question: "Le Ta Marbuta (ة) indique généralement :", options: ["Le pluriel", "Le masculin", "Le féminin", "Le duel"], correctIndex: 2, explanation: "Le Ta Marbuta est la marque la plus courante du féminin." },
    ],
    dictation: [
      { sentence: "مُعَلِّمَةٌ", transliteration: "mu'allimatun (une enseignante)", options: ["مُعَلِّمٌ", "مُعَلِّمَةٌ", "مُعَلِّمُونَ", "مُعَلِّمَاتٌ"], correctIndex: 1 },
      { sentence: "طَالِبَاتٌ", transliteration: "tâlibâtun (des étudiantes)", options: ["طَالِبٌ", "طَالِبَةٌ", "طَالِبَاتٌ", "طُلَّابٌ"], correctIndex: 2 },
      { sentence: "خَمْسَةُ طُلَّابٍ", transliteration: "khamsatu tullâbin (cinq élèves)", options: ["عَشَرَةُ طُلَّابٍ", "خَمْسَةُ طُلَّابٍ", "ثَلَاثَةُ طُلَّابٍ", "سَبْعَةُ طُلَّابٍ"], correctIndex: 1 },
    ],
  },

  // ─── Leçon 5 : La phrase nominale ───
  {
    id: 5,
    title: "La phrase nominale",
    subtitle: "Structure Al-Moubtada et Al-Khabar",
    description: "La phrase nominale (الجملة الاسمية) commence par un nom. Elle se compose du Moubtada (sujet) et du Khabar (prédicat/attribut).",
    grammar: [
      {
        title: "Le Moubtada (المبتدأ)",
        explanation: "Le Moubtada est le sujet de la phrase nominale. Il est toujours au cas nominatif (marfou').",
        examples: [
          { arabic: "الْوَلَدُ كَبِيرٌ", transliteration: "al-waladu kabîrun", meaning: "Le garçon est grand" },
          { arabic: "الْبَيْتُ جَمِيلٌ", transliteration: "al-baytu jamîlun", meaning: "La maison est belle" },
          { arabic: "الْمُعَلِّمُ فِي الْفَصْلِ", transliteration: "al-mu'allimu fî-l-fasli", meaning: "L'enseignant est dans la classe" },
        ],
      },
      {
        title: "Le Khabar (الخبر)",
        explanation: "Le Khabar donne l'information sur le Moubtada. Il peut être un adjectif, un groupe prépositionnel, ou une phrase.",
        examples: [
          { arabic: "السَّمَاءُ زَرْقَاءُ", transliteration: "as-samâ'u zarqâ'u", meaning: "Le ciel est bleu" },
          { arabic: "الطَّعَامُ لَذِيذٌ", transliteration: "at-ta'âmu ladhîdhun", meaning: "La nourriture est délicieuse" },
          { arabic: "الْكِتَابُ عَلَى الطَّاوِلَةِ", transliteration: "al-kitâbu 'alâ-t-tâwilati", meaning: "Le livre est sur la table" },
        ],
      },
    ],
    comprehension: {
      title: "Description d'une chambre",
      arabic: "الْغُرْفَةُ وَاسِعَةٌ. السَّرِيرُ كَبِيرٌ وَالْمَكْتَبُ صَغِيرٌ. الْكُتُبُ عَلَى الرَّفِّ.",
      translation: "La chambre est spacieuse. Le lit est grand et le bureau est petit. Les livres sont sur l'étagère.",
      questions: [
        { question: "Comment est la chambre ?", options: ["Petite", "Sombre", "Spacieuse", "Sale"], correctIndex: 2, explanation: "وَاسِعَةٌ = spacieuse." },
        { question: "Où sont les livres ?", options: ["Sur le bureau", "Sur le lit", "Sur l'étagère", "Par terre"], correctIndex: 2, explanation: "عَلَى الرَّفِّ = sur l'étagère." },
      ],
    },
    qcm: [
      { question: "Dans الْوَلَدُ كَبِيرٌ, quel est le Moubtada ?", options: ["كَبِيرٌ", "الْوَلَدُ", "Les deux", "Aucun"], correctIndex: 1, explanation: "الْوَلَدُ (le garçon) est le sujet = Moubtada." },
      { question: "Dans الْكِتَابُ عَلَى الطَّاوِلَةِ, quel est le Khabar ?", options: ["الْكِتَابُ", "عَلَى", "الطَّاوِلَةِ", "عَلَى الطَّاوِلَةِ"], correctIndex: 3, explanation: "Le groupe prépositionnel عَلَى الطَّاوِلَةِ est le Khabar." },
      { question: "La phrase nominale commence par :", options: ["Un verbe", "Un nom", "Une préposition", "Un adverbe"], correctIndex: 1, explanation: "La phrase nominale (الجملة الاسمية) commence toujours par un nom." },
    ],
    dictation: [
      { sentence: "الْوَلَدُ كَبِيرٌ", transliteration: "al-waladu kabîrun (le garçon est grand)", options: ["الْوَلَدُ كَبِيرٌ", "الْوَلَدُ صَغِيرٌ", "الْبِنْتُ كَبِيرَةٌ", "الرَّجُلُ كَبِيرٌ"], correctIndex: 0 },
      { sentence: "السَّمَاءُ زَرْقَاءُ", transliteration: "as-samâ'u zarqâ'u (le ciel est bleu)", options: ["الشَّمْسُ صَفْرَاءُ", "السَّمَاءُ زَرْقَاءُ", "الْأَرْضُ خَضْرَاءُ", "السَّمَاءُ بَيْضَاءُ"], correctIndex: 1 },
    ],
  },

  // ─── Leçon 6 : La phrase verbale ───
  {
    id: 6,
    title: "La phrase verbale",
    subtitle: "Le verbe, le sujet et le complément",
    description: "La phrase verbale (الجملة الفعلية) commence par un verbe. Elle se compose du verbe (الفعل), du sujet (الفاعل) et du complément (المفعول به).",
    grammar: [
      {
        title: "Structure de la phrase verbale",
        explanation: "Ordre : Verbe + Sujet (+ Complément). Le verbe s'accorde en genre avec le sujet.",
        examples: [
          { arabic: "كَتَبَ الْوَلَدُ الدَّرْسَ", transliteration: "kataba-l-waladu-d-darsa", meaning: "Le garçon a écrit la leçon" },
          { arabic: "قَرَأَتِ الْبِنْتُ الْكِتَابَ", transliteration: "qara'ati-l-bintu-l-kitâba", meaning: "La fille a lu le livre" },
          { arabic: "أَكَلَ الطِّفْلُ التُّفَّاحَةَ", transliteration: "akala-t-tiflu-t-tuffâhata", meaning: "L'enfant a mangé la pomme" },
        ],
      },
      {
        title: "Le passé (الماضي)",
        explanation: "Le verbe au passé (المَاضِي) décrit une action terminée. La forme de base est à la 3e personne masculin singulier.",
        examples: [
          { arabic: "ذَهَبَ", transliteration: "dhahaba", meaning: "il est allé" },
          { arabic: "جَلَسَ", transliteration: "jalasa", meaning: "il s'est assis" },
          { arabic: "فَتَحَ", transliteration: "fataha", meaning: "il a ouvert" },
        ],
      },
    ],
    comprehension: {
      title: "La journée de Youssef",
      arabic: "اِسْتَيْقَظَ يُوسُفُ صَبَاحًا. غَسَلَ وَجْهَهُ وَأَكَلَ الْفُطُورَ. ذَهَبَ إِلَى الْمَدْرَسَةِ وَدَرَسَ مَعَ أَصْدِقَائِهِ.",
      translation: "Youssef s'est réveillé le matin. Il a lavé son visage et a pris le petit-déjeuner. Il est allé à l'école et a étudié avec ses amis.",
      questions: [
        { question: "Quand Youssef s'est-il réveillé ?", options: ["Le soir", "Le matin", "L'après-midi", "La nuit"], correctIndex: 1, explanation: "صَبَاحًا = le matin." },
        { question: "Avec qui a-t-il étudié ?", options: ["Son frère", "Son père", "Ses amis", "Seul"], correctIndex: 2, explanation: "مَعَ أَصْدِقَائِهِ = avec ses amis." },
      ],
    },
    qcm: [
      { question: "Dans كَتَبَ الْوَلَدُ, quel est le verbe ?", options: ["الْوَلَدُ", "كَتَبَ", "الدَّرْسَ", "Aucun"], correctIndex: 1, explanation: "كَتَبَ (il a écrit) est le verbe au passé." },
      { question: "La phrase verbale commence par :", options: ["Un nom", "Un adjectif", "Un verbe", "Une préposition"], correctIndex: 2, explanation: "La phrase verbale commence toujours par un verbe." },
      { question: "Quel est le féminin de ذَهَبَ ?", options: ["ذَهَبَتْ", "ذَهَبُوا", "ذَهَبْنَ", "يَذْهَبُ"], correctIndex: 0, explanation: "On ajoute تْ pour le féminin au passé : ذَهَبَتْ." },
    ],
    dictation: [
      { sentence: "كَتَبَ الْوَلَدُ", transliteration: "kataba-l-waladu (le garçon a écrit)", options: ["كَتَبَ الْوَلَدُ", "كَتَبَتِ الْبِنْتُ", "قَرَأَ الْوَلَدُ", "كَتَبَ الرَّجُلُ"], correctIndex: 0 },
      { sentence: "أَكَلَ الطِّفْلُ", transliteration: "akala-t-tiflu (l'enfant a mangé)", options: ["شَرِبَ الطِّفْلُ", "أَكَلَ الرَّجُلُ", "أَكَلَ الطِّفْلُ", "أَكَلَتِ الْبِنْتُ"], correctIndex: 2 },
      { sentence: "ذَهَبَتْ فَاطِمَةُ", transliteration: "dhahabat fâtimatu (Fatima est allée)", options: ["ذَهَبَ أَحْمَدُ", "ذَهَبَتْ فَاطِمَةُ", "جَلَسَتْ فَاطِمَةُ", "ذَهَبَتْ مَرْيَمُ"], correctIndex: 1 },
    ],
  },

  // ─── Leçon 7 : Compréhension de texte I ───
  {
    id: 7,
    title: "Compréhension de texte I",
    subtitle: "Lecture et questions sur un texte narratif",
    description: "Développer les compétences de compréhension à travers un texte narratif complet avec des questions d'analyse.",
    grammar: [
      {
        title: "Les mots interrogatifs",
        explanation: "Les mots interrogatifs permettent de poser des questions en arabe.",
        examples: [
          { arabic: "مَنْ", transliteration: "man", meaning: "qui ?" },
          { arabic: "مَاذَا", transliteration: "mâdhâ", meaning: "quoi ?" },
          { arabic: "أَيْنَ", transliteration: "ayna", meaning: "où ?" },
        ],
      },
      {
        title: "Mots interrogatifs (suite)",
        explanation: "D'autres mots interrogatifs fréquents.",
        examples: [
          { arabic: "مَتَى", transliteration: "matâ", meaning: "quand ?" },
          { arabic: "كَيْفَ", transliteration: "kayfa", meaning: "comment ?" },
          { arabic: "لِمَاذَا", transliteration: "limâdhâ", meaning: "pourquoi ?" },
        ],
      },
    ],
    comprehension: {
      title: "Le marché",
      arabic: "ذَهَبَتْ مَرْيَمُ إِلَى السُّوقِ مَعَ أُمِّهَا. اِشْتَرَتْ خُضْرَاوَاتٍ وَفَوَاكِهَ. التُّفَّاحُ أَحْمَرُ وَالْمَوْزُ أَصْفَرُ. رَجَعَتَا إِلَى الْبَيْتِ سَعِيدَتَيْنِ.",
      translation: "Maryam est allée au marché avec sa mère. Elle a acheté des légumes et des fruits. Les pommes sont rouges et les bananes sont jaunes. Elles sont rentrées à la maison heureuses.",
      questions: [
        { question: "Avec qui est allée Maryam ?", options: ["Son père", "Sa sœur", "Sa mère", "Son frère"], correctIndex: 2, explanation: "مَعَ أُمِّهَا = avec sa mère." },
        { question: "De quelle couleur sont les pommes ?", options: ["Jaunes", "Vertes", "Rouges", "Bleues"], correctIndex: 2, explanation: "التُّفَّاحُ أَحْمَرُ = les pommes sont rouges." },
        { question: "Comment étaient-elles en rentrant ?", options: ["Fatiguées", "Tristes", "Heureuses", "Pressées"], correctIndex: 2, explanation: "سَعِيدَتَيْنِ = heureuses (duel féminin)." },
      ],
    },
    qcm: [
      { question: "مَنْ signifie :", options: ["Quoi ?", "Où ?", "Qui ?", "Quand ?"], correctIndex: 2, explanation: "مَنْ = qui ?" },
      { question: "أَيْنَ signifie :", options: ["Comment ?", "Où ?", "Pourquoi ?", "Quand ?"], correctIndex: 1, explanation: "أَيْنَ = où ?" },
      { question: "لِمَاذَا signifie :", options: ["Comment ?", "Quand ?", "Pourquoi ?", "Combien ?"], correctIndex: 2, explanation: "لِمَاذَا = pourquoi ?" },
    ],
    dictation: [
      { sentence: "السُّوقُ كَبِيرٌ", transliteration: "as-sûqu kabîrun (le marché est grand)", options: ["السُّوقُ كَبِيرٌ", "السُّوقُ صَغِيرٌ", "الْبَيْتُ كَبِيرٌ", "السُّورُ كَبِيرٌ"], correctIndex: 0 },
      { sentence: "اِشْتَرَتْ فَوَاكِهَ", transliteration: "ishtarat fawâkiha (elle a acheté des fruits)", options: ["أَكَلَتْ فَوَاكِهَ", "اِشْتَرَتْ خُضْرَاوَاتٍ", "اِشْتَرَتْ فَوَاكِهَ", "بَاعَتْ فَوَاكِهَ"], correctIndex: 2 },
    ],
  },

  // ─── Leçon 8 : Les pronoms personnels ───
  {
    id: 8,
    title: "Les pronoms personnels",
    subtitle: "Pronoms détachés et attachés",
    description: "Les pronoms personnels détachés sont indépendants, les pronoms attachés (suffixes) s'ajoutent aux noms, verbes et prépositions.",
    grammar: [
      {
        title: "Les pronoms détachés",
        explanation: "Les pronoms détachés sont utilisés comme sujets ou pour l'emphase.",
        examples: [
          { arabic: "أَنَا", transliteration: "anâ", meaning: "je / moi" },
          { arabic: "أَنْتَ / أَنْتِ", transliteration: "anta / anti", meaning: "tu (m.) / tu (f.)" },
          { arabic: "هُوَ / هِيَ", transliteration: "huwa / hiya", meaning: "il / elle" },
        ],
      },
      {
        title: "Les pronoms attachés (suffixes)",
        explanation: "Les pronoms suffixes s'attachent aux noms (possession), aux verbes (complément) et aux prépositions.",
        examples: [
          { arabic: "كِتَابِي", transliteration: "kitâbî", meaning: "mon livre" },
          { arabic: "كِتَابُكَ", transliteration: "kitâbuka", meaning: "ton livre (m.)" },
          { arabic: "كِتَابُهُ", transliteration: "kitâbuhu", meaning: "son livre (à lui)" },
        ],
      },
    ],
    comprehension: {
      title: "Qui suis-je ?",
      arabic: "أَنَا طَالِبٌ. اِسْمِي عُمَرُ. عُمْرِي عَشْرُ سَنَوَاتٍ. أُحِبُّ كِتَابِي وَمَدْرَسَتِي. مُعَلِّمِي لَطِيفٌ.",
      translation: "Je suis un élève. Mon nom est Omar. J'ai dix ans. J'aime mon livre et mon école. Mon enseignant est gentil.",
      questions: [
        { question: "Quel est le nom de l'élève ?", options: ["Ahmad", "Youssef", "Omar", "Ali"], correctIndex: 2, explanation: "اِسْمِي عُمَرُ = mon nom est Omar." },
        { question: "Que signifie كِتَابِي ?", options: ["Un livre", "Ton livre", "Mon livre", "Son livre"], correctIndex: 2, explanation: "Le suffixe ي = mon → كِتَابِي = mon livre." },
      ],
    },
    qcm: [
      { question: "أَنَا signifie :", options: ["Tu", "Il", "Je", "Nous"], correctIndex: 2, explanation: "أَنَا = je / moi." },
      { question: "Le suffixe ـهُ indique :", options: ["Mon", "Ton", "Son (à lui)", "Leur"], correctIndex: 2, explanation: "Le suffixe هُ = son (masculin) → كِتَابُهُ = son livre." },
      { question: "Comment dit-on 'ton livre' (masculin) ?", options: ["كِتَابِي", "كِتَابُكَ", "كِتَابُهُ", "كِتَابُهَا"], correctIndex: 1, explanation: "Le suffixe كَ = ton (masculin) → كِتَابُكَ." },
    ],
    dictation: [
      { sentence: "كِتَابِي", transliteration: "kitâbî (mon livre)", options: ["كِتَابُكَ", "كِتَابِي", "كِتَابُهُ", "كُتُبٌ"], correctIndex: 1 },
      { sentence: "مُعَلِّمُهُ", transliteration: "mu'allimuhu (son enseignant)", options: ["مُعَلِّمِي", "مُعَلِّمُكَ", "مُعَلِّمُهُ", "مُعَلِّمَةٌ"], correctIndex: 2 },
      { sentence: "أَنَا طَالِبٌ", transliteration: "anâ tâlibun (je suis un élève)", options: ["هُوَ طَالِبٌ", "أَنْتَ طَالِبٌ", "أَنَا طَالِبٌ", "أَنَا مُعَلِّمٌ"], correctIndex: 2 },
    ],
  },

  // ─── Leçon 9 : Compréhension de texte II ───
  {
    id: 9,
    title: "Compréhension de texte II",
    subtitle: "Textes plus complexes avec analyse",
    description: "Analyse de textes plus longs avec du vocabulaire enrichi et des structures grammaticales variées.",
    grammar: [
      {
        title: "Les connecteurs logiques",
        explanation: "Les mots de liaison permettent de relier les idées dans un texte.",
        examples: [
          { arabic: "وَ", transliteration: "wa", meaning: "et" },
          { arabic: "ثُمَّ", transliteration: "thumma", meaning: "ensuite, puis" },
          { arabic: "لَكِنَّ", transliteration: "lâkinna", meaning: "mais, cependant" },
        ],
      },
      {
        title: "Les adverbes de temps",
        explanation: "Les adverbes de temps situent l'action dans le temps.",
        examples: [
          { arabic: "صَبَاحًا", transliteration: "sabâhan", meaning: "le matin" },
          { arabic: "مَسَاءً", transliteration: "masâ'an", meaning: "le soir" },
          { arabic: "غَدًا", transliteration: "ghadan", meaning: "demain" },
        ],
      },
    ],
    comprehension: {
      title: "Le voyage d'Ali",
      arabic: "سَافَرَ عَلِيٌّ إِلَى مِصْرَ مَعَ عَائِلَتِهِ. زَارُوا الْأَهْرَامَاتِ صَبَاحًا ثُمَّ ذَهَبُوا إِلَى الْمُتْحَفِ مَسَاءً. كَانَ الطَّقْسُ حَارًّا لَكِنَّ الرِّحْلَةَ كَانَتْ مُمْتِعَةً.",
      translation: "Ali a voyagé en Égypte avec sa famille. Ils ont visité les pyramides le matin puis sont allés au musée le soir. Le temps était chaud mais le voyage était agréable.",
      questions: [
        { question: "Où a voyagé Ali ?", options: ["Au Maroc", "En Tunisie", "En Égypte", "En Arabie"], correctIndex: 2, explanation: "إِلَى مِصْرَ = en Égypte." },
        { question: "Qu'ont-ils visité le matin ?", options: ["Le musée", "Le marché", "Les pyramides", "La mosquée"], correctIndex: 2, explanation: "زَارُوا الْأَهْرَامَاتِ صَبَاحًا." },
        { question: "Comment était le temps ?", options: ["Froid", "Chaud", "Pluvieux", "Doux"], correctIndex: 1, explanation: "كَانَ الطَّقْسُ حَارًّا = le temps était chaud." },
      ],
    },
    qcm: [
      { question: "ثُمَّ signifie :", options: ["Mais", "Et", "Ensuite", "Parce que"], correctIndex: 2, explanation: "ثُمَّ = ensuite, puis." },
      { question: "لَكِنَّ signifie :", options: ["Et", "Donc", "Mais", "Ou"], correctIndex: 2, explanation: "لَكِنَّ = mais, cependant." },
      { question: "صَبَاحًا signifie :", options: ["Le soir", "La nuit", "Le matin", "L'après-midi"], correctIndex: 2, explanation: "صَبَاحًا = le matin." },
    ],
    dictation: [
      { sentence: "سَافَرَ إِلَى مِصْرَ", transliteration: "sâfara ilâ misra (il a voyagé en Égypte)", options: ["سَافَرَ إِلَى مِصْرَ", "ذَهَبَ إِلَى مِصْرَ", "سَافَرَ إِلَى تُونِسَ", "رَجَعَ مِنْ مِصْرَ"], correctIndex: 0 },
      { sentence: "الرِّحْلَةُ مُمْتِعَةٌ", transliteration: "ar-rihlatu mumti'atun (le voyage est agréable)", options: ["الرِّحْلَةُ طَوِيلَةٌ", "الرِّحْلَةُ مُمْتِعَةٌ", "الرِّحْلَةُ صَعْبَةٌ", "الْمَدْرَسَةُ مُمْتِعَةٌ"], correctIndex: 1 },
    ],
  },

  // ─── Leçon 10 : Les prépositions ───
  {
    id: 10,
    title: "Les prépositions",
    subtitle: "في، على، من، إلى et leur usage",
    description: "Les prépositions (حروف الجر) introduisent des compléments et régissent le cas génitif (majrûr).",
    grammar: [
      {
        title: "Les prépositions de lieu",
        explanation: "Les prépositions indiquent la position ou la direction.",
        examples: [
          { arabic: "فِي الْبَيْتِ", transliteration: "fî-l-bayti", meaning: "dans la maison" },
          { arabic: "عَلَى الطَّاوِلَةِ", transliteration: "'alâ-t-tâwilati", meaning: "sur la table" },
          { arabic: "تَحْتَ الشَّجَرَةِ", transliteration: "tahta-sh-shajarati", meaning: "sous l'arbre" },
        ],
      },
      {
        title: "Les prépositions de mouvement",
        explanation: "Ces prépositions indiquent l'origine et la destination.",
        examples: [
          { arabic: "مِنَ الْمَدْرَسَةِ", transliteration: "mina-l-madrasati", meaning: "de l'école" },
          { arabic: "إِلَى الْمَسْجِدِ", transliteration: "ilâ-l-masjidi", meaning: "vers la mosquée" },
          { arabic: "بَيْنَ الْبَيْتَيْنِ", transliteration: "bayna-l-baytayni", meaning: "entre les deux maisons" },
        ],
      },
    ],
    comprehension: {
      title: "Où sont les choses ?",
      arabic: "الْقِطَّةُ تَحْتَ الطَّاوِلَةِ. الْكِتَابُ عَلَى الرَّفِّ. الْوَلَدُ فِي الْحَدِيقَةِ. ذَهَبَ مِنَ الْبَيْتِ إِلَى الْمَدْرَسَةِ.",
      translation: "Le chat est sous la table. Le livre est sur l'étagère. Le garçon est dans le jardin. Il est allé de la maison à l'école.",
      questions: [
        { question: "Où est le chat ?", options: ["Sur la table", "Sous la table", "Dans le jardin", "Sur l'étagère"], correctIndex: 1, explanation: "تَحْتَ الطَّاوِلَةِ = sous la table." },
        { question: "D'où est parti le garçon ?", options: ["De l'école", "Du jardin", "De la maison", "Du marché"], correctIndex: 2, explanation: "مِنَ الْبَيْتِ = de la maison." },
      ],
    },
    qcm: [
      { question: "فِي signifie :", options: ["Sur", "Dans", "Vers", "De"], correctIndex: 1, explanation: "فِي = dans." },
      { question: "عَلَى signifie :", options: ["Sous", "Dans", "Sur", "Entre"], correctIndex: 2, explanation: "عَلَى = sur." },
      { question: "Les prépositions régissent le cas :", options: ["Nominatif", "Accusatif", "Génitif", "Aucun"], correctIndex: 2, explanation: "Les prépositions régissent le cas génitif (majrûr)." },
    ],
    dictation: [
      { sentence: "فِي الْبَيْتِ", transliteration: "fî-l-bayti (dans la maison)", options: ["فِي الْبَيْتِ", "عَلَى الْبَيْتِ", "مِنَ الْبَيْتِ", "إِلَى الْبَيْتِ"], correctIndex: 0 },
      { sentence: "عَلَى الطَّاوِلَةِ", transliteration: "'alâ-t-tâwilati (sur la table)", options: ["تَحْتَ الطَّاوِلَةِ", "فِي الطَّاوِلَةِ", "عَلَى الطَّاوِلَةِ", "عِنْدَ الطَّاوِلَةِ"], correctIndex: 2 },
      { sentence: "مِنَ الْمَدْرَسَةِ إِلَى الْبَيْتِ", transliteration: "mina-l-madrasati ilâ-l-bayti (de l'école à la maison)", options: ["مِنَ الْبَيْتِ إِلَى الْمَدْرَسَةِ", "فِي الْمَدْرَسَةِ", "مِنَ الْمَدْرَسَةِ إِلَى الْبَيْتِ", "إِلَى الْمَدْرَسَةِ"], correctIndex: 2 },
    ],
  },

  // ─── Leçon 11 : Rédaction guidée ───
  {
    id: 11,
    title: "Rédaction guidée",
    subtitle: "Écrire des phrases et paragraphes simples",
    description: "Mettre en pratique toutes les notions apprises pour construire des phrases complètes et cohérentes.",
    grammar: [
      {
        title: "Construire une phrase nominale",
        explanation: "Pour décrire quelque chose : Nom défini + Adjectif indéfini.",
        examples: [
          { arabic: "الْجَوُّ جَمِيلٌ", transliteration: "al-jawwu jamîlun", meaning: "Le temps est beau" },
          { arabic: "الْمَدِينَةُ كَبِيرَةٌ", transliteration: "al-madînatu kabîratun", meaning: "La ville est grande" },
          { arabic: "الطَّعَامُ لَذِيذٌ", transliteration: "at-ta'âmu ladhîdhun", meaning: "La nourriture est délicieuse" },
        ],
      },
      {
        title: "Construire une phrase verbale",
        explanation: "Pour raconter une action : Verbe + Sujet + Complément.",
        examples: [
          { arabic: "زَرَعَ الْفَلَّاحُ الشَّجَرَةَ", transliteration: "zara'a-l-fallâhu-sh-shajarata", meaning: "Le fermier a planté l'arbre" },
          { arabic: "طَبَخَتِ الْأُمُّ الطَّعَامَ", transliteration: "tabakhati-l-ummu-t-ta'âma", meaning: "La mère a cuisiné la nourriture" },
          { arabic: "فَتَحَ التِّلْمِيذُ الْكِتَابَ", transliteration: "fataha-t-tilmîdhu-l-kitâba", meaning: "L'élève a ouvert le livre" },
        ],
      },
    ],
    comprehension: {
      title: "Ma ville",
      arabic: "أَسْكُنُ فِي مَدِينَةٍ جَمِيلَةٍ. فِيهَا مَسَاجِدُ وَمَدَارِسُ وَأَسْوَاقٌ. النَّاسُ طَيِّبُونَ وَالطَّقْسُ مُعْتَدِلٌ. أُحِبُّ مَدِينَتِي كَثِيرًا.",
      translation: "J'habite dans une belle ville. Il y a des mosquées, des écoles et des marchés. Les gens sont gentils et le temps est tempéré. J'aime beaucoup ma ville.",
      questions: [
        { question: "Comment est la ville ?", options: ["Grande", "Petite", "Belle", "Ancienne"], correctIndex: 2, explanation: "مَدِينَةٍ جَمِيلَةٍ = une belle ville." },
        { question: "Comment sont les gens ?", options: ["Méchants", "Gentils", "Pressés", "Tristes"], correctIndex: 1, explanation: "النَّاسُ طَيِّبُونَ = les gens sont gentils." },
        { question: "Qu'y a-t-il dans la ville ?", options: ["Des rivières", "Des montagnes", "Des mosquées, écoles et marchés", "Des usines"], correctIndex: 2, explanation: "مَسَاجِدُ وَمَدَارِسُ وَأَسْوَاقٌ." },
      ],
    },
    qcm: [
      { question: "Pour décrire, on utilise :", options: ["La phrase verbale", "La phrase nominale", "La préposition", "Le pronom"], correctIndex: 1, explanation: "La phrase nominale est utilisée pour décrire (sujet + attribut)." },
      { question: "Pour raconter une action, on utilise :", options: ["La phrase nominale", "La phrase verbale", "L'article défini", "Le pronom"], correctIndex: 1, explanation: "La phrase verbale commence par un verbe et raconte une action." },
      { question: "L'adjectif dans الْمَدِينَةُ كَبِيرَةٌ est :", options: ["الْمَدِينَةُ", "كَبِيرَةٌ", "Les deux", "Aucun"], correctIndex: 1, explanation: "كَبِيرَةٌ = grande, c'est l'adjectif (khabar)." },
    ],
    dictation: [
      { sentence: "الْجَوُّ جَمِيلٌ", transliteration: "al-jawwu jamîlun (le temps est beau)", options: ["الْجَوُّ حَارٌّ", "الْجَوُّ جَمِيلٌ", "الْجَوُّ بَارِدٌ", "الطَّقْسُ جَمِيلٌ"], correctIndex: 1 },
      { sentence: "أُحِبُّ مَدِينَتِي", transliteration: "uhibbu madînatî (j'aime ma ville)", options: ["أُحِبُّ مَدْرَسَتِي", "أُحِبُّ مَدِينَتِي", "أُحِبُّ عَائِلَتِي", "أُحِبُّ بِلَادِي"], correctIndex: 1 },
      { sentence: "زَرَعَ الْفَلَّاحُ", transliteration: "zara'a-l-fallâhu (le fermier a planté)", options: ["زَرَعَ الْوَلَدُ", "طَبَخَ الْفَلَّاحُ", "زَرَعَ الْفَلَّاحُ", "حَصَدَ الْفَلَّاحُ"], correctIndex: 2 },
    ],
  },

  // ─── Leçon 12 : Dictée finale ───
  {
    id: 12,
    title: "Dictée finale",
    subtitle: "Évaluation complète du niveau 2",
    description: "Évaluation finale couvrant toutes les notions du niveau 2 : grammaire, vocabulaire, compréhension et rédaction.",
    grammar: [
      {
        title: "Récapitulatif — Les types de phrases",
        explanation: "La phrase nominale commence par un nom (description), la phrase verbale commence par un verbe (action).",
        examples: [
          { arabic: "الْبَيْتُ كَبِيرٌ", transliteration: "al-baytu kabîrun", meaning: "La maison est grande (nominale)" },
          { arabic: "بَنَى الرَّجُلُ بَيْتًا", transliteration: "banâ-r-rajulu baytan", meaning: "L'homme a construit une maison (verbale)" },
          { arabic: "هُوَ فِي بَيْتِهِ", transliteration: "huwa fî baytihi", meaning: "Il est dans sa maison (nominale)" },
        ],
      },
      {
        title: "Récapitulatif — Grammaire essentielle",
        explanation: "Toutes les notions clés : article défini, genre, nombre, pronoms, prépositions.",
        examples: [
          { arabic: "الْمُعَلِّمَاتُ فِي الْمَدْرَسَةِ", transliteration: "al-mu'allimâtu fî-l-madrasati", meaning: "Les enseignantes sont à l'école" },
          { arabic: "كَتَبْتُ رِسَالَةً إِلَى صَدِيقِي", transliteration: "katabtu risâlatan ilâ sadîqî", meaning: "J'ai écrit une lettre à mon ami" },
          { arabic: "هَذَا كِتَابُهَا", transliteration: "hâdhâ kitâbuhâ", meaning: "Ceci est son livre (à elle)" },
        ],
      },
    ],
    comprehension: {
      title: "Texte final : Une journée spéciale",
      arabic: "اِسْتَيْقَظَتْ نُورَةُ مُبَكِّرًا. لَبِسَتْ ثَوْبَهَا الْجَدِيدَ وَذَهَبَتْ إِلَى الْمَدْرَسَةِ. الْيَوْمَ هُوَ حَفْلَةُ التَّخَرُّجِ. فَرِحَ الْمُعَلِّمُونَ وَالطُّلَّابُ. قَالَتْ نُورَةُ: أَنَا سَعِيدَةٌ جِدًّا!",
      translation: "Noura s'est réveillée tôt. Elle a mis sa nouvelle robe et est allée à l'école. Aujourd'hui c'est la cérémonie de remise des diplômes. Les enseignants et les élèves étaient joyeux. Noura a dit : 'Je suis très heureuse !'",
      questions: [
        { question: "Pourquoi ce jour est-il spécial ?", options: ["C'est l'Aïd", "C'est son anniversaire", "C'est la remise des diplômes", "C'est le premier jour d'école"], correctIndex: 2, explanation: "حَفْلَةُ التَّخَرُّجِ = la cérémonie de remise des diplômes." },
        { question: "Comment se sent Noura ?", options: ["Triste", "Fatiguée", "Très heureuse", "Inquiète"], correctIndex: 2, explanation: "أَنَا سَعِيدَةٌ جِدًّا = je suis très heureuse." },
        { question: "Qui était joyeux ?", options: ["Seulement Noura", "Les parents", "Les enseignants et les élèves", "Le directeur"], correctIndex: 2, explanation: "فَرِحَ الْمُعَلِّمُونَ وَالطُّلَّابُ." },
      ],
    },
    qcm: [
      { question: "Identifiez la phrase nominale :", options: ["كَتَبَ الْوَلَدُ", "ذَهَبَتْ فَاطِمَةُ", "الْبَيْتُ جَمِيلٌ", "أَكَلَ الطِّفْلُ"], correctIndex: 2, explanation: "الْبَيْتُ جَمِيلٌ commence par un nom = phrase nominale." },
      { question: "كَتَبْتُ contient le pronom :", options: ["Je", "Tu", "Il", "Nous"], correctIndex: 0, explanation: "Le suffixe تُ = je → كَتَبْتُ = j'ai écrit." },
      { question: "Dans إِلَى صَدِيقِي, صَدِيقِي signifie :", options: ["Un ami", "L'ami", "Mon ami", "Son ami"], correctIndex: 2, explanation: "Le suffixe ي = mon → صَدِيقِي = mon ami." },
      { question: "Le pluriel de مُعَلِّمٌ est :", options: ["مُعَلِّمَةٌ", "مُعَلِّمُونَ", "مُعَلِّمَاتٌ", "مُعَلِّمَانِ"], correctIndex: 1, explanation: "Le pluriel masculin régulier : مُعَلِّمُونَ." },
    ],
    dictation: [
      { sentence: "اِسْتَيْقَظَتْ مُبَكِّرًا", transliteration: "istayqazat mubakkiran (elle s'est réveillée tôt)", options: ["اِسْتَيْقَظَ مُبَكِّرًا", "اِسْتَيْقَظَتْ مُتَأَخِّرَةً", "اِسْتَيْقَظَتْ مُبَكِّرًا", "نَامَتْ مُبَكِّرًا"], correctIndex: 2 },
      { sentence: "حَفْلَةُ التَّخَرُّجِ", transliteration: "haflatu-t-takharruji (la cérémonie de remise des diplômes)", options: ["حَفْلَةُ الْعِيدِ", "حَفْلَةُ التَّخَرُّجِ", "حَفْلَةُ الزَّفَافِ", "حِصَّةُ الدَّرْسِ"], correctIndex: 1 },
      { sentence: "أَنَا سَعِيدَةٌ جِدًّا", transliteration: "anâ sa'îdatun jiddan (je suis très heureuse)", options: ["أَنَا حَزِينَةٌ جِدًّا", "هِيَ سَعِيدَةٌ جِدًّا", "أَنَا سَعِيدَةٌ جِدًّا", "أَنْتِ سَعِيدَةٌ جِدًّا"], correctIndex: 2 },
      { sentence: "فَرِحَ الْمُعَلِّمُونَ وَالطُّلَّابُ", transliteration: "fariha-l-mu'allimûna wa-t-tullâbu (les enseignants et les élèves étaient joyeux)", options: ["فَرِحَ الْمُعَلِّمُونَ وَالطُّلَّابُ", "حَزِنَ الْمُعَلِّمُونَ", "فَرِحَ الطُّلَّابُ فَقَطْ", "فَرِحَتِ الْأُمَّهَاتُ"], correctIndex: 0 },
    ],
  },
];

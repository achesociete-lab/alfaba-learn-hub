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
  videoUrl?: string;
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
      {
        title: "Le Tanwîn — rappel",
        explanation: "Le Tanwîn ajoute un son 'n' à la fin du mot pour indiquer l'indétermination. Il existe trois formes : Tanwîn Fatha (ً), Tanwîn Damma (ٌ), Tanwîn Kasra (ٍ).",
        examples: [
          { arabic: "كِتَابٌ", transliteration: "kitâbun", meaning: "un livre (nominatif)" },
          { arabic: "كِتَابًا", transliteration: "kitâban", meaning: "un livre (accusatif)" },
          { arabic: "كِتَابٍ", transliteration: "kitâbin", meaning: "un livre (génitif)" },
        ],
      },
      {
        title: "La Shadda — rappel",
        explanation: "La Shadda (ّ) double la consonne sur laquelle elle est placée. La lettre est prononcée deux fois : une fois avec soukoun, une fois avec la voyelle qui suit.",
        examples: [
          { arabic: "شَدَّ", transliteration: "shadda", meaning: "il a tiré" },
          { arabic: "مُعَلِّمٌ", transliteration: "mu'allimun", meaning: "un enseignant" },
          { arabic: "قَدَّمَ", transliteration: "qaddama", meaning: "il a présenté" },
        ],
      },
    ],
    comprehension: {
      title: "Mon premier texte",
      arabic: "ذَهَبَ أَحْمَدُ إِلَى الْمَدْرَسَةِ. هُوَ تِلْمِيذٌ صَغِيرٌ. يُحِبُّ الْقِرَاءَةَ وَالْكِتَابَةَ. مُعَلِّمُهُ طَيِّبٌ وَالدَّرْسُ مُمْتِعٌ.",
      translation: "Ahmad est allé à l'école. C'est un petit élève. Il aime la lecture et l'écriture. Son enseignant est gentil et la leçon est agréable.",
      questions: [
        { question: "Où est allé Ahmad ?", options: ["Au marché", "À l'école", "À la maison", "Au parc"], correctIndex: 1, explanation: "الْمَدْرَسَة signifie l'école." },
        { question: "Que aime Ahmad ?", options: ["Le sport", "La cuisine", "La lecture et l'écriture", "Le dessin"], correctIndex: 2, explanation: "الْقِرَاءَة (lecture) وَالْكِتَابَة (écriture)." },
        { question: "Comment est l'enseignant ?", options: ["Sévère", "Gentil", "Absent", "Fatigué"], correctIndex: 1, explanation: "طَيِّبٌ = gentil." },
      ],
    },
    qcm: [
      { question: "Quel est le Tanwin de 'un livre' au nominatif ?", options: ["كِتَابَ", "كِتَابٌ", "كِتَابِ", "كِتَابُ"], correctIndex: 1, explanation: "Le Tanwin Damma (ٌ) marque l'indéfini au cas nominatif : كِتَابٌ." },
      { question: "Quelle voyelle longue est formée avec Alif ?", options: ["ou (û)", "i (î)", "a (â)", "Aucune"], correctIndex: 2, explanation: "Alif prolonge la Fatha pour donner le son 'â'." },
      { question: "Comment lit-on كُتُبٌ ?", options: ["kitâbun", "kutubun", "kataba", "kitbun"], correctIndex: 1, explanation: "Deux Damma + Tanwin Damma = kutubun (des livres)." },
      { question: "Quel signe indique l'absence de voyelle ?", options: ["Fatha", "Damma", "Kasra", "Soukoun"], correctIndex: 3, explanation: "Le Soukoun (ْ) indique l'absence de voyelle sur une consonne." },
      { question: "La Shadda signifie :", options: ["Absence de voyelle", "Voyelle longue", "Doublement de la consonne", "Fin du mot"], correctIndex: 2, explanation: "La Shadda (ّ) double la consonne." },
      { question: "Comment prononce-t-on مُعَلِّمٌ ?", options: ["mu'alimun", "mu'allimun", "mu'limun", "m'alimun"], correctIndex: 1, explanation: "Le Lâm est doublé grâce à la Shadda : mu'allimun." },
      { question: "Le Tanwîn Kasra s'écrit :", options: ["ً", "ٌ", "ٍ", "ّ"], correctIndex: 2, explanation: "Le Tanwîn Kasra (ٍ) est la double kasra sous la lettre." },
      { question: "Dans بَابٌ, quelle voyelle est longue ?", options: ["La Damma", "La Kasra", "La Fatha", "Aucune"], correctIndex: 2, explanation: "Le Alif après le Bâ' prolonge la Fatha : bâ-bun." },
      { question: "Quel mot contient une Shadda ?", options: ["كَتَبَ", "بَابٌ", "شَدَّ", "نُورٌ"], correctIndex: 2, explanation: "شَدَّ contient une Shadda sur le Dâl." },
      { question: "L'arabe s'écrit de :", options: ["Gauche à droite", "Droite à gauche", "Haut en bas", "Bas en haut"], correctIndex: 1, explanation: "L'arabe s'écrit de droite à gauche." },
    ],
    dictation: [
      { sentence: "كِتَابٌ", transliteration: "kitâbun (un livre)", options: ["كِتَابٌ", "كَتَبَ", "كُتُبٌ", "كَاتِبٌ"], correctIndex: 0 },
      { sentence: "مَدْرَسَةٌ", transliteration: "madrasatun (une école)", options: ["مُدَرِّسٌ", "مَدْرَسَةٌ", "دَرْسٌ", "دِرَاسَةٌ"], correctIndex: 1 },
      { sentence: "تِلْمِيذٌ", transliteration: "tilmîdhun (un élève)", options: ["تَلَامِيذٌ", "تَعْلِيمٌ", "تِلْمِيذٌ", "مُعَلِّمٌ"], correctIndex: 2 },
      { sentence: "مُعَلِّمٌ", transliteration: "mu'allimun (un enseignant)", options: ["مُعَلِّمٌ", "مَعْلُومٌ", "عِلْمٌ", "عَالِمٌ"], correctIndex: 0 },
      { sentence: "قَلَمٌ", transliteration: "qalamun (un stylo)", options: ["كَلِمَةٌ", "قَلَمٌ", "قَمَرٌ", "عَلَمٌ"], correctIndex: 1 },
      { sentence: "بَابٌ كَبِيرٌ", transliteration: "bâbun kabîrun (une grande porte)", options: ["بَابٌ صَغِيرٌ", "بَابٌ كَبِيرٌ", "بَيْتٌ كَبِيرٌ", "بَابٌ جَمِيلٌ"], correctIndex: 1 },
      { sentence: "نُورٌ سَاطِعٌ", transliteration: "nûrun sâti'un (une lumière éclatante)", options: ["نُورٌ سَاطِعٌ", "نَارٌ سَاطِعَةٌ", "نُورٌ ضَعِيفٌ", "شَمْسٌ سَاطِعَةٌ"], correctIndex: 0 },
      { sentence: "شَدَّ الْحَبْلَ", transliteration: "shadda-l-habla (il a tiré la corde)", options: ["شَدَّ الْحَبْلَ", "قَطَعَ الْحَبْلَ", "رَبَطَ الْحَبْلَ", "شَدَّ الْبَابَ"], correctIndex: 0 },
      { sentence: "كُتُبٌ كَثِيرَةٌ", transliteration: "kutubun kathîratun (beaucoup de livres)", options: ["كِتَابٌ كَبِيرٌ", "كُتُبٌ قَلِيلَةٌ", "كُتُبٌ كَثِيرَةٌ", "كُتُبٌ جَدِيدَةٌ"], correctIndex: 2 },
      { sentence: "قَدَّمَ الطَّعَامَ", transliteration: "qaddama-t-ta'âma (il a présenté la nourriture)", options: ["أَكَلَ الطَّعَامَ", "قَدَّمَ الطَّعَامَ", "طَبَخَ الطَّعَامَ", "قَدَّمَ الْكِتَابَ"], correctIndex: 1 },
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
      {
        title: "Astuce pour reconnaître",
        explanation: "Si vous pouvez prononcer le 'l' de 'al' naturellement devant la lettre, c'est lunaire. Si le 'l' s'assimile et que vous doublez la lettre suivante, c'est solaire. Exemple : al-kitâb (lunaire) vs ash-shams (solaire).",
        examples: [
          { arabic: "الْجَبَلُ", transliteration: "al-jabalu", meaning: "la montagne (lunaire)" },
          { arabic: "التِّلْمِيذُ", transliteration: "at-tilmîdhu", meaning: "l'élève (solaire)" },
          { arabic: "الْعِلْمُ", transliteration: "al-'ilmu", meaning: "la science (lunaire)" },
        ],
      },
    ],
    comprehension: {
      title: "Le soleil et la lune",
      arabic: "الشَّمْسُ كَبِيرَةٌ وَالْقَمَرُ جَمِيلٌ. نَرَى الشَّمْسَ فِي النَّهَارِ وَنَرَى الْقَمَرَ فِي اللَّيْلِ. السَّمَاءُ زَرْقَاءُ وَالنُّجُومُ لَامِعَةٌ.",
      translation: "Le soleil est grand et la lune est belle. Nous voyons le soleil le jour et nous voyons la lune la nuit. Le ciel est bleu et les étoiles sont brillantes.",
      questions: [
        { question: "Comment est décrit le soleil ?", options: ["Petit", "Grand", "Beau", "Lumineux"], correctIndex: 1, explanation: "كَبِيرَةٌ = grande." },
        { question: "Quand voit-on la lune ?", options: ["Le matin", "L'après-midi", "La nuit", "Toujours"], correctIndex: 2, explanation: "فِي اللَّيْلِ = la nuit." },
        { question: "Comment sont les étoiles ?", options: ["Petites", "Sombres", "Brillantes", "Lointaines"], correctIndex: 2, explanation: "لَامِعَةٌ = brillantes." },
      ],
    },
    qcm: [
      { question: "الشَّمْسُ — le Lam est :", options: ["Lunaire", "Solaire", "Absent", "Double"], correctIndex: 1, explanation: "ش est une lettre solaire, donc le Lam est assimilé : ash-shamsu." },
      { question: "الْكِتَابُ — le Lam est :", options: ["Solaire", "Lunaire", "Silencieux", "Inexistant"], correctIndex: 1, explanation: "ك est une lettre lunaire, le Lam se prononce : al-kitâbu." },
      { question: "Comment prononce-t-on النُّورُ ?", options: ["al-nûru", "an-nûru", "nûru", "al-nawru"], correctIndex: 1, explanation: "ن est solaire, le Lam s'assimile : an-nûru." },
      { question: "Quelle lettre est solaire ?", options: ["ب", "ك", "ت", "ع"], correctIndex: 2, explanation: "Le Tâ' (ت) est une lettre solaire." },
      { question: "Quelle lettre est lunaire ?", options: ["ن", "ش", "ق", "د"], correctIndex: 2, explanation: "Le Qâf (ق) est une lettre lunaire." },
      { question: "Comment prononce-t-on الرَّجُلُ ?", options: ["al-rajulu", "ar-rajulu", "rajulu", "al-rjulu"], correctIndex: 1, explanation: "ر est solaire, le Lam est assimilé : ar-rajulu." },
      { question: "الْعِلْمُ — le Lam est :", options: ["Solaire", "Lunaire", "Muet", "Double"], correctIndex: 1, explanation: "ع est une lettre lunaire, le Lam se prononce." },
      { question: "Combien y a-t-il de lettres solaires ?", options: ["10", "12", "14", "16"], correctIndex: 2, explanation: "Il y a 14 lettres solaires (ت ث د ذ ر ز س ش ص ض ط ظ ل ن)." },
      { question: "التِّلْمِيذُ — comment se prononce-t-il ?", options: ["al-tilmîdhu", "at-tilmîdhu", "tilmîdhu", "al-tilmîdh"], correctIndex: 1, explanation: "ت est solaire : at-tilmîdhu." },
      { question: "L'article défini en arabe est :", options: ["ان", "ال", "ام", "اب"], correctIndex: 1, explanation: "L'article défini est ال (alif-lâm)." },
    ],
    dictation: [
      { sentence: "الشَّمْسُ", transliteration: "ash-shamsu (le soleil)", options: ["الشَّمْسُ", "الْشَمْسُ", "شَمْسٌ", "الصَّمْسُ"], correctIndex: 0 },
      { sentence: "الْقَمَرُ", transliteration: "al-qamaru (la lune)", options: ["القَّمَرُ", "قَمَرٌ", "الْقَمَرُ", "الْكَمَرُ"], correctIndex: 2 },
      { sentence: "الرَّجُلُ", transliteration: "ar-rajulu (l'homme)", options: ["الْرَجُلُ", "رَجُلٌ", "الرَّجُلُ", "الرَّجِلُ"], correctIndex: 2 },
      { sentence: "الْكِتَابُ", transliteration: "al-kitâbu (le livre)", options: ["الْكِتَابُ", "الكِّتَابُ", "كِتَابٌ", "الْكَتَّابُ"], correctIndex: 0 },
      { sentence: "النُّورُ", transliteration: "an-nûru (la lumière)", options: ["الْنُورُ", "النُّورُ", "نُورٌ", "النَّوْرُ"], correctIndex: 1 },
      { sentence: "الْبَيْتُ", transliteration: "al-baytu (la maison)", options: ["بَيْتٌ", "الْبَيْتُ", "البَّيْتُ", "الْبِيتُ"], correctIndex: 1 },
      { sentence: "السَّمَاءُ", transliteration: "as-samâ'u (le ciel)", options: ["الْسَمَاءُ", "سَمَاءٌ", "السَّمَاءُ", "السَّمَاعُ"], correctIndex: 2 },
      { sentence: "التِّلْمِيذُ", transliteration: "at-tilmîdhu (l'élève)", options: ["الْتِلْمِيذُ", "تِلْمِيذٌ", "التِّلْمِيذُ", "التِّلْمِذُ"], correctIndex: 2 },
      { sentence: "الْجَبَلُ", transliteration: "al-jabalu (la montagne)", options: ["جَبَلٌ", "الْجَبَلُ", "الجَّبَلُ", "الْجَبْلُ"], correctIndex: 1 },
      { sentence: "الْعِلْمُ نُورٌ", transliteration: "al-'ilmu nûrun (la science est lumière)", options: ["الْعِلْمُ نُورٌ", "الْعِلْمُ ظَلَامٌ", "الْعَمَلُ نُورٌ", "الْعِلْمُ نَارٌ"], correctIndex: 0 },
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
      {
        title: "Le vocabulaire de l'école",
        explanation: "Mots du quotidien scolaire.",
        examples: [
          { arabic: "فَصْلٌ", transliteration: "faslun", meaning: "une classe" },
          { arabic: "سَبُّورَةٌ", transliteration: "sabbûratun", meaning: "un tableau" },
          { arabic: "كُرْسِيٌّ", transliteration: "kursiyyun", meaning: "une chaise" },
        ],
      },
    ],
    comprehension: {
      title: "La maison de Fatima",
      arabic: "فَاطِمَةُ تَسْكُنُ فِي بَيْتٍ كَبِيرٍ. فِي الْبَيْتِ ثَلَاثُ غُرَفٍ وَمَطْبَخٌ وَحَمَّامٌ. أُمُّهَا تَطْبُخُ فِي الْمَطْبَخِ وَأَبُوهَا يَقْرَأُ فِي الْغُرْفَةِ.",
      translation: "Fatima habite dans une grande maison. Dans la maison il y a trois chambres, une cuisine et une salle de bain. Sa mère cuisine dans la cuisine et son père lit dans la chambre.",
      questions: [
        { question: "Comment est la maison de Fatima ?", options: ["Petite", "Grande", "Vieille", "Nouvelle"], correctIndex: 1, explanation: "كَبِيرٍ = grande." },
        { question: "Combien de chambres y a-t-il ?", options: ["Deux", "Trois", "Quatre", "Cinq"], correctIndex: 1, explanation: "ثَلَاثُ غُرَفٍ = trois chambres." },
        { question: "Que fait la mère de Fatima ?", options: ["Elle lit", "Elle dort", "Elle cuisine", "Elle écrit"], correctIndex: 2, explanation: "تَطْبُخُ = elle cuisine." },
        { question: "Que fait le père de Fatima ?", options: ["Il cuisine", "Il lit", "Il dort", "Il travaille"], correctIndex: 1, explanation: "يَقْرَأُ = il lit." },
      ],
    },
    qcm: [
      { question: "Que signifie بَيْتٌ ?", options: ["École", "Maison", "Jardin", "Rue"], correctIndex: 1, explanation: "بَيْتٌ = une maison." },
      { question: "Que signifie أُمٌّ ?", options: ["Père", "Frère", "Mère", "Sœur"], correctIndex: 2, explanation: "أُمٌّ = une mère." },
      { question: "Que signifie مَطْبَخٌ ?", options: ["Salon", "Cuisine", "Chambre", "Jardin"], correctIndex: 1, explanation: "مَطْبَخٌ = une cuisine." },
      { question: "Que signifie غُرْفَةٌ ?", options: ["Cuisine", "Salle de bain", "Chambre", "Salon"], correctIndex: 2, explanation: "غُرْفَةٌ = une chambre." },
      { question: "Que signifie أَبٌ ?", options: ["Mère", "Père", "Oncle", "Grand-père"], correctIndex: 1, explanation: "أَبٌ = un père." },
      { question: "Que signifie أَخٌ ?", options: ["Sœur", "Ami", "Cousin", "Frère"], correctIndex: 3, explanation: "أَخٌ = un frère." },
      { question: "Que signifie فَصْلٌ ?", options: ["Leçon", "Classe", "Bureau", "École"], correctIndex: 1, explanation: "فَصْلٌ = une classe." },
      { question: "Que signifie سَبُّورَةٌ ?", options: ["Cahier", "Stylo", "Tableau", "Livre"], correctIndex: 2, explanation: "سَبُّورَةٌ = un tableau." },
      { question: "Que signifie كُرْسِيٌّ ?", options: ["Table", "Chaise", "Bureau", "Armoire"], correctIndex: 1, explanation: "كُرْسِيٌّ = une chaise." },
      { question: "تَسْكُنُ signifie :", options: ["Elle mange", "Elle dort", "Elle habite", "Elle étudie"], correctIndex: 2, explanation: "تَسْكُنُ = elle habite." },
    ],
    dictation: [
      { sentence: "بَيْتٌ كَبِيرٌ", transliteration: "baytun kabîrun (une grande maison)", options: ["بَيْتٌ كَبِيرٌ", "بَيْتٌ صَغِيرٌ", "بِنْتٌ كَبِيرَةٌ", "بَابٌ كَبِيرٌ"], correctIndex: 0 },
      { sentence: "ثَلَاثُ غُرَفٍ", transliteration: "thalâthu ghurafin (trois chambres)", options: ["ثَلَاثُ كُتُبٍ", "أَرْبَعُ غُرَفٍ", "ثَلَاثُ غُرَفٍ", "ثَلَاثَةُ أَوْلَادٍ"], correctIndex: 2 },
      { sentence: "أُمِّي تَطْبُخُ", transliteration: "ummî tatbukhu (ma mère cuisine)", options: ["أُمِّي تَقْرَأُ", "أُمِّي تَطْبُخُ", "أُخْتِي تَطْبُخُ", "أُمِّي تَكْتُبُ"], correctIndex: 1 },
      { sentence: "أَبِي يَقْرَأُ", transliteration: "abî yaqra'u (mon père lit)", options: ["أَبِي يَكْتُبُ", "أَبِي يَنَامُ", "أَبِي يَقْرَأُ", "أَخِي يَقْرَأُ"], correctIndex: 2 },
      { sentence: "مَطْبَخٌ نَظِيفٌ", transliteration: "matbakhun nadhîfun (une cuisine propre)", options: ["مَطْبَخٌ نَظِيفٌ", "مَطْبَخٌ كَبِيرٌ", "مَكْتَبٌ نَظِيفٌ", "مَطْبَخٌ وَاسِعٌ"], correctIndex: 0 },
      { sentence: "غُرْفَةٌ جَمِيلَةٌ", transliteration: "ghurfatun jamîlatun (une belle chambre)", options: ["غُرْفَةٌ كَبِيرَةٌ", "غُرْفَةٌ صَغِيرَةٌ", "غُرْفَةٌ جَمِيلَةٌ", "حَدِيقَةٌ جَمِيلَةٌ"], correctIndex: 2 },
      { sentence: "فِي الْبَيْتِ حَمَّامٌ", transliteration: "fî-l-bayti hammâmun (dans la maison une salle de bain)", options: ["فِي الْبَيْتِ مَطْبَخٌ", "فِي الْبَيْتِ حَمَّامٌ", "فِي الْبَيْتِ غُرْفَةٌ", "فِي الْمَدْرَسَةِ حَمَّامٌ"], correctIndex: 1 },
      { sentence: "أُخْتٌ صَغِيرَةٌ", transliteration: "ukhtun saghîratun (une petite sœur)", options: ["أَخٌ صَغِيرٌ", "أُخْتٌ كَبِيرَةٌ", "أُخْتٌ صَغِيرَةٌ", "بِنْتٌ صَغِيرَةٌ"], correctIndex: 2 },
      { sentence: "سَبُّورَةٌ بَيْضَاءُ", transliteration: "sabbûratun baydâ'u (un tableau blanc)", options: ["سَبُّورَةٌ خَضْرَاءُ", "سَبُّورَةٌ بَيْضَاءُ", "سَبُّورَةٌ سَوْدَاءُ", "صُورَةٌ بَيْضَاءُ"], correctIndex: 1 },
      { sentence: "كُرْسِيٌّ وَطَاوِلَةٌ", transliteration: "kursiyyun wa-tâwilatun (une chaise et une table)", options: ["كُرْسِيٌّ وَطَاوِلَةٌ", "كِتَابٌ وَقَلَمٌ", "كُرْسِيٌّ وَسَبُّورَةٌ", "طَاوِلَةٌ وَسَرِيرٌ"], correctIndex: 0 },
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
      {
        title: "Le duel",
        explanation: "Le duel (pour deux) ajoute ان (âni) au nominatif ou يْن (ayni) à l'accusatif/génitif.",
        examples: [
          { arabic: "كِتَابَانِ", transliteration: "kitâbâni", meaning: "deux livres" },
          { arabic: "طَالِبَتَانِ", transliteration: "tâlibatâni", meaning: "deux étudiantes" },
          { arabic: "وَلَدَانِ", transliteration: "waladâni", meaning: "deux garçons" },
        ],
      },
    ],
    comprehension: {
      title: "Dans la classe",
      arabic: "فِي الْفَصْلِ مُعَلِّمَةٌ وَعَشَرَةُ طُلَّابٍ. خَمْسَةُ طُلَّابٍ وَخَمْسُ طَالِبَاتٍ. الْمُعَلِّمَةُ تَشْرَحُ الدَّرْسَ وَالطُّلَّابُ يَسْتَمِعُونَ.",
      translation: "Dans la classe il y a une enseignante et dix élèves. Cinq garçons et cinq filles. L'enseignante explique la leçon et les élèves écoutent.",
      questions: [
        { question: "Combien d'élèves y a-t-il ?", options: ["Cinq", "Huit", "Dix", "Quinze"], correctIndex: 2, explanation: "عَشَرَةُ طُلَّابٍ = dix élèves." },
        { question: "Que fait l'enseignante ?", options: ["Elle lit", "Elle explique la leçon", "Elle écrit", "Elle questionne"], correctIndex: 1, explanation: "تَشْرَحُ الدَّرْسَ = elle explique la leçon." },
        { question: "Que font les élèves ?", options: ["Ils écrivent", "Ils jouent", "Ils écoutent", "Ils lisent"], correctIndex: 2, explanation: "يَسْتَمِعُونَ = ils écoutent." },
      ],
    },
    qcm: [
      { question: "Quel est le féminin de مُعَلِّمٌ ?", options: ["مُعَلِّمُونَ", "مُعَلِّمَةٌ", "مُعَلِّمَاتٌ", "مَعْلُومٌ"], correctIndex: 1, explanation: "On ajoute le Ta Marbuta (ة) pour le féminin." },
      { question: "Quel est le pluriel féminin de طَالِبَةٌ ?", options: ["طُلَّابٌ", "طَالِبُونَ", "طَالِبَاتٌ", "طَالِبَتَانِ"], correctIndex: 2, explanation: "Le pluriel féminin régulier remplace ة par ات." },
      { question: "Le Ta Marbuta (ة) indique généralement :", options: ["Le pluriel", "Le masculin", "Le féminin", "Le duel"], correctIndex: 2, explanation: "Le Ta Marbuta est la marque la plus courante du féminin." },
      { question: "كِتَابَانِ signifie :", options: ["Un livre", "Des livres", "Deux livres", "Le livre"], correctIndex: 2, explanation: "Le suffixe ان indique le duel : deux livres." },
      { question: "Quel est le pluriel masculin de مُعَلِّمٌ ?", options: ["مُعَلِّمَةٌ", "مُعَلِّمُونَ", "مُعَلِّمَاتٌ", "مُعَلِّمَانِ"], correctIndex: 1, explanation: "Le pluriel masculin régulier ajoute ون." },
      { question: "Comment forme-t-on le duel féminin ?", options: ["On ajoute ون", "On ajoute ات", "On ajoute تان", "On ajoute ين"], correctIndex: 2, explanation: "Le duel féminin ajoute تان au radical." },
      { question: "وَلَدٌ est :", options: ["Féminin", "Masculin", "Pluriel", "Duel"], correctIndex: 1, explanation: "وَلَدٌ (garçon) est masculin singulier." },
      { question: "Quelle est la marque du pluriel féminin régulier ?", options: ["ون", "ات", "ان", "ين"], correctIndex: 1, explanation: "Le pluriel féminin régulier se termine par ات." },
      { question: "شَمْسٌ est un mot féminin sans :", options: ["Voyelle", "Point", "Ta Marbuta", "Article"], correctIndex: 2, explanation: "شَمْسٌ est féminin mais ne porte pas de Ta Marbuta." },
      { question: "طَالِبَتَانِ signifie :", options: ["Des étudiantes", "Deux étudiantes", "L'étudiante", "Une étudiante"], correctIndex: 1, explanation: "Le suffixe تان marque le duel féminin." },
    ],
    dictation: [
      { sentence: "مُعَلِّمَةٌ", transliteration: "mu'allimatun (une enseignante)", options: ["مُعَلِّمٌ", "مُعَلِّمَةٌ", "مُعَلِّمُونَ", "مُعَلِّمَاتٌ"], correctIndex: 1 },
      { sentence: "طَالِبَاتٌ", transliteration: "tâlibâtun (des étudiantes)", options: ["طَالِبٌ", "طَالِبَةٌ", "طَالِبَاتٌ", "طُلَّابٌ"], correctIndex: 2 },
      { sentence: "خَمْسَةُ طُلَّابٍ", transliteration: "khamsatu tullâbin (cinq élèves)", options: ["عَشَرَةُ طُلَّابٍ", "خَمْسَةُ طُلَّابٍ", "ثَلَاثَةُ طُلَّابٍ", "سَبْعَةُ طُلَّابٍ"], correctIndex: 1 },
      { sentence: "كِتَابَانِ", transliteration: "kitâbâni (deux livres)", options: ["كِتَابٌ", "كُتُبٌ", "كِتَابَانِ", "الْكِتَابُ"], correctIndex: 2 },
      { sentence: "مُعَلِّمُونَ", transliteration: "mu'allimûna (des enseignants)", options: ["مُعَلِّمٌ", "مُعَلِّمُونَ", "مُعَلِّمَاتٌ", "مُعَلِّمَةٌ"], correctIndex: 1 },
      { sentence: "وَلَدَانِ صَغِيرَانِ", transliteration: "waladâni saghîrâni (deux petits garçons)", options: ["وَلَدٌ صَغِيرٌ", "أَوْلَادٌ صِغَارٌ", "وَلَدَانِ صَغِيرَانِ", "وَلَدَانِ كَبِيرَانِ"], correctIndex: 2 },
      { sentence: "بِنْتٌ جَمِيلَةٌ", transliteration: "bintun jamîlatun (une belle fille)", options: ["بِنْتٌ كَبِيرَةٌ", "بِنْتٌ جَمِيلَةٌ", "بِنْتٌ صَغِيرَةٌ", "وَلَدٌ جَمِيلٌ"], correctIndex: 1 },
      { sentence: "طَالِبَتَانِ", transliteration: "tâlibatâni (deux étudiantes)", options: ["طَالِبٌ", "طَالِبَةٌ", "طَالِبَاتٌ", "طَالِبَتَانِ"], correctIndex: 3 },
      { sentence: "أَوْلَادٌ كِبَارٌ", transliteration: "awlâdun kibârun (de grands garçons)", options: ["أَوْلَادٌ صِغَارٌ", "أَوْلَادٌ كِبَارٌ", "بَنَاتٌ كِبَارٌ", "أَوْلَادٌ جُدُدٌ"], correctIndex: 1 },
      { sentence: "الْمُعَلِّمَةُ تَشْرَحُ", transliteration: "al-mu'allimatu tashrah (l'enseignante explique)", options: ["الْمُعَلِّمُ يَشْرَحُ", "الْمُعَلِّمَةُ تَكْتُبُ", "الْمُعَلِّمَةُ تَشْرَحُ", "الطَّالِبَةُ تَشْرَحُ"], correctIndex: 2 },
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
        explanation: "Le Moubtada est le sujet de la phrase nominale. Il est toujours au cas nominatif (marfou') et généralement défini.",
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
      arabic: "الْغُرْفَةُ وَاسِعَةٌ. السَّرِيرُ كَبِيرٌ وَالْمَكْتَبُ صَغِيرٌ. الْكُتُبُ عَلَى الرَّفِّ. النَّافِذَةُ مَفْتُوحَةٌ وَالْهَوَاءُ عَلِيلٌ.",
      translation: "La chambre est spacieuse. Le lit est grand et le bureau est petit. Les livres sont sur l'étagère. La fenêtre est ouverte et l'air est doux.",
      questions: [
        { question: "Comment est la chambre ?", options: ["Petite", "Sombre", "Spacieuse", "Sale"], correctIndex: 2, explanation: "وَاسِعَةٌ = spacieuse." },
        { question: "Où sont les livres ?", options: ["Sur le bureau", "Sur le lit", "Sur l'étagère", "Par terre"], correctIndex: 2, explanation: "عَلَى الرَّفِّ = sur l'étagère." },
        { question: "Comment est la fenêtre ?", options: ["Fermée", "Cassée", "Ouverte", "Petite"], correctIndex: 2, explanation: "مَفْتُوحَةٌ = ouverte." },
      ],
    },
    qcm: [
      { question: "Dans الْوَلَدُ كَبِيرٌ, quel est le Moubtada ?", options: ["كَبِيرٌ", "الْوَلَدُ", "Les deux", "Aucun"], correctIndex: 1, explanation: "الْوَلَدُ (le garçon) est le sujet = Moubtada." },
      { question: "Dans الْكِتَابُ عَلَى الطَّاوِلَةِ, quel est le Khabar ?", options: ["الْكِتَابُ", "عَلَى", "الطَّاوِلَةِ", "عَلَى الطَّاوِلَةِ"], correctIndex: 3, explanation: "Le groupe prépositionnel عَلَى الطَّاوِلَةِ est le Khabar." },
      { question: "La phrase nominale commence par :", options: ["Un verbe", "Un nom", "Une préposition", "Un adverbe"], correctIndex: 1, explanation: "La phrase nominale (الجملة الاسمية) commence toujours par un nom." },
      { question: "Le Moubtada est généralement :", options: ["Indéfini", "Défini", "Au génitif", "Au accusatif"], correctIndex: 1, explanation: "Le Moubtada est généralement défini (avec ال ou un nom propre)." },
      { question: "Le Khabar est généralement :", options: ["Défini", "Indéfini", "Verbal", "Absent"], correctIndex: 1, explanation: "Le Khabar est généralement indéfini quand c'est un adjectif." },
      { question: "Dans السَّمَاءُ زَرْقَاءُ, le Khabar est :", options: ["السَّمَاءُ", "زَرْقَاءُ", "Un verbe", "Absent"], correctIndex: 1, explanation: "زَرْقَاءُ (bleu) est le Khabar/attribut." },
      { question: "En arabe, le verbe 'être' au présent :", options: ["Est obligatoire", "N'existe pas", "Est sous-entendu", "Est au début"], correctIndex: 2, explanation: "Le verbe 'être' au présent est sous-entendu en arabe." },
      { question: "الطَّعَامُ لَذِيذٌ se traduit :", options: ["La nourriture mange", "La nourriture est délicieuse", "Le repas est prêt", "La cuisine est bonne"], correctIndex: 1, explanation: "Moubtada (الطَّعَامُ) + Khabar (لَذِيذٌ) = La nourriture est délicieuse." },
      { question: "Quel type de Khabar est عَلَى الطَّاوِلَةِ ?", options: ["Adjectif", "Groupe prépositionnel", "Verbe", "Nom propre"], correctIndex: 1, explanation: "C'est un groupe prépositionnel (préposition + nom)." },
      { question: "Le cas du Moubtada est :", options: ["Le génitif", "L'accusatif", "Le nominatif", "Aucun cas"], correctIndex: 2, explanation: "Le Moubtada est au cas nominatif (مرفوع)." },
    ],
    dictation: [
      { sentence: "الْوَلَدُ كَبِيرٌ", transliteration: "al-waladu kabîrun (le garçon est grand)", options: ["الْوَلَدُ كَبِيرٌ", "الْوَلَدُ صَغِيرٌ", "الْبِنْتُ كَبِيرَةٌ", "الرَّجُلُ كَبِيرٌ"], correctIndex: 0 },
      { sentence: "السَّمَاءُ زَرْقَاءُ", transliteration: "as-samâ'u zarqâ'u (le ciel est bleu)", options: ["الشَّمْسُ صَفْرَاءُ", "السَّمَاءُ زَرْقَاءُ", "الْأَرْضُ خَضْرَاءُ", "السَّمَاءُ بَيْضَاءُ"], correctIndex: 1 },
      { sentence: "الْبَيْتُ جَمِيلٌ", transliteration: "al-baytu jamîlun (la maison est belle)", options: ["الْبَيْتُ كَبِيرٌ", "الْبَيْتُ جَمِيلٌ", "الْبَيْتُ قَدِيمٌ", "الْبَيْتُ صَغِيرٌ"], correctIndex: 1 },
      { sentence: "الطَّعَامُ لَذِيذٌ", transliteration: "at-ta'âmu ladhîdhun (la nourriture est délicieuse)", options: ["الطَّعَامُ لَذِيذٌ", "الطَّعَامُ حَارٌّ", "الْمَاءُ لَذِيذٌ", "الطَّعَامُ جَاهِزٌ"], correctIndex: 0 },
      { sentence: "الْغُرْفَةُ وَاسِعَةٌ", transliteration: "al-ghurfatu wâsi'atun (la chambre est spacieuse)", options: ["الْغُرْفَةُ ضَيِّقَةٌ", "الْغُرْفَةُ وَاسِعَةٌ", "الْغُرْفَةُ نَظِيفَةٌ", "الْغُرْفَةُ مُظْلِمَةٌ"], correctIndex: 1 },
      { sentence: "الْكُتُبُ عَلَى الرَّفِّ", transliteration: "al-kutubu 'alâ-r-raffi (les livres sont sur l'étagère)", options: ["الْكُتُبُ فِي الْحَقِيبَةِ", "الْكُتُبُ عَلَى الرَّفِّ", "الْكُتُبُ تَحْتَ الطَّاوِلَةِ", "الْكُتُبُ عَلَى الْمَكْتَبِ"], correctIndex: 1 },
      { sentence: "النَّافِذَةُ مَفْتُوحَةٌ", transliteration: "an-nâfidhatu maftûhatun (la fenêtre est ouverte)", options: ["النَّافِذَةُ مُغْلَقَةٌ", "النَّافِذَةُ مَفْتُوحَةٌ", "النَّافِذَةُ مَكْسُورَةٌ", "الْبَابُ مَفْتُوحٌ"], correctIndex: 1 },
      { sentence: "الْمَكْتَبُ صَغِيرٌ", transliteration: "al-maktabu saghîrun (le bureau est petit)", options: ["الْمَكْتَبُ كَبِيرٌ", "الْمَكْتَبُ صَغِيرٌ", "الْمَكْتَبُ نَظِيفٌ", "الْفَصْلُ صَغِيرٌ"], correctIndex: 1 },
      { sentence: "السَّرِيرُ مُرِيحٌ", transliteration: "as-sarîru murîhun (le lit est confortable)", options: ["السَّرِيرُ مُرِيحٌ", "السَّرِيرُ صَغِيرٌ", "الْكُرْسِيُّ مُرِيحٌ", "السَّرِيرُ جَدِيدٌ"], correctIndex: 0 },
      { sentence: "الْهَوَاءُ عَلِيلٌ", transliteration: "al-hawâ'u 'alîlun (l'air est doux)", options: ["الْهَوَاءُ حَارٌّ", "الْهَوَاءُ بَارِدٌ", "الْهَوَاءُ عَلِيلٌ", "الْمَاءُ عَلِيلٌ"], correctIndex: 2 },
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
      {
        title: "L'accord du verbe",
        explanation: "Au féminin, on ajoute تْ au passé. Le verbe précédant le sujet ne s'accorde qu'en genre (pas en nombre).",
        examples: [
          { arabic: "ذَهَبَتْ", transliteration: "dhahabat", meaning: "elle est allée" },
          { arabic: "كَتَبَتْ", transliteration: "katabat", meaning: "elle a écrit" },
          { arabic: "أَكَلَتْ", transliteration: "akalat", meaning: "elle a mangé" },
        ],
      },
    ],
    comprehension: {
      title: "La journée de Youssef",
      arabic: "اِسْتَيْقَظَ يُوسُفُ صَبَاحًا. غَسَلَ وَجْهَهُ وَأَكَلَ الْفُطُورَ. ذَهَبَ إِلَى الْمَدْرَسَةِ وَدَرَسَ مَعَ أَصْدِقَائِهِ. رَجَعَ إِلَى الْبَيْتِ مَسَاءً.",
      translation: "Youssef s'est réveillé le matin. Il a lavé son visage et a pris le petit-déjeuner. Il est allé à l'école et a étudié avec ses amis. Il est rentré à la maison le soir.",
      questions: [
        { question: "Quand Youssef s'est-il réveillé ?", options: ["Le soir", "Le matin", "L'après-midi", "La nuit"], correctIndex: 1, explanation: "صَبَاحًا = le matin." },
        { question: "Avec qui a-t-il étudié ?", options: ["Son frère", "Son père", "Ses amis", "Seul"], correctIndex: 2, explanation: "مَعَ أَصْدِقَائِهِ = avec ses amis." },
        { question: "Quand est-il rentré ?", options: ["Le matin", "À midi", "Le soir", "La nuit"], correctIndex: 2, explanation: "مَسَاءً = le soir." },
      ],
    },
    qcm: [
      { question: "Dans كَتَبَ الْوَلَدُ, quel est le verbe ?", options: ["الْوَلَدُ", "كَتَبَ", "الدَّرْسَ", "Aucun"], correctIndex: 1, explanation: "كَتَبَ (il a écrit) est le verbe au passé." },
      { question: "La phrase verbale commence par :", options: ["Un nom", "Un adjectif", "Un verbe", "Une préposition"], correctIndex: 2, explanation: "La phrase verbale commence toujours par un verbe." },
      { question: "Quel est le féminin de ذَهَبَ ?", options: ["ذَهَبَتْ", "ذَهَبُوا", "ذَهَبْنَ", "يَذْهَبُ"], correctIndex: 0, explanation: "On ajoute تْ pour le féminin au passé : ذَهَبَتْ." },
      { question: "L'ordre de la phrase verbale est :", options: ["Sujet + Verbe", "Verbe + Sujet", "Complément + Verbe", "Sujet + Complément"], correctIndex: 1, explanation: "L'ordre est : Verbe + Sujet (+ Complément)." },
      { question: "Le sujet de la phrase verbale s'appelle :", options: ["المبتدأ", "الخبر", "الفاعل", "المفعول به"], correctIndex: 2, explanation: "Le sujet de la phrase verbale est الفاعل (al-fâ'il)." },
      { question: "Le complément d'objet s'appelle :", options: ["الفاعل", "المفعول به", "المبتدأ", "الخبر"], correctIndex: 1, explanation: "Le complément d'objet est المفعول به (al-maf'ûl bihi)." },
      { question: "فَتَحَ signifie :", options: ["Il a fermé", "Il a ouvert", "Il a cassé", "Il a construit"], correctIndex: 1, explanation: "فَتَحَ = il a ouvert." },
      { question: "جَلَسَ signifie :", options: ["Il s'est levé", "Il a marché", "Il s'est assis", "Il a couru"], correctIndex: 2, explanation: "جَلَسَ = il s'est assis." },
      { question: "Le verbe au passé est appelé :", options: ["المضارع", "الأمر", "الماضي", "المصدر"], correctIndex: 2, explanation: "Le verbe au passé est الماضي (al-mâdî)." },
      { question: "Dans قَرَأَتِ الْبِنْتُ, pourquoi le verbe a un تِ ?", options: ["C'est le pluriel", "C'est le duel", "C'est le féminin", "C'est l'interrogation"], correctIndex: 2, explanation: "Le تْ/تِ marque le féminin au verbe passé." },
    ],
    dictation: [
      { sentence: "كَتَبَ الْوَلَدُ", transliteration: "kataba-l-waladu (le garçon a écrit)", options: ["كَتَبَ الْوَلَدُ", "كَتَبَتِ الْبِنْتُ", "قَرَأَ الْوَلَدُ", "كَتَبَ الرَّجُلُ"], correctIndex: 0 },
      { sentence: "أَكَلَ الطِّفْلُ", transliteration: "akala-t-tiflu (l'enfant a mangé)", options: ["شَرِبَ الطِّفْلُ", "أَكَلَ الرَّجُلُ", "أَكَلَ الطِّفْلُ", "أَكَلَتِ الْبِنْتُ"], correctIndex: 2 },
      { sentence: "ذَهَبَتْ فَاطِمَةُ", transliteration: "dhahabat fâtimatu (Fatima est allée)", options: ["ذَهَبَ أَحْمَدُ", "ذَهَبَتْ فَاطِمَةُ", "جَلَسَتْ فَاطِمَةُ", "ذَهَبَتْ مَرْيَمُ"], correctIndex: 1 },
      { sentence: "غَسَلَ وَجْهَهُ", transliteration: "ghasala wajhahu (il a lavé son visage)", options: ["غَسَلَ يَدَيْهِ", "غَسَلَ وَجْهَهُ", "غَسَلَتْ وَجْهَهَا", "مَسَحَ وَجْهَهُ"], correctIndex: 1 },
      { sentence: "فَتَحَ الْبَابَ", transliteration: "fataha-l-bâba (il a ouvert la porte)", options: ["أَغْلَقَ الْبَابَ", "فَتَحَ الْبَابَ", "كَسَرَ الْبَابَ", "فَتَحَ النَّافِذَةَ"], correctIndex: 1 },
      { sentence: "جَلَسَ عَلَى الْكُرْسِيِّ", transliteration: "jalasa 'alâ-l-kursiyyi (il s'est assis sur la chaise)", options: ["جَلَسَ عَلَى الْأَرْضِ", "جَلَسَ عَلَى الْكُرْسِيِّ", "وَقَفَ عِنْدَ الْبَابِ", "جَلَسَتْ عَلَى الْكُرْسِيِّ"], correctIndex: 1 },
      { sentence: "قَرَأَتِ الْبِنْتُ الْقِصَّةَ", transliteration: "qara'ati-l-bintu-l-qissata (la fille a lu l'histoire)", options: ["كَتَبَتِ الْبِنْتُ الْقِصَّةَ", "قَرَأَتِ الْبِنْتُ الْقِصَّةَ", "قَرَأَ الْوَلَدُ الْقِصَّةَ", "قَرَأَتِ الْبِنْتُ الدَّرْسَ"], correctIndex: 1 },
      { sentence: "أَكَلَ الْفُطُورَ", transliteration: "akala-l-futûra (il a pris le petit-déjeuner)", options: ["أَكَلَ الْغَدَاءَ", "أَكَلَ الْعَشَاءَ", "أَكَلَ الْفُطُورَ", "شَرِبَ الْفُطُورَ"], correctIndex: 2 },
      { sentence: "دَرَسَ مَعَ أَصْدِقَائِهِ", transliteration: "darasa ma'a asdiqâ'ihi (il a étudié avec ses amis)", options: ["لَعِبَ مَعَ أَصْدِقَائِهِ", "دَرَسَ مَعَ أَصْدِقَائِهِ", "دَرَسَ مَعَ أَخِيهِ", "دَرَسَ وَحْدَهُ"], correctIndex: 1 },
      { sentence: "رَجَعَ إِلَى الْبَيْتِ", transliteration: "raja'a ilâ-l-bayti (il est rentré à la maison)", options: ["ذَهَبَ إِلَى الْبَيْتِ", "رَجَعَ إِلَى الْمَدْرَسَةِ", "رَجَعَ إِلَى الْبَيْتِ", "رَجَعَتْ إِلَى الْبَيْتِ"], correctIndex: 2 },
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
      {
        title: "Stratégies de compréhension",
        explanation: "Pour comprendre un texte arabe : 1) Lisez d'abord le texte en entier. 2) Identifiez les mots-clés. 3) Repérez les verbes pour comprendre les actions. 4) Utilisez le contexte pour deviner les mots inconnus.",
        examples: [
          { arabic: "كَمْ", transliteration: "kam", meaning: "combien ?" },
          { arabic: "هَلْ", transliteration: "hal", meaning: "est-ce que ?" },
          { arabic: "أَيٌّ", transliteration: "ayyun", meaning: "quel / lequel ?" },
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
      { question: "مَتَى signifie :", options: ["Où ?", "Quand ?", "Comment ?", "Qui ?"], correctIndex: 1, explanation: "مَتَى = quand ?" },
      { question: "كَيْفَ signifie :", options: ["Comment ?", "Pourquoi ?", "Où ?", "Combien ?"], correctIndex: 0, explanation: "كَيْفَ = comment ?" },
      { question: "هَلْ signifie :", options: ["Qui ?", "Où ?", "Est-ce que ?", "Quand ?"], correctIndex: 2, explanation: "هَلْ = est-ce que ? (particule interrogative)." },
      { question: "كَمْ signifie :", options: ["Comment ?", "Combien ?", "Quand ?", "Qui ?"], correctIndex: 1, explanation: "كَمْ = combien ?" },
      { question: "اِشْتَرَتْ signifie :", options: ["Elle a vendu", "Elle a acheté", "Elle a cuisiné", "Elle a mangé"], correctIndex: 1, explanation: "اِشْتَرَتْ = elle a acheté." },
      { question: "سَعِيدَتَيْنِ est au :", options: ["Singulier", "Pluriel", "Duel", "Indéfini"], correctIndex: 2, explanation: "La forme en ـَيْنِ est le duel au cas oblique." },
      { question: "خُضْرَاوَاتٌ signifie :", options: ["Fruits", "Légumes", "Viandes", "Pains"], correctIndex: 1, explanation: "خُضْرَاوَاتٌ = légumes." },
    ],
    dictation: [
      { sentence: "السُّوقُ كَبِيرٌ", transliteration: "as-sûqu kabîrun (le marché est grand)", options: ["السُّوقُ كَبِيرٌ", "السُّوقُ صَغِيرٌ", "الْبَيْتُ كَبِيرٌ", "السُّورُ كَبِيرٌ"], correctIndex: 0 },
      { sentence: "اِشْتَرَتْ فَوَاكِهَ", transliteration: "ishtarat fawâkiha (elle a acheté des fruits)", options: ["أَكَلَتْ فَوَاكِهَ", "اِشْتَرَتْ خُضْرَاوَاتٍ", "اِشْتَرَتْ فَوَاكِهَ", "بَاعَتْ فَوَاكِهَ"], correctIndex: 2 },
      { sentence: "التُّفَّاحُ أَحْمَرُ", transliteration: "at-tuffâhu ahmar (les pommes sont rouges)", options: ["الْمَوْزُ أَصْفَرُ", "التُّفَّاحُ أَخْضَرُ", "التُّفَّاحُ أَحْمَرُ", "التُّفَّاحُ حُلْوٌ"], correctIndex: 2 },
      { sentence: "مَعَ أُمِّهَا", transliteration: "ma'a ummihâ (avec sa mère)", options: ["مَعَ أَبِيهَا", "مَعَ أُمِّهَا", "مَعَ أُخْتِهَا", "مَعَ صَدِيقَتِهَا"], correctIndex: 1 },
      { sentence: "رَجَعَتَا سَعِيدَتَيْنِ", transliteration: "raja'atâ sa'îdatayni (elles sont rentrées heureuses)", options: ["رَجَعَتَا حَزِينَتَيْنِ", "رَجَعَتَا سَعِيدَتَيْنِ", "رَجَعُوا سَعِيدِينَ", "رَجَعَتْ سَعِيدَةً"], correctIndex: 1 },
      { sentence: "ذَهَبَتْ إِلَى السُّوقِ", transliteration: "dhahabat ilâ-s-sûqi (elle est allée au marché)", options: ["ذَهَبَ إِلَى السُّوقِ", "ذَهَبَتْ إِلَى الْبَيْتِ", "ذَهَبَتْ إِلَى السُّوقِ", "رَجَعَتْ مِنَ السُّوقِ"], correctIndex: 2 },
      { sentence: "الْمَوْزُ أَصْفَرُ", transliteration: "al-mawzu asfar (les bananes sont jaunes)", options: ["الْمَوْزُ أَخْضَرُ", "الْمَوْزُ أَصْفَرُ", "التُّفَّاحُ أَصْفَرُ", "الْبُرْتُقَالُ أَصْفَرُ"], correctIndex: 1 },
      { sentence: "خُضْرَاوَاتٌ طَازَجَةٌ", transliteration: "khudrâwâtun tâzajatun (des légumes frais)", options: ["فَوَاكِهُ طَازَجَةٌ", "خُضْرَاوَاتٌ قَدِيمَةٌ", "خُضْرَاوَاتٌ طَازَجَةٌ", "لُحُومٌ طَازَجَةٌ"], correctIndex: 2 },
      { sentence: "مَاذَا اِشْتَرَتْ", transliteration: "mâdhâ ishtarat (qu'a-t-elle acheté ?)", options: ["أَيْنَ ذَهَبَتْ", "مَاذَا اِشْتَرَتْ", "مَتَى رَجَعَتْ", "كَيْفَ ذَهَبَتْ"], correctIndex: 1 },
      { sentence: "هَلْ أَنْتِ سَعِيدَةٌ", transliteration: "hal anti sa'îdatun (es-tu heureuse ?)", options: ["هَلْ أَنْتَ سَعِيدٌ", "هَلْ أَنْتِ سَعِيدَةٌ", "هَلْ هِيَ سَعِيدَةٌ", "أَنْتِ سَعِيدَةٌ"], correctIndex: 1 },
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
      {
        title: "Pronoms du pluriel",
        explanation: "Les pronoms pour le pluriel et leurs suffixes correspondants.",
        examples: [
          { arabic: "نَحْنُ", transliteration: "nahnu", meaning: "nous" },
          { arabic: "أَنْتُمْ", transliteration: "antum", meaning: "vous (m.)" },
          { arabic: "هُمْ / هُنَّ", transliteration: "hum / hunna", meaning: "ils / elles" },
        ],
      },
    ],
    comprehension: {
      title: "Qui suis-je ?",
      arabic: "أَنَا طَالِبٌ. اِسْمِي عُمَرُ. عُمْرِي عَشْرُ سَنَوَاتٍ. أُحِبُّ كِتَابِي وَمَدْرَسَتِي. مُعَلِّمِي لَطِيفٌ وَأَصْدِقَائِي كَثِيرُونَ.",
      translation: "Je suis un élève. Mon nom est Omar. J'ai dix ans. J'aime mon livre et mon école. Mon enseignant est gentil et mes amis sont nombreux.",
      questions: [
        { question: "Quel est le nom de l'élève ?", options: ["Ahmad", "Youssef", "Omar", "Ali"], correctIndex: 2, explanation: "اِسْمِي عُمَرُ = mon nom est Omar." },
        { question: "Que signifie كِتَابِي ?", options: ["Un livre", "Ton livre", "Mon livre", "Son livre"], correctIndex: 2, explanation: "Le suffixe ي = mon → كِتَابِي = mon livre." },
        { question: "Comment sont ses amis ?", options: ["Peu nombreux", "Absents", "Nombreux", "Méchants"], correctIndex: 2, explanation: "أَصْدِقَائِي كَثِيرُونَ = mes amis sont nombreux." },
      ],
    },
    qcm: [
      { question: "أَنَا signifie :", options: ["Tu", "Il", "Je", "Nous"], correctIndex: 2, explanation: "أَنَا = je / moi." },
      { question: "Le suffixe ـهُ indique :", options: ["Mon", "Ton", "Son (à lui)", "Leur"], correctIndex: 2, explanation: "Le suffixe هُ = son (masculin) → كِتَابُهُ = son livre." },
      { question: "Comment dit-on 'ton livre' (masculin) ?", options: ["كِتَابِي", "كِتَابُكَ", "كِتَابُهُ", "كِتَابُهَا"], correctIndex: 1, explanation: "Le suffixe كَ = ton (masculin) → كِتَابُكَ." },
      { question: "نَحْنُ signifie :", options: ["Je", "Tu", "Nous", "Vous"], correctIndex: 2, explanation: "نَحْنُ = nous." },
      { question: "هُمْ signifie :", options: ["Elles", "Ils", "Vous", "Nous"], correctIndex: 1, explanation: "هُمْ = ils (masculin pluriel)." },
      { question: "Le suffixe ـهَا indique :", options: ["Mon", "Son (à elle)", "Ton", "Leur"], correctIndex: 1, explanation: "Le suffixe هَا = son (féminin) → كِتَابُهَا = son livre (à elle)." },
      { question: "Comment dit-on 'notre maison' ?", options: ["بَيْتِي", "بَيْتُكَ", "بَيْتُنَا", "بَيْتُهُمْ"], correctIndex: 2, explanation: "Le suffixe نَا = notre → بَيْتُنَا." },
      { question: "أَنْتِ s'adresse à :", options: ["Un homme", "Une femme", "Un groupe", "Un enfant"], correctIndex: 1, explanation: "أَنْتِ = tu (féminin singulier)." },
      { question: "Le suffixe ـكُمْ signifie :", options: ["Notre", "Votre (pluriel)", "Leur", "Mon"], correctIndex: 1, explanation: "Le suffixe كُمْ = votre (pluriel masculin)." },
      { question: "هِيَ signifie :", options: ["Il", "Elles", "Elle", "Tu"], correctIndex: 2, explanation: "هِيَ = elle." },
    ],
    dictation: [
      { sentence: "كِتَابِي", transliteration: "kitâbî (mon livre)", options: ["كِتَابُكَ", "كِتَابِي", "كِتَابُهُ", "كُتُبٌ"], correctIndex: 1 },
      { sentence: "مُعَلِّمُهُ", transliteration: "mu'allimuhu (son enseignant)", options: ["مُعَلِّمِي", "مُعَلِّمُكَ", "مُعَلِّمُهُ", "مُعَلِّمَةٌ"], correctIndex: 2 },
      { sentence: "أَنَا طَالِبٌ", transliteration: "anâ tâlibun (je suis un élève)", options: ["هُوَ طَالِبٌ", "أَنْتَ طَالِبٌ", "أَنَا طَالِبٌ", "أَنَا مُعَلِّمٌ"], correctIndex: 2 },
      { sentence: "بَيْتُنَا كَبِيرٌ", transliteration: "baytunâ kabîrun (notre maison est grande)", options: ["بَيْتِي كَبِيرٌ", "بَيْتُنَا كَبِيرٌ", "بَيْتُهُمْ كَبِيرٌ", "بَيْتُكَ كَبِيرٌ"], correctIndex: 1 },
      { sentence: "أَصْدِقَائِي", transliteration: "asdiqâ'î (mes amis)", options: ["أَصْدِقَاؤُهُ", "أَصْدِقَائِي", "أَصْدِقَاؤُكَ", "صَدِيقِي"], correctIndex: 1 },
      { sentence: "مَدْرَسَتُهَا", transliteration: "madrasatuhâ (son école à elle)", options: ["مَدْرَسَتِي", "مَدْرَسَتُكَ", "مَدْرَسَتُهَا", "مَدْرَسَتُهُ"], correctIndex: 2 },
      { sentence: "نَحْنُ طُلَّابٌ", transliteration: "nahnu tullâbun (nous sommes des élèves)", options: ["أَنَا طَالِبٌ", "هُمْ طُلَّابٌ", "نَحْنُ طُلَّابٌ", "أَنْتُمْ طُلَّابٌ"], correctIndex: 2 },
      { sentence: "هِيَ مُعَلِّمَةٌ", transliteration: "hiya mu'allimatun (elle est enseignante)", options: ["هُوَ مُعَلِّمٌ", "هِيَ طَالِبَةٌ", "هِيَ مُعَلِّمَةٌ", "أَنَا مُعَلِّمَةٌ"], correctIndex: 2 },
      { sentence: "اِسْمُهُ أَحْمَدُ", transliteration: "ismuhu ahmadu (son nom est Ahmad)", options: ["اِسْمِي أَحْمَدُ", "اِسْمُكَ أَحْمَدُ", "اِسْمُهُ أَحْمَدُ", "اِسْمُهَا أَحْمَدُ"], correctIndex: 2 },
      { sentence: "أَنْتُمْ أَصْدِقَائِي", transliteration: "antum asdiqâ'î (vous êtes mes amis)", options: ["هُمْ أَصْدِقَائِي", "أَنْتُمْ أَصْدِقَائِي", "نَحْنُ أَصْدِقَاءُ", "أَنْتَ صَدِيقِي"], correctIndex: 1 },
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
      {
        title: "Autres connecteurs",
        explanation: "Connecteurs de cause et de conséquence.",
        examples: [
          { arabic: "لِأَنَّ", transliteration: "li'anna", meaning: "parce que" },
          { arabic: "فَ", transliteration: "fa", meaning: "alors, donc" },
          { arabic: "أَوْ", transliteration: "aw", meaning: "ou" },
        ],
      },
    ],
    comprehension: {
      title: "Le voyage d'Ali",
      arabic: "سَافَرَ عَلِيٌّ إِلَى مِصْرَ مَعَ عَائِلَتِهِ. زَارُوا الْأَهْرَامَاتِ صَبَاحًا ثُمَّ ذَهَبُوا إِلَى الْمُتْحَفِ مَسَاءً. كَانَ الطَّقْسُ حَارًّا لَكِنَّ الرِّحْلَةَ كَانَتْ مُمْتِعَةً. رَجَعُوا إِلَى بِلَادِهِمْ سَعِيدِينَ.",
      translation: "Ali a voyagé en Égypte avec sa famille. Ils ont visité les pyramides le matin puis sont allés au musée le soir. Le temps était chaud mais le voyage était agréable. Ils sont rentrés dans leur pays heureux.",
      questions: [
        { question: "Où a voyagé Ali ?", options: ["Au Maroc", "En Tunisie", "En Égypte", "En Arabie"], correctIndex: 2, explanation: "إِلَى مِصْرَ = en Égypte." },
        { question: "Qu'ont-ils visité le matin ?", options: ["Le musée", "Le marché", "Les pyramides", "La mosquée"], correctIndex: 2, explanation: "زَارُوا الْأَهْرَامَاتِ صَبَاحًا." },
        { question: "Comment était le temps ?", options: ["Froid", "Chaud", "Pluvieux", "Doux"], correctIndex: 1, explanation: "كَانَ الطَّقْسُ حَارًّا = le temps était chaud." },
        { question: "Comment sont-ils rentrés ?", options: ["Fatigués", "Tristes", "Heureux", "Malades"], correctIndex: 2, explanation: "سَعِيدِينَ = heureux." },
      ],
    },
    qcm: [
      { question: "ثُمَّ signifie :", options: ["Mais", "Et", "Ensuite", "Parce que"], correctIndex: 2, explanation: "ثُمَّ = ensuite, puis." },
      { question: "لَكِنَّ signifie :", options: ["Et", "Donc", "Mais", "Ou"], correctIndex: 2, explanation: "لَكِنَّ = mais, cependant." },
      { question: "صَبَاحًا signifie :", options: ["Le soir", "La nuit", "Le matin", "L'après-midi"], correctIndex: 2, explanation: "صَبَاحًا = le matin." },
      { question: "مَسَاءً signifie :", options: ["Le matin", "Le soir", "La nuit", "Midi"], correctIndex: 1, explanation: "مَسَاءً = le soir." },
      { question: "غَدًا signifie :", options: ["Hier", "Aujourd'hui", "Demain", "Maintenant"], correctIndex: 2, explanation: "غَدًا = demain." },
      { question: "لِأَنَّ signifie :", options: ["Donc", "Parce que", "Ou", "Mais"], correctIndex: 1, explanation: "لِأَنَّ = parce que." },
      { question: "أَوْ signifie :", options: ["Et", "Mais", "Ou", "Donc"], correctIndex: 2, explanation: "أَوْ = ou." },
      { question: "فَ signifie :", options: ["Mais", "Ou", "Alors/donc", "Parce que"], correctIndex: 2, explanation: "فَ = alors, donc." },
      { question: "سَافَرَ signifie :", options: ["Il a visité", "Il a voyagé", "Il a marché", "Il a volé"], correctIndex: 1, explanation: "سَافَرَ = il a voyagé." },
      { question: "الْأَهْرَامَاتُ signifie :", options: ["Les mosquées", "Les musées", "Les pyramides", "Les montagnes"], correctIndex: 2, explanation: "الْأَهْرَامَاتُ = les pyramides." },
    ],
    dictation: [
      { sentence: "سَافَرَ إِلَى مِصْرَ", transliteration: "sâfara ilâ misra (il a voyagé en Égypte)", options: ["سَافَرَ إِلَى مِصْرَ", "ذَهَبَ إِلَى مِصْرَ", "سَافَرَ إِلَى تُونِسَ", "رَجَعَ مِنْ مِصْرَ"], correctIndex: 0 },
      { sentence: "الرِّحْلَةُ مُمْتِعَةٌ", transliteration: "ar-rihlatu mumti'atun (le voyage est agréable)", options: ["الرِّحْلَةُ طَوِيلَةٌ", "الرِّحْلَةُ مُمْتِعَةٌ", "الرِّحْلَةُ صَعْبَةٌ", "الْمَدْرَسَةُ مُمْتِعَةٌ"], correctIndex: 1 },
      { sentence: "الطَّقْسُ حَارٌّ", transliteration: "at-taqsu hârrun (le temps est chaud)", options: ["الطَّقْسُ بَارِدٌ", "الطَّقْسُ حَارٌّ", "الطَّقْسُ مُعْتَدِلٌ", "الطَّقْسُ مُمْطِرٌ"], correctIndex: 1 },
      { sentence: "زَارُوا الْمُتْحَفَ", transliteration: "zârû-l-muthafa (ils ont visité le musée)", options: ["زَارُوا الْأَهْرَامَاتِ", "زَارُوا الْمُتْحَفَ", "زَارُوا الْمَسْجِدَ", "زَارُوا السُّوقَ"], correctIndex: 1 },
      { sentence: "مَعَ عَائِلَتِهِ", transliteration: "ma'a 'â'ilatihi (avec sa famille)", options: ["مَعَ أَصْدِقَائِهِ", "مَعَ عَائِلَتِهِ", "مَعَ أَخِيهِ", "مَعَ مُعَلِّمِهِ"], correctIndex: 1 },
      { sentence: "ثُمَّ ذَهَبُوا", transliteration: "thumma dhahabû (ensuite ils sont allés)", options: ["وَذَهَبُوا", "ثُمَّ رَجَعُوا", "ثُمَّ ذَهَبُوا", "ثُمَّ جَلَسُوا"], correctIndex: 2 },
      { sentence: "لَكِنَّ الرِّحْلَةَ جَمِيلَةٌ", transliteration: "lâkinna-r-rihlata jamîlatun (mais le voyage est beau)", options: ["وَالرِّحْلَةُ جَمِيلَةٌ", "لَكِنَّ الرِّحْلَةَ صَعْبَةٌ", "لَكِنَّ الرِّحْلَةَ جَمِيلَةٌ", "لِأَنَّ الرِّحْلَةَ جَمِيلَةٌ"], correctIndex: 2 },
      { sentence: "رَجَعُوا سَعِيدِينَ", transliteration: "raja'û sa'îdîna (ils sont rentrés heureux)", options: ["رَجَعُوا حَزِينِينَ", "رَجَعُوا سَعِيدِينَ", "ذَهَبُوا سَعِيدِينَ", "رَجَعْنَا سَعِيدِينَ"], correctIndex: 1 },
      { sentence: "كَانَ الطَّقْسُ حَارًّا", transliteration: "kâna-t-taqsu hârran (le temps était chaud)", options: ["كَانَ الطَّقْسُ بَارِدًا", "كَانَ الطَّقْسُ حَارًّا", "كَانَ الطَّقْسُ جَمِيلًا", "كَانَ الْيَوْمُ حَارًّا"], correctIndex: 1 },
      { sentence: "إِلَى بِلَادِهِمْ", transliteration: "ilâ bilâdihim (vers leur pays)", options: ["إِلَى بَيْتِهِمْ", "إِلَى بِلَادِهِمْ", "مِنْ بِلَادِهِمْ", "فِي بِلَادِهِمْ"], correctIndex: 1 },
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
      {
        title: "Autres prépositions",
        explanation: "Prépositions d'accompagnement et de proximité.",
        examples: [
          { arabic: "مَعَ", transliteration: "ma'a", meaning: "avec" },
          { arabic: "عِنْدَ", transliteration: "'inda", meaning: "chez / auprès de" },
          { arabic: "أَمَامَ", transliteration: "amâma", meaning: "devant" },
        ],
      },
    ],
    comprehension: {
      title: "Où sont les choses ?",
      arabic: "الْقِطَّةُ تَحْتَ الطَّاوِلَةِ. الْكِتَابُ عَلَى الرَّفِّ. الْوَلَدُ فِي الْحَدِيقَةِ. ذَهَبَ مِنَ الْبَيْتِ إِلَى الْمَدْرَسَةِ. جَلَسَ أَمَامَ الْمُعَلِّمِ.",
      translation: "Le chat est sous la table. Le livre est sur l'étagère. Le garçon est dans le jardin. Il est allé de la maison à l'école. Il s'est assis devant l'enseignant.",
      questions: [
        { question: "Où est le chat ?", options: ["Sur la table", "Sous la table", "Dans le jardin", "Sur l'étagère"], correctIndex: 1, explanation: "تَحْتَ الطَّاوِلَةِ = sous la table." },
        { question: "D'où est parti le garçon ?", options: ["De l'école", "Du jardin", "De la maison", "Du marché"], correctIndex: 2, explanation: "مِنَ الْبَيْتِ = de la maison." },
        { question: "Où s'est-il assis ?", options: ["Derrière", "À côté de", "Devant", "Loin de"], correctIndex: 2, explanation: "أَمَامَ الْمُعَلِّمِ = devant l'enseignant." },
      ],
    },
    qcm: [
      { question: "فِي signifie :", options: ["Sur", "Dans", "Vers", "De"], correctIndex: 1, explanation: "فِي = dans." },
      { question: "عَلَى signifie :", options: ["Sous", "Dans", "Sur", "Entre"], correctIndex: 2, explanation: "عَلَى = sur." },
      { question: "Les prépositions régissent le cas :", options: ["Nominatif", "Accusatif", "Génitif", "Aucun"], correctIndex: 2, explanation: "Les prépositions régissent le cas génitif (majrûr)." },
      { question: "تَحْتَ signifie :", options: ["Sur", "Devant", "Sous", "Derrière"], correctIndex: 2, explanation: "تَحْتَ = sous." },
      { question: "مِنْ signifie :", options: ["Vers", "De/depuis", "Dans", "Sur"], correctIndex: 1, explanation: "مِنْ = de, depuis." },
      { question: "إِلَى signifie :", options: ["De", "Dans", "Sur", "Vers"], correctIndex: 3, explanation: "إِلَى = vers, à." },
      { question: "أَمَامَ signifie :", options: ["Derrière", "Devant", "À côté", "Loin de"], correctIndex: 1, explanation: "أَمَامَ = devant." },
      { question: "عِنْدَ signifie :", options: ["Loin de", "Sans", "Chez / auprès de", "Contre"], correctIndex: 2, explanation: "عِنْدَ = chez, auprès de." },
      { question: "بَيْنَ signifie :", options: ["Sous", "Sur", "Derrière", "Entre"], correctIndex: 3, explanation: "بَيْنَ = entre." },
      { question: "مَعَ signifie :", options: ["Sans", "Avec", "Contre", "Pour"], correctIndex: 1, explanation: "مَعَ = avec." },
    ],
    dictation: [
      { sentence: "فِي الْبَيْتِ", transliteration: "fî-l-bayti (dans la maison)", options: ["فِي الْبَيْتِ", "عَلَى الْبَيْتِ", "مِنَ الْبَيْتِ", "إِلَى الْبَيْتِ"], correctIndex: 0 },
      { sentence: "عَلَى الطَّاوِلَةِ", transliteration: "'alâ-t-tâwilati (sur la table)", options: ["تَحْتَ الطَّاوِلَةِ", "فِي الطَّاوِلَةِ", "عَلَى الطَّاوِلَةِ", "عِنْدَ الطَّاوِلَةِ"], correctIndex: 2 },
      { sentence: "مِنَ الْمَدْرَسَةِ إِلَى الْبَيْتِ", transliteration: "mina-l-madrasati ilâ-l-bayti (de l'école à la maison)", options: ["مِنَ الْبَيْتِ إِلَى الْمَدْرَسَةِ", "فِي الْمَدْرَسَةِ", "مِنَ الْمَدْرَسَةِ إِلَى الْبَيْتِ", "إِلَى الْمَدْرَسَةِ"], correctIndex: 2 },
      { sentence: "تَحْتَ الشَّجَرَةِ", transliteration: "tahta-sh-shajarati (sous l'arbre)", options: ["عَلَى الشَّجَرَةِ", "تَحْتَ الشَّجَرَةِ", "أَمَامَ الشَّجَرَةِ", "خَلْفَ الشَّجَرَةِ"], correctIndex: 1 },
      { sentence: "أَمَامَ الْمَسْجِدِ", transliteration: "amâma-l-masjidi (devant la mosquée)", options: ["خَلْفَ الْمَسْجِدِ", "أَمَامَ الْمَسْجِدِ", "فِي الْمَسْجِدِ", "عِنْدَ الْمَسْجِدِ"], correctIndex: 1 },
      { sentence: "بَيْنَ الْبَيْتَيْنِ", transliteration: "bayna-l-baytayni (entre les deux maisons)", options: ["أَمَامَ الْبَيْتِ", "خَلْفَ الْبَيْتِ", "بَيْنَ الْبَيْتَيْنِ", "عِنْدَ الْبَيْتِ"], correctIndex: 2 },
      { sentence: "مَعَ أُمِّي", transliteration: "ma'a ummî (avec ma mère)", options: ["مَعَ أَبِي", "مَعَ أُمِّي", "مَعَ أُخْتِي", "عِنْدَ أُمِّي"], correctIndex: 1 },
      { sentence: "عِنْدَ الْبَابِ", transliteration: "'inda-l-bâbi (à la porte)", options: ["أَمَامَ الْبَابِ", "خَلْفَ الْبَابِ", "فِي الْبَابِ", "عِنْدَ الْبَابِ"], correctIndex: 3 },
      { sentence: "الْقِطَّةُ تَحْتَ الطَّاوِلَةِ", transliteration: "al-qittatu tahta-t-tâwilati (le chat est sous la table)", options: ["الْقِطَّةُ عَلَى الطَّاوِلَةِ", "الْقِطَّةُ تَحْتَ الطَّاوِلَةِ", "الْقِطَّةُ فِي الْبَيْتِ", "الْقِطَّةُ أَمَامَ الْبَابِ"], correctIndex: 1 },
      { sentence: "فِي الْحَدِيقَةِ", transliteration: "fî-l-hadîqati (dans le jardin)", options: ["فِي الْبَيْتِ", "فِي الْمَدْرَسَةِ", "فِي الْحَدِيقَةِ", "فِي السُّوقِ"], correctIndex: 2 },
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
      {
        title: "Relier les phrases",
        explanation: "Utilisez les connecteurs pour créer des paragraphes fluides.",
        examples: [
          { arabic: "وَ... ثُمَّ... فَ...", transliteration: "wa... thumma... fa...", meaning: "et... ensuite... alors..." },
          { arabic: "لِأَنَّ... لَكِنَّ...", transliteration: "li'anna... lâkinna...", meaning: "parce que... mais..." },
          { arabic: "أَوَّلًا... ثَانِيًا... أَخِيرًا", transliteration: "awwalan... thâniyan... akhîran", meaning: "d'abord... deuxièmement... enfin" },
        ],
      },
    ],
    comprehension: {
      title: "Ma ville",
      arabic: "أَسْكُنُ فِي مَدِينَةٍ جَمِيلَةٍ. فِيهَا مَسَاجِدُ وَمَدَارِسُ وَأَسْوَاقٌ. النَّاسُ طَيِّبُونَ وَالطَّقْسُ مُعْتَدِلٌ. أُحِبُّ مَدِينَتِي كَثِيرًا لِأَنَّهَا جَمِيلَةٌ وَهَادِئَةٌ.",
      translation: "J'habite dans une belle ville. Il y a des mosquées, des écoles et des marchés. Les gens sont gentils et le temps est tempéré. J'aime beaucoup ma ville parce qu'elle est belle et calme.",
      questions: [
        { question: "Comment est la ville ?", options: ["Grande", "Petite", "Belle", "Ancienne"], correctIndex: 2, explanation: "مَدِينَةٍ جَمِيلَةٍ = une belle ville." },
        { question: "Comment sont les gens ?", options: ["Méchants", "Gentils", "Pressés", "Tristes"], correctIndex: 1, explanation: "النَّاسُ طَيِّبُونَ = les gens sont gentils." },
        { question: "Qu'y a-t-il dans la ville ?", options: ["Des rivières", "Des montagnes", "Des mosquées, écoles et marchés", "Des usines"], correctIndex: 2, explanation: "مَسَاجِدُ وَمَدَارِسُ وَأَسْوَاقٌ." },
        { question: "Pourquoi aime-t-il sa ville ?", options: ["Elle est grande", "Elle est belle et calme", "Elle est moderne", "Elle est ancienne"], correctIndex: 1, explanation: "لِأَنَّهَا جَمِيلَةٌ وَهَادِئَةٌ." },
      ],
    },
    qcm: [
      { question: "Pour décrire, on utilise :", options: ["La phrase verbale", "La phrase nominale", "La préposition", "Le pronom"], correctIndex: 1, explanation: "La phrase nominale est utilisée pour décrire (sujet + attribut)." },
      { question: "Pour raconter une action, on utilise :", options: ["La phrase nominale", "La phrase verbale", "L'article défini", "Le pronom"], correctIndex: 1, explanation: "La phrase verbale commence par un verbe et raconte une action." },
      { question: "L'adjectif dans الْمَدِينَةُ كَبِيرَةٌ est :", options: ["الْمَدِينَةُ", "كَبِيرَةٌ", "Les deux", "Aucun"], correctIndex: 1, explanation: "كَبِيرَةٌ = grande, c'est l'adjectif (khabar)." },
      { question: "أَوَّلًا signifie :", options: ["Ensuite", "D'abord", "Enfin", "Puis"], correctIndex: 1, explanation: "أَوَّلًا = d'abord, premièrement." },
      { question: "أَخِيرًا signifie :", options: ["D'abord", "Ensuite", "Enfin", "Peut-être"], correctIndex: 2, explanation: "أَخِيرًا = enfin, finalement." },
      { question: "Dans la phrase nominale, l'adjectif attribut est :", options: ["Défini", "Indéfini", "Au génitif", "Verbal"], correctIndex: 1, explanation: "L'adjectif attribut (khabar) est indéfini dans la phrase nominale." },
      { question: "Dans la phrase verbale, le sujet est au cas :", options: ["Génitif", "Accusatif", "Nominatif", "Aucun"], correctIndex: 2, explanation: "Le sujet (fâ'il) est au cas nominatif." },
      { question: "Le complément d'objet est au cas :", options: ["Nominatif", "Génitif", "Accusatif", "Aucun"], correctIndex: 2, explanation: "Le complément d'objet (maf'ûl bihi) est à l'accusatif." },
      { question: "فِيهَا signifie :", options: ["Pour elle", "Dans elle / y", "Avec elle", "Sur elle"], correctIndex: 1, explanation: "فِيهَا = dans elle / il y a (préposition + pronom suffixe)." },
      { question: "كَثِيرًا signifie :", options: ["Peu", "Un peu", "Beaucoup", "Parfois"], correctIndex: 2, explanation: "كَثِيرًا = beaucoup." },
    ],
    dictation: [
      { sentence: "الْجَوُّ جَمِيلٌ", transliteration: "al-jawwu jamîlun (le temps est beau)", options: ["الْجَوُّ حَارٌّ", "الْجَوُّ جَمِيلٌ", "الْجَوُّ بَارِدٌ", "الطَّقْسُ جَمِيلٌ"], correctIndex: 1 },
      { sentence: "أُحِبُّ مَدِينَتِي", transliteration: "uhibbu madînatî (j'aime ma ville)", options: ["أُحِبُّ مَدْرَسَتِي", "أُحِبُّ مَدِينَتِي", "أُحِبُّ عَائِلَتِي", "أُحِبُّ بِلَادِي"], correctIndex: 1 },
      { sentence: "زَرَعَ الْفَلَّاحُ", transliteration: "zara'a-l-fallâhu (le fermier a planté)", options: ["زَرَعَ الْوَلَدُ", "طَبَخَ الْفَلَّاحُ", "زَرَعَ الْفَلَّاحُ", "حَصَدَ الْفَلَّاحُ"], correctIndex: 2 },
      { sentence: "النَّاسُ طَيِّبُونَ", transliteration: "an-nâsu tayyibûna (les gens sont gentils)", options: ["النَّاسُ كَثِيرُونَ", "النَّاسُ طَيِّبُونَ", "النَّاسُ سَعِيدُونَ", "النَّاسُ مَشْغُولُونَ"], correctIndex: 1 },
      { sentence: "الطَّقْسُ مُعْتَدِلٌ", transliteration: "at-taqsu mu'tadilun (le temps est tempéré)", options: ["الطَّقْسُ حَارٌّ", "الطَّقْسُ بَارِدٌ", "الطَّقْسُ مُعْتَدِلٌ", "الطَّقْسُ مُمْطِرٌ"], correctIndex: 2 },
      { sentence: "مَدِينَةٌ جَمِيلَةٌ وَهَادِئَةٌ", transliteration: "madînatun jamîlatun wa-hâdi'atun (une belle ville calme)", options: ["مَدِينَةٌ كَبِيرَةٌ", "مَدِينَةٌ جَمِيلَةٌ وَهَادِئَةٌ", "مَدِينَةٌ قَدِيمَةٌ", "مَدِينَةٌ جَدِيدَةٌ"], correctIndex: 1 },
      { sentence: "طَبَخَتِ الْأُمُّ الطَّعَامَ", transliteration: "tabakhati-l-ummu-t-ta'âma (la mère a cuisiné la nourriture)", options: ["أَكَلَتِ الْأُمُّ الطَّعَامَ", "طَبَخَتِ الْأُمُّ الطَّعَامَ", "طَبَخَ الْأَبُ الطَّعَامَ", "طَبَخَتِ الْأُمُّ الْفُطُورَ"], correctIndex: 1 },
      { sentence: "أَوَّلًا ثُمَّ أَخِيرًا", transliteration: "awwalan thumma akhîran (d'abord puis enfin)", options: ["أَوَّلًا وَأَخِيرًا", "أَوَّلًا ثُمَّ أَخِيرًا", "ثُمَّ أَوَّلًا", "أَخِيرًا ثُمَّ أَوَّلًا"], correctIndex: 1 },
      { sentence: "فَتَحَ التِّلْمِيذُ الْكِتَابَ", transliteration: "fataha-t-tilmîdhu-l-kitâba (l'élève a ouvert le livre)", options: ["أَغْلَقَ التِّلْمِيذُ الْكِتَابَ", "فَتَحَ التِّلْمِيذُ الْبَابَ", "فَتَحَ التِّلْمِيذُ الْكِتَابَ", "قَرَأَ التِّلْمِيذُ الْكِتَابَ"], correctIndex: 2 },
      { sentence: "لِأَنَّهَا هَادِئَةٌ", transliteration: "li'annahâ hâdi'atun (parce qu'elle est calme)", options: ["لِأَنَّهَا كَبِيرَةٌ", "لِأَنَّهَا جَمِيلَةٌ", "لِأَنَّهَا هَادِئَةٌ", "لِأَنَّهَا قَدِيمَةٌ"], correctIndex: 2 },
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
      { question: "الشَّمْسُ contient un Lam :", options: ["Lunaire", "Solaire", "Absent", "Double"], correctIndex: 1, explanation: "ش est une lettre solaire." },
      { question: "فِي الْمَدْرَسَةِ — le nom est au cas :", options: ["Nominatif", "Accusatif", "Génitif", "Aucun"], correctIndex: 2, explanation: "Après la préposition فِي, le nom est au génitif (majrûr)." },
      { question: "هَذَا signifie :", options: ["Celle-ci", "Ceci/celui-ci", "Ceux-ci", "Cela"], correctIndex: 1, explanation: "هَذَا = ceci, celui-ci (démonstratif masculin)." },
      { question: "اِسْتَيْقَظَتْ est au :", options: ["Présent féminin", "Passé masculin", "Passé féminin", "Impératif"], correctIndex: 2, explanation: "Le suffixe تْ marque le passé féminin." },
      { question: "جِدًّا signifie :", options: ["Un peu", "Assez", "Très", "Parfois"], correctIndex: 2, explanation: "جِدًّا = très, beaucoup." },
      { question: "لَبِسَتْ signifie :", options: ["Elle a mangé", "Elle a mis (vêtement)", "Elle a écrit", "Elle a dormi"], correctIndex: 1, explanation: "لَبِسَتْ = elle a mis, elle a porté." },
    ],
    dictation: [
      { sentence: "اِسْتَيْقَظَتْ مُبَكِّرًا", transliteration: "istayqazat mubakkiran (elle s'est réveillée tôt)", options: ["اِسْتَيْقَظَ مُبَكِّرًا", "اِسْتَيْقَظَتْ مُتَأَخِّرَةً", "اِسْتَيْقَظَتْ مُبَكِّرًا", "نَامَتْ مُبَكِّرًا"], correctIndex: 2 },
      { sentence: "حَفْلَةُ التَّخَرُّجِ", transliteration: "haflatu-t-takharruji (la cérémonie de remise des diplômes)", options: ["حَفْلَةُ الْعِيدِ", "حَفْلَةُ التَّخَرُّجِ", "حَفْلَةُ الزَّفَافِ", "حِصَّةُ الدَّرْسِ"], correctIndex: 1 },
      { sentence: "أَنَا سَعِيدَةٌ جِدًّا", transliteration: "anâ sa'îdatun jiddan (je suis très heureuse)", options: ["أَنَا حَزِينَةٌ جِدًّا", "هِيَ سَعِيدَةٌ جِدًّا", "أَنَا سَعِيدَةٌ جِدًّا", "أَنْتِ سَعِيدَةٌ جِدًّا"], correctIndex: 2 },
      { sentence: "فَرِحَ الْمُعَلِّمُونَ وَالطُّلَّابُ", transliteration: "fariha-l-mu'allimûna wa-t-tullâbu (les enseignants et les élèves étaient joyeux)", options: ["فَرِحَ الْمُعَلِّمُونَ وَالطُّلَّابُ", "حَزِنَ الْمُعَلِّمُونَ", "فَرِحَ الطُّلَّابُ فَقَطْ", "فَرِحَتِ الْأُمَّهَاتُ"], correctIndex: 0 },
      { sentence: "لَبِسَتْ ثَوْبَهَا الْجَدِيدَ", transliteration: "labisat thawbahâ-l-jadîda (elle a mis sa nouvelle robe)", options: ["لَبِسَتْ ثَوْبَهَا الْقَدِيمَ", "لَبِسَتْ ثَوْبَهَا الْجَدِيدَ", "لَبِسَ ثَوْبَهُ الْجَدِيدَ", "غَسَلَتْ ثَوْبَهَا الْجَدِيدَ"], correctIndex: 1 },
      { sentence: "ذَهَبَتْ إِلَى الْمَدْرَسَةِ", transliteration: "dhahabat ilâ-l-madrasati (elle est allée à l'école)", options: ["ذَهَبَ إِلَى الْمَدْرَسَةِ", "ذَهَبَتْ إِلَى الْبَيْتِ", "ذَهَبَتْ إِلَى الْمَدْرَسَةِ", "رَجَعَتْ مِنَ الْمَدْرَسَةِ"], correctIndex: 2 },
      { sentence: "الْيَوْمُ هُوَ حَفْلَةٌ", transliteration: "al-yawmu huwa haflatun (aujourd'hui c'est une fête)", options: ["الْيَوْمُ هُوَ دَرْسٌ", "الْيَوْمُ هُوَ حَفْلَةٌ", "الْيَوْمُ هُوَ عُطْلَةٌ", "الْيَوْمُ هُوَ اِمْتِحَانٌ"], correctIndex: 1 },
      { sentence: "كَتَبْتُ رِسَالَةً", transliteration: "katabtu risâlatan (j'ai écrit une lettre)", options: ["كَتَبَ رِسَالَةً", "كَتَبْتُ كِتَابًا", "كَتَبْتُ رِسَالَةً", "قَرَأْتُ رِسَالَةً"], correctIndex: 2 },
      { sentence: "هَذَا كِتَابُهَا", transliteration: "hâdhâ kitâbuhâ (ceci est son livre à elle)", options: ["هَذَا كِتَابِي", "هَذَا كِتَابُهُ", "هَذَا كِتَابُهَا", "هَذَا كِتَابُكَ"], correctIndex: 2 },
      { sentence: "الْمُعَلِّمَاتُ فِي الْمَدْرَسَةِ", transliteration: "al-mu'allimâtu fî-l-madrasati (les enseignantes sont à l'école)", options: ["الْمُعَلِّمُونَ فِي الْمَدْرَسَةِ", "الْمُعَلِّمَاتُ فِي الْبَيْتِ", "الْمُعَلِّمَاتُ فِي الْمَدْرَسَةِ", "الطَّالِبَاتُ فِي الْمَدْرَسَةِ"], correctIndex: 2 },
    ],
  },

  // ─── Leçon 13 : اللغة العربية — La langue arabe ───
  {
    id: 13,
    title: "اللغة العربية",
    subtitle: "La langue arabe, l'alphabet et les lettres solaires/lunaires",
    description: "Cette leçon aborde la noblesse de la langue arabe, son lien avec le Coran, l'alphabet arabe complet (28 lettres), ainsi que la distinction fondamentale entre les lettres solaires (الحروف الشمسية) et les lettres lunaires (الحروف القمرية) qui régissent la prononciation de l'article « ال ».",
    grammar: [
      {
        title: "اللغة العربية — La beauté de la langue arabe",
        explanation: "La langue arabe est belle et facile à prononcer. Allah a honoré cette langue en y révélant le Coran, la rendant ainsi éternelle. La lecture du Coran est la clé pour connaître les règles d'Allah, et celui qui lit une lettre du Livre d'Allah obtient dix bonnes actions (hassanât).",
        examples: [
          { arabic: "لُغَة", transliteration: "lugha", meaning: "langue" },
          { arabic: "عَرَبِي", transliteration: "'arabî", meaning: "arabe" },
          { arabic: "جَمِيلٌ", transliteration: "jamîlun", meaning: "beau" },
          { arabic: "كَلَام", transliteration: "kalâm", meaning: "parole" },
          { arabic: "حَرْفٌ", transliteration: "harfun", meaning: "lettre" },
          { arabic: "لِسَان", transliteration: "lisân", meaning: "langue (organe)" },
          { arabic: "قَرَأَ", transliteration: "qara'a", meaning: "lire" },
          { arabic: "يَعْرِفُ", transliteration: "ya'rifu", meaning: "savoir / connaître" },
          { arabic: "أَصْبَحَ", transliteration: "asbaha", meaning: "devenir" },
          { arabic: "هَلْ", transliteration: "hal", meaning: "est-ce que" },
        ],
      },
      {
        title: "حروف الهجاء — L'alphabet arabe",
        explanation: "L'alphabet arabe (الكلام العربي) se compose de 28 lettres. Il est essentiel de les connaître toutes pour pouvoir lire et écrire correctement.",
        examples: [
          { arabic: "ا ب ت ث ج ح خ", transliteration: "alif bâ' tâ' thâ' jîm hâ' khâ'", meaning: "Les 7 premières lettres" },
          { arabic: "د ذ ر ز س ش ص", transliteration: "dâl dhâl râ' zây sîn shîn sâd", meaning: "Les lettres 8-14" },
          { arabic: "ض ط ظ ع غ ف ق", transliteration: "dâd tâ' zâ' 'ayn ghayn fâ' qâf", meaning: "Les lettres 15-21" },
          { arabic: "ك ل م ن ه و ي", transliteration: "kâf lâm mîm nûn hâ' wâw yâ'", meaning: "Les lettres 22-28" },
        ],
      },
      {
        title: "الحروف الشمسية — Les lettres solaires",
        explanation: "Les lettres solaires sont celles avec lesquelles on n'entend PAS le « Lâm » (ل) de l'article « ال ». Le Lâm est assimilé et la lettre qui suit est doublée (chadda). Les 14 lettres solaires sont : ت ث د ذ ر ز س ش ص ض ط ظ ل ن",
        examples: [
          { arabic: "الشَّمْسُ", transliteration: "ash-shamsu", meaning: "le soleil" },
          { arabic: "الدَّارُ", transliteration: "ad-dâru", meaning: "la maison" },
          { arabic: "الطَّعَامُ", transliteration: "at-ta'âmu", meaning: "la nourriture" },
          { arabic: "السَّلَامُ", transliteration: "as-salâmu", meaning: "la paix" },
        ],
      },
      {
        title: "الحروف القمرية — Les lettres lunaires",
        explanation: "Les lettres lunaires sont celles avec lesquelles on entend le « Lâm » (ل) de l'article « ال ». Le Lâm est prononcé normalement. Les 14 lettres lunaires sont : أ ب ج ح خ ع غ ف ق ك م ه و ي",
        examples: [
          { arabic: "الْقَمَرُ", transliteration: "al-qamaru", meaning: "la lune" },
          { arabic: "الْكَلِمَةُ", transliteration: "al-kalimatu", meaning: "le mot" },
          { arabic: "الْمَاءُ", transliteration: "al-mâ'u", meaning: "l'eau" },
          { arabic: "الْأَمْرُ", transliteration: "al-amru", meaning: "l'ordre / la chose" },
        ],
      },
    ],
    comprehension: {
      title: "نص الدرس — Texte de la leçon",
      arabic: "اللُّغَةُ الْعَرَبِيَّةُ جَمِيلَةٌ وَسَهْلَةُ النُّطْقِ. شَرَّفَ اللهُ هَذَا اللِّسَانَ بِنُزُولِ الْقُرْآنِ الْكَرِيمِ فَأَصْبَحَتِ اللُّغَةُ الْعَرَبِيَّةُ خَالِدَةً. إِنَّ قِرَاءَةَ الْقُرْآنِ مِفْتَاحٌ لِمَعْرِفَةِ أَحْكَامِ اللهِ سُبْحَانَهُ وَتَعَالَى وَإِنَّهَا مَنْبَعُ أَجْرٍ كَبِيرٍ: فَمَنْ قَرَأَ حَرْفًا مِنْ كِتَابِ اللهِ فَلَهُ عَشْرُ حَسَنَاتٍ! الْكَلَامُ الْعَرَبِيُّ يَتَكَوَّنُ مِنْ ثَمَانِيَةٍ وَعِشْرِينَ حَرْفًا. هَلْ تَعْرِفُهَا؟",
      translation: "La langue arabe est belle et facile à prononcer. Allah a honoré cette langue par la descente du Noble Coran, et la langue arabe est devenue éternelle. La lecture du Coran est une clé pour connaître les règles d'Allah — Gloire et Majesté à Lui — et c'est une source d'immense récompense : celui qui lit une lettre du Livre d'Allah obtient dix bonnes actions ! La langue arabe se compose de vingt-huit lettres. Les connais-tu ?",
      questions: [
        {
          question: "بِمَاذَا شَرَّفَ اللهُ اللِّسَانَ الْعَرَبِيَّ؟",
          options: [
            "بالشعر العربي",
            "بنزول القرآن الكريم",
            "بالخط العربي",
            "بالعلم",
          ],
          correctIndex: 1,
          explanation: "شرّف الله اللسان العربي بنزول القرآن الكريم.",
        },
        {
          question: "مَا أَجْرُ مَنْ قَرَأَ حَرْفًا مِنْ كِتَابِ اللهِ؟",
          options: [
            "خمس حسنات",
            "عشر حسنات",
            "عشرون حسنة",
            "مئة حسنة",
          ],
          correctIndex: 1,
          explanation: "من قرأ حرفا من كتاب الله فله عشر حسنات.",
        },
        {
          question: "كَمْ حَرْفًا يَتَكَوَّنُ مِنْهُ الْكَلَامُ الْعَرَبِيُّ؟",
          options: [
            "26 حرفا",
            "27 حرفا",
            "28 حرفا",
            "30 حرفا",
          ],
          correctIndex: 2,
          explanation: "الكلام العربي يتكون من ثمانية وعشرين حرفا.",
        },
        {
          question: "مَاذَا تَعْنِي كَلِمَة « خَالِدَة » فِي النَّصِّ؟",
          options: [
            "قديمة",
            "صعبة",
            "أبدية / باقية",
            "جميلة",
          ],
          correctIndex: 2,
          explanation: "خالدة تعني أبدية وباقية، أي أن اللغة العربية ستبقى للأبد.",
        },
        {
          question: "قِرَاءَةُ الْقُرْآنِ مِفْتَاحٌ لِ...",
          options: [
            "معرفة أحكام الله",
            "تعلم الخط",
            "حفظ الشعر",
            "السفر",
          ],
          correctIndex: 0,
          explanation: "قراءة القرآن مفتاح لمعرفة أحكام الله سبحانه وتعالى.",
        },
      ],
    },
    qcm: [
      {
        question: "أيٌّ مِنَ التَّالِيَةِ حَرْفٌ شَمْسِيٌّ؟",
        options: ["ب", "ت", "ك", "ع"],
        correctIndex: 1,
        explanation: "التاء (ت) حرف شمسي : نقول « التَّمْرُ » وليس « الْتَمْرُ ».",
      },
      {
        question: "أيٌّ مِنَ التَّالِيَةِ حَرْفٌ قَمَرِيٌّ؟",
        options: ["ش", "ن", "ل", "ق"],
        correctIndex: 3,
        explanation: "القاف (ق) حرف قمري : نقول « الْقَمَرُ » ونسمع اللام.",
      },
      {
        question: "ما معنى كلمة « لُغَة »؟",
        options: ["lettre", "parole", "langue", "savoir"],
        correctIndex: 2,
        explanation: "لغة تعني « langue » بالفرنسية.",
      },
      {
        question: "ما معنى كلمة « كَلَام »؟",
        options: ["langue", "parole", "lettre", "beau"],
        correctIndex: 1,
        explanation: "كلام تعني « parole » بالفرنسية.",
      },
      {
        question: "كيف نقرأ « الشَّمْسُ » ؟",
        options: ["al-shamsu", "ash-shamsu", "al-chamsu", "ach-chamsu"],
        correctIndex: 1,
        explanation: "الشين حرف شمسي، فلا نلفظ اللام بل ندغمها في الشين : ash-shamsu.",
      },
      {
        question: "كيف نقرأ « الْقَمَرُ » ؟",
        options: ["aq-qamaru", "al-qamaru", "a-qamaru", "al-gamaru"],
        correctIndex: 1,
        explanation: "القاف حرف قمري، فنلفظ اللام : al-qamaru.",
      },
      {
        question: "ما معنى « أَصْبَحَ »؟",
        options: ["lire", "savoir", "devenir", "écrire"],
        correctIndex: 2,
        explanation: "أصبح تعني « devenir » بالفرنسية.",
      },
      {
        question: "ما معنى « هَلْ »؟",
        options: ["pourquoi", "comment", "où", "est-ce que"],
        correctIndex: 3,
        explanation: "هل أداة استفهام تعني « est-ce que » بالفرنسية.",
      },
      {
        question: "أيُّ كَلِمَةٍ فِيهَا حَرْفٌ شَمْسِيٌّ بَعْدَ « ال » ؟",
        options: ["الْكِتَابُ", "الْمَاءُ", "النُّورُ", "الْقَلَمُ"],
        correctIndex: 2,
        explanation: "النون حرف شمسي : نقول « النُّورُ » (an-nûru) بإدغام اللام.",
      },
      {
        question: "أكمل : شرّف الله اللسان العربي بـ...",
        options: [
          "الشعر الجاهلي",
          "نزول القرآن الكريم",
          "الخط العربي",
          "اللهجات",
        ],
        correctIndex: 1,
        explanation: "شرف الله اللسان العربي بنزول القرآن الكريم.",
      },
    ],
    dictation: [
      { sentence: "اللُّغَةُ الْعَرَبِيَّةُ", transliteration: "al-lughatu-l-'arabiyyatu (la langue arabe)", options: ["اللُّغَةُ الْعَرَبِيَّةُ", "الُّلغَةُ الْعَرَبِيَّةُ", "اللُّغَةُ الْفَرَنْسِيَّةُ", "اللُّغَة عَرَبِيَّةٌ"], correctIndex: 0 },
      { sentence: "الشَّمْسُ", transliteration: "ash-shamsu (le soleil)", options: ["الْشَمْسُ", "الشَّمْسُ", "الشَمْسُ", "أَشَّمْسُ"], correctIndex: 1 },
      { sentence: "الْقَمَرُ", transliteration: "al-qamaru (la lune)", options: ["الْقَمَرُ", "الْقَمْرُ", "القَّمَرُ", "الْكَمَرُ"], correctIndex: 0 },
      { sentence: "حَرْفٌ مِنْ كِتَابِ اللهِ", transliteration: "harfun min kitâbi-llâhi (une lettre du Livre d'Allah)", options: ["حَرْفٌ فِي كِتَابِ اللهِ", "حَرْفٌ مِنْ كِتَابِ اللهِ", "حُرُوفٌ مِنْ كِتَابِ اللهِ", "حَرْفٌ عَنْ كِتَابِ اللهِ"], correctIndex: 1 },
      { sentence: "الدَّارُ", transliteration: "ad-dâru (la maison)", options: ["الْدَارُ", "الدَّارُ", "الدَارُ", "أَدَّارُ"], correctIndex: 1 },
      { sentence: "السَّلَامُ", transliteration: "as-salâmu (la paix)", options: ["الْسَلَامُ", "السَّلَمُ", "السَّلَامُ", "أَسَّلَامُ"], correctIndex: 2 },
      { sentence: "الْكَلِمَةُ", transliteration: "al-kalimatu (le mot)", options: ["الْكَلِمَةُ", "الكَّلِمَةُ", "الْكَلْمَةُ", "كَلِمَةُ"], correctIndex: 0 },
      { sentence: "الطَّعَامُ", transliteration: "at-ta'âmu (la nourriture)", options: ["الْطَعَامُ", "الطَّعَامُ", "الطَعَامُ", "أَطَّعَامُ"], correctIndex: 1 },
      { sentence: "الْمَاءُ", transliteration: "al-mâ'u (l'eau)", options: ["الْمَاءُ", "المَّاءُ", "الْمَأُ", "مَاءُ"], correctIndex: 0 },
      { sentence: "قَرَأَ حَرْفًا", transliteration: "qara'a harfan (il a lu une lettre)", options: ["قَرَأَ حُرُوفًا", "قَرَأَ حَرْفًا", "كَتَبَ حَرْفًا", "قَرَأَ كِتَابًا"], correctIndex: 1 },
    ],
  },
];

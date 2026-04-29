// Banque de questions pour le test de passage Niveau 1 → Niveau 2
// 60+ questions couvrant toutes les notions du Niveau 1
// Aucune question répétée, niveau professionnel

export interface BankQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  category: string;
}

export const LEVEL_UP_QUESTION_BANK: BankQuestion[] = [
  // ===== ALPHABET (8) =====
  { category: "alphabet", question: "Combien de lettres compte l'alphabet arabe ?", options: ["26", "28", "30", "24"], correctIndex: 1 },
  { category: "alphabet", question: "Quelle est la première lettre de l'alphabet arabe ?", options: ["ب", "ا", "ت", "ع"], correctIndex: 1 },
  { category: "alphabet", question: "Quelle est la dernière lettre de l'alphabet arabe ?", options: ["و", "ه", "ي", "لا"], correctIndex: 2 },
  { category: "alphabet", question: "Comment s'écrit la lettre « jîm » isolée ?", options: ["ح", "خ", "ج", "ع"], correctIndex: 2 },
  { category: "alphabet", question: "Quelle lettre porte trois points au-dessus ?", options: ["ت", "ث", "ب", "ن"], correctIndex: 1 },
  { category: "alphabet", question: "La lettre « ص » est :", options: ["Une lettre lunaire", "Une lettre solaire", "Une voyelle longue", "Une hamza"], correctIndex: 1 },
  { category: "alphabet", question: "Quelle lettre se prononce comme un « h » très soufflé ?", options: ["ه", "ح", "خ", "ع"], correctIndex: 1 },
  { category: "alphabet", question: "La lettre « ق » se prononce :", options: ["k léger", "q profond", "g dur", "kh"], correctIndex: 1 },

  // ===== VOYELLES COURTES & LONGUES (8) =====
  { category: "voyelles", question: "Quelle voyelle courte correspond au son « a » ?", options: ["Damma (ضمة)", "Kasra (كسرة)", "Fatha (فتحة)", "Soukoun (سكون)"], correctIndex: 2 },
  { category: "voyelles", question: "La kasra (ـِ) se prononce :", options: ["a", "ou", "i", "an"], correctIndex: 2 },
  { category: "voyelles", question: "La damma (ـُ) se prononce :", options: ["a", "ou", "i", "in"], correctIndex: 1 },
  { category: "voyelles", question: "La voyelle longue « و » correspond à quel son court ?", options: ["Fatha", "Kasra", "Damma", "Sukun"], correctIndex: 2 },
  { category: "voyelles", question: "La voyelle longue « ي » correspond à quel son court ?", options: ["Fatha", "Kasra", "Damma", "Sukun"], correctIndex: 1 },
  { category: "voyelles", question: "La voyelle longue « ا » correspond à quel son court ?", options: ["Fatha", "Kasra", "Damma", "Sukun"], correctIndex: 0 },
  { category: "voyelles", question: "Le Sukun (سكون) indique :", options: ["Une voyelle longue", "L'absence de voyelle", "Un doublement", "Le tanwîn"], correctIndex: 1 },
  { category: "voyelles", question: "La fatha (ـَ) se place :", options: ["Sous la lettre", "Au-dessus de la lettre", "Devant la lettre", "Après la lettre"], correctIndex: 1 },

  // ===== TANWÎN & SHADDA (6) =====
  { category: "tanwin", question: "Le tanwîn « ـً » se prononce :", options: ["-in", "-un", "-an", "-ou"], correctIndex: 2 },
  { category: "tanwin", question: "Le tanwîn « ـٌ » se prononce :", options: ["-in", "-un", "-an", "-i"], correctIndex: 1 },
  { category: "tanwin", question: "Le tanwîn « ـٍ » se prononce :", options: ["-in", "-un", "-an", "-a"], correctIndex: 0 },
  { category: "shadda", question: "Quel signe indique le doublement d'une consonne ?", options: ["Sukun", "Hamza", "Shadda", "Madda"], correctIndex: 2 },
  { category: "shadda", question: "Le mot « رَبّ » contient :", options: ["Une madda", "Une shadda", "Un sukun", "Un tanwîn"], correctIndex: 1 },
  { category: "tanwin", question: "Le tanwîn apparaît :", options: ["Au début du mot", "Au milieu du mot", "À la fin du mot", "Partout"], correctIndex: 2 },

  // ===== LETTRES SOLAIRES & LUNAIRES (5) =====
  { category: "solaires", question: "Les lettres ا د ذ ر ز و sont appelées :", options: ["Lettres solaires", "Lettres lunaires", "Lettres non-liantes", "Lettres emphatiques"], correctIndex: 2 },
  { category: "solaires", question: "Dans « الشَّمْس », le ل de « ال » est :", options: ["Prononcé", "Muet (assimilé)", "Doublé", "Supprimé"], correctIndex: 1 },
  { category: "solaires", question: "Dans « القَمَر », le ل de « ال » est :", options: ["Prononcé", "Muet", "Assimilé", "Supprimé"], correctIndex: 0 },
  { category: "solaires", question: "Combien y a-t-il de lettres solaires ?", options: ["10", "12", "14", "16"], correctIndex: 2 },
  { category: "solaires", question: "Laquelle de ces lettres est solaire ?", options: ["ب", "ت", "ك", "م"], correctIndex: 1 },

  // ===== TÂ MARBÛTA vs MABSÛTA (5) =====
  { category: "ta_marbuta", question: "La Tâ Marbûta s'écrit :", options: ["ت", "ة", "ه", "ا"], correctIndex: 1 },
  { category: "ta_marbuta", question: "La Tâ Marbûta apparaît :", options: ["Au début", "Au milieu", "À la fin uniquement", "Partout"], correctIndex: 2 },
  { category: "ta_marbuta", question: "Quand on s'arrête sur un mot finissant par ة, on prononce :", options: ["t", "h", "s", "rien"], correctIndex: 1 },
  { category: "ta_marbuta", question: "Le mot « مَدْرَسَة » se termine par :", options: ["Tâ Mabsûta", "Tâ Marbûta", "Hâ", "Alif"], correctIndex: 1 },
  { category: "ta_marbuta", question: "Le mot « بَيْت » se termine par :", options: ["Tâ Marbûta", "Tâ Mabsûta", "Hâ", "Sîn"], correctIndex: 1 },

  // ===== SUPPORTS DE LA HAMZA (5) =====
  { category: "hamza", question: "Quelle est la forme de la hamza isolée ?", options: ["أ", "إ", "ؤ", "ء"], correctIndex: 3 },
  { category: "hamza", question: "Dans « أَكَلَ », la hamza est portée par :", options: ["ا", "و", "ي", "rien"], correctIndex: 0 },
  { category: "hamza", question: "Dans « إِيمَان », la hamza est portée par :", options: ["ا (avec kasra)", "و", "ي", "rien"], correctIndex: 0 },
  { category: "hamza", question: "Le support « ؤ » est utilisé quand la hamza porte ou suit :", options: ["Une fatha", "Une kasra", "Une damma", "Un sukun"], correctIndex: 2 },
  { category: "hamza", question: "Le support « ئ » est utilisé quand la hamza est associée à :", options: ["Une fatha", "Une kasra", "Une damma", "Une madda"], correctIndex: 1 },

  // ===== FORMES DES LETTRES (5) =====
  { category: "formes", question: "La lettre « ع » au début du mot s'écrit :", options: ["ـع", "عـ", "ـعـ", "ع"], correctIndex: 1 },
  { category: "formes", question: "La lettre « ه » au milieu du mot s'écrit :", options: ["ـه", "هـ", "ـهـ", "ه"], correctIndex: 2 },
  { category: "formes", question: "Quelle lettre ne se lie PAS à la lettre suivante ?", options: ["ب", "ت", "ا", "ن"], correctIndex: 2 },
  { category: "formes", question: "Combien de formes différentes une lettre arabe peut-elle prendre selon sa position ?", options: ["1", "2", "3", "4"], correctIndex: 3 },
  { category: "formes", question: "La lettre « م » à la fin du mot s'écrit :", options: ["م", "ـم", "مـ", "ـمـ"], correctIndex: 1 },

  // ===== VOCABULAIRE (8) =====
  { category: "vocab", question: "Que signifie le mot « بَيْت » ?", options: ["Livre", "Maison", "Porte", "Eau"], correctIndex: 1 },
  { category: "vocab", question: "Que signifie le mot « كِتَاب » ?", options: ["Livre", "Maison", "Porte", "Stylo"], correctIndex: 0 },
  { category: "vocab", question: "Que signifie le mot « مَاء » ?", options: ["Pain", "Eau", "Lait", "Thé"], correctIndex: 1 },
  { category: "vocab", question: "Que signifie le mot « بَاب » ?", options: ["Mur", "Fenêtre", "Porte", "Toit"], correctIndex: 2 },
  { category: "vocab", question: "Que signifie le mot « شَمْس » ?", options: ["Lune", "Étoile", "Soleil", "Ciel"], correctIndex: 2 },
  { category: "vocab", question: "Que signifie le mot « قَمَر » ?", options: ["Soleil", "Lune", "Nuage", "Pluie"], correctIndex: 1 },
  { category: "vocab", question: "Que signifie le mot « مَدْرَسَة » ?", options: ["Mosquée", "Maison", "École", "Marché"], correctIndex: 2 },
  { category: "vocab", question: "Que signifie le mot « مُسْلِم » ?", options: ["Croyant", "Musulman", "Savant", "Imam"], correctIndex: 1 },

  // ===== LECTURE DE MOTS (6) =====
  { category: "lecture", question: "Comment se lit « كِتَابٌ » ?", options: ["Kitâbun", "Kutubun", "Katabun", "Katîbun"], correctIndex: 0 },
  { category: "lecture", question: "Comment se lit « مُسْلِمٌ » ?", options: ["Maslamun", "Mouslimun", "Mislimun", "Mousalmun"], correctIndex: 1 },
  { category: "lecture", question: "Choisissez le mot correctement voyellé pour « école » :", options: ["مَدْرَسَة", "مُدْرَسَة", "مِدْرَسَة", "مَدْرِسَة"], correctIndex: 0 },
  { category: "lecture", question: "Comment se lit « سَلَامٌ » ?", options: ["Silâmun", "Soulâmun", "Salâmun", "Sallâmun"], correctIndex: 2 },
  { category: "lecture", question: "Comment se lit « نُورٌ » ?", options: ["Nârun", "Nûrun", "Nîrun", "Nawrun"], correctIndex: 1 },
  { category: "lecture", question: "Comment se lit « قَلَمٌ » ?", options: ["Qoulamun", "Qilamun", "Qalamun", "Qoulmun"], correctIndex: 2 },

  // ===== PHRASES & MOTS CORANIQUES (8) =====
  { category: "coran", question: "Que signifie « بِسْمِ اللهِ » ?", options: ["Louange à Dieu", "Au nom de Dieu", "Dieu est grand", "Il n'y a de dieu que Dieu"], correctIndex: 1 },
  { category: "coran", question: "Que signifie « الحَمْدُ لِلَّهِ » ?", options: ["Louange à Dieu", "Au nom de Dieu", "Dieu est grand", "Que la paix soit sur toi"], correctIndex: 0 },
  { category: "coran", question: "Que signifie « اللهُ أَكْبَرُ » ?", options: ["Au nom de Dieu", "Dieu est miséricordieux", "Dieu est le plus grand", "Gloire à Dieu"], correctIndex: 2 },
  { category: "coran", question: "Que signifie « السَّلَامُ عَلَيْكُمْ » ?", options: ["Bonjour", "Que la paix soit sur vous", "Merci beaucoup", "À bientôt"], correctIndex: 1 },
  { category: "coran", question: "Dans « الرَّحْمَنِ الرَّحِيمِ », la shadda est sur :", options: ["ا", "ر", "ح", "م"], correctIndex: 1 },
  { category: "coran", question: "Que signifie « قُلْ هُوَ اللهُ أَحَدٌ » ?", options: ["Dis : Lui Dieu est miséricordieux", "Dis : Lui Dieu est unique", "Dis : Lui Dieu est grand", "Dis : Lui Dieu pardonne"], correctIndex: 1 },
  { category: "coran", question: "Le mot « رَبِّ » signifie :", options: ["Roi", "Seigneur", "Prophète", "Ange"], correctIndex: 1 },
  { category: "coran", question: "Que signifie « غَفُورٌ رَحِيمٌ » ?", options: ["Grand et puissant", "Sage et savant", "Pardonneur et miséricordieux", "Créateur et maître"], correctIndex: 2 },

  // ===== HAMZAT AL-WASL & MADDA (4) =====
  { category: "wasl", question: "La hamzat al-wasl (همزة الوصل) :", options: ["Se prononce toujours", "Se prononce au début uniquement", "Ne se prononce jamais", "Se prononce au milieu uniquement"], correctIndex: 1 },
  { category: "wasl", question: "Le « ال » de définition contient :", options: ["Une hamza qat'", "Une hamza wasl", "Une madda", "Aucun signe"], correctIndex: 1 },
  { category: "wasl", question: "La madda (~) sur un alif (آ) indique :", options: ["Un doublement", "Un alif allongé après hamza", "Un sukun", "Une voyelle courte"], correctIndex: 1 },
  { category: "wasl", question: "Comment se lit « آمَنَ » ?", options: ["Amana", "Âmana", "Imana", "Oumana"], correctIndex: 1 },
];

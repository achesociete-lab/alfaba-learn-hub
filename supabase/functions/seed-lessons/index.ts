// Edge Function: seed-lessons
// Injecte/met à jour les leçons L10 et L12 du Niveau 1 en base
// Réservé aux admins/teachers

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Leçon 12 — Récapitulatif Leçons 1 à 9
const LESSON_12_RECAP = {
  id: 12,
  title: "Récapitulatif — Leçons 1 à 9",
  subtitle: "Synthèse des leçons 1 à 9 et évaluation",
  icon: "🏆",
  theory: [
    {
      title: "Récap 1 — L'alphabet (Leçon 1)",
      content:
        "L'alphabet arabe compte 28 lettres, qui s'écrivent et se lisent de droite à gauche.\n\n• Toutes les lettres sont des consonnes.\n• 6 lettres ne s'attachent jamais à la lettre suivante : ا د ذ ر ز و.\n• Les autres s'attachent des deux côtés.",
      arabicExamples: [
        { arabic: "ا ب ت ث", transliteration: "alif, bâ, tâ, thâ", meaning: "les 4 premières lettres" },
        { arabic: "د ذ ر ز و", transliteration: "dâl, dhâl, râ, zây, wâw", meaning: "lettres qui ne s'attachent pas à gauche" },
      ],
      tip: "Sens de lecture et d'écriture : de droite ← à gauche.",
    },
    {
      title: "Récap 2 — Les 4 formes des lettres (Leçon 2)",
      content:
        "Chaque lettre peut prendre 4 formes selon sa position : isolée, initiale, médiane, finale. C'est l'assemblage de ces formes qui crée le mot.",
      arabicExamples: [
        { arabic: "ب  بـ  ـبـ  ـب", transliteration: "bâ : isolée / initiale / médiane / finale", meaning: "les 4 formes du bâ" },
        { arabic: "كَتَبَ", transliteration: "kataba", meaning: "il a écrit (ك + ت + ب)" },
      ],
    },
    {
      title: "Récap 3 — Les voyelles courtes (Leçon 3)",
      content:
        "• Fatha ( َ ) → « a »\n• Damma ( ُ ) → « ou »\n• Kasra ( ِ ) → « i »\n• Soukoun ( ْ ) → absence de voyelle",
      arabicExamples: [
        { arabic: "بَ", transliteration: "ba", meaning: "Fatha" },
        { arabic: "بُ", transliteration: "bou", meaning: "Damma" },
        { arabic: "بِ", transliteration: "bi", meaning: "Kasra" },
        { arabic: "بْ", transliteration: "b", meaning: "Soukoun" },
      ],
    },
    {
      title: "Récap 4 — Syllabes & voyelles longues (Leçons 4-5)",
      content:
        "Les voyelles longues prolongent le son grâce à ا و ي :\n• ـَا → â\n• ـُو → û\n• ـِي → î",
      arabicExamples: [
        { arabic: "بَا", transliteration: "bâ", meaning: "â long" },
        { arabic: "بُو", transliteration: "bû", meaning: "û long" },
        { arabic: "بِي", transliteration: "bî", meaning: "î long" },
        { arabic: "كِتَاب", transliteration: "kitâb", meaning: "livre" },
      ],
    },
    {
      title: "Récap 5 — Lecture de mots (Leçon 6)",
      content:
        "Pour lire un mot : identifier les lettres et leurs formes, lire la voyelle attachée, puis enchaîner les syllabes de droite à gauche.",
      arabicExamples: [
        { arabic: "قَلَم", transliteration: "qalam", meaning: "stylo" },
        { arabic: "بَيْت", transliteration: "bayt", meaning: "maison" },
        { arabic: "شَمْس", transliteration: "shams", meaning: "soleil" },
      ],
    },
    {
      title: "Récap 6 — Le Tanwîn (Leçon 7)",
      content:
        "Doublement de voyelle ajoutant le son « n » à la fin d'un nom indéfini :\n• ً → -an\n• ٌ → -oun\n• ٍ → -in",
      arabicExamples: [
        { arabic: "كِتَابًا", transliteration: "kitâban", meaning: "un livre" },
        { arabic: "كِتَابٌ", transliteration: "kitâboun", meaning: "un livre" },
        { arabic: "كِتَابٍ", transliteration: "kitâbin", meaning: "un livre" },
      ],
    },
    {
      title: "Récap 7 — La Shadda (Leçon 8)",
      content:
        "La Shadda ( ّ ) double la lettre. Elle peut changer le sens du mot.",
      arabicExamples: [
        { arabic: "دَرَسَ", transliteration: "darasa", meaning: "il a étudié" },
        { arabic: "دَرَّسَ", transliteration: "darrasa", meaning: "il a enseigné" },
        { arabic: "رَبّ", transliteration: "rabb", meaning: "Seigneur" },
      ],
    },
    {
      title: "Récap 8 — Lettres solaires & lunaires (Leçon 9)",
      content:
        "L'article ال :\n• Devant une lunaire → on prononce « al ».\n• Devant une solaire → le « l » est muet et la lettre est doublée.",
      arabicExamples: [
        { arabic: "القَمَر", transliteration: "al-qamar", meaning: "la lune (lunaire)" },
        { arabic: "الشَّمْس", transliteration: "ash-shams", meaning: "le soleil (solaire)" },
        { arabic: "البَيْت", transliteration: "al-bayt", meaning: "la maison" },
        { arabic: "النُّور", transliteration: "an-noûr", meaning: "la lumière" },
      ],
    },
    {
      title: "Récap 9 — Lecture de phrases simples",
      content:
        "• Phrase nominale : Sujet + Attribut.\n• Phrase verbale : Verbe + Sujet + Complément.",
      arabicExamples: [
        { arabic: "البَيْتُ كَبِيرٌ", transliteration: "al-baytou kabîr", meaning: "la maison est grande" },
        { arabic: "ذَهَبَ الوَلَدُ", transliteration: "dhahaba al-waladou", meaning: "le garçon est parti" },
        { arabic: "هٰذَا قَلَمٌ", transliteration: "hâdhâ qalamoun", meaning: "ceci est un stylo" },
      ],
    },
    {
      title: "Évaluation finale",
      content:
        "Les exercices et la dictée qui suivent couvrent tout le Niveau 1. Lisez attentivement, écoutez bien la dictée, et vous serez prêt(e) pour le Niveau 2 !",
      tip: "Revenez sur les leçons précédentes si une notion n'est pas claire.",
    },
  ],
  qcm: [
    { question: "Combien de lettres a l'alphabet arabe ?", options: ["24", "26", "28", "30"], correctIndex: 2, explanation: "28 lettres." },
    { question: "Quel signe donne le son « a » ?", options: ["Damma", "Kasra", "Fatha", "Soukoun"], correctIndex: 2, explanation: "La Fatha donne le son « a »." },
    { question: "Les voyelles longues sont formées avec :", options: ["ب ت ث", "ا و ي", "ج ح خ", "د ذ ر"], correctIndex: 1, explanation: "Lettres de prolongation : Alif, Wâw et Yâ'." },
    { question: "Le Tanwîn Damma donne le son :", options: ["-an", "-in", "-oun", "-a"], correctIndex: 2, explanation: "Tanwîn Damma = « -oun »." },
    { question: "La Shadda indique :", options: ["Une voyelle longue", "Un doublement de lettre", "L'absence de voyelle", "La fin du mot"], correctIndex: 1, explanation: "La Shadda indique le doublement." },
    { question: "Comment dit-on « le soleil » ?", options: ["شَمْسٌ", "الشَّمْسُ", "شَمْسًا", "شُمُوسٌ"], correctIndex: 1, explanation: "الشَّمْسُ = le soleil." },
    { question: "Que signifie كَتَبَ ?", options: ["Il a lu", "Il a écrit", "Il a bu", "Il a mangé"], correctIndex: 1, explanation: "كَتَبَ = il a écrit." },
    { question: "Combien de lettres ne s'attachent pas ?", options: ["4", "5", "6", "7"], correctIndex: 2, explanation: "6 : ا د ذ ر ز و." },
    { question: "Le verbe en phrase verbale se place :", options: ["Après le sujet", "En premier", "À la fin", "Au milieu"], correctIndex: 1, explanation: "Verbe-Sujet-Complément." },
    { question: "Comment se lit جَمِيلٌ ?", options: ["jamal", "jamîl", "jamûl", "jumul"], correctIndex: 1, explanation: "jamîl (beau)." },
    { question: "Que signifie هٰذَا بَيْتٌ ?", options: ["La maison est belle", "Ceci est une maison", "Cette maison", "Où est la maison ?"], correctIndex: 1, explanation: "Ceci est une maison." },
    { question: "Quel Tanwîn est dans كِتَابٍ ?", options: ["Fatha", "Damma", "Kasra", "Pas de Tanwîn"], correctIndex: 2, explanation: "ٍ = Tanwîn Kasra." },
  ],
  dictation: [
    { word: "اللهُ أَكْبَرُ", transliteration: "Allâhou akbar", options: ["اللهُ أَكْبَرُ", "اللهُ أَحَدٌ", "أَكْبَرُ اللهُ", "اللهُ كَبِيرٌ"], correctIndex: 0 },
    { word: "بِسْمِ اللهِ", transliteration: "bismi-llâhi", options: ["بِسْمِ اللهِ", "بَاسْمِ اللهِ", "بِاسْمِ اللهِ", "بِسْمَ اللهِ"], correctIndex: 0 },
    { word: "الكِتَابُ جَمِيلٌ", transliteration: "al-kitâbou jamîl", options: ["كِتَابٌ جَمِيلٌ", "الكِتَابُ جَمِيلٌ", "الكِتَابُ كَبِيرٌ", "كِتَابٌ جَدِيدٌ"], correctIndex: 1 },
    { word: "ذَهَبَ الرَّجُلُ", transliteration: "dhahaba ar-rajoulou", options: ["جَلَسَ الرَّجُلُ", "ذَهَبَ الوَلَدُ", "ذَهَبَ الرَّجُلُ", "كَتَبَ الرَّجُلُ"], correctIndex: 2 },
    { word: "هٰذَا بَيْتٌ كَبِيرٌ", transliteration: "hâdhâ baytoun kabîr", options: ["هٰذَا بَيْتٌ صَغِيرٌ", "هٰذَا بَيْتٌ كَبِيرٌ", "هٰذِهِ بَيْتٌ كَبِيرٌ", "هٰذَا بَابٌ كَبِيرٌ"], correctIndex: 1 },
    { word: "هٰذِهِ شَمْسٌ", transliteration: "hâdhihi shamsoun", options: ["هٰذَا شَمْسٌ", "هٰذِهِ شَمْسٌ", "هٰذِهِ قَمَرٌ", "الشَّمْسُ"], correctIndex: 1 },
    { word: "قُلْ هُوَ اللهُ أَحَدٌ", transliteration: "qoul houwa-llâhou aḥad", options: ["قُلْ هُوَ اللهُ أَحَدٌ", "قَالَ هُوَ اللهُ أَحَدٌ", "قُلْ هُوَ اللهُ وَاحِدٌ", "قُلْ هُوَ اللهُ الأَحَدُ"], correctIndex: 0 },
    { word: "كُلُّ وَلَدٍ", transliteration: "koullu waladin", options: ["كُلُّ وَلَدٍ", "كُلٌّ وَلَدٌ", "كِلَا وَلَدٌ", "كُلُّ بِنْتٍ"], correctIndex: 0 },
    { word: "فَتَحَ البَابَ", transliteration: "fataḥa al-bâba", options: ["فَتَحَ البَابَ", "كَتَبَ البَابَ", "فَتَحَ الكِتَابَ", "فُتِحَ البَابُ"], correctIndex: 0 },
    { word: "القَمَرُ جَمِيلٌ", transliteration: "al-qamarou jamîl", options: ["القَمَرُ كَبِيرٌ", "القَمَرُ جَمِيلٌ", "الشَّمْسُ جَمِيلَةٌ", "قَمَرٌ جَدِيدٌ"], correctIndex: 1 },
    { word: "إِنَّ اللهَ غَفُورٌ رَحِيمٌ", transliteration: "inna-llâha ghafouroun raḥîm", options: ["إِنَّ اللهَ غَفُورٌ رَحِيمٌ", "اللهُ غَفُورٌ رَحِيمٌ", "إِنَّ اللهَ كَرِيمٌ رَحِيمٌ", "إِنَّ اللهَ غَفُورُ الرَّحِيمُ"], correctIndex: 0 },
    { word: "إِنَّ الحَقَّ", transliteration: "inna al-ḥaqqa", options: ["أَنَّ الحَقَّ", "إِنَّ الحَقَّ", "إِنَّ الحُبَّ", "إِنْ حَقٌّ"], correctIndex: 1 },
  ],
};

// Leçon 11 — Tâ Marbûta / Mabsûta + Hamza
const LESSON_11_TA = {
  id: 11,
  title: "Tâ Marbûta, Tâ Mabsûta et la Hamza",
  subtitle: "Notions fines avant le passage au Niveau 2",
  icon: "✒️",
  theory: [
    {
      title: "La Tâ Marbûta (ة)",
      content:
        "La Tâ Marbûta (ة) est un « tâ' attaché ». Elle se trouve uniquement à la fin d'un mot et indique souvent le féminin.\n\n• Elle se prononce « t » quand on continue à lire (waṣl), et « h » quand on s'arrête sur le mot (waqf).\n• Elle ne s'écrit qu'à la fin du mot.",
      arabicExamples: [
        { arabic: "مَدْرَسَةٌ", transliteration: "madrasah", meaning: "une école" },
        { arabic: "فَاطِمَةُ", transliteration: "Fâṭima", meaning: "Fâṭima (prénom)" },
        { arabic: "جَنَّةٌ", transliteration: "jannah", meaning: "un jardin / Paradis" },
        { arabic: "صَلَاةٌ", transliteration: "ṣalâh", meaning: "prière" },
      ],
      tip: "Si en s'arrêtant sur le mot on entend un « h », c'est une Tâ Marbûta (ة).",
    },
    {
      title: "La Tâ Mabsûta (ت)",
      content:
        "La Tâ Mabsûta (ت) est le « tâ' étalé ». Elle se prononce toujours « t », qu'on continue ou qu'on s'arrête.\n\n• Elle peut apparaître au début, au milieu ou à la fin d'un mot.\n• À la fin, elle marque souvent le passé féminin des verbes.",
      arabicExamples: [
        { arabic: "بِنْتٌ", transliteration: "bint", meaning: "une fille" },
        { arabic: "كَتَبَتْ", transliteration: "katabat", meaning: "elle a écrit" },
        { arabic: "أُخْتٌ", transliteration: "oukht", meaning: "une sœur" },
        { arabic: "وَقْتٌ", transliteration: "waqt", meaning: "un temps" },
      ],
      tip: "ة → souvent féminin du nom ; ت → féminin du verbe au passé ou consonne normale.",
    },
    {
      title: "Les supports de la Hamza (ء)",
      content:
        "La Hamza (ء) est une consonne à part entière (un coup de glotte). Son « siège » dépend de la voyelle :\n\n• ا — Alif : أ (fatha/damma) ou إ (kasra)\n• و — Wâw : ؤ (avec damma)\n• ي — Yâ' sans points : ئ (avec kasra)\n• ء — Hamza seule, sans support, en milieu/fin de mot\n\nLe choix dépend de la voyelle la plus « forte » : kasra > damma > fatha > soukoun.",
      arabicExamples: [
        { arabic: "أَكَلَ", transliteration: "akala", meaning: "il a mangé" },
        { arabic: "إِيمَانٌ", transliteration: "îmân", meaning: "foi" },
        { arabic: "أُمٌّ", transliteration: "oumm", meaning: "mère" },
        { arabic: "سُؤَالٌ", transliteration: "sou'âl", meaning: "question" },
        { arabic: "قَائِمٌ", transliteration: "qâ'im", meaning: "debout" },
        { arabic: "مَاءٌ", transliteration: "mâ'", meaning: "eau" },
      ],
      tip: "أ et إ = Alif ; ؤ = Wâw ; ئ = Yâ' sans points ; ء = sans support.",
    },
    {
      title: "Révision avant le Niveau 2",
      content:
        "Avant de passer au Niveau 2, assurez-vous de maîtriser :\n\n✅ L'alphabet et les 4 formes de chaque lettre\n✅ Les voyelles courtes et longues\n✅ Le Tanwîn et la Shadda\n✅ Les lettres solaires et lunaires\n✅ La Tâ Marbûta vs Mabsûta\n✅ Les supports de la Hamza\n✅ La lecture de mots et de phrases simples\n\nVous êtes alors prêt(e) à aborder la grammaire (Moubtada, Khabar, Fi'l, Fâ'il…) au Niveau 2.",
    },
  ],
  qcm: [
    { question: "La Tâ Marbûta s'écrit :", options: ["ت", "ة", "ه", "ا"], correctIndex: 1, explanation: "La Tâ Marbûta = ة." },
    { question: "La Tâ Marbûta apparaît :", options: ["Au début", "Au milieu", "À la fin uniquement", "Partout"], correctIndex: 2, explanation: "Toujours en fin de mot." },
    { question: "Quand on s'arrête sur ة, on prononce :", options: ["t", "h", "s", "rien"], correctIndex: 1, explanation: "À l'arrêt (waqf), ة se prononce « h »." },
    { question: "Le mot مَدْرَسَة se termine par :", options: ["Tâ Mabsûta", "Tâ Marbûta", "Hâ", "Alif"], correctIndex: 1, explanation: "ة = Tâ Marbûta." },
    { question: "Le mot بِنْت se termine par :", options: ["Tâ Marbûta", "Tâ Mabsûta", "Hâ", "Sîn"], correctIndex: 1, explanation: "ت = Tâ Mabsûta." },
    { question: "كَتَبَتْ contient une :", options: ["Tâ Marbûta", "Tâ Mabsûta", "Shadda", "Madda"], correctIndex: 1, explanation: "ت du féminin du verbe." },
    { question: "La hamza isolée s'écrit :", options: ["أ", "إ", "ؤ", "ء"], correctIndex: 3, explanation: "ء = hamza seule." },
    { question: "Dans أَكَلَ, la hamza est portée par :", options: ["ا", "و", "ي", "rien"], correctIndex: 0, explanation: "Hamza sur Alif (fatha)." },
    { question: "Dans إِيمَان, la hamza est portée par :", options: ["ا (kasra)", "و", "ي", "rien"], correctIndex: 0, explanation: "Hamza sous Alif (kasra)." },
    { question: "Le support ؤ correspond à :", options: ["Fatha", "Kasra", "Damma", "Sukun"], correctIndex: 2, explanation: "ؤ = Hamza sur Wâw (damma)." },
    { question: "Le support ئ correspond à :", options: ["Fatha", "Kasra", "Damma", "Madda"], correctIndex: 1, explanation: "ئ = Hamza sur Yâ' (kasra)." },
    { question: "La hiérarchie des voyelles pour la hamza :", options: ["fatha > damma > kasra", "kasra > damma > fatha", "damma > fatha > kasra", "fatha > kasra > damma"], correctIndex: 1, explanation: "kasra > damma > fatha > soukoun." },
  ],
  dictation: [
    { word: "مَدْرَسَةٌ", transliteration: "madrasatoun", options: ["مَدْرَسَةٌ", "مَدْرَسَتٌ", "مَدْرَسَهٌ", "مُدْرِسَةٌ"], correctIndex: 0 },
    { word: "فَاطِمَةُ", transliteration: "Fâṭima", options: ["فَاطِمَتُ", "فَاطِمَةُ", "فَاتِمَةُ", "فَاطِمَهُ"], correctIndex: 1 },
    { word: "بِنْتٌ", transliteration: "bint", options: ["بِنْةٌ", "بِنْتٌ", "بَنْتٌ", "بِنَّتٌ"], correctIndex: 1 },
    { word: "كَتَبَتْ", transliteration: "katabat", options: ["كَتَبَةْ", "كَتَبَتْ", "كَتَبَتُ", "كَاتَبَتْ"], correctIndex: 1 },
    { word: "صَلَاةٌ", transliteration: "ṣalâh", options: ["صَلَاتٌ", "صَلَاةٌ", "صَلَاهٌ", "صِلَاةٌ"], correctIndex: 1 },
    { word: "أُخْتٌ", transliteration: "oukht", options: ["أُخْةٌ", "أُخْتٌ", "اُخْتٌ", "إُخْتٌ"], correctIndex: 1 },
    { word: "أَكَلَ", transliteration: "akala", options: ["إِكَلَ", "أَكَلَ", "اَكَلَ", "آكَلَ"], correctIndex: 1 },
    { word: "إِيمَانٌ", transliteration: "îmân", options: ["أِيمَانٌ", "إِيمَانٌ", "ايمَانٌ", "آيمَانٌ"], correctIndex: 1 },
    { word: "أُمٌّ", transliteration: "oumm", options: ["إُمٌّ", "أُمٌّ", "اُمٌّ", "آمٌّ"], correctIndex: 1 },
    { word: "سُؤَالٌ", transliteration: "sou'âl", options: ["سُأَالٌ", "سُؤَالٌ", "سُئَالٌ", "سُوَالٌ"], correctIndex: 1 },
    { word: "قَائِمٌ", transliteration: "qâ'im", options: ["قَاءِمٌ", "قَائِمٌ", "قَاؤِمٌ", "قَاأِمٌ"], correctIndex: 1 },
    { word: "مَاءٌ", transliteration: "mâ'", options: ["مَاأٌ", "مَاءٌ", "مَاؤٌ", "مَائٌ"], correctIndex: 1 },
  ],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Authentification de l'appelant
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userErr,
    } = await authClient.auth.getUser();

    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Utilisateur invalide" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Vérification rôle admin/teacher
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: roles } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const isAdmin = roles?.some((r) => r.role === "admin" || r.role === "teacher");
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Accès admin requis" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Patch QCM L1 et L2 ──────────────────────────────────────────────────
    const QCM_L1 = [
      {
        question: "Combien de lettres compte l'alphabet arabe ?",
        options: ["22", "26", "28", "30"],
        correctIndex: 2,
        explanation: "L'alphabet arabe comporte exactement 28 lettres.",
      },
      {
        question: "Dans quel sens s'écrit l'arabe ?",
        options: ["De gauche à droite", "De droite à gauche", "De haut en bas", "Dans les deux sens"],
        correctIndex: 1,
        explanation: "L'arabe s'écrit et se lit de droite à gauche.",
      },
      {
        question: "Combien de points a la lettre Thâ' ?",
        options: ["0", "1", "2", "3"],
        correctIndex: 3,
        explanation: "La lettre Thâ' (ث) porte 3 points au-dessus.",
      },
      {
        question: "Les points de la lettre Tâ' se trouvent :",
        options: ["En dessous", "Au-dessus", "À l'intérieur", "Elle n'a pas de points"],
        correctIndex: 1,
        explanation: "Le Tâ' (ت) a deux points placés au-dessus.",
      },
      {
        question: "Quelle lettre produit le son 'kh' (comme 'Bach' en allemand) ?",
        options: ["Jîm", "Hâ'", "Khâ'", "'Ayn"],
        correctIndex: 2,
        explanation: "Le Khâ' (خ) produit un son de raclement de gorge, comme le 'ch' allemand.",
      },
      {
        question: "Parmi ces noms de lettres, lequel ne s'attache PAS à la lettre suivante ?",
        options: ["Bâ'", "Dâl", "Lâm", "Kâf"],
        correctIndex: 1,
        explanation: "Le Dâl (د) fait partie des 6 lettres non-liantes : ا د ذ ر ز و.",
      },
      {
        question: "Les lettres ب / ت / ث partagent la même forme de base. Qu'est-ce qui les différencie ?",
        options: ["La taille", "Le nombre et la position des points", "La prononciation uniquement", "La longueur"],
        correctIndex: 1,
        explanation: "Ces trois lettres ont la même base mais se distinguent par leurs points : 1 en dessous (ب), 2 au-dessus (ت), 3 au-dessus (ث).",
      },
      {
        question: "Les lettres ص et ض se distinguent par :",
        options: ["La taille", "Le nombre de points", "La couleur", "La position sur la ligne"],
        correctIndex: 1,
        explanation: "ض a un point au-dessus, ص n'en a pas. Même forme, points différents.",
      },
      {
        question: "Quelle est la particularité du son produit par la lettre 'Ayn (ع) ?",
        options: ["Un son 'f'", "Un son guttural unique, venu du fond de la gorge", "Un son 'k'", "Un souffle léger"],
        correctIndex: 1,
        explanation: "Le 'Ayn (ع) produit un son guttural unique, sans équivalent en français — il vient du fond de la gorge.",
      },
      {
        question: "Combien de lettres ne s'attachent PAS à la lettre suivante ?",
        options: ["4", "5", "6", "7"],
        correctIndex: 2,
        explanation: "Les 6 lettres non-liantes sont : ا د ذ ر ز و. Elles ne se connectent jamais à gauche.",
      },
      {
        question: "Le Bâ' (ب) a combien de points, et où ?",
        options: ["2 au-dessus", "1 en dessous", "3 au-dessus", "Aucun"],
        correctIndex: 1,
        explanation: "Le Bâ' (ب) a un seul point placé en dessous.",
      },
      {
        question: "Quelle lettre se prononce comme le 'z' français ?",
        options: ["Râ'", "Zây", "Wâw", "Yâ'"],
        correctIndex: 1,
        explanation: "Le Zây (ز) produit le son 'z', comme dans 'zèbre'.",
      },
    ];

    const QCM_L2 = [
      {
        question: "Combien de formes différentes peut avoir une lettre liante en arabe ?",
        options: ["1", "2", "3", "4"],
        correctIndex: 3,
        explanation: "Une lettre liante prend 4 formes : isolée, initiale, médiane et finale.",
      },
      {
        question: "La forme 'initiale' d'une lettre est utilisée :",
        options: ["Quand la lettre est seule", "Au début du mot", "Au milieu du mot", "À la fin du mot"],
        correctIndex: 1,
        explanation: "La forme initiale (ex : بـ) apparaît quand la lettre ouvre un mot et se lie à la suivante.",
      },
      {
        question: "La forme 'médiane' d'une lettre est utilisée :",
        options: ["Quand la lettre est seule", "Au début du mot", "Au milieu du mot", "À la fin du mot"],
        correctIndex: 2,
        explanation: "La forme médiane (ex : ـبـ) est utilisée quand la lettre est entourée de deux autres lettres liantes.",
      },
      {
        question: "Quelle est la forme finale de la lettre Bâ' ?",
        options: ["ب", "بـ", "ـبـ", "ـب"],
        correctIndex: 3,
        explanation: "ـب est la forme finale : la lettre est liée à la précédente mais pas à la suivante.",
      },
      {
        question: "Quelle est la forme initiale de la lettre Bâ' ?",
        options: ["ب", "بـ", "ـبـ", "ـب"],
        correctIndex: 1,
        explanation: "بـ est la forme initiale : la lettre est liée à la lettre suivante, pas à la précédente.",
      },
      {
        question: "Pourquoi certaines lettres n'ont que 2 formes (et non 4) ?",
        options: ["Parce qu'elles sont rares", "Parce qu'elles ne s'attachent pas à la lettre suivante", "Parce qu'elles sont courtes", "Parce qu'elles sont des voyelles"],
        correctIndex: 1,
        explanation: "Les lettres non-liantes (ا د ذ ر ز و) n'ont que 2 formes car elles ne se connectent jamais à gauche.",
      },
      {
        question: "Qu'est-ce qui change d'une forme à l'autre d'une même lettre ?",
        options: ["Les points", "Le corps complet de la lettre", "Les liaisons (les extrémités)", "La hauteur"],
        correctIndex: 2,
        explanation: "Le corps (squelette) de la lettre reste reconnaissable — seules les extrémités (liaisons) changent.",
      },
      {
        question: "La forme 'isolée' d'une lettre est utilisée :",
        options: ["Toujours", "Quand la lettre n'est connectée ni à gauche ni à droite", "Seulement en début de mot", "Seulement pour les voyelles"],
        correctIndex: 1,
        explanation: "La forme isolée apparaît quand la lettre n'est entourée d'aucune lettre liante.",
      },
      {
        question: "En forme médiane, une lettre est liée :",
        options: ["Ni à gauche ni à droite", "Seulement à droite", "Seulement à gauche", "Des deux côtés"],
        correctIndex: 3,
        explanation: "En position médiane, la lettre se connecte à la fois à la précédente et à la suivante.",
      },
      {
        question: "La lettre Lâm (ل) est liante. Combien de formes distinctes a-t-elle ?",
        options: ["1", "2", "3", "4"],
        correctIndex: 3,
        explanation: "Étant liante, le Lâm prend 4 formes : ل (isolée), لـ (initiale), ـلـ (médiane), ـل (finale).",
      },
      {
        question: "Comment reconnaître une lettre en position médiane dans un mot ?",
        options: ["Elle est reliée des deux côtés", "Elle est seule", "Elle est en début de mot", "Elle n'a pas de points"],
        correctIndex: 0,
        explanation: "En position médiane, la lettre est connectée à la lettre précédente ET à la lettre suivante.",
      },
      {
        question: "Le 'squelette' d'une lettre (sa forme de base) :",
        options: ["Change complètement d'une forme à l'autre", "Reste reconnaissable dans toutes les formes", "Disparaît en position médiane", "N'est visible qu'en forme isolée"],
        correctIndex: 1,
        explanation: "C'est la clé de lecture : le corps reste identifiable quelle que soit la position — seules les liaisons s'adaptent.",
      },
    ];

    // Patch QCM uniquement sur L1 et L2
    for (const [lesson_number, newQcm] of [[1, QCM_L1], [2, QCM_L2]] as const) {
      const { data: existing } = await adminClient
        .from("lessons")
        .select("content")
        .eq("level", "niveau_1")
        .eq("lesson_number", lesson_number)
        .single();
      if (existing) {
        await adminClient
          .from("lessons")
          .update({ content: { ...(existing.content as any), qcm: newQcm } })
          .eq("level", "niveau_1")
          .eq("lesson_number", lesson_number);
      }
    }

    // Supprimer l'ancienne L10 (Récapitulatif) du DB :
    // le fichier statique (lesson11, id:10 = "Les mots essentiels") prend le relais
    await adminClient
      .from("lessons")
      .delete()
      .eq("level", "niveau_1")
      .eq("lesson_number", 10);

    // Upsert L11 (Tâ Marbûta) et L12 (Récapitulatif)
    const { error: upsertErr } = await adminClient
      .from("lessons")
      .upsert(
        [
          { level: "niveau_1", lesson_number: 11, content: LESSON_11_TA },
          { level: "niveau_1", lesson_number: 12, content: LESSON_12_RECAP },
        ],
        { onConflict: "level,lesson_number" }
      );

    if (upsertErr) {
      return new Response(
        JSON.stringify({ error: upsertErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Dédupliquer les dictées de toutes les leçons
    const { data: allLessons } = await adminClient
      .from("lessons")
      .select("level, lesson_number, content");

    const deduped: string[] = [];
    for (const row of allLessons ?? []) {
      const content = row.content as any;
      const dictation: any[] = content?.dictation ?? [];
      const seen = new Set<string>();
      const clean: any[] = [];
      for (const d of dictation) {
        const key = d.word ?? d.sentence ?? "";
        if (!seen.has(key)) { seen.add(key); clean.push(d); }
      }
      if (clean.length < dictation.length) {
        await adminClient
          .from("lessons")
          .update({ content: { ...content, dictation: clean } })
          .eq("level", row.level)
          .eq("lesson_number", row.lesson_number);
        deduped.push(`${row.level}/${row.lesson_number}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        seeded: ["niveau_1/11", "niveau_1/12"],
        deleted: ["niveau_1/10"],
        qcm_patched: ["niveau_1/1", "niveau_1/2"],
        deduped,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e?.message ?? "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

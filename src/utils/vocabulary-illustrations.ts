// Maps French vocabulary meanings to visual emoji illustrations.
//
// IMPORTANT — cohérence mot ↔ illustration :
// L'ancienne version utilisait `String.includes` ce qui causait de
// fausses correspondances (ex: "famille" matchait "ami" → 🤝,
// "Ceci" matchait "ici" → 📍, "porte" matchait "or" → 🥇).
// Cette version utilise UNIQUEMENT une correspondance exacte après
// normalisation (articles, parenthèses, casse, accents). Si aucun
// emoji approprié n'existe, on retourne `null` au lieu de deviner.


// ── Images vectorielles générées par IA (style illustration islamique) ──
// Ces mots ont une vraie illustration — priorité sur les emojis.
const imageMap: Record<string, string> = {
  "maison": "/vocab/maison.png",
  "livre": "/vocab/livre.png",
  "chameau": "/vocab/chameau.png",
  "dromadaire": "/vocab/chameau.png",
  "soleil": "/vocab/soleil.png",
  "mosquée": "/vocab/mosquee.png",
  "porte": "/vocab/porte.png",
  "arbre": "/vocab/arbre.png",
  "eau": "/vocab/eau.png",
  "lune": "/vocab/lune.png",
  "école": "/vocab/ecole.png",
  "père": "/vocab/pere.png",
  "mère": "/vocab/mere.png",
  "garçon": "/vocab/garcon.png",
  "fille": "/vocab/fille.png",
  "pain": "/vocab/pain.png",
  "fruit": "/vocab/fruit.png",
  "nourriture": "/vocab/nourriture.png",
  "étoile": "/vocab/etoile.png",
  "prière": "/vocab/priere.png",
  "cœur": "/vocab/coeur.png",
  "stylo": "/vocab/stylo.png",
  "cahier": "/vocab/cahier.png",
  "chaise": "/vocab/chaise.png",
  "main": "/vocab/main.png",
  "chat": "/vocab/chat.png",
  "fleur": "/vocab/fleur.png",
  "terre": "/vocab/terre.png",
  "montagne": "/vocab/montagne.png",
  "mer": "/vocab/mer.png",
  "marché": "/vocab/marche.png",
};

const illustrationMap: Record<string, string> = {
  // ── Personnes & famille ──
  "je / moi": "🙋",
  "moi": "🙋",
  "tu": "🫵",
  "tu (m.) / tu (f.)": "🫵",
  "tu (masc.)": "🫵",
  "tu (fém.)": "🫵",
  "vous": "👥",
  "vous (m.)": "👥",
  "il": "👤",
  "elle": "🧕",
  "il / elle": "👥",
  "ils / elles": "👥",
  "nous": "👥",
  "père": "👨",
  "papa": "👨‍👦",
  "mère": "🧕",
  "maman": "🧕",
  "frère": "👦",
  "sœur": "🧕",
  "fille": "👧",
  "garçon": "👦",
  "enfant": "🧒",
  "bébé": "👶",
  "fils": "👦",
  "famille": "👨‍👩‍👧‍👦",
  "homme": "👨",
  "femme": "🧕",
  "ami": "🤝",
  "amie": "🤝",
  "professeur": "👨‍🏫",
  "enseignant": "👨‍🏫",
  "enseignante": "🧕",
  "enseignant / enseignante": "👨‍🏫",
  "enseignants": "👨‍🏫",
  "enseignantes": "🧕",
  "élève": "👨‍🎓",
  "étudiant": "👨‍🎓",
  "étudiante": "🧕",
  "étudiant / étudiante": "👨‍🎓",
  "étudiantes": "🧕",
  "médecin": "👨‍⚕️",
  "fermier": "👨‍🌾",
  "messager": "✉️",
  "seigneur": "👑",
  "muhammad": "🕌",
  "fâṭima": "🌸",

  // ── Lieux ──
  "maison": "🏠",
  "porte": "🚪",
  "école": "🏫",
  "classe": "🏫",
  "chambre": "🛏️",
  "cuisine": "🍳",
  "mosquée": "🕌",
  "ville": "🏙️",
  "pays": "🗺️",
  "marché": "🛒",
  "hôpital": "🏥",
  "jardin": "🌷",
  "parc": "🌳",
  "montagne": "🏔️",
  "mer": "🌊",
  "fleuve": "🏞️",
  "rivière": "🏞️",
  "ciel": "☁️",
  "terre": "🌍",
  "chemin": "🛤️",
  "mur": "🧱",
  "rempart": "🏰",
  "paradis": "🌅",

  // ── Objets école ──
  "livre": "📖",
  "leçon": "📚",
  "leçons": "📚",
  "lettre": "✉️",
  "stylo": "🖊️",
  "cahier": "📓",
  "tableau": "🖼️",
  "table": "🪑",
  "chaise": "🪑",

  // ── Nature & nourriture ──
  "soleil": "☀️",
  "lune": "🌙",
  "étoile": "⭐",
  "fleur": "🌺",
  "arbre": "🌳",
  "eau": "💧",
  "feu": "🔥",
  "lumière": "💡",
  "nuit": "🌙",
  "matin": "🌅",
  "soir": "🌆",
  "midi": "🕛",
  "jour": "📅",
  "temps": "⏰",
  "pain": "🍞",
  "œuf": "🥚",
  "œufs": "🥚",
  "huile": "🫒",
  "fruit": "🍎",
  "nourriture": "🍲",
  "prière": "🤲",

  // ── Animaux ──
  "chameau": "🐪",
  "dromadaire": "🐪",
  "chat": "🐱",
  "chien": "🐕",
  "poulet": "🐔",
  "corbeau": "🐦‍⬛",

  // ── Corps ──
  "main": "✋",
  "tête": "🗣️",
  "cœur": "❤️",
  "œil": "👁️",
  "oreille": "👂",
  "langue": "👅",
  "langue (organe)": "👅",
  "sang": "🩸",

  // ── Adjectifs ──
  "grand": "📏",
  "grand / grande": "📏",
  "petit": "🐭",
  "beau": "✨",
  "beau / belle": "✨",
  "heureux": "😊",
  "joie": "😊",
  "nouveau": "🆕",
  "rouge": "🔴",
  "bleu": "🔵",
  "vert": "🟢",
  "blanc": "⚪",
  "noir": "⚫",
  "or": "🥇",

  // ── Concepts ──
  "amour": "❤️",
  "patience": "🧘",
  "paix": "☮️",
  "vérité": "✅",
  "vérité / droit": "⚖️",
  "doute": "❓",
  "science": "🔬",
  "science / savoir": "🔬",
  "savoir": "🔬",
  "savoir / connaître": "🔬",
  "mémorisation": "🧠",
  "cause": "💡",
  "cause / raison": "💡",
  "voyage": "✈️",
  "travail": "💼",
  "musique": "🔇",
  "dessin": "🎨",
  "sport": "⚽",
  "arabe": "🇸🇦",

  // ── Verbes ──
  "il a écrit": "✍️",
  "il a lu": "📖",
  "il a dit": "💬",
  "il dit": "💬",
  "il a dormi": "😴",
  "il a mangé": "🍽️",
  "il a bu": "🥤",
  "il a ouvert": "🔓",
  "il a aidé": "🤝",
  "il a appris": "🎓",
  "il a enseigné": "👨‍🏫",
  "il a prié": "🤲",
  "il est parti": "🚶",
  "il est venu": "🚶‍♂️",
  "il s'est assis": "🪑",
  "il s'est repenti": "🤲",
  "il a apporté": "📦",
  "il a tiré": "🏹",
  "il a présenté": "🎁",
  "il est allé": "🚶",
  "elle est allée": "🧕",
  "elle a écrit": "✍️",
  "elle a mangé": "🍽️",

  // ── Nombres ──
  "trois": "3️⃣",

  // ── Nominaux avec article (cohérence avec versions sans article) ──
  "un livre": "📖",
  "le livre": "📖",
  "des livres": "📚",
  "deux livres": "📚",
  "mon livre": "📖",
  "ton livre": "📖",
  "ton livre (m.)": "📖",
  "son livre": "📖",
  "son livre (à lui)": "📖",
  "ceci est son livre (à elle)": "📖",
  "une porte": "🚪",
  "la porte": "🚪",
  "la lune": "🌙",
  "le soleil": "☀️",
  "la lumière": "💡",
  "une lumière": "💡",
  "la maison": "🏠",
  "une maison": "🏠",
  "la nourriture": "🍲",
  "l'eau": "💧",
  "le matin": "🌅",
  "le soir": "🌆",
  "le mot": "💬",
  "le garçon": "👦",
  "la montagne": "🏔️",
  "la science": "🔬",
  "la paix": "☮️",
  "l'homme": "👨",
  "l'élève": "👨‍🎓",
  "un homme": "👨",
  "une femme": "🧕",
  "un garçon": "👦",
  "une fille": "👧",
  "un père": "👨",
  "une mère": "🧕",
  "un frère": "👦",
  "une sœur": "🧕",
  "un enseignant": "👨‍🏫",
  "une école": "🏫",
  "une classe": "🏫",
  "une chambre": "🛏️",
  "une cuisine": "🍳",
  "une chaise": "🪑",
  "une leçon": "📚",
  "un stylo": "🖊️",
  "un tableau": "🖼️",
  "un temps": "⏰",
  "un jardin": "🌷",
  "deux garçons": "👬",
  "deux étudiantes": "🧕",
  "deux portes": "🚪",
  "des hommes": "👥",
  "des femmes": "🧕",
  "des élèves": "👨‍🎓",
  "des professeurs": "👨‍🏫",

  // ── Phrases courtes ──
  "ceci est un livre": "📖",
  "ceci est une fille": "👧",
  "le livre est nouveau": "🆕",
  "le livre est sur la table": "📚",
  "la maison est grande": "🏠",
  "la maison est belle": "✨",
  "la ville est grande": "🏙️",
  "le ciel est bleu": "🔵",
  "le temps est beau": "🌤️",
  "la nourriture est délicieuse": "😋",
  "le garçon est grand": "👦",
  "le garçon est petit": "👶",
  "le garçon est parti": "🚶",
  "le garçon a écrit la leçon": "✍️",
  "il a ouvert la porte": "🚪",
  "il a bu l'eau": "🥤",
  "l'enfant a mangé la pomme": "🍎",
  "l'enseignant est dans la classe": "👨‍🏫",
  "les enseignantes sont à l'école": "👩‍🏫",
  "l'homme s'est assis": "🪑",
  "l'homme a construit une maison": "🏗️",
  "l'élève a ouvert le livre": "📖",
  "l'étudiant a écrit": "✍️",
  "la fille a lu le livre": "📖",
  "la mère a cuisiné la nourriture": "🍲",
  "le fermier a planté l'arbre": "🌳",
  "j'ai écrit une lettre à mon ami": "✉️",
  "il est dans sa maison": "🏠",

  // ── Mots-outils & adverbes ──
  "ici": "📍",
  "là-bas": "👉",
  "maintenant": "⏰",
  "hier": "📆",
  "demain": "🗓️",
  "toujours": "♾️",
  "où ?": "📍",
  "qui ?": "🤔",
  "que ?": "❓",
  "quoi ?": "❓",
  "que / quoi ?": "❓",
  "comment ?": "💭",
  "quand ?": "⏰",
  "pourquoi ?": "🤷",
  "combien ?": "🔢",
  "quel / lequel ?": "❓",
  "est-ce que ?": "❓",
  "est-ce que": "❓",
  "dans la maison": "🏠",
  "sur la table": "🪑",
  "de l'école": "🏫",
  "vers la mosquée": "🕌",
  "sous l'arbre": "🌳",
  "entre les deux maisons": "🏠",
  "devant": "➡️",
  "chez / auprès de": "🏠",
};

/** Normalise une chaîne pour la recherche d'illustration. */
function normalize(s: string): string {
  if (!s) return "";
  let n = s.toLowerCase().trim();
  // Retire le contenu entre parenthèses : "mère (cas direct)" → "mère"
  n = n.replace(/\s*\([^)]*\)\s*/g, " ").trim();
  // Retire les marqueurs de variantes après slash final inutile
  // (on garde "il / elle", "tu (m.) / tu (f.)" car déjà mappés)
  // Normalise les apostrophes
  n = n.replace(/[’ʼ`]/g, "'");
  // Compacte espaces
  n = n.replace(/\s+/g, " ").trim();
  return n;
}

/**
 * Retourne un emoji illustrant le mot français donné, ou null si
 * aucune correspondance fiable n'existe. Aucun matching partiel
 * (qui causait des incohérences mot/image).
 */
export function getIllustration(meaning: string): string | null {
  if (!meaning) return null;
  const key = normalize(meaning);
  if (!key) return null;

  const articleRx = /^(un |une |le |la |l'|les |des |deux |mon |ton |son |ma |ta |sa )/;
  const stripped = key.replace(articleRx, "");

  // 1. Image vectorielle en priorité
  if (imageMap[key]) return imageMap[key];
  if (stripped !== key && imageMap[stripped]) return imageMap[stripped];

  // 2. Fallback emoji
  if (illustrationMap[key]) return illustrationMap[key];
  if (stripped !== key && illustrationMap[stripped]) return illustrationMap[stripped];

  return null;
}

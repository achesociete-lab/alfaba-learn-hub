// Sourates et versets ayant un mérite particulier dans l'Islam
// Appuyé par des hadiths authentiques (sahih)

export type MeritTheme = "protection" | "récompense" | "mémorisation" | "guérison";

export interface MeritEntry {
  id: string;
  title: string;
  titleArabic: string;
  surahNumber: number;
  ayahStart?: number;
  ayahEnd?: number;
  description: string;
  themes: MeritTheme[];
  hadiths: {
    text: string;
    source: string;
    grade: string;
  }[];
  benefits: string[];
}

export const MERIT_THEMES: { value: MeritTheme; label: string; emoji: string }[] = [
  { value: "protection", label: "Protection", emoji: "🛡️" },
  { value: "récompense", label: "Récompense", emoji: "🌟" },
  { value: "mémorisation", label: "Mémorisation", emoji: "📖" },
  { value: "guérison", label: "Guérison", emoji: "💚" },
];

export const QURAN_MERITS: MeritEntry[] = [
  {
    id: "ayat-al-kursi",
    title: "Ayat Al-Kursi",
    titleArabic: "آية الكرسي",
    surahNumber: 2,
    ayahStart: 255,
    ayahEnd: 255,
    description:
      "Le plus grand verset du Coran. Sa récitation offre une protection divine contre tout mal.",
    themes: ["protection", "récompense"],
    hadiths: [
      {
        text: "Le Prophète ﷺ a dit : Celui qui récite Ayat Al-Kursi après chaque prière obligatoire, rien ne l'empêchera d'entrer au Paradis si ce n'est la mort.",
        source: "Rapporté par An-Nassai et Ibn Hibbane — Sahih",
        grade: "Sahih",
      },
      {
        text: "Le Prophète ﷺ a dit : Celui qui la récite en se couchant, Allah lui envoie un gardien et aucun démon ne s'approchera de lui jusqu'au matin.",
        source: "Rapporté par Al-Boukhari (5010)",
        grade: "Sahih",
      },
    ],
    benefits: [
      "Protection contre les djinns et le mal",
      "Un gardien céleste veille sur le récitant la nuit",
      "Rien n'empêche son récitant d'entrer au Paradis sauf la mort",
    ],
  },
  {
    id: "al-mulk",
    title: "Sourate Al-Mulk",
    titleArabic: "سورة الملك",
    surahNumber: 67,
    description:
      "Appelée aussi Al-Mani'a (la protectrice), cette sourate intercède pour celui qui la récite régulièrement et le protège du châtiment de la tombe.",
    themes: ["protection", "récompense"],
    hadiths: [
      {
        text: "Le Prophète ﷺ a dit : Il y a dans le Coran une sourate de trente versets qui intercédera pour son compagnon jusqu'à ce qu'il lui soit pardonné. C'est (Tabârak alladhi biyadihi-l-Mulk).",
        source: "Rapporté par Abou Dawoud (1400) et At-Tirmidhi (2891) — Hassane",
        grade: "Hassane",
      },
      {
        text: "Ibn Masoud رضي الله عنه a dit : Celui qui récite Tabârak alladhi biyadihi-l-Mulk chaque nuit, Allah le protégera du châtiment de la tombe.",
        source: "Rapporté par An-Nassai dans As-Sunan Al-Kubra",
        grade: "Hassane",
      },
    ],
    benefits: [
      "Intercession le Jour du Jugement",
      "Protection contre le châtiment de la tombe",
      "Recommandée chaque soir avant de dormir",
    ],
  },
  {
    id: "al-ikhlas",
    title: "Sourate Al-Ikhlas",
    titleArabic: "سورة الإخلاص",
    surahNumber: 112,
    description:
      "Cette courte sourate équivaut au tiers du Coran. Elle affirme le monothéisme pur (Tawhid) et l'unicité absolue d'Allah.",
    themes: ["récompense", "mémorisation"],
    hadiths: [
      {
        text: "Le Prophète ﷺ a dit : Par Celui qui détient mon âme dans Sa main, elle équivaut au tiers du Coran.",
        source: "Rapporté par Al-Boukhari (5015)",
        grade: "Sahih",
      },
      {
        text: "Un homme a entendu un autre réciter (Qul Huwa Allahu Ahad) en la répétant. Le lendemain, il vint au Prophète ﷺ pour lui en parler. Le Prophète ﷺ lui dit : Par Celui qui détient mon âme dans Sa main, elle équivaut au tiers du Coran.",
        source: "Rapporté par Al-Boukhari (5013)",
        grade: "Sahih",
      },
    ],
    benefits: [
      "Équivaut au tiers du Coran",
      "Affirmation du Tawhid (monothéisme pur)",
      "L'amour de cette sourate fait entrer au Paradis",
    ],
  },
  {
    id: "al-falaq-an-nas",
    title: "Al-Falaq & An-Nas (Al-Mu'awwidhatayn)",
    titleArabic: "المعوذتان",
    surahNumber: 113,
    description:
      "Les deux sourates protectrices. Le Prophète ﷺ les récitait chaque soir et soufflait dans ses mains pour se protéger.",
    themes: ["protection", "guérison"],
    hadiths: [
      {
        text: "Aïcha رضي الله عنها rapporte que le Prophète ﷺ, chaque nuit quand il se couchait, joignait ses mains, soufflait dedans et récitait (Qul Huwa Allahu Ahad), (Qul A'udhu bi Rabbi-l-Falaq) et (Qul A'udhu bi Rabbi-n-Nas), puis il passait ses mains sur tout le corps qu'il pouvait atteindre. Il faisait cela trois fois.",
        source: "Rapporté par Al-Boukhari (5017) et Muslim",
        grade: "Sahih",
      },
      {
        text: "Le Prophète ﷺ a dit : Ô Uqba, récite les Mu'awwidhatayn, car il n'y a pas de meilleur refuge pour celui qui cherche protection que ces deux sourates.",
        source: "Rapporté par Abou Dawoud (1463) — Sahih",
        grade: "Sahih",
      },
    ],
    benefits: [
      "Protection contre le mauvais œil et la sorcellerie",
      "Recommandées matin, soir et avant de dormir",
      "Les meilleures sourates pour chercher refuge auprès d'Allah",
    ],
  },
  {
    id: "al-kahf",
    title: "Sourate Al-Kahf",
    titleArabic: "سورة الكهف",
    surahNumber: 18,
    description:
      "Sa récitation le vendredi illumine le croyant d'une lumière entre les deux vendredis et protège contre l'épreuve du Dajjal.",
    themes: ["protection", "récompense", "mémorisation"],
    hadiths: [
      {
        text: "Le Prophète ﷺ a dit : Celui qui récite Sourate Al-Kahf le jour du vendredi, il sera illuminé d'une lumière entre les deux vendredis.",
        source: "Rapporté par Al-Hakim et Al-Bayhaqi — Sahih",
        grade: "Sahih",
      },
      {
        text: "Le Prophète ﷺ a dit : Celui qui mémorise les dix premiers versets de Sourate Al-Kahf sera protégé de l'épreuve du Dajjal.",
        source: "Rapporté par Muslim (809)",
        grade: "Sahih",
      },
    ],
    benefits: [
      "Lumière entre les deux vendredis",
      "Protection contre la fitna du Dajjal (10 premiers versets)",
      "Récitation recommandée chaque vendredi",
    ],
  },
  {
    id: "al-baqara",
    title: "Sourate Al-Baqara",
    titleArabic: "سورة البقرة",
    surahNumber: 2,
    description:
      "La plus longue sourate du Coran. Sa récitation dans une maison fait fuir les démons. Ses deux derniers versets suffisent à celui qui les récite la nuit.",
    themes: ["protection", "récompense"],
    hadiths: [
      {
        text: "Le Prophète ﷺ a dit : Ne faites pas de vos maisons des tombeaux, car le diable fuit la maison dans laquelle on récite Sourate Al-Baqara.",
        source: "Rapporté par Muslim (780)",
        grade: "Sahih",
      },
      {
        text: "Le Prophète ﷺ a dit : Celui qui récite les deux derniers versets de Sourate Al-Baqara dans une nuit, ils lui suffiront.",
        source: "Rapporté par Al-Boukhari (5009) et Muslim (808)",
        grade: "Sahih",
      },
    ],
    benefits: [
      "Les démons fuient la maison où elle est récitée",
      "Les deux derniers versets suffisent pour la nuit",
      "Intercession le Jour du Jugement",
    ],
  },
  {
    id: "al-fatiha",
    title: "Sourate Al-Fatiha",
    titleArabic: "سورة الفاتحة",
    surahNumber: 1,
    description:
      "La mère du Coran (Umm Al-Quran) et la plus grande sourate. Elle est un pilier de chaque unité de prière et une Ruqya (guérison).",
    themes: ["guérison", "récompense"],
    hadiths: [
      {
        text: "Le Prophète ﷺ a dit : La plus grande sourate du Coran est Al-Hamdu Lillahi Rabbi-l-Alamin (Al-Fatiha). Elle est les sept versets répétés et le Coran grandiose qui m'a été donné.",
        source: "Rapporté par Al-Boukhari (4474)",
        grade: "Sahih",
      },
      {
        text: "Abu Saïd Al-Khudri rapporte qu'un groupe de compagnons a utilisé Al-Fatiha comme Ruqya pour guérir un chef de tribu piqué par un scorpion, et le Prophète ﷺ a approuvé cela.",
        source: "Rapporté par Al-Boukhari (5736) et Muslim",
        grade: "Sahih",
      },
    ],
    benefits: [
      "La plus grande sourate du Coran",
      "Ruqya (guérison) reconnue par le Prophète ﷺ",
      "Pilier indispensable de la prière (Salât)",
    ],
  },
  {
    id: "yasin",
    title: "Sourate Ya-Sin",
    titleArabic: "سورة يس",
    surahNumber: 36,
    description:
      "Appelée le cœur du Coran. Sa récitation est recommandée pour les malades et les mourants.",
    themes: ["guérison", "récompense"],
    hadiths: [
      {
        text: "Le Prophète ﷺ a dit : Récitez Ya-Sin auprès de vos morts (ou mourants).",
        source: "Rapporté par Abou Dawoud (3121) et An-Nassai — Hassane",
        grade: "Hassane",
      },
    ],
    benefits: [
      "Appelée le cœur du Coran",
      "Recommandée auprès des malades et des mourants",
      "Sourate de grande bénédiction",
    ],
  },
];

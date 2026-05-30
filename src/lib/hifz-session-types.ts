export type HifzSessionType =
  | "sabaq"
  | "sabaq_para"
  | "dhor"
  | "rattrapage"
  | "test_surprise"
  | "khatm_partiel";

export const HIFZ_SESSION_TYPES: Array<{
  value: HifzSessionType;
  label: string;
  icon: string;
  short: string;
  description: string;
  long: string;
  // tailwind classes
  badgeBg: string;
  badgeText: string;
  border: string;
  bgSoft: string;
  hexBar: string;
}> = [
  {
    value: "sabaq",
    label: "Sabaq",
    icon: "📗",
    short: "Nouvelle mémorisation",
    description: "Je récite mon nouveau hizb mémorisé depuis notre dernière session",
    long: "Le nouveau hizb que tu viens de mémoriser depuis la dernière session.",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-800",
    border: "border-emerald-500",
    bgSoft: "bg-emerald-50",
    hexBar: "#15803d",
  },
  {
    value: "sabaq_para",
    label: "Sabaq Para",
    icon: "📙",
    short: "Révision récente",
    description: "Je récite les hizb des 30 derniers jours sans mushaf",
    long: "Révision des hizb mémorisés ces dernières semaines, sans regarder le mushaf.",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-800",
    border: "border-amber-500",
    bgSoft: "bg-amber-50",
    hexBar: "#b45309",
  },
  {
    value: "dhor",
    label: "Dhor",
    icon: "📘",
    short: "Révision ancienne",
    description: "Le professeur choisit un ancien hizb au hasard parmi tout ce que j'ai validé",
    long: "Rotation longue : un ancien hizb tiré au hasard parmi tous tes acquis.",
    badgeBg: "bg-violet-100",
    badgeText: "text-violet-800",
    border: "border-violet-500",
    bgSoft: "bg-violet-50",
    hexBar: "#7c3aed",
  },
  {
    value: "rattrapage",
    label: "Rattrapage",
    icon: "🔴",
    short: "Hizb à retravailler",
    description: "Je reviens sur mes hizb notés Médiocre ou À retravailler",
    long: "On consolide les hizb précédemment notés à retravailler.",
    badgeBg: "bg-red-100",
    badgeText: "text-red-700",
    border: "border-red-500",
    bgSoft: "bg-red-50",
    hexBar: "#dc2626",
  },
  {
    value: "test_surprise",
    label: "Test Surprise",
    icon: "⚡",
    short: "Test 15 min",
    description: "Session courte 15 min — je ne sais pas quel hizb sera demandé",
    long: "Le professeur tire au hasard 1 à 3 hizb. Prépare-toi sur tout !",
    badgeBg: "bg-orange-100",
    badgeText: "text-orange-800",
    border: "border-orange-600",
    bgSoft: "bg-orange-50",
    hexBar: "#ea580c",
  },
  {
    value: "khatm_partiel",
    label: "Khatm Partiel",
    icon: "🏁",
    short: "Juz complet",
    description: "Je récite un juz complet sans interruption",
    long: "Récitation d'un juz entier (2 hizb) sans interruption.",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-900",
    border: "border-blue-700",
    bgSoft: "bg-blue-50",
    hexBar: "#1e3a8a",
  },
];

export const getSessionType = (value: string | null | undefined) =>
  HIFZ_SESSION_TYPES.find((t) => t.value === value) || HIFZ_SESSION_TYPES[0];

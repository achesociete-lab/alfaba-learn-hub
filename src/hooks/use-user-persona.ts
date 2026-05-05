import { useProfile } from "@/hooks/use-profile";

export type AgeGroup = "child" | "teen" | "adult";
export type Gender = "male" | "female" | "unknown";

export interface UserPersona {
  // Basics
  age: number | null;
  gender: Gender;
  firstName: string;
  ageGroup: AgeGroup;

  // Booleans
  isChild: boolean;
  isTeen: boolean;
  isAdult: boolean;
  isMale: boolean;
  isFemale: boolean;
  isTu: boolean;

  // French formality helpers
  you: string;
  yourPossessive: string;
  yourPossessiveFem: string;
  yourPossessivePlural: string;
  greeting: string;

  // UI density / animation hints (used by all modules)
  animationLevel: "high" | "medium" | "low";
  emojiOk: boolean;
  fontScaleHint: number; // 1.0 default, slightly bigger for kids
  cardStyle: "playful" | "balanced" | "professional";

  // Gendered Arabic praise (use throughout the app)
  praise: {
    excellent: string;   // أَحْسَنْتَ / أَحْسَنْتِ
    super: string;       // مُمْتَازٌ / مُمْتَازَةٌ
    great: string;       // رَائِعٌ / رَائِعَةٌ
    smart: string;       // ذَكِيٌّ / ذَكِيَّةٌ
    brave: string;       // بَطَلٌ / بَطَلَةٌ
    tryAgain: string;    // حَاوِلْ مَرَّةً أُخْرَى / حَاوِلِي ...
  };

  // Gendered Arabic imperatives
  imperatives: {
    write: string;
    read: string;
    say: string;
    listen: string;
    try: string;
    repeat: string;
  };
}

function normalizeGender(g: string | null | undefined): Gender {
  if (!g) return "unknown";
  const l = String(g).toLowerCase().trim();
  if (["homme", "masculin", "m", "male", "garçon", "garcon", "ذكر", "boy"].includes(l)) return "male";
  if (["femme", "féminin", "feminin", "f", "female", "fille", "أنثى", "girl"].includes(l)) return "female";
  return "unknown";
}

function getAgeGroup(age: number | null): AgeGroup {
  if (age == null) return "adult";
  if (age < 12) return "child";
  if (age < 18) return "teen";
  return "adult";
}

/**
 * Centralized persona hook used by every module of alfasl.fr.
 *
 * Adapts:
 *  - tone (formal vs playful)
 *  - animation density (UI motion hints)
 *  - Arabic gender agreement (مذكر / مؤنث)
 *  - emoji usage (kids only)
 *  - font scale (slightly bigger for children)
 *
 * Usage:
 *   const persona = useUserPersona();
 *   if (persona.isChild) { ... }
 *   <p>{persona.praise.excellent}</p>
 */
export function useUserPersona(): UserPersona {
  const { profile } = useProfile();
  const age = profile?.age ?? null;
  const gender = normalizeGender(profile?.gender);
  const ageGroup = getAgeGroup(age);

  const isChild = ageGroup === "child";
  const isTeen = ageGroup === "teen";
  const isAdult = ageGroup === "adult";
  const isFemale = gender === "female";
  const isMale = gender === "male";

  // Children & teens get tutoiement; adults get vouvoiement
  const isTu = isChild || isTeen;

  // Gendered praise (default to masculine if unknown)
  const praise = isFemale
    ? {
        excellent: "أَحْسَنْتِ",
        super: "مُمْتَازَةٌ",
        great: "رَائِعَةٌ",
        smart: "ذَكِيَّةٌ",
        brave: "بَطَلَةٌ",
        tryAgain: "حَاوِلِي مَرَّةً أُخْرَى",
      }
    : {
        excellent: "أَحْسَنْتَ",
        super: "مُمْتَازٌ",
        great: "رَائِعٌ",
        smart: "ذَكِيٌّ",
        brave: "بَطَلٌ",
        tryAgain: "حَاوِلْ مَرَّةً أُخْرَى",
      };

  const imperatives = isFemale
    ? {
        write: "اِكْتُبِي",
        read: "اِقْرَئِي",
        say: "قُولِي",
        listen: "اِسْمَعِي",
        try: "حَاوِلِي",
        repeat: "أَعِيدِي",
      }
    : {
        write: "اِكْتُبْ",
        read: "اِقْرَأْ",
        say: "قُلْ",
        listen: "اِسْمَعْ",
        try: "حَاوِلْ",
        repeat: "أَعِدْ",
      };

  return {
    age,
    gender,
    firstName: profile?.first_name ?? "",
    ageGroup,
    isChild,
    isTeen,
    isAdult,
    isMale,
    isFemale,
    isTu,

    you: isTu ? "tu" : "vous",
    yourPossessive: isTu ? "ton" : "votre",
    yourPossessiveFem: isTu ? "ta" : "votre",
    yourPossessivePlural: isTu ? "tes" : "vos",
    greeting: isChild
      ? `Salut${profile?.first_name ? " " + profile.first_name : ""} ! 👋`
      : isTu
      ? `Salut${profile?.first_name ? " " + profile.first_name : ""} !`
      : `Bonjour${profile?.first_name ? " " + profile.first_name : ""} !`,

    animationLevel: isChild ? "high" : isTeen ? "medium" : "low",
    emojiOk: isChild,
    fontScaleHint: isChild ? 1.08 : 1.0,
    cardStyle: isChild ? "playful" : isTeen ? "balanced" : "professional",

    praise,
    imperatives,
  };
}

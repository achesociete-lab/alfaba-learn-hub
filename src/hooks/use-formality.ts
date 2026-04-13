import { useProfile } from "@/hooks/use-profile";

/**
 * Returns tutoiement (tu) strings if age < 18, vouvoiement (vous) otherwise.
 * Defaults to vouvoiement when age is unknown.
 */
export function useFormality() {
  const { profile } = useProfile();
  const isTu = profile?.age != null && profile.age < 18;

  return {
    isTu,
    // Common phrases
    yourPossessive: isTu ? "ton" : "votre",
    yourPossessiveFem: isTu ? "ta" : "votre",
    yourPossessivePlural: isTu ? "tes" : "vos",
    you: isTu ? "tu" : "vous",
    youVerb: (tuForm: string, vousForm: string) => isTu ? tuForm : vousForm,
  };
}

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface FamilyProfile {
  id: string;
  owner_id: string;
  display_name: string;
  avatar: string;
  level: "niveau_1" | "niveau_2";
}

interface FamilyProfileContextType {
  activeProfile: FamilyProfile | null;
  activeUserId: string | null;
  isChildProfile: boolean;
  setActiveProfile: (profile: FamilyProfile | null) => void;
}

const STORAGE_KEY = "alfasl_active_family_profile";

const FamilyProfileContext = createContext<FamilyProfileContextType>({
  activeProfile: null,
  activeUserId: null,
  isChildProfile: false,
  setActiveProfile: () => {},
});

export function FamilyProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [activeProfile, setActiveProfileState] = useState<FamilyProfile | null>(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Clear profile on logout
  useEffect(() => {
    if (!user) {
      sessionStorage.removeItem(STORAGE_KEY);
      setActiveProfileState(null);
    }
  }, [user]);

  // Safety: clear if profile belongs to a different user
  useEffect(() => {
    if (user && activeProfile && activeProfile.owner_id !== user.id) {
      sessionStorage.removeItem(STORAGE_KEY);
      setActiveProfileState(null);
    }
  }, [user, activeProfile]);

  const setActiveProfile = (profile: FamilyProfile | null) => {
    if (profile) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
    setActiveProfileState(profile);
  };

  const activeUserId = activeProfile ? activeProfile.id : (user?.id ?? null);
  const isChildProfile = !!activeProfile;

  return (
    <FamilyProfileContext.Provider value={{ activeProfile, activeUserId, isChildProfile, setActiveProfile }}>
      {children}
    </FamilyProfileContext.Provider>
  );
}

export function useFamilyProfile() {
  return useContext(FamilyProfileContext);
}

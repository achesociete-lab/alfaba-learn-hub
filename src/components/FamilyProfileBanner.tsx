import { useNavigate } from "react-router-dom";
import { useFamilyProfile } from "@/contexts/FamilyProfileContext";
import { ChevronRight } from "lucide-react";

export default function FamilyProfileBanner() {
  const { activeProfile, isChildProfile, setActiveProfile } = useFamilyProfile();
  const navigate = useNavigate();

  if (!isChildProfile || !activeProfile) return null;

  const handleSwitch = () => {
    setActiveProfile(null);
    navigate("/famille");
  };

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-emerald-700 text-white py-1.5 px-4 flex items-center justify-between text-sm shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-base">{activeProfile.avatar}</span>
        <span className="font-semibold">{activeProfile.display_name}</span>
        <span className="text-white/60 text-xs">· {activeProfile.level === "niveau_1" ? "Niveau 1" : "Niveau 2"}</span>
      </div>
      <button
        onClick={handleSwitch}
        className="flex items-center gap-1 text-white/80 hover:text-white transition-colors text-xs font-medium"
      >
        Changer de profil <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

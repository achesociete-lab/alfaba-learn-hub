import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/use-profile";
import { useIsAdmin } from "@/hooks/use-admin";

// Routes autorisées aux élèves "présentiel" (en plus des pages publiques)
const PRESENTIEL_ALLOWED = new Set<string>([
  "/cours-presentiel",
  "/complete-profile",
  "/compte-en-attente",
]);

const ProfileGuard = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, isComplete } = useProfile();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const location = useLocation();

  if (authLoading || profileLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  // Pending presentiel students: only allow /compte-en-attente
  if (profile?.type_eleve === "en_attente" && location.pathname !== "/compte-en-attente") {
    return <Navigate to="/compte-en-attente" replace />;
  }

  // Élèves présentiel : accès UNIQUEMENT à /cours-presentiel (admins exemptés)
  // On NE force PAS la complétion de profil pour eux (gérée par le prof)
  if (profile?.type_eleve === "presentiel" && !isAdmin) {
    if (!PRESENTIEL_ALLOWED.has(location.pathname)) {
      return <Navigate to="/cours-presentiel" replace />;
    }
  } else if (!isComplete && profile?.type_eleve !== "en_attente") {
    return <Navigate to="/complete-profile" replace />;
  }

  return <Outlet />;
};

export default ProfileGuard;

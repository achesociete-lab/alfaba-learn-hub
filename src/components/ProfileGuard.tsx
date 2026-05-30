import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/use-profile";
import { useIsAdmin } from "@/hooks/use-admin";
import { useSubscription } from "@/hooks/use-subscription";

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
  const { isHifz, isPremium, loading: subscriptionLoading } = useSubscription();
  const location = useLocation();

  if (authLoading || profileLoading || adminLoading || subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace state={{ from: location.pathname }} />;

  // Pending presentiel students: only allow /compte-en-attente
  if (profile?.type_eleve === "en_attente" && location.pathname !== "/compte-en-attente") {
    return <Navigate to="/compte-en-attente" replace />;
  }

  // Élèves présentiel : accès UNIQUEMENT à /cours-presentiel (admins exemptés)
  // On NE force PAS la complétion de profil pour eux (gérée par le prof)
  if (profile?.type_eleve === "presentiel" && !isAdmin) {
    const hasHifzAccess = isHifz || isPremium;
    if (!PRESENTIEL_ALLOWED.has(location.pathname) && !(hasHifzAccess && location.pathname === "/hifz")) {
      return <Navigate to="/cours-presentiel" replace />;
    }
  } else if (!profile) {
    // User is authenticated but profile row not yet available (DB trigger race condition
    // on first Google OAuth signup). Send to complete-profile — NOT back to /auth which
    // would create an infinite redirect loop (Auth page immediately redirects back here).
    return <Navigate to="/complete-profile" replace />;
  } else if (!isComplete && profile?.type_eleve !== "en_attente") {
    return <Navigate to="/complete-profile" replace />;
  }

  return <Outlet />;
};

export default ProfileGuard;

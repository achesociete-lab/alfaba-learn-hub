import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/use-profile";

const ProfileGuard = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, isComplete } = useProfile();
  const location = useLocation();

  if (authLoading || profileLoading) {
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

  // Presentiel students get redirected to their course page from /dashboard
  if (profile?.type_eleve === "presentiel" && location.pathname === "/dashboard") {
    return <Navigate to="/cours-presentiel" replace />;
  }

  if (!isComplete && profile?.type_eleve !== "en_attente") {
    return <Navigate to="/complete-profile" replace />;
  }

  return <Outlet />;
};

export default ProfileGuard;


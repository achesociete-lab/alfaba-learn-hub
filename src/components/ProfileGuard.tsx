import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/use-profile";

const ProfileGuard = () => {
  const { user, loading: authLoading } = useAuth();
  const { loading: profileLoading, isComplete } = useProfile();

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isComplete) {
    return <Navigate to="/complete-profile" replace />;
  }

  return <Outlet />;
};

export default ProfileGuard;

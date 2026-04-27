import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const STORAGE_KEY = "alfasl:lastRoute";

// Routes qu'on ne veut pas restaurer automatiquement
const EXCLUDED = ["/auth", "/complete-profile", "/compte-en-attente", "/unsubscribe"];

const RouteTracker = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const restoredRef = useRef(false);

  // Au premier mount sur "/", restaurer la dernière route
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    if (location.pathname !== "/") return;
    try {
      const last = localStorage.getItem(STORAGE_KEY);
      if (last && last !== "/" && !EXCLUDED.some((p) => last.startsWith(p))) {
        navigate(last, { replace: true });
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sauvegarder à chaque changement de route
  useEffect(() => {
    const path = location.pathname + location.search;
    if (EXCLUDED.some((p) => location.pathname.startsWith(p))) return;
    try {
      localStorage.setItem(STORAGE_KEY, path);
    } catch {}
  }, [location.pathname, location.search]);

  return null;
};

export default RouteTracker;

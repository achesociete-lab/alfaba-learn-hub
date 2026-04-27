import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const STORAGE_KEY = "alfasl:lastRoute";

// Whitelist — uniquement les pages principales sont sauvegardées et restaurables
const ALLOWED_PREFIXES = [
  "/tuteur",
  "/niveau-1",
  "/niveau-2",
  "/coran",
  "/cours-presentiel",
  "/dashboard",
  "/exercices",
  "/classe-virtuelle",
  "/professeur-virtuel",
  "/tarifs",
];

const isAllowed = (pathname: string) =>
  ALLOWED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));

const RouteTracker = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const restoredRef = useRef(false);

  // Au premier mount sur "/", restaurer la dernière route si elle est whitelistée
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    if (location.pathname !== "/") return;
    try {
      const last = localStorage.getItem(STORAGE_KEY);
      if (!last) return;
      const lastPath = last.split("?")[0];
      if (isAllowed(lastPath)) {
        navigate(last, { replace: true });
      } else {
        // Fallback : nettoyer une valeur obsolète (ex: /profil) et rediriger vers dashboard
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sauvegarder uniquement les pages whitelistées
  useEffect(() => {
    if (!isAllowed(location.pathname)) return;
    try {
      localStorage.setItem(STORAGE_KEY, location.pathname + location.search);
    } catch {}
  }, [location.pathname, location.search]);

  return null;
};

export default RouteTracker;

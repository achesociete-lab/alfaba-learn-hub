import { useEffect } from "react";
import { useLocation } from "react-router-dom";

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
  "/conversation",
  "/tarifs",
];

// Blacklist explicite — jamais sauvegardés ni restaurés
const BLOCKED_SUBSTRINGS = [
  "profil",
  "profile",
  "/auth",
  "/login",
  "/register",
  "/inscription-presentiel",
  "/onboarding",
  "/complete-profile",
  "/compte-en-attente",
];

const isBlocked = (pathname: string) =>
  BLOCKED_SUBSTRINGS.some((s) => pathname.toLowerCase().includes(s));

const isAllowed = (pathname: string) =>
  !isBlocked(pathname) &&
  ALLOWED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));

// Nettoyage immédiat au chargement du module : purge toute valeur contaminée
try {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing && isBlocked(existing.toLowerCase())) {
    localStorage.removeItem(STORAGE_KEY);
  }
  // Purge supplémentaire : toute clé localStorage contenant "profil"
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (!key) continue;
    const value = localStorage.getItem(key) || "";
    if (
      key === STORAGE_KEY &&
      value.toLowerCase().includes("profil")
    ) {
      localStorage.removeItem(key);
    }
  }
} catch {}

const RouteTracker = () => {
  const location = useLocation();

  // Sauvegarder uniquement les pages whitelistées (et jamais les blacklistées)
  useEffect(() => {
    if (isBlocked(location.pathname)) return;
    if (!isAllowed(location.pathname)) return;
    try {
      localStorage.setItem(STORAGE_KEY, location.pathname + location.search);
    } catch {}
  }, [location.pathname, location.search]);

  return null;
};

export default RouteTracker;

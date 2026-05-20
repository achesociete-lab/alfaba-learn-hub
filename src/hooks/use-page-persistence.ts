import { useCallback, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * usePagePersistence — sauvegarde la dernière page visitée + métadonnées
 * (lessonId, step, questionIndex, score, timestamp) dans localStorage et
 * la restaure au retour de l'élève.
 *
 * - Flush immédiat sur `visibilitychange` (hidden), `pagehide`, `beforeunload`
 *   → essentiel sur mobile où l'app passe en arrière-plan sans warning.
 * - Expiration : si `Date.now() - timestamp > 30min`, on n'auto-restaure pas
 *   (l'utilisateur retourne au dashboard / page courante).
 * - Whitelist stricte des routes restaurables ; jamais /auth, /login,
 *   /register, /profil, /complete-profile…
 */

const STORAGE_KEY = "alfasl:page-state";
const MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes

const ALLOWED_PREFIXES = [
  "/niveau-1",
  "/niveau-2",
  "/tuteur",
  "/coran",
  "/cours-presentiel",
  "/admin",
  "/exercices",
  "/classe-virtuelle",
  "/conversation",
  "/dashboard",
];

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
  "/unsubscribe",
];

export interface PageState {
  path: string;
  lessonId?: number | string | null;
  step?: number | null;
  questionIndex?: number | null;
  score?: number | null;
  timestamp: number;
}

const isBlocked = (p: string) =>
  BLOCKED_SUBSTRINGS.some((s) => p.toLowerCase().includes(s));
const isAllowed = (p: string) =>
  !isBlocked(p) &&
  ALLOWED_PREFIXES.some((pref) => p === pref || p.startsWith(pref + "/"));

const readState = (): PageState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PageState;
    if (!parsed || typeof parsed.path !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
};

const writeState = (s: PageState) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* ignore */ }
};

const clearState = () => {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
};

/**
 * À monter une fois dans l'app (cf. <PagePersistenceTracker/>).
 * Sauvegarde automatique sur changement de route + flush au passage en
 * arrière-plan, et tente une restauration au premier mount.
 */
export function usePagePersistence() {
  const location = useLocation();
  const navigate = useNavigate();
  const stateRef = useRef<PageState | null>(null);
  const restoredRef = useRef(false);

  // 1) Restauration au premier mount.
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    const saved = readState();
    if (!saved) return;

    const age = Date.now() - (saved.timestamp || 0);
    if (age > MAX_AGE_MS) {
      clearState();
      // Si on est sur "/", aller au dashboard pour repartir proprement.
      if (location.pathname === "/") {
        // ne navigue que si l'utilisateur a explicitement une session.
        // On laisse le routing normal sinon (Index).
      }
      return;
    }
    if (!isAllowed(saved.path)) return;

    // Ne restaure que si l'utilisateur n'a pas tapé une URL spécifique.
    if (location.pathname === "/" || location.pathname === "") {
      navigate(saved.path, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) Sauvegarde sur chaque changement de route éligible.
  useEffect(() => {
    const full = location.pathname + location.search;
    if (!isAllowed(location.pathname)) return;
    const next: PageState = {
      ...(stateRef.current ?? {}),
      path: full,
      timestamp: Date.now(),
    };
    stateRef.current = next;
    writeState(next);
  }, [location.pathname, location.search]);

  // 3) Flush sur passage en arrière-plan (mobile +++).
  useEffect(() => {
    const flush = () => {
      const cur = stateRef.current;
      if (!cur) return;
      writeState({ ...cur, timestamp: Date.now() });
    };
    const onVis = () => { if (document.visibilityState === "hidden") flush(); };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", flush);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", flush);
    };
  }, []);
}

/**
 * Hook optionnel pour enrichir l'état persisté depuis une page de leçon /
 * d'exercice (lessonId, step en cours, question en cours, score).
 * À appeler à chaque mise à jour pertinente — débit limité par React.
 */
export function useUpdatePageMeta(meta: Partial<Omit<PageState, "path" | "timestamp">>) {
  const location = useLocation();
  useEffect(() => {
    if (!isAllowed(location.pathname)) return;
    const cur = readState();
    const next: PageState = {
      path: location.pathname + location.search,
      ...(cur ?? {}),
      ...meta,
      timestamp: Date.now(),
    };
    writeState(next);
  }, [location.pathname, location.search, meta.lessonId, meta.step, meta.questionIndex, meta.score]);
}

export const clearPageState = clearState;

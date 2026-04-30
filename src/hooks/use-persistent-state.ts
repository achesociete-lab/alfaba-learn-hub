import { useCallback, useEffect, useRef, useState } from "react";

/**
 * usePersistentState
 * - Stocke la valeur dans localStorage en temps réel
 * - Sauvegarde immédiatement lors d'un changement d'onglet / verrouillage écran
 *   (events: `visibilitychange` -> hidden, `pagehide`, `beforeunload`).
 * - Si la valeur est `null`/`undefined`, la clé est supprimée.
 *
 * Utiliser une clé stable (et ajouter un suffixe `userId` si scopée à l'élève).
 *
 * @example
 *   const [step, setStep, clearStep] = usePersistentState("lesson:5:step", 0);
 */
export function usePersistentState<T>(
  key: string,
  initialValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>, () => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return initialValue;
      return JSON.parse(raw) as T;
    } catch {
      return initialValue;
    }
  });

  const valueRef = useRef(value);
  valueRef.current = value;

  // Persist on every change (debounced to next tick to batch quick updates)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (value === undefined || value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch {
      /* quota / serialization errors ignored */
    }
  }, [key, value]);

  // Force flush on tab hide / page unload / lock
  useEffect(() => {
    if (typeof window === "undefined") return;
    const flush = () => {
      try {
        const v = valueRef.current;
        if (v === undefined || v === null) localStorage.removeItem(key);
        else localStorage.setItem(key, JSON.stringify(v));
      } catch { /* ignore */ }
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", flush);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", flush);
    };
  }, [key]);

  const clear = useCallback(() => {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
    setValue(initialValue);
  }, [key, initialValue]);

  return [value, setValue, clear];
}

/** Build a per-user namespaced key. */
export const userScopedKey = (userId: string | null | undefined, key: string) =>
  `alfasl:${userId ?? "anon"}:${key}`;

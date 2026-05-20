import { usePagePersistence } from "@/hooks/use-page-persistence";

/**
 * Monté une fois dans <App/> sous <BrowserRouter/>. Persiste la dernière
 * page consultée (whitelistée) et restaure l'élève au bon endroit au
 * retour, dans la fenêtre de 30 minutes. Voir use-page-persistence.ts.
 */
const PagePersistenceTracker = () => {
  usePagePersistence();
  return null;
};

export default PagePersistenceTracker;

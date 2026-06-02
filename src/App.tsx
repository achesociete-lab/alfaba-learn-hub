import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProfileGuard from "@/components/ProfileGuard";
import RouteTracker from "./components/RouteTracker";
import PendingPresentielHandler from "./components/PendingPresentielHandler";
import PagePersistenceTracker from "./components/PagePersistenceTracker";
import WhatsAppButton from "./components/WhatsAppButton";

// Eager-loaded (small, critical path)
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import NotFound from "./pages/NotFound.tsx";
import CompleteProfile from "./pages/CompleteProfile.tsx";
import CompteEnAttente from "./pages/CompteEnAttente.tsx";
import Unsubscribe from "./pages/Unsubscribe.tsx";

// Lazy-loaded (heavy pages — improves initial bundle size)
const Niveau1 = lazy(() => import("./pages/Niveau1.tsx"));
const Niveau2 = lazy(() => import("./pages/Niveau2.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const Tarifs = lazy(() => import("./pages/Tarifs.tsx"));
const Exercises = lazy(() => import("./pages/Exercises.tsx"));
const ClasseVirtuelle = lazy(() => import("./pages/ClasseVirtuelle.tsx"));
const Coran = lazy(() => import("./pages/Coran.tsx"));
const ArabicChat = lazy(() => import("./pages/ArabicChat.tsx"));
const Tuteur = lazy(() => import("./pages/Tuteur.tsx"));
const Admin = lazy(() => import("./pages/Admin.tsx"));
const MentionsLegales = lazy(() => import("./pages/MentionsLegales.tsx"));
const PolitiqueConfidentialite = lazy(() => import("./pages/PolitiqueConfidentialite.tsx"));
const InscriptionPresentiel = lazy(() => import("./pages/InscriptionPresentiel.tsx"));
const CoursPresentiel = lazy(() => import("./pages/CoursPresentiel.tsx"));
const SubscriptionManagement = lazy(() => import("./pages/SubscriptionManagement.tsx"));
const AdminPromoManagement = lazy(() => import("./pages/AdminPromoManagement.tsx"));
const AdminRevenueMetrics = lazy(() => import("./pages/AdminRevenueMetrics.tsx"));
const Hifz = lazy(() => import("./pages/Hifz.tsx"));

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <RouteTracker />
          <PagePersistenceTracker />
          <PendingPresentielHandler />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/inscription-presentiel" element={<InscriptionPresentiel />} />
              <Route path="/compte-en-attente" element={<CompteEnAttente />} />
              <Route path="/unsubscribe" element={<Unsubscribe />} />
              <Route path="/complete-profile" element={<CompleteProfile />} />
              <Route path="/tarifs" element={<Tarifs />} />
              <Route path="/mentions-legales" element={<MentionsLegales />} />
              <Route path="/politique-de-confidentialite" element={<PolitiqueConfidentialite />} />

              {/* Public course pages */}
              <Route path="/niveau-1" element={<Niveau1 />} />
              <Route path="/exercices" element={<Exercises />} />

              {/* Protected routes requiring complete profile */}
              <Route element={<ProfileGuard />}>
                <Route path="/niveau-2" element={<Niveau2 />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/cours-presentiel" element={<CoursPresentiel />} />
                <Route path="/classe-virtuelle" element={<ClasseVirtuelle />} />
                <Route path="/coran" element={<Coran />} />
                <Route path="/conversation" element={<ArabicChat />} />
                <Route path="/tuteur" element={<Tuteur />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/abonnement" element={<SubscriptionManagement />} />
                <Route path="/admin/promo" element={<AdminPromoManagement />} />
                <Route path="/admin/revenue" element={<AdminRevenueMetrics />} />
                <Route path="/hifz" element={<Hifz />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
        <WhatsAppButton />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

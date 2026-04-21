import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProfileGuard from "@/components/ProfileGuard";
import Index from "./pages/Index.tsx";
import Niveau1 from "./pages/Niveau1.tsx";
import Admin from "./pages/Admin.tsx";
import Niveau2 from "./pages/Niveau2.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Tarifs from "./pages/Tarifs.tsx";
import Auth from "./pages/Auth.tsx";
import Exercises from "./pages/Exercises.tsx";
import ClasseVirtuelle from "./pages/ClasseVirtuelle.tsx";
import Coran from "./pages/Coran.tsx";
import ArabicChat from "./pages/ArabicChat.tsx";
import NotFound from "./pages/NotFound.tsx";
import MentionsLegales from "./pages/MentionsLegales.tsx";
import PolitiqueConfidentialite from "./pages/PolitiqueConfidentialite.tsx";
import CompleteProfile from "./pages/CompleteProfile.tsx";
import InscriptionPresentiel from "./pages/InscriptionPresentiel.tsx";
import CompteEnAttente from "./pages/CompteEnAttente.tsx";
import CoursPresentiel from "./pages/CoursPresentiel.tsx";
import Unsubscribe from "./pages/Unsubscribe.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
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
              <Route path="/admin" element={<Admin />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

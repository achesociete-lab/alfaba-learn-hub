import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/use-admin";
import { useSubscription } from "@/hooks/use-subscription";
import { supabase } from "@/integrations/supabase/client";

const WHATSAPP_NUMBER = "33745351791";
const WA_MESSAGES = [
  { label: "Rejoindre le programme Hifd", text: "As-salâmu 'alaykum, je souhaite rejoindre le programme Hifd." },
  { label: "Question sur les cours", text: "As-salâmu 'alaykum, j'ai une question sur les cours d'arabe." },
  { label: "Connaître les tarifs", text: "As-salâmu 'alaykum, quels sont les tarifs ?" },
  { label: "Séance d'essai", text: "As-salâmu 'alaykum, je voudrais réserver une séance d'essai." },
];

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const publicNavLinks = [
  { to: "/", label: "Accueil" },
  { to: "/niveau-1", label: "Niveau 1" },
  { to: "/niveau-2", label: "Niveau 2" },
  { to: "/coran", label: "Coran" },
];

const getAuthNavLinks = (level: string | null, typeEleve: string | null, hasHifzAccess = false, hasFamilleAccess = false, isAdmin = false, isParent = false, isNouraniyaStudent = false) => {
  // Présentiel : accès limité
  if (typeEleve === "presentiel") {
    const links = [{ to: "/cours-presentiel", label: "Espace Élève" }];
    if (hasHifzAccess) links.push({ to: "/hifz", label: "📖 Hifd" });
    return links;
  }

  const links: { to: string; label: string }[] = [
    { to: "/dashboard", label: "Accueil" },
  ];

  if (isAdmin) {
    // L'admin voit les deux niveaux pour pouvoir tester la vue élève
    links.push({ to: "/niveau-1", label: "Niveau 1" });
    links.push({ to: "/niveau-2", label: "Niveau 2" });
  } else if (level === "niveau_1") {
    links.push({ to: "/niveau-1", label: "Niveau 1" });
  } else if (level === "niveau_2") {
    links.push({ to: "/niveau-2", label: "Niveau 2" });
  }

  links.push({ to: "/coran", label: "Coran" });
  links.push({ to: "/hifz", label: "📖 Hifd" });
  links.push({ to: "/conversation", label: "🎙️ مساعد المعلم" });
  links.push({ to: "/tuteur", label: "🎓 مساري" });
  links.push({ to: "/dessins-animes", label: "📺 رسوم متحركة" });
  if (hasFamilleAccess) links.push({ to: "/famille", label: "👨‍👩‍👧‍👦 Ma famille" });
  if (isNouraniyaStudent) links.push({ to: "/exercices-nouraniya", label: "✏️ Exercices" });
  if (isParent) links.push({ to: "/parents", label: "👨‍👧 Espace Parents" });
  links.push({ to: "/dashboard", label: "Espace Élève" });

  return links;
};

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { isHifz, isFamille } = useSubscription();
  const [userLevel, setUserLevel] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [isParent, setIsParent] = useState(false);
  const [isNouraniyaStudent, setIsNouraniyaStudent] = useState(false);

  useEffect(() => {
    if (!user) { setUserLevel(null); setUserType(null); setIsParent(false); setIsNouraniyaStudent(false); return; }
    supabase.from("profiles").select("level,type_eleve").eq("user_id", user.id).single()
      .then(({ data }) => {
        if (data) { setUserLevel(data.level); setUserType(data.type_eleve); }
      });
    supabase.from("parent_links").select("id", { count: "exact", head: true }).eq("parent_user_id", user.id)
      .then(({ count }) => setIsParent((count ?? 0) > 0));
    supabase.from("nouraniya_enrollments").select("id", { count: "exact", head: true }).eq("student_id", user.id)
      .then(({ count }) => setIsNouraniyaStudent((count ?? 0) > 0));
  }, [user]);

  const navLinks = user ? getAuthNavLinks(userLevel, userType, isHifz, isFamille, isAdmin, isParent, isNouraniyaStudent) : publicNavLinks;

  const [waOpen, setWaOpen] = useState(false);
  const handleWaMessage = (text: string) => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
    setWaOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center">
          <img src="/logo.png" alt="Alfasl" className="h-14 w-auto" />
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === link.to ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${
                location.pathname === "/admin" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Shield className="h-3.5 w-3.5" /> Admin
            </Link>
          )}
          {/* WhatsApp button */}
          <div className="relative">
            <motion.button
              onClick={() => setWaOpen(v => !v)}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20c05a] transition-colors shadow-sm shadow-green-500/20"
            >
              <WhatsAppIcon /> Contact
            </motion.button>
            <AnimatePresence>
              {waOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setWaOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="absolute top-10 right-0 z-50 w-64 bg-white rounded-2xl shadow-2xl shadow-black/15 overflow-hidden border border-gray-100"
                  >
                    <div className="bg-[#25D366] px-4 py-3 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <WhatsAppIcon />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">ALFASL</p>
                        <p className="text-white/80 text-xs">Répond rapidement</p>
                      </div>
                    </div>
                    <div className="p-2.5 space-y-1.5 bg-[#f0f2f5]">
                      <p className="text-xs text-gray-500 text-center py-1">Choisissez un sujet</p>
                      {WA_MESSAGES.map(({ label, text }) => (
                        <button key={label} onClick={() => handleWaMessage(text)}
                          className="w-full text-left text-sm bg-white hover:bg-green-50 text-gray-800 px-3 py-2.5 rounded-xl border border-gray-100 hover:border-[#25D366] transition-all">
                          {label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {user ? (
            <Button size="sm" variant="outline" onClick={signOut} className="gap-2">
              <LogOut className="h-4 w-4" /> Déconnexion
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/5">
                <Link to="/auth">S'inscrire</Link>
              </Button>
              <Button asChild size="sm" className="gradient-emerald border-0 text-primary-foreground">
                <Link to="/auth">Se connecter</Link>
              </Button>
            </div>
          )}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-background border-b border-border"
          >
            <div className="flex flex-col gap-2 p-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                    location.pathname === "/admin"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  <Shield className="h-4 w-4" /> Admin
                </Link>
              )}
              {user ? (
                <Button size="sm" variant="outline" onClick={() => { signOut(); setOpen(false); }} className="gap-2 mt-2">
                  <LogOut className="h-4 w-4" /> Déconnexion
                </Button>
              ) : (
                <>
                  <Button asChild size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/5 mt-2">
                    <Link to="/auth" onClick={() => setOpen(false)}>S'inscrire</Link>
                  </Button>
                  <Button asChild size="sm" className="gradient-emerald border-0 text-primary-foreground mt-1">
                    <Link to="/auth" onClick={() => setOpen(false)}>Se connecter</Link>
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

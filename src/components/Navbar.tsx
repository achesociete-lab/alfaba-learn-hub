import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, BookOpen, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/use-admin";
import { supabase } from "@/integrations/supabase/client";

const publicNavLinks = [
  { to: "/", label: "Accueil" },
  { to: "/niveau-1", label: "Niveau 1" },
  { to: "/niveau-2", label: "Niveau 2" },
  { to: "/coran", label: "Coran" },
];

const getAuthNavLinks = (level: string | null) => {
  const links: { to: string; label: string }[] = [
    { to: "/dashboard", label: "Accueil" },
  ];

  if (level === "niveau_1") {
    links.push({ to: "/niveau-1", label: "Niveau 1" });
  } else if (level === "niveau_2") {
    links.push({ to: "/niveau-2", label: "Niveau 2" });
  }

  links.push({ to: "/coran", label: "Coran" });
  links.push({ to: "/conversation", label: "Professeur Virtuel" });
  links.push({ to: "/dashboard", label: "Espace Élève" });

  return links;
};

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const [userLevel, setUserLevel] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setUserLevel(null); return; }
    supabase.from("profiles").select("level").eq("user_id", user.id).single()
      .then(({ data }) => { if (data) setUserLevel(data.level); });
  }, [user]);

  const navLinks = user ? getAuthNavLinks(userLevel) : publicNavLinks;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2">
          <BookOpen className="h-7 w-7 text-primary" />
          <span className="font-display text-xl font-bold text-foreground">
            ALFASL <span className="text-gradient-gold font-arabic">الفصل</span>
          </span>
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
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

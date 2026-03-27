import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Video, Calendar, Clock, Users, ExternalLink, BookOpen, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface ScheduledClass {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  level: string;
  teacher: string;
  status: "upcoming" | "live" | "past";
  meetLink?: string;
}

const mockSchedule: ScheduledClass[] = [
  { id: "1", title: "Révision de l'alphabet — Lettres 1-14", date: "2026-03-30", time: "18:00", duration: "1h30", level: "Niveau 1", teacher: "Professeur", status: "upcoming" },
  { id: "2", title: "Révision de l'alphabet — Lettres 15-28", date: "2026-04-02", time: "18:00", duration: "1h30", level: "Niveau 1", teacher: "Professeur", status: "upcoming" },
  { id: "3", title: "Grammaire : Phrase nominale & verbale", date: "2026-04-06", time: "18:00", duration: "1h30", level: "Niveau 2", teacher: "Professeur", status: "upcoming" },
  { id: "4", title: "Dictée & Compréhension orale", date: "2026-04-09", time: "18:00", duration: "1h30", level: "Niveau 1 & 2", teacher: "Professeur", status: "upcoming" },
];

const ClasseVirtuelle = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Chargement...</p></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full mb-4">
              <Video className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Classe Virtuelle</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3">Cours en direct</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">Rejoignez les sessions de cours en direct avec votre professeur. Posez vos questions et progressez ensemble.</p>
          </motion.div>

          {/* Info banner */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-4 rounded-xl border border-primary/30 bg-primary/5 mb-8 flex items-start gap-3">
            <Bell className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">Comment ça marche ?</p>
              <p className="text-xs text-muted-foreground mt-1">Le professeur partagera le lien de la session avant chaque cours. Vous recevrez une notification par email. Assurez-vous d'avoir une bonne connexion internet et un micro/casque.</p>
            </div>
          </motion.div>

          {/* Schedule */}
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><Calendar className="h-5 w-5" /> Prochains cours</h2>
          <div className="space-y-4">
            {mockSchedule.map((cls, i) => (
              <motion.div key={cls.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="p-5 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${cls.status === "live" ? "gradient-emerald animate-pulse" : "bg-muted"}`}>
                      <Video className={`h-6 w-6 ${cls.status === "live" ? "text-primary-foreground" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{cls.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5">
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(cls.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{cls.time} ({cls.duration})</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" />{cls.level}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    {cls.status === "live" ? (
                      <Button size="sm" className="gradient-emerald border-0 text-primary-foreground gap-1.5"><ExternalLink className="h-3 w-3" /> Rejoindre</Button>
                    ) : (
                      <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-muted text-muted-foreground">À venir</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Resources */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-12 p-6 rounded-xl border border-border bg-card">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><BookOpen className="h-4 w-4" /> Préparez vos cours</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <button onClick={() => navigate("/exercices")} className="p-3 rounded-lg bg-muted hover:bg-primary/10 transition-colors text-left">
                <p className="text-sm font-medium text-foreground">📝 Exercices interactifs</p>
                <p className="text-xs text-muted-foreground">Révisez avant le cours</p>
              </button>
              <button onClick={() => navigate(user ? "/dashboard" : "/auth")} className="p-3 rounded-lg bg-muted hover:bg-primary/10 transition-colors text-left">
                <p className="text-sm font-medium text-foreground">📤 Déposer un devoir</p>
                <p className="text-xs text-muted-foreground">Rendez vos travaux</p>
              </button>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ClasseVirtuelle;

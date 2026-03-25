import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import {
  BookOpen, Upload, CheckCircle, ClipboardList, BarChart3,
  FileText, PenTool, Calendar, LogOut, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Profile {
  first_name: string;
  last_name: string;
  level: "niveau_1" | "niveau_2";
}

interface Homework {
  id: string;
  title: string;
  status: string;
  grade: number | null;
  submitted_at: string;
}

interface Attendance {
  date: string;
  present: boolean;
}

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  level: "niveau_1" | "niveau_2";
  due_date: string | null;
  created_at: string;
}

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [hwTitle, setHwTitle] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [profileRes, hwRes, attRes, assignRes] = await Promise.all([
        supabase.from("profiles").select("first_name, last_name, level").eq("user_id", user.id).single(),
        supabase.from("homework_submissions").select("id, title, status, grade, submitted_at").eq("user_id", user.id).order("submitted_at", { ascending: false }),
        supabase.from("attendance").select("date, present").eq("user_id", user.id).order("date", { ascending: false }).limit(10),
        supabase.from("homework_assignments").select("id, title, description, level, due_date, created_at").order("created_at", { ascending: false }),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (hwRes.data) setHomework(hwRes.data);
      if (attRes.data) setAttendance(attRes.data);
      if (assignRes.data) setAssignments(assignRes.data.filter((a: Assignment) => !profileRes.data || a.level === profileRes.data.level));
    };

    fetchData();
  }, [user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !profile) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Le fichier ne doit pas dépasser 10 Mo");
      return;
    }

    if (!hwTitle.trim()) {
      toast.error("Veuillez saisir un titre pour le devoir");
      return;
    }

    setUploading(true);
    try {
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("homework").upload(filePath, file);
      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from("homework_submissions").insert({
        user_id: user.id,
        title: hwTitle,
        file_url: filePath,
        level: profile.level,
      });
      if (insertError) throw insertError;

      toast.success("Devoir déposé avec succès !");
      setHwTitle("");

      // Refresh homework list
      const { data } = await supabase
        .from("homework_submissions")
        .select("id, title, status, grade, submitted_at")
        .eq("user_id", user.id)
        .order("submitted_at", { ascending: false });
      if (data) setHomework(data);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors du dépôt");
    } finally {
      setUploading(false);
    }
  };

  const avgGrade = homework.filter(h => h.grade !== null).length > 0
    ? (homework.filter(h => h.grade !== null).reduce((sum, h) => sum + (h.grade || 0), 0) / homework.filter(h => h.grade !== null).length).toFixed(1)
    : "—";

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">
                {profile ? `Bienvenue, ${profile.first_name} !` : "Espace Élève"}
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                {profile?.level === "niveau_1" ? "Niveau 1" : "Niveau 2"} — {user.email}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={signOut} className="gap-2">
              <LogOut className="h-4 w-4" /> Déconnexion
            </Button>
          </motion.div>

          {/* Progress cards */}
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg gradient-emerald flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {profile?.level === "niveau_1" ? "Niveau 1" : "Niveau 2"}
                  </p>
                  <p className="text-xs text-muted-foreground">{homework.length} devoirs déposés</p>
                </div>
              </div>
              <Progress value={homework.length > 0 ? Math.min((homework.filter(h => h.status === "corrigé").length / homework.length) * 100, 100) : 0} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {homework.filter(h => h.status === "corrigé").length}/{homework.length} corrigés
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg gradient-gold flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Moyenne générale</p>
                  <p className="text-xs text-muted-foreground">Sur les devoirs corrigés</p>
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">{avgGrade}<span className="text-lg text-muted-foreground">/20</span></p>
            </motion.div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="consignes" className="space-y-4">
            <TabsList className="bg-muted">
              <TabsTrigger value="consignes" className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" /> Consignes
              </TabsTrigger>
              <TabsTrigger value="devoirs" className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" /> Mes devoirs
              </TabsTrigger>
              <TabsTrigger value="emargement" className="flex items-center gap-1.5">
                <ClipboardList className="h-4 w-4" /> Émargement
              </TabsTrigger>
              <TabsTrigger value="deposer" className="flex items-center gap-1.5">
                <Upload className="h-4 w-4" /> Déposer
              </TabsTrigger>
            </TabsList>

            <TabsContent value="consignes">
              {assignments.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground rounded-xl border border-border bg-card">
                  <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>Aucun devoir publié pour le moment.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignments.map((a) => (
                    <div key={a.id} className="p-4 rounded-xl border border-border bg-card">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-foreground">{a.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            Publié le {new Date(a.created_at).toLocaleDateString("fr-FR")}
                            {a.due_date && (
                              <span className="text-destructive font-medium"> — À rendre avant le {new Date(a.due_date).toLocaleDateString("fr-FR")}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      {a.description && (
                        <p className="text-sm text-muted-foreground ml-13 pl-[52px]">{a.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="devoirs">
              {homework.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground rounded-xl border border-border bg-card">
                  <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>Aucun devoir déposé pour le moment.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {homework.map((hw) => (
                    <div key={hw.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                        hw.status === "corrigé" ? "bg-primary/10" : "bg-gold/10"
                      }`}>
                        {hw.status === "corrigé" ? (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        ) : (
                          <PenTool className="h-5 w-5 text-gold" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-foreground">{hw.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {new Date(hw.submitted_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-bold ${hw.status === "corrigé" ? "text-primary" : "text-muted-foreground"}`}>
                          {hw.grade !== null ? `${hw.grade}/20` : "—"}
                        </span>
                        <p className={`text-xs ${hw.status === "corrigé" ? "text-primary/70" : "text-gold"}`}>
                          {hw.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="emargement">
              {attendance.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground rounded-xl border border-border bg-card">
                  <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>Aucun émargement enregistré.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {attendance.map((att, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-border bg-card">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground flex-1">
                        {new Date(att.date).toLocaleDateString("fr-FR")}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        att.present
                          ? "bg-primary/10 text-primary"
                          : "bg-destructive/10 text-destructive"
                      }`}>
                        {att.present ? "Présent" : "Absent"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="deposer">
              <div className="p-8 rounded-xl border-2 border-dashed border-border bg-card text-center">
                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-4">Déposer un devoir</h3>

                <div className="max-w-sm mx-auto mb-4">
                  <input
                    type="text"
                    value={hwTitle}
                    onChange={(e) => setHwTitle(e.target.value)}
                    placeholder="Titre du devoir (ex: Dictée leçon 3)"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm mb-3"
                  />
                  <label className="block">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleFileUpload}
                      disabled={uploading || !hwTitle.trim()}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      disabled={uploading || !hwTitle.trim()}
                      className="gradient-emerald border-0 text-primary-foreground w-full"
                      onClick={() => {
                        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                        input?.click();
                      }}
                    >
                      {uploading ? "Envoi en cours..." : "Choisir un fichier"}
                    </Button>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">PDF, Image ou Document — 10 Mo max</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;

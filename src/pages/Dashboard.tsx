import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import {
  BookOpen, Upload, CheckCircle, ClipboardList, BarChart3,
  FileText, PenTool, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockHomework = [
  { id: 1, title: "Dictée leçon 3 — Voyelles courtes", status: "corrigé", note: "16/20", date: "22/03/2026" },
  { id: 2, title: "Exercice lecture leçon 4", status: "corrigé", note: "18/20", date: "20/03/2026" },
  { id: 3, title: "Dictée leçon 5 — Voyelles longues", status: "en attente", note: "—", date: "25/03/2026" },
];

const mockAttendance = [
  { date: "22/03/2026", present: true },
  { date: "19/03/2026", present: true },
  { date: "15/03/2026", present: false },
  { date: "12/03/2026", present: true },
  { date: "08/03/2026", present: true },
  { date: "05/03/2026", present: true },
];

const Dashboard = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground mb-2">Espace Élève</h1>
          <p className="text-muted-foreground mb-8">Bienvenue ! Suivez votre progression et gérez vos devoirs.</p>
        </motion.div>

        {/* Progress cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-xl border border-border bg-card"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg gradient-emerald flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Niveau 1</p>
                <p className="text-xs text-muted-foreground">Leçon 5 / 10</p>
              </div>
            </div>
            <Progress value={50} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">50% complété</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-xl border border-border bg-card"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg gradient-gold flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Moyenne générale</p>
                <p className="text-xs text-muted-foreground">Sur les devoirs corrigés</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">17<span className="text-lg text-muted-foreground">/20</span></p>
          </motion.div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="devoirs" className="space-y-4">
          <TabsList className="bg-muted">
            <TabsTrigger value="devoirs" className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" /> Devoirs
            </TabsTrigger>
            <TabsTrigger value="emargement" className="flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4" /> Émargement
            </TabsTrigger>
            <TabsTrigger value="deposer" className="flex items-center gap-1.5">
              <Upload className="h-4 w-4" /> Déposer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="devoirs">
            <div className="space-y-3">
              {mockHomework.map((hw) => (
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
                    <p className="text-xs text-muted-foreground">{hw.date}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${hw.status === "corrigé" ? "text-primary" : "text-muted-foreground"}`}>
                      {hw.note}
                    </span>
                    <p className={`text-xs ${hw.status === "corrigé" ? "text-primary/70" : "text-gold"}`}>
                      {hw.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="emargement">
            <div className="space-y-2">
              {mockAttendance.map((att, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-border bg-card">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground flex-1">{att.date}</span>
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
          </TabsContent>

          <TabsContent value="deposer">
            <div className="p-8 rounded-xl border-2 border-dashed border-border bg-card text-center">
              <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Déposer un devoir</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Glissez votre fichier ici ou cliquez pour sélectionner
              </p>
              <Button className="gradient-emerald border-0 text-primary-foreground">
                Choisir un fichier
              </Button>
              <p className="text-xs text-muted-foreground mt-3">PDF, Image ou Document — 10 Mo max</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
    <Footer />
  </div>
);

export default Dashboard;

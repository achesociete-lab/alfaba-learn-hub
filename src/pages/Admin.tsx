import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/use-admin";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminStudents from "@/components/admin/AdminStudents";
import AdminHomework from "@/components/admin/AdminHomework";
import AdminAttendance from "@/components/admin/AdminAttendance";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Shield, Users, FileText, ClipboardList, BarChart3 } from "lucide-react";

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!adminLoading && !isAdmin && user) navigate("/dashboard");
  }, [isAdmin, adminLoading, user, navigate]);

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Espace Professeur</h1>
            </div>
            <p className="text-muted-foreground">Gérez vos élèves, corrigez les devoirs et gérez l'émargement.</p>
          </motion.div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-muted">
              <TabsTrigger value="overview" className="flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4" /> Vue d'ensemble
              </TabsTrigger>
              <TabsTrigger value="students" className="flex items-center gap-1.5">
                <Users className="h-4 w-4" /> Élèves
              </TabsTrigger>
              <TabsTrigger value="homework" className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" /> Devoirs
              </TabsTrigger>
              <TabsTrigger value="attendance" className="flex items-center gap-1.5">
                <ClipboardList className="h-4 w-4" /> Émargement
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview"><AdminOverview /></TabsContent>
            <TabsContent value="students"><AdminStudents /></TabsContent>
            <TabsContent value="homework"><AdminHomework /></TabsContent>
            <TabsContent value="attendance"><AdminAttendance /></TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;

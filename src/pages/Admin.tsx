import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/use-admin";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminStudents from "@/components/admin/AdminStudents";
import AdminHomework from "@/components/admin/AdminHomework";
import AdminAttendance from "@/components/admin/AdminAttendance";
import AdminCourses from "@/components/admin/AdminCourses";
import AdminRecitations from "@/components/admin/AdminRecitations";
import AdminPresentielCourses from "@/components/admin/AdminPresentielCourses";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Shield, Users, FileText, ClipboardList, BarChart3, BookOpen, Headphones, MapPin } from "lucide-react";

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!adminLoading && !isAdmin && user) navigate("/dashboard");
  }, [isAdmin, adminLoading, user, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchPending = async () => {
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("type_eleve", "en_attente" as any);
      setPendingCount(count || 0);
    };
    fetchPending();
    const interval = setInterval(fetchPending, 30000);
    return () => clearInterval(interval);
  }, [isAdmin]);

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
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Espace Professeur</h1>
            </div>
            <p className="text-muted-foreground">Gérez vos cours, élèves, devoirs et émargement.</p>
          </motion.div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-muted flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="overview" className="flex items-center gap-1.5 text-xs sm:text-sm">
                <BarChart3 className="h-4 w-4" /> Vue d'ensemble
              </TabsTrigger>
              <TabsTrigger value="courses" className="flex items-center gap-1.5 text-xs sm:text-sm">
                <BookOpen className="h-4 w-4" /> Cours
              </TabsTrigger>
              <TabsTrigger value="students" className="flex items-center gap-1.5 text-xs sm:text-sm relative">
                <Users className="h-4 w-4" /> Élèves
                {pendingCount > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 min-w-5 px-1.5 text-[10px]">
                    {pendingCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="presentiel" className="flex items-center gap-1.5 text-xs sm:text-sm">
                <MapPin className="h-4 w-4" /> Présentiel
              </TabsTrigger>
              <TabsTrigger value="homework" className="flex items-center gap-1.5 text-xs sm:text-sm">
                <FileText className="h-4 w-4" /> Devoirs
              </TabsTrigger>
              <TabsTrigger value="attendance" className="flex items-center gap-1.5 text-xs sm:text-sm">
                <ClipboardList className="h-4 w-4" /> Émargement
              </TabsTrigger>
              <TabsTrigger value="recitations" className="flex items-center gap-1.5 text-xs sm:text-sm">
                <Headphones className="h-4 w-4" /> Récitations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview"><AdminOverview /></TabsContent>
            <TabsContent value="courses"><AdminCourses /></TabsContent>
            <TabsContent value="students"><AdminStudents /></TabsContent>
            <TabsContent value="presentiel"><AdminPresentielCourses /></TabsContent>
            <TabsContent value="homework"><AdminHomework /></TabsContent>
            <TabsContent value="attendance"><AdminAttendance /></TabsContent>
            <TabsContent value="recitations"><AdminRecitations /></TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Crown, Lock, Sparkles, BookOpen, CheckCircle2, XCircle, Loader2, ChevronRight, Moon, Sunrise, Sun, GraduationCap, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/use-subscription";
import { useProfile } from "@/hooks/use-profile";
import { supabase } from "@/integrations/supabase/client";
import { HIFZ_SESSION_TYPES, HifzSessionType, getSessionType } from "@/lib/hifz-session-types";

const TOTAL_HIZB = 60;
const PAGES_PER_HIZB = 10;

type HifzConfig = { id: string; hizb_already_memo: number; duration_months: number; start_date: string };
type Slot = { id: string; slot_date: string; start_time: string; end_time: string; capacity: number; notes: string | null };
type Session = { id: string; session_date: string; session_time: string; status: string; meet_link: string | null; notes_eleve: string | null; session_type?: string | null; juz_number?: number | null };
type Evaluation = { id: string; session_id: string | null; hizb_number: number; status: string; niveau: string | null; notes: string | null; evaluated_at: string; session_type?: string | null };

const NIVEAU_LABEL: Record<string, string> = { mediocre: "Médiocre", moyen: "Moyen", bon: "Bon", excellent: "Excellent" };
const NIVEAU_WEIGHT: Record<string, number> = { mediocre: 1, moyen: 2, bon: 3, excellent: 4 };

export default function Hifz() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isHifz, isPremium, loading: subLoading } = useSubscription();
  const { profile } = useProfile();
  const { toast } = useToast();

  const [tab, setTab] = useState("programme");
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<HifzConfig | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);

  // Onboarding form
  const [memoCount, setMemoCount] = useState(0);
  const [duration, setDuration] = useState(16);
  const [submitting, setSubmitting] = useState(false);

  // Booking
  const [calMonth, setCalMonth] = useState(startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingType, setBookingType] = useState<HifzSessionType>("sabaq");
  const [bookingJuz, setBookingJuz] = useState<number>(1);
  const [booking, setBooking] = useState(false);

  // Vue globale
  const [globalFilter, setGlobalFilter] = useState<"tous" | HifzSessionType>("tous");

  useEffect(() => {
    if (authLoading) return;
    if (!user) navigate("/auth");
  }, [user, authLoading, navigate]);

  const fetchAll = async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: cfg }, { data: evals }, { data: sess }, { data: slt }] = await Promise.all([
      supabase.from("hifz_config").select("*").eq("student_id", user.id).maybeSingle(),
      supabase.from("hifz_evaluations").select("*").eq("student_id", user.id),
      supabase.from("hifz_sessions").select("*").eq("student_id", user.id).order("session_date", { ascending: false }),
      supabase.from("admin_hifz_slots").select("*").gte("slot_date", format(new Date(), "yyyy-MM-dd")).order("slot_date"),
    ]);
    setConfig((cfg as any) ?? null);
    setEvaluations((evals as any) ?? []);
    setSessions((sess as any) ?? []);
    setSlots((slt as any) ?? []);
    setLoading(false);
  };

  useEffect(() => { if (user && (isHifz || isPremium)) fetchAll(); }, [user, isHifz, isPremium]);

  const validatedHizbNumbers = useMemo(() => {
    const set = new Set<number>();
    for (const e of evaluations) if (e.status === "valide") set.add(e.hizb_number);
    return set;
  }, [evaluations]);
  const initialMemo = config?.hizb_already_memo || 0;
  const totalMemorized = Math.min(TOTAL_HIZB, initialMemo + validatedHizbNumbers.size);
  const remainingHizb = config ? Math.max(0, TOTAL_HIZB - totalMemorized) : 0;
  const remainingPages = remainingHizb * PAGES_PER_HIZB;
  const memorizedPages = totalMemorized * PAGES_PER_HIZB;
  const progressPercent = Math.round((totalMemorized / TOTAL_HIZB) * 100);
  const pacePerDay = config ? +(remainingPages / Math.max(1, config.duration_months * 30)).toFixed(2) : 0;

  const progressChartData = useMemo(() => {
    const valids = evaluations
      .filter((e) => e.status === "valide")
      .sort((a, b) => new Date(a.evaluated_at).getTime() - new Date(b.evaluated_at).getTime());
    const seen = new Set<number>();
    const byDate: Record<string, number> = {};
    for (const e of valids) {
      if (seen.has(e.hizb_number)) continue;
      seen.add(e.hizb_number);
      const d = format(parseISO(e.evaluated_at), "dd/MM");
      byDate[d] = seen.size + initialMemo;
    }
    const points = Object.entries(byDate).map(([date, memorized]) => ({
      date, memorisés: memorized, restants: TOTAL_HIZB - memorized,
    }));
    if (points.length === 0 && config) {
      points.push({ date: format(parseISO(config.start_date), "dd/MM"), memorisés: initialMemo, restants: TOTAL_HIZB - initialMemo });
    }
    return points;
  }, [evaluations, initialMemo, config]);

  const monthlyPlan = useMemo(() => {
    if (!config) return [] as { month: number; label: string; hizb: number[] }[];
    const months = Math.max(1, config.duration_months);
    const perMonth = Math.ceil(remainingHizb / months);
    const startHizb = config.hizb_already_memo + 1;
    const result = [];
    for (let m = 0; m < months; m++) {
      const from = startHizb + m * perMonth;
      const to = Math.min(TOTAL_HIZB, from + perMonth - 1);
      if (from > TOTAL_HIZB) break;
      const hizb = [];
      for (let h = from; h <= to; h++) hizb.push(h);
      const dt = addMonths(parseISO(config.start_date), m);
      result.push({ month: m + 1, label: format(dt, "MMMM yyyy", { locale: fr }), hizb });
    }
    return result;
  }, [config, remainingHizb]);

  // Dernière éval par hizb (toutes types confondus)
  const evalByHizb = useMemo(() => {
    const map: Record<number, Evaluation> = {};
    for (const e of evaluations) {
      const cur = map[e.hizb_number];
      if (!cur || new Date(e.evaluated_at) > new Date(cur.evaluated_at)) map[e.hizb_number] = e;
    }
    return map;
  }, [evaluations]);

  // Dernière éval par hizb par type
  const evalByHizbByType = useMemo(() => {
    const map: Record<number, Record<string, Evaluation>> = {};
    for (const e of evaluations) {
      const t = e.session_type || "sabaq";
      if (!map[e.hizb_number]) map[e.hizb_number] = {};
      const cur = map[e.hizb_number][t];
      if (!cur || new Date(e.evaluated_at) > new Date(cur.evaluated_at)) map[e.hizb_number][t] = e;
    }
    return map;
  }, [evaluations]);

  const slotsByDay = useMemo(() => {
    const m: Record<string, Slot[]> = {};
    for (const s of slots) (m[s.slot_date] ||= []).push(s);
    return m;
  }, [slots]);

  const daysOfMonth = useMemo(() => eachDayOfInterval({ start: startOfMonth(calMonth), end: endOfMonth(calMonth) }), [calMonth]);

  const handleGenerate = async () => {
    if (!user) return;
    setSubmitting(true);
    const { data, error } = await supabase
      .from("hifz_config")
      .upsert({ student_id: user.id, hizb_already_memo: memoCount, duration_months: duration, start_date: format(new Date(), "yyyy-MM-dd") }, { onConflict: "student_id" })
      .select().single();
    setSubmitting(false);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    setConfig(data as any);
    toast({ title: "Programme généré !", description: "Votre plan de mémorisation est prêt." });
  };

  const handleReset = async () => {
    if (!user || !config) return;
    if (!confirm("Réinitialiser votre programme ?")) return;
    await supabase.from("hifz_config").delete().eq("student_id", user.id);
    setConfig(null); setMemoCount(0); setDuration(16);
  };

  const confirmBooking = async () => {
    if (!user || !selectedSlot) return;
    setBooking(true);
    const insertData: any = {
      student_id: user.id,
      session_date: selectedSlot.slot_date,
      session_time: selectedSlot.start_time,
      status: "en_attente",
      notes_eleve: bookingMessage || null,
      session_type: bookingType,
    };
    if (bookingType === "khatm_partiel") insertData.juz_number = bookingJuz;

    const { error } = await supabase.from("hifz_sessions").insert(insertData);
    if (error) {
      setBooking(false);
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }

    const typeInfo = getSessionType(bookingType);
    const studentName = `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || (user.email ?? "Élève");
    const tplData = {
      studentName, studentEmail: user.email,
      date: format(parseISO(selectedSlot.slot_date), "EEEE d MMMM yyyy", { locale: fr }),
      time: selectedSlot.start_time.slice(0, 5),
      message: bookingMessage,
      sessionType: bookingType,
      sessionTypeLabel: `${typeInfo.icon} ${typeInfo.label}`,
      juzNumber: bookingType === "khatm_partiel" ? bookingJuz : null,
    };
    Promise.all([
      supabase.functions.invoke("send-transactional-email", { body: { templateName: "hifz-booking-admin", recipientEmail: "abdelkarim7@gmail.com", templateData: tplData } }),
      user.email ? supabase.functions.invoke("send-transactional-email", { body: { templateName: "hifz-booking-confirmation", recipientEmail: user.email, templateData: tplData } }) : null,
    ].filter(Boolean)).catch(() => {});

    setBooking(false); setSelectedSlot(null); setSelectedDay(null);
    setBookingMessage(""); setBookingType("sabaq"); setBookingJuz(1);
    toast({ title: "Réservation enregistrée", description: "Vous recevrez un email de confirmation." });
    fetchAll();
  };

  // Vue globale: build hizb -> evaluations history
  const evalHistoryByHizb = useMemo(() => {
    const map: Record<number, Evaluation[]> = {};
    for (const e of evaluations) {
      (map[e.hizb_number] ||= []).push(e);
    }
    Object.values(map).forEach((arr) => arr.sort((a, b) => new Date(b.evaluated_at).getTime() - new Date(a.evaluated_at).getTime()));
    return map;
  }, [evaluations]);

  // Tableau de bord par type
  const dashboardByType = HIFZ_SESSION_TYPES.map((t) => {
    const evs = evaluations.filter((e) => (e.session_type || "sabaq") === t.value);
    const hizbCount = new Set(evs.map((e) => e.hizb_number)).size;
    const niveaux = evs.filter((e) => e.niveau).map((e) => NIVEAU_WEIGHT[e.niveau!] || 0);
    const avg = niveaux.length ? niveaux.reduce((a, b) => a + b, 0) / niveaux.length : 0;
    const last = evs.sort((a, b) => new Date(b.evaluated_at).getTime() - new Date(a.evaluated_at).getTime())[0];
    return { type: t, hizbCount, avg, lastDate: last?.evaluated_at };
  });

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdf8ef]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
      </div>
    );
  }
  if (!user) return null;
  if (!isHifz && !isPremium) return <UpsellPage />;

  const previewRemaining = TOTAL_HIZB - memoCount;
  const previewPages = previewRemaining * PAGES_PER_HIZB;
  const previewPace = previewPages > 0 ? +(previewPages / (duration * 30)).toFixed(2) : 0;
  const previewEnd = format(addMonths(new Date(), duration), "MMM yyyy", { locale: fr });
  const paceColor = previewPace > 2 ? "red" : previewPace > 1 ? "amber" : "emerald";

  return (
    <div className="min-h-screen bg-[#fdf8ef]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-700 to-amber-700 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-emerald-800">Hifd al-Qur'ān</h1>
            <p className="text-sm text-amber-800/80">Programme de mémorisation personnalisé</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-700" /></div>
        ) : (
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-1 w-full bg-emerald-50 border border-emerald-100 h-auto">
              <TabsTrigger value="programme" className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white">Programme</TabsTrigger>
              <TabsTrigger value="vue-globale" className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white">Vue globale</TabsTrigger>
              <TabsTrigger value="methode" className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white">Méthode 📚</TabsTrigger>
              <TabsTrigger value="reserver" className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white">Réserver</TabsTrigger>
              <TabsTrigger value="historique" className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white">Historique</TabsTrigger>
            </TabsList>

            {/* ─── Programme ─── */}
            <TabsContent value="programme" className="mt-6">
              {!config ? (
                <Card className="border-emerald-200">
                  <CardHeader>
                    <CardTitle className="text-emerald-800">Créer votre programme</CardTitle>
                    <p className="text-sm text-amber-800/70">Configurez votre plan — l'aperçu se met à jour en temps réel.</p>
                  </CardHeader>
                  <CardContent className="space-y-6">

                    {/* Slider hizb */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Hizb déjà mémorisés <span className="text-xs text-amber-800/60">(depuis An-Nas = hizb 1)</span></Label>
                        <span className="text-2xl font-bold text-emerald-800">
                          {memoCount} <span className="text-sm font-normal text-amber-800/60">/ 60</span>
                        </span>
                      </div>
                      <Slider
                        value={[memoCount]}
                        onValueChange={([v]) => setMemoCount(v)}
                        min={0} max={60} step={1}
                      />
                      <div className="flex justify-between text-xs text-amber-800/40">
                        <span>0</span>
                        <span>Coran complet (60)</span>
                      </div>
                    </div>

                    {/* Durée : boutons rapides + saisie libre */}
                    <div className="space-y-2">
                      <Label>Durée souhaitée</Label>
                      <div className="flex gap-2 flex-wrap items-center">
                        {[6, 12, 18, 24, 36].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setDuration(m)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                              duration === m
                                ? "bg-emerald-700 text-white border-emerald-700"
                                : "bg-white text-emerald-800 border-emerald-200 hover:border-emerald-400"
                            }`}
                          >
                            {m} mois
                          </button>
                        ))}
                        <Input
                          type="number"
                          min={1}
                          max={120}
                          value={duration}
                          onChange={(e) => setDuration(Math.max(1, +e.target.value || 1))}
                          className="bg-white w-24 h-9"
                          placeholder="Autre"
                        />
                      </div>
                    </div>

                    {/* Aperçu live */}
                    {memoCount < 60 ? (
                      <div className={`rounded-xl p-4 border ${
                        paceColor === "red"     ? "bg-red-50 border-red-200" :
                        paceColor === "amber"   ? "bg-amber-50 border-amber-200" :
                                                  "bg-emerald-50 border-emerald-200"
                      }`}>
                        <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${
                          paceColor === "red"   ? "text-red-700" :
                          paceColor === "amber" ? "text-amber-700" :
                                                  "text-emerald-700"
                        }`}>Aperçu de votre programme</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-3">
                          <div>
                            <div className="text-xl font-bold text-emerald-800">{previewRemaining}</div>
                            <div className="text-xs text-amber-800/70">Hizb restants</div>
                          </div>
                          <div>
                            <div className="text-xl font-bold text-emerald-800">{previewPages}</div>
                            <div className="text-xs text-amber-800/70">Pages restantes</div>
                          </div>
                          <div>
                            <div className={`text-xl font-bold ${
                              paceColor === "red"   ? "text-red-700" :
                              paceColor === "amber" ? "text-amber-700" :
                                                      "text-emerald-800"
                            }`}>{previewPace}</div>
                            <div className="text-xs text-amber-800/70">Pages / jour</div>
                          </div>
                          <div>
                            <div className="text-xl font-bold text-emerald-800 capitalize">{previewEnd}</div>
                            <div className="text-xs text-amber-800/70">Fin estimée</div>
                          </div>
                        </div>
                        <p className={`text-xs text-center ${
                          paceColor === "red"   ? "text-red-700" :
                          paceColor === "amber" ? "text-amber-700" :
                                                  "text-emerald-700"
                        }`}>
                          {paceColor === "red"   && "⚠️ Rythme très intensif — augmentez la durée pour un hifd solide."}
                          {paceColor === "amber" && "⚡ Rythme soutenu — prévoyez du temps chaque jour."}
                          {paceColor === "emerald" && "✓ Rythme idéal pour une mémorisation solide et durable."}
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-xl p-4 bg-amber-50 border border-amber-200 text-center">
                        <p className="text-amber-800 font-semibold">ما شاء الله — Vous avez mémorisé le Coran complet !</p>
                        <p className="text-xs text-amber-800/70 mt-1">Créez un programme de révision pour maintenir votre hifd.</p>
                      </div>
                    )}

                    <Button onClick={handleGenerate} disabled={submitting} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white">
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                      Générer mon programme
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-amber-50">
                    <CardContent className="pt-6 space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <Stat label="Hizb mémorisés" value={`${totalMemorized}/${TOTAL_HIZB}`} />
                        <Stat label="Hizb restants" value={remainingHizb} />
                        <Stat label="Pages restantes" value={remainingPages} />
                        <Stat label="Rythme" value={`${pacePerDay} p/j`} />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-amber-800/80 mb-1">
                          <span>Progression globale</span>
                          <span className="font-semibold">{progressPercent}% · {memorizedPages} pages mémorisées</span>
                        </div>
                        <Progress value={progressPercent} className="h-3" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-emerald-200">
                    <CardHeader><CardTitle className="text-emerald-800 text-base">📈 Évolution de la mémorisation</CardTitle></CardHeader>
                    <CardContent>
                      {progressChartData.length <= 1 ? (
                        <p className="text-sm text-amber-800/70 text-center py-6">Le graphique apparaîtra dès que vos premiers hizb seront validés.</p>
                      ) : (
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={progressChartData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e7d9b8" />
                              <XAxis dataKey="date" stroke="#92400e" fontSize={11} />
                              <YAxis stroke="#92400e" fontSize={11} domain={[0, TOTAL_HIZB]} />
                              <Tooltip contentStyle={{ background: "#fdf8ef", border: "1px solid #15803d", borderRadius: 8 }} />
                              <Legend wrapperStyle={{ fontSize: 12 }} />
                              <Line type="monotone" dataKey="memorisés" stroke="#15803d" strokeWidth={2} dot={{ r: 3 }} />
                              <Line type="monotone" dataKey="restants" stroke="#b45309" strokeWidth={2} dot={{ r: 3 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Accordion type="single" collapsible className="space-y-2">
                    {monthlyPlan.map((m) => (
                      <AccordionItem key={m.month} value={`m-${m.month}`} className="border border-emerald-200 rounded-lg bg-white px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-2">
                            <span className="font-semibold text-emerald-800 capitalize">Mois {m.month} · {m.label}</span>
                            <Badge variant="outline" className="border-amber-700 text-amber-800">{m.hizb.length} hizb</Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                            {m.hizb.map((h) => {
                              const byType = evalByHizbByType[h] || {};
                              const types = Object.keys(byType);
                              return (
                                <div key={h} className="flex items-center justify-between p-3 rounded border border-emerald-100 bg-emerald-50/40 gap-2">
                                  <span className="font-medium whitespace-nowrap">Hizb {h}</span>
                                  <div className="flex flex-wrap gap-1 justify-end">
                                    {types.length === 0 ? (
                                      <Badge variant="secondary" className="bg-gray-200 text-gray-700 text-[10px]">Non évalué</Badge>
                                    ) : types.map((t) => {
                                      const ev = byType[t];
                                      const ti = getSessionType(t);
                                      return (
                                        <Badge key={t} className={`${ti.badgeBg} ${ti.badgeText} text-[10px] border-0`} title={`${ti.label} — ${ev.status === "valide" ? (NIVEAU_LABEL[ev.niveau || ""] || "Validé") : "À retravailler"}`}>
                                          {ti.icon} {ev.status === "valide" ? (NIVEAU_LABEL[ev.niveau || ""] || "Validé") : "À retravailler"}
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>

                  <Button variant="outline" onClick={handleReset} className="border-amber-700 text-amber-800 hover:bg-amber-50">Modifier mon programme</Button>
                </div>
              )}
            </TabsContent>

            {/* ─── Vue globale ─── */}
            <TabsContent value="vue-globale" className="mt-6 space-y-4">
              <Card className="border-emerald-200">
                <CardHeader>
                  <CardTitle className="text-emerald-800 text-base">Grille des 60 hizb</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant={globalFilter === "tous" ? "default" : "outline"} onClick={() => setGlobalFilter("tous")} className={globalFilter === "tous" ? "bg-emerald-700 text-white" : ""}>Tous</Button>
                    {HIFZ_SESSION_TYPES.map((t) => (
                      <Button key={t.value} size="sm" variant={globalFilter === t.value ? "default" : "outline"} onClick={() => setGlobalFilter(t.value)} className={globalFilter === t.value ? `${t.badgeBg} ${t.badgeText} border ${t.border}` : ""}>
                        {t.icon} {t.label}
                      </Button>
                    ))}
                  </div>

                  <TooltipProvider delayDuration={150}>
                    <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5">
                      {Array.from({ length: TOTAL_HIZB }).map((_, i) => {
                        const h = i + 1;
                        const history = evalHistoryByHizb[h] || [];
                        const filtered = globalFilter === "tous" ? history : history.filter((e) => (e.session_type || "sabaq") === globalFilter);
                        const latest = filtered[0];
                        let cls = "bg-gray-100 text-gray-400";
                        if (latest) {
                          if (latest.status === "valide") {
                            const ti = getSessionType(latest.session_type);
                            cls = `${ti.badgeBg} ${ti.badgeText} font-semibold`;
                          } else cls = "bg-red-100 text-red-700 font-semibold";
                        }
                        return (
                          <UITooltip key={h}>
                            <TooltipTrigger asChild>
                              <button className={`aspect-square rounded text-xs flex items-center justify-center transition ${cls} hover:ring-2 hover:ring-emerald-400`}>
                                {h}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <div className="space-y-1">
                                <p className="font-semibold">Hizb {h}</p>
                                {history.length === 0 ? <p className="text-xs">Non évalué</p> : (
                                  <ul className="text-xs space-y-0.5">
                                    {history.slice(0, 6).map((e) => {
                                      const ti = getSessionType(e.session_type);
                                      return (
                                        <li key={e.id}>
                                          {ti.icon} {format(parseISO(e.evaluated_at), "d MMM", { locale: fr })} — {ti.label} — {e.status === "valide" ? (NIVEAU_LABEL[e.niveau || ""] || "Validé") : "À retravailler"}
                                        </li>
                                      );
                                    })}
                                  </ul>
                                )}
                              </div>
                            </TooltipContent>
                          </UITooltip>
                        );
                      })}
                    </div>
                  </TooltipProvider>
                </CardContent>
              </Card>

              <Card className="border-emerald-200">
                <CardHeader><CardTitle className="text-emerald-800 text-base">📊 Tableau de bord par type</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {dashboardByType.map(({ type: t, hizbCount, avg, lastDate }) => (
                    <div key={t.value} className={`p-3 rounded border ${t.border} ${t.bgSoft}`}>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{t.icon}</span>
                          <span className="font-semibold text-sm">{t.label}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          <strong>{hizbCount}</strong> hizb · Niveau moyen <strong>{avg ? avg.toFixed(1) + "/4" : "—"}</strong>
                          {lastDate && <> · dernière : {format(parseISO(lastDate), "d MMM yyyy", { locale: fr })}</>}
                        </div>
                      </div>
                      <Progress value={(avg / 4) * 100} className="h-1.5 mt-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ─── Méthode ─── */}
            <TabsContent value="methode" className="mt-6 space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-emerald-800">La méthode pakistanaise du Hifd</h2>
                <p className="text-sm text-amber-800/80 max-w-xl mx-auto">3 piliers, 6 types de sessions — un hifd solide à vie.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-emerald-600 border-emerald-200 bg-emerald-50/40">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-emerald-700" /><CardTitle className="text-emerald-800 text-base">📗 SABAQ</CardTitle></div>
                    <p className="text-2xl font-arabic text-emerald-700 leading-none">سَبَق</p>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <Badge className="bg-emerald-700 text-white">Chaque jour</Badge>
                    <p className="text-gray-700">La nouvelle leçon. Répéter 10× la nuit, 5× le matin.</p>
                    <p className="text-emerald-700 font-medium text-xs">Ne jamais avancer sans validation du professeur.</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500 border-amber-200 bg-amber-50/40">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2"><RotateCcw className="h-5 w-5 text-amber-700" /><CardTitle className="text-amber-800 text-base">📙 SABAQ PARA</CardTitle></div>
                    <p className="text-2xl font-arabic text-amber-700 leading-none">سَبَق پارَه</p>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <Badge className="bg-amber-600 text-white">Chaque matin</Badge>
                    <p className="text-gray-700">Les hizb des 7 derniers jours récités sans mushaf. Le filet de sécurité.</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-violet-500 border-violet-200 bg-violet-50/40">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-violet-700" /><CardTitle className="text-violet-800 text-base">📘 DHOR</CardTitle></div>
                    <p className="text-2xl font-arabic text-violet-700 leading-none">دَوْر</p>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <Badge className="bg-violet-600 text-white">Rotation quotidienne</Badge>
                    <p className="text-gray-700">Les anciens hizb. 1 hizb/jour minimum. Le pilier du hifd à vie.</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-emerald-200">
                <CardHeader><CardTitle className="text-emerald-800 text-base">🗓 Planning quotidien</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-l-4 border-emerald-500 pl-4 py-2 bg-emerald-50/30 rounded-r">
                    <div className="flex items-center gap-2 mb-1"><Moon className="h-4 w-4 text-emerald-700" /><h4 className="font-semibold text-emerald-800 text-sm">Avant Fajr → SABAQ</h4></div>
                    <p className="text-sm text-gray-700">Nouvelles pages · Répéter 10×</p>
                    <p className="text-xs text-amber-800/70 mt-1">Durée selon ton programme : <strong>{pacePerDay > 0 ? `${pacePerDay} pages/jour` : "—"}</strong></p>
                  </div>
                  <div className="border-l-4 border-amber-500 pl-4 py-2 bg-amber-50/30 rounded-r">
                    <div className="flex items-center gap-2 mb-1"><Sunrise className="h-4 w-4 text-amber-700" /><h4 className="font-semibold text-amber-800 text-sm">Dhuha → SABAQ PARA</h4></div>
                    <p className="text-sm text-gray-700">7 derniers jours sans mushaf · 20-30 min</p>
                  </div>
                  <div className="border-l-4 border-violet-500 pl-4 py-2 bg-violet-50/30 rounded-r">
                    <div className="flex items-center gap-2 mb-1"><Sun className="h-4 w-4 text-violet-700" /><h4 className="font-semibold text-violet-800 text-sm">Avant Asr → DHOR</h4></div>
                    <p className="text-sm text-gray-700">1 ancien hizb · 15-20 min</p>
                  </div>
                  <div className="border-l-4 border-amber-700 pl-4 py-2 bg-amber-50/30 rounded-r">
                    <div className="flex items-center gap-2 mb-1"><Moon className="h-4 w-4 text-amber-800" /><h4 className="font-semibold text-amber-900 text-sm">Maghrib / Isha → TEST EN SALAT</h4></div>
                    <p className="text-sm text-gray-700">Réciter dans la prière</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-emerald-200">
                <CardHeader><CardTitle className="text-emerald-800 text-base">📋 Les 6 types de sessions</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {HIFZ_SESSION_TYPES.map((t, i) => {
                    const freq = ["chaque semaine", "toutes les 2 semaines", "mensuel", "si besoin", "mensuel", "tous les 2 mois"][i];
                    return (
                      <div key={t.value} className={`p-3 rounded border ${t.border} ${t.bgSoft}`}>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{t.icon}</span>
                            <div>
                              <span className="font-semibold text-sm">{t.label}</span>
                              <p className="text-xs text-gray-600">{t.long}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[10px]">{freq}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <div className="text-center space-y-3 py-6">
                <p className="text-2xl font-arabic text-emerald-700 leading-relaxed">اللَّهُمَّ انْفَعْنِي بِمَا عَلَّمْتَنِي</p>
                <p className="text-sm text-amber-800/80 italic">"Ô Allah, fais-moi profiter de ce que Tu m'as enseigné"</p>
              </div>
            </TabsContent>

            {/* ─── Réserver ─── */}
            <TabsContent value="reserver" className="mt-6 space-y-4">
              <Card className="border-emerald-200">
                <CardHeader><CardTitle className="text-emerald-800 text-base">1. Type de session</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {HIFZ_SESSION_TYPES.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setBookingType(t.value)}
                        className={`text-left p-3 rounded border-2 transition ${bookingType === t.value ? `${t.border} ${t.bgSoft} ring-2 ring-offset-1 ring-emerald-300` : "border-gray-200 bg-white hover:border-gray-300"}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{t.icon}</span>
                          <span className="font-semibold text-sm">{t.label}</span>
                        </div>
                        <p className="text-xs text-gray-600">{t.description}</p>
                      </button>
                    ))}
                  </div>
                  {bookingType === "khatm_partiel" && (
                    <div className="mt-3">
                      <Label>Quel juz ? (1 à 30)</Label>
                      <Input type="number" min={1} max={30} value={bookingJuz} onChange={(e) => setBookingJuz(Math.min(30, Math.max(1, +e.target.value || 1)))} className="bg-white max-w-xs" />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-emerald-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-emerald-800 capitalize text-base">2. Créneau — {format(calMonth, "MMMM yyyy", { locale: fr })}</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setCalMonth(addMonths(calMonth, -1))}>‹</Button>
                    <Button size="sm" variant="outline" onClick={() => setCalMonth(addMonths(calMonth, 1))}>›</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1 text-xs text-center text-amber-800/70 mb-1">
                    {["L","M","M","J","V","S","D"].map((d, i) => <div key={i}>{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: (startOfMonth(calMonth).getDay() + 6) % 7 }).map((_, i) => <div key={`pad-${i}`} />)}
                    {daysOfMonth.map((d) => {
                      const key = format(d, "yyyy-MM-dd");
                      const hasSlots = !!slotsByDay[key]?.length;
                      const isSel = selectedDay && isSameDay(d, selectedDay);
                      return (
                        <button key={key} onClick={() => hasSlots && setSelectedDay(d)} disabled={!hasSlots}
                          className={`aspect-square rounded-md text-sm flex items-center justify-center transition
                            ${hasSlots ? "bg-emerald-100 text-emerald-900 hover:bg-emerald-200 cursor-pointer font-semibold" : "text-gray-300 cursor-not-allowed"}
                            ${isSel ? "ring-2 ring-amber-700" : ""}`}>
                          {format(d, "d")}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {selectedDay && (
                <Card className="border-amber-200">
                  <CardHeader><CardTitle className="text-amber-800 capitalize">{format(selectedDay, "EEEE d MMMM yyyy", { locale: fr })}</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {(slotsByDay[format(selectedDay, "yyyy-MM-dd")] || []).map((s) => (
                      <button key={s.id} onClick={() => setSelectedSlot(s)}
                        className="w-full text-left p-3 rounded border border-emerald-200 bg-white hover:bg-emerald-50 flex items-center justify-between">
                        <span className="font-medium text-emerald-900">{s.start_time.slice(0,5)} – {s.end_time.slice(0,5)}</span>
                        <ChevronRight className="h-4 w-4 text-emerald-700" />
                      </button>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Card className="border-emerald-100 bg-white">
                <CardHeader><CardTitle className="text-emerald-800 text-base">Mes réservations</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {sessions.length === 0 && <p className="text-sm text-amber-800/70">Aucune réservation pour le moment.</p>}
                  {sessions.map((s) => {
                    const ti = getSessionType(s.session_type);
                    return (
                      <div key={s.id} className="p-3 rounded bg-emerald-50/50 space-y-2">
                        <div className="flex items-center justify-between text-sm flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <Badge className={`${ti.badgeBg} ${ti.badgeText} border-0`}>{ti.icon} {ti.label}{s.session_type === "khatm_partiel" && s.juz_number ? ` Juz ${s.juz_number}` : ""}</Badge>
                            <span className="font-medium">{format(parseISO(s.session_date), "d MMM yyyy", { locale: fr })} · {s.session_time.slice(0,5)}</span>
                          </div>
                          <Badge variant="outline" className={
                            s.status === "confirmee" ? "border-emerald-700 text-emerald-800 bg-emerald-100" :
                            s.status === "annulee" ? "border-red-600 text-red-700 bg-red-50" :
                            s.status === "effectuee" ? "border-amber-700 text-amber-800 bg-amber-50" :
                            "border-amber-700 text-amber-800"
                          }>
                            {s.status === "en_attente" ? "En attente" : s.status === "confirmee" ? "Confirmée ✅" : s.status === "annulee" ? "Annulée" : s.status === "effectuee" ? "Effectuée" : s.status}
                          </Badge>
                        </div>
                        {s.status === "confirmee" && s.meet_link && (
                          <a href={/^https?:\/\//i.test(s.meet_link) ? s.meet_link : `https://${s.meet_link}`} target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium py-2 px-3 rounded transition">
                            🎥 Rejoindre la séance Google Meet
                          </a>
                        )}
                        {s.status === "confirmee" && !s.meet_link && (
                          <p className="text-xs text-amber-800/70 italic">Le lien Meet sera ajouté par votre professeur.</p>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ─── Historique ─── */}
            <TabsContent value="historique" className="mt-6">
              <Card className="border-emerald-200">
                <CardContent className="pt-6">
                  {sessions.length === 0 ? (
                    <p className="text-center text-amber-800/70 py-8">Aucune session enregistrée.</p>
                  ) : (
                    <Accordion type="single" collapsible className="space-y-2">
                      {sessions.map((s) => {
                        const evs = evaluations.filter((e) => e.session_id === s.id);
                        const ti = getSessionType(s.session_type);
                        return (
                          <AccordionItem key={s.id} value={s.id} className="border border-emerald-200 rounded-lg bg-white px-4">
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center justify-between w-full pr-2 text-left gap-2">
                                <div>
                                  <div className="font-semibold text-emerald-900">{format(parseISO(s.session_date), "EEEE d MMMM yyyy", { locale: fr })}</div>
                                  <div className="text-xs text-amber-800/70">{s.session_time.slice(0,5)} · {s.status}</div>
                                </div>
                                <div className="flex flex-col gap-1 items-end">
                                  <Badge className={`${ti.badgeBg} ${ti.badgeText} border-0 text-[10px]`}>{ti.icon} {ti.label}</Badge>
                                  <Badge variant="outline" className="border-amber-700 text-amber-800 text-[10px]">{evs.length} hizb</Badge>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              {evs.length === 0 ? <p className="text-sm text-gray-500 py-2">Pas encore d'évaluation.</p> : (
                                <div className="space-y-2 pt-2">
                                  {evs.map((e) => (
                                    <div key={e.id} className="p-3 rounded border border-emerald-100 bg-emerald-50/40">
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium">Hizb {e.hizb_number}</span>
                                        {e.status === "valide" ? (
                                          <Badge className="bg-emerald-700 text-white">{NIVEAU_LABEL[e.niveau || ""] || "Validé"}</Badge>
                                        ) : (<Badge className="bg-red-600 text-white">À retravailler</Badge>)}
                                      </div>
                                      {e.notes && <p className="text-sm text-gray-700 mt-1">{e.notes}</p>}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>

      <Dialog open={!!selectedSlot} onOpenChange={(o) => !o && setSelectedSlot(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-emerald-800">Confirmer la réservation</DialogTitle></DialogHeader>
          {selectedSlot && (
            <div className="space-y-3">
              <Badge className={`${getSessionType(bookingType).badgeBg} ${getSessionType(bookingType).badgeText} border-0`}>
                {getSessionType(bookingType).icon} {getSessionType(bookingType).label}
                {bookingType === "khatm_partiel" ? ` — Juz ${bookingJuz}` : ""}
              </Badge>
              <p className="text-sm">
                <strong>{format(parseISO(selectedSlot.slot_date), "EEEE d MMMM yyyy", { locale: fr })}</strong>
                {" · "}{selectedSlot.start_time.slice(0,5)} – {selectedSlot.end_time.slice(0,5)}
              </p>
              <div>
                <Label>Message (optionnel)</Label>
                <Textarea value={bookingMessage} onChange={(e) => setBookingMessage(e.target.value)} placeholder="Précisions pour votre professeur..." />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedSlot(null)}>Annuler</Button>
            <Button onClick={confirmBooking} disabled={booking} className="bg-emerald-700 hover:bg-emerald-800 text-white">
              {booking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-2xl font-bold text-emerald-800">{value}</div>
      <div className="text-xs text-amber-800/80">{label}</div>
    </div>
  );
}

function UpsellPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#fdf8ef]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-emerald-700 to-amber-700 flex items-center justify-center mb-6">
          <Lock className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-emerald-800 mb-3">Hifd al-Qur'ān</h1>
        <p className="text-lg text-amber-800/80 mb-8">Le programme de mémorisation guidé est réservé aux abonnés <strong>Hifz</strong> ou <strong>Premium</strong>.</p>
        <Button size="lg" onClick={() => navigate("/tarifs")} className="bg-gradient-to-r from-emerald-700 to-amber-700 text-white hover:opacity-90">
          <Crown className="h-5 w-5 mr-2" /> Voir les plans
        </Button>
      </div>
    </div>
  );
}

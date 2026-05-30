import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Crown, Lock, Sparkles, BookOpen, CheckCircle2, Loader2, ChevronRight,
  Moon, Sunrise, Sun, GraduationCap, RotateCcw, Target,
  CalendarDays, Clock, TrendingUp, Star, AlertCircle, CalendarCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
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
// Spaced repetition intervals in days per niveau
const REVISION_INTERVALS: Record<string, number> = { mediocre: 1, moyen: 3, bon: 7, excellent: 14 };
const NIVEAU_BG: Record<string, string> = { excellent: "bg-emerald-700", bon: "bg-emerald-500", moyen: "bg-amber-500", mediocre: "bg-red-500" };
const STATUS_LABEL: Record<string, string> = { en_attente: "En attente", confirmee: "Confirmée", effectuee: "Effectuée", annulee: "Annulée" };
const STATUS_CARD: Record<string, string> = {
  en_attente: "border-amber-200 bg-amber-50/40",
  confirmee: "border-emerald-200 bg-emerald-50/40",
  effectuee: "border-violet-200 bg-violet-50/20",
  annulee: "border-red-100 bg-red-50/20 opacity-60",
};
const STATUS_BORDER: Record<string, string> = {
  confirmee: "border-l-emerald-400",
  effectuee: "border-l-violet-400",
  annulee: "border-l-red-300",
  en_attente: "border-l-amber-300",
};

// ─── Circular progress SVG ──────────────────────────────────────────────────
function CircleProgress({ percent }: { percent: number }) {
  const r = 15.9;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
      <circle cx="18" cy="18" r={r} fill="none" stroke="#d1fae5" strokeWidth="3" />
      <circle cx="18" cy="18" r={r} fill="none" stroke="#15803d" strokeWidth="3"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
    </svg>
  );
}

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

  const [memoCount, setMemoCount] = useState(0);
  const [duration, setDuration] = useState(16);
  const [submitting, setSubmitting] = useState(false);

  const [calMonth, setCalMonth] = useState(startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingType, setBookingType] = useState<HifzSessionType>("sabaq");
  const [bookingJuz, setBookingJuz] = useState<number>(1);
  const [booking, setBooking] = useState(false);


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
      byDate[format(parseISO(e.evaluated_at), "dd/MM")] = seen.size + initialMemo;
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
      result.push({ month: m + 1, label: format(addMonths(parseISO(config.start_date), m), "MMMM yyyy", { locale: fr }), hizb });
    }
    return result;
  }, [config, remainingHizb]);

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

  const revisionSchedule = useMemo(() => {
    // Latest evaluation per hizb (any session type)
    const latestByHizb: Record<number, Evaluation> = {};
    for (const e of evaluations) {
      const cur = latestByHizb[e.hizb_number];
      if (!cur || new Date(e.evaluated_at) > new Date(cur.evaluated_at)) latestByHizb[e.hizb_number] = e;
    }
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return Object.entries(latestByHizb)
      .map(([h, ev]) => {
        const niveau = ev.niveau || "moyen";
        const interval = REVISION_INTERVALS[niveau] ?? 7;
        const last = new Date(ev.evaluated_at); last.setHours(0, 0, 0, 0);
        const daysSince = Math.floor((today.getTime() - last.getTime()) / 86_400_000);
        const daysUntilDue = interval - daysSince;
        return { hizb: +h, niveau, daysUntilDue, lastEval: ev, isDue: daysUntilDue <= 0 };
      })
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  }, [evaluations]);

  const dueNow = revisionSchedule.filter(r => r.isDue);
  const upcomingRevision = revisionSchedule.filter(r => !r.isDue).slice(0, 5);

  // Recommended sessions/week based on average niveau weight
  const recommendedPerWeek = useMemo(() => {
    const latest: Record<number, Evaluation> = {};
    for (const e of evaluations) {
      const cur = latest[e.hizb_number];
      if (!cur || new Date(e.evaluated_at) > new Date(cur.evaluated_at)) latest[e.hizb_number] = e;
    }
    const weights = Object.values(latest).filter(e => e.niveau).map(e => NIVEAU_WEIGHT[e.niveau!] || 0);
    if (!weights.length) return 1;
    const avg = weights.reduce((a, b) => a + b, 0) / weights.length;
    return avg < 2.5 ? 2 : 1;
  }, [evaluations]);

  // Sessions booked or confirmed in the current week (Mon–Sun)
  const sessionsThisWeek = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return sessions.filter(s => {
      const d = parseISO(s.session_date);
      return d >= monday && d <= sunday && (s.status === "en_attente" || s.status === "confirmee");
    });
  }, [sessions]);


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
    if (!confirm("Réinitialiser votre programme ? Cette action est irréversible.")) return;
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
    toast({ title: "Réservation enregistrée ✓", description: "Vous recevrez un email de confirmation." });
    fetchAll();
  };

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdf8ef]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
      </div>
    );
  }
  if (!user) return null;
  if (!isHifz && !isPremium) return <UpsellPage />;

  // Preview calculations for onboarding form
  const previewRemaining = TOTAL_HIZB - memoCount;
  const previewPages = previewRemaining * PAGES_PER_HIZB;
  const previewPace = previewPages > 0 ? +(previewPages / (duration * 30)).toFixed(2) : 0;
  const previewEnd = format(addMonths(new Date(), duration), "MMMM yyyy", { locale: fr });
  const paceColor = previewPace > 2 ? "red" : previewPace > 1 ? "amber" : "emerald";

  // Booking dialog data (extracted to avoid IIFE in JSX)
  const bookingTi = getSessionType(bookingType);
  const upcomingCount = sessions.filter(s => s.status === "en_attente" || s.status === "confirmee").length;

  // Cadence banner (extracted to avoid IIFE in JSX)
  const cadenceBannerData = sessionsThisWeek.length > 0 ? (() => {
    const count = sessionsThisWeek.length;
    const target = recommendedPerWeek;
    const isOver = count > target;
    const isAt = count === target;
    return { count, target, isOver, isAt };
  })() : null;

  // Does current calendar month have any available slots?
  const currentMonthHasSlots = daysOfMonth.some(d => !!slotsByDay[format(d, "yyyy-MM-dd")]?.length);

  // Split sessions into upcoming and past
  const upcomingSessions = sessions.filter(s => s.status === "en_attente" || s.status === "confirmee");
  const pastSessions = sessions.filter(s => s.status === "effectuee" || s.status === "annulee");

  return (
    <div className="min-h-screen bg-[#fdf8ef]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-12">

        {/* ─── Header ─── */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-700 to-amber-700 flex items-center justify-center shadow-lg shrink-0">
            <BookOpen className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-emerald-900 leading-tight">Hifd al-Qur'ān</h1>
            <p className="text-sm text-amber-800/70 mt-0.5">Programme de mémorisation personnalisé</p>
          </div>
          {config && (
            <div className="hidden sm:flex items-center gap-3 bg-white border border-emerald-100 rounded-2xl px-4 py-2.5 shadow-sm shrink-0">
              <div className="text-right">
                <div className="text-xl font-bold text-emerald-800">{progressPercent}%</div>
                <div className="text-xs text-amber-800/50">mémorisé</div>
              </div>
              <div className="relative flex items-center justify-center">
                <CircleProgress percent={progressPercent} />
                <span className="absolute text-[10px] font-bold text-emerald-700">{totalMemorized}/{TOTAL_HIZB}</span>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
            <p className="text-sm text-amber-800/60">Chargement de votre programme…</p>
          </div>
        ) : (
          <Tabs value={tab} onValueChange={setTab} className="w-full">

            {/* ─── Tab navigation ─── */}
            <TabsList className="flex w-full bg-white border border-emerald-100 rounded-xl h-auto p-1 gap-0.5 shadow-sm overflow-x-auto mb-2">
              {[
                { value: "programme", icon: Target, label: "Programme" },
{ value: "methode", icon: BookOpen, label: "Méthode" },
                { value: "reserver", icon: CalendarDays, label: "Réserver", badge: upcomingCount || undefined },
                { value: "historique", icon: Clock, label: "Historique" },
              ].map(({ value, icon: Icon, label, badge }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 px-2 rounded-lg min-w-[80px]
                    data-[state=active]:bg-emerald-700 data-[state=active]:text-white data-[state=active]:shadow-sm
                    text-amber-900/60 hover:text-amber-900 transition-colors whitespace-nowrap relative"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{label}</span>
                  {badge ? (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] flex items-center justify-center font-bold">
                      {badge}
                    </span>
                  ) : null}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* ═══════════════════════════════════════════════════════════════
                PROGRAMME
            ═══════════════════════════════════════════════════════════════ */}
            <TabsContent value="programme" className="mt-4">
              {!config ? (
                /* ── Onboarding form ── */
                <Card className="border-emerald-200 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-emerald-800 text-xl">Créer votre programme</CardTitle>
                    <p className="text-sm text-amber-800/60">L'aperçu se met à jour en temps réel selon vos choix.</p>
                  </CardHeader>
                  <CardContent className="space-y-7">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Hizb déjà mémorisés <span className="text-xs text-amber-800/50 font-normal">(depuis An-Nas = hizb 1)</span></Label>
                        <span className="text-2xl font-bold text-emerald-800 tabular-nums">
                          {memoCount}<span className="text-sm font-normal text-amber-800/50"> / 60</span>
                        </span>
                      </div>
                      <Slider value={[memoCount]} onValueChange={([v]) => setMemoCount(v)} min={0} max={60} step={1} />
                      <div className="flex justify-between text-xs text-amber-800/40">
                        <span>0 hizb</span>
                        <span>Coran complet (60 hizb)</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Durée souhaitée</Label>
                      <div className="flex gap-2 flex-wrap items-center">
                        {[6, 12, 18, 24, 36].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setDuration(m)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                              duration === m
                                ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                                : "bg-white text-emerald-800 border-emerald-200 hover:border-emerald-400"
                            }`}
                          >
                            {m} mois
                          </button>
                        ))}
                        <Input
                          type="number" min={1} max={120} value={duration}
                          onChange={(e) => setDuration(Math.max(1, +e.target.value || 1))}
                          className="bg-white w-24 h-9 text-sm"
                        />
                      </div>
                    </div>

                    {memoCount < 60 ? (
                      <div className={`rounded-xl p-5 border-2 ${
                        paceColor === "red" ? "bg-red-50 border-red-200" :
                        paceColor === "amber" ? "bg-amber-50 border-amber-200" :
                        "bg-emerald-50 border-emerald-200"
                      }`}>
                        <p className={`text-xs font-semibold uppercase tracking-widest mb-4 ${
                          paceColor === "red" ? "text-red-600" : paceColor === "amber" ? "text-amber-600" : "text-emerald-700"
                        }`}>Aperçu de votre programme</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mb-4">
                          <div>
                            <div className="text-2xl font-bold text-emerald-800">{previewRemaining}</div>
                            <div className="text-xs text-amber-800/60 mt-0.5">Hizb restants</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-emerald-800">{previewPages}</div>
                            <div className="text-xs text-amber-800/60 mt-0.5">Pages restantes</div>
                          </div>
                          <div>
                            <div className={`text-2xl font-bold ${
                              paceColor === "red" ? "text-red-600" : paceColor === "amber" ? "text-amber-600" : "text-emerald-800"
                            }`}>{previewPace}</div>
                            <div className="text-xs text-amber-800/60 mt-0.5">Pages / jour</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-emerald-800 capitalize">{previewEnd}</div>
                            <div className="text-xs text-amber-800/60 mt-0.5">Fin estimée</div>
                          </div>
                        </div>
                        <div className={`flex items-center gap-2 text-xs justify-center ${
                          paceColor === "red" ? "text-red-600" : paceColor === "amber" ? "text-amber-700" : "text-emerald-700"
                        }`}>
                          {paceColor === "red" && <><AlertCircle className="h-3.5 w-3.5 shrink-0" /> Rythme très intensif — augmentez la durée pour un hifd solide.</>}
                          {paceColor === "amber" && <><TrendingUp className="h-3.5 w-3.5 shrink-0" /> Rythme soutenu — prévoyez du temps chaque jour.</>}
                          {paceColor === "emerald" && <><CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> Rythme idéal pour une mémorisation solide et durable.</>}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl p-5 bg-amber-50 border-2 border-amber-200 text-center space-y-1">
                        <Star className="h-8 w-8 text-amber-500 mx-auto" />
                        <p className="text-amber-900 font-semibold">ما شاء الله — Vous avez mémorisé le Coran complet !</p>
                        <p className="text-xs text-amber-800/60">Créez un programme de révision pour maintenir votre hifd.</p>
                      </div>
                    )}

                    <Button onClick={handleGenerate} disabled={submitting} size="lg" className="w-full bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm">
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                      Générer mon programme
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                /* ── Programme actif ── */
                <div className="space-y-4">
                  {/* Stats + progress */}
                  <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-amber-50/60 shadow-sm">
                    <CardContent className="pt-6 space-y-5">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard icon={BookOpen} label="Hizb mémorisés" value={`${totalMemorized}/${TOTAL_HIZB}`} color="emerald" />
                        <StatCard icon={Target} label="Hizb restants" value={remainingHizb} color="amber" />
                        <StatCard icon={TrendingUp} label="Pages restantes" value={remainingPages} color="amber" />
                        <StatCard icon={CalendarCheck} label="Rythme" value={`${pacePerDay} p/j`} color="emerald" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-amber-800/70">
                          <span>Progression globale</span>
                          <span className="font-semibold">{progressPercent}% · {memorizedPages} pages mémorisées</span>
                        </div>
                        <Progress value={progressPercent} className="h-2.5 rounded-full" />
                      </div>

                      {/* Option A — cadence recommandée */}
                      <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${recommendedPerWeek === 2 ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"}`}>
                        <div className="flex items-center gap-2">
                          <CalendarDays className={`h-4 w-4 ${recommendedPerWeek === 2 ? "text-amber-600" : "text-emerald-600"}`} />
                          <span className="text-sm font-medium text-gray-800">Cadence recommandée</span>
                          <span className={`text-xs ${recommendedPerWeek === 2 ? "text-amber-700" : "text-emerald-700"}`}>
                            {evaluations.length === 0 ? "Basée sur vos premières évaluations" : recommendedPerWeek === 2 ? "Des hizb nécessitent plus de travail" : "Bonne progression générale"}
                          </span>
                        </div>
                        <Badge className={`shrink-0 font-bold ${recommendedPerWeek === 2 ? "bg-amber-500 text-white" : "bg-emerald-600 text-white"}`}>
                          {recommendedPerWeek}× / semaine
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Révision prioritaire */}
                  {revisionSchedule.length > 0 && (
                    <Card className={`shadow-sm border-2 ${dueNow.length > 0 ? "border-amber-300 bg-amber-50/40" : "border-emerald-200 bg-emerald-50/30"}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2 text-emerald-800">
                            <CalendarCheck className="h-4 w-4" /> Révision prioritaire du jour
                          </CardTitle>
                          {dueNow.length > 0 ? (
                            <Badge className="bg-amber-500 text-white">{dueNow.length} à réviser</Badge>
                          ) : (
                            <Badge className="bg-emerald-600 text-white">✓ À jour</Badge>
                          )}
                        </div>
                        <p className="text-xs text-amber-800/60 mt-0.5">
                          Basé sur la répétition espacée : Médiocre = J+1 · Moyen = J+3 · Bon = J+7 · Excellent = J+14
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {dueNow.length === 0 ? (
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-100/60 border border-emerald-200">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-emerald-800">Tous vos hizb sont à jour !</p>
                              <p className="text-xs text-emerald-700/70">Le prochain hizb à réviser est le <strong>Hizb {upcomingRevision[0]?.hizb}</strong> dans {upcomingRevision[0]?.daysUntilDue} jour{upcomingRevision[0]?.daysUntilDue > 1 ? "s" : ""}.</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                            {dueNow.map((r) => {
                              const overdue = Math.abs(r.daysUntilDue);
                              const isVeryLate = overdue > 3;
                              return (
                                <div key={r.hizb} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${isVeryLate ? "border-red-200 bg-red-50/60" : "border-amber-200 bg-amber-50/60"}`}>
                                  <div className="flex items-center gap-2.5">
                                    <span className={`text-sm font-bold ${isVeryLate ? "text-red-700" : "text-amber-800"}`}>Hizb {r.hizb}</span>
                                    <Badge className={`text-[10px] border-0 ${NIVEAU_BG[r.niveau] ?? "bg-gray-400"} text-white`}>
                                      {NIVEAU_LABEL[r.niveau] ?? r.niveau}
                                    </Badge>
                                  </div>
                                  <span className={`text-xs font-semibold ${isVeryLate ? "text-red-600" : "text-amber-700"}`}>
                                    {overdue === 0 ? "Aujourd'hui" : `${overdue}j de retard`}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {upcomingRevision.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">À venir</p>
                            <div className="flex flex-wrap gap-1.5">
                              {upcomingRevision.map((r) => (
                                <div key={r.hizb} className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs text-gray-500">
                                  <span className="font-medium text-gray-700">Hizb {r.hizb}</span>
                                  <span>·</span>
                                  <span>dans {r.daysUntilDue}j</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Chart */}
                  <Card className="border-emerald-200 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-emerald-800 text-base flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" /> Évolution de la mémorisation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {progressChartData.length <= 1 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                          <TrendingUp className="h-10 w-10 text-emerald-200" />
                          <p className="text-sm text-amber-800/60">Le graphique apparaîtra dès que vos premiers hizb seront validés.</p>
                        </div>
                      ) : (
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={progressChartData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e7d9b8" />
                              <XAxis dataKey="date" stroke="#92400e" fontSize={11} />
                              <YAxis stroke="#92400e" fontSize={11} domain={[0, TOTAL_HIZB]} />
                              <Tooltip contentStyle={{ background: "#fdf8ef", border: "1px solid #15803d", borderRadius: 10, fontSize: 12 }} />
                              <Legend wrapperStyle={{ fontSize: 12 }} />
                              <Line type="monotone" dataKey="memorisés" stroke="#15803d" strokeWidth={2.5} dot={{ r: 3, fill: "#15803d" }} />
                              <Line type="monotone" dataKey="restants" stroke="#d97706" strokeWidth={2} dot={{ r: 3, fill: "#d97706" }} strokeDasharray="4 2" />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Monthly plan */}
                  <Accordion type="single" collapsible className="space-y-2">
                    {monthlyPlan.map((m) => {
                      const doneCount = m.hizb.filter(h => validatedHizbNumbers.has(h)).length;
                      const monthPct = m.hizb.length > 0 ? Math.round((doneCount / m.hizb.length) * 100) : 0;
                      return (
                        <AccordionItem key={m.month} value={`m-${m.month}`} className="border border-emerald-200 rounded-xl bg-white px-4 shadow-sm">
                          <AccordionTrigger className="hover:no-underline py-3">
                            <div className="flex items-center justify-between w-full pr-2">
                              <div>
                                <span className="font-semibold text-emerald-800 capitalize">Mois {m.month} · {m.label}</span>
                                {doneCount > 0 && (
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <Progress value={monthPct} className="h-1.5 w-20" />
                                    <span className="text-xs text-emerald-700">{doneCount}/{m.hizb.length}</span>
                                  </div>
                                )}
                              </div>
                              <Badge variant="outline" className="border-amber-300 text-amber-800 shrink-0">{m.hizb.length} hizb</Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 pb-1">
                              {m.hizb.map((h) => {
                                const byType = evalByHizbByType[h] || {};
                                const types = Object.keys(byType);
                                const isValidated = validatedHizbNumbers.has(h);
                                return (
                                  <div key={h} className={`flex items-center justify-between p-3 rounded-lg border gap-2 transition-colors ${
                                    isValidated ? "border-emerald-200 bg-emerald-50/60" : "border-gray-100 bg-gray-50/50"
                                  }`}>
                                    <div className="flex items-center gap-2">
                                      {isValidated
                                        ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                        : <div className="h-4 w-4 rounded-full border-2 border-gray-200 shrink-0" />
                                      }
                                      <span className="font-medium text-sm">Hizb {h}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1 justify-end">
                                      {types.length === 0 ? (
                                        <Badge variant="secondary" className="bg-gray-100 text-gray-500 text-[10px] font-normal">Non évalué</Badge>
                                      ) : types.map((t) => {
                                        const ev = byType[t];
                                        const ti = getSessionType(t);
                                        return (
                                          <Badge key={t} className={`${ti.badgeBg} ${ti.badgeText} text-[10px] border-0`}>
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
                      );
                    })}
                  </Accordion>

                  <Button variant="outline" onClick={handleReset} className="border-amber-300 text-amber-800 hover:bg-amber-50 text-sm">
                    <RotateCcw className="h-3.5 w-3.5 mr-2" /> Réinitialiser mon programme
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* ═══════════════════════════════════════════════════════════════
                VUE GLOBALE
            ═══════════════════════════════════════════════════════════════ */}
            {/* ═══════════════════════════════════════════════════════════════
                MÉTHODE
            ═══════════════════════════════════════════════════════════════ */}
            <TabsContent value="methode" className="mt-4 space-y-5">
              <div className="text-center space-y-1 py-2">
                <h2 className="text-2xl font-bold text-emerald-800">La méthode pakistanaise du Hifd</h2>
                <p className="text-sm text-amber-800/70">3 piliers · 6 types de sessions · Un hifd solide à vie</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: BookOpen, color: "emerald", title: "📗 SABAQ", arabic: "سَبَق", badge: "Chaque jour", desc: "La nouvelle leçon. Répéter 10× la nuit, 5× le matin.", note: "Ne jamais avancer sans validation du professeur." },
                  { icon: RotateCcw, color: "amber", title: "📙 SABAQ PARA", arabic: "سَبَق پارَه", badge: "Chaque matin", desc: "Les hizb des 7 derniers jours récités sans mushaf. Le filet de sécurité.", note: null },
                  { icon: GraduationCap, color: "violet", title: "📘 DHOR", arabic: "دَوْر", badge: "Rotation quotidienne", desc: "Les anciens hizb. 1 hizb/jour minimum. Le pilier du hifd à vie.", note: null },
                ].map(({ icon: Icon, color, title, arabic, badge, desc, note }) => (
                  <Card key={title} className={`border-l-4 border-l-${color}-500 border-${color}-100 bg-${color}-50/30`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 text-${color}-700`} />
                        <CardTitle className={`text-${color}-800 text-base`}>{title}</CardTitle>
                      </div>
                      <p className={`text-2xl font-arabic text-${color}-700 leading-none mt-1`}>{arabic}</p>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <Badge className={`bg-${color}-${color === "violet" ? "600" : "700"} text-white text-xs`}>{badge}</Badge>
                      <p className="text-gray-700">{desc}</p>
                      {note && <p className={`text-${color}-700 font-medium text-xs`}>{note}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="border-emerald-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-emerald-800 text-base">🗓 Planning quotidien recommandé</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { icon: Moon, color: "emerald", time: "Avant Fajr", session: "SABAQ", desc: `Nouvelles pages · Répéter 10×${pacePerDay > 0 ? ` · ${pacePerDay} pages/jour` : ""}` },
                    { icon: Sunrise, color: "amber", time: "Dhuha", session: "SABAQ PARA", desc: "7 derniers jours sans mushaf · 20-30 min" },
                    { icon: Sun, color: "violet", time: "Avant Asr", session: "DHOR", desc: "1 ancien hizb · 15-20 min" },
                    { icon: Moon, color: "amber", time: "Maghrib / Isha", session: "TEST EN SALAT", desc: "Réciter les nouvelles pages dans la prière" },
                  ].map(({ icon: Icon, color, time, session, desc }) => (
                    <div key={session} className={`flex items-start gap-3 p-3 rounded-xl border-l-4 border-l-${color}-${color === "violet" ? "500" : "400"} bg-${color}-50/30 border border-${color}-100`}>
                      <Icon className={`h-4 w-4 text-${color}-600 mt-0.5 shrink-0`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold text-${color}-800 uppercase tracking-wide`}>{time}</span>
                          <span className="text-xs text-gray-400">→</span>
                          <span className={`text-xs font-semibold text-${color}-700`}>{session}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-emerald-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-emerald-800 text-base">📋 Les 6 types de sessions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {HIFZ_SESSION_TYPES.map((t, i) => {
                    const freq = ["Hebdomadaire", "Bi-mensuel", "Mensuel", "À la demande", "Mensuel", "Bi-mensuel"][i];
                    return (
                      <div key={t.value} className={`p-3 rounded-xl border ${t.border} ${t.bgSoft} flex items-center justify-between gap-2`}>
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{t.icon}</span>
                          <div>
                            <span className="font-semibold text-sm">{t.label}</span>
                            <p className="text-xs text-gray-500">{t.long}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0">{freq}</Badge>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <div className="text-center space-y-2 py-6">
                <p className="text-3xl font-arabic text-emerald-700 leading-relaxed">اللَّهُمَّ انْفَعْنِي بِمَا عَلَّمْتَنِي</p>
                <p className="text-sm text-amber-800/70 italic">"Ô Allah, fais-moi profiter de ce que Tu m'as enseigné"</p>
              </div>
            </TabsContent>

            {/* ═══════════════════════════════════════════════════════════════
                RÉSERVER
            ═══════════════════════════════════════════════════════════════ */}
            <TabsContent value="reserver" className="mt-4 space-y-6">

              {/* Cadence banner */}
              {cadenceBannerData && (
                <div className={`flex items-center gap-3 p-4 rounded-xl border-2 ${
                  cadenceBannerData.isOver ? "bg-amber-50 border-amber-300" :
                  cadenceBannerData.isAt  ? "bg-emerald-50 border-emerald-300" :
                                            "bg-sky-50 border-sky-200"
                }`}>
                  <CalendarCheck className={`h-5 w-5 shrink-0 ${cadenceBannerData.isOver ? "text-amber-600" : cadenceBannerData.isAt ? "text-emerald-600" : "text-sky-500"}`} />
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${cadenceBannerData.isOver ? "text-amber-800" : cadenceBannerData.isAt ? "text-emerald-800" : "text-sky-800"}`}>
                      {cadenceBannerData.isOver && `Cadence dépassée — ${cadenceBannerData.count} séance${cadenceBannerData.count > 1 ? "s" : ""} réservée${cadenceBannerData.count > 1 ? "s" : ""} cette semaine`}
                      {cadenceBannerData.isAt && `Objectif atteint — ${cadenceBannerData.count} séance${cadenceBannerData.count > 1 ? "s" : ""} cette semaine ✓`}
                      {!cadenceBannerData.isOver && !cadenceBannerData.isAt && `${cadenceBannerData.count} séance${cadenceBannerData.count > 1 ? "s" : ""} réservée${cadenceBannerData.count > 1 ? "s" : ""} cette semaine`}
                    </p>
                    <p className={`text-xs mt-0.5 ${cadenceBannerData.isOver ? "text-amber-700" : cadenceBannerData.isAt ? "text-emerald-700" : "text-sky-600"}`}>
                      {cadenceBannerData.isOver
                        ? `Programme recommande ${cadenceBannerData.target}×/semaine — veillez à ne pas surcharger.`
                        : cadenceBannerData.isAt
                        ? `Parfait, vous êtes dans la cadence recommandée (${cadenceBannerData.target}×/semaine).`
                        : `Objectif : ${cadenceBannerData.target} séance${cadenceBannerData.target > 1 ? "s" : ""}/semaine selon votre progression.`
                      }
                    </p>
                  </div>
                  <span className={`text-xl font-bold tabular-nums shrink-0 ${cadenceBannerData.isOver ? "text-amber-600" : cadenceBannerData.isAt ? "text-emerald-600" : "text-sky-500"}`}>
                    {cadenceBannerData.count}/{cadenceBannerData.target}
                  </span>
                </div>
              )}

              {/* ① Type de session */}
              <section className="space-y-3">
                <SectionHeader step={1} title="Type de session" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {HIFZ_SESSION_TYPES.map((t) => {
                    const isSelected = bookingType === t.value;
                    return (
                      <button
                        key={t.value}
                        onClick={() => setBookingType(t.value)}
                        className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? `${t.border} ${t.bgSoft} shadow-md ring-2 ring-offset-1 ring-emerald-300`
                            : "border-gray-100 bg-white hover:border-emerald-200 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-3xl leading-none mt-0.5">{t.icon}</span>
                          {isSelected && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          )}
                        </div>
                        <p className="font-bold text-sm text-gray-800 mt-2">{t.label}</p>
                        <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{t.description}</p>
                      </button>
                    );
                  })}
                </div>

                {bookingType === "khatm_partiel" && (
                  <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-200 space-y-2">
                    <Label className="text-amber-800 text-sm font-semibold">Quel juz ? (1 à 30)</Label>
                    <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5">
                      {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
                        <button
                          key={j}
                          type="button"
                          onClick={() => setBookingJuz(j)}
                          className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                            bookingJuz === j
                              ? "bg-amber-600 text-white shadow-sm"
                              : "bg-white border border-amber-200 text-amber-800 hover:bg-amber-100"
                          }`}
                        >
                          {j}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-amber-700">Juz {bookingJuz} sélectionné</p>
                  </div>
                )}
              </section>

              {/* ② Choisir un créneau */}
              <section className="space-y-3">
                <SectionHeader step={2} title="Choisir un créneau" />
                <Card className="border-emerald-200 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-emerald-800 capitalize text-base">
                      {format(calMonth, "MMMM yyyy", { locale: fr })}
                    </CardTitle>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => setCalMonth(addMonths(calMonth, -1))}>‹</Button>
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => setCalMonth(addMonths(calMonth, 1))}>›</Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-amber-800/50 uppercase tracking-wide">
                      {["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map((d) => <div key={d}>{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: (startOfMonth(calMonth).getDay() + 6) % 7 }).map((_, i) => <div key={`pad-${i}`} />)}
                      {daysOfMonth.map((d) => {
                        const key = format(d, "yyyy-MM-dd");
                        const hasSlots = !!slotsByDay[key]?.length;
                        const isSel = selectedDay && isSameDay(d, selectedDay);
                        return (
                          <button
                            key={key}
                            onClick={() => hasSlots && setSelectedDay(d)}
                            disabled={!hasSlots}
                            className={`relative aspect-square rounded-lg text-sm flex flex-col items-center justify-center transition-all font-medium
                              ${isSel ? "bg-emerald-700 text-white shadow-md scale-105" :
                                hasSlots ? "bg-emerald-100 text-emerald-900 hover:bg-emerald-200 cursor-pointer" :
                                "text-gray-200 cursor-not-allowed"}
                            `}
                          >
                            {format(d, "d")}
                            {hasSlots && !isSel && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-500" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Légende */}
                    <div className="flex items-center gap-4 pt-1 border-t border-gray-100 text-xs text-gray-400">
                      <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-100" /><span>Disponible</span></div>
                      <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-700" /><span>Sélectionné</span></div>
                    </div>

                    {/* Pas de créneaux ce mois-ci */}
                    {!currentMonthHasSlots && (
                      <div className="flex flex-col items-center gap-2 py-4 text-center">
                        <p className="text-sm text-amber-800/50">Aucun créneau disponible en {format(calMonth, "MMMM", { locale: fr })}.</p>
                        <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                          onClick={() => setCalMonth(addMonths(calMonth, 1))}>
                          Voir le mois suivant →
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {selectedDay && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-emerald-800 capitalize px-1">
                      {format(selectedDay, "EEEE d MMMM yyyy", { locale: fr })}
                    </p>
                    {(slotsByDay[format(selectedDay, "yyyy-MM-dd")] || []).map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSlot(s)}
                        className="w-full text-left p-4 rounded-xl border-2 border-emerald-200 bg-white hover:border-emerald-500 hover:bg-emerald-50 flex items-center justify-between transition-all group shadow-sm"
                      >
                        <div>
                          <span className="font-bold text-emerald-900 text-base">{s.start_time.slice(0,5)} – {s.end_time.slice(0,5)}</span>
                          {s.notes && <p className="text-xs text-gray-400 mt-0.5">{s.notes}</p>}
                        </div>
                        <ChevronRight className="h-5 w-5 text-emerald-400 group-hover:text-emerald-600 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* ③ Mes réservations */}
              <section className="space-y-3">
                <div className="flex items-center gap-3">
                  <SectionHeader step={3} title="Mes réservations" />
                  {upcomingCount > 0 && (
                    <Badge className="bg-amber-500 text-white">{upcomingCount} à venir</Badge>
                  )}
                </div>

                {sessions.length === 0 ? (
                  <div className="text-center py-12 rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/30">
                    <CalendarDays className="h-12 w-12 text-emerald-200 mx-auto mb-3" />
                    <p className="text-sm font-medium text-amber-800/50">Aucune réservation pour le moment</p>
                    <p className="text-xs text-amber-800/30 mt-1">Choisissez un type de session et un créneau ci-dessus.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* À venir */}
                    {upcomingSessions.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">À venir</p>
                        {upcomingSessions.map((s) => {
                          const ti = getSessionType(s.session_type);
                          return (
                            <div key={s.id} className={`p-4 rounded-xl border-2 border-l-4 ${STATUS_CARD[s.status] ?? "border-gray-200 bg-white"} ${STATUS_BORDER[s.status] ?? "border-l-gray-300"} space-y-2`}>
                              <div className="flex items-start justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge className={`${ti.badgeBg} ${ti.badgeText} border-0`}>
                                    {ti.icon} {ti.label}{s.session_type === "khatm_partiel" && s.juz_number ? ` · Juz ${s.juz_number}` : ""}
                                  </Badge>
                                  <span className="text-sm font-semibold text-gray-800">
                                    {format(parseISO(s.session_date), "EEEE d MMM", { locale: fr })} · {s.session_time.slice(0,5)}
                                  </span>
                                </div>
                                <span className="text-xs font-medium text-gray-500">{STATUS_LABEL[s.status] ?? s.status}</span>
                              </div>
                              {s.status === "confirmee" && s.meet_link && (
                                <a href={/^https?:\/\//i.test(s.meet_link) ? s.meet_link : `https://${s.meet_link}`}
                                  target="_blank" rel="noopener noreferrer"
                                  className="flex items-center justify-center gap-2 w-full bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium py-2.5 px-3 rounded-lg transition-colors">
                                  🎥 Rejoindre la séance Google Meet
                                </a>
                              )}
                              {s.status === "confirmee" && !s.meet_link && (
                                <p className="text-xs text-amber-700/80 italic">Le lien Meet sera ajouté par votre professeur avant la séance.</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Passées */}
                    {pastSessions.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">Passées</p>
                        {pastSessions.map((s) => {
                          const ti = getSessionType(s.session_type);
                          return (
                            <div key={s.id} className={`p-3 rounded-xl border ${STATUS_CARD[s.status] ?? "border-gray-100 bg-gray-50"} opacity-70`}>
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                  <Badge className={`${ti.badgeBg} ${ti.badgeText} border-0 text-[10px]`}>
                                    {ti.icon} {ti.label}
                                  </Badge>
                                  <span className="text-sm text-gray-600">
                                    {format(parseISO(s.session_date), "d MMM yyyy", { locale: fr })} · {s.session_time.slice(0,5)}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-400">{STATUS_LABEL[s.status] ?? s.status}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </section>
            </TabsContent>

            {/* ═══════════════════════════════════════════════════════════════
                HISTORIQUE
            ═══════════════════════════════════════════════════════════════ */}
            <TabsContent value="historique" className="mt-4 space-y-4">
              {sessions.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  <StatCard icon={CalendarCheck} label="Sessions effectuées" value={sessions.filter(s => s.status === "effectuee").length} color="emerald" />
                  <StatCard icon={BookOpen} label="Hizb évalués" value={new Set(evaluations.map(e => e.hizb_number)).size} color="amber" />
                  <StatCard icon={Star} label="Hizb validés" value={evaluations.filter(e => e.status === "valide").length} color="emerald" />
                </div>
              )}

              {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                  <Clock className="h-12 w-12 text-emerald-200" />
                  <p className="text-amber-800/60 font-medium">Aucune session enregistrée</p>
                  <p className="text-xs text-amber-800/40">Vos séances avec le professeur apparaîtront ici.</p>
                </div>
              ) : (
                <Accordion type="single" collapsible className="space-y-2">
                  {sessions.map((s) => {
                    const evs = evaluations.filter((e) => e.session_id === s.id);
                    const ti = getSessionType(s.session_type);
                    const validCount = evs.filter(e => e.status === "valide").length;
                    return (
                      <AccordionItem
                        key={s.id}
                        value={s.id}
                        className={`border-2 border-l-4 ${STATUS_BORDER[s.status] ?? "border-l-gray-200"} border-gray-100 rounded-xl bg-white px-4 shadow-sm`}
                      >
                        <AccordionTrigger className="hover:no-underline py-3">
                          <div className="flex items-center justify-between w-full pr-2 text-left gap-2">
                            <div>
                              <div className="font-semibold text-emerald-900 capitalize text-sm">
                                {format(parseISO(s.session_date), "EEEE d MMMM yyyy", { locale: fr })}
                              </div>
                              <div className="text-xs text-amber-800/50 mt-0.5">
                                {s.session_time.slice(0,5)} · {STATUS_LABEL[s.status] ?? s.status}
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 items-end shrink-0">
                              <Badge className={`${ti.badgeBg} ${ti.badgeText} border-0 text-[10px]`}>{ti.icon} {ti.label}</Badge>
                              {evs.length > 0 && (
                                <span className="text-[10px] text-gray-400">{validCount}/{evs.length} validés</span>
                              )}
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          {evs.length === 0 ? (
                            <p className="text-sm text-gray-400 py-3 italic text-center">Aucune évaluation enregistrée pour cette séance.</p>
                          ) : (
                            <div className="space-y-2 pt-2 pb-1">
                              {evs.map((e) => (
                                <div key={e.id} className={`p-3 rounded-lg border ${e.status === "valide" ? "border-emerald-100 bg-emerald-50/50" : "border-red-100 bg-red-50/30"}`}>
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-sm text-gray-800">Hizb {e.hizb_number}</span>
                                    {e.status === "valide" ? (
                                      <Badge className={`${NIVEAU_BG[e.niveau || ""] ?? "bg-emerald-600"} text-white text-xs`}>
                                        {NIVEAU_LABEL[e.niveau || ""] || "Validé"}
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-red-600 text-white text-xs">À retravailler</Badge>
                                    )}
                                  </div>
                                  {e.notes && (
                                    <p className="text-xs text-gray-500 mt-1.5 italic border-l-2 border-gray-200 pl-2">"{e.notes}"</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          {s.status === "confirmee" && s.meet_link && (
                            <a
                              href={/^https?:\/\//i.test(s.meet_link) ? s.meet_link : `https://${s.meet_link}`}
                              target="_blank" rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 w-full bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors mb-2"
                            >
                              🎥 Rejoindre la séance
                            </a>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              )}
            </TabsContent>

          </Tabs>
        )}
      </div>

      {/* ─── Booking dialog ─── */}
      <Dialog open={!!selectedSlot} onOpenChange={(o) => !o && setSelectedSlot(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-emerald-800 text-lg">Confirmer la réservation</DialogTitle>
          </DialogHeader>
          {selectedSlot && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border-2 ${bookingTi.border} ${bookingTi.bgSoft}`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{bookingTi.icon}</span>
                  <div>
                    <p className="font-bold">{bookingTi.label}{bookingType === "khatm_partiel" ? ` — Juz ${bookingJuz}` : ""}</p>
                    <p className="text-xs text-gray-500">{bookingTi.long}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-200 space-y-1">
                <p className="font-bold text-emerald-900 capitalize">
                  {format(parseISO(selectedSlot.slot_date), "EEEE d MMMM yyyy", { locale: fr })}
                </p>
                <p className="text-sm text-emerald-700 font-medium">
                  {selectedSlot.start_time.slice(0,5)} – {selectedSlot.end_time.slice(0,5)}
                </p>
                {selectedSlot.notes && <p className="text-xs text-gray-400 mt-1">{selectedSlot.notes}</p>}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Message pour le professeur <span className="text-gray-400 font-normal">(optionnel)</span>
                </Label>
                <Textarea
                  value={bookingMessage}
                  onChange={(e) => setBookingMessage(e.target.value)}
                  placeholder="Hizb travaillés cette semaine, difficultés particulières…"
                  className="mt-1.5 resize-none text-sm"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setSelectedSlot(null)}>Annuler</Button>
            <Button onClick={confirmBooking} disabled={booking} className="bg-emerald-700 hover:bg-emerald-800 text-white">
              {booking ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Enregistrement…</> : "Confirmer la réservation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionHeader({ step, title }: { step: number; title: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-7 h-7 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center font-bold shrink-0 shadow-sm">
        {step}
      </span>
      <h3 className="font-semibold text-emerald-900">{title}</h3>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: React.ReactNode; color: "emerald" | "amber" }) {
  return (
    <div className={`text-center p-4 rounded-xl bg-${color}-50 border border-${color}-100`}>
      <Icon className={`h-4 w-4 text-${color}-600 mx-auto mb-1`} />
      <div className="text-2xl font-bold text-emerald-800">{value}</div>
      <div className="text-xs text-amber-800/60 mt-0.5 leading-tight">{label}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-emerald-800">{value}</div>
      <div className="text-xs text-amber-800/70">{label}</div>
    </div>
  );
}

function UpsellPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#fdf8ef]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="mx-auto h-20 w-20 rounded-3xl bg-gradient-to-br from-emerald-700 to-amber-700 flex items-center justify-center mb-8 shadow-xl">
          <Lock className="h-9 w-9 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-emerald-900 mb-3">Hifd al-Qur'ān</h1>
        <p className="text-base text-amber-800/70 mb-8 max-w-md mx-auto">
          Le programme de mémorisation guidé est réservé aux abonnés <strong>Hifz</strong> ou <strong>Premium</strong>.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-md mx-auto mb-10">
          {[
            "Programme de mémorisation personnalisé",
            "Suivi des 60 hizb par type de session",
            "Réservation de séances avec le professeur",
            "Méthode pakistanaise éprouvée (Sabaq · Dhor)",
            "Évaluations et notes de progression",
            "Tableau de bord avec graphiques",
          ].map((f) => (
            <div key={f} className="flex items-start gap-2.5 p-3 bg-white rounded-xl border border-emerald-100 shadow-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
              <span className="text-sm text-gray-700">{f}</span>
            </div>
          ))}
        </div>
        <Button size="lg" onClick={() => navigate("/tarifs")} className="bg-gradient-to-r from-emerald-700 to-amber-700 text-white hover:opacity-90 shadow-lg h-12 px-8 text-base">
          <Crown className="h-5 w-5 mr-2" /> Voir les plans
        </Button>
        <p className="text-xs text-amber-800/40 mt-4">Sans engagement · Résiliable à tout moment</p>
      </div>
    </div>
  );
}

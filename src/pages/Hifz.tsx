import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Crown, Lock, Sparkles, BookOpen, CheckCircle2, Loader2, ChevronRight,
  RotateCcw, Target,
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

  // Khatm programme
  const [khatmDays, setKhatmDays] = useState<number | null>(null);

  const [calMonth, setCalMonth] = useState(startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingType, setBookingType] = useState<HifzSessionType>("sabaq");
  const [bookingJuz, setBookingJuz] = useState<number>(1);
  const [pagesFrom, setPagesFrom] = useState<number | "">("");
  const [pagesTo, setPagesTo] = useState<number | "">("");
  const [booking, setBooking] = useState(false);
  const [confirmedRepetition, setConfirmedRepetition] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);


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


  const handleCancel = async (sessionId: string, isConfirmed: boolean) => {
    const msg = isConfirmed
      ? "Cette séance est confirmée par le professeur. Voulez-vous vraiment l'annuler ?"
      : "Annuler cette réservation ?";
    if (!confirm(msg)) return;
    setCancelling(sessionId);
    const { error } = await supabase
      .from("hifz_sessions")
      .update({ status: "annulee" })
      .eq("id", sessionId);
    setCancelling(null);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Réservation annulée" });
      fetchAll();
    }
  };

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
    const pageRange = pagesFrom !== "" && pagesTo !== "" ? `[Pages ${pagesFrom}–${pagesTo}]` : null;
    const notesEleve = [pageRange, bookingMessage.trim() || null].filter(Boolean).join(" ") || null;
    const insertData: any = {
      student_id: user.id,
      session_date: selectedSlot.slot_date,
      session_time: selectedSlot.start_time,
      status: "en_attente",
      notes_eleve: notesEleve,
      session_type: bookingType,
    };
    if (bookingType === "khatm_partiel") insertData.juz_number = bookingJuz;

    const { error } = await supabase.from("hifz_sessions").insert(insertData);
    if (error) {
      setBooking(false);
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }

    // Supprimer le créneau pour qu'il ne soit plus disponible
    await supabase.from("admin_hifz_slots").delete().eq("id", selectedSlot.id);

    const typeInfo = getSessionType(bookingType);
    const studentName = `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || (user.email ?? "Élève");
    const tplData = {
      studentName, studentEmail: user.email,
      date: format(parseISO(selectedSlot.slot_date), "EEEE d MMMM yyyy", { locale: fr }),
      time: selectedSlot.start_time.slice(0, 5),
      message: bookingMessage,
      pageRange: pageRange ?? null,
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
    setPagesFrom(""); setPagesTo("");
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

  // Split sessions into upcoming and past — upcoming must be today or in the future
  const today = format(new Date(), "yyyy-MM-dd");
  const upcomingSessions = sessions.filter(s =>
    (s.status === "en_attente" || s.status === "confirmee") && s.session_date >= today
  );
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
                { value: "khatm", icon: BookOpen, label: "Khatm" },
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
                        <StatCard icon={CalendarCheck} label="Rythme" value={pacePerDay < 1 ? "< 1 p/j" : `${pacePerDay} p/j`} color="emerald" />
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

                  {/* À faire aujourd'hui */}
                  <Card className="shadow-sm border-2 border-emerald-200 bg-gradient-to-br from-white to-emerald-50/40">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2 text-emerald-800">
                        <CalendarCheck className="h-4 w-4" /> À faire aujourd'hui
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">

                      {/* Apprentissage du jour */}
                      {pacePerDay > 0 && (
                        <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50/60">
                          <span className="text-xl shrink-0">📗</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-emerald-800">Nouvel apprentissage</p>
                            <p className="text-xs text-emerald-700/70">{pacePerDay < 1 ? "1 page minimum" : `${pacePerDay} page${pacePerDay > 1 ? "s" : ""}`} à mémoriser · Répéter 50 fois</p>
                          </div>
                        </div>
                      )}

                      {/* Révisions dues */}
                      {dueNow.length > 0 ? (
                        <div className="space-y-1.5">
                          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide px-1">
                            {dueNow.length} hizb à réviser
                          </p>
                          <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
                            {dueNow.map((r) => {
                              const overdue = Math.abs(r.daysUntilDue);
                              const isVeryLate = overdue > 3;
                              return (
                                <div key={r.hizb} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${isVeryLate ? "border-red-200 bg-red-50/60" : "border-amber-200 bg-amber-50/60"}`}>
                                  <div className="flex items-center gap-2">
                                    <span className="text-base">📘</span>
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
                        </div>
                      ) : revisionSchedule.length > 0 ? (
                        <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50/60">
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-emerald-800">Révisions à jour ✓</p>
                            {upcomingRevision[0] && (
                              <p className="text-xs text-emerald-700/70">Prochain : Hizb {upcomingRevision[0].hizb} dans {upcomingRevision[0].daysUntilDue} jour{upcomingRevision[0].daysUntilDue > 1 ? "s" : ""}</p>
                            )}
                          </div>
                        </div>
                      ) : null}

                      {/* Prochaine séance */}
                      {upcomingSessions[0] && (() => {
                        const ns = upcomingSessions[0];
                        const ti = getSessionType(ns.session_type);
                        return (
                          <div className={`flex items-center gap-3 p-3 rounded-xl border-2 ${STATUS_CARD[ns.status] ?? "border-gray-200 bg-white"}`}>
                            <span className="text-xl shrink-0">{ti.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800">Prochaine séance</p>
                              <p className="text-xs text-gray-500 capitalize">
                                {format(parseISO(ns.session_date), "EEEE d MMM", { locale: fr })} · {ns.session_time.slice(0,5)} · {ti.label}
                              </p>
                            </div>
                            {ns.status === "confirmee" && ns.meet_link && (
                              <a href={/^https?:\/\//i.test(ns.meet_link) ? ns.meet_link : `https://${ns.meet_link}`}
                                target="_blank" rel="noopener noreferrer"
                                className="shrink-0 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium rounded-lg transition-colors">
                                🎥 Rejoindre
                              </a>
                            )}
                          </div>
                        );
                      })()}

                    </CardContent>
                  </Card>

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

                  <Button variant="outline" onClick={handleReset} className="border-amber-300 text-amber-800 hover:bg-amber-50 text-sm">
                    <RotateCcw className="h-3.5 w-3.5 mr-2" /> Réinitialiser mon programme
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* ═══════════════════════════════════════════════════════════════
<<<<<<< HEAD
=======
                VUE GLOBALE
            ═══════════════════════════════════════════════════════════════ */}
            {/* ═══════════════════════════════════════════════════════════════
                MÉTHODE
            ═══════════════════════════════════════════════════════════════ */}

            {/* ═══════════════════════════════════════════════════════════════
>>>>>>> 12c1863 (Refonte page accueil Hifd + prix 79e + cron 21h40)
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
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
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

                {bookingType !== "khatm_partiel" && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                    <Label className="text-emerald-800 text-sm font-semibold">
                      Pages prévues <span className="text-gray-400 font-normal">(optionnel)</span>
                    </Label>
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 shrink-0">De</span>
                        <Input
                          type="number" min={1} max={604}
                          value={pagesFrom}
                          onChange={(e) => setPagesFrom(e.target.value ? Math.min(604, Math.max(1, +e.target.value)) : "")}
                          placeholder="p. 105"
                          className="bg-white h-9 w-full sm:w-24 text-sm"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 shrink-0">à</span>
                        <Input
                          type="number" min={1} max={604}
                          value={pagesTo}
                          onChange={(e) => setPagesTo(e.target.value ? Math.min(604, Math.max(1, +e.target.value)) : "")}
                          placeholder="p. 109"
                          className="bg-white h-9 w-full sm:w-24 text-sm"
                        />
                      </div>
                      {pagesFrom !== "" && pagesTo !== "" && +pagesTo >= +pagesFrom && (
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg">
                          {+pagesTo - +pagesFrom + 1} page{+pagesTo - +pagesFrom > 0 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">Le Coran compte 604 pages — 1 hizb ≈ 10 pages</p>
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

            </TabsContent>

            {/* ═══════════════════════════════════════════════════════════════
                HISTORIQUE
            ═══════════════════════════════════════════════════════════════ */}
            <TabsContent value="historique" className="mt-4 space-y-4">

              {/* Séances à venir */}
              {upcomingSessions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-widest">À venir</p>
                    <Badge className="bg-amber-500 text-white text-xs">{upcomingSessions.length}</Badge>
                  </div>
                  {upcomingSessions.map((s) => {
                    const ti = getSessionType(s.session_type);
                    const pageMatch = s.notes_eleve?.match(/^\[Pages (\d+–\d+)\]\s*/);
                    const pages = pageMatch ? pageMatch[1] : null;
                    const userNote = pageMatch ? s.notes_eleve!.slice(pageMatch[0].length) : s.notes_eleve;
                    return (
                      <div key={s.id} className={`p-4 rounded-xl border-2 border-l-4 ${STATUS_CARD[s.status] ?? "border-gray-200 bg-white"} ${STATUS_BORDER[s.status] ?? "border-l-gray-300"} space-y-2`}>
                        <div className="flex items-start justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={`${ti.badgeBg} ${ti.badgeText} border-0`}>
                              {ti.icon} {ti.label}{s.session_type === "khatm_partiel" && s.juz_number ? ` · Juz ${s.juz_number}` : ""}
                            </Badge>
                            {pages && (
                              <Badge variant="outline" className="border-emerald-300 text-emerald-700 text-xs">📖 p. {pages}</Badge>
                            )}
                            <span className="text-sm font-semibold text-gray-800 capitalize">
                              {format(parseISO(s.session_date), "EEEE d MMM yyyy", { locale: fr })} · {s.session_time.slice(0,5)}
                            </span>
                          </div>
                          <span className="text-xs font-medium text-gray-500">{STATUS_LABEL[s.status] ?? s.status}</span>
                        </div>
                        {userNote && <p className="text-xs text-gray-500 italic">"{userNote}"</p>}
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
                        <button
                          onClick={() => handleCancel(s.id, s.status === "confirmee")}
                          disabled={cancelling === s.id}
                          className="text-xs text-red-500 hover:text-red-700 hover:underline disabled:opacity-50 transition-colors text-left"
                        >
                          {cancelling === s.id ? "Annulation…" : "Annuler la réservation"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Stats + historique évaluations */}
              {sessions.filter(s => s.status === "effectuee").length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  <StatCard icon={CalendarCheck} label="Sessions effectuées" value={sessions.filter(s => s.status === "effectuee").length} color="emerald" />
                  <StatCard icon={BookOpen} label="Hizb évalués" value={new Set(evaluations.map(e => e.hizb_number)).size} color="amber" />
                  <StatCard icon={Star} label="Hizb validés" value={evaluations.filter(e => e.status === "valide").length} color="emerald" />
                </div>
              )}

              {sessions.filter(s => s.status === "effectuee").length === 0 && upcomingSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                  <Clock className="h-12 w-12 text-emerald-200" />
                  <p className="text-amber-800/60 font-medium">Aucune session enregistrée</p>
                  <p className="text-xs text-amber-800/40">Vos séances avec le professeur apparaîtront ici.</p>
                </div>
              ) : sessions.filter(s => s.status === "effectuee").length > 0 ? (
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
              ) : null}
            </TabsContent>

            {/* ═══════════════════════════════════════════════════════════════
                KHATM
            ═══════════════════════════════════════════════════════════════ */}
            <TabsContent value="khatm" className="mt-4 space-y-5">

              {/* Header */}
              <div className="rounded-2xl bg-gradient-to-br from-emerald-950 to-emerald-800 p-6 text-center space-y-3">
                <p className="font-arabic text-4xl text-amber-300 leading-relaxed">خَتْم</p>
                <h2 className="text-xl font-bold text-white">La Clôture en Lecture</h2>
                <p className="text-emerald-200/80 text-sm max-w-xs mx-auto">
                  Complétez régulièrement la lecture intégrale du Coran depuis le mushaf — c'est le pilier du contact quotidien avec le Livre d'Allah.
                </p>
              </div>

              {/* Pourquoi le mushaf */}
              <Card className="border-amber-200 bg-amber-50/50 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-amber-800 text-base flex items-center gap-2">
                    📖 Pourquoi lire depuis le mushaf ?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-amber-900/80">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-amber-100">
                    <span className="text-xl shrink-0">👁️</span>
                    <div>
                      <p className="font-semibold text-amber-900">Le regard sur les mots est une ibâda</p>
                      <p className="text-xs text-amber-800/60 mt-0.5">Regarder le Coran est en soi un acte d'adoration — les yeux participent à la mémorisation.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-amber-100">
                    <span className="text-xl shrink-0">🧠</span>
                    <div>
                      <p className="font-semibold text-amber-900">La mémoire visuelle ancre le hifd</p>
                      <p className="text-xs text-amber-800/60 mt-0.5">Votre cerveau photographie les pages. Lire depuis le mushaf renforce l'ancrage visuel de ce que vous avez mémorisé.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-amber-100">
                    <span className="text-xl shrink-0">🔗</span>
                    <div>
                      <p className="font-semibold text-amber-900">Un lien quotidien ininterrompu</p>
                      <p className="text-xs text-amber-800/60 mt-0.5">Les Salaf recommandaient de ne jamais laisser passer une journée sans ouvrir le mushaf. C'est ce contact régulier qui protège le cœur.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Hadith */}
              <Card className="border-emerald-200 shadow-sm">
                <CardContent className="pt-5 space-y-3">
                  <p className="font-arabic text-lg text-emerald-800 text-right leading-relaxed dir-rtl">
                    «&nbsp;الَّذِي يَقْرَأُ الْقُرْآنَ وَهُوَ مَاهِرٌ بِهِ مَعَ السَّفَرَةِ الْكِرَامِ الْبَرَرَةِ&nbsp;»
                  </p>
                  <p className="text-sm text-gray-600 italic text-center">
                    « Celui qui lit le Coran avec aisance sera avec les nobles scribes vertueux. »
                  </p>
                  <p className="text-xs text-gray-400 text-center">— Bukhari & Muslim</p>
                </CardContent>
              </Card>

              {/* Générateur de programme */}
              <Card className="border-emerald-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-emerald-800 text-base">📅 Mon programme de clôture</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">En combien de jours souhaitez-vous clôturer le Coran ? <span className="text-amber-700 font-semibold">(30 jours maximum)</span></p>

                  <div className="flex gap-2 flex-wrap">
                    {[7, 10, 15, 20, 30].map((d) => (
                      <button
                        key={d}
                        onClick={() => setKhatmDays(d)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                          khatmDays === d
                            ? "bg-emerald-700 text-white border-emerald-700 shadow"
                            : "bg-white text-emerald-800 border-emerald-200 hover:border-emerald-400"
                        }`}
                      >
                        {d === 30 ? "1 mois" : `${d} jours`}
                      </button>
                    ))}
                  </div>

                  {khatmDays && (() => {
                    const totalPages = 604;
                    const pagesPerDay = Math.ceil(totalPages / khatmDays);
                    const juzPerDay = (30 / khatmDays).toFixed(1);
                    const endDate = format(new Date(Date.now() + khatmDays * 86400000), "d MMMM yyyy", { locale: fr });
                    const color = khatmDays <= 7 ? "violet" : khatmDays <= 15 ? "amber" : "emerald";
                    return (
                      <div className={`rounded-2xl border-2 border-${color}-200 bg-${color}-50/40 p-5 space-y-4`}>
                        <p className={`text-xs font-bold uppercase tracking-widest text-${color}-700`}>Votre programme</p>

                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label: "Pages / jour", value: `${pagesPerDay} p.` },
                            { label: "Juz / jour", value: `${juzPerDay} juz` },
                            { label: "Durée", value: khatmDays === 30 ? "1 mois" : `${khatmDays} jours` },
                            { label: "Fin estimée", value: endDate },
                          ].map(({ label, value }) => (
                            <div key={label} className="bg-white rounded-xl p-3 text-center border border-gray-100">
                              <p className={`text-lg font-bold text-${color}-800 capitalize`}>{value}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                            </div>
                          ))}
                        </div>

                        <div className={`p-4 rounded-xl bg-white border border-${color}-100 space-y-2`}>
                          <p className={`text-sm font-bold text-${color}-800`}>📖 En pratique chaque jour</p>
                          <ul className="space-y-1.5 text-sm text-gray-700">
                            <li className="flex items-start gap-2"><CheckCircle2 className={`h-4 w-4 text-${color}-600 shrink-0 mt-0.5`} />Lisez <strong>{pagesPerDay} pages</strong> depuis votre mushaf</li>
                            <li className="flex items-start gap-2"><CheckCircle2 className={`h-4 w-4 text-${color}-600 shrink-0 mt-0.5`} />Respectez l'ordre du Coran, d'Al-Fatiha à An-Nas</li>
                            <li className="flex items-start gap-2"><CheckCircle2 className={`h-4 w-4 text-${color}-600 shrink-0 mt-0.5`} />Ne sautez aucun jour — la régularité prime sur la quantité</li>
                          </ul>
                        </div>

                        {khatmDays <= 7 && <p className="text-xs text-violet-700 font-semibold text-center">⚡ Rythme très intense — réservé aux grandes disponibilités</p>}
                        {khatmDays === 30 && <p className="text-xs text-emerald-700 font-semibold text-center">✅ Rythme idéal en parallèle d'un programme de hifd actif</p>}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Conseil du professeur */}
              <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-amber-50 border-2 border-emerald-200 p-5 text-center space-y-2">
                <p className="text-2xl">🤲</p>
                <p className="text-sm font-semibold text-emerald-800">Le conseil du professeur</p>
                <p className="text-sm text-emerald-700/80 max-w-sm mx-auto">
                  Ne laissez jamais passer une journée sans ouvrir votre mushaf. Même 5 minutes suffisent. C'est la régularité, pas la quantité, qui construit le rapport au Coran.
                </p>
              </div>

            </TabsContent>

          </Tabs>
        )}
      </div>

      {/* ─── Booking dialog ─── */}
      <Dialog open={!!selectedSlot} onOpenChange={(o) => { if (!o) { setSelectedSlot(null); setConfirmedRepetition(false); } }}>
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
                    {pagesFrom !== "" && pagesTo !== "" && bookingType !== "khatm_partiel" && (
                      <p className="text-xs font-semibold text-emerald-700 mt-1">📖 Pages {pagesFrom}–{pagesTo} ({+pagesTo - +pagesFrom + 1} pages)</p>
                    )}
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

              {bookingType === "sabaq" && (
                <button
                  type="button"
                  onClick={() => setConfirmedRepetition(!confirmedRepetition)}
                  className={`w-full text-left transition-all rounded-2xl border-2 overflow-hidden ${
                    confirmedRepetition
                      ? "border-emerald-500"
                      : "border-red-400"
                  }`}
                >
                  {/* Header bande colorée */}
                  <div className={`px-4 py-2 flex items-center gap-2 ${confirmedRepetition ? "bg-emerald-600" : "bg-red-500"}`}>
                    <span className="text-white text-base">{confirmedRepetition ? "✅" : "⚠️"}</span>
                    <span className="text-white text-xs font-bold uppercase tracking-widest">
                      {confirmedRepetition ? "Confirmé" : "Obligatoire"}
                    </span>
                  </div>
                  {/* Corps */}
                  <div className={`px-4 py-4 flex items-center gap-4 ${confirmedRepetition ? "bg-emerald-50" : "bg-red-50"}`}>
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      confirmedRepetition ? "bg-emerald-600 border-emerald-600" : "border-red-400 bg-white"
                    }`}>
                      {confirmedRepetition && <CheckCircle2 className="h-4 w-4 text-white" />}
                    </div>
                    <div>
                      <p className={`font-bold text-base ${confirmedRepetition ? "text-emerald-800" : "text-red-700"}`}>
                        J'ai répété mon wird 50 fois
                      </p>
                      <p className={`text-xs mt-0.5 ${confirmedRepetition ? "text-emerald-600" : "text-red-500"}`}>
                        Obligatoire avant de présenter au professeur
                      </p>
                    </div>
                  </div>
                </button>
              )}
            </div>
          )}
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => { setSelectedSlot(null); setConfirmedRepetition(false); }}>Annuler</Button>
            <Button
              onClick={confirmBooking}
              disabled={booking || (bookingType === "sabaq" && !confirmedRepetition)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white disabled:opacity-50"
            >
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
            "Programme de mémorisation structuré en 3 piliers",
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

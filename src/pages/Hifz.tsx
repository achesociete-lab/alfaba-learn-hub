import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Crown, Lock, Sparkles, Calendar as CalendarIcon, BookOpen, History, CheckCircle2, XCircle, Loader2, ChevronRight } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/use-subscription";
import { useProfile } from "@/hooks/use-profile";
import { supabase } from "@/integrations/supabase/client";

const TOTAL_HIZB = 60;
const PAGES_PER_HIZB = 10;

type HifzConfig = { id: string; hizb_already_memo: number; duration_months: number; start_date: string };
type Slot = { id: string; slot_date: string; start_time: string; end_time: string; capacity: number; notes: string | null };
type Session = { id: string; session_date: string; session_time: string; status: string; meet_link: string | null; notes_eleve: string | null };
type Evaluation = { id: string; session_id: string | null; hizb_number: number; status: string; niveau: string | null; notes: string | null; evaluated_at: string };

const NIVEAU_LABEL: Record<string, string> = { mediocre: "Médiocre", moyen: "Moyen", bon: "Bon", excellent: "Excellent" };

export default function Hifz() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { plan, loading: subLoading } = useSubscription();
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

  useEffect(() => { if (user && plan === "premium") fetchAll(); }, [user, plan]);

  // ─── Derived data (hooks must run before any conditional return) ───
  const remainingHizb = config ? Math.max(0, TOTAL_HIZB - (config.hizb_already_memo || 0)) : 0;
  const remainingPages = remainingHizb * PAGES_PER_HIZB;
  const pacePerDay = config ? +(remainingPages / Math.max(1, config.duration_months * 30)).toFixed(2) : 0;

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

  const evalByHizb = useMemo(() => {
    const map: Record<number, Evaluation> = {};
    for (const e of evaluations) {
      const cur = map[e.hizb_number];
      if (!cur || new Date(e.evaluated_at) > new Date(cur.evaluated_at)) map[e.hizb_number] = e;
    }
    return map;
  }, [evaluations]);

  const slotsByDay = useMemo(() => {
    const m: Record<string, Slot[]> = {};
    for (const s of slots) (m[s.slot_date] ||= []).push(s);
    return m;
  }, [slots]);

  const daysOfMonth = useMemo(() => eachDayOfInterval({ start: startOfMonth(calMonth), end: endOfMonth(calMonth) }), [calMonth]);

  // ─── Gates ─────────────────────────────────────────────────
  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdf8ef]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
      </div>
    );
  }
  if (!user) return null;

  if (plan !== "premium") return <UpsellPage />;

  // ─── Program generation ────────────────────────────────────
  const handleGenerate = async () => {
    if (!user) return;
    setSubmitting(true);
    const { data, error } = await supabase
      .from("hifz_config")
      .upsert({ student_id: user.id, hizb_already_memo: memoCount, duration_months: duration, start_date: format(new Date(), "yyyy-MM-dd") }, { onConflict: "student_id" })
      .select()
      .single();
    setSubmitting(false);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    setConfig(data as any);
    toast({ title: "Programme généré !", description: "Votre plan de mémorisation est prêt." });
  };

  const handleReset = async () => {
    if (!user || !config) return;
    if (!confirm("Réinitialiser votre programme ?")) return;
    await supabase.from("hifz_config").delete().eq("student_id", user.id);
    setConfig(null);
    setMemoCount(0);
    setDuration(16);
  };

  // ─── Booking ──────────────────────────────────────────────
  const confirmBooking = async () => {
    if (!user || !selectedSlot) return;
    setBooking(true);
    const { error } = await supabase.from("hifz_sessions").insert({
      student_id: user.id,
      session_date: selectedSlot.slot_date,
      session_time: selectedSlot.start_time,
      status: "en_attente",
      notes_eleve: bookingMessage || null,
    });
    if (error) {
      setBooking(false);
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }

    // Notifications email (best effort, ne bloque pas la résa)
    const studentName = `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || (user.email ?? "Élève");
    const tplData = {
      studentName,
      studentEmail: user.email,
      date: format(parseISO(selectedSlot.slot_date), "EEEE d MMMM yyyy", { locale: fr }),
      time: selectedSlot.start_time.slice(0, 5),
      message: bookingMessage,
    };
    Promise.all([
      supabase.functions.invoke("send-transactional-email", { body: { templateName: "hifz-booking-admin", recipientEmail: "abdelkarim7@gmail.com", templateData: tplData } }),
      user.email ? supabase.functions.invoke("send-transactional-email", { body: { templateName: "hifz-booking-confirmation", recipientEmail: user.email, templateData: tplData } }) : null,
    ].filter(Boolean)).catch(() => {});

    setBooking(false);
    setSelectedSlot(null);
    setSelectedDay(null);
    setBookingMessage("");
    toast({ title: "Réservation enregistrée", description: "Vous recevrez un email de confirmation." });
    fetchAll();
  };

  // ─── Render ───────────────────────────────────────────────
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
            <TabsList className="grid grid-cols-3 w-full bg-emerald-50 border border-emerald-100">
              <TabsTrigger value="programme" className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white">Programme</TabsTrigger>
              <TabsTrigger value="reserver" className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white">Réserver</TabsTrigger>
              <TabsTrigger value="historique" className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white">Historique</TabsTrigger>
            </TabsList>

            {/* ─── Programme ─── */}
            <TabsContent value="programme" className="mt-6">
              {!config ? (
                <Card className="border-emerald-200">
                  <CardHeader>
                    <CardTitle className="text-emerald-800">Créer votre programme</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Hizb déjà mémorisés (depuis An-Nas)</Label>
                      <Select value={String(memoCount)} onValueChange={(v) => setMemoCount(+v)}>
                        <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent className="max-h-72">
                          {Array.from({ length: 61 }).map((_, i) => (
                            <SelectItem key={i} value={String(i)}>{i} hizb</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Durée souhaitée (mois)</Label>
                      <Input type="number" min={1} max={120} value={duration} onChange={(e) => setDuration(Math.max(1, +e.target.value || 1))} className="bg-white" />
                    </div>
                    <Button onClick={handleGenerate} disabled={submitting} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Générer mon programme
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-amber-50">
                    <CardContent className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <Stat label="Hizb restants" value={remainingHizb} />
                      <Stat label="Pages" value={remainingPages} />
                      <Stat label="Durée" value={`${config.duration_months} mois`} />
                      <Stat label="Rythme" value={`${pacePerDay} p/j`} />
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
                              const ev = evalByHizb[h];
                              return (
                                <div key={h} className="flex items-center justify-between p-3 rounded border border-emerald-100 bg-emerald-50/40">
                                  <span className="font-medium">Hizb {h}</span>
                                  {!ev ? (
                                    <Badge variant="secondary" className="bg-gray-200 text-gray-700">Non évalué</Badge>
                                  ) : ev.status === "valide" ? (
                                    <Badge className="bg-emerald-700 text-white"><CheckCircle2 className="h-3 w-3 mr-1" />{NIVEAU_LABEL[ev.niveau || ""] || "Validé"}</Badge>
                                  ) : (
                                    <Badge className="bg-red-600 text-white"><XCircle className="h-3 w-3 mr-1" />À retravailler</Badge>
                                  )}
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

            {/* ─── Réserver ─── */}
            <TabsContent value="reserver" className="mt-6 space-y-4">
              <Card className="border-emerald-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-emerald-800 capitalize">{format(calMonth, "MMMM yyyy", { locale: fr })}</CardTitle>
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
                        <button
                          key={key}
                          onClick={() => hasSlots && setSelectedDay(d)}
                          disabled={!hasSlots}
                          className={`aspect-square rounded-md text-sm flex items-center justify-center transition
                            ${hasSlots ? "bg-emerald-100 text-emerald-900 hover:bg-emerald-200 cursor-pointer font-semibold" : "text-gray-300 cursor-not-allowed"}
                            ${isSel ? "ring-2 ring-amber-700" : ""}`}
                        >
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
                      <button
                        key={s.id}
                        onClick={() => setSelectedSlot(s)}
                        className="w-full text-left p-3 rounded border border-emerald-200 bg-white hover:bg-emerald-50 flex items-center justify-between"
                      >
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
                  {sessions.map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-sm p-2 rounded bg-emerald-50/50">
                      <span>{format(parseISO(s.session_date), "d MMM yyyy", { locale: fr })} · {s.session_time.slice(0,5)}</span>
                      <Badge variant="outline" className="border-emerald-700 text-emerald-800">{s.status}</Badge>
                    </div>
                  ))}
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
                        return (
                          <AccordionItem key={s.id} value={s.id} className="border border-emerald-200 rounded-lg bg-white px-4">
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center justify-between w-full pr-2 text-left">
                                <div>
                                  <div className="font-semibold text-emerald-900">{format(parseISO(s.session_date), "EEEE d MMMM yyyy", { locale: fr })}</div>
                                  <div className="text-xs text-amber-800/70">{s.session_time.slice(0,5)} · {s.status}</div>
                                </div>
                                <Badge variant="outline" className="border-amber-700 text-amber-800">{evs.length} hizb évalué{evs.length>1?"s":""}</Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              {evs.length === 0 ? (
                                <p className="text-sm text-gray-500 py-2">Pas encore d'évaluation enregistrée.</p>
                              ) : (
                                <div className="space-y-2 pt-2">
                                  {evs.map((e) => (
                                    <div key={e.id} className="p-3 rounded border border-emerald-100 bg-emerald-50/40">
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium">Hizb {e.hizb_number}</span>
                                        {e.status === "valide" ? (
                                          <Badge className="bg-emerald-700 text-white">{NIVEAU_LABEL[e.niveau || ""] || "Validé"}</Badge>
                                        ) : (
                                          <Badge className="bg-red-600 text-white">À retravailler</Badge>
                                        )}
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

      {/* Booking confirmation dialog */}
      <Dialog open={!!selectedSlot} onOpenChange={(o) => !o && setSelectedSlot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-emerald-800">Confirmer la réservation</DialogTitle>
          </DialogHeader>
          {selectedSlot && (
            <div className="space-y-3">
              <p className="text-sm">
                <strong>{format(parseISO(selectedSlot.slot_date), "EEEE d MMMM yyyy", { locale: fr })}</strong>
                {" · "}{selectedSlot.start_time.slice(0,5)} – {selectedSlot.end_time.slice(0,5)}
              </p>
              <div>
                <Label>Message / hizb que vous prévoyez de réciter (optionnel)</Label>
                <Textarea value={bookingMessage} onChange={(e) => setBookingMessage(e.target.value)} placeholder="Ex : Hizb 30, sourate An-Naba'..." />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedSlot(null)}>Annuler</Button>
            <Button onClick={confirmBooking} disabled={booking} className="bg-emerald-700 hover:bg-emerald-800 text-white">
              {booking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmer la réservation"}
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
        <p className="text-lg text-amber-800/80 mb-8">
          Le programme de mémorisation guidé est réservé aux abonnés <strong>Premium</strong>.
        </p>
        <Card className="border-emerald-200 text-left mb-8">
          <CardContent className="pt-6 space-y-3">
            <Feature text="Plan de mémorisation personnalisé sur la durée de votre choix" />
            <Feature text="Réservation de séances individuelles avec votre professeur" />
            <Feature text="Suivi détaillé de chaque hizb (statut, niveau, notes)" />
            <Feature text="Historique complet de vos évaluations" />
          </CardContent>
        </Card>
        <Button size="lg" onClick={() => navigate("/tarifs")} className="bg-gradient-to-r from-emerald-700 to-amber-700 text-white hover:opacity-90">
          <Crown className="h-5 w-5 mr-2" /> Passer au plan Premium
        </Button>
      </div>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <CheckCircle2 className="h-5 w-5 text-emerald-700 mt-0.5 shrink-0" />
      <span className="text-sm">{text}</span>
    </div>
  );
}

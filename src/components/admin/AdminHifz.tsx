import { useEffect, useMemo, useState } from "react";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  addMonths,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";
import { fr } from "date-fns/locale";
import {
  BookOpen,
  CalendarPlus,
  CheckCircle2,
  XCircle,
  Trash2,
  Loader2,
  Plus,
  Send,
  Mail,
  Clock,
  CalendarClock,
  PenLine,
} from "lucide-react";
import MushafAnnotator from "./MushafAnnotator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { HIFZ_SESSION_TYPES, getSessionType, HifzSessionType } from "@/lib/hifz-session-types";
import { fetchSurahList, fetchVerseInfo, getMedinaPageUrl, SurahInfo } from "@/utils/quran-api";

type Slot = {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  notes: string | null;
};
type Session = {
  id: string;
  student_id: string;
  session_date: string;
  session_time: string;
  status: string;
  meet_link: string | null;
  notes_eleve: string | null;
  session_type?: string | null;
  juz_number?: number | null;
  reschedule_type?: string | null;
  reschedule_message?: string | null;
  reschedule_proposed_date?: string | null;
  reschedule_proposed_time?: string | null;
};
type Profile = { user_id: string; first_name: string; last_name: string };
type EvalDraft = {
  hizb_number: number;
  status: "valide" | "a_retravailler" | "";
  niveau: string;
  notes: string;
  ready_to_advance?: boolean | null;
  without_mushaf?: boolean;
  fluidity?: string;
  surah_start?: number;
  verse_start?: number;
  surah_end?: number;
  verse_end?: number;
  page_start?: number;
  page_end?: number;
};

const NIVEAUX = [
  { value: "mediocre", label: "Médiocre", color: "bg-red-100 text-red-700" },
  { value: "moyen", label: "Moyen", color: "bg-amber-100 text-amber-700" },
  { value: "bon", label: "Bon", color: "bg-emerald-100 text-emerald-700" },
  { value: "excellent", label: "Excellent", color: "bg-emerald-600 text-white" },
];
const FLUIDITY = ["Haché", "Correct", "Fluide", "Majestueux"];

export default function AdminHifz() {
  const { toast } = useToast();
  const [tab, setTab] = useState("slots");

  return (
    <Card className="border-emerald-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-emerald-700" />
          <CardTitle className="text-emerald-800">Gestion Hifd</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-4 w-full bg-emerald-50 border border-emerald-100">
            <TabsTrigger value="slots" className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white text-xs">
              Créneaux
            </TabsTrigger>
            <TabsTrigger value="sessions" className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white text-xs">
              Sessions
            </TabsTrigger>
            <TabsTrigger value="evaluate" className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white text-xs">
              Évaluer
            </TabsTrigger>
            <TabsTrigger value="annotate" className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white text-xs gap-1">
              <PenLine className="h-3.5 w-3.5" /> Mushaf
            </TabsTrigger>
          </TabsList>
          <TabsContent value="slots" className="mt-4"><SlotsTab toast={toast} /></TabsContent>
          <TabsContent value="sessions" className="mt-4"><SessionsTab toast={toast} /></TabsContent>
          <TabsContent value="evaluate" className="mt-4"><EvaluateTab toast={toast} /></TabsContent>
          <TabsContent value="annotate" className="mt-4"><AnnotateTab toast={toast} /></TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

/* ────────────────── Onglet Créneaux ────────────────── */
function SlotsTab({ toast }: { toast: ReturnType<typeof useToast>["toast"] }) {
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [newTime, setNewTime] = useState("18:00");
  const [loading, setLoading] = useState(false);

  const fetchSlots = async () => {
    const { data } = await supabase
      .from("admin_hifz_slots")
      .select("*")
      .gte("slot_date", format(startOfMonth(month), "yyyy-MM-dd"))
      .lte("slot_date", format(endOfMonth(month), "yyyy-MM-dd"))
      .order("slot_date")
      .order("start_time");
    setSlots((data as any) || []);
  };

  useEffect(() => { fetchSlots(); }, [month]);

  const days = useMemo(
    () => eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) }),
    [month]
  );
  const byDay = useMemo(() => {
    const m: Record<string, Slot[]> = {};
    for (const s of slots) (m[s.slot_date] ||= []).push(s);
    return m;
  }, [slots]);

  const addSlot = async () => {
    if (!selectedDay || !newTime) return;
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    const end = newTime.split(":");
    const endTime = `${String(+end[0] + 1).padStart(2, "0")}:${end[1]}`;
    const { error } = await supabase.from("admin_hifz_slots").insert({
      slot_date: format(selectedDay, "yyyy-MM-dd"),
      start_time: newTime,
      end_time: endTime,
      capacity: 1,
      created_by: u.user?.id,
    });
    setLoading(false);
    if (error) return toast({ title: "Erreur", description: error.message, variant: "destructive" });
    fetchSlots();
    toast({ title: "Créneau ajouté" });
  };

  const toggleAvail = async (s: Slot) => {
    await supabase.from("admin_hifz_slots").update({ capacity: s.capacity > 0 ? 0 : 1 }).eq("id", s.id);
    fetchSlots();
  };
  const removeSlot = async (id: string) => {
    if (!confirm("Supprimer ce créneau ?")) return;
    await supabase.from("admin_hifz_slots").delete().eq("id", id);
    fetchSlots();
  };

  return (
    <div className="space-y-4">
      <Card className="border-emerald-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-emerald-800 capitalize text-base">
            {format(month, "MMMM yyyy", { locale: fr })}
          </CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setMonth(addMonths(month, -1))}>‹</Button>
            <Button size="sm" variant="outline" onClick={() => setMonth(addMonths(month, 1))}>›</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-xs text-center text-amber-800/70 mb-1">
            {["L","M","M","J","V","S","D"].map((d, i) => <div key={i}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: (startOfMonth(month).getDay() + 6) % 7 }).map((_, i) => <div key={`p${i}`} />)}
            {days.map((d) => {
              const key = format(d, "yyyy-MM-dd");
              const count = byDay[key]?.length || 0;
              const isSel = selectedDay && isSameDay(d, selectedDay);
              return (
                <button
                  key={key}
                  onClick={() => setSelectedDay(d)}
                  className={`aspect-square rounded-md text-sm flex flex-col items-center justify-center transition border
                    ${count > 0 ? "bg-emerald-100 border-emerald-300 text-emerald-900 font-semibold" : "bg-white border-gray-200 hover:bg-emerald-50"}
                    ${isSel ? "ring-2 ring-amber-700" : ""}`}
                >
                  <span>{format(d, "d")}</span>
                  {count > 0 && <span className="text-[10px] text-emerald-700">{count}</span>}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedDay && (
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-800 capitalize text-base">
              {format(selectedDay, "EEEE d MMMM yyyy", { locale: fr })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label>Ajouter un horaire</Label>
                <Input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="bg-white" />
              </div>
              <Button onClick={addSlot} disabled={loading} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarPlus className="h-4 w-4" />} Ajouter
              </Button>
            </div>
            <div className="space-y-2">
              {(byDay[format(selectedDay, "yyyy-MM-dd")] || []).map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded border bg-white">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-700" />
                    <span className="font-medium">{s.start_time.slice(0, 5)} – {s.end_time.slice(0, 5)}</span>
                    {s.capacity === 0 && <Badge variant="destructive">Indisponible</Badge>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => toggleAvail(s)}>
                      {s.capacity > 0 ? "Marquer indispo" : "Réactiver"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => removeSlot(s.id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
              {(byDay[format(selectedDay, "yyyy-MM-dd")] || []).length === 0 && (
                <p className="text-sm text-muted-foreground italic">Aucun créneau pour ce jour.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ────────────────── Onglet Sessions ────────────────── */
function SessionsTab({ toast }: { toast: ReturnType<typeof useToast>["toast"] }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [emails, setEmails] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [meetLinks, setMeetLinks] = useState<Record<string, string>>({});

  // Report professeur → élève
  const [proposingFor, setProposingFor] = useState<Session | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [proposalSlot, setProposalSlot] = useState<Slot | null>(null);
  const [proposalMessage, setProposalMessage] = useState("");
  const [submittingProposal, setSubmittingProposal] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("hifz_sessions")
      .select("*")
      .in("status", ["en_attente", "confirmee"])
      .order("session_date");
    const list = (data as any[]) || [];
    setSessions(list);

    const ids = [...new Set(list.map((s) => s.student_id))];
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name")
        .in("user_id", ids);
      const map: Record<string, Profile> = {};
      (profs || []).forEach((p: any) => (map[p.user_id] = p));
      setProfiles(map);
    }
    setLoading(false);
  };

  useEffect(() => { fetchSessions(); }, []);

  const openProposalDialog = async (s: Session) => {
    setProposingFor(s);
    setProposalSlot(null);
    setProposalMessage("");
    const { data } = await supabase
      .from("admin_hifz_slots")
      .select("*")
      .gte("slot_date", format(new Date(), "yyyy-MM-dd"))
      .order("slot_date").order("start_time");
    setAvailableSlots((data as any) || []);
  };

  const submitProposal = async () => {
    if (!proposingFor) return;
    setSubmittingProposal(true);
    const update: any = {
      reschedule_type: "reporter",
      reschedule_initiated_by: "professeur",
      reschedule_message: proposalMessage.trim() || null,
      reschedule_proposed_date: proposalSlot?.slot_date || null,
      reschedule_proposed_time: proposalSlot?.start_time || null,
      reschedule_requested_at: new Date().toISOString(),
    };
    await supabase.from("hifz_sessions").update(update).eq("id", proposingFor.id);

    // Notifier l'élève par email
    const p = profiles[proposingFor.student_id];
    const studentName = p ? `${p.first_name} ${p.last_name}`.trim() : "Élève";
    try {
      await supabase.functions.invoke("notify-hifz-reschedule-proposal", {
        body: {
          userId: proposingFor.student_id,
          studentName,
          sessionDate: format(parseISO(proposingFor.session_date), "EEEE d MMMM yyyy", { locale: fr }),
          sessionTime: proposingFor.session_time.slice(0, 5),
          proposedDate: proposalSlot ? format(parseISO(proposalSlot.slot_date), "EEEE d MMMM yyyy", { locale: fr }) : null,
          proposedTime: proposalSlot ? proposalSlot.start_time.slice(0, 5) : null,
          message: proposalMessage.trim() || null,
        },
      });
    } catch {}

    setSubmittingProposal(false);
    setProposingFor(null);
    toast({ title: "Report proposé — l'élève a été notifié par email ✓" });
    fetchSessions();
  };

  const getStudentEmail = async (userId: string): Promise<string | null> => {
    if (emails[userId]) return emails[userId];
    // Email récupéré via fonction admin n'existe pas — on délègue à l'envoi (qui exige l'email)
    // Fallback : impossible côté client, on omet l'email si pas connu
    return null;
  };

  const confirmSession = async (s: Session) => {
    const raw = meetLinks[s.id]?.trim();
    if (!raw) {
      toast({ title: "Lien Meet requis", description: "Entrez un lien Google Meet avant de confirmer.", variant: "destructive" });
      return;
    }
    const link = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    await supabase.from("hifz_sessions").update({ status: "confirmee", meet_link: link }).eq("id", s.id);

    // Envoi email — récupération email via admin-only n'est pas possible côté client.
    // On envoie via la table profiles si présent (sinon on demande à l'admin de prévenir manuellement)
    const p = profiles[s.student_id];
    const studentName = p ? `${p.first_name} ${p.last_name}`.trim() : "Élève";

    // Tentative d'envoi : on récupère l'email via une edge function existante si dispo, sinon on skip
    try {
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "hifz-session-confirmed",
          recipientUserId: s.student_id,
          templateData: {
            studentName,
            date: format(parseISO(s.session_date), "EEEE d MMMM yyyy", { locale: fr }),
            time: s.session_time.slice(0, 5),
            meetLink: link,
          },
        },
      });
    } catch {}
    toast({ title: "Session confirmée", description: "L'élève sera notifié." });
    fetchSessions();
  };

  const cancelSession = async (s: Session) => {
    if (!confirm("Annuler cette session ?")) return;
    await supabase.from("hifz_sessions").update({ status: "annulee" }).eq("id", s.id);

    // Recrée le créneau pour le rendre à nouveau disponible
    if (s.session_date >= format(new Date(), "yyyy-MM-dd")) {
      const { data: u } = await supabase.auth.getUser();
      await supabase.from("admin_hifz_slots").insert({
        slot_date: s.session_date,
        start_time: s.session_time,
        end_time: s.session_time.slice(0, 2) === "23"
          ? "00:00:00"
          : `${String(parseInt(s.session_time.slice(0, 2)) + 1).padStart(2, "0")}:00:00`,
        capacity: 1,
        created_by: u.user?.id,
      });
    }

    const p = profiles[s.student_id];
    const studentName = p ? `${p.first_name} ${p.last_name}`.trim() : "Élève";
    try {
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "hifz-session-cancelled",
          recipientUserId: s.student_id,
          templateData: {
            studentName,
            date: format(parseISO(s.session_date), "EEEE d MMMM yyyy", { locale: fr }),
            time: s.session_time.slice(0, 5),
          },
        },
      });
    } catch {}
    toast({ title: "Session annulée — créneau remis en disponible" });
    fetchSessions();
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-emerald-700" /></div>;
  if (sessions.length === 0) return <p className="text-sm text-muted-foreground italic">Aucune session à traiter.</p>;

  return (
    <div className="space-y-3">
      {sessions.map((s) => {
        const p = profiles[s.student_id];
        const name = p ? `${p.first_name} ${p.last_name}`.trim() : "—";
        return (
          <Card key={s.id} className={
              s.reschedule_type ? "border-amber-400 ring-2 ring-amber-200" :
              s.status === "confirmee" ? "border-emerald-300" : "border-amber-200"
            }>
            <CardContent className="pt-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-emerald-800">{name}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {format(parseISO(s.session_date), "EEEE d MMMM yyyy", { locale: fr })} · {s.session_time.slice(0, 5)}
                  </p>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                  {s.reschedule_type && (
                    <Badge className="bg-amber-500 text-white gap-1">
                      <CalendarClock className="h-3 w-3" />
                      {s.reschedule_type === "retard" ? "Retard signalé" : "Report demandé"}
                    </Badge>
                  )}
                  <Badge className={s.status === "confirmee" ? "bg-emerald-700" : "bg-slate-500"}>
                    {s.status === "confirmee" ? "Confirmée" : "En attente"}
                  </Badge>
                </div>
              </div>

              {/* Détail de la demande de report */}
              {s.reschedule_type && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 space-y-1.5">
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1">
                    <CalendarClock className="h-3.5 w-3.5" />
                    {s.reschedule_type === "retard" ? "⚠️ Retard signalé par l'élève" : "📅 Demande de report"}
                  </p>
                  {s.reschedule_message && (
                    <p className="text-sm text-amber-900 italic">« {s.reschedule_message} »</p>
                  )}
                  {s.reschedule_type === "reporter" && s.reschedule_proposed_date && (
                    <p className="text-sm font-semibold text-amber-800">
                      Créneau proposé : {format(parseISO(s.reschedule_proposed_date), "EEEE d MMMM yyyy", { locale: fr })}
                      {s.reschedule_proposed_time && ` à ${s.reschedule_proposed_time.slice(0, 5)}`}
                    </p>
                  )}
                  {/* Accepter le report */}
                  {s.reschedule_type === "reporter" && s.reschedule_proposed_date && (
                    <Button
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700 text-white gap-1 mt-1"
                      onClick={async () => {
                        await supabase.from("hifz_sessions").update({
                          session_date: s.reschedule_proposed_date!,
                          session_time: s.reschedule_proposed_time || s.session_time,
                          reschedule_type: null,
                          reschedule_message: null,
                          reschedule_proposed_date: null,
                          reschedule_proposed_time: null,
                          reschedule_requested_at: null,
                        } as any).eq("id", s.id);
                        toast({ title: "Report accepté — séance déplacée ✓" });
                        fetchSessions();
                      }}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Accepter le report
                    </Button>
                  )}
                  <button
                    className="text-xs text-muted-foreground hover:underline"
                    onClick={async () => {
                      await supabase.from("hifz_sessions").update({
                        reschedule_type: null, reschedule_message: null,
                        reschedule_proposed_date: null, reschedule_proposed_time: null,
                        reschedule_requested_at: null,
                      } as any).eq("id", s.id);
                      toast({ title: "Demande ignorée" });
                      fetchSessions();
                    }}
                  >
                    Ignorer la demande
                  </button>
                </div>
              )}

              {s.notes_eleve && (
                <p className="text-sm bg-amber-50 border border-amber-200 rounded p-2 italic">
                  « {s.notes_eleve} »
                </p>
              )}
              {s.status === "en_attente" && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="Lien Google Meet (https://meet.google.com/…)"
                    value={meetLinks[s.id] || ""}
                    onChange={(e) => setMeetLinks({ ...meetLinks, [s.id]: e.target.value })}
                    className="bg-white"
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => confirmSession(s)} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                      <CheckCircle2 className="h-4 w-4" /> Confirmer
                    </Button>
                    <Button variant="outline" onClick={() => cancelSession(s)} className="border-red-300 text-red-700 hover:bg-red-50">
                      <XCircle className="h-4 w-4" /> Annuler
                    </Button>
                  </div>
                </div>
              )}
              {s.status === "confirmee" && (
                <div className="space-y-2">
                  {/* Lien Meet éditable */}
                  <div className="flex gap-2 items-center flex-wrap">
                    <Input
                      value={meetLinks[s.id] ?? (s.meet_link || "")}
                      onChange={(e) => setMeetLinks({ ...meetLinks, [s.id]: e.target.value })}
                      placeholder="https://meet.google.com/xxx-yyyy-zzz"
                      className="bg-white text-sm flex-1 min-w-0"
                    />
                    <Button
                      size="sm"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white shrink-0"
                      onClick={async () => {
                        const raw = (meetLinks[s.id] ?? s.meet_link ?? "").trim();
                        if (!raw) return;
                        const link = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
                        await supabase.from("hifz_sessions").update({ meet_link: link }).eq("id", s.id);
                        toast({ title: "Lien Meet mis à jour ✓" });
                        fetchSessions();
                      }}
                    >
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                    {s.meet_link && (
                      <a
                        href={/^https?:\/\//i.test(s.meet_link) ? s.meet_link : `https://${s.meet_link}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-emerald-700 underline shrink-0"
                      >
                        Tester ↗
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {!s.reschedule_type && (
                      <Button size="sm" variant="outline" onClick={() => openProposalDialog(s)} className="border-blue-300 text-blue-700 hover:bg-blue-50 gap-1">
                        <CalendarClock className="h-3.5 w-3.5" /> Proposer un report
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => cancelSession(s)} className="border-red-300 text-red-700">
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
              {s.status === "en_attente" && !s.reschedule_type && (
                <div className="flex justify-end">
                  <Button size="sm" variant="ghost" onClick={() => openProposalDialog(s)} className="text-blue-600 hover:text-blue-800 gap-1 text-xs">
                    <CalendarClock className="h-3.5 w-3.5" /> Proposer un report
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Dialog : proposition de report professeur → élève */}
      {proposingFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-blue-700" />
              <h3 className="font-bold text-lg text-blue-800">Proposer un report</h3>
            </div>

            {/* Séance concernée */}
            <div className="px-3 py-2 rounded-lg bg-muted text-sm text-muted-foreground">
              Séance de{" "}
              <strong className="text-foreground">
                {profiles[proposingFor.student_id]
                  ? `${profiles[proposingFor.student_id].first_name} ${profiles[proposingFor.student_id].last_name}`
                  : "l'élève"}
              </strong>{" "}
              — {format(parseISO(proposingFor.session_date), "EEEE d MMMM yyyy", { locale: fr })} à{" "}
              {proposingFor.session_time.slice(0, 5)}
            </div>

            {/* Nouveau créneau */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Nouveau créneau à proposer</Label>
              {availableSlots.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Aucun créneau disponible — vous pouvez tout de même envoyer un message.</p>
              ) : (
                <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                  {availableSlots.map((sl) => (
                    <button
                      key={sl.id}
                      onClick={() => setProposalSlot(proposalSlot?.id === sl.id ? null : sl)}
                      className={`w-full text-left p-2.5 rounded-lg border text-sm transition-all ${
                        proposalSlot?.id === sl.id
                          ? "border-blue-500 bg-blue-50 font-semibold"
                          : "border-border hover:border-blue-300"
                      }`}
                    >
                      <span className="capitalize">{format(parseISO(sl.slot_date), "EEEE d MMM yyyy", { locale: fr })}</span>
                      {" · "}<span className="text-blue-700 font-medium">{sl.start_time.slice(0, 5)} – {sl.end_time.slice(0, 5)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Message */}
            <div>
              <Label className="text-sm font-semibold">Message pour l'élève</Label>
              <Textarea
                value={proposalMessage}
                onChange={(e) => setProposalMessage(e.target.value)}
                placeholder="Je ne serai pas disponible ce soir, je vous propose le créneau ci-dessus…"
                className="mt-1.5 resize-none text-sm"
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <Button variant="outline" onClick={() => setProposingFor(null)}>Annuler</Button>
              <Button
                onClick={submitProposal}
                disabled={submittingProposal || (!proposalSlot && !proposalMessage.trim())}
                className="bg-blue-700 hover:bg-blue-800 text-white gap-1"
              >
                {submittingProposal
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Envoi…</>
                  : <><Send className="h-4 w-4" /> Notifier l'élève</>
                }
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────── Onglet Évaluer ────────────────── */
function EvaluateTab({ toast }: { toast: ReturnType<typeof useToast>["toast"] }) {
  const [students, setStudents] = useState<Array<Profile & { student_id: string }>>([]);
  const [studentId, setStudentId] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [evals, setEvals] = useState<EvalDraft[]>([{ hizb_number: 1, status: "", niveau: "", notes: "" }]);
  const [saving, setSaving] = useState(false);
  const [studentEvals, setStudentEvals] = useState<any[]>([]);
  const [timer, setTimer] = useState<number | null>(null);
  const [surahList, setSurahList] = useState<SurahInfo[]>([]);
  const [loadingPage, setLoadingPage] = useState<Record<number, boolean>>({});
  const [previewPage, setPreviewPage] = useState<number | null>(null);

  const selectedSession = sessions.find((s) => s.id === sessionId);
  const sessionType = (selectedSession?.session_type || "sabaq") as HifzSessionType;
  const typeInfo = getSessionType(sessionType);

  const PERSIST_KEY = "hifz-eval-draft";

  // Restore persisted state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PERSIST_KEY);
      if (!saved) return;
      const { studentId: sid, sessionId: ssid, evals: ev } = JSON.parse(saved);
      if (sid) setStudentId(sid);
      if (ssid) setSessionId(ssid);
      if (ev?.length) setEvals(ev);
    } catch {}
  }, []);

  // Persist state on every change
  useEffect(() => {
    try {
      localStorage.setItem(PERSIST_KEY, JSON.stringify({ studentId, sessionId, evals }));
    } catch {}
  }, [studentId, sessionId, evals]);

  useEffect(() => {
    (async () => {
      const [cfgsRes, surahsRes] = await Promise.all([
        supabase.from("hifz_config").select("student_id"),
        fetchSurahList().catch(() => []),
      ]);
      setSurahList(surahsRes);
      const ids = (cfgsRes.data || []).map((c: any) => c.student_id);
      if (!ids.length) return;
      const { data: profs } = await supabase
        .from("profiles").select("user_id, first_name, last_name").in("user_id", ids);
      setStudents((profs || []).map((p: any) => ({ ...p, student_id: p.user_id })));
    })();
  }, []);

  // Auto-fetch page + hizb from surah/verse via API
  const resolvePages = async (idx: number, draft: EvalDraft) => {
    const { surah_start, verse_start, surah_end, verse_end } = draft;
    if (!surah_start || !verse_start) return;
    setLoadingPage((p) => ({ ...p, [idx]: true }));
    const [info1, info2] = await Promise.all([
      fetchVerseInfo(surah_start, verse_start),
      surah_end && verse_end ? fetchVerseInfo(surah_end, verse_end) : Promise.resolve(null),
    ]);
    setLoadingPage((p) => ({ ...p, [idx]: false }));
    updateEval(idx, {
      page_start: info1?.page ?? undefined,
      page_end: info2?.page ?? info1?.page ?? undefined,
      hizb_number: info1?.hizb ?? draft.hizb_number,
    });
  };

  useEffect(() => {
    if (!studentId) { setSessions([]); setSessionId(""); setStudentEvals([]); return; }
    (async () => {
      const [{ data: sess }, { data: evs }] = await Promise.all([
        supabase.from("hifz_sessions").select("*").eq("student_id", studentId).eq("status", "confirmee").order("session_date", { ascending: false }),
        supabase.from("hifz_evaluations").select("*").eq("student_id", studentId),
      ]);
      setSessions((sess as any) || []);
      setStudentEvals((evs as any) || []);
    })();
  }, [studentId]);

  // Pré-remplissage par type
  useEffect(() => {
    if (!sessionId || !selectedSession) return;
    if (sessionType === "rattrapage") {
      const toRedo = studentEvals.filter((e: any) => e.status === "a_retravailler" || e.niveau === "mediocre");
      const uniq = [...new Map(toRedo.map((e: any) => [e.hizb_number, e])).values()];
      if (uniq.length) setEvals(uniq.map((e: any) => ({ hizb_number: e.hizb_number, status: "", niveau: "", notes: "" })));
    } else if (sessionType === "khatm_partiel" && selectedSession.juz_number) {
      const j = selectedSession.juz_number;
      const h1 = j * 2 - 1;
      const h2 = j * 2;
      setEvals([
        { hizb_number: h1, status: "", niveau: "", notes: "", fluidity: "" },
        { hizb_number: h2, status: "", niveau: "", notes: "", fluidity: "" },
      ]);
    } else {
      setEvals([{ hizb_number: 1, status: "", niveau: "", notes: "" }]);
    }
  }, [sessionId, sessionType]);

  // Timer test surprise
  useEffect(() => {
    if (timer === null) return;
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((v) => (v !== null ? v - 1 : null)), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const addEval = () => setEvals([...evals, { hizb_number: 1, status: "", niveau: "", notes: "" }]);
  const updateEval = (i: number, patch: Partial<EvalDraft>) =>
    setEvals(evals.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
  const removeEval = (i: number) => setEvals(evals.filter((_, idx) => idx !== i));

  const tirageDhor = () => {
    const validated = [...new Set(studentEvals.filter((e: any) => e.status === "valide").map((e: any) => e.hizb_number))];
    if (!validated.length) return toast({ title: "Aucun hizb validé", variant: "destructive" });
    const pick = validated[Math.floor(Math.random() * validated.length)];
    setEvals([{ hizb_number: pick, status: "", niveau: "", notes: "" }]);
    toast({ title: `Tirage : Hizb ${pick}` });
  };

  const tirageSurprise = () => {
    const validated = [...new Set(studentEvals.filter((e: any) => e.status === "valide").map((e: any) => e.hizb_number))];
    if (!validated.length) return toast({ title: "Aucun hizb validé", variant: "destructive" });
    const n = Math.min(validated.length, 1 + Math.floor(Math.random() * 3));
    const shuffled = [...validated].sort(() => Math.random() - 0.5).slice(0, n);
    setEvals(shuffled.map((h) => ({ hizb_number: h, status: "", niveau: "", notes: "" })));
    toast({ title: `Tirage : ${n} hizb` });
  };

  const submit = async () => {
    if (!studentId || !sessionId) {
      toast({ title: "Champs manquants", variant: "destructive" });
      return;
    }
    const valid = evals.filter((e) => e.status);
    if (!valid.length) {
      toast({ title: "Aucune évaluation", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    const rows = valid.map((e) => {
      const row: any = {
        session_id: sessionId,
        student_id: studentId,
        hizb_number: e.hizb_number,
        status: e.status,
        niveau: e.status === "valide" ? e.niveau || null : null,
        notes: e.notes || null,
        teacher_id: u.user?.id,
        session_type: sessionType,
      };
      if (sessionType === "sabaq") row.ready_to_advance = e.ready_to_advance ?? null;
      if (sessionType === "sabaq_para") row.without_mushaf = e.without_mushaf ?? true;
      if (sessionType === "khatm_partiel") row.fluidity = e.fluidity || null;
      if (e.surah_start) { row.surah_start = e.surah_start; row.verse_start = e.verse_start ?? 1; }
      if (e.surah_end)   { row.surah_end   = e.surah_end;   row.verse_end   = e.verse_end   ?? 1; }
      if (e.page_start)  row.page_start = e.page_start;
      if (e.page_end)    row.page_end   = e.page_end;
      return row;
    });
    const { error } = await supabase.from("hifz_evaluations").insert(rows);
    if (error) {
      setSaving(false);
      return toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
    await supabase.from("hifz_sessions").update({ status: "effectuee" }).eq("id", sessionId);

    const sess = sessions.find((s) => s.id === sessionId);
    const stu = students.find((s) => s.student_id === studentId);
    try {
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "hifz-session-evaluated",
          recipientUserId: studentId,
          templateData: {
            studentName: stu ? `${stu.first_name} ${stu.last_name}`.trim() : "Élève",
            date: sess ? format(parseISO(sess.session_date), "EEEE d MMMM yyyy", { locale: fr }) : "",
            sessionType,
            sessionTypeLabel: `${typeInfo.icon} ${typeInfo.label}`,
            evaluations: valid,
          },
        },
      });
    } catch {}

    setSaving(false);
    toast({ title: "Évaluation enregistrée" });
    setEvals([{ hizb_number: 1, status: "", niveau: "", notes: "" }]);
    setSessionId("");
    setTimer(null);
    localStorage.removeItem(PERSIST_KEY);
  };

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label>Élève</Label>
          <Select value={studentId} onValueChange={setStudentId}>
            <SelectTrigger className="bg-white"><SelectValue placeholder="Choisir un élève" /></SelectTrigger>
            <SelectContent>
              {students.map((s) => (<SelectItem key={s.student_id} value={s.student_id}>{s.first_name} {s.last_name}</SelectItem>))}
              {students.length === 0 && <SelectItem value="_" disabled>Aucun élève inscrit</SelectItem>}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Session</Label>
          <Select value={sessionId} onValueChange={setSessionId} disabled={!studentId}>
            <SelectTrigger className="bg-white"><SelectValue placeholder="Choisir une session" /></SelectTrigger>
            <SelectContent>
              {sessions.map((s) => {
                const ti = getSessionType(s.session_type);
                return (
                  <SelectItem key={s.id} value={s.id}>
                    {ti.icon} {format(parseISO(s.session_date), "d MMM", { locale: fr })} · {s.session_time.slice(0, 5)} · {ti.label}
                  </SelectItem>
                );
              })}
              {studentId && sessions.length === 0 && <SelectItem value="_" disabled>Aucune session confirmée</SelectItem>}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedSession && (
        <div className={`p-3 rounded border ${typeInfo.border} ${typeInfo.bgSoft} flex items-center justify-between flex-wrap gap-2`}>
          <div className="flex items-center gap-2">
            <Badge className={`${typeInfo.badgeBg} ${typeInfo.badgeText} border-0`}>{typeInfo.icon} {typeInfo.label}{sessionType === "khatm_partiel" && selectedSession.juz_number ? ` — Juz ${selectedSession.juz_number}` : ""}</Badge>
            <span className="text-xs text-gray-600">{typeInfo.long}</span>
          </div>
          <div className="flex gap-2">
            {sessionType === "dhor" && <Button size="sm" variant="outline" onClick={tirageDhor}>🎲 Tirage aléatoire</Button>}
            {sessionType === "test_surprise" && (
              <>
                <Button size="sm" variant="outline" onClick={tirageSurprise}>🎲 Tirage surprise</Button>
                <Button size="sm" variant="outline" onClick={() => setTimer(15 * 60)}>
                  <Clock className="h-3 w-3" /> {timer !== null ? `${Math.floor(timer/60)}:${String(timer%60).padStart(2,"0")}` : "Chrono 15min"}
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-emerald-800">
            {sessionType === "sabaq" ? "Hizb nouvellement mémorisé" :
             sessionType === "sabaq_para" ? "Hizb récité sans mushaf" :
             sessionType === "dhor" ? "Ancien hizb en rotation" :
             sessionType === "rattrapage" ? "Hizb à retravailler" :
             sessionType === "test_surprise" ? "Test surprise" :
             sessionType === "khatm_partiel" ? `Khatm Juz ${selectedSession?.juz_number ?? ""}` :
             "Hizb évalués"}
          </h4>
          {sessionType !== "khatm_partiel" && (
            <Button size="sm" variant="outline" onClick={addEval} className="border-emerald-300 text-emerald-700">
              <Plus className="h-4 w-4" /> Ajouter un hizb
            </Button>
          )}
        </div>
        {evals.map((e, i) => (
          <Card key={i} className="border-emerald-100">
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                {e.hizb_number && e.surah_start ? (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Hizb {e.hizb_number} (auto)</span>
                ) : null}
                {evals.length > 1 && sessionType !== "khatm_partiel" && (
                  <Button size="sm" variant="ghost" className="ml-auto" onClick={() => removeEval(i)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                )}
              </div>

              <div className="flex gap-2">
                <Button size="sm" type="button" onClick={() => updateEval(i, { status: "valide" })}
                  className={e.status === "valide" ? "bg-emerald-700 text-white" : "bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100"}
                  variant={e.status === "valide" ? "default" : "outline"}>✅ Validé</Button>
                <Button size="sm" type="button" onClick={() => updateEval(i, { status: "a_retravailler", niveau: "" })}
                  className={e.status === "a_retravailler" ? "bg-red-600 text-white" : "bg-red-50 text-red-700 border border-red-300 hover:bg-red-100"}
                  variant={e.status === "a_retravailler" ? "default" : "outline"}>❌ À retravailler</Button>
              </div>

              {e.status === "valide" && (
                <div className="flex flex-wrap gap-2">
                  {NIVEAUX.map((n) => (
                    <Button key={n.value} size="sm" type="button"
                      variant={e.niveau === n.value ? "default" : "outline"}
                      onClick={() => updateEval(i, { niveau: n.value })}
                      className={e.niveau === n.value ? n.color : ""}>{n.label}</Button>
                  ))}
                </div>
              )}

              {/* Champs spécifiques par type */}
              {sessionType === "sabaq" && e.status === "valide" && (
                <div>
                  <Label className="text-xs">Prêt à avancer au hizb suivant ?</Label>
                  <div className="flex gap-2 mt-1">
                    <Button size="sm" variant={e.ready_to_advance === true ? "default" : "outline"} onClick={() => updateEval(i, { ready_to_advance: true })} className={e.ready_to_advance === true ? "bg-emerald-700 text-white" : ""}>Oui</Button>
                    <Button size="sm" variant={e.ready_to_advance === false ? "default" : "outline"} onClick={() => updateEval(i, { ready_to_advance: false })} className={e.ready_to_advance === false ? "bg-amber-600 text-white" : ""}>Non</Button>
                  </div>
                </div>
              )}
              {sessionType === "sabaq_para" && (
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={e.without_mushaf !== false} onChange={(ev) => updateEval(i, { without_mushaf: ev.target.checked })} />
                  Récité sans mushaf
                </label>
              )}
              {sessionType === "khatm_partiel" && (
                <div>
                  <Label className="text-xs">Fluidité générale</Label>
                  <Select value={e.fluidity || ""} onValueChange={(v) => updateEval(i, { fluidity: v })}>
                    <SelectTrigger className="bg-white"><SelectValue placeholder="Choisir..." /></SelectTrigger>
                    <SelectContent>
                      {FLUIDITY.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Textarea placeholder="Notes (optionnel)" value={e.notes}
                onChange={(ev) => updateEval(i, { notes: ev.target.value })} className="bg-white" rows={2} />

              {/* ── Plage sourate / verset récitée ── */}
              <div className="space-y-2 pt-1 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Plage récitée (optionnel)</p>
                <div className="grid grid-cols-2 gap-3">
                  {/* Début */}
                  <div className="space-y-1">
                    <Label className="text-xs text-emerald-700 font-semibold">Début</Label>
                    <Select
                      value={e.surah_start ? String(e.surah_start) : ""}
                      onValueChange={(v) => {
                        const updated = { ...e, surah_start: +v, verse_start: 1 };
                        updateEval(i, updated);
                        resolvePages(i, updated);
                      }}
                    >
                      <SelectTrigger className="bg-white h-8 text-xs">
                        <SelectValue placeholder="Sourate…" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        {surahList.map((s) => (
                          <SelectItem key={s.number} value={String(s.number)} className="text-xs">
                            {s.number}. {s.nameArabic} — {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number" min={1}
                      max={surahList.find((s) => s.number === e.surah_start)?.versesCount ?? 999}
                      placeholder="Verset"
                      value={e.verse_start ?? ""}
                      className="h-8 text-xs bg-white"
                      onChange={(ev) => updateEval(i, { verse_start: +ev.target.value })}
                      onBlur={() => resolvePages(i, e)}
                    />
                  </div>
                  {/* Fin */}
                  <div className="space-y-1">
                    <Label className="text-xs text-amber-700 font-semibold">Fin</Label>
                    <Select
                      value={e.surah_end ? String(e.surah_end) : ""}
                      onValueChange={(v) => {
                        const updated = { ...e, surah_end: +v, verse_end: 1 };
                        updateEval(i, updated);
                        resolvePages(i, updated);
                      }}
                    >
                      <SelectTrigger className="bg-white h-8 text-xs">
                        <SelectValue placeholder="Sourate…" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        {surahList.map((s) => (
                          <SelectItem key={s.number} value={String(s.number)} className="text-xs">
                            {s.number}. {s.nameArabic} — {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number" min={1}
                      max={surahList.find((s) => s.number === e.surah_end)?.versesCount ?? 999}
                      placeholder="Verset"
                      value={e.verse_end ?? ""}
                      className="h-8 text-xs bg-white"
                      onChange={(ev) => updateEval(i, { verse_end: +ev.target.value })}
                      onBlur={() => resolvePages(i, e)}
                    />
                  </div>
                </div>

                {/* Pages calculées */}
                {loadingPage[i] ? (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" /> Calcul des pages…
                  </div>
                ) : e.page_start ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                      📖 Pages Mushaf : {e.page_start}{e.page_end && e.page_end !== e.page_start ? `–${e.page_end}` : ""}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewPage(e.page_start!)}
                      className="text-xs text-emerald-700 underline hover:text-emerald-900"
                    >
                      Voir page {e.page_start} →
                    </button>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button onClick={submit} disabled={saving} className="bg-emerald-700 hover:bg-emerald-800 text-white">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Enregistrer l'évaluation
      </Button>

      {/* Modal prévisualisation page Mushaf */}
      {previewPage !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPreviewPage(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-emerald-800">Page {previewPage} / 604</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => setPreviewPage(p => Math.max(1, (p ?? 1) - 1))}>‹</Button>
                  <Button size="sm" variant="outline" onClick={() => setPreviewPage(p => Math.min(604, (p ?? 1) + 1))}>›</Button>
                </div>
              </div>
              <button
                onClick={() => setPreviewPage(null)}
                className="text-muted-foreground hover:text-foreground text-xl leading-none"
              >
                ✕
              </button>
            </div>
            <div className="overflow-auto max-h-[75vh] bg-stone-100 flex items-center justify-center p-2">
              <img
                src={getMedinaPageUrl(previewPage)}
                alt={`Page ${previewPage} du Mushaf`}
                className="w-full max-w-lg rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────── Onglet Annotations Mushaf ────────────────── */
function AnnotateTab({ toast }: { toast: ReturnType<typeof useToast>["toast"] }) {
  const [students, setStudents] = useState<Array<{ user_id: string; first_name: string; last_name: string }>>([]);
  const [selectedStudent, setSelectedStudent] = useState<{ user_id: string; first_name: string; last_name: string } | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [loadingAnnotations, setLoadingAnnotations] = useState(false);

  useEffect(() => {
    supabase.from("profiles").select("user_id, first_name, last_name")
      .then(({ data }) => setStudents((data as any) || []));
  }, []);

  useEffect(() => {
    if (!selectedStudent) { setSessions([]); return; }
    supabase
      .from("hifz_sessions")
      .select("id, session_date, session_time, status, meet_link, notes_eleve, session_type, juz_number")
      .eq("student_id", selectedStudent.user_id)
      .in("status", ["confirmee", "effectuee"])
      .order("session_date", { ascending: false })
      .limit(10)
      .then(({ data }) => setSessions((data as any) || []));
  }, [selectedStudent]);

  const loadAnnotations = async () => {
    if (!selectedStudent) return;
    setLoadingAnnotations(true);
    const { data } = await supabase
      .from("hifz_mushaf_annotations" as any)
      .select("*")
      .eq("student_id", selectedStudent.user_id)
      .order("created_at", { ascending: false })
      .limit(20);
    setAnnotations((data as any) || []);
    setLoadingAnnotations(false);
  };

  useEffect(() => { if (selectedStudent) loadAnnotations(); }, [selectedStudent]);

  return (
    <div className="space-y-4">
      {/* Sélection élève */}
      <div className="flex gap-3 flex-wrap items-end">
        <div className="space-y-1 flex-1 min-w-[180px]">
          <Label className="text-sm font-medium flex items-center gap-1">
            <PenLine className="h-4 w-4 text-emerald-700" /> Élève
          </Label>
          <Select
            value={selectedStudent?.user_id || ""}
            onValueChange={(id) => {
              const s = students.find((s) => s.user_id === id) || null;
              setSelectedStudent(s);
              setSelectedSessionId("");
            }}
          >
            <SelectTrigger><SelectValue placeholder="Choisir un élève…" /></SelectTrigger>
            <SelectContent>
              {students.map((s) => (
                <SelectItem key={s.user_id} value={s.user_id}>
                  {s.first_name} {s.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {sessions.length > 0 && (
          <div className="space-y-1 flex-1 min-w-[200px]">
            <Label className="text-sm font-medium">Associer à une séance (optionnel)</Label>
            <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
              <SelectTrigger><SelectValue placeholder="Aucune séance sélectionnée" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Aucune</SelectItem>
                {sessions.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {format(parseISO(s.session_date), "d MMM yyyy", { locale: fr })} · {s.session_time.slice(0, 5)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {!selectedStudent ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center border border-dashed border-emerald-200 rounded-xl bg-emerald-50/30">
          <PenLine className="h-10 w-10 text-emerald-300" />
          <p className="text-sm text-muted-foreground">Sélectionnez un élève pour ouvrir le Mushaf de Médine et annoter directement.</p>
        </div>
      ) : (
        <>
          <MushafAnnotator
            studentId={selectedStudent.user_id}
            studentName={`${selectedStudent.first_name} ${selectedStudent.last_name}`}
            sessionId={selectedSessionId || null}
            onSaved={loadAnnotations}
          />

          {/* Annotations déjà sauvegardées */}
          {annotations.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Annotations sauvegardées ({annotations.length})
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {annotations.map((a: any) => (
                  <div key={a.id} className="relative group rounded-lg overflow-hidden border border-border">
                    <a href={a.annotated_image_url} target="_blank" rel="noreferrer">
                      <img
                        src={a.annotated_image_url}
                        alt={`Page ${a.page_number}`}
                        className="w-full object-cover hover:opacity-90 transition"
                        style={{ maxHeight: 140 }}
                      />
                    </a>
                    <div className="px-2 py-1 text-xs bg-background/90 flex items-center justify-between gap-1">
                      <span className="font-medium">Page {a.page_number}</span>
                      <button
                        className="text-destructive hover:underline text-[10px]"
                        onClick={async () => {
                          await supabase.from("hifz_mushaf_annotations" as any).delete().eq("id", a.id);
                          loadAnnotations();
                        }}
                      >
                        Suppr.
                      </button>
                    </div>
                    {a.note && (
                      <p className="px-2 pb-1 text-[10px] text-muted-foreground truncate">{a.note}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}


import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Tv, Plus, Trash2, ChevronLeft, Save, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Series { id: string; title_fr: string; title_ar: string; description_fr: string | null; level: string; age_range: string; sort_order: number; }
interface Episode { id: string; series_id: string; episode_number: number; title_fr: string | null; title_ar: string | null; youtube_id: string; duration_minutes: number | null; is_free: boolean; }

const LEVEL_LABELS: Record<string, string> = { tous: "Tous niveaux", debutant: "Débutant", intermediaire: "Intermédiaire", avance: "Avancé" };

const emptySeriesForm = { title_fr: "", title_ar: "", description_fr: "", level: "tous", age_range: "4-12 ans", sort_order: 0 };
const emptyEpForm = { episode_number: 1, title_fr: "", title_ar: "", youtube_id: "", duration_minutes: "", is_free: false };

export default function AdminCartoons() {
  const [series, setSeries] = useState<Series[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSeriesForm, setShowSeriesForm] = useState(false);
  const [showEpForm, setShowEpForm] = useState(false);
  const [seriesForm, setSeriesForm] = useState(emptySeriesForm);
  const [epForm, setEpForm] = useState(emptyEpForm);

  useEffect(() => { loadSeries(); }, []);

  const loadSeries = async () => {
    setLoading(true);
    const { data } = await supabase.from("cartoon_series").select("*").order("sort_order");
    setSeries((data || []) as unknown as Series[]);
    setLoading(false);
  };

  const loadEpisodes = async (seriesId: string) => {
    const { data } = await supabase.from("cartoon_episodes").select("*").eq("series_id", seriesId).order("episode_number");
    setEpisodes((data || []) as unknown as Episode[]);
  };

  const handleSelectSeries = (s: Series) => {
    setSelectedSeries(s);
    loadEpisodes(s.id);
  };

  const handleSaveSeries = async () => {
    if (!seriesForm.title_fr || !seriesForm.title_ar) { toast.error("Titre FR et AR requis"); return; }
    setSaving(true);
    const { error } = await supabase.from("cartoon_series" as any).insert({
      title_fr: seriesForm.title_fr,
      title_ar: seriesForm.title_ar,
      description_fr: seriesForm.description_fr || null,
      level: seriesForm.level,
      age_range: seriesForm.age_range,
      sort_order: seriesForm.sort_order,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Série ajoutée !");
    setSeriesForm(emptySeriesForm);
    setShowSeriesForm(false);
    loadSeries();
  };

  const handleDeleteSeries = async (id: string) => {
    const { error } = await supabase.from("cartoon_series" as any).delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Série supprimée");
    if (selectedSeries?.id === id) setSelectedSeries(null);
    loadSeries();
  };

  const handleSaveEpisode = async () => {
    if (!epForm.youtube_id || !selectedSeries) { toast.error("ID YouTube requis"); return; }
    setSaving(true);
    const { error } = await supabase.from("cartoon_episodes" as any).insert({
      series_id: selectedSeries.id,
      episode_number: Number(epForm.episode_number),
      title_fr: epForm.title_fr || null,
      title_ar: epForm.title_ar || null,
      youtube_id: epForm.youtube_id.trim(),
      duration_minutes: epForm.duration_minutes ? Number(epForm.duration_minutes) : null,
      is_free: epForm.is_free,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Épisode ajouté !");
    setEpForm({ ...emptyEpForm, episode_number: episodes.length + 2 });
    setShowEpForm(false);
    loadEpisodes(selectedSeries.id);
  };

  const handleDeleteEpisode = async (id: string) => {
    const { error } = await supabase.from("cartoon_episodes" as any).delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Épisode supprimé");
    if (selectedSeries) loadEpisodes(selectedSeries.id);
  };

  const toggleFree = async (ep: Episode) => {
    await supabase.from("cartoon_episodes" as any).update({ is_free: !ep.is_free } as any).eq("id", ep.id);
    if (selectedSeries) loadEpisodes(selectedSeries.id);
  };

  if (loading) return <p className="text-center text-muted-foreground py-8">Chargement...</p>;

  // Episode management view
  if (selectedSeries) {
    return (
      <div>
        <button onClick={() => setSelectedSeries(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ChevronLeft className="h-4 w-4" /> Retour aux séries
        </button>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold">{selectedSeries.title_fr}</h3>
            <p className="font-arabic text-primary" dir="rtl">{selectedSeries.title_ar}</p>
          </div>
          <Button size="sm" onClick={() => { setEpForm({ ...emptyEpForm, episode_number: episodes.length + 1 }); setShowEpForm(true); }} className="gap-2 gradient-emerald border-0 text-primary-foreground">
            <Plus className="h-4 w-4" /> Ajouter un épisode
          </Button>
        </div>

        {showEpForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl border border-border bg-card space-y-3">
            <h4 className="font-semibold">Nouvel épisode</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">N° épisode</label>
                <Input type="number" value={epForm.episode_number} onChange={e => setEpForm(f => ({ ...f, episode_number: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Durée (min)</label>
                <Input type="number" placeholder="25" value={epForm.duration_minutes} onChange={e => setEpForm(f => ({ ...f, duration_minutes: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">ID YouTube <span className="text-destructive">*</span></label>
              <Input placeholder="ex: dQw4w9WgXcQ" value={epForm.youtube_id} onChange={e => setEpForm(f => ({ ...f, youtube_id: e.target.value }))} />
              <p className="text-xs text-muted-foreground mt-1">L'ID est la partie après <code>watch?v=</code> dans l'URL YouTube</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Titre FR</label>
                <Input placeholder="Épisode 1" value={epForm.title_fr} onChange={e => setEpForm(f => ({ ...f, title_fr: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Titre AR</label>
                <Input placeholder="الحلقة الأولى" dir="rtl" value={epForm.title_ar} onChange={e => setEpForm(f => ({ ...f, title_ar: e.target.value }))} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_free" checked={epForm.is_free} onChange={e => setEpForm(f => ({ ...f, is_free: e.target.checked }))} className="rounded" />
              <label htmlFor="is_free" className="text-sm">Épisode gratuit (accessible sans abonnement)</label>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveEpisode} disabled={saving} className="gap-2 gradient-emerald border-0 text-primary-foreground">
                <Save className="h-4 w-4" /> {saving ? "Enregistrement…" : "Enregistrer"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowEpForm(false)}>Annuler</Button>
            </div>
          </motion.div>
        )}

        <div className="space-y-2">
          {episodes.length === 0 && <p className="text-center text-muted-foreground py-8">Aucun épisode. Ajoutez-en un ci-dessus.</p>}
          {episodes.map((ep, i) => (
            <motion.div key={ep.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
              <img src={`https://img.youtube.com/vi/${ep.youtube_id}/default.jpg`} alt="" className="w-16 h-12 object-cover rounded-lg bg-muted shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Ép. {ep.episode_number} — {ep.title_fr || "Sans titre"}</p>
                {ep.title_ar && <p className="font-arabic text-xs text-primary" dir="rtl">{ep.title_ar}</p>}
                <p className="text-xs text-muted-foreground font-mono">{ep.youtube_id}</p>
              </div>
              <button onClick={() => toggleFree(ep)}
                className={`text-xs font-semibold px-2 py-1 rounded-full border transition-colors ${ep.is_free ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-muted text-muted-foreground border-border"}`}>
                {ep.is_free ? "Gratuit" : "Premium"}
              </button>
              <a href={`https://youtube.com/watch?v=${ep.youtube_id}`} target="_blank" rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors p-1">
                <ExternalLink className="h-4 w-4" />
              </a>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleDeleteEpisode(ep.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Series list view
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Tv className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Dessins Animés ({series.length})</h2>
        <Button size="sm" onClick={() => { setSeriesForm(emptySeriesForm); setShowSeriesForm(v => !v); }} className="ml-auto gap-2 gradient-emerald border-0 text-primary-foreground">
          <Plus className="h-4 w-4" /> Nouvelle série
        </Button>
      </div>

      {showSeriesForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl border border-border bg-card space-y-3">
          <h4 className="font-semibold">Nouvelle série</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Titre français <span className="text-destructive">*</span></label>
              <Input placeholder="Histoires des Prophètes" value={seriesForm.title_fr} onChange={e => setSeriesForm(f => ({ ...f, title_fr: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Titre arabe <span className="text-destructive">*</span></label>
              <Input placeholder="قصص الأنبياء" dir="rtl" value={seriesForm.title_ar} onChange={e => setSeriesForm(f => ({ ...f, title_ar: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Description</label>
            <Textarea placeholder="Description de la série…" value={seriesForm.description_fr} onChange={e => setSeriesForm(f => ({ ...f, description_fr: e.target.value }))} rows={2} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Niveau</label>
              <select value={seriesForm.level} onChange={e => setSeriesForm(f => ({ ...f, level: e.target.value }))}
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background">
                {Object.entries(LEVEL_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Tranche d'âge</label>
              <Input placeholder="4-12 ans" value={seriesForm.age_range} onChange={e => setSeriesForm(f => ({ ...f, age_range: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Ordre d'affichage</label>
              <Input type="number" value={seriesForm.sort_order} onChange={e => setSeriesForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveSeries} disabled={saving} className="gap-2 gradient-emerald border-0 text-primary-foreground">
              <Save className="h-4 w-4" /> {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowSeriesForm(false)}>Annuler</Button>
          </div>
        </motion.div>
      )}

      <div className="space-y-2">
        {series.length === 0 && (
          <p className="text-center text-muted-foreground py-12">Aucune série. Cliquez sur "Nouvelle série" pour commencer.</p>
        )}
        {series.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleSelectSeries(s)}>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">{s.title_fr}</p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{LEVEL_LABELS[s.level]}</span>
              </div>
              <p className="font-arabic text-primary text-sm" dir="rtl">{s.title_ar}</p>
              {s.description_fr && <p className="text-xs text-muted-foreground mt-0.5 truncate">{s.description_fr}</p>}
            </div>
            <Button size="sm" variant="outline" onClick={() => handleSelectSeries(s)} className="shrink-0">
              Gérer les épisodes
            </Button>
            <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteSeries(s.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

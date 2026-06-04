// Mushaf annotator — avec mode Tajwid intégré
// Couleurs standard par règle, encodées dans le note : [tajwid:rule1,rule2] …
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft, ChevronRight, Eraser, Undo2, Trash2,
  Save, Loader2, ZoomIn, ZoomOut, Pencil, BookOpen, X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// ── Règles de Tajwid avec couleurs standardisées ──────────────────────────────
export const TAJWID_RULES = [
  { id: "ghunna",  ar: "غُنَّة",    fr: "Ghunna",   color: "#22c55e", desc: "Nûn / Mîm chaddées" },
  { id: "ikhfa",   ar: "إخفاء",    fr: "Ikhfâ",    color: "#f97316", desc: "Dissimulation nasale" },
  { id: "idgham",  ar: "إدغام",    fr: "Idghâm",   color: "#3b82f6", desc: "Assimilation" },
  { id: "iqlab",   ar: "إقلاب",    fr: "Iqlâb",    color: "#ec4899", desc: "Transformation en Mîm" },
  { id: "izhar",   ar: "إظهار",    fr: "Izhâr",    color: "#8b5cf6", desc: "Prononciation claire" },
  { id: "madd",    ar: "مَدّ",      fr: "Madd",     color: "#14b8a6", desc: "Prolongation vocale" },
  { id: "qalqala", ar: "قَلْقَلَة", fr: "Qalqala",  color: "#eab308", desc: "Vibration consonantique" },
  { id: "tafkhim", ar: "تَفْخِيم",  fr: "Tafkhîm",  color: "#dc2626", desc: "Emphatisation" },
  { id: "tarqiq",  ar: "تَرْقِيق",  fr: "Tarqîq",   color: "#0ea5e9", desc: "Amincissement" },
  { id: "waqf",    ar: "وَقْف",    fr: "Waqf",     color: "#6b7280", desc: "Arrêt / Pause" },
] as const;

export type TajwidRuleId = typeof TAJWID_RULES[number]["id"];

// ── Utilitaire partagé — parsing du préfixe [tajwid:…] ────────────────────────
export function parseTajwidNote(raw: string | null | undefined): {
  rules: TajwidRuleId[];
  note: string;
} {
  if (!raw) return { rules: [], note: "" };
  const m = raw.match(/^\[tajwid:([^\]]+)\]\s*([\s\S]*)/);
  if (!m) return { rules: [], note: raw };
  const ids = m[1].split(",").filter(id => TAJWID_RULES.some(r => r.id === id)) as TajwidRuleId[];
  return { rules: ids, note: m[2] };
}

// ── Composant légende (réutilisé dans les modales étudiant & admin) ────────────
export function TajwidLegend({ rules }: { rules: TajwidRuleId[] }) {
  if (!rules.length) return null;
  return (
    <div className="px-4 py-3 border-t border-emerald-100 bg-emerald-50/60">
      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 mb-2">
        Règles de Tajwid annotées
      </p>
      <div className="flex flex-wrap gap-2">
        {rules.map(id => {
          const rule = TAJWID_RULES.find(r => r.id === id)!;
          return (
            <span key={id} className="flex items-center gap-1.5 text-xs font-medium bg-white border border-border rounded-full px-2.5 py-1 shadow-sm">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: rule.color }} />
              <span className="font-arabic text-sm leading-none" style={{ color: rule.color }}>{rule.ar}</span>
              <span className="text-gray-500">{rule.fr}</span>
              <span className="text-[10px] text-muted-foreground hidden sm:inline">— {rule.desc}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const FREE_COLORS = ["#ef4444", "#22c55e", "#3b82f6", "#eab308", "#a855f7", "#000000"];
const SIZES = [2, 4, 8, 14];

function getMushafUrl(page: number) {
  return `https://www.mp3quran.net/api/quran_pages_arabic/${String(page).padStart(3, "0")}.png`;
}

interface Props {
  studentId: string;
  studentName: string;
  sessionId?: string | null;
  initialPage?: number;
  onSaved?: () => void;
}

export default function MushafAnnotator({ studentId, studentName, sessionId, initialPage = 1, onSaved }: Props) {
  const { toast } = useToast();

  const [page, setPage]           = useState(initialPage);
  const [pageInput, setPageInput] = useState(String(initialPage));
  const [ready, setReady]         = useState(false);

  const [tool, setTool]   = useState<"pen" | "eraser">("pen");
  const [color, setColor] = useState(FREE_COLORS[0]);
  const [size, setSize]   = useState(SIZES[1]);

  // ── Mode Tajwid ──
  const [tajwidMode, setTajwidMode]         = useState(false);
  const [activeRuleId, setActiveRuleId]     = useState<TajwidRuleId | null>(null);
  const [usedRuleIds, setUsedRuleIds]       = useState<Set<TajwidRuleId>>(new Set());

  const isDrawing = useRef(false);
  const lastPt    = useRef<{ x: number; y: number } | null>(null);
  const canvasOk  = useRef(false);

  const [history, setHistory]       = useState<ImageData[]>([]);
  const [hasStrokes, setHasStrokes] = useState(false);
  const [zoom, setZoom]             = useState(1);
  const [saving, setSaving]         = useState(false);
  const [note, setNote]             = useState("");

  const imgRef    = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Couleur effective (tajwid override ou libre)
  const effectiveColor = tajwidMode && activeRuleId
    ? TAJWID_RULES.find(r => r.id === activeRuleId)!.color
    : color;

  // Préchargement pages adjacentes
  useEffect(() => {
    [page - 1, page + 1].filter(p => p >= 1 && p <= 604).forEach(p => {
      const img = new Image();
      img.src = getMushafUrl(p);
    });
  }, [page]);

  // ── Image chargée ─────────────────────────────────────────────────────────
  const onImgLoad = () => {
    const img = imgRef.current;
    const cv  = canvasRef.current;
    if (!img || !cv) return;
    const w = img.offsetWidth  || img.naturalWidth;
    const h = img.offsetHeight || img.naturalHeight;
    if (!w || !h) return;
    cv.width  = w;
    cv.height = h;
    cv.getContext("2d")!.clearRect(0, 0, w, h);
    canvasOk.current = true;
    setReady(true);
  };

  // ── Navigation ────────────────────────────────────────────────────────────
  const goTo = (p: number) => {
    const c = Math.max(1, Math.min(604, p));
    if (c === page) return;
    canvasOk.current = false;
    setReady(false);
    setHasStrokes(false);
    setHistory([]);
    setZoom(1);
    setUsedRuleIds(new Set());
    const cv = canvasRef.current;
    if (cv) cv.getContext("2d")!.clearRect(0, 0, cv.width, cv.height);
    setPage(c);
    setPageInput(String(c));
  };

  // ── Dessin ────────────────────────────────────────────────────────────────
  const getPt = (e: React.PointerEvent) => {
    const cv   = canvasRef.current!;
    const rect = cv.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (cv.width  / rect.width),
      y: (e.clientY - rect.top)  * (cv.height / rect.height),
    };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!canvasOk.current) return;
    const cv  = canvasRef.current!;
    const ctx = cv.getContext("2d")!;
    setHistory(h => [...h.slice(-30), ctx.getImageData(0, 0, cv.width, cv.height)]);
    isDrawing.current = true;
    lastPt.current    = getPt(e);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDrawing.current || !lastPt.current || !canvasOk.current) return;
    const cv  = canvasRef.current!;
    const ctx = cv.getContext("2d")!;
    const pt  = getPt(e);
    ctx.beginPath();
    ctx.lineCap = ctx.lineJoin = "round";
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth   = size * 4;
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.lineWidth   = size;
      ctx.strokeStyle = effectiveColor;
      // Enregistrer la règle utilisée
      if (tajwidMode && activeRuleId) {
        setUsedRuleIds(prev => {
          if (prev.has(activeRuleId)) return prev;
          const next = new Set(prev);
          next.add(activeRuleId);
          return next;
        });
      }
    }
    ctx.moveTo(lastPt.current.x, lastPt.current.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
    lastPt.current = pt;
    setHasStrokes(true);
  };

  const onPointerUp = () => { isDrawing.current = false; lastPt.current = null; };

  const undo = () => {
    if (!history.length) return;
    canvasRef.current!.getContext("2d")!.putImageData(history[history.length - 1], 0, 0);
    setHistory(h => h.slice(0, -1));
    if (history.length <= 1) setHasStrokes(false);
  };

  const clear = () => {
    const cv = canvasRef.current!;
    cv.getContext("2d")!.clearRect(0, 0, cv.width, cv.height);
    setHistory([]);
    setHasStrokes(false);
    setUsedRuleIds(new Set());
  };

  // ── Sauvegarde ────────────────────────────────────────────────────────────
  const save = async () => {
    if (!hasStrokes) { toast({ title: "Aucune annotation", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const cv  = canvasRef.current!;
      const blob: Blob = await new Promise((res, rej) =>
        cv.toBlob(b => b ? res(b) : rej(new Error("toBlob failed")), "image/png")
      );
      const path = `hifz-annotations/${studentId}/page-${page}-${Date.now()}.png`;
      const { error: upErr } = await supabase.storage.from("presentiel-courses")
        .upload(path, blob, { contentType: "image/png" });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("presentiel-courses").getPublicUrl(path);

      // Encoder les règles tajwid utilisées dans la note
      const rulesPrefix = usedRuleIds.size > 0
        ? `[tajwid:${[...usedRuleIds].join(",")}] `
        : "";
      const finalNote = (rulesPrefix + note.trim()) || null;

      const { error: dbErr } = await supabase.from("hifz_mushaf_annotations" as any).insert({
        student_id: studentId, page_number: page,
        annotated_image_url: publicUrl,
        note: finalNote, session_id: sessionId || null,
      });
      if (dbErr) throw dbErr;
      toast({ title: `Page ${page} sauvegardée ✓`, description: `Pour ${studentName}` });
      clear(); setNote(""); onSaved?.();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  // ── Sélection d'une règle tajwid ──────────────────────────────────────────
  const selectRule = (id: TajwidRuleId) => {
    setActiveRuleId(id);
    setTool("pen");
  };

  const toggleTajwidMode = () => {
    setTajwidMode(m => {
      if (!m) setActiveRuleId(TAJWID_RULES[0].id); // Sélectionner Ghunna par défaut
      else setActiveRuleId(null);
      return !m;
    });
  };

  const activeRule = TAJWID_RULES.find(r => r.id === activeRuleId);

  return (
    <div className="space-y-3">

      {/* ── Barre d'outils principale ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/40 rounded-xl border border-border">

        {/* Navigation */}
        <Button size="sm" variant="outline" onClick={() => goTo(page - 1)} disabled={page <= 1}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1">
          <Input type="number" min={1} max={604} value={pageInput}
            onChange={e => setPageInput(e.target.value)}
            onBlur={() => goTo(Number(pageInput) || page)}
            onKeyDown={e => e.key === "Enter" && goTo(Number(pageInput) || page)}
            className="h-8 w-16 text-center text-sm" />
          <span className="text-xs text-muted-foreground">/ 604</span>
        </div>
        <Button size="sm" variant="outline" onClick={() => goTo(page + 1)} disabled={page >= 604}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Outils */}
        <Button size="sm" variant={tool === "pen" ? "default" : "outline"}
          onClick={() => setTool("pen")} className="gap-1">
          <Pencil className="h-3.5 w-3.5" /> Stylo
        </Button>
        <Button size="sm" variant={tool === "eraser" ? "default" : "outline"}
          onClick={() => setTool("eraser")} className="gap-1">
          <Eraser className="h-3.5 w-3.5" /> Gomme
        </Button>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Toggle mode Tajwid */}
        <Button
          size="sm"
          variant={tajwidMode ? "default" : "outline"}
          onClick={toggleTajwidMode}
          className={`gap-1.5 font-medium ${tajwidMode ? "bg-emerald-700 hover:bg-emerald-800 text-white border-0" : "border-emerald-400 text-emerald-700 hover:bg-emerald-50"}`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          Tajwid
          {tajwidMode && activeRule && (
            <span className="w-3 h-3 rounded-full border border-white/40 ml-0.5" style={{ backgroundColor: activeRule.color }} />
          )}
        </Button>

        {/* Palette couleurs libres (masquée en mode Tajwid) */}
        {!tajwidMode && (
          <div className="flex gap-1">
            {FREE_COLORS.map(c => (
              <button key={c} onClick={() => { setColor(c); setTool("pen"); }}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${color === c && tool === "pen" ? "scale-125 border-foreground" : "border-transparent"}`}
                style={{ backgroundColor: c }} />
            ))}
          </div>
        )}

        {/* Tailles */}
        <div className="flex gap-1 items-center">
          {SIZES.map(s => (
            <button key={s} onClick={() => setSize(s)}
              className={`rounded-full bg-foreground transition-all ${size === s ? "opacity-100 ring-2 ring-primary ring-offset-1" : "opacity-30"}`}
              style={{ width: Math.max(8, s + 4), height: Math.max(8, s + 4) }} />
          ))}
        </div>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Zoom */}
        <Button size="sm" variant="outline" onClick={() => setZoom(z => Math.min(2.5, +(z + 0.25).toFixed(2)))} className="px-2">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <span className="text-xs text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
        <Button size="sm" variant="outline" onClick={() => setZoom(z => Math.max(0.5, +(z - 0.25).toFixed(2)))} className="px-2">
          <ZoomOut className="h-4 w-4" />
        </Button>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Historique / effacer */}
        <Button size="sm" variant="outline" onClick={undo} disabled={!history.length}>
          <Undo2 className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="outline" onClick={clear} disabled={!hasStrokes}
          className="text-destructive border-destructive/30">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>

        <span className="text-xs ml-1" style={{ color: ready ? "#16a34a" : "#9ca3af" }}>
          {ready ? "✓ Prêt" : "Chargement…"}
        </span>
      </div>

      {/* ── Palette Tajwid (panel dépliable) ───────────────────────────────── */}
      {tajwidMode && (
        <div className="rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" /> Règles de Tajwid — sélectionnez une règle puis dessinez
            </p>
            <button onClick={toggleTajwidMode} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {TAJWID_RULES.map(rule => {
              const isActive = activeRuleId === rule.id;
              return (
                <button
                  key={rule.id}
                  type="button"
                  onClick={() => selectRule(rule.id)}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border-2 text-left transition-all ${
                    isActive
                      ? "border-current shadow-md scale-[1.03]"
                      : "border-transparent bg-white hover:border-gray-200 hover:shadow-sm"
                  }`}
                  style={isActive ? { borderColor: rule.color, backgroundColor: rule.color + "18" } : {}}
                >
                  <span className="w-4 h-4 rounded-full shrink-0 border border-white/50 shadow-sm"
                    style={{ backgroundColor: rule.color }} />
                  <span className="flex flex-col min-w-0">
                    <span className="font-arabic text-sm leading-none" style={{ color: rule.color, fontWeight: isActive ? 700 : 500 }}>
                      {rule.ar}
                    </span>
                    <span className="text-[10px] text-gray-500 leading-tight truncate">{rule.fr}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Règle active + description */}
          {activeRule && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: activeRule.color + "15", color: activeRule.color }}>
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: activeRule.color }} />
              <span className="font-arabic text-base">{activeRule.ar}</span>
              <span className="font-semibold">{activeRule.fr}</span>
              <span className="text-xs font-normal opacity-70">— {activeRule.desc}</span>
            </div>
          )}

          {/* Règles déjà utilisées sur cette annotation */}
          {usedRuleIds.size > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-emerald-100">
              <span className="text-[10px] text-muted-foreground self-center">Utilisées :</span>
              {[...usedRuleIds].map(id => {
                const r = TAJWID_RULES.find(x => x.id === id)!;
                return (
                  <span key={id} className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: r.color + "20", color: r.color }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                    {r.fr}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Canvas Mushaf ───────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border overflow-auto bg-stone-100" style={{ maxHeight: "72vh" }}>
        <div style={{ transform: `scale(${zoom})`, transformOrigin: "top center", width: "100%" }}>
          <div style={{ position: "relative", width: "100%", maxWidth: "700px", margin: "0 auto" }}>
            <img
              ref={imgRef}
              key={page}
              src={getMushafUrl(page)}
              alt={`Page ${page}`}
              onLoad={onImgLoad}
              draggable={false}
              style={{ display: "block", width: "100%", userSelect: "none" }}
            />
            <canvas
              ref={canvasRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
              style={{
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                width: "100%", height: "100%",
                cursor: ready ? (tool === "eraser" ? "cell" : "crosshair") : "wait",
                touchAction: "none",
              }}
            />
            {/* Indicateur couleur active (coin bas droit) */}
            {ready && tool === "pen" && (
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1.5 shadow-lg border border-white/50 pointer-events-none">
                <span className="w-4 h-4 rounded-full border border-gray-200"
                  style={{ backgroundColor: effectiveColor }} />
                {tajwidMode && activeRule ? (
                  <span className="text-[10px] font-semibold" style={{ color: effectiveColor }}>
                    {activeRule.fr}
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-500">Libre</span>
                )}
                <span className="text-[10px] text-gray-400">·</span>
                <span className="text-[10px] text-gray-500">{size}px</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Sauvegarde ─────────────────────────────────────────────────────── */}
      <div className="flex gap-2 items-center flex-wrap">
        <Input value={note} onChange={e => setNote(e.target.value)}
          placeholder="Note pour l'élève (optionnel)…" className="flex-1 min-w-0 text-sm" />
        <Button onClick={save} disabled={saving || !hasStrokes}
          className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2 shrink-0">
          {saving
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Sauvegarde…</>
            : <><Save className="h-4 w-4" /> Sauvegarder</>}
        </Button>
        {hasStrokes && (
          <Badge variant="outline" className="border-emerald-500 text-emerald-600 text-xs">
            Non sauvegardé
          </Badge>
        )}
      </div>

      {/* Résumé des règles Tajwid qui seront sauvegardées */}
      {hasStrokes && usedRuleIds.size > 0 && (
        <div className="flex flex-wrap gap-1.5 px-1">
          <span className="text-[10px] text-muted-foreground self-center">Sera sauvegardé avec :</span>
          {[...usedRuleIds].map(id => {
            const r = TAJWID_RULES.find(x => x.id === id)!;
            return (
              <span key={id} className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border"
                style={{ borderColor: r.color + "60", backgroundColor: r.color + "12", color: r.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                {r.fr}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Mushaf annotator — mode Tajwid + outil Étiquette (capsule de règle sur la page)
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft, ChevronRight, Eraser, Undo2, Trash2,
  Save, Loader2, ZoomIn, ZoomOut, Pencil, BookOpen, X, Tag,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// ── Règles de Tajwid avec contenu pédagogique complet ────────────────────────
export const TAJWID_RULES = [
  {
    id: "ghunna",
    ar: "غُنَّة", fr: "Ghunna", color: "#22c55e",
    desc: "Son nasal sur Nûn/Mîm chaddées",
    detail: "La Ghunna est un son nasal obligatoire de 2 temps sur Nûn (ن) ou Mîm (م) portant un Chaddah (ّ). La résonance vient du nez, pas de la bouche.",
    letters: ["نّ", "مّ"],
    tip: "Imagine le son 'nnn' prolongé dans 'innocent' — tout passe par le nez.",
  },
  {
    id: "ikhfa",
    ar: "إخفاء", fr: "Ikhfâ", color: "#f97316",
    desc: "Dissimulation nasale (2 temps)",
    detail: "Devant 15 lettres, la Nûn sâkinah (نْ) ou le Tanwîn est dissimulée : ni complètement prononcée ni effacée — résonance nasale de 2 temps.",
    letters: ["ت","ث","ج","د","ذ","ز","س","ش","ص","ض","ط","ظ","ف","ق","ك"],
    tip: "Entre l'Izhâr (clair) et l'Idghâm (fondu) — son intermédiaire avec nasalité.",
  },
  {
    id: "idgham",
    ar: "إدغام", fr: "Idghâm", color: "#3b82f6",
    desc: "Assimilation / fusion de Nûn",
    detail: "La Nûn sâkinah (نْ) ou le Tanwîn fusionne dans la lettre suivante (ي ر م ل و ن). Avec Ghunna devant م et ن, sans Ghunna devant ل et ر.",
    letters: ["ي","ر","م","ل","و","ن"],
    tip: "La Nûn s'efface complètement dans la lettre suivante — deux sons deviennent un seul.",
  },
  {
    id: "iqlab",
    ar: "إقلاب", fr: "Iqlâb", color: "#ec4899",
    desc: "Transformation de Nûn en Mîm",
    detail: "La Nûn sâkinah (نْ) ou le Tanwîn devient un son de Mîm (م) caché avec Ghunna, uniquement devant la lettre Bâ (ب).",
    letters: ["ب"],
    tip: "Devant ب, prononce un 'm' nasal discret. Ex : مِن بَعْدِ → on entend un 'm' caché.",
  },
  {
    id: "izhar",
    ar: "إظهار", fr: "Izhâr", color: "#8b5cf6",
    desc: "Prononciation claire et nette",
    detail: "La Nûn sâkinah (نْ) ou le Tanwîn est prononcée clairement, sans nasalité ni fusion, devant les 6 lettres de gorge (حروف الحلق).",
    letters: ["ء","ه","ع","ح","غ","خ"],
    tip: "Prononciation franche et distincte — la Nûn reste entière, sans aucune résonance nasale.",
  },
  {
    id: "madd",
    ar: "مَدّ", fr: "Madd", color: "#14b8a6",
    desc: "Prolongation d'une voyelle",
    detail: "Allongement d'une voyelle (alif, wâw, yâ) sur 2, 4 ou 6 temps selon le type. Tabî'î (2t) est naturel, Muttasil/Munfasil (4-5t), Lâzim (6t).",
    letters: ["ا","و","ي"],
    tip: "Compte les temps avec ton doigt. Une ligne (~) dans le texte l'indique souvent.",
  },
  {
    id: "qalqala",
    ar: "قَلْقَلَة", fr: "Qalqala", color: "#eab308",
    desc: "Vibration/écho en fin de syllabe",
    detail: "Les 5 lettres de Qalqala (ق ط ب ج د) produisent un léger rebond sonore quand elles portent un Sukûn, surtout au waqf.",
    letters: ["ق","ط","ب","ج","د"],
    tip: "Imagine que la lettre 'rebondit' en s'arrêtant. Plus fort à la fin du verset.",
  },
  {
    id: "tafkhim",
    ar: "تَفْخِيم", fr: "Tafkhîm", color: "#dc2626",
    desc: "Son grave/épais (lettres lourdes)",
    detail: "Son prononcé du fond de la bouche, grave et plein, pour les lettres emphatiques (خ ص ض غ ط ق ظ) et le Raa (ر) dans certains contextes.",
    letters: ["خ","ص","ض","غ","ط","ق","ظ","ر"],
    tip: "Bouche légèrement arrondie, son qui résonne 'en arrière'. Opposé du Tarqîq.",
  },
  {
    id: "tarqiq",
    ar: "تَرْقِيق", fr: "Tarqîq", color: "#0ea5e9",
    desc: "Son fin/léger (lettres légères)",
    detail: "Prononciation fine, à l'avant de la bouche, pour le Raa (ر) dans certains contextes et la lettre Lâm dans الله précédé de kasrah.",
    letters: ["ر","ل"],
    tip: "Son léger et étiré vers le haut. Contraire du Tafkhîm.",
  },
  {
    id: "waqf",
    ar: "وَقْف", fr: "Waqf", color: "#6b7280",
    desc: "Arrêt / Pause lors de la récitation",
    detail: "Règles de pause : م = arrêt obligatoire, ج = pause autorisée, ط = arrêt absolu, لا = pas d'arrêt, ص = pause sans couper le souffle.",
    letters: ["م","ج","ط","ز","لا","ص"],
    tip: "Respecte les signes de waqf : ils donnent le sens correct à la récitation.",
  },
] as const;

export type TajwidRuleId = typeof TAJWID_RULES[number]["id"];

// ── Utilitaire — parsing du préfixe [tajwid:…] ────────────────────────────────
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

// ── Légende éducative dépliable ───────────────────────────────────────────────
export function TajwidLegend({ rules }: { rules: TajwidRuleId[] }) {
  const [expanded, setExpanded] = useState<TajwidRuleId | null>(null);
  if (!rules.length) return null;
  return (
    <div className="border-t border-emerald-100 bg-gradient-to-b from-emerald-50/80 to-white">
      <div className="px-4 pt-3 pb-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 flex items-center gap-1.5">
          <BookOpen className="h-3 w-3" /> Règles annotées — cliquez pour comprendre
        </p>
      </div>
      <div className="px-3 pb-3 space-y-1.5">
        {rules.map(id => {
          const rule = TAJWID_RULES.find(r => r.id === id)!;
          const isOpen = expanded === id;
          return (
            <div key={id} className="rounded-xl overflow-hidden border transition-all"
              style={{ borderColor: isOpen ? rule.color + "60" : "#e5e7eb" }}>
              <button type="button"
                onClick={() => setExpanded(isOpen ? null : id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-gray-50/80"
                style={{ backgroundColor: isOpen ? rule.color + "0c" : "transparent" }}>
                <span className="w-4 h-4 rounded-full shrink-0 shadow-sm border border-white/60"
                  style={{ backgroundColor: rule.color }} />
                <span className="font-arabic text-lg leading-none shrink-0" style={{ color: rule.color }}>{rule.ar}</span>
                <span className="font-semibold text-sm text-gray-800 shrink-0">{rule.fr}</span>
                <span className="text-xs text-gray-400 flex-1 truncate">— {rule.desc}</span>
                {isOpen ? <ChevronUp className="h-3.5 w-3.5 text-gray-400 shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0" />}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-1 space-y-3 border-t"
                  style={{ borderColor: rule.color + "30", backgroundColor: rule.color + "06" }}>
                  <p className="text-sm text-gray-700 leading-relaxed">{rule.detail}</p>
                  {rule.letters.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Lettres concernées</p>
                      <div className="flex flex-wrap gap-1.5">
                        {rule.letters.map((l, i) => (
                          <span key={i} className="font-arabic text-lg px-2.5 py-1 rounded-lg border font-medium"
                            style={{ borderColor: rule.color + "50", backgroundColor: rule.color + "12", color: rule.color }}>
                            {l}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 items-start px-3 py-2 rounded-lg"
                    style={{ backgroundColor: rule.color + "14" }}>
                    <span className="text-base shrink-0 mt-0.5">💡</span>
                    <p className="text-xs leading-relaxed" style={{ color: rule.color }}>{rule.tip}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const FREE_COLORS = ["#ef4444", "#22c55e", "#3b82f6", "#eab308", "#a855f7", "#000000"];
const SIZES = [2, 4, 8, 14];

// ── Tajwid notes helpers ─────────────────────────────────────────────────────
// Format attendu (optionnel) dans la note : "[rule1,rule2] texte libre"
export function parseTajwidNote(raw?: string | null): { rules: string[]; note: string } {
  if (!raw) return { rules: [], note: "" };
  const m = raw.match(/^\s*\[([^\]]*)\]\s*(.*)$/s);
  if (!m) return { rules: [], note: raw.trim() };
  const rules = m[1].split(",").map(s => s.trim()).filter(Boolean);
  return { rules, note: (m[2] || "").trim() };
}

export function TajwidLegend({ rules }: { rules: string[] }) {
  if (!rules || rules.length === 0) return null;
  return (
    <div className="px-4 py-3 border-t border-border bg-muted/30 flex flex-wrap gap-2">
      {rules.map((r, i) => (
        <span key={i} className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          {r}
        </span>
      ))}
    </div>
  );
}

function getMushafUrl(page: number) {
  return `https://www.mp3quran.net/api/quran_pages_arabic/${String(page).padStart(3, "0")}.png`;
}

// ── Dessin d'une étiquette capsule sur le canvas ──────────────────────────────
function stampLabel(
  ctx: CanvasRenderingContext2D,
  pt: { x: number; y: number },
  text: string,
  color: string,
  canvasWidth: number,
) {
  const fontSize = Math.max(14, Math.round(canvasWidth / 38));
  ctx.save();
  ctx.font = `bold ${fontSize}px ui-sans-serif, system-ui, sans-serif`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";

  const metrics = ctx.measureText(text);
  const padX = fontSize * 0.55;
  const padY = fontSize * 0.35;
  const w = metrics.width + padX * 2;
  const h = fontSize + padY * 2;
  const x = pt.x - w / 2;
  const y = pt.y - h / 2;
  const r = h / 2;

  // Capsule colorée
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();

  // Texte blanc
  ctx.fillStyle = "white";
  ctx.fillText(text, x + padX, pt.y);
  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
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

  // "pen" | "eraser" | "label"
  const [tool, setTool]   = useState<"pen" | "eraser" | "label">("pen");
  const [color, setColor] = useState(FREE_COLORS[0]);
  const [size, setSize]   = useState(SIZES[1]);

  const [tajwidMode, setTajwidMode]     = useState(false);
  const [activeRuleId, setActiveRuleId] = useState<TajwidRuleId | null>(null);
  const [usedRuleIds, setUsedRuleIds]   = useState<Set<TajwidRuleId>>(new Set());

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

  const effectiveColor = tajwidMode && activeRuleId
    ? TAJWID_RULES.find(r => r.id === activeRuleId)!.color
    : color;

  useEffect(() => {
    [page - 1, page + 1].filter(p => p >= 1 && p <= 604).forEach(p => {
      const img = new Image(); img.src = getMushafUrl(p);
    });
  }, [page]);

  const onImgLoad = () => {
    const img = imgRef.current; const cv = canvasRef.current;
    if (!img || !cv) return;
    const w = img.offsetWidth || img.naturalWidth;
    const h = img.offsetHeight || img.naturalHeight;
    if (!w || !h) return;
    cv.width = w; cv.height = h;
    cv.getContext("2d")!.clearRect(0, 0, w, h);
    canvasOk.current = true; setReady(true);
  };

  const goTo = (p: number) => {
    const c = Math.max(1, Math.min(604, p));
    if (c === page) return;
    canvasOk.current = false; setReady(false); setHasStrokes(false);
    setHistory([]); setZoom(1); setUsedRuleIds(new Set());
    const cv = canvasRef.current;
    if (cv) cv.getContext("2d")!.clearRect(0, 0, cv.width, cv.height);
    setPage(c); setPageInput(String(c));
  };

  const getPt = (e: React.PointerEvent) => {
    const cv = canvasRef.current!; const rect = cv.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (cv.width / rect.width),
      y: (e.clientY - rect.top) * (cv.height / rect.height),
    };
  };

  const recordUsedRule = () => {
    if (tajwidMode && activeRuleId) {
      setUsedRuleIds(prev => {
        if (prev.has(activeRuleId)) return prev;
        const next = new Set(prev); next.add(activeRuleId); return next;
      });
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!canvasOk.current) return;
    const cv = canvasRef.current!; const ctx = cv.getContext("2d")!;
    const pt = getPt(e);

    // ── Outil étiquette : pose la capsule au clic, pas de drag ──────────────
    if (tool === "label" && tajwidMode && activeRuleId) {
      const rule = TAJWID_RULES.find(r => r.id === activeRuleId)!;
      setHistory(h => [...h.slice(-30), ctx.getImageData(0, 0, cv.width, cv.height)]);
      stampLabel(ctx, pt, rule.fr, rule.color, cv.width);
      setHasStrokes(true);
      recordUsedRule();
      return;
    }

    setHistory(h => [...h.slice(-30), ctx.getImageData(0, 0, cv.width, cv.height)]);
    isDrawing.current = true;
    lastPt.current = pt;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDrawing.current || !lastPt.current || !canvasOk.current) return;
    const cv = canvasRef.current!; const ctx = cv.getContext("2d")!; const pt = getPt(e);
    ctx.beginPath(); ctx.lineCap = ctx.lineJoin = "round";
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = size * 4; ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.lineWidth = size; ctx.strokeStyle = effectiveColor;
      recordUsedRule();
    }
    ctx.moveTo(lastPt.current.x, lastPt.current.y); ctx.lineTo(pt.x, pt.y); ctx.stroke();
    lastPt.current = pt; setHasStrokes(true);
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
    setHistory([]); setHasStrokes(false); setUsedRuleIds(new Set());
  };

  const save = async () => {
    if (!hasStrokes) { toast({ title: "Aucune annotation", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const cv = canvasRef.current!;
      const blob: Blob = await new Promise((res, rej) =>
        cv.toBlob(b => b ? res(b) : rej(new Error("toBlob failed")), "image/png"));
      const path = `hifz-annotations/${studentId}/page-${page}-${Date.now()}.png`;
      const { error: upErr } = await supabase.storage.from("presentiel-courses")
        .upload(path, blob, { contentType: "image/png" });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("presentiel-courses").getPublicUrl(path);
      const rulesPrefix = usedRuleIds.size > 0 ? `[tajwid:${[...usedRuleIds].join(",")}] ` : "";
      const finalNote = (rulesPrefix + note.trim()) || null;
      const { error: dbErr } = await supabase.from("hifz_mushaf_annotations" as any).insert({
        student_id: studentId, page_number: page,
        annotated_image_url: publicUrl, note: finalNote, session_id: sessionId || null,
      });
      if (dbErr) throw dbErr;
      toast({ title: `Page ${page} sauvegardée ✓`, description: `Pour ${studentName}` });
      clear(); setNote(""); onSaved?.();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const selectRule = (id: TajwidRuleId) => {
    setActiveRuleId(id);
    if (tool === "eraser") setTool("pen"); // repasser en pen si on était en gomme
  };

  const toggleTajwidMode = () => {
    setTajwidMode(m => {
      if (!m) { setActiveRuleId(TAJWID_RULES[0].id); }
      else { setActiveRuleId(null); if (tool === "label") setTool("pen"); }
      return !m;
    });
  };

  const activeRule = TAJWID_RULES.find(r => r.id === activeRuleId);

  return (
    <div className="space-y-3">

      {/* ── Toolbar principale ────────────────────────────────────────────── */}
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

        {/* Outils de dessin */}
        <Button size="sm" variant={tool === "pen" ? "default" : "outline"}
          onClick={() => setTool("pen")} className="gap-1">
          <Pencil className="h-3.5 w-3.5" /> Stylo
        </Button>
        <Button size="sm" variant={tool === "eraser" ? "default" : "outline"}
          onClick={() => setTool("eraser")} className="gap-1">
          <Eraser className="h-3.5 w-3.5" /> Gomme
        </Button>

        {/* Outil étiquette — uniquement en mode Tajwid */}
        {tajwidMode && (
          <Button size="sm"
            variant={tool === "label" ? "default" : "outline"}
            onClick={() => setTool(tool === "label" ? "pen" : "label")}
            className={`gap-1 ${tool === "label" ? "" : "border-dashed"}`}
            style={tool === "label" && activeRule
              ? { backgroundColor: activeRule.color, borderColor: activeRule.color, color: "white" }
              : {}}>
            <Tag className="h-3.5 w-3.5" />
            Étiquette
          </Button>
        )}

        <div className="w-px h-5 bg-border mx-1" />

        {/* Toggle mode Tajwid */}
        <Button size="sm" variant={tajwidMode ? "default" : "outline"} onClick={toggleTajwidMode}
          className={`gap-1.5 font-medium ${tajwidMode
            ? "bg-emerald-700 hover:bg-emerald-800 text-white border-0"
            : "border-emerald-400 text-emerald-700 hover:bg-emerald-50"}`}>
          <BookOpen className="h-3.5 w-3.5" />
          Tajwid
          {tajwidMode && activeRule && (
            <span className="w-3 h-3 rounded-full border border-white/40 ml-0.5"
              style={{ backgroundColor: activeRule.color }} />
          )}
        </Button>

        {/* Palette couleurs libres (hors mode Tajwid) */}
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
        {tool !== "label" && (
          <div className="flex gap-1 items-center">
            {SIZES.map(s => (
              <button key={s} onClick={() => setSize(s)}
                className={`rounded-full bg-foreground transition-all ${size === s ? "opacity-100 ring-2 ring-primary ring-offset-1" : "opacity-30"}`}
                style={{ width: Math.max(8, s + 4), height: Math.max(8, s + 4) }} />
            ))}
          </div>
        )}

        <div className="w-px h-5 bg-border mx-1" />

        <Button size="sm" variant="outline" onClick={() => setZoom(z => Math.min(2.5, +(z + 0.25).toFixed(2)))} className="px-2">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <span className="text-xs text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
        <Button size="sm" variant="outline" onClick={() => setZoom(z => Math.max(0.5, +(z - 0.25).toFixed(2)))} className="px-2">
          <ZoomOut className="h-4 w-4" />
        </Button>

        <div className="w-px h-5 bg-border mx-1" />

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

      {/* ── Palette Tajwid ───────────────────────────────────────────────── */}
      {tajwidMode && (
        <div className="rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              Sélectionnez une règle, puis{" "}
              {tool === "label" ? "cliquez pour poser une étiquette" : "dessinez sur la lettre"}
            </p>
            <button onClick={toggleTajwidMode} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {TAJWID_RULES.map(rule => {
              const isActive = activeRuleId === rule.id;
              return (
                <button key={rule.id} type="button" onClick={() => selectRule(rule.id)}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border-2 text-left transition-all ${isActive ? "shadow-md scale-[1.03]" : "border-transparent bg-white hover:border-gray-200 hover:shadow-sm"}`}
                  style={isActive ? { borderColor: rule.color, backgroundColor: rule.color + "18" } : {}}>
                  <span className="w-4 h-4 rounded-full shrink-0 border border-white/50 shadow-sm"
                    style={{ backgroundColor: rule.color }} />
                  <span className="flex flex-col min-w-0">
                    <span className="font-arabic text-sm leading-none"
                      style={{ color: rule.color, fontWeight: isActive ? 700 : 500 }}>{rule.ar}</span>
                    <span className="text-[10px] text-gray-500 leading-tight truncate">{rule.fr}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Info règle active */}
          {activeRule && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: activeRule.color + "15", color: activeRule.color }}>
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: activeRule.color }} />
              <span className="font-arabic text-base">{activeRule.ar}</span>
              <span className="font-semibold">{activeRule.fr}</span>
              <span className="text-xs font-normal opacity-70">— {activeRule.desc}</span>

              {/* Astuce outil étiquette */}
              {tool === "label" && (
                <span className="ml-auto flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/60 border"
                  style={{ borderColor: activeRule.color + "50" }}>
                  <Tag className="h-3 w-3" />
                  Clic = pose une capsule « {activeRule.fr} »
                </span>
              )}
            </div>
          )}

          {/* Règles déjà utilisées */}
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

      {/* ── Canvas Mushaf ───────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border overflow-auto bg-stone-100" style={{ maxHeight: "72vh" }}>
        <div style={{ transform: `scale(${zoom})`, transformOrigin: "top center", width: "100%" }}>
          <div style={{ position: "relative", width: "100%", maxWidth: "700px", margin: "0 auto" }}>
            <img ref={imgRef} key={page} src={getMushafUrl(page)} alt={`Page ${page}`}
              onLoad={onImgLoad} draggable={false}
              style={{ display: "block", width: "100%", userSelect: "none" }} />
            <canvas ref={canvasRef}
              onPointerDown={onPointerDown} onPointerMove={onPointerMove}
              onPointerUp={onPointerUp} onPointerLeave={onPointerUp}
              style={{
                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                width: "100%", height: "100%",
                cursor: ready
                  ? (tool === "eraser" ? "cell" : tool === "label" ? "copy" : "crosshair")
                  : "wait",
                touchAction: "none",
              }} />

            {/* Indicateur outil actif (coin bas-droit) */}
            {ready && (
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1.5 shadow-lg border border-white/50 pointer-events-none">
                {tool === "label" && activeRule
                  ? <>
                      <Tag className="h-3.5 w-3.5" style={{ color: activeRule.color }} />
                      <span className="text-[10px] font-semibold" style={{ color: activeRule.color }}>
                        Étiquette · {activeRule.fr}
                      </span>
                    </>
                  : tool === "eraser"
                    ? <span className="text-[10px] text-gray-500">Gomme</span>
                    : <>
                        <span className="w-4 h-4 rounded-full border border-gray-200"
                          style={{ backgroundColor: effectiveColor }} />
                        {tajwidMode && activeRule
                          ? <span className="text-[10px] font-semibold" style={{ color: effectiveColor }}>{activeRule.fr}</span>
                          : <span className="text-[10px] text-gray-500">Libre</span>}
                        <span className="text-[10px] text-gray-400">·</span>
                        <span className="text-[10px] text-gray-500">{size}px</span>
                      </>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Sauvegarde ───────────────────────────────────────────────────── */}
      <div className="flex gap-2 items-center flex-wrap">
        <Input value={note} onChange={e => setNote(e.target.value)}
          placeholder="Note pour l'élève (optionnel)…" className="flex-1 min-w-0 text-sm" />
        <Button onClick={save} disabled={saving || !hasStrokes}
          className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2 shrink-0">
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Sauvegarde…</> : <><Save className="h-4 w-4" /> Sauvegarder</>}
        </Button>
        {hasStrokes && <Badge variant="outline" className="border-emerald-500 text-emerald-600 text-xs">Non sauvegardé</Badge>}
      </div>

      {hasStrokes && usedRuleIds.size > 0 && (
        <div className="flex flex-wrap gap-1.5 px-1">
          <span className="text-[10px] text-muted-foreground self-center">Sera sauvegardé avec :</span>
          {[...usedRuleIds].map(id => {
            const r = TAJWID_RULES.find(x => x.id === id)!;
            return (
              <span key={id} className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border"
                style={{ borderColor: r.color + "60", backgroundColor: r.color + "12", color: r.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />{r.fr}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

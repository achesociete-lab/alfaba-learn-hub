// Mushaf annotator — img normale + canvas transparent superposé
// Pas besoin de CORS : on exporte UNIQUEMENT la couche d'annotation (PNG transparent)
// Le composant est stabilisé par key={studentId} dans AnnotateTab
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft, ChevronRight, Eraser, Undo2, Trash2,
  Save, Loader2, ZoomIn, ZoomOut, Pencil,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const COLORS = ["#ef4444", "#22c55e", "#3b82f6", "#eab308", "#a855f7", "#000000"];
const SIZES  = [2, 4, 8, 14];

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
  const [imgOk, setImgOk]         = useState(false);   // image affichée et dimensionnée

  const [tool, setTool]   = useState<"pen" | "eraser">("pen");
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize]   = useState(SIZES[1]);
  const drawing           = useRef(false);
  const lastPt            = useRef<{ x: number; y: number } | null>(null);
  const [history, setHistory]     = useState<ImageData[]>([]);
  const [hasStrokes, setHasStrokes] = useState(false);
  const [zoom, setZoom]   = useState(1);
  const [saving, setSaving] = useState(false);
  const [note, setNote]   = useState("");

  const imgRef    = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── Dimensionner le canvas sur la taille affichée de l'image ─────────────────
  const sizeCanvas = useCallback(() => {
    const img = imgRef.current;
    const cv  = canvasRef.current;
    if (!img || !cv) return;
    const w = img.offsetWidth;
    const h = img.offsetHeight;
    if (!w || !h) return;
    if (cv.width === w && cv.height === h) return; // déjà OK
    const ctx = cv.getContext("2d")!;
    // Préserver les traits existants lors d'un resize
    const prev = cv.width > 0 && cv.height > 0
      ? ctx.getImageData(0, 0, cv.width, cv.height) : null;
    cv.width  = w;
    cv.height = h;
    if (prev) {
      const tmp = document.createElement("canvas");
      tmp.width = prev.width; tmp.height = prev.height;
      tmp.getContext("2d")!.putImageData(prev, 0, 0);
      ctx.drawImage(tmp, 0, 0, w, h);
    }
    setImgOk(true);
  }, []);

  // Appelé par onLoad de l'img ET vérifie img.complete pour les images en cache
  const handleImgReady = useCallback(() => {
    // Laisser le layout browser se stabiliser avant de lire offsetWidth
    requestAnimationFrame(() => {
      sizeCanvas();
      setHasStrokes(false);
      setHistory([]);
    });
  }, [sizeCanvas]);

  // Quand la page change : réinitialiser
  useEffect(() => {
    setImgOk(false);
    setHasStrokes(false);
    setHistory([]);
    const cv = canvasRef.current;
    if (cv) cv.getContext("2d")!.clearRect(0, 0, cv.width, cv.height);
  }, [page]);

  // Gérer les images déjà en cache (onLoad ne se déclenche pas toujours)
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      handleImgReady();
    }
  }, [page, handleImgReady]);

  // ── Navigation ────────────────────────────────────────────────────────────────
  const goTo = (p: number) => {
    const c = Math.max(1, Math.min(604, p));
    if (c === page) return;
    setPage(c);
    setPageInput(String(c));
  };

  // ── Pointer coords : display px → canvas px ──────────────────────────────────
  const getPt = (e: React.PointerEvent) => {
    const cv   = canvasRef.current!;
    const rect = cv.getBoundingClientRect();
    const scaleX = cv.width  / rect.width;
    const scaleY = cv.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!imgOk) return;
    const cv = canvasRef.current!;
    const ctx = cv.getContext("2d")!;
    setHistory(h => [...h.slice(-30), ctx.getImageData(0, 0, cv.width, cv.height)]);
    drawing.current = true;
    lastPt.current  = getPt(e);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drawing.current || !lastPt.current || !imgOk) return;
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
      ctx.strokeStyle = color;
    }
    ctx.moveTo(lastPt.current.x, lastPt.current.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
    lastPt.current = pt;
    setHasStrokes(true);
  };

  const onPointerUp = () => { drawing.current = false; lastPt.current = null; };

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
  };

  // ── Sauvegarde : PNG transparent (annotation uniquement, pas de CORS) ─────────
  const save = async () => {
    if (!hasStrokes) { toast({ title: "Aucune annotation", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const blob: Blob = await new Promise((res, rej) =>
        canvasRef.current!.toBlob(b => b ? res(b) : rej(new Error("toBlob failed")), "image/png")
      );
      const path = `hifz-annotations/${studentId}/page-${page}-${Date.now()}.png`;
      const { error: upErr } = await supabase.storage.from("presentiel-courses")
        .upload(path, blob, { contentType: "image/png" });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("presentiel-courses").getPublicUrl(path);
      const { error: dbErr } = await supabase.from("hifz_mushaf_annotations" as any).insert({
        student_id: studentId, page_number: page,
        annotated_image_url: publicUrl,
        note: note.trim() || null, session_id: sessionId || null,
      });
      if (dbErr) throw dbErr;
      toast({ title: `Page ${page} sauvegardée ✓`, description: `Pour ${studentName}` });
      clear(); setNote(""); onSaved?.();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/40 rounded-xl border border-border">
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

        <Button size="sm" variant={tool === "pen" ? "default" : "outline"} onClick={() => setTool("pen")} className="gap-1">
          <Pencil className="h-3.5 w-3.5" /> Stylo
        </Button>
        <Button size="sm" variant={tool === "eraser" ? "default" : "outline"} onClick={() => setTool("eraser")} className="gap-1">
          <Eraser className="h-3.5 w-3.5" /> Gomme
        </Button>

        <div className="flex gap-1">
          {COLORS.map(c => (
            <button key={c} onClick={() => { setColor(c); setTool("pen"); }}
              className={`w-6 h-6 rounded-full border-2 transition-transform ${color === c && tool === "pen" ? "scale-125 border-foreground" : "border-transparent"}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>

        <div className="flex gap-1 items-center">
          {SIZES.map(s => (
            <button key={s} onClick={() => setSize(s)}
              className={`rounded-full bg-foreground transition-all ${size === s ? "opacity-100 ring-2 ring-primary ring-offset-1" : "opacity-30"}`}
              style={{ width: Math.max(8, s + 4), height: Math.max(8, s + 4) }} />
          ))}
        </div>

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
        <Button size="sm" variant="outline" onClick={clear} disabled={!hasStrokes} className="text-destructive border-destructive/30">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>

        {imgOk && (
          <span className="text-xs text-emerald-600 font-medium ml-1">✓ Prêt à annoter</span>
        )}
      </div>

      {/* Zone d'annotation */}
      <div className="rounded-xl border border-border overflow-auto bg-stone-100" style={{ maxHeight: "72vh" }}>
        <div style={{ transform: `scale(${zoom})`, transformOrigin: "top center", display: "inline-block", minWidth: "100%" }}>
          {/*
            position:relative sur le wrapper
            img : affichage normal (pas de crossOrigin), charge sans CORS
            canvas : position:absolute, couvre exactement l'img, transparent
          */}
          <div style={{ position: "relative", display: "inline-block", lineHeight: 0 }}>
            <img
              ref={imgRef}
              key={page}
              src={getMushafUrl(page)}
              alt={`Page ${page} du Mushaf`}
              draggable={false}
              onLoad={handleImgReady}
              style={{ display: "block", maxWidth: "700px", width: "100%", userSelect: "none" }}
            />

            {/* Canvas transparent — toujours présent, jamais caché */}
            <canvas
              ref={canvasRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
              style={{
                position: "absolute",
                top: 0, left: 0,
                width: "100%",
                height: "100%",
                cursor: imgOk ? (tool === "eraser" ? "cell" : "crosshair") : "wait",
                touchAction: "none",
                // background volontairement absent : canvas est transparent par défaut
              }}
            />

            {/* Indicateur de chargement discret */}
            {!imgOk && (
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                pointerEvents: "none",
              }}>
                <Loader2 className="h-8 w-8 animate-spin text-emerald-700 opacity-60" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sauvegarde */}
      <div className="flex gap-2 items-center flex-wrap">
        <Input value={note} onChange={e => setNote(e.target.value)}
          placeholder="Note pour l'élève (optionnel)…" className="flex-1 min-w-0 text-sm" />
        <Button onClick={save} disabled={saving || !hasStrokes}
          className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2 shrink-0">
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Sauvegarde…</> : <><Save className="h-4 w-4" /> Sauvegarder</>}
        </Button>
        {hasStrokes && <Badge variant="outline" className="border-emerald-500 text-emerald-600 text-xs">Non sauvegardé</Badge>}
      </div>
    </div>
  );
}

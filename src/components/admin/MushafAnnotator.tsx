// Visualiseur du Mushaf de Médine (1-604 pages) avec annotation directe au stylo
import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft, ChevronRight, Eraser, Undo2, Trash2,
  Save, Loader2, ZoomIn, ZoomOut, Pencil,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const TOTAL_PAGES = 604;
const COLORS = ["#ef4444", "#22c55e", "#3b82f6", "#eab308", "#a855f7", "#000000"];
const SIZES  = [2, 5, 10, 18];

function getMushafUrl(page: number) {
  const p = String(page).padStart(3, "0");
  return `https://www.mp3quran.net/api/quran_pages_arabic/${p}.png`;
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

  // Navigation
  const [page, setPage]         = useState(initialPage);
  const [pageInput, setPageInput] = useState(String(initialPage));

  // Canvas
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null); // annotation layer
  const imgRef     = useRef<HTMLImageElement | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError]   = useState(false);

  // Drawing
  const [tool, setTool]     = useState<"pen" | "eraser">("pen");
  const [color, setColor]   = useState(COLORS[0]);
  const [size, setSize]     = useState(SIZES[1]);
  const [drawing, setDrawing] = useState(false);
  const lastPt = useRef<{ x: number; y: number } | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [hasStrokes, setHasStrokes] = useState(false);

  // Zoom
  const [zoom, setZoom] = useState(1);

  // Save
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");

  // ── Load image into the base canvas ──────────────────────────────────────────
  const loadPage = useCallback((p: number) => {
    setImgLoaded(false);
    setImgError(false);
    setHistory([]);
    setHasStrokes(false);

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      imgRef.current = img;
      const canvas  = canvasRef.current!;
      const overlay = overlayRef.current!;
      const maxW = 900;
      const scale = Math.min(1, maxW / img.naturalWidth);
      const w = Math.round(img.naturalWidth  * scale);
      const h = Math.round(img.naturalHeight * scale);
      canvas.width  = overlay.width  = w;
      canvas.height = overlay.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      overlay.getContext("2d")!.clearRect(0, 0, w, h);
      setImgLoaded(true);
    };
    img.onerror = () => setImgError(true);
    img.src = getMushafUrl(p);
  }, []);

  useEffect(() => { loadPage(page); }, [page, loadPage]);

  // ── Pointer events on overlay canvas ─────────────────────────────────────────
  const getPt = (e: React.PointerEvent) => {
    const rect = overlayRef.current!.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top)  / zoom,
    };
  };

  const pushHistory = () => {
    const ov  = overlayRef.current!;
    const ctx = ov.getContext("2d")!;
    setHistory((h) => [...h.slice(-30), ctx.getImageData(0, 0, ov.width, ov.height)]);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!imgLoaded) return;
    pushHistory();
    setDrawing(true);
    lastPt.current = getPt(e);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drawing || !lastPt.current) return;
    const ctx = overlayRef.current!.getContext("2d")!;
    const pt  = getPt(e);
    ctx.beginPath();
    ctx.lineCap    = "round";
    ctx.lineJoin   = "round";
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = size * 3;
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

  const onPointerUp = () => {
    setDrawing(false);
    lastPt.current = null;
  };

  const undo = () => {
    if (!history.length) return;
    const prev = history[history.length - 1];
    overlayRef.current!.getContext("2d")!.putImageData(prev, 0, 0);
    setHistory((h) => h.slice(0, -1));
    if (history.length <= 1) setHasStrokes(false);
  };

  const clear = () => {
    const ov = overlayRef.current!;
    ov.getContext("2d")!.clearRect(0, 0, ov.width, ov.height);
    setHistory([]);
    setHasStrokes(false);
  };

  // ── Merge base + overlay → blob → upload ─────────────────────────────────────
  const save = async () => {
    if (!imgRef.current || !hasStrokes) {
      toast({ title: "Aucune annotation à sauvegarder", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      // Merge the two canvases
      const merged = document.createElement("canvas");
      merged.width  = canvasRef.current!.width;
      merged.height = canvasRef.current!.height;
      const mCtx = merged.getContext("2d")!;
      mCtx.drawImage(canvasRef.current!, 0, 0);
      mCtx.drawImage(overlayRef.current!, 0, 0);

      const blob: Blob = await new Promise((res, rej) =>
        merged.toBlob((b) => (b ? res(b) : rej(new Error("toBlob failed"))), "image/jpeg", 0.9)
      );

      const path = `hifz-annotations/${studentId}/page-${page}-${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage
        .from("presentiel-courses")
        .upload(path, blob, { contentType: "image/jpeg", upsert: false });
      if (upErr) throw upErr;

      const { data: { publicUrl } } = supabase.storage.from("presentiel-courses").getPublicUrl(path);

      const { error: dbErr } = await supabase.from("hifz_mushaf_annotations" as any).insert({
        student_id: studentId,
        page_number: page,
        annotated_image_url: publicUrl,
        note: note.trim() || null,
        session_id: sessionId || null,
      });
      if (dbErr) throw dbErr;

      toast({ title: `Page ${page} annotée sauvegardée ✓`, description: `Pour ${studentName}` });
      clear();
      setNote("");
      onSaved?.();
    } catch (e: any) {
      toast({ title: "Erreur sauvegarde", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // ── Navigate ──────────────────────────────────────────────────────────────────
  const goTo = (p: number) => {
    const clamped = Math.max(1, Math.min(TOTAL_PAGES, p));
    setPage(clamped);
    setPageInput(String(clamped));
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/40 rounded-xl border border-border">

        {/* Navigation */}
        <Button size="sm" variant="outline" onClick={() => goTo(page - 1)} disabled={page <= 1}>
          <ChevronRight className="h-4 w-4" /> {/* RTL: right = previous */}
        </Button>
        <div className="flex items-center gap-1">
          <Input
            type="number" min={1} max={604}
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onBlur={() => goTo(Number(pageInput) || page)}
            onKeyDown={(e) => e.key === "Enter" && goTo(Number(pageInput) || page)}
            className="h-8 w-16 text-center text-sm"
          />
          <span className="text-xs text-muted-foreground">/ 604</span>
        </div>
        <Button size="sm" variant="outline" onClick={() => goTo(page + 1)} disabled={page >= 604}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Tools */}
        <Button
          size="sm"
          variant={tool === "pen" ? "default" : "outline"}
          onClick={() => setTool("pen")}
          className="gap-1"
        >
          <Pencil className="h-3.5 w-3.5" /> Stylo
        </Button>
        <Button
          size="sm"
          variant={tool === "eraser" ? "default" : "outline"}
          onClick={() => setTool("eraser")}
          className="gap-1"
        >
          <Eraser className="h-3.5 w-3.5" /> Gomme
        </Button>

        {/* Colors */}
        <div className="flex gap-1">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => { setColor(c); setTool("pen"); }}
              className={`w-6 h-6 rounded-full border-2 transition-transform ${color === c && tool === "pen" ? "scale-125 border-foreground" : "border-transparent"}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {/* Sizes */}
        <div className="flex gap-1 items-center">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`rounded-full bg-foreground transition-all ${size === s ? "opacity-100 ring-2 ring-primary ring-offset-1" : "opacity-30"}`}
              style={{ width: Math.max(8, s + 4), height: Math.max(8, s + 4) }}
            />
          ))}
        </div>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Zoom */}
        <Button size="sm" variant="outline" onClick={() => setZoom((z) => Math.min(2, z + 0.25))} className="px-2">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <span className="text-xs text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
        <Button size="sm" variant="outline" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} className="px-2">
          <ZoomOut className="h-4 w-4" />
        </Button>

        <div className="w-px h-5 bg-border mx-1" />

        <Button size="sm" variant="outline" onClick={undo} disabled={!history.length} className="gap-1">
          <Undo2 className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="outline" onClick={clear} disabled={!hasStrokes} className="gap-1 text-destructive border-destructive/30">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Canvas zone */}
      <div className="rounded-xl border border-border overflow-auto bg-stone-100 dark:bg-stone-900"
           style={{ maxHeight: "70vh" }}>
        <div style={{ transform: `scale(${zoom})`, transformOrigin: "top center", display: "inline-block", minWidth: "100%" }}>
          <div className="relative inline-block" style={{ direction: "ltr" }}>
            {/* Base image canvas */}
            <canvas ref={canvasRef} className="block" />
            {/* Annotation overlay */}
            <canvas
              ref={overlayRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
              className="absolute inset-0 touch-none"
              style={{
                cursor: tool === "eraser" ? "cell" : "crosshair",
                opacity: imgLoaded ? 1 : 0,
              }}
            />
            {/* Loading state */}
            {!imgLoaded && !imgError && (
              <div className="absolute inset-0 flex items-center justify-center bg-stone-100 dark:bg-stone-900" style={{ minWidth: 300, minHeight: 400 }}>
                <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
              </div>
            )}
            {imgError && (
              <div className="flex items-center justify-center bg-stone-100" style={{ minWidth: 300, minHeight: 200 }}>
                <p className="text-sm text-muted-foreground">Impossible de charger la page {page}.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save row */}
      <div className="flex gap-2 items-center flex-wrap">
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note pour l'élève (optionnel)…"
          className="flex-1 min-w-0 text-sm"
        />
        <Button
          onClick={save}
          disabled={saving || !hasStrokes}
          className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2 shrink-0"
        >
          {saving
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Sauvegarde…</>
            : <><Save className="h-4 w-4" /> Sauvegarder l'annotation</>
          }
        </Button>
        {hasStrokes && (
          <Badge variant="outline" className="border-emerald-500 text-emerald-600 text-xs">
            Annotation non sauvegardée
          </Badge>
        )}
      </div>
    </div>
  );
}

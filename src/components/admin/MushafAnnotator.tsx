// Visualiseur Mushaf avec annotation canvas — image chargée via proxy CORS Supabase
// => drawImage dans le canvas est autorisé, toBlob() fonctionne sans taint
import { useEffect, useRef, useState } from "react";
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

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string) ?? "";

function getProxyUrl(page: number) {
  return `${SUPABASE_URL}/functions/v1/mushaf-proxy?page=${page}`;
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
  const [status, setStatus]       = useState<"loading" | "ready" | "error">("loading");

  const [tool, setTool]   = useState<"pen" | "eraser">("pen");
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize]   = useState(SIZES[1]);
  const drawing           = useRef(false);
  const lastPt            = useRef<{ x: number; y: number } | null>(null);
  const [history, setHistory]   = useState<ImageData[]>([]);
  const [hasStrokes, setHasStrokes] = useState(false);
  const [zoom, setZoom]   = useState(1);
  const [saving, setSaving] = useState(false);
  const [note, setNote]   = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loadedImg = useRef<HTMLImageElement | null>(null);

  // ── Load page via proxy (CORS OK) → drawImage on canvas ──────────────────────
  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setHasStrokes(false);
    setHistory([]);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      const cv = canvasRef.current;
      if (!cv) return;
      cv.width  = img.naturalWidth;
      cv.height = img.naturalHeight;
      const ctx = cv.getContext("2d")!;
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.drawImage(img, 0, 0);        // dessine la page Mushaf sur le canvas
      loadedImg.current = img;
      setStatus("ready");
    };
    img.onerror = () => { if (!cancelled) setStatus("error"); };
    img.src = getProxyUrl(page);

    return () => { cancelled = true; };
  }, [page]);

  // ── Navigate ──────────────────────────────────────────────────────────────────
  const goTo = (p: number) => {
    const c = Math.max(1, Math.min(604, p));
    if (c === page) return;
    setPage(c);
    setPageInput(String(c));
  };

  // ── Pointer coords (display px → natural px) ──────────────────────────────────
  const getPt = (e: React.PointerEvent) => {
    const cv   = canvasRef.current!;
    const rect = cv.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / (rect.width  / cv.width),
      y: (e.clientY - rect.top)  / (rect.height / cv.height),
    };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (status !== "ready") return;
    const cv  = canvasRef.current!;
    const ctx = cv.getContext("2d")!;
    setHistory(h => [...h.slice(-30), ctx.getImageData(0, 0, cv.width, cv.height)]);
    drawing.current = true;
    lastPt.current  = getPt(e);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drawing.current || !lastPt.current || status !== "ready") return;
    const cv  = canvasRef.current!;
    const ctx = cv.getContext("2d")!;
    const pt  = getPt(e);
    ctx.beginPath();
    ctx.lineCap = ctx.lineJoin = "round";
    if (tool === "eraser") {
      // gomme : redessine la page originale sur la zone
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth   = size * 8;
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.lineWidth   = size * 3;
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
    if (!history.length || !loadedImg.current) return;
    const cv  = canvasRef.current!;
    const ctx = cv.getContext("2d")!;
    ctx.putImageData(history[history.length - 1], 0, 0);
    setHistory(h => h.slice(0, -1));
    if (history.length <= 1) setHasStrokes(false);
  };

  const clear = () => {
    if (!loadedImg.current) return;
    const cv  = canvasRef.current!;
    const ctx = cv.getContext("2d")!;
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.drawImage(loadedImg.current, 0, 0);  // restaure la page originale
    setHistory([]);
    setHasStrokes(false);
  };

  // ── Save : export canvas (image + annotations fusionnées) ────────────────────
  const save = async () => {
    if (!hasStrokes) { toast({ title: "Aucune annotation", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const blob: Blob = await new Promise((res, rej) =>
        canvasRef.current!.toBlob(b => b ? res(b) : rej(new Error("toBlob failed")), "image/jpeg", 0.9)
      );
      const path = `hifz-annotations/${studentId}/page-${page}-${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage.from("presentiel-courses")
        .upload(path, blob, { contentType: "image/jpeg" });
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

        <Button size="sm" variant="outline" onClick={undo} disabled={!history.length}><Undo2 className="h-3.5 w-3.5" /></Button>
        <Button size="sm" variant="outline" onClick={clear} disabled={!hasStrokes} className="text-destructive border-destructive/30">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Canvas */}
      <div className="rounded-xl border border-border overflow-auto bg-stone-100" style={{ maxHeight: "72vh" }}>
        {status === "loading" && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
          </div>
        )}
        {status === "error" && (
          <div className="flex items-center justify-center py-24">
            <p className="text-sm text-destructive">Impossible de charger la page {page}. Vérifiez votre connexion.</p>
          </div>
        )}
        {/* Le canvas reste dans le DOM même pendant loading (évite unmount) */}
        <div style={{
          transform: `scale(${zoom})`,
          transformOrigin: "top center",
          display: status === "ready" ? "inline-block" : "none",
          minWidth: "100%",
        }}>
          <canvas
            ref={canvasRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            style={{
              display: "block",
              maxWidth: "700px",
              width: "100%",
              cursor: tool === "eraser" ? "cell" : "crosshair",
              touchAction: "none",
            }}
          />
        </div>
      </div>

      {/* Save */}
      <div className="flex gap-2 items-center flex-wrap">
        <Input value={note} onChange={e => setNote(e.target.value)}
          placeholder="Note pour l'élève (optionnel)…" className="flex-1 min-w-0 text-sm" />
        <Button onClick={save} disabled={saving || !hasStrokes || status !== "ready"}
          className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2 shrink-0">
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Sauvegarde…</> : <><Save className="h-4 w-4" /> Sauvegarder</>}
        </Button>
        {hasStrokes && <Badge variant="outline" className="border-emerald-500 text-emerald-600 text-xs">Non sauvegardé</Badge>}
      </div>
    </div>
  );
}

// Mushaf annotator — SVG overlay (pas de canvas, pas de CORS, marche sur mobile)
// L'img affiche la page normalement, un SVG transparent superposé capte les traits.
import { useRef, useState } from "react";
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

interface Path { points: string; color: string; size: number }

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

  const [tool, setTool]   = useState<"pen" | "eraser">("pen");
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize]   = useState(SIZES[1]);

  // SVG paths (tableau de polylines)
  const [paths, setPaths]         = useState<Path[]>([]);
  const [currentPts, setCurrentPts] = useState<string>("");
  const isDown = useRef(false);
  const imgW = useRef(0);
  const imgH = useRef(0);

  const [zoom, setZoom]   = useState(1);
  const [saving, setSaving] = useState(false);
  const [note, setNote]   = useState("");

  const svgRef = useRef<SVGSVGElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // ── Coords pointer → espace SVG (viewBox de l'image naturelle) ────────────────
  const getSvgPt = (e: React.PointerEvent): string => {
    const svg  = svgRef.current!;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  * imgW.current).toFixed(1);
    const y = ((e.clientY - rect.top)  / rect.height * imgH.current).toFixed(1);
    return `${x},${y}`;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!imgW.current) return;
    isDown.current = true;
    setCurrentPts(getSvgPt(e));
    (e.currentTarget as SVGElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDown.current) return;
    setCurrentPts(p => p + " " + getSvgPt(e));
  };

  const onPointerUp = () => {
    if (!isDown.current) return;
    isDown.current = false;
    if (currentPts && tool === "pen") {
      setPaths(prev => [...prev, { points: currentPts, color, size }]);
    } else if (tool === "eraser" && currentPts) {
      // Effacement : supprime les dernières lignes proches du curseur (simpliste)
      // On retire simplement le dernier trait
      setPaths(prev => prev.slice(0, -1));
    }
    setCurrentPts("");
  };

  const undo = () => setPaths(p => p.slice(0, -1));
  const clear = () => { setPaths([]); setCurrentPts(""); };

  // ── Navigation ────────────────────────────────────────────────────────────────
  const goTo = (p: number) => {
    const c = Math.max(1, Math.min(604, p));
    if (c === page) return;
    clear();
    imgW.current = 0; imgH.current = 0;
    setPage(c);
    setPageInput(String(c));
  };

  // ── Image chargée → mémoriser les dimensions naturelles ──────────────────────
  const onImgLoad = () => {
    const img = imgRef.current;
    if (!img) return;
    imgW.current = img.naturalWidth;
    imgH.current = img.naturalHeight;
  };

  // ── Sauvegarde : SVG → PNG via canvas offscreen → upload ─────────────────────
  const save = async () => {
    if (!paths.length) { toast({ title: "Aucune annotation", variant: "destructive" }); return; }
    if (!imgW.current || !imgH.current) { toast({ title: "Image pas encore chargée", variant: "destructive" }); return; }
    setSaving(true);
    try {
      // Sérialise le SVG
      const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${imgW.current} ${imgH.current}">
        ${paths.map(p => `<polyline points="${p.points}" stroke="${p.color}" stroke-width="${p.size}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`).join("")}
      </svg>`;
      const svgBlob = new Blob([svgMarkup], { type: "image/svg+xml" });
      const svgUrl  = URL.createObjectURL(svgBlob);

      // Convertit SVG → PNG via canvas
      const png: Blob = await new Promise((res, rej) => {
        const img = new Image();
        img.onload = () => {
          const cv = document.createElement("canvas");
          cv.width  = imgW.current;
          cv.height = imgH.current;
          cv.getContext("2d")!.drawImage(img, 0, 0);
          URL.revokeObjectURL(svgUrl);
          cv.toBlob(b => b ? res(b) : rej(new Error("toBlob failed")), "image/png");
        };
        img.onerror = () => rej(new Error("SVG load failed"));
        img.src = svgUrl;
      });

      const path = `hifz-annotations/${studentId}/page-${page}-${Date.now()}.png`;
      const { error: upErr } = await supabase.storage.from("presentiel-courses")
        .upload(path, png, { contentType: "image/png" });
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

  const hasStrokes = paths.length > 0;

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

        <Button size="sm" variant="outline" onClick={undo} disabled={!hasStrokes}>
          <Undo2 className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="outline" onClick={clear} disabled={!hasStrokes} className="text-destructive border-destructive/30">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Zone dessin : img + SVG overlay */}
      <div className="rounded-xl border border-border overflow-auto bg-stone-100" style={{ maxHeight: "72vh" }}>
        <div style={{ transform: `scale(${zoom})`, transformOrigin: "top center", maxWidth: "700px", margin: "0 auto" }}>
          {/* SVG et img dans une grid pour qu'ils occupent exactement le même espace */}
          <div style={{ display: "grid" }}>
            <img
              ref={imgRef}
              key={page}
              src={getMushafUrl(page)}
              alt={`Page ${page}`}
              onLoad={onImgLoad}
              draggable={false}
              style={{ gridArea: "1/1", display: "block", width: "100%", userSelect: "none", pointerEvents: "none" }}
            />
            {/* SVG totalement transparent — capte uniquement les événements de dessin */}
            <svg
              ref={svgRef}
              viewBox={imgW.current ? `0 0 ${imgW.current} ${imgH.current}` : undefined}
              style={{
                gridArea: "1/1",
                width: "100%",
                height: "100%",
                cursor: tool === "eraser" ? "cell" : "crosshair",
                touchAction: "none",
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
            >
              {paths.map((p, i) => (
                <polyline
                  key={i}
                  points={p.points}
                  stroke={p.color}
                  strokeWidth={p.size}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              {currentPts && tool === "pen" && (
                <polyline
                  points={currentPts}
                  stroke={color}
                  strokeWidth={size}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
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
        {hasStrokes && <Badge variant="outline" className="border-emerald-500 text-emerald-600 text-xs">
          {paths.length} trait{paths.length > 1 ? "s" : ""} — non sauvegardé
        </Badge>}
      </div>
    </div>
  );
}

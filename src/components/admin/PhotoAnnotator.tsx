// Outil d'annotation par-dessus une photo (style stylo rouge sur copie)
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eraser, Pencil, Undo2, Trash2, Loader2, Type as TypeIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  onSave: (blob: Blob) => Promise<void> | void;
}

type Tool = "pen" | "eraser";
const COLORS = ["#ef4444", "#22c55e", "#3b82f6", "#eab308", "#000000"];
const SIZES = [3, 6, 10, 16];

export default function PhotoAnnotator({ open, onOpenChange, imageUrl, onSave }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(SIZES[1]);
  const [drawing, setDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [saving, setSaving] = useState(false);
  const lastPt = useRef<{ x: number; y: number } | null>(null);

  // Charge l'image et dimensionne le canvas
  useEffect(() => {
    if (!open) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const maxW = 1200;
      const scale = Math.min(1, maxW / img.naturalWidth);
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setHistory([ctx.getImageData(0, 0, canvas.width, canvas.height)]);
    };
    img.onerror = () => console.error("Annotator: image load failed", imageUrl);
    img.src = imageUrl;
  }, [open, imageUrl]);

  const pushHistory = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    setHistory((h) => [...h.slice(-30), ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  };

  const getPt = (e: React.PointerEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const onDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    pushHistory();
    setDrawing(true);
    lastPt.current = getPt(e);
  };

  const onMove = (e: React.PointerEvent) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !lastPt.current) return;
    const pt = getPt(e);
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = size;
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.lineWidth = size * 2.5;
      // Redessine la portion d'image originale sous le trait via clip
      ctx.beginPath();
      ctx.moveTo(lastPt.current.x, lastPt.current.y);
      ctx.lineTo(pt.x, pt.y);
      // Effacement → on remplace par l'image source
      ctx.globalCompositeOperation = "destination-out";
      ctx.stroke();
      // Réinjecte l'image d'origine sous ces pixels
      if (imgRef.current) {
        ctx.globalCompositeOperation = "destination-over";
        ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
      }
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(lastPt.current.x, lastPt.current.y);
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
    }
    ctx.restore();
    lastPt.current = pt;
  };

  const onUp = () => {
    setDrawing(false);
    lastPt.current = null;
  };

  const undo = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || history.length <= 1) return;
    const next = history.slice(0, -1);
    const last = next[next.length - 1];
    ctx.putImageData(last, 0, 0);
    setHistory(next);
  };

  const clearAll = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !imgRef.current) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
    setHistory([ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  };

  const addText = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const txt = window.prompt("Annotation texte :");
    if (!txt) return;
    pushHistory();
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = `bold ${Math.max(18, size * 4)}px sans-serif`;
    ctx.textBaseline = "top";
    ctx.fillText(txt, 20, 20);
    ctx.restore();
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSaving(true);
    try {
      const blob: Blob = await new Promise((res, rej) =>
        canvas.toBlob((b) => (b ? res(b) : rej(new Error("toBlob failed"))), "image/jpeg", 0.9)
      );
      await onSave(blob);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Annoter la copie de l'élève</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2 p-2 rounded-md border border-border bg-muted/30">
          <Button size="sm" variant={tool === "pen" ? "default" : "outline"} onClick={() => setTool("pen")} className="gap-1">
            <Pencil className="h-4 w-4" /> Stylo
          </Button>
          <Button size="sm" variant={tool === "eraser" ? "default" : "outline"} onClick={() => setTool("eraser")} className="gap-1">
            <Eraser className="h-4 w-4" /> Gomme
          </Button>
          <Button size="sm" variant="outline" onClick={addText} className="gap-1">
            <TypeIcon className="h-4 w-4" /> Texte
          </Button>
          <div className="h-6 w-px bg-border mx-1" />
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => { setColor(c); setTool("pen"); }}
              className={cn("h-7 w-7 rounded-full border-2 transition", color === c ? "border-foreground scale-110" : "border-border")}
              style={{ background: c }}
              aria-label={`Couleur ${c}`}
            />
          ))}
          <div className="h-6 w-px bg-border mx-1" />
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              className={cn("h-7 w-7 rounded-md border flex items-center justify-center transition", size === s ? "border-foreground bg-background" : "border-border")}
              aria-label={`Épaisseur ${s}`}
            >
              <span className="rounded-full bg-foreground" style={{ width: s, height: s }} />
            </button>
          ))}
          <div className="h-6 w-px bg-border mx-1" />
          <Button size="sm" variant="outline" onClick={undo} className="gap-1">
            <Undo2 className="h-4 w-4" /> Annuler
          </Button>
          <Button size="sm" variant="outline" onClick={clearAll} className="gap-1">
            <Trash2 className="h-4 w-4" /> Tout effacer
          </Button>
        </div>

        <div className="bg-muted/20 rounded-md p-2 overflow-auto flex justify-center">
          <canvas
            ref={canvasRef}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onPointerLeave={onUp}
            className="touch-none max-w-full h-auto rounded shadow-md cursor-crosshair bg-white"
            style={{ touchAction: "none" }}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2 gradient-emerald border-0 text-primary-foreground">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Enregistrement…</> : "Enregistrer l'annotation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

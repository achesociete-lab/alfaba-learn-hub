import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Delete } from "lucide-react";

interface ArabicKeyboardProps {
  onChar: (c: string) => void;
  onBackspace: () => void;
  onClose: () => void;
}

const ROWS = [
  ["ض","ص","ث","ق","ف","غ","ع","ه","خ","ح","ج","د"],
  ["ش","س","ي","ب","ل","ا","ت","ن","م","ك","ط"],
  ["ئ","ء","ؤ","ر","ى","ة","و","ز","ظ","ذ"],
];

const HARAKAT = ["َ","ِ","ُ","ْ","ً","ٍ","ٌ","ّ"];

export default function ArabicKeyboard({ onChar, onBackspace, onClose }: ArabicKeyboardProps) {
  const [showHarakat, setShowHarakat] = useState(false);

  return (
    <div className="border border-border rounded-xl bg-background shadow-lg p-3 space-y-2">
      <div className="flex items-center justify-between mb-1">
        <button
          className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border"
          onClick={() => setShowHarakat(v => !v)}
        >
          {showHarakat ? "Lettres" : "Voyelles (حركات)"}
        </button>
        <button className="text-xs text-muted-foreground hover:text-foreground" onClick={onClose}>✕ Fermer</button>
      </div>

      {showHarakat ? (
        <div className="grid grid-cols-8 gap-1.5">
          {HARAKAT.map((h) => (
            <button
              key={h}
              onClick={() => onChar(h)}
              className="h-9 rounded-lg border border-border bg-muted/40 hover:bg-primary/10 hover:border-primary/40 transition-all text-lg font-arabic flex items-center justify-center"
              style={{ fontFamily: "Amiri, serif" }}
            >
              ا{h}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-1.5">
          {ROWS.map((row, ri) => (
            <div key={ri} className="flex gap-1.5 justify-center" dir="rtl">
              {row.map((l) => (
                <button
                  key={l}
                  onClick={() => onChar(l)}
                  className="h-9 w-9 rounded-lg border border-border bg-muted/40 hover:bg-primary/10 hover:border-primary/40 transition-all text-base font-bold flex items-center justify-center"
                  style={{ fontFamily: "Amiri, serif" }}
                >
                  {l}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end pt-1">
        <Button variant="outline" size="sm" onClick={onBackspace} className="gap-1.5">
          <Delete className="h-3.5 w-3.5" /> Effacer
        </Button>
      </div>
    </div>
  );
}

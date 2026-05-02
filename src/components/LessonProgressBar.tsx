import { motion } from "framer-motion";
import { Star, Trophy } from "lucide-react";

interface LessonProgressBarProps {
  completedLessons: number[];
  totalLessons: number;
  label?: string;
}

export default function LessonProgressBar({ completedLessons, totalLessons, label }: LessonProgressBarProps) {
  const completed = completedLessons.length;
  const pct = Math.round((completed / totalLessons) * 100);

  const rows: number[][] = [];
  for (let i = 0; i < totalLessons; i += 5) {
    rows.push(Array.from({ length: Math.min(5, totalLessons - i) }, (_, j) => i + j + 1));
  }

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {completed === totalLessons
            ? <Trophy className="h-5 w-5 text-yellow-500" />
            : <Star className="h-5 w-5 text-yellow-400" />}
          <span className="text-sm font-semibold text-foreground">{label ?? "Progression"}</span>
        </div>
        <span className="text-sm font-bold text-primary">{completed}/{totalLessons}</span>
      </div>

      <div className="relative w-full bg-muted rounded-full h-3 overflow-hidden">
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-primary to-yellow-400"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      <div className="space-y-1.5">
        {rows.map((row, ri) => (
          <div key={ri} className="flex items-center gap-1.5">
            {row.map((lessonNum) => {
              const isDone = completedLessons.includes(lessonNum);
              return (
                <div key={lessonNum} className="flex flex-col items-center gap-0.5 flex-1">
                  <motion.span
                    initial={isDone ? { scale: 0, rotate: -30 } : false}
                    animate={isDone ? { scale: 1, rotate: 0 } : {}}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className={`inline-block text-lg leading-none ${isDone ? "text-yellow-400 drop-shadow-sm" : "text-muted-foreground/30"}`}
                  >★</motion.span>
                  <span className="text-[9px] text-muted-foreground leading-none">{lessonNum}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {completed === 0 && <p className="text-xs text-center text-muted-foreground">Lance-toi dans la première leçon ! 🚀</p>}
      {completed > 0 && completed < totalLessons && (
        <p className="text-xs text-center text-muted-foreground">
          {totalLessons - completed} leçon{totalLessons - completed > 1 ? "s" : ""} restante{totalLessons - completed > 1 ? "s" : ""} — courage ! 💪
        </p>
      )}
      {completed === totalLessons && <p className="text-xs text-center text-yellow-500 font-semibold">🏆 Niveau complété ! Félicitations !</p>}
    </div>
  );
}

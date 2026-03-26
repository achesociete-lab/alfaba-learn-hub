import { motion } from "framer-motion";
import { CheckCircle, Lock } from "lucide-react";
import type { Lesson } from "@/data/niveau1-lessons";
import { useIsAdmin } from "@/hooks/use-admin";

interface LessonSelectorProps {
  completedLessons: number[];
  currentLesson: number | null;
  onSelectLesson: (lesson: Lesson) => void;
  lessons: Lesson[];
}

const LessonSelector = ({ completedLessons, currentLesson, onSelectLesson, lessons }: LessonSelectorProps) => {
  const { isAdmin } = useIsAdmin();

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <p className="text-sm text-muted-foreground">
          {completedLessons.length} / {lessons.length} leçons terminées
        </p>
        <div className="w-full bg-muted rounded-full h-2 mt-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${(completedLessons.length / lessons.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2" dir="rtl">
        {lessons.map((lesson, idx) => {
          const isCompleted = completedLessons.includes(lesson.id);
          const isUnlocked = isAdmin || idx === 0 || completedLessons.includes(lessons[idx - 1].id);
          const isActive = currentLesson === lesson.id;

          return (
            <motion.button
              key={lesson.id}
              whileHover={isUnlocked ? { scale: 1.05 } : {}}
              whileTap={isUnlocked ? { scale: 0.95 } : {}}
              onClick={() => isUnlocked && onSelectLesson(lesson)}
              disabled={!isUnlocked}
              className={`relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                isActive
                  ? "border-primary bg-primary/10 ring-2 ring-primary"
                  : isCompleted
                  ? "border-primary/30 bg-primary/5"
                  : isUnlocked
                  ? "border-border bg-card hover:border-primary/50 hover:bg-muted cursor-pointer"
                  : "border-border/50 bg-muted/30 opacity-50 cursor-not-allowed"
              }`}
            >
              <span className="font-arabic text-2xl text-foreground">{lesson.letter}</span>
              <span className="text-[10px] text-muted-foreground mt-1">{lesson.name}</span>
              {isCompleted && (
                <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 text-primary fill-primary/20" />
              )}
              {!isUnlocked && (
                <Lock className="absolute -top-1 -right-1 h-3 w-3 text-muted-foreground" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default LessonSelector;

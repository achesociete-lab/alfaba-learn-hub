import { motion } from "framer-motion";
import { CheckCircle, Lock, ArrowRight } from "lucide-react";
import type { Lesson } from "@/data/niveau1-lessons";
import { useIsAdmin } from "@/hooks/use-admin";

interface LessonSelectorProps {
  completedLessons: number[];
  currentLesson: number | null;
  onSelectLesson: (lesson: Lesson) => void;
  lessons: Lesson[];
  maxLessons?: number;
}

const LessonSelector = ({ completedLessons, currentLesson, onSelectLesson, lessons, maxLessons = Infinity }: LessonSelectorProps) => {
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

      <div className="space-y-2">
        {lessons.map((lesson, idx) => {
          const isCompleted = completedLessons.includes(lesson.id);
          const withinPlan = isAdmin || idx < maxLessons;
          const isUnlocked = withinPlan && (idx === 0 || completedLessons.includes(lessons[idx - 1].id));
          const isActive = currentLesson === lesson.id;

          return (
            <motion.button
              key={lesson.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              whileHover={isUnlocked ? { scale: 1.01 } : {}}
              whileTap={isUnlocked ? { scale: 0.99 } : {}}
              onClick={() => isUnlocked && onSelectLesson(lesson)}
              disabled={!isUnlocked}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                isActive
                  ? "border-primary bg-primary/10 ring-2 ring-primary"
                  : isCompleted
                  ? "border-primary/30 bg-primary/5"
                  : isUnlocked
                  ? "border-border bg-card hover:border-primary/50 hover:bg-muted cursor-pointer"
                  : "border-border/50 bg-muted/30 opacity-50 cursor-not-allowed"
              }`}
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-lg">
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5 text-primary" />
                ) : !isUnlocked ? (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <span>{lesson.icon}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground">
                  Leçon {lesson.id} — {lesson.title}
                </h3>
                <p className="text-xs text-muted-foreground truncate">{lesson.subtitle}</p>
              </div>
              {isUnlocked && <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default LessonSelector;

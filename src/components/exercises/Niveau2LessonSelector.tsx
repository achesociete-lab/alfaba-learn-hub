import { motion } from "framer-motion";
import { Lock, CheckCircle, GraduationCap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { niveau2Lessons, type Niveau2Lesson } from "@/data/niveau2-lessons";

interface Niveau2LessonSelectorProps {
  completedLessons: number[];
  onSelectLesson: (lesson: Niveau2Lesson) => void;
}

const Niveau2LessonSelector = ({ completedLessons, onSelectLesson }: Niveau2LessonSelectorProps) => {
  const progress = (completedLessons.length / niveau2Lessons.length) * 100;

  const isUnlocked = (lessonId: number) => {
    if (lessonId === 1) return true;
    return completedLessons.includes(lessonId - 1);
  };

  return (
    <div className="space-y-6">
      <div className="text-center text-sm text-muted-foreground">
        {completedLessons.length} / {niveau2Lessons.length} leçons terminées
      </div>
      <Progress value={progress} className="h-2" />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3" dir="rtl">
        {niveau2Lessons.map((lesson, i) => {
          const unlocked = isUnlocked(lesson.id);
          const completed = completedLessons.includes(lesson.id);

          return (
            <motion.button
              key={lesson.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => unlocked && onSelectLesson(lesson)}
              disabled={!unlocked}
              className={`relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all text-center min-h-[120px] ${
                completed
                  ? "border-primary bg-primary/5 hover:bg-primary/10"
                  : unlocked
                  ? "border-border bg-card hover:border-primary/40 hover:shadow-md cursor-pointer"
                  : "border-border/50 bg-muted/50 opacity-60 cursor-not-allowed"
              }`}
            >
              {completed && (
                <CheckCircle className="absolute top-2 right-2 h-4 w-4 text-primary" />
              )}
              {!unlocked && (
                <Lock className="absolute top-2 right-2 h-3 w-3 text-muted-foreground" />
              )}
              <GraduationCap className="h-6 w-6 text-gold mb-2" />
              <span className="text-xs font-semibold text-foreground leading-tight">
                {lesson.title}
              </span>
              <span className="text-[10px] text-muted-foreground mt-1">Leçon {lesson.id}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default Niveau2LessonSelector;

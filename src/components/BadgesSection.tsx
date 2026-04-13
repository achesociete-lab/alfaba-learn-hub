import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Star, Medal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLessonProgress } from "@/hooks/use-lesson-progress";

interface Badge {
  id: string;
  title: string;
  icon: string;
  description: string;
  earned: boolean;
}

export function useBadges() {
  const { user } = useAuth();
  const { completedLessons } = useLessonProgress();
  const [recitationCount, setRecitationCount] = useState(0);
  const [hasFatiha, setHasFatiha] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Count recitations
    supabase.from("quran_recitations").select("id", { count: "exact" }).eq("user_id", user.id)
      .then(({ count }) => setRecitationCount(count || 0));
    // Check Al-Fatiha memorized
    supabase.from("surah_memorization").select("status").eq("user_id", user.id).eq("surah_number", 1).eq("status", "mémorisée" as any).maybeSingle()
      .then(({ data }) => setHasFatiha(!!data));
  }, [user]);

  const badges: Badge[] = [
    {
      id: "fatiha",
      title: "Al-Fatiha mémorisée",
      icon: "🥇",
      description: "Mémoriser la sourate Al-Fatiha",
      earned: hasFatiha,
    },
    {
      id: "10recitations",
      title: "10 récitations envoyées",
      icon: "⭐",
      description: "Soumettre 10 récitations au professeur",
      earned: recitationCount >= 10,
    },
    {
      id: "niveau1",
      title: "Niveau 1 complété",
      icon: "🏆",
      description: "Terminer toutes les leçons du Niveau 1",
      earned: completedLessons.length >= 10,
    },
  ];

  return { badges, recitationCount };
}

export function BadgesSection() {
  const { badges } = useBadges();

  return (
    <div className="grid grid-cols-3 gap-3">
      {badges.map((badge, i) => (
        <motion.div
          key={badge.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`p-4 rounded-xl border text-center transition-all ${
            badge.earned
              ? "border-primary/30 bg-primary/5"
              : "border-border bg-muted/30 opacity-50"
          }`}
        >
          <span className="text-3xl">{badge.icon}</span>
          <p className={`text-xs font-semibold mt-2 ${badge.earned ? "text-foreground" : "text-muted-foreground"}`}>
            {badge.title}
          </p>
          {!badge.earned && (
            <p className="text-[10px] text-muted-foreground mt-1">{badge.description}</p>
          )}
        </motion.div>
      ))}
    </div>
  );
}

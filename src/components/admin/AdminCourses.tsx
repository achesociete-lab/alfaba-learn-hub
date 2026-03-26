import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, ChevronRight, CheckCircle, XCircle, Volume2,
  Search, Eye, PenTool, Brain, FileText, ArrowLeft
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { niveau1Lessons, type Lesson } from "@/data/niveau1-lessons";
import { niveau2Lessons, type Niveau2Lesson } from "@/data/niveau2-lessons";
import { useArabicSpeech } from "@/hooks/use-arabic-speech";
import { getIllustration } from "@/utils/vocabulary-illustrations";

// ─── Niveau 1 Lesson Viewer ───
function N1LessonViewer({ lesson, onBack }: { lesson: Lesson; onBack: () => void }) {
  const { speak } = useArabicSpeech();

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2 mb-2">
        <ArrowLeft className="h-4 w-4" /> Retour aux leçons
      </Button>

      <div className="p-4 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center font-arabic text-2xl text-primary">
            {lesson.letter}
          </div>
          <div>
            <h3 className="font-bold text-foreground">Leçon {lesson.id} — {lesson.name} ({lesson.letter})</h3>
            <p className="text-xs text-muted-foreground">{lesson.pronunciation}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{lesson.description}</p>
      </div>

      {/* Formes */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <h4 className="font-semibold text-foreground mb-3">📝 Formes de la lettre</h4>
        <div className="grid grid-cols-4 gap-3">
          {(["isolated", "initial", "medial", "final"] as const).map((form) => (
            <div key={form} className="text-center p-3 rounded-lg bg-muted">
              <p className="font-arabic text-2xl text-foreground">{lesson.forms[form]}</p>
              <p className="text-[10px] text-muted-foreground mt-1 capitalize">{form === "isolated" ? "Isolée" : form === "initial" ? "Début" : form === "medial" ? "Milieu" : "Fin"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Voyelles */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <h4 className="font-semibold text-foreground mb-3">🔤 Voyelles</h4>
        <div className="grid grid-cols-3 gap-3">
          {(["withFatha", "withDamma", "withKasra"] as const).map((v) => (
            <div
              key={v}
              className="text-center p-3 rounded-lg bg-muted cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={() => speak(lesson.vowelExamples[v])}
            >
              <p className="font-arabic text-2xl text-foreground">{lesson.vowelExamples[v]}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{v === "withFatha" ? "Fatha" : v === "withDamma" ? "Damma" : "Kasra"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Exemples */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <h4 className="font-semibold text-foreground mb-3">📖 Exemples ({lesson.examples.length})</h4>
        <div className="space-y-2">
          {lesson.examples.map((ex, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => speak(ex.arabic)}>
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="font-arabic text-lg text-foreground">{ex.arabic}</p>
                  <p className="text-xs text-muted-foreground">{ex.transliteration}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-foreground font-medium">{ex.meaning}</p>
                {getIllustration(ex.meaning) && <span className="text-xl">{getIllustration(ex.meaning)}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QCM */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <h4 className="font-semibold text-foreground mb-3">🧠 QCM ({lesson.qcm.length} questions)</h4>
        <div className="space-y-4">
          {lesson.qcm.map((q, i) => (
            <div key={i} className="p-3 rounded-lg bg-muted">
              <p className="text-sm font-medium text-foreground mb-2">Q{i + 1}. {q.question}</p>
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt, idx) => (
                  <div key={idx} className={`p-2 rounded text-xs ${idx === q.correctIndex ? "bg-primary/10 text-primary border border-primary/30 font-semibold" : "bg-background text-muted-foreground border border-border"}`}>
                    {idx === q.correctIndex && <CheckCircle className="h-3 w-3 inline mr-1" />}
                    {opt}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2 italic">💡 {q.explanation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dictée */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <h4 className="font-semibold text-foreground mb-3">✍️ Dictée ({lesson.dictation.length} items)</h4>
        <div className="space-y-3">
          {lesson.dictation.map((d, i) => (
            <div key={i} className="p-3 rounded-lg bg-muted">
              <p className="text-sm font-medium text-foreground mb-1">
                <span className="font-arabic text-lg">{d.word}</span> — {d.transliteration}
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {d.options.map((opt, idx) => (
                  <div key={idx} className={`p-2 rounded font-arabic text-sm ${idx === d.correctIndex ? "bg-primary/10 text-primary border border-primary/30 font-semibold" : "bg-background text-muted-foreground border border-border"}`}>
                    {idx === d.correctIndex && <CheckCircle className="h-3 w-3 inline mr-1" />}
                    {opt}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Niveau 2 Lesson Viewer ───
function N2LessonViewer({ lesson, onBack }: { lesson: Niveau2Lesson; onBack: () => void }) {
  const { speak } = useArabicSpeech();

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2 mb-2">
        <ArrowLeft className="h-4 w-4" /> Retour aux leçons
      </Button>

      <div className="p-4 rounded-xl border border-border bg-card">
        <h3 className="font-bold text-foreground mb-1">Leçon {lesson.id} — {lesson.title}</h3>
        <p className="text-xs text-muted-foreground mb-2">{lesson.subtitle}</p>
        <p className="text-sm text-muted-foreground">{lesson.description}</p>
      </div>

      {/* Grammaire */}
      {lesson.grammar.map((rule, idx) => (
        <div key={idx} className="p-4 rounded-xl border border-border bg-card">
          <h4 className="font-semibold text-foreground mb-2">📝 {rule.title}</h4>
          <p className="text-sm text-muted-foreground mb-3">{rule.explanation}</p>
          <div className="space-y-2">
            {rule.examples.map((ex, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => speak(ex.arabic)}>
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="font-arabic text-lg text-foreground">{ex.arabic}</p>
                    <p className="text-xs text-muted-foreground">{ex.transliteration}</p>
                  </div>
                </div>
                <p className="text-sm text-foreground font-medium">{ex.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Compréhension */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <h4 className="font-semibold text-foreground mb-2">📚 {lesson.comprehension.title}</h4>
        <div className="p-3 rounded-lg bg-muted cursor-pointer hover:bg-primary/10 transition-colors mb-3" onClick={() => speak(lesson.comprehension.arabic)}>
          <div className="flex items-center gap-2 mb-1">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Cliquez pour écouter</span>
          </div>
          <p className="font-arabic text-base leading-loose text-foreground">{lesson.comprehension.arabic}</p>
        </div>
        <p className="text-sm text-muted-foreground italic mb-3">{lesson.comprehension.translation}</p>
        <div className="space-y-3">
          {lesson.comprehension.questions.map((q, i) => (
            <div key={i} className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm font-medium text-foreground mb-2">Q{i + 1}. {q.question}</p>
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt, idx) => (
                  <div key={idx} className={`p-2 rounded text-xs ${idx === q.correctIndex ? "bg-primary/10 text-primary border border-primary/30 font-semibold" : "bg-background text-muted-foreground border border-border"}`}>
                    {idx === q.correctIndex && <CheckCircle className="h-3 w-3 inline mr-1" />}
                    {opt}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2 italic">💡 {q.explanation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* QCM */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <h4 className="font-semibold text-foreground mb-3">🧠 QCM ({lesson.qcm.length} questions)</h4>
        <div className="space-y-4">
          {lesson.qcm.map((q, i) => (
            <div key={i} className="p-3 rounded-lg bg-muted">
              <p className="text-sm font-medium text-foreground mb-2">Q{i + 1}. {q.question}</p>
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt, idx) => (
                  <div key={idx} className={`p-2 rounded text-xs ${idx === q.correctIndex ? "bg-primary/10 text-primary border border-primary/30 font-semibold" : "bg-background text-muted-foreground border border-border"}`}>
                    {idx === q.correctIndex && <CheckCircle className="h-3 w-3 inline mr-1" />}
                    {opt}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2 italic">💡 {q.explanation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dictée */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <h4 className="font-semibold text-foreground mb-3">✍️ Dictée ({lesson.dictation.length} items)</h4>
        <div className="space-y-3">
          {lesson.dictation.map((d, i) => (
            <div key={i} className="p-3 rounded-lg bg-muted">
              <p className="text-sm font-medium text-foreground mb-1">
                <span className="font-arabic text-lg">{d.sentence}</span> — {d.transliteration}
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {d.options.map((opt, idx) => (
                  <div key={idx} className={`p-2 rounded font-arabic text-sm ${idx === d.correctIndex ? "bg-primary/10 text-primary border border-primary/30 font-semibold" : "bg-background text-muted-foreground border border-border"}`}>
                    {idx === d.correctIndex && <CheckCircle className="h-3 w-3 inline mr-1" />}
                    {opt}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───
const AdminCourses = () => {
  const [level, setLevel] = useState<"niveau_1" | "niveau_2">("niveau_1");
  const [search, setSearch] = useState("");
  const [selectedN1, setSelectedN1] = useState<Lesson | null>(null);
  const [selectedN2, setSelectedN2] = useState<Niveau2Lesson | null>(null);

  const filteredN1 = niveau1Lessons.filter(
    (l) => l.name.toLowerCase().includes(search.toLowerCase()) || l.letter.includes(search) || l.id.toString() === search
  );
  const filteredN2 = niveau2Lessons.filter(
    (l) => l.title.toLowerCase().includes(search.toLowerCase()) || l.id.toString() === search
  );

  // If viewing a lesson detail
  if (selectedN1) return <N1LessonViewer lesson={selectedN1} onBack={() => setSelectedN1(null)} />;
  if (selectedN2) return <N2LessonViewer lesson={selectedN2} onBack={() => setSelectedN2(null)} />;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Cours & Contenu pédagogique</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une leçon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setLevel("niveau_1")}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              level === "niveau_1" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30"
            }`}
          >
            Niveau 1 ({niveau1Lessons.length} leçons)
          </button>
          <button
            onClick={() => setLevel("niveau_2")}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              level === "niveau_2" ? "border-gold bg-gold/10 text-gold" : "border-border text-muted-foreground hover:border-gold/30"
            }`}
          >
            Niveau 2 ({niveau2Lessons.length} leçons)
          </button>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {level === "niveau_1" ? (
          <>
            <div className="p-3 rounded-lg border border-border bg-card text-center">
              <p className="text-2xl font-bold text-foreground">{niveau1Lessons.length}</p>
              <p className="text-xs text-muted-foreground">Leçons</p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-card text-center">
              <p className="text-2xl font-bold text-foreground">{niveau1Lessons.reduce((s, l) => s + l.qcm.length, 0)}</p>
              <p className="text-xs text-muted-foreground">Questions QCM</p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-card text-center">
              <p className="text-2xl font-bold text-foreground">{niveau1Lessons.reduce((s, l) => s + l.dictation.length, 0)}</p>
              <p className="text-xs text-muted-foreground">Items dictée</p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-card text-center">
              <p className="text-2xl font-bold text-foreground">{niveau1Lessons.reduce((s, l) => s + l.examples.length, 0)}</p>
              <p className="text-xs text-muted-foreground">Exemples vocab</p>
            </div>
          </>
        ) : (
          <>
            <div className="p-3 rounded-lg border border-border bg-card text-center">
              <p className="text-2xl font-bold text-foreground">{niveau2Lessons.length}</p>
              <p className="text-xs text-muted-foreground">Leçons</p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-card text-center">
              <p className="text-2xl font-bold text-foreground">{niveau2Lessons.reduce((s, l) => s + l.qcm.length + l.comprehension.questions.length, 0)}</p>
              <p className="text-xs text-muted-foreground">Questions QCM</p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-card text-center">
              <p className="text-2xl font-bold text-foreground">{niveau2Lessons.reduce((s, l) => s + l.dictation.length, 0)}</p>
              <p className="text-xs text-muted-foreground">Items dictée</p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-card text-center">
              <p className="text-2xl font-bold text-foreground">{niveau2Lessons.reduce((s, l) => s + l.grammar.length, 0)}</p>
              <p className="text-xs text-muted-foreground">Règles grammaire</p>
            </div>
          </>
        )}
      </div>

      {/* Lesson list */}
      <div className="space-y-2">
        {level === "niveau_1" ? (
          filteredN1.map((lesson, i) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => setSelectedN1(lesson)}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 cursor-pointer transition-colors"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center font-arabic text-2xl text-primary shrink-0">
                {lesson.letter}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground">
                  Leçon {lesson.id} — {lesson.name}
                </h3>
                <p className="text-xs text-muted-foreground truncate">{lesson.pronunciation}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                <span className="flex items-center gap-1"><Brain className="h-3 w-3" /> {lesson.qcm.length}</span>
                <span className="flex items-center gap-1"><PenTool className="h-3 w-3" /> {lesson.dictation.length}</span>
                <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {lesson.examples.length}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </motion.div>
          ))
        ) : (
          filteredN2.map((lesson, i) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => setSelectedN2(lesson)}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-gold/30 cursor-pointer transition-colors"
            >
              <div className="h-12 w-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold font-bold text-lg shrink-0">
                {lesson.id}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground">{lesson.title}</h3>
                <p className="text-xs text-muted-foreground truncate">{lesson.subtitle}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                <span className="flex items-center gap-1"><Brain className="h-3 w-3" /> {lesson.qcm.length + lesson.comprehension.questions.length}</span>
                <span className="flex items-center gap-1"><PenTool className="h-3 w-3" /> {lesson.dictation.length}</span>
                <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {lesson.grammar.length}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminCourses;

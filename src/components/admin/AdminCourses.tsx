import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, CheckCircle, Volume2,
  Search, ArrowLeft, Edit, Save, X, Plus, Trash2, Video
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Lesson, LessonQCM, DictationItem, LessonExample } from "@/data/niveau1-lessons";
import type { Niveau2Lesson, Niveau2QCM, Niveau2Dictation, GrammarRule, ComprehensionText } from "@/data/niveau2-lessons";
import { useArabicSpeech } from "@/hooks/use-arabic-speech";
import { getIllustration } from "@/utils/vocabulary-illustrations";
import { useNiveau1Lessons, useNiveau2Lessons, updateLessonContent } from "@/hooks/use-lessons";
import { toast } from "sonner";

// ─── Editable field ───
function EditField({ label, value, onChange, dir, multiline }: { label: string; value: string; onChange: (v: string) => void; dir?: string; multiline?: boolean }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {multiline ? (
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} dir={dir} className="text-sm" />
      ) : (
        <Input value={value} onChange={(e) => onChange(e.target.value)} dir={dir} className="text-sm" />
      )}
    </div>
  );
}

// ─── QCM Editor ───
function QCMEditor({ qcm, onChange }: { qcm: LessonQCM[]; onChange: (q: LessonQCM[]) => void }) {
  const updateQ = (idx: number, field: string, val: any) => {
    const updated = [...qcm];
    (updated[idx] as any)[field] = val;
    onChange(updated);
  };
  const updateOption = (qIdx: number, oIdx: number, val: string) => {
    const updated = [...qcm];
    updated[qIdx].options[oIdx] = val;
    onChange(updated);
  };
  const removeQ = (idx: number) => onChange(qcm.filter((_, i) => i !== idx));
  const addQ = () => onChange([...qcm, { question: "", options: ["", "", "", ""], correctIndex: 0, explanation: "" }]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-foreground">🧠 QCM ({qcm.length})</h4>
        <Button size="sm" variant="outline" onClick={addQ} className="gap-1"><Plus className="h-3 w-3" /> Ajouter</Button>
      </div>
      {qcm.map((q, i) => (
        <div key={i} className="p-3 rounded-lg border border-border space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1"><EditField label={`Question ${i + 1}`} value={q.question} onChange={(v) => updateQ(i, "question", v)} /></div>
            <Button size="icon" variant="ghost" onClick={() => removeQ(i)} className="mt-5 text-destructive"><Trash2 className="h-4 w-4" /></Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {q.options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <input type="radio" name={`qcm-${i}`} checked={q.correctIndex === idx} onChange={() => updateQ(i, "correctIndex", idx)} className="shrink-0" />
                <Input value={opt} onChange={(e) => updateOption(i, idx, e.target.value)} className="text-xs h-8" />
              </div>
            ))}
          </div>
          <EditField label="Explication" value={q.explanation} onChange={(v) => updateQ(i, "explanation", v)} />
        </div>
      ))}
    </div>
  );
}

// ─── Examples Editor ───
function ExamplesEditor({ examples, onChange }: { examples: LessonExample[]; onChange: (e: LessonExample[]) => void }) {
  const update = (idx: number, field: keyof LessonExample, val: string) => {
    const updated = [...examples];
    updated[idx] = { ...updated[idx], [field]: val };
    onChange(updated);
  };
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-foreground">📖 Exemples ({examples.length})</h4>
        <Button size="sm" variant="outline" onClick={() => onChange([...examples, { arabic: "", transliteration: "", meaning: "" }])} className="gap-1"><Plus className="h-3 w-3" /> Ajouter</Button>
      </div>
      {examples.map((ex, i) => (
        <div key={i} className="grid grid-cols-3 gap-2 items-end">
          <EditField label="Arabe" value={ex.arabic} onChange={(v) => update(i, "arabic", v)} dir="rtl" />
          <EditField label="Translittération" value={ex.transliteration} onChange={(v) => update(i, "transliteration", v)} />
          <div className="flex gap-1 items-end">
            <div className="flex-1"><EditField label="Sens" value={ex.meaning} onChange={(v) => update(i, "meaning", v)} /></div>
            <Button size="icon" variant="ghost" onClick={() => onChange(examples.filter((_, j) => j !== i))} className="text-destructive h-10"><Trash2 className="h-4 w-4" /></Button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Dictation Editor ───
function DictationEditor({ dictation, onChange, wordKey }: { dictation: DictationItem[]; onChange: (d: DictationItem[]) => void; wordKey: string }) {
  const updateD = (idx: number, field: string, val: any) => {
    const updated = [...dictation];
    (updated[idx] as any)[field] = val;
    onChange(updated);
  };
  const updateOption = (dIdx: number, oIdx: number, val: string) => {
    const updated = [...dictation];
    updated[dIdx].options[oIdx] = val;
    onChange(updated);
  };
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-foreground">✍️ Dictée ({dictation.length})</h4>
        <Button size="sm" variant="outline" onClick={() => onChange([...dictation, { [wordKey]: "", transliteration: "", options: ["", "", "", ""], correctIndex: 0 } as any])} className="gap-1"><Plus className="h-3 w-3" /> Ajouter</Button>
      </div>
      {dictation.map((d, i) => (
        <div key={i} className="p-3 rounded-lg border border-border space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <EditField label="Mot/Phrase" value={(d as any)[wordKey]} onChange={(v) => updateD(i, wordKey, v)} dir="rtl" />
            <EditField label="Translittération" value={d.transliteration} onChange={(v) => updateD(i, "transliteration", v)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {d.options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <input type="radio" name={`dict-${i}`} checked={d.correctIndex === idx} onChange={() => updateD(i, "correctIndex", idx)} className="shrink-0" />
                <Input value={opt} onChange={(e) => updateOption(i, idx, e.target.value)} className="text-xs h-8" dir="rtl" />
              </div>
            ))}
          </div>
          <Button size="sm" variant="ghost" onClick={() => onChange(dictation.filter((_, j) => j !== i))} className="text-destructive gap-1"><Trash2 className="h-3 w-3" /> Supprimer</Button>
        </div>
      ))}
    </div>
  );
}

// ─── Niveau 1 Lesson Editor (Thematic) ───
function N1LessonEditor({ lesson: initialLesson, onBack, onSaved }: { lesson: Lesson; onBack: () => void; onSaved: () => void }) {
  const [lesson, setLesson] = useState<Lesson>({ ...initialLesson });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const update = (field: keyof Lesson, val: any) => setLesson(prev => ({ ...prev, [field]: val }));

  const save = async () => {
    setSaving(true);
    try {
      await updateLessonContent("niveau_1", lesson.id, lesson);
      toast.success("Leçon sauvegardée !");
      setEditing(false);
      onSaved();
    } catch (err: any) {
      toast.error("Erreur : " + err.message);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Retour</Button>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={() => { setLesson({ ...initialLesson }); setEditing(false); }} className="gap-1"><X className="h-4 w-4" /> Annuler</Button>
              <Button onClick={save} disabled={saving} className="gap-1"><Save className="h-4 w-4" /> {saving ? "..." : "Sauvegarder"}</Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setEditing(true)} className="gap-1"><Edit className="h-4 w-4" /> Modifier</Button>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">{lesson.icon}</div>
          <div className="flex-1">
            {editing ? (
              <div className="space-y-2">
                <EditField label="Titre" value={lesson.title} onChange={(v) => update("title", v)} />
                <EditField label="Sous-titre" value={lesson.subtitle} onChange={(v) => update("subtitle", v)} />
              </div>
            ) : (
              <>
                <h3 className="font-bold text-foreground">Leçon {lesson.id} — {lesson.title}</h3>
                <p className="text-xs text-muted-foreground">{lesson.subtitle}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Video URL */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2 mb-2">
          <Video className="h-4 w-4 text-primary" />
          <h4 className="font-semibold text-foreground">Vidéo de la leçon</h4>
        </div>
        {editing ? (
          <EditField label="URL de la vidéo (YouTube ou fichier)" value={lesson.videoUrl || ""} onChange={(v) => update("videoUrl", v || undefined)} />
        ) : (
          lesson.videoUrl ? (
            <p className="text-sm text-muted-foreground break-all">{lesson.videoUrl}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">Aucune vidéo configurée. Modifiez pour ajouter un lien.</p>
          )
        )}
      </div>

      {/* Theory sections count */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <h4 className="font-semibold text-foreground mb-2">📚 Contenu théorique</h4>
        <p className="text-sm text-muted-foreground">{lesson.theory.length} section(s) de cours</p>
        {lesson.theory.map((section, i) => (
          <div key={i} className="mt-2 p-2 rounded-lg bg-muted">
            <p className="text-sm font-medium text-foreground">{section.title}</p>
            <p className="text-xs text-muted-foreground truncate">{section.content.substring(0, 100)}...</p>
          </div>
        ))}
      </div>

      {/* QCM */}
      <div className="p-4 rounded-xl border border-border bg-card">
        {editing ? (
          <QCMEditor qcm={lesson.qcm} onChange={(q) => update("qcm", q)} />
        ) : (
          <>
            <h4 className="font-semibold text-foreground mb-3">🧠 QCM ({lesson.qcm.length})</h4>
            <div className="space-y-4">
              {lesson.qcm.map((q, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted">
                  <p className="text-sm font-medium text-foreground mb-2">Q{i + 1}. {q.question}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt, idx) => (
                      <div key={idx} className={`p-2 rounded text-xs ${idx === q.correctIndex ? "bg-primary/10 text-primary border border-primary/30 font-semibold" : "bg-background text-muted-foreground border border-border"}`}>
                        {idx === q.correctIndex && <CheckCircle className="h-3 w-3 inline mr-1" />}{opt}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 italic">💡 {q.explanation}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Dictée */}
      <div className="p-4 rounded-xl border border-border bg-card">
        {editing ? (
          <DictationEditor dictation={lesson.dictation} onChange={(d) => update("dictation", d)} wordKey="word" />
        ) : (
          <>
            <h4 className="font-semibold text-foreground mb-3">✍️ Dictée ({lesson.dictation.length})</h4>
            <div className="space-y-3">
              {lesson.dictation.map((d, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted">
                  <p className="text-sm font-medium text-foreground mb-1"><span className="font-arabic text-lg">{d.word}</span> — {d.transliteration}</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {d.options.map((opt, idx) => (
                      <div key={idx} className={`p-2 rounded font-arabic text-sm ${idx === d.correctIndex ? "bg-primary/10 text-primary border border-primary/30 font-semibold" : "bg-background text-muted-foreground border border-border"}`}>
                        {idx === d.correctIndex && <CheckCircle className="h-3 w-3 inline mr-1" />}{opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Niveau 2 Lesson Editor ───
function N2LessonEditor({ lesson: initialLesson, onBack, onSaved }: { lesson: Niveau2Lesson; onBack: () => void; onSaved: () => void }) {
  const { speak } = useArabicSpeech();
  const [lesson, setLesson] = useState<Niveau2Lesson>({ ...initialLesson });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const update = (field: keyof Niveau2Lesson, val: any) => setLesson(prev => ({ ...prev, [field]: val }));

  const save = async () => {
    setSaving(true);
    try {
      await updateLessonContent("niveau_2", lesson.id, lesson);
      toast.success("Leçon sauvegardée !");
      setEditing(false);
      onSaved();
    } catch (err: any) {
      toast.error("Erreur : " + err.message);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Retour</Button>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={() => { setLesson({ ...initialLesson }); setEditing(false); }} className="gap-1"><X className="h-4 w-4" /> Annuler</Button>
              <Button onClick={save} disabled={saving} className="gap-1"><Save className="h-4 w-4" /> {saving ? "..." : "Sauvegarder"}</Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setEditing(true)} className="gap-1"><Edit className="h-4 w-4" /> Modifier</Button>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="p-4 rounded-xl border border-border bg-card">
        {editing ? (
          <div className="space-y-2">
            <EditField label="Titre" value={lesson.title} onChange={(v) => update("title", v)} />
            <EditField label="Sous-titre" value={lesson.subtitle} onChange={(v) => update("subtitle", v)} />
            <EditField label="Description" value={lesson.description} onChange={(v) => update("description", v)} multiline />
          </div>
        ) : (
          <>
            <h3 className="font-bold text-foreground">{lesson.title}</h3>
            <p className="text-xs text-muted-foreground">{lesson.subtitle}</p>
            <p className="text-sm text-muted-foreground mt-2">{lesson.description}</p>
          </>
        )}
      </div>

      {/* Grammar rules */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <h4 className="font-semibold text-foreground mb-3">📐 Grammaire ({lesson.grammar.length})</h4>
        {lesson.grammar.map((rule, i) => (
          <div key={i} className="p-3 rounded-lg bg-muted mb-2">
            {editing ? (
              <div className="space-y-2">
                <EditField label="Titre" value={rule.title} onChange={(v) => {
                  const updated = [...lesson.grammar];
                  updated[i] = { ...updated[i], title: v };
                  update("grammar", updated);
                }} />
                <EditField label="Explication" value={rule.explanation} onChange={(v) => {
                  const updated = [...lesson.grammar];
                  updated[i] = { ...updated[i], explanation: v };
                  update("grammar", updated);
                }} multiline />
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-foreground">{rule.title}</p>
                <p className="text-xs text-muted-foreground">{rule.explanation}</p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {rule.examples.map((ex, j) => (
                    <span key={j} className="font-arabic text-sm text-primary cursor-pointer" onClick={() => speak(ex.arabic)}>
                      {ex.arabic}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Comprehension */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <h4 className="font-semibold text-foreground mb-3">📖 Compréhension</h4>
        {editing ? (
          <div className="space-y-2">
            <EditField label="Titre" value={lesson.comprehension.title} onChange={(v) => update("comprehension", { ...lesson.comprehension, title: v })} />
            <EditField label="Texte arabe" value={lesson.comprehension.arabic} onChange={(v) => update("comprehension", { ...lesson.comprehension, arabic: v })} dir="rtl" multiline />
            <EditField label="Traduction" value={lesson.comprehension.translation} onChange={(v) => update("comprehension", { ...lesson.comprehension, translation: v })} multiline />
          </div>
        ) : (
          <>
            <p className="text-sm font-medium text-foreground mb-2">{lesson.comprehension.title}</p>
            <p className="font-arabic text-lg text-foreground mb-2 cursor-pointer" dir="rtl" onClick={() => speak(lesson.comprehension.arabic)}>{lesson.comprehension.arabic}</p>
            <p className="text-sm text-muted-foreground italic">{lesson.comprehension.translation}</p>
          </>
        )}
      </div>

      {/* QCM */}
      <div className="p-4 rounded-xl border border-border bg-card">
        {editing ? (
          <QCMEditor qcm={lesson.qcm as any} onChange={(q) => update("qcm", q)} />
        ) : (
          <>
            <h4 className="font-semibold text-foreground mb-3">🧠 QCM ({lesson.qcm.length})</h4>
            <div className="space-y-4">
              {lesson.qcm.map((q, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted">
                  <p className="text-sm font-medium text-foreground mb-2">Q{i + 1}. {q.question}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt, idx) => (
                      <div key={idx} className={`p-2 rounded text-xs ${idx === q.correctIndex ? "bg-primary/10 text-primary border border-primary/30 font-semibold" : "bg-background text-muted-foreground border border-border"}`}>
                        {idx === q.correctIndex && <CheckCircle className="h-3 w-3 inline mr-1" />}{opt}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 italic">💡 {q.explanation}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Dictée */}
      <div className="p-4 rounded-xl border border-border bg-card">
        {editing ? (
          <DictationEditor dictation={lesson.dictation as any} onChange={(d) => update("dictation", d)} wordKey="word" />
        ) : (
          <>
            <h4 className="font-semibold text-foreground mb-3">✍️ Dictée ({lesson.dictation.length})</h4>
            <div className="space-y-3">
              {lesson.dictation.map((d, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted">
                  <p className="text-sm font-medium text-foreground mb-1"><span className="font-arabic text-lg">{d.sentence || (d as any).word}</span></p>
                  <p className="text-xs text-muted-foreground">{d.transliteration}</p>
                </div>
              ))}
            </div>
          </>
        )}
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

  const { lessons: n1Lessons, refetch: refetchN1 } = useNiveau1Lessons();
  const { lessons: n2Lessons, refetch: refetchN2 } = useNiveau2Lessons();

  const filteredN1 = n1Lessons.filter(
    (l) => l.title.toLowerCase().includes(search.toLowerCase()) || l.id.toString() === search
  );
  const filteredN2 = n2Lessons.filter(
    (l) => l.title.toLowerCase().includes(search.toLowerCase()) || l.id.toString() === search
  );

  if (selectedN1) return <N1LessonEditor lesson={selectedN1} onBack={() => setSelectedN1(null)} onSaved={() => { refetchN1(); }} />;
  if (selectedN2) return <N2LessonEditor lesson={selectedN2} onBack={() => setSelectedN2(null)} onSaved={() => { refetchN2(); }} />;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Cours & Contenu pédagogique</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher une leçon..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setLevel("niveau_1")}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${level === "niveau_1" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}
          >
            Niveau 1 ({n1Lessons.length})
          </button>
          <button
            onClick={() => setLevel("niveau_2")}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${level === "niveau_2" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}
          >
            Niveau 2 ({n2Lessons.length})
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="p-3 rounded-lg border border-border bg-card text-center">
          <p className="text-2xl font-bold text-foreground">{level === "niveau_1" ? n1Lessons.length : n2Lessons.length}</p>
          <p className="text-xs text-muted-foreground">Leçons</p>
        </div>
        <div className="p-3 rounded-lg border border-border bg-card text-center">
          <p className="text-2xl font-bold text-foreground">
            {level === "niveau_1"
              ? n1Lessons.reduce((s, l) => s + l.qcm.length, 0)
              : n2Lessons.reduce((s, l) => s + l.qcm.length + l.comprehension.questions.length, 0)}
          </p>
          <p className="text-xs text-muted-foreground">Questions QCM</p>
        </div>
        <div className="p-3 rounded-lg border border-border bg-card text-center">
          <p className="text-2xl font-bold text-foreground">
            {level === "niveau_1"
              ? n1Lessons.reduce((s, l) => s + l.dictation.length, 0)
              : n2Lessons.reduce((s, l) => s + l.dictation.length, 0)}
          </p>
          <p className="text-xs text-muted-foreground">Items dictée</p>
        </div>
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
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg shrink-0">{lesson.icon}</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground">Leçon {lesson.id} — {lesson.title}</h3>
                <p className="text-xs text-muted-foreground truncate">{lesson.subtitle}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {lesson.videoUrl && <Video className="h-4 w-4 text-primary" />}
                <span className="text-xs text-muted-foreground">{lesson.qcm.length} QCM</span>
                <Edit className="h-4 w-4 text-muted-foreground" />
              </div>
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
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 cursor-pointer transition-colors"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">{lesson.id}</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground">{lesson.title}</h3>
                <p className="text-xs text-muted-foreground truncate">{lesson.subtitle}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted-foreground">{lesson.qcm.length + lesson.comprehension.questions.length} Q</span>
                <Edit className="h-4 w-4 text-muted-foreground" />
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminCourses;

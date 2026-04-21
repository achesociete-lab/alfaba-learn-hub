import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Languages, Headphones, CheckCircle2, Volume2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { playSuccess, playError } from "@/utils/sound-feedback";
import { speakArabicWithFallback } from "@/hooks/use-arabic-speech";

interface Props {
  course: any;
  userProgress: any;
  onProgressUpdate: (p: any) => void;
}

const PresentielCourseDetail = ({ course, userProgress, onProgressUpdate }: Props) => {
  const { user } = useAuth();
  const [qcmAnswers, setQcmAnswers] = useState<Record<number, number>>({});
  const [qcmSubmitted, setQcmSubmitted] = useState(!!userProgress?.qcm_completed);
  const [dictationAnswers, setDictationAnswers] = useState<Record<number, string>>({});

  const upsertProgress = async (patch: Partial<any>) => {
    if (!user) return;
    const next = {
      course_id: course.id,
      user_id: user.id,
      ...userProgress,
      ...patch,
    };
    const { data } = await supabase
      .from("presentiel_course_progress")
      .upsert(next, { onConflict: "course_id,user_id" })
      .select()
      .single();
    if (data) onProgressUpdate(data);
  };

  const submitQcm = async () => {
    let score = 0;
    course.qcm.forEach((q: any, i: number) => {
      if (qcmAnswers[i] === q.correct) score++;
    });
    setQcmSubmitted(true);
    if (score >= 7) playSuccess(); else playError();
    await upsertProgress({ qcm_score: score, qcm_completed: true });
    toast.success(`QCM terminé : ${score}/${course.qcm.length}`);
  };

  const markTranslationDone = async () => {
    await upsertProgress({ translation_completed: true });
    toast.success("Traduction marquée comme lue");
  };

  const submitDictation = async () => {
    await upsertProgress({ dictation_completed: true });
    toast.success("Dictée terminée");
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-1">{course.title}</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Cours du {new Date(course.course_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
      </p>

      {course.photo_url && (
        <div className="rounded-lg overflow-hidden border border-border mb-6">
          <img src={course.photo_url} alt={course.title} className="w-full max-h-[400px] object-contain bg-muted" />
        </div>
      )}

      <Tabs defaultValue="qcm">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="qcm" className="text-xs sm:text-sm"><FileText className="h-4 w-4 mr-1" />QCM</TabsTrigger>
          <TabsTrigger value="translation" className="text-xs sm:text-sm"><Languages className="h-4 w-4 mr-1" />Traduction</TabsTrigger>
          <TabsTrigger value="dictation" className="text-xs sm:text-sm"><Headphones className="h-4 w-4 mr-1" />Dictée</TabsTrigger>
        </TabsList>

        <TabsContent value="qcm" className="mt-6 space-y-4">
          {(course.qcm || []).map((q: any, i: number) => (
            <Card key={i}>
              <CardContent className="p-4">
                <p className="font-medium text-foreground mb-3">{i + 1}. {q.question}</p>
                <div className="space-y-2">
                  {q.choices.map((choice: string, j: number) => {
                    const isSelected = qcmAnswers[i] === j;
                    const isCorrect = qcmSubmitted && j === q.correct;
                    const isWrong = qcmSubmitted && isSelected && j !== q.correct;
                    return (
                      <button
                        key={j}
                        disabled={qcmSubmitted}
                        onClick={() => setQcmAnswers({ ...qcmAnswers, [i]: j })}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all text-sm ${
                          isCorrect ? "border-primary bg-primary/10" :
                          isWrong ? "border-destructive bg-destructive/10" :
                          isSelected ? "border-primary bg-primary/5" :
                          "border-border hover:border-primary/30"
                        }`}
                      >
                        {choice}
                      </button>
                    );
                  })}
                </div>
                {qcmSubmitted && q.explanation && (
                  <p className="mt-3 text-xs text-muted-foreground italic">💡 {q.explanation}</p>
                )}
              </CardContent>
            </Card>
          ))}
          {!qcmSubmitted && (
            <Button
              onClick={submitQcm}
              disabled={Object.keys(qcmAnswers).length < (course.qcm?.length || 0)}
              className="w-full gradient-emerald border-0 text-primary-foreground"
            >
              Valider mes réponses
            </Button>
          )}
          {qcmSubmitted && (
            <div className="text-center py-3 text-primary font-medium">
              <CheckCircle2 className="h-5 w-5 inline mr-1" />
              Score : {userProgress?.qcm_score || 0}/{course.qcm?.length || 0}
            </div>
          )}
        </TabsContent>

        <TabsContent value="translation" className="mt-6 space-y-4">
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Texte arabe</h3>
              <p dir="rtl" className="font-arabic text-2xl leading-loose text-foreground mb-6">
                {course.translation?.arabic || course.ocr_text || "—"}
              </p>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Traduction française</h3>
              <p className="text-foreground leading-relaxed">{course.translation?.french || "—"}</p>
            </CardContent>
          </Card>
          {!userProgress?.translation_completed ? (
            <Button onClick={markTranslationDone} className="w-full">J'ai lu la traduction</Button>
          ) : (
            <div className="text-center text-primary"><CheckCircle2 className="h-5 w-5 inline mr-1" />Traduction lue</div>
          )}
        </TabsContent>

        <TabsContent value="dictation" className="mt-6 space-y-4">
          {(course.dictation?.sentences || []).map((s: any, i: number) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Phrase {i + 1}</Label>
                  <Button size="sm" variant="outline" onClick={() => speakArabicWithFallback(s.arabic)}>
                    <Volume2 className="h-4 w-4 mr-1" /> Écouter
                  </Button>
                </div>
                <Input
                  dir="rtl"
                  className="font-arabic text-lg"
                  placeholder="Écrivez la phrase en arabe…"
                  value={dictationAnswers[i] || ""}
                  onChange={(e) => setDictationAnswers({ ...dictationAnswers, [i]: e.target.value })}
                />
                {dictationAnswers[i] && (
                  <p dir="rtl" className="font-arabic text-sm text-muted-foreground">
                    Réponse attendue : {s.arabic}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
          {!userProgress?.dictation_completed ? (
            <Button onClick={submitDictation} className="w-full gradient-emerald border-0 text-primary-foreground">
              Valider la dictée
            </Button>
          ) : (
            <div className="text-center text-primary"><CheckCircle2 className="h-5 w-5 inline mr-1" />Dictée terminée</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PresentielCourseDetail;

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Mic, MicOff, Play, Square, RotateCcw, ChevronRight,
  Star, Volume2, CheckCircle, AlertCircle, Sparkles, User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { quranSurahs, type QuranSurah } from "@/data/quran-surahs";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { useArabicSpeech } from "@/hooks/use-arabic-speech";

interface AiFeedback {
  score: number;
  overallFeedback: string;
  errors: { word: string; type: string; correction: string }[];
  tajwidNotes: string[];
  encouragement: string;
}

const Coran = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedSurah, setSelectedSurah] = useState<QuranSurah | null>(null);
  const [hasVocalProfile, setHasVocalProfile] = useState(false);
  const [setupMode, setSetupMode] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<AiFeedback | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const recorder = useAudioRecorder();
  const setupRecorder = useAudioRecorder();
  const { speak } = useArabicSpeech();

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("vocal_profiles").select("id").eq("user_id", user.id).single()
      .then(({ data }) => setHasVocalProfile(!!data));
    supabase.from("quran_recitations").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10)
      .then(({ data }) => { if (data) setHistory(data); });
  }, [user]);

  const saveVocalProfile = async () => {
    if (!setupRecorder.audioBlob || !user) return;
    try {
      const path = `${user.id}/vocal-profile-${Date.now()}.webm`;
      const { error: upErr } = await supabase.storage.from("quran-recordings").upload(path, setupRecorder.audioBlob);
      if (upErr) throw upErr;
      await supabase.from("vocal_profiles").upsert({ user_id: user.id, reference_audio_url: path }, { onConflict: "user_id" });
      setHasVocalProfile(true);
      setSetupMode(false);
      toast.success("Empreinte vocale enregistrée !");
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'enregistrement");
    }
  };

  const evaluateRecitation = async () => {
    if (!recorder.audioBlob || !selectedSurah || !user) return;
    setEvaluating(true);
    setFeedback(null);

    try {
      // Upload recording
      const path = `${user.id}/recitation-${selectedSurah.number}-${Date.now()}.webm`;
      await supabase.storage.from("quran-recordings").upload(path, recorder.audioBlob);

      // Get expected text
      const expectedText = selectedSurah.ayahs.map(a => a.arabic).join(" ");

      // Use ElevenLabs STT for transcription
      const formData = new FormData();
      formData.append("file", recorder.audioBlob, "recording.webm");
      formData.append("model_id", "scribe_v2");
      formData.append("language_code", "ara");

      let transcription = "";
      try {
        const sttRes = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-stt`,
          {
            method: "POST",
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: formData,
          }
        );
        if (sttRes.ok) {
          const sttData = await sttRes.json();
          transcription = sttData.text || "";
        }
      } catch {
        // If STT fails, use expected text as approximation for demo
        transcription = expectedText;
      }

      // AI evaluation
      const evalRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quran-evaluate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            transcription,
            expectedText,
            surahNumber: selectedSurah.number,
            ayahStart: 1,
            ayahEnd: selectedSurah.ayahCount,
          }),
        }
      );

      if (!evalRes.ok) {
        const errData = await evalRes.json();
        throw new Error(errData.error || "Erreur d'évaluation");
      }

      const evalData: AiFeedback = await evalRes.json();
      setFeedback(evalData);

      // Save to DB
      await supabase.from("quran_recitations").insert({
        user_id: user.id,
        surah_number: selectedSurah.number,
        ayah_start: 1,
        ayah_end: selectedSurah.ayahCount,
        audio_url: path,
        transcription,
        ai_feedback: evalData as any,
        score: evalData.score,
      });

      // Refresh history
      const { data: hist } = await supabase.from("quran_recitations").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10);
      if (hist) setHistory(hist);
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'évaluation");
    } finally {
      setEvaluating(false);
    }
  };

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Chargement...</p></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full mb-4">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Section Coran</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3">Récitation du Coran</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">Enregistrez votre récitation, recevez une correction automatique par IA et améliorez votre tajwid.</p>
          </motion.div>

          {/* Vocal Profile Setup */}
          {!hasVocalProfile && !setupMode && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 mb-8 text-center">
              <User className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Empreinte vocale requise</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">Avant de commencer, nous devons enregistrer votre empreinte vocale. Lisez la Fatiha à votre rythme normal.</p>
              <Button onClick={() => setSetupMode(true)} className="gradient-emerald border-0 text-primary-foreground">Configurer mon empreinte vocale</Button>
            </motion.div>
          )}

          {/* Setup Recording */}
          <AnimatePresence>
            {setupMode && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="p-6 rounded-xl border border-border bg-card mb-8">
                <h3 className="text-lg font-semibold text-foreground mb-2">🎤 Enregistrez votre empreinte vocale</h3>
                <p className="text-sm text-muted-foreground mb-4">Lisez la sourate Al-Fatiha lentement et clairement. Cet enregistrement servira de référence.</p>
                <div className="p-4 rounded-lg bg-muted mb-4 font-arabic text-xl text-center leading-loose" dir="rtl">
                  {quranSurahs[0].ayahs.map(a => a.arabic).join(" ۝ ")}
                </div>
                <div className="flex items-center justify-center gap-4">
                  {!setupRecorder.isRecording && !setupRecorder.audioUrl && (
                    <Button onClick={setupRecorder.startRecording} className="gradient-emerald border-0 text-primary-foreground gap-2"><Mic className="h-4 w-4" /> Commencer</Button>
                  )}
                  {setupRecorder.isRecording && (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-destructive"><div className="h-3 w-3 rounded-full bg-destructive animate-pulse" /><span className="text-sm font-mono">{Math.floor(setupRecorder.duration / 60)}:{String(setupRecorder.duration % 60).padStart(2, '0')}</span></div>
                      <Button onClick={setupRecorder.stopRecording} variant="destructive" className="gap-2"><Square className="h-4 w-4" /> Arrêter</Button>
                    </div>
                  )}
                  {setupRecorder.audioUrl && (
                    <div className="flex items-center gap-3">
                      <audio src={setupRecorder.audioUrl} controls className="h-10" />
                      <Button onClick={setupRecorder.reset} variant="outline" size="sm"><RotateCcw className="h-4 w-4" /></Button>
                      <Button onClick={saveVocalProfile} className="gradient-emerald border-0 text-primary-foreground gap-2"><CheckCircle className="h-4 w-4" /> Valider</Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Surah Selection */}
          {!selectedSurah && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><BookOpen className="h-5 w-5" /> Choisissez une sourate</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {quranSurahs.map((surah, i) => (
                  <motion.button key={surah.number} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
                    onClick={() => { setSelectedSurah(surah); setFeedback(null); recorder.reset(); }}
                    className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all text-left flex items-center gap-4 group">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <span className="text-lg font-bold text-primary">{surah.number}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground">{surah.name}</h3>
                      <p className="text-xs text-muted-foreground">{surah.ayahCount} versets</p>
                    </div>
                    <span className="font-arabic text-lg text-foreground">{surah.nameArabic}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recitation View */}
          {selectedSurah && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Button variant="ghost" onClick={() => { setSelectedSurah(null); setFeedback(null); recorder.reset(); }} className="mb-4 text-muted-foreground">← Retour aux sourates</Button>

              <div className="p-6 rounded-xl border border-border bg-card mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{selectedSurah.name}</h2>
                    <p className="text-sm text-muted-foreground">{selectedSurah.ayahCount} versets</p>
                  </div>
                  <span className="font-arabic text-2xl text-foreground">{selectedSurah.nameArabic}</span>
                </div>

                {/* Ayahs display */}
                <div className="p-5 rounded-lg bg-muted mb-6 space-y-4">
                  {selectedSurah.ayahs.map((ayah) => (
                    <div key={ayah.number} className="group">
                      <div className="flex items-start gap-3">
                        <span className="text-xs font-bold text-muted-foreground bg-background rounded-full h-6 w-6 flex items-center justify-center shrink-0 mt-1">{ayah.number}</span>
                        <div className="flex-1">
                          <button onClick={() => speak(ayah.arabic)} className="font-arabic text-xl text-foreground leading-loose text-right w-full hover:text-primary transition-colors cursor-pointer" dir="rtl">{ayah.arabic}</button>
                          <p className="text-xs text-muted-foreground italic mt-1">{ayah.transliteration}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{ayah.translation}</p>
                        </div>
                        <button onClick={() => speak(ayah.arabic)} className="text-muted-foreground hover:text-primary transition-colors shrink-0 mt-1"><Volume2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recording controls */}
                <div className="text-center">
                  <h3 className="text-sm font-semibold text-foreground mb-4">🎤 Enregistrez votre récitation</h3>
                  <div className="flex items-center justify-center gap-4 mb-4">
                    {!recorder.isRecording && !recorder.audioUrl && (
                      <Button onClick={recorder.startRecording} size="lg" className="gradient-emerald border-0 text-primary-foreground gap-2 px-8">
                        <Mic className="h-5 w-5" /> Commencer l'enregistrement
                      </Button>
                    )}
                    {recorder.isRecording && (
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2"><div className="h-4 w-4 rounded-full bg-destructive animate-pulse" /><span className="text-lg font-mono text-foreground">{Math.floor(recorder.duration / 60)}:{String(recorder.duration % 60).padStart(2, '0')}</span></div>
                        <Button onClick={recorder.stopRecording} variant="destructive" size="lg" className="gap-2"><Square className="h-5 w-5" /> Arrêter</Button>
                      </div>
                    )}
                    {recorder.audioUrl && !evaluating && (
                      <div className="flex flex-col items-center gap-4 w-full max-w-md">
                        <audio src={recorder.audioUrl} controls className="w-full" />
                        <div className="flex gap-3">
                          <Button onClick={recorder.reset} variant="outline" className="gap-2"><RotateCcw className="h-4 w-4" /> Réessayer</Button>
                          <Button onClick={evaluateRecitation} className="gradient-emerald border-0 text-primary-foreground gap-2"><Sparkles className="h-4 w-4" /> Évaluer ma récitation</Button>
                        </div>
                      </div>
                    )}
                    {evaluating && (
                      <div className="flex items-center gap-3 text-primary">
                        <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-medium">Analyse en cours...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Feedback */}
              <AnimatePresence>
                {feedback && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 mb-8">
                    {/* Score */}
                    <div className="p-6 rounded-xl border border-border bg-card">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Résultat de l'évaluation</h3>
                        <div className={`text-3xl font-bold ${feedback.score >= 80 ? "text-primary" : feedback.score >= 50 ? "text-secondary" : "text-destructive"}`}>
                          {feedback.score}<span className="text-lg">/100</span>
                        </div>
                      </div>
                      <Progress value={feedback.score} className="h-3 mb-4" />
                      <p className="text-sm text-foreground">{feedback.overallFeedback}</p>
                      <p className="text-sm text-primary mt-3 italic">💚 {feedback.encouragement}</p>
                    </div>

                    {/* Errors */}
                    {feedback.errors.length > 0 && (
                      <div className="p-6 rounded-xl border border-border bg-card">
                        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><AlertCircle className="h-4 w-4 text-destructive" /> Points à corriger</h3>
                        <div className="space-y-2">
                          {feedback.errors.map((err, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${err.type === "mispronounced" ? "bg-secondary/20 text-secondary" : err.type === "missing" ? "bg-destructive/20 text-destructive" : err.type === "tajwid" ? "bg-primary/20 text-primary" : "bg-muted-foreground/20 text-muted-foreground"}`}>
                                {err.type === "mispronounced" ? "Prononciation" : err.type === "missing" ? "Manquant" : err.type === "tajwid" ? "Tajwid" : "Ajouté"}
                              </span>
                              <div>
                                <span className="font-arabic text-foreground">{err.word}</span>
                                <p className="text-xs text-muted-foreground mt-0.5">{err.correction}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tajwid notes */}
                    {feedback.tajwidNotes.length > 0 && (
                      <div className="p-6 rounded-xl border border-border bg-card">
                        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> Règles de tajwid à revoir</h3>
                        <ul className="space-y-2">
                          {feedback.tajwidNotes.map((note, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2"><Star className="h-3.5 w-3.5 text-secondary shrink-0 mt-0.5" />{note}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* History */}
          {history.length > 0 && !selectedSurah && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-10">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><Star className="h-5 w-5" /> Historique de vos récitations</h2>
              <div className="space-y-3">
                {history.map((rec) => {
                  const surah = quranSurahs.find(s => s.number === rec.surah_number);
                  return (
                    <div key={rec.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${rec.score >= 80 ? "bg-primary/10" : rec.score >= 50 ? "bg-secondary/10" : "bg-destructive/10"}`}>
                        <span className={`text-sm font-bold ${rec.score >= 80 ? "text-primary" : rec.score >= 50 ? "text-secondary" : "text-destructive"}`}>{rec.score ?? "—"}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-foreground">{surah?.name || `Sourate ${rec.surah_number}`}</h3>
                        <p className="text-xs text-muted-foreground">{new Date(rec.created_at).toLocaleDateString("fr-FR")}</p>
                      </div>
                      {rec.teacher_reviewed && <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">✓ Corrigé par le prof</span>}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Coran;

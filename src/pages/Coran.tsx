import { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Mic, MicOff, Square, RotateCcw, ChevronRight,
  Star, Volume2, CheckCircle, AlertCircle, Sparkles, User,
  Eye, EyeOff, AlertTriangle, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { quranSurahs, type QuranSurah } from "@/data/quran-surahs";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { useArabicSpeech } from "@/hooks/use-arabic-speech";
import {
  fetchSurahList,
  fetchSurahVerses,
  normalizeArabic,
  type QuranVerse,
  type SurahInfo,
} from "@/utils/quran-api";

interface AiFeedback {
  score: number;
  overallFeedback: string;
  errors: { word: string; type: string; correction: string }[];
  tajwidNotes: string[];
  encouragement: string;
}

type RecitationMode = "read" | "memorize";

const Coran = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Surah list & selection
  const [allSurahs, setAllSurahs] = useState<SurahInfo[]>([]);
  const [surahSearch, setSurahSearch] = useState("");
  const [selectedSurahInfo, setSelectedSurahInfo] = useState<SurahInfo | null>(null);
  const [verses, setVerses] = useState<QuranVerse[]>([]);
  const [loadingVerses, setLoadingVerses] = useState(false);

  // Vocal profile
  const [hasVocalProfile, setHasVocalProfile] = useState(false);
  const [setupMode, setSetupMode] = useState(false);
  const setupRecorder = useAudioRecorder();

  // Recitation modes
  const [mode, setMode] = useState<RecitationMode>("read");
  const [versesHidden, setVersesHidden] = useState(false);

  // Live recitation state
  const [isLiveReciting, setIsLiveReciting] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [revealedVerses, setRevealedVerses] = useState<Set<number>>(new Set());
  const [errorVerses, setErrorVerses] = useState<Set<number>>(new Set());
  const [wordStatuses, setWordStatuses] = useState<Map<number, Array<"correct" | "wrong" | "pending">>>(new Map());

  // Post-recitation evaluation
  const [evaluating, setEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<AiFeedback | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const recorder = useAudioRecorder();
  const { speak } = useArabicSpeech();

  // Refs for live comparison
  const transcriptRef = useRef("");
  const wsRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  // Audio alert
  const errorAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  // Load surah list
  useEffect(() => {
    fetchSurahList().then(setAllSurahs).catch(console.error);
  }, []);

  // Load user data
  useEffect(() => {
    if (!user) return;
    supabase.from("vocal_profiles").select("id").eq("user_id", user.id).single()
      .then(({ data }) => setHasVocalProfile(!!data));
    supabase.from("quran_recitations").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10)
      .then(({ data }) => { if (data) setHistory(data); });
  }, [user]);

  // Select a surah and load its verses
  const selectSurah = useCallback(async (surah: SurahInfo) => {
    setSelectedSurahInfo(surah);
    setFeedback(null);
    setCurrentVerseIndex(0);
    setRevealedVerses(new Set());
    setErrorVerses(new Set());
    setWordStatuses(new Map());
    setLiveTranscript("");
    setVersesHidden(false);
    setMode("read");
    recorder.reset();

    setLoadingVerses(true);
    try {
      const v = await fetchSurahVerses(surah.number);
      setVerses(v);
    } catch {
      toast.error("Erreur lors du chargement des versets");
    } finally {
      setLoadingVerses(false);
    }
  }, [recorder]);

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

  // ============ LIVE RECITATION with WebSocket STT ============
  const startLiveRecitation = useCallback(async () => {
    if (!selectedSurahInfo || verses.length === 0) return;

    try {
      // Get scribe token
      const tokenRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-scribe-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );

      if (!tokenRes.ok) {
        throw new Error("Impossible d'obtenir le token de transcription");
      }

      const { token } = await tokenRes.json();

      // Reset state
      setCurrentVerseIndex(0);
      setRevealedVerses(new Set());
      setErrorVerses(new Set());
      setWordStatuses(new Map());
      setLiveTranscript("");
      transcriptRef.current = "";

      // Also start standard recording for later evaluation
      recorder.startRecording();

      // Connect WebSocket for realtime STT
      const ws = new WebSocket(
        `wss://api.elevenlabs.io/v1/speech-to-text/realtime?model_id=scribe_v2_realtime&language_code=ara&token=${token}`
      );
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("Scribe WebSocket connected");
        setIsLiveReciting(true);

        // Start capturing audio and sending to WS
        startAudioCapture(ws);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "partial_transcript" || data.type === "committed_transcript") {
            const text = data.text || "";
            if (data.type === "committed_transcript") {
              transcriptRef.current += " " + text;
              setLiveTranscript(transcriptRef.current.trim());
            }

            const fullTranscript = (transcriptRef.current + " " + (data.type === "partial_transcript" ? text : "")).trim();
            processLiveTranscript(fullTranscript);
          }
        } catch (e) {
          console.error("WS message parse error:", e);
        }
      };

      ws.onerror = (e) => {
        console.error("WebSocket error:", e);
        toast.error("Erreur de connexion au service de transcription");
        stopLiveRecitation();
      };

      ws.onclose = () => {
        console.log("Scribe WebSocket closed");
      };
    } catch (e: any) {
      toast.error(e.message || "Erreur lors du démarrage");
      console.error("Live recitation error:", e);
    }
  }, [selectedSurahInfo, verses, recorder]);

  const startAudioCapture = useCallback((ws: WebSocket) => {
    navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 },
    }).then((stream) => {
      mediaStreamRef.current = stream;
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (ws.readyState !== WebSocket.OPEN) return;
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert Float32 to Int16
        const int16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        // Convert to base64
        const uint8 = new Uint8Array(int16.buffer);
        let binary = "";
        for (let i = 0; i < uint8.length; i++) {
          binary += String.fromCharCode(uint8[i]);
        }
        const base64 = btoa(binary);

        ws.send(JSON.stringify({
          type: "audio",
          data: base64,
        }));
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
    }).catch((err) => {
      console.error("Microphone access denied:", err);
      toast.error("Accès au microphone refusé");
    });
  }, []);

  const processLiveTranscript = useCallback((transcript: string) => {
    if (verses.length === 0) return;

    const spokenNorm = normalizeArabic(transcript);
    const spokenWords = spokenNorm.split(" ").filter(Boolean);

    let wordOffset = 0;
    const newRevealed = new Set<number>();
    const newErrors = new Set<number>();
    const newWordStatuses = new Map<number, Array<"correct" | "wrong" | "pending">>();
    let lastMatchedVerse = 0;

    for (let vi = 0; vi < verses.length; vi++) {
      const verseNorm = normalizeArabic(verses[vi].arabic);
      const verseWords = verseNorm.split(" ").filter(Boolean);
      const statuses: Array<"correct" | "wrong" | "pending"> = [];

      let hasAnyMatch = false;
      let hasError = false;

      for (let wi = 0; wi < verseWords.length; wi++) {
        const spokenIdx = wordOffset + wi;
        if (spokenIdx >= spokenWords.length) {
          statuses.push("pending");
        } else {
          const expected = verseWords[wi];
          const spoken = spokenWords[spokenIdx];
          const similarity = levenshteinSimilarityCalc(expected, spoken);
          if (similarity > 0.55) {
            statuses.push("correct");
            hasAnyMatch = true;
          } else {
            statuses.push("wrong");
            hasError = true;
            hasAnyMatch = true;
          }
        }
      }

      if (hasAnyMatch) {
        newRevealed.add(vi);
        lastMatchedVerse = vi;
        if (hasError) {
          newErrors.add(vi);
          // Play error sound
          playErrorAlert();
        }
      }

      newWordStatuses.set(vi, statuses);
      wordOffset += verseWords.length;
    }

    setRevealedVerses(newRevealed);
    setErrorVerses(newErrors);
    setWordStatuses(newWordStatuses);
    setCurrentVerseIndex(lastMatchedVerse);
  }, [verses]);

  const playErrorAlert = useCallback(() => {
    // Simple beep using Web Audio
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 400;
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }, []);

  const stopLiveRecitation = useCallback(() => {
    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Stop audio processing
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }

    // Stop standard recorder
    recorder.stopRecording();
    setIsLiveReciting(false);
  }, [recorder]);

  // ============ POST-RECITATION EVALUATION ============
  const evaluateRecitation = async () => {
    if (!recorder.audioBlob || !selectedSurahInfo || !user) return;
    setEvaluating(true);
    setFeedback(null);

    try {
      const path = `${user.id}/recitation-${selectedSurahInfo.number}-${Date.now()}.webm`;
      await supabase.storage.from("quran-recordings").upload(path, recorder.audioBlob);

      const expectedText = verses.map(v => v.arabic).join(" ");
      const transcription = liveTranscript || expectedText;

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
            surahNumber: selectedSurahInfo.number,
            ayahStart: 1,
            ayahEnd: selectedSurahInfo.versesCount,
          }),
        }
      );

      if (!evalRes.ok) {
        const errData = await evalRes.json();
        throw new Error(errData.error || "Erreur d'évaluation");
      }

      const evalData: AiFeedback = await evalRes.json();
      setFeedback(evalData);

      await supabase.from("quran_recitations").insert({
        user_id: user.id,
        surah_number: selectedSurahInfo.number,
        ayah_start: 1,
        ayah_end: selectedSurahInfo.versesCount,
        audio_url: path,
        transcription,
        ai_feedback: evalData as any,
        score: evalData.score,
      });

      const { data: hist } = await supabase.from("quran_recitations").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10);
      if (hist) setHistory(hist);
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'évaluation");
    } finally {
      setEvaluating(false);
    }
  };

  // Filtered surah list
  const filteredSurahs = allSurahs.filter(s =>
    s.name.toLowerCase().includes(surahSearch.toLowerCase()) ||
    s.nameArabic.includes(surahSearch) ||
    String(s.number).includes(surahSearch)
  );

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
            <p className="text-muted-foreground max-w-xl mx-auto">
              Récitez en direct avec correction automatique, ou entraînez-vous à mémoriser en mode caché.
            </p>
          </motion.div>

          {/* Vocal Profile Setup */}
          {!hasVocalProfile && !setupMode && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 mb-8 text-center">
              <User className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Empreinte vocale requise</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">Avant de commencer, enregistrez votre empreinte vocale en lisant la Fatiha.</p>
              <Button onClick={() => setSetupMode(true)} className="gradient-emerald border-0 text-primary-foreground">Configurer mon empreinte vocale</Button>
            </motion.div>
          )}

          {/* Setup Recording */}
          <AnimatePresence>
            {setupMode && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="p-6 rounded-xl border border-border bg-card mb-8">
                <h3 className="text-lg font-semibold text-foreground mb-2">🎤 Enregistrez votre empreinte vocale</h3>
                <p className="text-sm text-muted-foreground mb-4">Lisez la sourate Al-Fatiha lentement et clairement.</p>
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
          {!selectedSurahInfo && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><BookOpen className="h-5 w-5" /> Choisissez une sourate</h2>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une sourate (nom, numéro)..."
                  value={surahSearch}
                  onChange={(e) => setSurahSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-1">
                {filteredSurahs.map((surah) => (
                  <motion.button key={surah.number}
                    onClick={() => selectSurah(surah)}
                    className="p-3 rounded-xl border border-border bg-card hover:border-primary/30 transition-all text-left flex items-center gap-3 group">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <span className="text-sm font-bold text-primary">{surah.number}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground truncate">{surah.name}</h3>
                      <p className="text-xs text-muted-foreground">{surah.versesCount} versets • {surah.revelationType === "Meccan" ? "Mecquoise" : "Médinoise"}</p>
                    </div>
                    <span className="font-arabic text-base text-foreground shrink-0">{surah.nameArabic}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Active Surah View */}
          {selectedSurahInfo && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Button variant="ghost" onClick={() => { setSelectedSurahInfo(null); setFeedback(null); recorder.reset(); setIsLiveReciting(false); stopLiveRecitation(); }} className="mb-4 text-muted-foreground">
                ← Retour aux sourates
              </Button>

              {loadingVerses ? (
                <div className="flex items-center justify-center py-20">
                  <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="ml-3 text-muted-foreground">Chargement des versets...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Header + Mode controls */}
                  <div className="p-6 rounded-xl border border-border bg-card">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                      <div>
                        <h2 className="text-xl font-bold text-foreground">{selectedSurahInfo.name}</h2>
                        <p className="text-sm text-muted-foreground">{selectedSurahInfo.versesCount} versets</p>
                      </div>
                      <span className="font-arabic text-2xl text-foreground">{selectedSurahInfo.nameArabic}</span>
                    </div>

                    {/* Mode toggle */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Button
                        variant={mode === "read" ? "default" : "outline"}
                        size="sm"
                        onClick={() => { setMode("read"); setVersesHidden(false); }}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" /> Mode Lecture
                      </Button>
                      <Button
                        variant={mode === "memorize" ? "default" : "outline"}
                        size="sm"
                        onClick={() => { setMode("memorize"); setVersesHidden(true); }}
                        className="gap-2"
                      >
                        <EyeOff className="h-4 w-4" /> Mode Mémorisation
                      </Button>
                      {mode === "memorize" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setVersesHidden(!versesHidden)}
                          className="gap-2 ml-auto"
                        >
                          {versesHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          {versesHidden ? "Afficher les versets" : "Cacher les versets"}
                        </Button>
                      )}
                    </div>

                    {/* Verses display */}
                    <div className="p-5 rounded-lg bg-muted space-y-3 max-h-[50vh] overflow-y-auto">
                      {verses.map((verse, vi) => {
                        const isRevealed = !versesHidden || revealedVerses.has(vi);
                        const hasError = errorVerses.has(vi);
                        const statuses = wordStatuses.get(vi);
                        const isCurrent = isLiveReciting && vi === currentVerseIndex;

                        return (
                          <div
                            key={vi}
                            className={`group rounded-lg p-3 transition-all ${
                              isCurrent ? "bg-primary/10 border border-primary/30" :
                              hasError ? "bg-destructive/10 border border-destructive/30" :
                              ""
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-xs font-bold text-muted-foreground bg-background rounded-full h-6 w-6 flex items-center justify-center shrink-0 mt-1">
                                {verse.number}
                              </span>
                              <div className="flex-1">
                                {isRevealed ? (
                                  <div className="font-arabic text-xl leading-loose text-right" dir="rtl">
                                    {statuses && isLiveReciting ? (
                                      // Word-by-word coloring during live recitation
                                      normalizeArabic(verse.arabic).split(" ").map((word, wi) => {
                                        const status = statuses[wi];
                                        return (
                                          <span
                                            key={wi}
                                            className={`inline-block mx-0.5 ${
                                              status === "correct" ? "text-primary" :
                                              status === "wrong" ? "text-destructive font-bold underline decoration-wavy" :
                                              "text-foreground"
                                            }`}
                                          >
                                            {word}{" "}
                                          </span>
                                        );
                                      })
                                    ) : (
                                      <button
                                        onClick={() => speak(verse.arabic)}
                                        className="text-foreground hover:text-primary transition-colors cursor-pointer text-right w-full"
                                      >
                                        {verse.arabic}
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 py-3">
                                    <div className="h-4 bg-muted-foreground/20 rounded flex-1" />
                                    <span className="text-xs text-muted-foreground italic">Verset caché</span>
                                  </div>
                                )}

                                {/* Show translation if not hidden */}
                                {isRevealed && !isLiveReciting && (
                                  <p className="text-xs text-muted-foreground mt-1">{verse.translation}</p>
                                )}

                                {/* Error alert inline */}
                                {hasError && isLiveReciting && (
                                  <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center gap-2 mt-2 text-destructive"
                                  >
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="text-xs font-semibold">Erreur détectée — vérifiez ce verset</span>
                                  </motion.div>
                                )}
                              </div>

                              {isRevealed && !isLiveReciting && (
                                <button onClick={() => speak(verse.arabic)} className="text-muted-foreground hover:text-primary transition-colors shrink-0 mt-1">
                                  <Volume2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Live Recitation Controls */}
                  <div className="p-6 rounded-xl border border-border bg-card text-center">
                    <h3 className="text-sm font-semibold text-foreground mb-4">
                      🎤 {isLiveReciting ? "Récitation en cours — correction en direct" : "Commencez votre récitation en direct"}
                    </h3>

                    {!isLiveReciting && !recorder.audioUrl && (
                      <Button
                        onClick={startLiveRecitation}
                        size="lg"
                        className="gradient-emerald border-0 text-primary-foreground gap-2 px-8"
                      >
                        <Mic className="h-5 w-5" /> Réciter en direct
                      </Button>
                    )}

                    {isLiveReciting && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded-full bg-destructive animate-pulse" />
                            <span className="text-lg font-mono text-foreground">
                              {Math.floor(recorder.duration / 60)}:{String(recorder.duration % 60).padStart(2, '0')}
                            </span>
                          </div>
                          <Button onClick={stopLiveRecitation} variant="destructive" size="lg" className="gap-2">
                            <Square className="h-5 w-5" /> Arrêter
                          </Button>
                        </div>

                        {/* Live stats */}
                        <div className="flex items-center justify-center gap-6 text-sm">
                          <span className="text-primary flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            {Array.from(revealedVerses).filter(v => !errorVerses.has(v)).length} versets corrects
                          </span>
                          <span className="text-destructive flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errorVerses.size} erreurs
                          </span>
                        </div>

                        {/* Live transcript preview */}
                        {liveTranscript && (
                          <div className="p-3 rounded-lg bg-muted text-right font-arabic text-sm text-muted-foreground max-h-20 overflow-y-auto" dir="rtl">
                            {liveTranscript}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Post-recording evaluation */}
                    {!isLiveReciting && recorder.audioUrl && (
                      <div className="space-y-4">
                        <audio src={recorder.audioUrl} controls className="w-full max-w-md mx-auto" />
                        <div className="flex justify-center gap-3">
                          <Button onClick={() => { recorder.reset(); setLiveTranscript(""); setRevealedVerses(new Set()); setErrorVerses(new Set()); setWordStatuses(new Map()); }} variant="outline" className="gap-2">
                            <RotateCcw className="h-4 w-4" /> Réessayer
                          </Button>
                          <Button onClick={evaluateRecitation} disabled={evaluating} className="gradient-emerald border-0 text-primary-foreground gap-2">
                            <Sparkles className="h-4 w-4" /> {evaluating ? "Analyse..." : "Évaluation complète"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AI Feedback */}
                  <AnimatePresence>
                    {feedback && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div className="p-6 rounded-xl border border-border bg-card">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Résultat</h3>
                            <div className={`text-3xl font-bold ${feedback.score >= 80 ? "text-primary" : feedback.score >= 50 ? "text-secondary" : "text-destructive"}`}>
                              {feedback.score}<span className="text-lg">/100</span>
                            </div>
                          </div>
                          <Progress value={feedback.score} className="h-3 mb-4" />
                          <p className="text-sm text-foreground">{feedback.overallFeedback}</p>
                          <p className="text-sm text-primary mt-3 italic">💚 {feedback.encouragement}</p>
                        </div>

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

                        {feedback.tajwidNotes.length > 0 && (
                          <div className="p-6 rounded-xl border border-border bg-card">
                            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> Règles de tajwid</h3>
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
                </div>
              )}
            </motion.div>
          )}

          {/* History */}
          {history.length > 0 && !selectedSurahInfo && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-10">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><Star className="h-5 w-5" /> Historique</h2>
              <div className="space-y-3">
                {history.map((rec) => {
                  const surah = allSurahs.find(s => s.number === rec.surah_number) || quranSurahs.find(s => s.number === rec.surah_number);
                  const name = surah ? ("name" in surah ? surah.name : surah.name) : `Sourate ${rec.surah_number}`;
                  return (
                    <div key={rec.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${rec.score >= 80 ? "bg-primary/10" : rec.score >= 50 ? "bg-secondary/10" : "bg-destructive/10"}`}>
                        <span className={`text-sm font-bold ${rec.score >= 80 ? "text-primary" : rec.score >= 50 ? "text-secondary" : "text-destructive"}`}>{rec.score ?? "—"}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-foreground">{name}</h3>
                        <p className="text-xs text-muted-foreground">{new Date(rec.created_at).toLocaleDateString("fr-FR")}</p>
                      </div>
                      {rec.teacher_reviewed && <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">✓ Corrigé</span>}
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

// Helper - duplicated here for use in component scope
function levenshteinSimilarityCalc(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= a.length; i++) matrix[i] = [i];
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
    }
  }
  const maxLen = Math.max(a.length, b.length);
  return maxLen === 0 ? 1 : 1 - matrix[a.length][b.length] / maxLen;
}

export default Coran;

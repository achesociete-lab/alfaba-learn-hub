import { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Mic, MicOff, Square, RotateCcw, ChevronRight, ChevronLeft,
  Star, Volume2, CheckCircle, AlertCircle, Sparkles, User,
  Eye, EyeOff, AlertTriangle, Search, Layers, BookMarked,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { quranSurahs } from "@/data/quran-surahs";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { useArabicSpeech } from "@/hooks/use-arabic-speech";
import {
  fetchSurahList,
  fetchSurahVerses,
  normalizeArabic,
  getMedinaPageUrl,
  getSurahStartPage,
  searchVerse,
  JUZ_DATA,
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
type NavTab = "surah" | "juz" | "search";

const Coran = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Navigation
  const [navTab, setNavTab] = useState<NavTab>("surah");
  const [allSurahs, setAllSurahs] = useState<SurahInfo[]>([]);
  const [surahSearch, setSurahSearch] = useState("");
  const [verseSearchQuery, setVerseSearchQuery] = useState("");
  const [verseSearchResults, setVerseSearchResults] = useState<{ surah: number; ayah: number; text: string; page: number }[]>([]);
  const [searching, setSearching] = useState(false);

  // Selected surah & verses
  const [selectedSurahInfo, setSelectedSurahInfo] = useState<SurahInfo | null>(null);
  const [verses, setVerses] = useState<QuranVerse[]>([]);
  const [loadingVerses, setLoadingVerses] = useState(false);

  // Mushaf page view
  const [currentPage, setCurrentPage] = useState(1);
  const [showMushafPage, setShowMushafPage] = useState(false);
  const [mushafImageLoaded, setMushafImageLoaded] = useState(false);

  // Vocal profile
  const [hasVocalProfile, setHasVocalProfile] = useState(false);
  const [userVoiceId, setUserVoiceId] = useState<string | null>(null);
  const [cloningVoice, setCloningVoice] = useState(false);
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
    supabase.from("vocal_profiles").select("id, elevenlabs_voice_id").eq("user_id", user.id).single()
      .then(({ data }) => {
        setHasVocalProfile(!!data);
        if (data?.elevenlabs_voice_id) setUserVoiceId(data.elevenlabs_voice_id);
      });
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
    setShowMushafPage(false);
    recorder.reset();

    setLoadingVerses(true);
    try {
      const v = await fetchSurahVerses(surah.number);
      setVerses(v);
      setCurrentPage(getSurahStartPage(surah.number));
    } catch {
      toast.error("Erreur lors du chargement des versets");
    } finally {
      setLoadingVerses(false);
    }
  }, [recorder]);

  // Navigate to a specific page
  const goToPage = (page: number) => {
    const p = Math.max(1, Math.min(604, page));
    setCurrentPage(p);
    setShowMushafPage(true);
    setMushafImageLoaded(false);
  };

  // Verse search
  const handleVerseSearch = useCallback(async () => {
    if (verseSearchQuery.trim().length < 2) return;
    setSearching(true);
    try {
      const results = await searchVerse(verseSearchQuery.trim());
      setVerseSearchResults(results);
      if (results.length === 0) toast.info("Aucun résultat trouvé");
    } catch {
      toast.error("Erreur lors de la recherche");
    } finally {
      setSearching(false);
    }
  }, [verseSearchQuery]);

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

      if (!tokenRes.ok) throw new Error("Impossible d'obtenir le token de transcription");
      const { token } = await tokenRes.json();

      setCurrentVerseIndex(0);
      setRevealedVerses(new Set());
      setErrorVerses(new Set());
      setWordStatuses(new Map());
      setLiveTranscript("");
      transcriptRef.current = "";

      recorder.startRecording();

      const ws = new WebSocket(
        `wss://api.elevenlabs.io/v1/speech-to-text/realtime?model_id=scribe_v2_realtime&language_code=ara&token=${token}`
      );
      wsRef.current = ws;

      ws.onopen = () => {
        setIsLiveReciting(true);
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

      ws.onerror = () => {
        toast.error("Erreur de connexion au service de transcription");
        stopLiveRecitation();
      };
      ws.onclose = () => {};
    } catch (e: any) {
      toast.error(e.message || "Erreur lors du démarrage");
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
        const int16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        const uint8 = new Uint8Array(int16.buffer);
        let binary = "";
        for (let i = 0; i < uint8.length; i++) {
          binary += String.fromCharCode(uint8[i]);
        }
        ws.send(JSON.stringify({ type: "audio", data: btoa(binary) }));
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
    }).catch(() => {
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
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
    if (processorRef.current) { processorRef.current.disconnect(); processorRef.current = null; }
    if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }
    if (mediaStreamRef.current) { mediaStreamRef.current.getTracks().forEach(t => t.stop()); mediaStreamRef.current = null; }
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
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full mb-4">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">القرآن الكريم</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2 font-arabic">المصحف الشريف</h1>
            <p className="text-muted-foreground text-sm">Mushaf de Médine — Récitation avec correction en direct</p>
          </motion.div>

          {/* Vocal Profile Setup */}
          {!hasVocalProfile && !setupMode && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 mb-8 text-center">
              <User className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="text-base font-semibold text-foreground mb-1">Empreinte vocale requise</h3>
              <p className="text-xs text-muted-foreground mb-3">Enregistrez votre empreinte vocale en lisant la Fatiha.</p>
              <Button onClick={() => setSetupMode(true)} size="sm" className="gradient-emerald border-0 text-primary-foreground">Configurer</Button>
            </motion.div>
          )}

          {/* Setup Recording */}
          <AnimatePresence>
            {setupMode && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="p-5 rounded-xl border border-border bg-card mb-8">
                <h3 className="text-base font-semibold text-foreground mb-2">🎤 Empreinte vocale</h3>
                <p className="text-xs text-muted-foreground mb-3">Lisez la sourate Al-Fatiha lentement et clairement.</p>
                <div className="p-3 rounded-lg bg-muted mb-3 font-arabic text-lg text-center leading-loose" dir="rtl">
                  {quranSurahs[0].ayahs.map(a => a.arabic).join(" ۝ ")}
                </div>
                <div className="flex items-center justify-center gap-3">
                  {!setupRecorder.isRecording && !setupRecorder.audioUrl && (
                    <Button onClick={setupRecorder.startRecording} size="sm" className="gradient-emerald border-0 text-primary-foreground gap-2"><Mic className="h-4 w-4" /> Commencer</Button>
                  )}
                  {setupRecorder.isRecording && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-destructive"><div className="h-3 w-3 rounded-full bg-destructive animate-pulse" /><span className="text-sm font-mono">{Math.floor(setupRecorder.duration / 60)}:{String(setupRecorder.duration % 60).padStart(2, '0')}</span></div>
                      <Button onClick={setupRecorder.stopRecording} variant="destructive" size="sm" className="gap-2"><Square className="h-4 w-4" /> Arrêter</Button>
                    </div>
                  )}
                  {setupRecorder.audioUrl && (
                    <div className="flex items-center gap-3">
                      <audio src={setupRecorder.audioUrl} controls className="h-10" />
                      <Button onClick={setupRecorder.reset} variant="outline" size="sm"><RotateCcw className="h-4 w-4" /></Button>
                      <Button onClick={saveVocalProfile} size="sm" className="gradient-emerald border-0 text-primary-foreground gap-2"><CheckCircle className="h-4 w-4" /> Valider</Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ========== MAIN CONTENT ========== */}
          {!selectedSurahInfo && !showMushafPage && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Tabs value={navTab} onValueChange={(v) => setNavTab(v as NavTab)} className="w-full">
                <TabsList className="w-full grid grid-cols-3 mb-6">
                  <TabsTrigger value="surah" className="gap-2"><BookOpen className="h-4 w-4" /> Sourates</TabsTrigger>
                  <TabsTrigger value="juz" className="gap-2"><Layers className="h-4 w-4" /> Juz</TabsTrigger>
                  <TabsTrigger value="search" className="gap-2"><Search className="h-4 w-4" /> Recherche</TabsTrigger>
                </TabsList>

                {/* ===== SOURATES TAB ===== */}
                <TabsContent value="surah">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher une sourate..."
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
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                          <span className="text-xs font-bold text-primary">{surah.number}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-foreground truncate">{surah.name}</h3>
                          <p className="text-xs text-muted-foreground">{surah.versesCount} versets • p.{getSurahStartPage(surah.number)}</p>
                        </div>
                        <span className="font-arabic text-base text-foreground shrink-0">{surah.nameArabic}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </motion.button>
                    ))}
                  </div>
                </TabsContent>

                {/* ===== JUZ TAB ===== */}
                <TabsContent value="juz">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto pr-1">
                    {JUZ_DATA.map((juz) => {
                      const startSurah = allSurahs.find(s => s.number === juz.startSurah);
                      const endSurah = allSurahs.find(s => s.number === juz.endSurah);
                      return (
                        <motion.button key={juz.number}
                          onClick={() => {
                            // Navigate to the first surah of this juz
                            if (startSurah) selectSurah(startSurah);
                          }}
                          className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all text-left group">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                              <span className="text-sm font-bold text-primary">{juz.number}</span>
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-foreground">Juz {juz.number}</h3>
                              <p className="text-xs text-muted-foreground font-arabic">الجزء {juz.number}</p>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {startSurah?.name} ({juz.startAyah}) → {endSurah?.name} ({juz.endAyah})
                          </p>
                        </motion.button>
                      );
                    })}
                  </div>
                </TabsContent>

                {/* ===== SEARCH TAB ===== */}
                <TabsContent value="search">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Chercher un verset en arabe..."
                        value={verseSearchQuery}
                        onChange={(e) => setVerseSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleVerseSearch()}
                        className="font-arabic text-right"
                        dir="rtl"
                      />
                      <Button onClick={handleVerseSearch} disabled={searching} className="shrink-0 gap-2">
                        <Search className="h-4 w-4" /> {searching ? "..." : "Chercher"}
                      </Button>
                    </div>

                    {/* Quick page jump */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Aller à la page :</span>
                      <Input
                        type="number"
                        min={1}
                        max={604}
                        placeholder="1-604"
                        className="w-24"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const val = parseInt((e.target as HTMLInputElement).value);
                            if (val >= 1 && val <= 604) goToPage(val);
                          }
                        }}
                      />
                      <span className="text-xs text-muted-foreground">(1 à 604)</span>
                    </div>

                    {/* Search results */}
                    {verseSearchResults.length > 0 && (
                      <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                        <p className="text-xs text-muted-foreground">{verseSearchResults.length} résultat(s)</p>
                        {verseSearchResults.map((result, i) => {
                          const surahInfo = allSurahs.find(s => s.number === result.surah);
                          return (
                            <button key={i}
                              onClick={() => {
                                if (surahInfo) selectSurah(surahInfo);
                              }}
                              className="w-full p-3 rounded-xl border border-border bg-card hover:border-primary/30 transition-all text-right">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-muted-foreground">{surahInfo?.name} • Verset {result.ayah} • p.{result.page}</span>
                                <span className="text-xs font-arabic text-muted-foreground">{surahInfo?.nameArabic}</span>
                              </div>
                              <p className="font-arabic text-base text-foreground leading-loose" dir="rtl">{result.text}</p>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {/* History */}
              {history.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-10">
                  <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2"><Star className="h-4 w-4" /> Historique</h2>
                  <div className="space-y-2">
                    {history.map((rec) => {
                      const surahInfo = allSurahs.find(s => s.number === rec.surah_number);
                      return (
                        <div key={rec.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
                          <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${rec.score >= 80 ? "bg-primary/10" : rec.score >= 50 ? "bg-secondary/10" : "bg-destructive/10"}`}>
                            <span className={`text-xs font-bold ${rec.score >= 80 ? "text-primary" : rec.score >= 50 ? "text-secondary" : "text-destructive"}`}>{rec.score ?? "—"}</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-foreground">{surahInfo?.name || `Sourate ${rec.surah_number}`}</h3>
                            <p className="text-xs text-muted-foreground">{new Date(rec.created_at).toLocaleDateString("fr-FR")}</p>
                          </div>
                          {rec.teacher_reviewed && <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">✓ Corrigé</span>}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ========== MUSHAF PAGE VIEW ========== */}
          {showMushafPage && !selectedSurahInfo && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" onClick={() => setShowMushafPage(false)} className="text-muted-foreground">
                  ← Retour
                </Button>
                <span className="text-sm font-semibold text-foreground">Page {currentPage} / 604</span>
                <div className="flex gap-1">
                  <Button variant="outline" size="icon" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= 604}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="relative max-w-lg w-full">
                  {!mushafImageLoaded && (
                    <div className="flex items-center justify-center py-40">
                      <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  <img
                    src={getMedinaPageUrl(currentPage)}
                    alt={`Page ${currentPage} du Mushaf`}
                    className={`w-full rounded-lg shadow-lg ${mushafImageLoaded ? "" : "hidden"}`}
                    onLoad={() => setMushafImageLoaded(true)}
                    onError={() => toast.error("Erreur de chargement de la page")}
                  />
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Page précédente
                </Button>
                <Button variant="outline" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= 604}>
                  Page suivante <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ========== ACTIVE SURAH VIEW ========== */}
          {selectedSurahInfo && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Button variant="ghost" onClick={() => { setSelectedSurahInfo(null); setFeedback(null); recorder.reset(); setIsLiveReciting(false); stopLiveRecitation(); setShowMushafPage(false); }} className="mb-4 text-muted-foreground">
                ← Retour
              </Button>

              {loadingVerses ? (
                <div className="flex items-center justify-center py-20">
                  <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="ml-3 text-muted-foreground">Chargement...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Header + Mode controls */}
                  <div className="p-5 rounded-xl border border-border bg-card">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <div>
                        <h2 className="text-lg font-bold text-foreground">{selectedSurahInfo.name}</h2>
                        <p className="text-xs text-muted-foreground">{selectedSurahInfo.versesCount} versets • Page {currentPage}</p>
                      </div>
                      <span className="font-arabic text-xl text-foreground">{selectedSurahInfo.nameArabic}</span>
                    </div>

                    {/* Mode toggle + Mushaf page button */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Button variant={mode === "read" ? "default" : "outline"} size="sm" onClick={() => { setMode("read"); setVersesHidden(false); }} className="gap-1.5">
                        <Eye className="h-3.5 w-3.5" /> Lecture
                      </Button>
                      <Button variant={mode === "memorize" ? "default" : "outline"} size="sm" onClick={() => { setMode("memorize"); setVersesHidden(true); }} className="gap-1.5">
                        <EyeOff className="h-3.5 w-3.5" /> Mémorisation
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => goToPage(currentPage)} className="gap-1.5 ml-auto">
                        <BookMarked className="h-3.5 w-3.5" /> Page Mushaf
                      </Button>
                      {mode === "memorize" && (
                        <Button variant="ghost" size="sm" onClick={() => setVersesHidden(!versesHidden)} className="gap-1.5">
                          {versesHidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                          {versesHidden ? "Afficher" : "Cacher"}
                        </Button>
                      )}
                    </div>

                    {/* Mushaf page image (inline) */}
                    {showMushafPage && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-muted-foreground">Page {currentPage}</span>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); setMushafImageLoaded(false); }}>
                              <ChevronLeft className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setCurrentPage(p => Math.min(604, p + 1)); setMushafImageLoaded(false); }}>
                              <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowMushafPage(false)}>Fermer</Button>
                          </div>
                        </div>
                        <div className="flex justify-center">
                          <div className="relative max-w-md w-full">
                            {!mushafImageLoaded && (
                              <div className="flex items-center justify-center py-32">
                                <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                              </div>
                            )}
                            <img
                              src={getMedinaPageUrl(currentPage)}
                              alt={`Page ${currentPage}`}
                              className={`w-full rounded-lg shadow-md ${mushafImageLoaded ? "" : "hidden"}`}
                              onLoad={() => setMushafImageLoaded(true)}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Verses display */}
                    <div className="p-4 rounded-lg bg-muted space-y-2 max-h-[50vh] overflow-y-auto">
                      {verses.map((verse, vi) => {
                        const isRevealed = !versesHidden || revealedVerses.has(vi);
                        const hasError = errorVerses.has(vi);
                        const statuses = wordStatuses.get(vi);
                        const isCurrent = isLiveReciting && vi === currentVerseIndex;

                        return (
                          <div key={vi} className={`group rounded-lg p-2.5 transition-all ${
                            isCurrent ? "bg-primary/10 border border-primary/30" :
                            hasError ? "bg-destructive/10 border border-destructive/30" : ""
                          }`}>
                            <div className="flex items-start gap-2">
                              <span className="text-xs font-bold text-muted-foreground bg-background rounded-full h-5 w-5 flex items-center justify-center shrink-0 mt-1">
                                {verse.number}
                              </span>
                              <div className="flex-1">
                                {isRevealed ? (
                                  <div className="font-arabic text-lg leading-loose text-right" dir="rtl">
                                    {statuses && isLiveReciting ? (
                                      normalizeArabic(verse.arabic).split(" ").map((word, wi) => {
                                        const status = statuses[wi];
                                        return (
                                          <span key={wi} className={`inline-block mx-0.5 ${
                                            status === "correct" ? "text-primary" :
                                            status === "wrong" ? "text-destructive font-bold underline decoration-wavy" :
                                            "text-foreground"
                                          }`}>{word}{" "}</span>
                                        );
                                      })
                                    ) : (
                                      <button onClick={() => speak(verse.arabic)} className="text-foreground hover:text-primary transition-colors cursor-pointer text-right w-full">
                                        {verse.arabic}
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 py-2">
                                    <div className="h-3 bg-muted-foreground/20 rounded flex-1" />
                                    <span className="text-xs text-muted-foreground italic">Verset caché</span>
                                  </div>
                                )}

                                {hasError && isLiveReciting && (
                                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 mt-1 text-destructive">
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    <span className="text-xs font-semibold">Erreur détectée</span>
                                  </motion.div>
                                )}
                              </div>

                              {isRevealed && !isLiveReciting && (
                                <button onClick={() => speak(verse.arabic)} className="text-muted-foreground hover:text-primary transition-colors shrink-0 mt-1">
                                  <Volume2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Live Recitation Controls */}
                  <div className="p-5 rounded-xl border border-border bg-card text-center">
                    <h3 className="text-sm font-semibold text-foreground mb-3">
                      🎤 {isLiveReciting ? "Récitation en cours — correction en direct" : "Récitation en direct"}
                    </h3>

                    {!isLiveReciting && !recorder.audioUrl && (
                      <Button onClick={startLiveRecitation} size="lg" className="gradient-emerald border-0 text-primary-foreground gap-2 px-8">
                        <Mic className="h-5 w-5" /> Réciter
                      </Button>
                    )}

                    {isLiveReciting && (
                      <div className="space-y-3">
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

                        <div className="flex items-center justify-center gap-6 text-sm">
                          <span className="text-primary flex items-center gap-1">
                            <CheckCircle className="h-3.5 w-3.5" />
                            {Array.from(revealedVerses).filter(v => !errorVerses.has(v)).length} corrects
                          </span>
                          <span className="text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {errorVerses.size} erreurs
                          </span>
                        </div>

                        {liveTranscript && (
                          <div className="p-2 rounded-lg bg-muted text-right font-arabic text-xs text-muted-foreground max-h-16 overflow-y-auto" dir="rtl">
                            {liveTranscript}
                          </div>
                        )}
                      </div>
                    )}

                    {!isLiveReciting && recorder.audioUrl && (
                      <div className="space-y-3">
                        <audio src={recorder.audioUrl} controls className="w-full max-w-md mx-auto" />
                        <div className="flex justify-center gap-3">
                          <Button onClick={() => { recorder.reset(); setLiveTranscript(""); setRevealedVerses(new Set()); setErrorVerses(new Set()); setWordStatuses(new Map()); }} variant="outline" className="gap-2">
                            <RotateCcw className="h-4 w-4" /> Réessayer
                          </Button>
                          <Button onClick={evaluateRecitation} disabled={evaluating} className="gradient-emerald border-0 text-primary-foreground gap-2">
                            <Sparkles className="h-4 w-4" /> {evaluating ? "Analyse..." : "Évaluation"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AI Feedback */}
                  <AnimatePresence>
                    {feedback && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                        <div className="p-5 rounded-xl border border-border bg-card">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-base font-semibold text-foreground flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Résultat</h3>
                            <div className={`text-2xl font-bold ${feedback.score >= 80 ? "text-primary" : feedback.score >= 50 ? "text-secondary" : "text-destructive"}`}>
                              {feedback.score}<span className="text-sm">/100</span>
                            </div>
                          </div>
                          <Progress value={feedback.score} className="h-2 mb-3" />
                          <p className="text-sm text-foreground">{feedback.overallFeedback}</p>
                          <p className="text-sm text-primary mt-2 italic">💚 {feedback.encouragement}</p>
                        </div>

                        {feedback.errors.length > 0 && (
                          <div className="p-5 rounded-xl border border-border bg-card">
                            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2"><AlertCircle className="h-4 w-4 text-destructive" /> Points à corriger</h3>
                            <div className="space-y-2">
                              {feedback.errors.map((err, i) => (
                                <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-muted">
                                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full shrink-0 mt-0.5 ${err.type === "mispronounced" ? "bg-secondary/20 text-secondary" : err.type === "missing" ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"}`}>
                                    {err.type === "mispronounced" ? "Prononciation" : err.type === "missing" ? "Manquant" : "Tajwid"}
                                  </span>
                                  <div>
                                    <span className="font-arabic text-foreground text-sm">{err.word}</span>
                                    <p className="text-xs text-muted-foreground mt-0.5">{err.correction}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {feedback.tajwidNotes.length > 0 && (
                          <div className="p-5 rounded-xl border border-border bg-card">
                            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> Tajwid</h3>
                            <ul className="space-y-1">
                              {feedback.tajwidNotes.map((note, i) => (
                                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2"><Star className="h-3 w-3 text-secondary shrink-0 mt-0.5" />{note}</li>
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Helper
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

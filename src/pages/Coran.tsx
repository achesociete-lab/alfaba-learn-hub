import { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Mic, MicOff, Square, RotateCcw, ChevronRight, ChevronLeft,
  Star, Volume2, CheckCircle, AlertCircle, Sparkles, User,
  Eye, EyeOff, AlertTriangle, Search, Layers, BookMarked, Play, Pause, Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/use-admin";
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
import { RECITERS, playAyahAudio, playAyahSequence } from "@/utils/quran-audio";

interface AiFeedback {
  score: number;
  overallFeedback: string;
  errors: { word: string; type: string; correction: string }[];
  tajwidNotes: string[];
  encouragement: string;
}

type RecitationMode = "read" | "memorize";
type NavTab = "surah" | "juz" | "search";
type VoiceSource = "reciter" | "teacher";

const Coran = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin } = useIsAdmin();
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

  // Teacher recording
  const [teacherRecordingUrl, setTeacherRecordingUrl] = useState<string | null>(null);
  const [isRecordingTeacher, setIsRecordingTeacher] = useState(false);
  const [teacherRecordingBlob, setTeacherRecordingBlob] = useState<Blob | null>(null);
  const [teacherRecordingPreview, setTeacherRecordingPreview] = useState<string | null>(null);
  const [savingTeacherRecording, setSavingTeacherRecording] = useState(false);
  const teacherMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const teacherChunksRef = useRef<Blob[]>([]);

  // Recitation modes
  const [mode, setMode] = useState<RecitationMode>("read");
  const [versesHidden, setVersesHidden] = useState(false);

  // Voice source: professional reciter (default) or user's cloned voice
  const [voiceSource, setVoiceSource] = useState<VoiceSource>("reciter");
  const [selectedReciter, setSelectedReciter] = useState("mishary");
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const sequenceRef = useRef<{ stop: () => void } | null>(null);
  const singleAudioRef = useRef<HTMLAudioElement | null>(null);

  // Live recitation state
  const [isLiveReciting, setIsLiveReciting] = useState(false);
  const [isRecitationPaused, setIsRecitationPaused] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [revealedVerses, setRevealedVerses] = useState<Set<number>>(new Set());
  const [errorVerses, setErrorVerses] = useState<Set<number>>(new Set());
  const [wordStatuses, setWordStatuses] = useState<Map<number, Array<"correct" | "wrong" | "pending">>>(new Map());
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const alertedErrorsRef = useRef<Set<string>>(new Set());
  const verseContainerRef = useRef<HTMLDivElement | null>(null);
  const currentVerseRef = useRef<HTMLDivElement | null>(null);

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
  const silenceTimeoutRef = useRef<number | null>(null);

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
    supabase.from("quran_recitations").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10)
      .then(({ data }) => { if (data) setHistory(data); });
  }, [user]);

  // Load teacher recording for selected surah
  useEffect(() => {
    if (!selectedSurahInfo) return;
    setTeacherRecordingUrl(null);
    supabase.from("teacher_recordings").select("audio_url").eq("surah_number", selectedSurahInfo.number).single()
      .then(({ data }) => {
        if (data?.audio_url) {
          const { data: urlData } = supabase.storage.from("quran-recordings").getPublicUrl(data.audio_url);
          setTeacherRecordingUrl(urlData.publicUrl);
        }
      });
  }, [selectedSurahInfo]);

  // Select a surah and load its verses
  const selectSurah = useCallback(async (surah: SurahInfo) => {
    setSelectedSurahInfo(surah);
    setFeedback(null);
    setCurrentVerseIndex(0);
    setCurrentWordIndex(0);
    setRevealedVerses(new Set());
    setErrorVerses(new Set());
    setWordStatuses(new Map());
    setLiveTranscript("");
    setIsRecitationPaused(false);
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

  // Play a single verse based on the selected voice source
  const playVerse = useCallback((verse: QuranVerse) => {
    // Stop any current playback
    if (singleAudioRef.current) {
      singleAudioRef.current.pause();
      singleAudioRef.current = null;
    }
    if (sequenceRef.current) {
      sequenceRef.current.stop();
      sequenceRef.current = null;
      setIsPlayingSequence(false);
    }

    if (voiceSource === "teacher" && teacherRecordingUrl) {
      // Play teacher's raw recording (full surah audio)
      setPlayingAyah(verse.number);
      const audio = new Audio(teacherRecordingUrl);
      singleAudioRef.current = audio;
      audio.addEventListener("ended", () => setPlayingAyah(null));
      audio.addEventListener("error", () => {
        setPlayingAyah(null);
        toast.error("Erreur de lecture audio");
      });
      audio.play().catch(() => toast.error("Erreur de lecture"));
    } else {
      // Professional reciter
      setPlayingAyah(verse.number);
      const audio = playAyahAudio(
        selectedSurahInfo?.number || 1,
        verse.number,
        selectedReciter
      );
      singleAudioRef.current = audio;
      audio.addEventListener("ended", () => setPlayingAyah(null));
      audio.addEventListener("error", () => {
        setPlayingAyah(null);
        toast.error("Erreur de lecture audio");
      });
    }
  }, [voiceSource, teacherRecordingUrl, selectedReciter, selectedSurahInfo, speak]);

  // Play all verses sequentially
  const playAllVerses = useCallback(() => {
    if (!selectedSurahInfo || verses.length === 0) return;
    if (isPlayingSequence) {
      sequenceRef.current?.stop();
      sequenceRef.current = null;
      setIsPlayingSequence(false);
      setPlayingAyah(null);
      return;
    }
    setIsPlayingSequence(true);
    const seq = playAyahSequence(
      selectedSurahInfo.number,
      1,
      selectedSurahInfo.versesCount,
      selectedReciter,
      (ayah) => setPlayingAyah(ayah)
    );
    sequenceRef.current = seq;
    const checkInterval = setInterval(() => {
    }, 1000);
  }, [selectedSurahInfo, verses, selectedReciter, isPlayingSequence]);

  // Cleanup on unmount or surah change
  useEffect(() => {
    return () => {
      sequenceRef.current?.stop();
      singleAudioRef.current?.pause();
      if (silenceTimeoutRef.current) window.clearTimeout(silenceTimeoutRef.current);
    };
  }, [selectedSurahInfo]);

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

  // Teacher recording functions
  const startTeacherRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      teacherChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) teacherChunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => {
        const blob = new Blob(teacherChunksRef.current, { type: "audio/webm" });
        setTeacherRecordingBlob(blob);
        setTeacherRecordingPreview(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };
      teacherMediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecordingTeacher(true);
    } catch {
      toast.error("Impossible d'accéder au microphone");
    }
  };

  const stopTeacherRecording = () => {
    teacherMediaRecorderRef.current?.stop();
    setIsRecordingTeacher(false);
  };

  const saveTeacherRecording = async () => {
    if (!teacherRecordingBlob || !user || !selectedSurahInfo) return;
    setSavingTeacherRecording(true);
    try {
      const path = `teacher/${user.id}/surah-${selectedSurahInfo.number}-${Date.now()}.webm`;
      const { error: upErr } = await supabase.storage.from("quran-recordings").upload(path, teacherRecordingBlob);
      if (upErr) throw upErr;
      await supabase.from("teacher_recordings").upsert(
        { surah_number: selectedSurahInfo.number, audio_url: path, teacher_id: user.id },
        { onConflict: "surah_number" }
      );
      const { data: urlData } = supabase.storage.from("quran-recordings").getPublicUrl(path);
      setTeacherRecordingUrl(urlData.publicUrl);
      setTeacherRecordingBlob(null);
      setTeacherRecordingPreview(null);
      toast.success("Enregistrement sauvegardé !");
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la sauvegarde");
    } finally {
      setSavingTeacherRecording(false);
    }
  };

  // ============ LIVE RECITATION with WebSocket STT ==========
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
      setCurrentWordIndex(0);
      setRevealedVerses(new Set([0]));
      setErrorVerses(new Set());
      setWordStatuses(new Map());
      setLiveTranscript("");
      setIsRecitationPaused(false);
      transcriptRef.current = "";
      alertedErrorsRef.current = new Set();
      if (silenceTimeoutRef.current) window.clearTimeout(silenceTimeoutRef.current);

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
            const text = (data.text || "").trim();
            if (!text) return;

            setIsRecitationPaused(false);
            if (silenceTimeoutRef.current) window.clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = window.setTimeout(() => {
              setIsRecitationPaused(true);
            }, 1800);

            if (data.type === "committed_transcript") {
              transcriptRef.current = `${transcriptRef.current} ${text}`.trim();
              setLiveTranscript(transcriptRef.current);
            }

            const fullTranscript = data.type === "partial_transcript"
              ? `${transcriptRef.current} ${text}`.trim()
              : transcriptRef.current;

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

      ws.onclose = () => {
        if (silenceTimeoutRef.current) {
          window.clearTimeout(silenceTimeoutRef.current);
          silenceTimeoutRef.current = null;
        }
      };
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

    const spokenWords = normalizeArabic(transcript).split(" ").filter(Boolean);
    const verseWordsList = verses.map((verse) => normalizeArabic(verse.arabic).split(" ").filter(Boolean));
    const newRevealed = new Set<number>([0]);
    const newErrors = new Set<number>();
    const newWordStatuses = new Map<number, Array<"correct" | "wrong" | "pending">>();

    let spokenCursor = 0;
    let activeVerseIndex = 0;
    let activeWordIndex = 0;

    for (let vi = 0; vi < verseWordsList.length; vi++) {
      const expectedWords = verseWordsList[vi];
      const statuses: Array<"correct" | "wrong" | "pending"> = expectedWords.map(() => "pending");
      let matchedPrefix = 0;
      let mismatchFound = false;

      while (spokenCursor + matchedPrefix < spokenWords.length && matchedPrefix < expectedWords.length) {
        const expected = expectedWords[matchedPrefix];
        const spoken = spokenWords[spokenCursor + matchedPrefix];
        const similarity = levenshteinSimilarityCalc(expected, spoken);

        if (similarity >= 0.72) {
          statuses[matchedPrefix] = "correct";
          matchedPrefix += 1;
          continue;
        }

        statuses[matchedPrefix] = "wrong";
        newErrors.add(vi);
        mismatchFound = true;

        const errorKey = `${vi}-${matchedPrefix}-${spoken}`;
        if (!alertedErrorsRef.current.has(errorKey)) {
          alertedErrorsRef.current.add(errorKey);
          playErrorAlert();
        }
        break;
      }

      if (matchedPrefix > 0 || mismatchFound || vi === 0) {
        newRevealed.add(vi);
      }

      newWordStatuses.set(vi, statuses);

      if (mismatchFound) {
        activeVerseIndex = vi;
        activeWordIndex = matchedPrefix;
        break;
      }

      if (matchedPrefix < expectedWords.length) {
        activeVerseIndex = vi;
        activeWordIndex = matchedPrefix;
        break;
      }

      spokenCursor += expectedWords.length;
      activeVerseIndex = Math.min(vi + 1, verseWordsList.length - 1);
      activeWordIndex = 0;
      if (vi + 1 < verseWordsList.length) {
        newRevealed.add(vi + 1);
      }
    }

    for (let vi = 0; vi < verseWordsList.length; vi++) {
      if (!newWordStatuses.has(vi)) {
        newWordStatuses.set(vi, verseWordsList[vi].map(() => "pending"));
      }
    }

    setRevealedVerses(newRevealed);
    setErrorVerses(newErrors);
    setWordStatuses(newWordStatuses);
    setCurrentVerseIndex(activeVerseIndex);
    setCurrentWordIndex(activeWordIndex);

    window.setTimeout(() => {
      currentVerseRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
  }, [verses, playErrorAlert]);

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

          {/* Voice source selector */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <div className="flex items-center gap-1.5 bg-muted rounded-full p-1">
              <button
                onClick={() => setVoiceSource("reciter")}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${voiceSource === "reciter" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                🕌 Cheikh
              </button>
              {teacherRecordingUrl && (
                <button
                  onClick={() => setVoiceSource("teacher")}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${voiceSource === "teacher" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  🎙️ Professeur
                </button>
              )}
            </div>
            {voiceSource === "reciter" && (
              <Select value={selectedReciter} onValueChange={setSelectedReciter}>
                <SelectTrigger className="w-auto h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECITERS.map((r) => (
                    <SelectItem key={r.id} value={r.id} className="text-xs">
                      <span>{r.name}</span>
                      <span className="font-arabic ml-2 text-muted-foreground">{r.nameArabic}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Teacher recording UI (admin/teacher only) */}
          {isAdmin && selectedSurahInfo && (
            <div className="p-4 rounded-xl border border-border bg-card mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Upload className="h-4 w-4" /> Enregistrer ma récitation pour cette sourate
              </h3>
              {teacherRecordingUrl && !teacherRecordingPreview && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-muted-foreground">Enregistrement existant :</span>
                  <audio src={teacherRecordingUrl} controls className="h-8 flex-1" />
                </div>
              )}
              <div className="flex items-center justify-center gap-3">
                {!isRecordingTeacher && !teacherRecordingPreview && (
                  <Button onClick={startTeacherRecording} size="sm" className="gap-2">
                    <Mic className="h-4 w-4" /> {teacherRecordingUrl ? "Ré-enregistrer" : "Enregistrer"}
                  </Button>
                )}
                {isRecordingTeacher && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-destructive">
                      <div className="h-3 w-3 rounded-full bg-destructive animate-pulse" />
                      <span className="text-sm">Enregistrement...</span>
                    </div>
                    <Button onClick={stopTeacherRecording} variant="destructive" size="sm" className="gap-2">
                      <Square className="h-4 w-4" /> Arrêter
                    </Button>
                  </div>
                )}
                {teacherRecordingPreview && (
                  <div className="flex items-center gap-3">
                    <audio src={teacherRecordingPreview} controls className="h-8" />
                    <Button onClick={() => { setTeacherRecordingBlob(null); setTeacherRecordingPreview(null); }} variant="outline" size="sm">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button onClick={saveTeacherRecording} disabled={savingTeacherRecording} size="sm" className="gap-2">
                      <CheckCircle className="h-4 w-4" /> {savingTeacherRecording ? "..." : "Sauvegarder"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

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
                      {voiceSource === "reciter" && (
                        <Button
                          variant={isPlayingSequence ? "destructive" : "outline"}
                          size="sm"
                          onClick={playAllVerses}
                          className="gap-1.5"
                        >
                          {isPlayingSequence ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                          {isPlayingSequence ? "Arrêter" : "Écouter tout"}
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
                    <div ref={verseContainerRef} className="p-4 rounded-lg bg-muted space-y-2 max-h-[50vh] overflow-y-auto">
                      {verses.map((verse, vi) => {
                        const isRevealed = !versesHidden || revealedVerses.has(vi);
                        const hasError = errorVerses.has(vi);
                        const statuses = wordStatuses.get(vi);
                        const isCurrent = isLiveReciting && vi === currentVerseIndex;
                        // Split original Arabic (with tashkeel) into words for coloring
                        const originalWords = verse.arabic.split(" ").filter(Boolean);

                        return (
                          <div
                            key={vi}
                            ref={isCurrent ? currentVerseRef : undefined}
                            className={`group rounded-lg p-2.5 transition-all ${
                              isCurrent ? "bg-primary/10 border border-primary/30 shadow-sm" :
                              hasError && isLiveReciting ? "bg-destructive/5 border border-destructive/20" : ""
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className="text-xs font-bold text-muted-foreground bg-background rounded-full h-5 w-5 flex items-center justify-center shrink-0 mt-1">
                                {verse.number}
                              </span>
                              <div className="flex-1">
                                {isRevealed ? (
                                  <div className="font-arabic text-lg leading-loose text-right" dir="rtl">
                                    {statuses && isLiveReciting ? (
                                      originalWords.map((word, wi) => {
                                        const status = statuses[wi];
                                        return (
                                          <span key={wi} className={`inline-block mx-0.5 transition-colors ${
                                            status === "correct" ? "text-primary" :
                                            status === "wrong" ? "text-destructive font-bold underline decoration-wavy decoration-destructive" :
                                            "text-muted-foreground/40"
                                          }`}>{word}{" "}</span>
                                        );
                                      })
                                    ) : (
                                      <button onClick={() => playVerse(verse)} className={`text-right w-full transition-colors cursor-pointer ${playingAyah === verse.number ? "text-primary" : "text-foreground hover:text-primary"}`}>
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
                                    <span className="text-xs font-semibold">Erreur de prononciation</span>
                                  </motion.div>
                                )}
                              </div>

                              {isRevealed && !isLiveReciting && (
                                <button onClick={() => playVerse(verse)} className={`transition-colors shrink-0 mt-1 ${playingAyah === verse.number ? "text-primary" : "text-muted-foreground hover:text-primary"}`}>
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
                          <Button onClick={() => { recorder.reset(); setLiveTranscript(""); setRevealedVerses(new Set()); setErrorVerses(new Set()); setWordStatuses(new Map()); setCurrentWordIndex(0); alertedErrorsRef.current = new Set(); }} variant="outline" className="gap-2">
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

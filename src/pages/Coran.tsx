import { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Mic, MicOff, Square, RotateCcw, ChevronRight, ChevronLeft,
  Star, Volume2, CheckCircle, Send,
  Eye, EyeOff, Search, Layers, BookMarked, Play, Pause, Upload,
  Repeat, Gauge, Sparkles, GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  getSurahStartPage,
  searchVerse,
  JUZ_DATA,
  type QuranVerse,
  type SurahInfo,
} from "@/utils/quran-api";
import { RECITERS, playAyahAudio, playAyahSequence } from "@/utils/quran-audio";
import { fetchQuranPageAyahs, type QuranPageAyah } from "@/utils/quran-pages";
import { Slider } from "@/components/ui/slider";
import SurahMeritSection from "@/components/quran/SurahMeritSection";
import QuranTest from "@/components/quran/QuranTest";

type RecitationMode = "read" | "memorize";
type NavTab = "surah" | "juz" | "search" | "merits" | "test";
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
  const [loadingMushafPage, setLoadingMushafPage] = useState(false);
  const [mushafPageError, setMushafPageError] = useState<string | null>(null);
  const [mushafPageAyahs, setMushafPageAyahs] = useState<QuranPageAyah[]>([]);

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

  // Voice source
  const [voiceSource, setVoiceSource] = useState<VoiceSource>("reciter");
  const [selectedReciter, setSelectedReciter] = useState("mishary");
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const sequenceRef = useRef<{ stop: () => void } | null>(null);
  const singleAudioRef = useRef<HTMLAudioElement | null>(null);

  // Student recording submission
  const recorder = useAudioRecorder();
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  // Playback controls
  const [repeatCount, setRepeatCount] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  const { speak } = useArabicSpeech();

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    fetchSurahList().then(setAllSurahs).catch(console.error);
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from("quran_recitations").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10)
      .then(({ data }) => { if (data) setHistory(data); });
  }, [user]);

  useEffect(() => {
    if (!showMushafPage) return;
    let cancelled = false;
    setLoadingMushafPage(true);
    setMushafPageError(null);
    fetchQuranPageAyahs(currentPage)
      .then((data) => { if (!cancelled) setMushafPageAyahs(data); })
      .catch(() => { if (!cancelled) { setMushafPageAyahs([]); setMushafPageError("Impossible d'afficher cette page."); } })
      .finally(() => { if (!cancelled) setLoadingMushafPage(false); });
    return () => { cancelled = true; };
  }, [currentPage, showMushafPage]);

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

  const selectSurah = useCallback(async (surah: SurahInfo) => {
    setSelectedSurahInfo(surah);
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

  const playVerse = useCallback((verse: QuranVerse) => {
    if (singleAudioRef.current) { singleAudioRef.current.pause(); singleAudioRef.current = null; }
    if (sequenceRef.current) { sequenceRef.current.stop(); sequenceRef.current = null; setIsPlayingSequence(false); }

    let remaining = repeatCount;

    const playOnce = () => {
      if (remaining <= 0) { setPlayingAyah(null); return; }
      remaining--;

      if (voiceSource === "teacher" && teacherRecordingUrl) {
        setPlayingAyah(verse.number);
        const audio = new Audio(teacherRecordingUrl);
        audio.playbackRate = playbackSpeed;
        singleAudioRef.current = audio;
        audio.addEventListener("ended", playOnce);
        audio.play().catch(() => toast.error("Erreur de lecture"));
      } else {
        setPlayingAyah(verse.number);
        const audio = playAyahAudio(selectedSurahInfo?.number || 1, verse.number, selectedReciter);
        audio.playbackRate = playbackSpeed;
        singleAudioRef.current = audio;
        audio.addEventListener("ended", playOnce);
      }
    };

    playOnce();
  }, [voiceSource, teacherRecordingUrl, selectedReciter, selectedSurahInfo, repeatCount, playbackSpeed]);

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
    const seq = playAyahSequence(selectedSurahInfo.number, 1, selectedSurahInfo.versesCount, selectedReciter, (ayah) => setPlayingAyah(ayah));
    sequenceRef.current = seq;
  }, [selectedSurahInfo, verses, selectedReciter, isPlayingSequence]);

  useEffect(() => {
    sequenceRef.current?.stop();
    singleAudioRef.current?.pause();
    setIsPlayingSequence(false);
    setPlayingAyah(null);
  }, [selectedSurahInfo?.number]);

  useEffect(() => {
    return () => {
      sequenceRef.current?.stop();
      singleAudioRef.current?.pause();
    };
  }, []);

  const goToPage = (page: number) => {
    const p = Math.max(1, Math.min(604, page));
    setCurrentPage(p);
    setShowMushafPage(true);
  };

  const handleVerseSearch = useCallback(async () => {
    if (verseSearchQuery.trim().length < 2) return;
    setSearching(true);
    try {
      const results = await searchVerse(verseSearchQuery.trim());
      setVerseSearchResults(results);
      if (results.length === 0) toast.info("Aucun résultat trouvé");
    } catch { toast.error("Erreur lors de la recherche"); }
    finally { setSearching(false); }
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
    } catch { toast.error("Impossible d'accéder au microphone"); }
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
    } catch (e: any) { toast.error(e.message || "Erreur"); }
    finally { setSavingTeacherRecording(false); }
  };

  // Submit student recitation to teacher
  const submitRecitation = async () => {
    if (!recorder.audioBlob || !user || !selectedSurahInfo) return;
    setSubmitting(true);
    try {
      const path = `students/${user.id}/surah-${selectedSurahInfo.number}-${Date.now()}.webm`;
      const { error: upErr } = await supabase.storage.from("quran-recordings").upload(path, recorder.audioBlob);
      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage.from("quran-recordings").getPublicUrl(path);

      const { error: insertErr } = await supabase.from("quran_recitations").insert({
        user_id: user.id,
        surah_number: selectedSurahInfo.number,
        ayah_start: 1,
        ayah_end: selectedSurahInfo.versesCount,
        audio_url: urlData.publicUrl,
        score: null,
        transcription: null,
        ai_feedback: null,
      });
      if (insertErr) throw insertErr;

      toast.success("Récitation soumise au professeur !");
      recorder.reset();

      const { data: hist } = await supabase.from("quran_recitations").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10);
      if (hist) setHistory(hist);
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'envoi");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSurahs = allSurahs.filter(s =>
    s.name.toLowerCase().includes(surahSearch.toLowerCase()) ||
    s.nameArabic.includes(surahSearch) ||
    String(s.number).includes(surahSearch)
  );

  const mushafSections = mushafPageAyahs.reduce<Array<{ surahNumber: number; surahNameArabic: string; ayahs: QuranPageAyah[] }>>((sections, ayah) => {
    const currentSection = sections[sections.length - 1];
    if (!currentSection || currentSection.surahNumber !== ayah.surahNumber) {
      sections.push({ surahNumber: ayah.surahNumber, surahNameArabic: ayah.surahNameArabic, ayahs: [ayah] });
      return sections;
    }
    currentSection.ayahs.push(ayah);
    return sections;
  }, []);

  const renderMushafPageContent = (compact = false) => {
    if (loadingMushafPage) {
      return (
        <div className="flex items-center justify-center py-32">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
    if (mushafPageError) {
      return <p className="text-sm text-destructive text-center py-10">{mushafPageError}</p>;
    }
    return (
      <div className={`rounded-xl border border-border bg-card ${compact ? "p-4" : "p-6"}`}>
        <div className="space-y-6">
          {mushafSections.map((section) => (
            <div key={`${section.surahNumber}-${currentPage}`} className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <span>Sourate {section.surahNumber}</span>
                <span>•</span>
                <span className="font-arabic text-base text-foreground">{section.surahNameArabic}</span>
              </div>
              <div className={`${compact ? "text-xl" : "text-2xl"} leading-loose text-right font-arabic text-foreground`} dir="rtl">
                {section.ayahs.map((ayah) => (
                  <span key={ayah.id} className="inline">
                    {ayah.text}
                    <span className="mx-1 inline-flex min-w-6 items-center justify-center rounded-full border border-border bg-muted px-1.5 py-0.5 text-[11px] font-medium not-italic text-muted-foreground align-middle">
                      {ayah.ayahNumber}
                    </span>{" "}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

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
            <p className="text-muted-foreground text-sm">Lecture, écoute et soumission de récitation au professeur</p>
          </motion.div>

          {/* Voice source selector */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <div className="flex items-center gap-1.5 bg-muted rounded-full p-1">
              <button onClick={() => setVoiceSource("reciter")} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${voiceSource === "reciter" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                🕌 Cheikh
              </button>
              {teacherRecordingUrl && (
                <button onClick={() => setVoiceSource("teacher")} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${voiceSource === "teacher" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                  🎙️ Professeur
                </button>
              )}
            </div>
            {voiceSource === "reciter" && (
              <Select value={selectedReciter} onValueChange={setSelectedReciter}>
                <SelectTrigger className="w-auto h-8 text-xs"><SelectValue /></SelectTrigger>
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
                <TabsList className="w-full grid grid-cols-5 mb-6">
                  <TabsTrigger value="surah" className="gap-1.5 text-xs"><BookOpen className="h-3.5 w-3.5" /> Sourates</TabsTrigger>
                  <TabsTrigger value="test" className="gap-1.5 text-xs"><GraduationCap className="h-3.5 w-3.5" /> Test</TabsTrigger>
                  <TabsTrigger value="merits" className="gap-1.5 text-xs"><Sparkles className="h-3.5 w-3.5" /> Mérites</TabsTrigger>
                  <TabsTrigger value="juz" className="gap-1.5 text-xs"><Layers className="h-3.5 w-3.5" /> Juz</TabsTrigger>
                  <TabsTrigger value="search" className="gap-1.5 text-xs"><Search className="h-3.5 w-3.5" /> Recherche</TabsTrigger>
                </TabsList>

                <TabsContent value="surah">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Rechercher une sourate..." value={surahSearch} onChange={(e) => setSurahSearch(e.target.value)} className="pl-10" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-1">
                    {filteredSurahs.map((surah) => (
                      <motion.button key={surah.number} onClick={() => selectSurah(surah)}
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

                <TabsContent value="juz">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto pr-1">
                    {JUZ_DATA.map((juz) => {
                      const startSurah = allSurahs.find(s => s.number === juz.startSurah);
                      const endSurah = allSurahs.find(s => s.number === juz.endSurah);
                      return (
                        <motion.button key={juz.number} onClick={() => { if (startSurah) selectSurah(startSurah); }}
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

                <TabsContent value="search">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input placeholder="Chercher un verset en arabe..." value={verseSearchQuery} onChange={(e) => setVerseSearchQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleVerseSearch()} className="font-arabic text-right" dir="rtl" />
                      <Button onClick={handleVerseSearch} disabled={searching} className="shrink-0 gap-2">
                        <Search className="h-4 w-4" /> {searching ? "..." : "Chercher"}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Aller à la page :</span>
                      <Input type="number" min={1} max={604} placeholder="1-604" className="w-24"
                        onKeyDown={(e) => { if (e.key === "Enter") { const val = parseInt((e.target as HTMLInputElement).value); if (val >= 1 && val <= 604) goToPage(val); } }} />
                    </div>
                    {verseSearchResults.length > 0 && (
                      <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                        <p className="text-xs text-muted-foreground">{verseSearchResults.length} résultat(s)</p>
                        {verseSearchResults.map((result, i) => {
                          const surahInfo = allSurahs.find(s => s.number === result.surah);
                          return (
                            <button key={i} onClick={() => { if (surahInfo) selectSurah(surahInfo); }}
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

                <TabsContent value="merits">
                  <SurahMeritSection onSelectSurah={(surahNumber) => {
                    const surah = allSurahs.find(s => s.number === surahNumber);
                    if (surah) selectSurah(surah);
                  }} />
                </TabsContent>

                <TabsContent value="test">
                  <QuranTest allSurahs={allSurahs} />
                </TabsContent>
              </Tabs>

              {/* History */}
              {history.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-10">
                  <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2"><Star className="h-4 w-4" /> Mes récitations</h2>
                  <div className="space-y-2">
                    {history.map((rec) => {
                      const surahInfo = allSurahs.find(s => s.number === rec.surah_number);
                      return (
                        <div key={rec.id} className="p-3 rounded-xl border border-border bg-card">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <BookOpen className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-foreground">{surahInfo?.name || `Sourate ${rec.surah_number}`}</h3>
                              <p className="text-xs text-muted-foreground">{new Date(rec.created_at).toLocaleDateString("fr-FR")}</p>
                            </div>
                            {rec.teacher_reviewed ? (
                              <div className="text-right">
                                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">✓ Corrigé</span>
                                {rec.score != null && <p className="text-xs font-bold text-primary mt-1">{rec.score}/100</p>}
                              </div>
                            ) : (
                              <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">En attente</span>
                            )}
                          </div>
                          {rec.teacher_feedback && (
                            <div className="mt-2 p-2 rounded-lg bg-muted">
                              <p className="text-xs text-foreground"><span className="font-semibold">Commentaire :</span> {rec.teacher_feedback}</p>
                            </div>
                          )}
                          {rec.teacher_audio_url && (
                            <div className="mt-2">
                              <p className="text-xs text-muted-foreground mb-1">🎙️ Correction audio du professeur :</p>
                              <audio src={rec.teacher_audio_url} controls className="w-full h-8" />
                            </div>
                          )}
                          {rec.audio_url && (
                            <audio src={rec.audio_url} controls className="w-full h-8 mt-2" />
                          )}
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
                <Button variant="ghost" onClick={() => setShowMushafPage(false)} className="text-muted-foreground">← Retour</Button>
                <span className="text-sm font-semibold text-foreground">Page {currentPage} / 604</span>
                <div className="flex gap-1">
                  <Button variant="outline" size="icon" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}><ChevronLeft className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= 604}><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="mx-auto max-w-4xl">{renderMushafPageContent()}</div>
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}><ChevronLeft className="h-4 w-4 mr-1" /> Précédente</Button>
                <Button variant="outline" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= 604}>Suivante <ChevronRight className="h-4 w-4 ml-1" /></Button>
              </div>
            </motion.div>
          )}

          {/* ========== ACTIVE SURAH VIEW ========== */}
          {selectedSurahInfo && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Button variant="ghost" onClick={() => { recorder.reset(); setSelectedSurahInfo(null); setShowMushafPage(false); }} className="mb-4 text-muted-foreground">
                ← Retour
              </Button>

              {loadingVerses ? (
                <div className="flex items-center justify-center py-20">
                  <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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

                    <div className="flex flex-wrap gap-2 mb-3">
                      <Button variant="default" size="sm" className="gap-1.5">
                        <Eye className="h-3.5 w-3.5" /> Lecture
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => goToPage(currentPage)} className="gap-1.5 ml-auto">
                        <BookMarked className="h-3.5 w-3.5" /> Page Mushaf
                      </Button>
                      {voiceSource === "reciter" && (
                        <Button variant={isPlayingSequence ? "destructive" : "outline"} size="sm" onClick={playAllVerses} className="gap-1.5">
                          {isPlayingSequence ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                          {isPlayingSequence ? "Arrêter" : "Écouter tout"}
                        </Button>
                      )}
                    </div>

                    {/* Playback controls: repeat & speed */}
                    <div className="flex flex-wrap items-center gap-4 p-3 rounded-lg bg-muted/50 mb-3">
                      <div className="flex items-center gap-2">
                        <Repeat className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Répéter :</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              onClick={() => setRepeatCount(n)}
                              className={`h-7 w-7 rounded-full text-xs font-bold transition-all ${
                                repeatCount === n
                                  ? "bg-primary text-primary-foreground shadow-sm"
                                  : "bg-background text-muted-foreground hover:text-foreground border border-border"
                              }`}
                            >
                              {n}×
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-1 min-w-[160px]">
                        <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Vitesse :</span>
                        <Slider
                          value={[playbackSpeed]}
                          onValueChange={([v]) => setPlaybackSpeed(v)}
                          min={0.5}
                          max={1.5}
                          step={0.1}
                          className="flex-1"
                        />
                        <span className="text-xs font-mono font-bold text-foreground w-10 text-right">{playbackSpeed.toFixed(1)}×</span>
                      </div>
                    </div>

                    {showMushafPage && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-muted-foreground">Page {currentPage}</span>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentPage(p => Math.max(1, p - 1))}><ChevronLeft className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentPage(p => Math.min(604, p + 1))}><ChevronRight className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowMushafPage(false)}>Fermer</Button>
                          </div>
                        </div>
                        {renderMushafPageContent(true)}
                      </div>
                    )}

                    {/* Verses display */}
                    <div className="p-4 rounded-lg bg-muted space-y-2 max-h-[50vh] overflow-y-auto">
                      {verses.map((verse, vi) => {
                        const isRevealed = !versesHidden;
                        return (
                          <div key={vi} className="group rounded-lg p-2.5">
                            <div className="flex items-start gap-2">
                              <span className="text-xs font-bold text-muted-foreground bg-background rounded-full h-5 w-5 flex items-center justify-center shrink-0 mt-1">
                                {verse.number}
                              </span>
                              <div className="flex-1">
                                {isRevealed ? (
                                  <div className="font-arabic text-lg leading-loose text-right" dir="rtl">
                                    <button onClick={() => playVerse(verse)} className={`text-right w-full transition-colors cursor-pointer ${playingAyah === verse.number ? "text-primary" : "text-foreground hover:text-primary"}`}>
                                      {verse.arabic}
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 py-2">
                                    <div className="h-3 bg-muted-foreground/20 rounded flex-1" />
                                    <span className="text-xs text-muted-foreground italic">Verset caché</span>
                                  </div>
                                )}
                              </div>
                              {isRevealed && (
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

                  {/* Student Recording & Submission */}
                  <div className="p-5 rounded-xl border border-border bg-card text-center">
                    <h3 className="text-sm font-semibold text-foreground mb-1">🎤 Enregistrer ma récitation</h3>
                    <p className="text-xs text-muted-foreground mb-4">Enregistrez-vous puis soumettez au professeur pour correction</p>

                    {!recorder.isRecording && !recorder.audioUrl && (
                      <Button onClick={recorder.startRecording} size="lg" className="gap-2 px-8">
                        <Mic className="h-5 w-5" /> Commencer l'enregistrement
                      </Button>
                    )}

                    {recorder.isRecording && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded-full bg-destructive animate-pulse" />
                            <span className="text-lg font-mono text-foreground">
                              {Math.floor(recorder.duration / 60)}:{String(recorder.duration % 60).padStart(2, '0')}
                            </span>
                          </div>
                          <Button onClick={recorder.stopRecording} variant="destructive" size="lg" className="gap-2">
                            <Square className="h-5 w-5" /> Arrêter
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground animate-pulse">Récitez les versets...</p>
                      </div>
                    )}

                    {recorder.audioUrl && !recorder.isRecording && (
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Réécouter votre récitation :</p>
                          <audio src={recorder.audioUrl} controls className="w-full max-w-md mx-auto h-10" />
                        </div>
                        <div className="flex items-center justify-center gap-3">
                          <Button onClick={recorder.reset} variant="outline" className="gap-2">
                            <RotateCcw className="h-4 w-4" /> Recommencer
                          </Button>
                          <Button onClick={submitRecitation} disabled={submitting} className="gap-2">
                            <Send className="h-4 w-4" /> {submitting ? "Envoi..." : "Soumettre au professeur"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
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

export default Coran;

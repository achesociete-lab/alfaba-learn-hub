import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send, Loader2, Volume2, Trash2, Mic, Square, Plus, MessageSquare,
  ChevronLeft, VolumeX, BookOpen, Sparkles, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useArabicSpeech, cleanTextForTTS } from "@/hooks/use-arabic-speech";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { useChatHistory } from "@/hooks/use-chat-history";
import { useLessonProgress } from "@/hooks/use-lesson-progress";
import { useProfile } from "@/hooks/use-profile";
import { useFormality } from "@/hooks/use-formality";
import { useUserPersona } from "@/hooks/use-user-persona";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { playCorrectSound, playWrongSound } from "@/utils/sound-feedback";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
type Msg = { role: "user" | "assistant"; content: string };

// ─── Stream helper ─────────────────────────────────────────────────────────────
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/arabic-chat`;

async function streamChat({
  messages, level, completedLessons, formality, age, gender, firstName, onDelta, onDone, signal,
}: {
  messages: Msg[]; level: string; completedLessons: number[];
  formality: string;
  age?: number | null;
  gender?: string | null;
  firstName?: string;
  onDelta: (t: string) => void; onDone: () => void; signal?: AbortSignal;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, level, completedLessons, formality, age, gender, firstName }),
    signal,
  });
  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    throw new Error(data.error || "Erreur du service");
  }
  if (!resp.body) throw new Error("No stream body");
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, idx);
      buf = buf.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { onDone(); return; }
      try {
        const parsed = JSON.parse(json);
        const c = parsed.choices?.[0]?.delta?.content;
        if (c) onDelta(c);
      } catch { }
    }
  }
  onDone();
}

// ─── Text helpers ──────────────────────────────────────────────────────────────
function extractArabic(text: string): string {
  const match = text.match(/([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\d.,!?؟،؛:]+)/);
  return match ? match[0].trim() : "";
}
function hasArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

// DICTEE markers
const DICTEE_REGEX = /\[DICTEE\]([\s\S]*?)\[\/DICTEE\]/gi;
const DICTEE_OPEN_REGEX = /\[DICTEE\]([\s\S]*)$/i;

function extractDicteeWords(text: string): string[] {
  const words: string[] = [];
  const re = /\[DICTEE\]([\s\S]*?)\[\/DICTEE\]/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const w = m[1].trim();
    if (w) words.push(w);
  }
  return words;
}
function stripDictee(text: string): string {
  return text.replace(DICTEE_REGEX, "🔊 …").replace(DICTEE_OPEN_REGEX, "🔊 …").trim();
}
function hasDictee(text: string): boolean {
  return /\[DICTEE\]/i.test(text);
}

// ─── Suggestions ──────────────────────────────────────────────────────────────
const SUGGESTIONS: Record<string, Array<{ ar: string; fr: string }>> = {
  niveau_1: [
    { ar: "مَرْحَباً", fr: "Bonjour" },
    { ar: "كَيْفَ حَالُكَ؟", fr: "Comment vas-tu ?" },
    { ar: "أُرِيدُ أَنْ أَتَعَلَّمَ", fr: "Je veux apprendre" },
    { ar: "مَا هَذَا؟", fr: "Qu'est-ce que c'est ?" },
  ],
  niveau_2: [
    { ar: "أَخْبِرْنِي عَنِ الضَّمَائِرِ", fr: "Les pronoms" },
    { ar: "مَا هِيَ الجُمْلَةُ الاِسْمِيَّةُ؟", fr: "Phrase nominale" },
    { ar: "عَلِّمْنِي الأَفْعَالَ", fr: "Les verbes" },
    { ar: "كَيْفَ أَكْتُبُ هَذِهِ الكَلِمَةَ؟", fr: "Écriture" },
  ],
};

// ─── Component ────────────────────────────────────────────────────────────────
const ArabicChat = () => {
  const { user, loading } = useAuth();
  const { profile } = useProfile();
  const { isTu } = useFormality();
  const persona = useUserPersona();
  const { completedLessons, completedN2Lessons } = useLessonProgress();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSpokenIndexRef = useRef(-1);
  const ttsSpokenLenRef = useRef(0);
  const ttsQueueRef = useRef<Promise<void>>(Promise.resolve());
  const ttsActiveForMsgRef = useRef(-1);
  const dicteeSpokenCountRef = useRef(0);
  const currentConvIdRef = useRef<string | null>(null);
  const sendMessageRef = useRef<(text?: string) => Promise<void>>(async () => {});

  const userLevel = profile?.level || "niveau_1";
  const formality = isTu ? "tu" : "vous";
  const levelLabel = userLevel === "niveau_2" ? "Niveau 2" : "Niveau 1";

  const { speak, stop: stopSpeech } = useArabicSpeech();
  const recorder = useAudioRecorder();
  const history = useChatHistory();

  // ── Sync active conversation ────────────────────────────────────────────────
  useEffect(() => {
    if (history.activeConversation) {
      setMessages(history.activeConversation.messages);
      currentConvIdRef.current = history.activeConversation.id;
      lastSpokenIndexRef.current = history.activeConversation.messages.length - 1;
    }
  }, [history.activeId]);

  useEffect(() => {
    if (isLoading || messages.length === 0 || !currentConvIdRef.current) return;
    history.saveMessages(currentConvIdRef.current, messages);
  }, [messages, isLoading]);

  // ── Streaming TTS ───────────────────────────────────────────────────────────
  const speakNewSentencesFrom = useCallback((fullText: string, isFinal: boolean) => {
    if (!autoSpeak) return;

    if (hasDictee(fullText)) {
      const words = extractDicteeWords(fullText);
      const newOnes = words.slice(dicteeSpokenCountRef.current);
      if (!newOnes.length) return;
      dicteeSpokenCountRef.current = words.length;
      for (const w of newOnes) {
        const cleaned = cleanTextForTTS(w);
        if (!cleaned) continue;
        setIsSpeaking(true);
        ttsQueueRef.current = ttsQueueRef.current
          .then(() => speak(cleaned))
          .finally(() => setIsSpeaking(false));
      }
      return;
    }

    const ar = extractArabic(fullText);
    if (!ar) return;
    const remaining = ar.slice(ttsSpokenLenRef.current);
    if (!remaining) return;

    const sentenceRegex = /[^.!?؟\n]+[.!?؟\n]+/g;
    const matches = remaining.match(sentenceRegex) || [];
    let consumed = 0;
    const toSpeak: string[] = [];
    for (const s of matches) { toSpeak.push(s.trim()); consumed += s.length; }
    if (isFinal && consumed < remaining.length) {
      const tail = remaining.slice(consumed).trim();
      if (tail) toSpeak.push(tail);
      consumed = remaining.length;
    }
    if (!consumed) return;
    ttsSpokenLenRef.current += consumed;

    for (const sentence of toSpeak) {
      const cleaned = cleanTextForTTS(sentence);
      if (!cleaned) continue;
      setIsSpeaking(true);
      ttsQueueRef.current = ttsQueueRef.current
        .then(() => speak(cleaned))
        .finally(() => setIsSpeaking(false));
    }
  }, [autoSpeak, speak]);

  useEffect(() => {
    if (isLoading || !messages.length) return;
    const last = messages[messages.length - 1];
    if (last.role !== "assistant") return;
    if (ttsActiveForMsgRef.current === messages.length - 1) {
      speakNewSentencesFrom(last.content, true);
    }
  }, [isLoading, messages, speakNewSentencesFrom]);

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  // ── Auto-scroll ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // ── Voice recording ─────────────────────────────────────────────────────────
  const startVoiceRecording = useCallback(() => {
    stopSpeech();
    setIsSpeaking(false);
    recorder.startRecording({ silenceTimeoutMs: 1800, silenceThreshold: 0.018 }).catch(() => {
      toast({ title: "Microphone refusé", description: "Autorisez l'accès au micro dans votre navigateur.", variant: "destructive" });
    });
  }, [recorder, stopSpeech]);

  const stopVoice = useCallback(() => {
    if (recorder.isRecording) recorder.stopRecording();
  }, [recorder]);

  // Auto-transcribe when blob ready
  useEffect(() => {
    if (!recorder.audioBlob || isTranscribing) return;
    const run = async () => {
      setIsTranscribing(true);
      try {
        const blob = recorder.audioBlob!;
        const mt = blob.type || "audio/webm";
        let ext = "webm";
        if (mt.includes("mp4")) ext = "mp4";
        else if (mt.includes("aac")) ext = "aac";
        else if (mt.includes("ogg")) ext = "ogg";
        else if (mt.includes("wav")) ext = "wav";
        const formData = new FormData();
        formData.append("file", blob, `voice.${ext}`);
        formData.append("language_code", "ara");
        const resp = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-stt`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
            body: formData,
          }
        );
        if (!resp.ok) throw new Error("Transcription échouée");
        const data = await resp.json();
        const text = data.text?.trim();
        if (text) {
          await sendMessageRef.current(text);
        } else {
          toast({ title: "Aucun texte détecté", description: "Réessayez en parlant plus fort.", variant: "destructive" });
        }
      } catch (e: any) {
        toast({ title: "Erreur de transcription", description: e.message, variant: "destructive" });
      } finally {
        setIsTranscribing(false);
        recorder.reset();
      }
    };
    run();
  }, [recorder.audioBlob]);

  // ── Send message ────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || isLoading) return;

    if (!currentConvIdRef.current) {
      const id = await history.createConversation();
      if (!id) return;
      currentConvIdRef.current = id;
    }

    const userMsg: Msg = { role: "user", content: text };
    if (!overrideText) setInput("");
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    ttsSpokenLenRef.current = 0;
    dicteeSpokenCountRef.current = 0;
    ttsActiveForMsgRef.current = -1;

    let assistantSoFar = "";
    const update = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        let next: Msg[];
        if (last?.role === "assistant") {
          next = prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        } else {
          next = [...prev, { role: "assistant", content: assistantSoFar }];
        }
        ttsActiveForMsgRef.current = next.length - 1;
        return next;
      });
      speakNewSentencesFrom(assistantSoFar, false);
    };

    try {
      const currentCompleted = userLevel === "niveau_2" ? completedN2Lessons : completedLessons;
      await streamChat({
        messages: [...messages, userMsg],
        level: userLevel,
        completedLessons: currentCompleted,
        formality,
        age: persona.age,
        gender: persona.gender,
        firstName: persona.firstName,
        onDelta: update,
        onDone: () => {
          speakNewSentencesFrom(assistantSoFar, true);
          const txt = assistantSoFar;
          const positive = /(أَحْسَنْتَ|أحسنت|مُمْتَازٌ|ممتاز|رَائِعٌ|رائع|بَارَكَ اللَّهُ|بارك الله|صَحِيحٌ|صحيح)/.test(txt);
          const negative = /(الصَّوابُ|الصواب|خَطَأٌ|خطأ|حَاوِلْ|حاول مرَّةً|أَعِدْ|الصَّحِيحُ|الصحيح)/.test(txt);
          if (positive && !negative) playCorrectSound();
          else if (negative) playWrongSound();
          setIsLoading(false);
          setTimeout(() => inputRef.current?.focus(), 100);
        },
      });
    } catch (e: any) {
      setIsLoading(false);
      toast({ variant: "destructive", title: "Erreur de connexion", description: e.message });
    }
  }, [input, isLoading, messages, history, userLevel, formality, completedLessons, completedN2Lessons, speakNewSentencesFrom, persona.age, persona.gender, persona.firstName]);

  useEffect(() => { sendMessageRef.current = sendMessage; }, [sendMessage]);

  // ── Conversation management ─────────────────────────────────────────────────
  const handleNewConversation = () => {
    currentConvIdRef.current = null;
    setMessages([]);
    lastSpokenIndexRef.current = -1;
    stopSpeech();
    setIsSpeaking(false);
    history.setActiveId(null);
    setShowSidebar(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSelectConversation = (id: string) => {
    history.setActiveId(id);
    setShowSidebar(false);
  };

  const handleSpeakMessage = (msg: Msg) => {
    stopSpeech();
    setIsSpeaking(false);
    const dictees = extractDicteeWords(msg.content);
    if (dictees.length > 0) {
      for (const w of dictees) {
        setIsSpeaking(true);
        ttsQueueRef.current = ttsQueueRef.current
          .then(() => speak(w))
          .finally(() => setIsSpeaking(false));
      }
    } else {
      const ar = extractArabic(msg.content);
      if (ar) {
        setIsSpeaking(true);
        speak(ar).finally(() => setIsSpeaking(false));
      }
    }
  };

  const handleStopSpeech = () => {
    stopSpeech();
    setIsSpeaking(false);
    ttsQueueRef.current = Promise.resolve();
  };

  if (loading) return null;

  const suggestions = SUGGESTIONS[userLevel] || SUGGESTIONS.niveau_1;
  const hasMessages = messages.length > 0;

  // ── SIDEBAR ─────────────────────────────────────────────────────────────────
  const Sidebar = (
    <div className={`${showSidebar ? "fixed inset-0 z-40 bg-background" : "hidden"} md:flex md:relative md:inset-auto w-full md:w-64 border-r border-border flex-col shrink-0`}>
      <div className="p-3 border-b border-border flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Historique</h2>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleNewConversation} title="Nouvelle conversation">
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 md:hidden" onClick={() => setShowSidebar(false)}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {history.conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">Aucune conversation</p>
            <p className="text-xs text-muted-foreground/60">Commencez à parler !</p>
          </div>
        ) : (
          history.conversations.map((conv) => (
            <button key={conv.id} onClick={() => handleSelectConversation(conv.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2 group ${
                history.activeId === conv.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}>
              <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-60" />
              <span className="truncate flex-1 text-xs">{conv.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); history.deleteConversation(conv.id); }}
                className="opacity-0 group-hover:opacity-100 shrink-0 hover:text-destructive transition-opacity ml-1"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </button>
          ))
        )}
      </div>

      <div className="p-3 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          {history.conversations.length} conversation{history.conversations.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      <Navbar />

      <div className="flex flex-1 overflow-hidden" style={{ paddingTop: "64px" }}>

        {/* Sidebar */}
        {Sidebar}

        {/* Overlay for mobile sidebar */}
        {showSidebar && (
          <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setShowSidebar(false)} />
        )}

        {/* Main chat area */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">

          {/* ── Top bar ── */}
          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-background/95 backdrop-blur-sm shrink-0">
            <Button variant="ghost" size="icon" className="md:hidden h-8 w-8 shrink-0" onClick={() => setShowSidebar(true)}>
              <MessageSquare className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <img src="/alfasl_musaid_almoalim_final.png" alt="الأستاذ"
                className="w-8 h-8 rounded-full object-contain shrink-0 border-2 border-primary/30" />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-sm font-bold text-foreground truncate font-arabic" dir="rtl">
                    مُسَاعِدُ الْمُعَلِّمِ
                  </h1>
                  <Badge variant="secondary" className="text-xs shrink-0 hidden sm:flex">
                    <BookOpen className="h-2.5 w-2.5 mr-1" />{levelLabel}
                  </Badge>
                  {isSpeaking && (
                    <div className="flex items-center gap-0.5 shrink-0">
                      {[0,1,2,3].map((i) => (
                        <div key={i} className="w-0.5 bg-primary rounded-full animate-bounce"
                          style={{ height: `${8 + (i % 2) * 6}px`, animationDelay: `${i * 0.12}s` }} />
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {recorder.isRecording ? "🔴 Je vous écoute…"
                    : isTranscribing ? "⏳ Transcription…"
                    : isLoading ? "✍️ En train d'écrire…"
                    : isSpeaking ? "🔊 En train de parler…"
                    : "En ligne · Professeur Virtuel"}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Auto-speak toggle */}
              <Button
                variant={autoSpeak ? "default" : "ghost"}
                size="icon"
                className={`h-8 w-8 transition-all ${autoSpeak ? "gradient-emerald border-0 text-primary-foreground" : "text-muted-foreground"}`}
                onClick={() => {
                  if (autoSpeak) handleStopSpeech();
                  setAutoSpeak((v) => !v);
                }}
                title={autoSpeak ? "Désactiver la voix" : "Activer la voix"}
              >
                {autoSpeak ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              </Button>

              {isSpeaking && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  onClick={handleStopSpeech} title="Arrêter la lecture">
                  <Square className="h-3.5 w-3.5 fill-current" />
                </Button>
              )}

              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"
                onClick={handleNewConversation} title="Nouvelle conversation">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* ── Messages area ── */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
            style={{ scrollBehavior: "smooth" }}>

            {/* EMPTY STATE */}
            {!hasMessages && (
              <div className="flex flex-col items-center justify-center min-h-full py-8 gap-6">
                {/* Robot avatar with animated glow */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="relative"
                >
                  <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl scale-150 animate-pulse" />
                  <img
                    src="/alfasl_musaid_almoalim_final.png"
                    alt="مساعد المعلم"
                    className="relative w-36 h-36 object-contain drop-shadow-2xl"
                  />
                </motion.div>

                {/* Greeting */}
                <motion.div
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="text-center"
                >
                  <p className="text-2xl font-bold font-arabic text-foreground" dir="rtl"
                    style={{ fontFamily: "Amiri, serif" }}>
                    السَّلامُ عَلَيْكُمْ! أَنَا مُسَاعِدُ الْمُعَلِّمِ
                  </p>
                  <p className="text-muted-foreground text-base mt-1">Parlez ou écrivez en arabe — je vous guide !</p>
                  <Badge variant="outline" className="mt-2 border-primary/30 text-primary">
                    <Sparkles className="h-3 w-3 mr-1" />{levelLabel}
                  </Badge>
                </motion.div>

                {/* Big mic button */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.35, duration: 0.4 }}
                  className="relative flex items-center justify-center"
                >
                  {recorder.isRecording ? (
                    <>
                      <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping scale-125" />
                      <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping scale-150" style={{ animationDelay: "0.3s" }} />
                      <Button
                        size="icon"
                        className="relative h-20 w-20 rounded-full bg-red-500 hover:bg-red-600 border-0 shadow-2xl shadow-red-500/40 text-white"
                        onClick={stopVoice}
                      >
                        <Square className="h-8 w-8 fill-current" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 rounded-full bg-primary/15 animate-pulse scale-125" />
                      <Button
                        size="icon"
                        disabled={isTranscribing || isLoading}
                        className="relative h-20 w-20 rounded-full gradient-emerald border-0 shadow-2xl shadow-primary/30 hover:scale-105 transition-transform"
                        onClick={startVoiceRecording}
                      >
                        {isTranscribing
                          ? <Loader2 className="h-8 w-8 animate-spin text-primary-foreground" />
                          : <Mic className="h-8 w-8 text-primary-foreground" />}
                      </Button>
                    </>
                  )}
                </motion.div>

                {/* Recording indicator */}
                <AnimatePresence mode="wait">
                  {recorder.isRecording ? (
                    <motion.div key="recording" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        {[0.4,0.7,1.0,1.0,0.7,0.4].map((h, i) => (
                          <div key={i} className="w-1 bg-red-500 rounded-full animate-bounce"
                            style={{ height: `${h * 28}px`, animationDelay: `${i * 0.08}s` }} />
                        ))}
                      </div>
                      <p className="text-sm font-medium text-red-500">
                        🔴 Enregistrement · {recorder.duration}s
                      </p>
                      <p className="text-xs text-muted-foreground">Silence automatique → envoi</p>
                    </motion.div>
                  ) : isTranscribing ? (
                    <motion.div key="transcribing" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Transcription en cours…
                    </motion.div>
                  ) : (
                    <motion.div key="idle" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-sm text-muted-foreground">
                      Appuyez pour parler
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Suggestion chips */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap justify-center gap-2 max-w-sm"
                >
                  {suggestions.map((s) => (
                    <button key={s.ar}
                      className="group flex items-center gap-1.5 px-3 py-2 rounded-full border border-primary/25 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all"
                      onClick={() => sendMessage(s.ar)}
                      disabled={isLoading}
                    >
                      <span className="text-base font-arabic text-primary" dir="rtl"
                        style={{ fontFamily: "Amiri, serif" }}>{s.ar}</span>
                      <span className="text-xs text-muted-foreground hidden sm:inline">— {s.fr}</span>
                      <ChevronRight className="h-3 w-3 text-primary/60 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  ))}
                </motion.div>
              </div>
            )}

            {/* MESSAGES */}
            {hasMessages && messages.map((msg, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {/* Assistant avatar */}
                {msg.role === "assistant" && (
                  <div className="shrink-0 mt-1">
                    <img src="/alfasl_musaid_almoalim_final.png" alt="الأستاذ"
                      className="w-8 h-8 rounded-full object-contain border border-primary/20" />
                  </div>
                )}

                {/* Bubble */}
                <div className={`max-w-[78%] flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                    msg.role === "user"
                      ? "bg-primary/10 text-foreground rounded-tr-sm"
                      : "gradient-emerald text-primary-foreground rounded-tl-sm"
                  }`}>
                    <p
                      className={`whitespace-pre-wrap leading-relaxed break-words ${
                        hasArabic(msg.content)
                          ? "font-arabic text-xl"
                          : "text-sm"
                      }`}
                      dir="auto"
                      style={hasArabic(msg.content) ? { fontFamily: "Amiri, serif" } : undefined}
                    >
                      {msg.role === "assistant" ? (stripDictee(msg.content) || "🔊 …") : msg.content}
                    </p>
                  </div>

                  {/* Assistant actions */}
                  {msg.role === "assistant" && !isLoading && (
                    <div className="flex items-center gap-1 px-1">
                      <button
                        className="text-muted-foreground hover:text-primary transition-colors p-1 rounded-lg hover:bg-primary/5"
                        onClick={() => handleSpeakMessage(msg)}
                        title="Écouter"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* User avatar */}
                {msg.role === "user" && (
                  <Avatar className="h-8 w-8 shrink-0 mt-1">
                    <AvatarFallback className="bg-primary/15 text-primary text-xs font-bold">
                      {profile?.first_name?.[0]?.toUpperCase() || "V"}
                    </AvatarFallback>
                  </Avatar>
                )}
              </motion.div>
            ))}

            {/* Typing indicator */}
            <AnimatePresence>
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex gap-2.5 justify-start"
                >
                  <img src="/alfasl_musaid_almoalim_final.png" alt="الأستاذ"
                    className="w-8 h-8 rounded-full object-contain border border-primary/20 shrink-0 mt-1" />
                  <div className="gradient-emerald rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="text-primary-foreground/80 text-xs font-arabic">يكتب</span>
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground/70 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground/70 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground/70 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Input bar ── */}
          <div className="shrink-0 border-t border-border bg-background/95 backdrop-blur-sm px-3 py-3">

            {/* Suggestion chips (during chat) */}
            {hasMessages && !isLoading && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-2">
                {suggestions.map((s) => (
                  <button key={s.ar}
                    className="shrink-0 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 text-sm font-arabic text-primary transition-all whitespace-nowrap"
                    dir="rtl"
                    style={{ fontFamily: "Amiri, serif" }}
                    onClick={() => sendMessage(s.ar)}
                    disabled={isLoading}
                  >
                    {s.ar}
                  </button>
                ))}
              </div>
            )}

            {/* Recording indicator bar */}
            <AnimatePresence>
              {recorder.isRecording && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-center gap-3 mb-2 py-1"
                >
                  <div className="flex items-center gap-0.5">
                    {[0.5,0.8,1,0.8,0.5,0.8,1].map((h, i) => (
                      <div key={i} className="w-0.5 bg-red-500 rounded-full animate-bounce"
                        style={{ height: `${h * 20}px`, animationDelay: `${i * 0.07}s` }} />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-red-500 animate-pulse">
                    🔴 {recorder.duration}s — Parlez…
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[1,0.8,0.5,0.8,1,0.8,0.5].map((h, i) => (
                      <div key={i} className="w-0.5 bg-red-500 rounded-full animate-bounce"
                        style={{ height: `${h * 20}px`, animationDelay: `${i * 0.07 + 0.3}s` }} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input row */}
            <div className="flex gap-2 items-center">

              {/* Mic button */}
              <div className="relative shrink-0">
                {recorder.isRecording ? (
                  <>
                    <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
                    <Button size="icon"
                      className="relative h-10 w-10 rounded-full bg-red-500 hover:bg-red-600 border-0 text-white shadow-lg shadow-red-500/30"
                      onClick={stopVoice}
                      title="Arrêter et envoyer"
                    >
                      <Square className="h-4 w-4 fill-current" />
                    </Button>
                  </>
                ) : (
                  <Button size="icon"
                    variant="outline"
                    className="h-10 w-10 rounded-full border-primary/30 hover:bg-primary/5 hover:border-primary/50"
                    onClick={startVoiceRecording}
                    disabled={isLoading || isTranscribing}
                    title="Parler en arabe"
                  >
                    {isTranscribing
                      ? <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      : <Mic className="h-4 w-4 text-primary" />}
                  </Button>
                )}
              </div>

              {/* Text input */}
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="اكتب رسالتك… / Écrivez en arabe…"
                className="flex-1 text-base rounded-full border-primary/20 focus-visible:ring-primary/30 bg-muted/40"
                dir="auto"
                disabled={isLoading || recorder.isRecording}
              />

              {/* Send button */}
              <Button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading || recorder.isRecording}
                size="icon"
                className="h-10 w-10 rounded-full gradient-emerald border-0 shadow-md shadow-primary/20 shrink-0"
                title="Envoyer"
              >
                {isLoading
                  ? <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
                  : <Send className="h-4 w-4 text-primary-foreground" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArabicChat;

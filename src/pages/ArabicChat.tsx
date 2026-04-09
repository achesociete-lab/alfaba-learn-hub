import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Loader2, Volume2, VolumeX, Trash2, Mic, Square, Plus, MessageSquare, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useArabicSpeech } from "@/hooks/use-arabic-speech";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { useChatHistory } from "@/hooks/use-chat-history";
import { useLessonProgress } from "@/hooks/use-lesson-progress";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/arabic-chat`;

async function streamChat({
  messages, level, completedLessons, onDelta, onDone, signal,
}: {
  messages: Msg[]; level: string; completedLessons: number[]; onDelta: (t: string) => void; onDone: () => void; signal?: AbortSignal;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, level, completedLessons }),
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
      } catch { /* partial */ }
    }
  }
  onDone();
}

function extractArabic(text: string): string {
  const match = text.match(/([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\d.,!?؟،؛:]+)/);
  return match ? match[0].trim() : "";
}

const ArabicChat = () => {
  const { user, loading } = useAuth();
  const { completedLessons, completedN2Lessons } = useLessonProgress();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userLevel, setUserLevel] = useState<string>("niveau_1");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch user level
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("level").eq("user_id", user.id).single()
      .then(({ data }) => { if (data?.level) setUserLevel(data.level); });
  }, [user]);
  const { speak, stop: stopSpeech } = useArabicSpeech();
  const recorder = useAudioRecorder();
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const lastSpokenIndexRef = useRef(-1);
  const [showSidebar, setShowSidebar] = useState(false);

  const history = useChatHistory();
  const currentConvIdRef = useRef<string | null>(null);

  // Sync active conversation messages
  useEffect(() => {
    if (history.activeConversation) {
      setMessages(history.activeConversation.messages);
      currentConvIdRef.current = history.activeConversation.id;
      lastSpokenIndexRef.current = history.activeConversation.messages.length - 1;
    }
  }, [history.activeId]);

  // Save messages to DB after assistant finishes
  useEffect(() => {
    if (isLoading || messages.length === 0 || !currentConvIdRef.current) return;
    history.saveMessages(currentConvIdRef.current, messages);
  }, [messages, isLoading]);

  const transcribeAndSend = useCallback(async () => {
    recorder.stopRecording();
  }, [recorder]);

  useEffect(() => {
    if (!recorder.audioBlob || isTranscribing) return;
    const run = async () => {
      setIsTranscribing(true);
      try {
        const formData = new FormData();
        formData.append("file", recorder.audioBlob!, "voice.webm");
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
        if (text) setInput(text);
        else toast({ title: "Aucun texte détecté", variant: "destructive" });
      } catch (e: any) {
        console.error(e);
        toast({ title: "Erreur de transcription", description: e.message, variant: "destructive" });
      } finally {
        setIsTranscribing(false);
        recorder.reset();
      }
    };
    run();
  }, [recorder.audioBlob]);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Auto-speak assistant messages
  useEffect(() => {
    if (isLoading || !autoSpeak || messages.length === 0) return;
    const lastIndex = messages.length - 1;
    const lastMsg = messages[lastIndex];
    if (lastMsg.role === "assistant" && lastIndex > lastSpokenIndexRef.current) {
      lastSpokenIndexRef.current = lastIndex;
      const ar = extractArabic(lastMsg.content);
      if (ar) speak(ar);
    }
  }, [messages, isLoading, autoSpeak, speak]);

  // Auto-speak user messages
  useEffect(() => {
    if (!autoSpeak || messages.length === 0) return;
    const lastIndex = messages.length - 1;
    const lastMsg = messages[lastIndex];
    if (lastMsg.role === "user" && lastIndex > lastSpokenIndexRef.current) {
      lastSpokenIndexRef.current = lastIndex;
      const ar = extractArabic(lastMsg.content);
      if (ar) speak(ar);
    }
  }, [messages, autoSpeak, speak]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    // Create conversation if none active
    if (!currentConvIdRef.current) {
      const id = await history.createConversation();
      if (!id) return;
      currentConvIdRef.current = id;
    }

    const userMsg: Msg = { role: "user", content: text };
    setInput("");
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    let assistantSoFar = "";
    const update = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const currentCompleted = userLevel === "niveau_2" ? completedN2Lessons : completedLessons;
      await streamChat({
        messages: [...messages, userMsg],
        level: userLevel,
        completedLessons: currentCompleted,
        onDelta: update,
        onDone: () => setIsLoading(false),
      });
    } catch (e: any) {
      console.error(e);
      setIsLoading(false);
      toast({ variant: "destructive", title: "Erreur", description: e.message });
    }
  }, [input, isLoading, messages, history]);

  const handleNewConversation = () => {
    currentConvIdRef.current = null;
    setMessages([]);
    lastSpokenIndexRef.current = -1;
    stopSpeech();
    history.setActiveId(null);
    setShowSidebar(false);
  };

  const handleSelectConversation = (id: string) => {
    history.setActiveId(id);
    setShowSidebar(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex pt-16">
        {/* Sidebar */}
        <div className={`${showSidebar ? "fixed inset-0 z-40 bg-background md:relative md:inset-auto" : "hidden md:block"} w-full md:w-72 border-r border-border flex flex-col`}>
          <div className="p-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Historique</h2>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNewConversation}>
                <Plus className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" onClick={() => setShowSidebar(false)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {history.conversations.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">Aucune conversation</p>
            )}
            {history.conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 group ${
                  history.activeId === conv.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate flex-1">{conv.title}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); history.deleteConversation(conv.id); }}
                  className="opacity-0 group-hover:opacity-100 shrink-0 text-muted-foreground hover:text-destructive transition-opacity"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full pb-4 px-4">
          {/* Header */}
          <div className="text-center mb-4 pt-4">
            <div className="flex items-center justify-center gap-2">
              <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={() => setShowSidebar(true)}>
                <MessageSquare className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-display font-bold text-foreground">
                تحدّث مع <span className="text-gradient-gold">الأستاذ</span>
              </h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Pratiquez l'arabe en discutant avec votre assistant IA
            </p>
            <Button
              variant={autoSpeak ? "default" : "outline"}
              size="sm"
              className="mt-2 gap-1.5 text-xs"
              onClick={() => { setAutoSpeak(!autoSpeak); if (autoSpeak) stopSpeech(); }}
            >
              {autoSpeak ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              {autoSpeak ? "Lecture auto activée" : "Lecture auto désactivée"}
            </Button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0" style={{ maxHeight: "calc(100vh - 240px)" }}>
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-16 gap-4">
                <div className="w-16 h-16 rounded-full gradient-emerald flex items-center justify-center">
                  <Bot className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground font-arabic" dir="rtl">
                    السَّلامُ عَلَيْكُمْ! أَنَا الأُسْتَاذُ
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Écrivez en arabe ou en français pour commencer la conversation
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {["مَرْحَباً", "كَيْفَ حَالُكَ؟", "أُرِيدُ أَنْ أَتَعَلَّمَ"].map((s) => (
                    <Button key={s} variant="outline" size="sm" className="font-arabic text-base" dir="rtl"
                      onClick={() => setInput(s)}>
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <Avatar className="h-8 w-8 shrink-0 mt-1">
                    <AvatarFallback className="gradient-emerald text-primary-foreground text-xs">أ</AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed" dir="auto">{msg.content}</p>
                  {msg.role === "assistant" && !isLoading && (
                    <Button variant="ghost" size="icon" className="h-6 w-6 mt-1 opacity-60 hover:opacity-100"
                      onClick={() => { const ar = extractArabic(msg.content); if (ar) speak(ar); }}>
                      <Volume2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                {msg.role === "user" && (
                  <Avatar className="h-8 w-8 shrink-0 mt-1">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 shrink-0 mt-1">
                  <AvatarFallback className="gradient-emerald text-primary-foreground text-xs">أ</AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2 items-center border-t border-border pt-3">
            {messages.length > 0 && (
              <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground"
                onClick={handleNewConversation}>
                <Plus className="h-4 w-4" />
              </Button>
            )}

            {recorder.isRecording ? (
              <Button variant="destructive" size="icon" className="shrink-0" onClick={transcribeAndSend} disabled={isTranscribing}>
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="outline" size="icon" className="shrink-0" onClick={() => recorder.startRecording()} disabled={isLoading || isTranscribing}>
                {isTranscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
            {recorder.isRecording && (
              <span className="text-xs text-destructive animate-pulse">🔴 {recorder.duration}s</span>
            )}

            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب رسالتك هنا... / Écrivez votre message..."
              className="flex-1 text-base"
              dir="auto"
              disabled={isLoading || recorder.isRecording}
            />
            <Button onClick={sendMessage} disabled={!input.trim() || isLoading} size="icon" className="shrink-0 gradient-emerald border-0">
              <Send className="h-4 w-4 text-primary-foreground" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArabicChat;

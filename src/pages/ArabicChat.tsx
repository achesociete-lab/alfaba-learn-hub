import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Loader2, Volume2, Trash2, Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useArabicSpeech } from "@/hooks/use-arabic-speech";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/arabic-chat`;

async function streamChat({
  messages,
  level,
  onDelta,
  onDone,
  signal,
}: {
  messages: Msg[];
  level: string;
  onDelta: (t: string) => void;
  onDone: () => void;
  signal?: AbortSignal;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, level }),
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
  // Extract Arabic text (before the [Traduction: ...] part)
  const match = text.match(/([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\d.,!?؟،؛:]+)/);
  return match ? match[0].trim() : "";
}

const ArabicChat = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { speak } = useArabicSpeech();
  const recorder = useAudioRecorder();
  const [isTranscribing, setIsTranscribing] = useState(false);

  const transcribeAndSend = useCallback(async () => {
    // Stop recording first, then wait for blob
    recorder.stopRecording();
  }, [recorder]);

  // When recorder produces a blob after stopping, transcribe it
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
        if (text) {
          setInput(text);
        } else {
          toast({ title: "Aucun texte détecté", variant: "destructive" });
        }
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
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

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
      await streamChat({
        messages: [...messages, userMsg],
        level: "niveau_1",
        onDelta: update,
        onDone: () => setIsLoading(false),
      });
    } catch (e: any) {
      console.error(e);
      setIsLoading(false);
      toast({ variant: "destructive", title: "Erreur", description: e.message });
    }
  }, [input, isLoading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full pt-20 pb-4 px-4">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-display font-bold text-foreground">
            تحدّث مع <span className="text-gradient-gold">الأستاذ</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pratiquez l'arabe en discutant avec votre assistant IA
          </p>
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
                    onClick={() => { setInput(s); }}>
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
              onClick={() => setMessages([])}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اكتب رسالتك هنا... / Écrivez votre message..."
            className="flex-1 text-base"
            dir="auto"
            disabled={isLoading}
          />
          <Button onClick={sendMessage} disabled={!input.trim() || isLoading} size="icon" className="shrink-0 gradient-emerald border-0">
            <Send className="h-4 w-4 text-primary-foreground" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ArabicChat;

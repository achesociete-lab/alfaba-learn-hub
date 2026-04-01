import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Msg = { role: "user" | "assistant"; content: string };

export interface ChatConversation {
  id: string;
  title: string;
  messages: Msg[];
  created_at: string;
  updated_at: string;
}

export function useChatHistory() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load conversations list
  const loadConversations = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("chat_conversations")
      .select("id, title, messages, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    if (data) {
      setConversations(data.map((c: any) => ({
        ...c,
        messages: (c.messages as any) || [],
      })));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  const createConversation = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({ user_id: user.id, title: "Nouvelle conversation", messages: [] })
      .select("id")
      .single();
    if (error || !data) return null;
    await loadConversations();
    setActiveId(data.id);
    return data.id;
  }, [user, loadConversations]);

  const saveMessages = useCallback(async (conversationId: string, messages: Msg[]) => {
    // Generate title from first user message
    const firstUser = messages.find(m => m.role === "user");
    const title = firstUser
      ? firstUser.content.slice(0, 50) + (firstUser.content.length > 50 ? "…" : "")
      : "Nouvelle conversation";

    await supabase
      .from("chat_conversations")
      .update({ messages: messages as any, title })
      .eq("id", conversationId);
    
    // Update local state
    setConversations(prev => prev.map(c =>
      c.id === conversationId ? { ...c, messages, title, updated_at: new Date().toISOString() } : c
    ));
  }, []);

  const deleteConversation = useCallback(async (id: string) => {
    await supabase.from("chat_conversations").delete().eq("id", id);
    if (activeId === id) setActiveId(null);
    setConversations(prev => prev.filter(c => c.id !== id));
  }, [activeId]);

  const activeConversation = conversations.find(c => c.id === activeId) || null;

  return {
    conversations,
    activeId,
    setActiveId,
    activeConversation,
    createConversation,
    saveMessages,
    deleteConversation,
    loading,
  };
}
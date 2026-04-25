import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `أنتَ "المعلِّمُ الخاصُّ" — أستاذٌ خصوصيٌّ متخصِّصٌ في تعليمِ اللغةِ العربيةِ الفصحى للناطقينَ بالفرنسية.
دورُكَ:
- تحليلُ مستوى الطالبِ ونقاطِ ضعفِهِ وقوَّتِهِ
- اقتراحُ تمارينَ مخصَّصةٍ
- تصحيحُ الإجاباتِ بلُطفٍ وبيانٍ
- تشجيعُ الطالبِ ودفعُهُ نحوَ التقدُّم
أسلوبُكَ:
- العربيةُ الفصحى الصحيحةُ معَ الشكلِ الكاملِ
- ردودٌ قصيرةٌ وواضحةٌ
- تنتهي دائماً بسؤالٍ أو تمرينٍ
- لا تستعملِ الإيموجي ولا الرموزَ الزخرفية`;

interface Body {
  action: "analyze" | "start_session" | "message" | "end_session" | "generate_homework" | "correct_homework" | "weekly_plan";
  session_id?: string;
  homework_id?: string;
  user_message?: string;
  submission?: any;
  messages?: Array<{ role: string; content: string }>;
}

async function callAI(messages: Array<{ role: string; content: string }>, jsonMode = false) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

  const body: any = {
    model: "google/gemini-2.5-pro",
    messages,
  };
  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`AI gateway ${res.status}: ${txt}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function getProgressContext(supabase: any, userId: string) {
  const [{ data: progress }, { data: profile }, { data: lessons }, { data: recentSessions }, { data: pendingHw }] = await Promise.all([
    supabase.from("tutor_progress").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("profiles").select("first_name, level, age").eq("user_id", userId).single(),
    supabase.from("lesson_progress").select("lesson_id, completed_at").eq("user_id", userId).order("completed_at", { ascending: false }).limit(20),
    supabase.from("tutor_sessions").select("score, summary, weak_points, ended_at").eq("user_id", userId).not("ended_at", "is", null).order("started_at", { ascending: false }).limit(5),
    supabase.from("tutor_homework").select("title, status, score").eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
  ]);

  return { progress, profile, lessons: lessons || [], recentSessions: recentSessions || [], pendingHw: pendingHw || [] };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) throw new Error("Unauthorized");
    const userId = userData.user.id;

    const body: Body = await req.json();
    const ctx = await getProgressContext(supabase, userId);

    // ============ ANALYZE: full progression analysis ============
    if (body.action === "analyze") {
      const ctxStr = JSON.stringify({
        level: ctx.profile?.level,
        first_name: ctx.profile?.first_name,
        lessons_completed_count: ctx.lessons.length,
        recent_lesson_ids: ctx.lessons.slice(0, 10).map((l: any) => l.lesson_id),
        recent_sessions: ctx.recentSessions,
        progress: ctx.progress,
      });

      const content = await callAI([
        { role: "system", content: `${SYSTEM_PROMPT}\n\nأنتَ تُحلِّلُ مستوى الطالبِ. أَجِبْ بصيغةِ JSON صالحةٍ فقط.` },
        { role: "user", content: `حلِّلْ هذِهِ المعطياتِ وأَعِدْ JSON بالحقولِ التاليةِ: { "summary": "string بالعربيةِ", "weak_points": ["string"], "strong_points": ["string"], "recommended_focus": "string", "estimated_level_score": number 0-100 }\n\nالمعطيات:\n${ctxStr}` },
      ], true);

      const analysis = JSON.parse(content);
      return new Response(JSON.stringify(analysis), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============ START_SESSION ============
    if (body.action === "start_session") {
      const { data: session, error } = await supabase
        .from("tutor_sessions")
        .insert({ user_id: userId, messages: [] })
        .select()
        .single();
      if (error) throw error;

      const ctxStr = JSON.stringify({
        first_name: ctx.profile?.first_name,
        level: ctx.profile?.level,
        progress: ctx.progress,
        recent_sessions: ctx.recentSessions.slice(0, 3),
        pending_homework: ctx.pendingHw,
      });

      const greeting = await callAI([
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `ابدأْ جلسةً جديدةً معَ الطالبِ. رحِّبْ بهِ، اقترحْ برنامجاً موجزاً للجلسةِ بناءً على نقاطِ ضعفِهِ، ثمَّ ابدأْ بأوَّلِ تمرينٍ.\n\nمعطياتُ الطالبِ:\n${ctxStr}` },
      ]);

      const messages = [{ role: "assistant", content: greeting }];
      await supabase.from("tutor_sessions").update({ messages }).eq("id", session.id);

      return new Response(JSON.stringify({ session_id: session.id, message: greeting }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============ MESSAGE in session ============
    if (body.action === "message") {
      if (!body.session_id || !body.user_message) throw new Error("session_id and user_message required");

      const { data: session, error: sErr } = await supabase
        .from("tutor_sessions")
        .select("*")
        .eq("id", body.session_id)
        .eq("user_id", userId)
        .single();
      if (sErr || !session) throw new Error("Session not found");

      const history = (session.messages || []) as Array<{ role: string; content: string }>;
      history.push({ role: "user", content: body.user_message });

      const reply = await callAI([
        { role: "system", content: SYSTEM_PROMPT },
        ...history,
      ]);

      history.push({ role: "assistant", content: reply });
      await supabase.from("tutor_sessions").update({ messages: history }).eq("id", session.id);

      return new Response(JSON.stringify({ message: reply }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============ END_SESSION ============
    if (body.action === "end_session") {
      if (!body.session_id) throw new Error("session_id required");

      const { data: session } = await supabase
        .from("tutor_sessions").select("*").eq("id", body.session_id).eq("user_id", userId).single();
      if (!session) throw new Error("Session not found");

      const transcript = (session.messages || []).map((m: any) => `${m.role}: ${m.content}`).join("\n\n");

      const summaryJson = await callAI([
        { role: "system", content: `${SYSTEM_PROMPT}\n\nأنتَ تُلخِّصُ جلسةَ تعليمٍ. أَجِبْ بصيغةِ JSON صالحةٍ فقط.` },
        { role: "user", content: `لخِّصْ هذِهِ الجلسةَ. أَعِدْ JSON: { "summary": "string بالعربيةِ والفرنسيةِ مختصراً", "weak_points": ["string"], "strong_points": ["string"], "score": number 0-100, "homework_suggestion": { "title": "string", "content": { "instructions": "string", "exercises": [{ "question": "string", "expected_answer": "string" }] }, "due_date_days": number } }\n\nالجلسة:\n${transcript}` },
      ], true);

      const sum = JSON.parse(summaryJson);
      await supabase.from("tutor_sessions").update({
        ended_at: new Date().toISOString(),
        summary: sum.summary,
        weak_points: sum.weak_points,
        strong_points: sum.strong_points,
        score: sum.score,
      }).eq("id", session.id);

      // Create homework
      let homework = null;
      if (sum.homework_suggestion) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (sum.homework_suggestion.due_date_days || 3));
        const { data: hw } = await supabase.from("tutor_homework").insert({
          user_id: userId,
          session_id: session.id,
          title: sum.homework_suggestion.title,
          content: sum.homework_suggestion.content,
          due_date: dueDate.toISOString().slice(0, 10),
          status: "pending",
        }).select().single();
        homework = hw;
      }

      // Update progress
      const prevProgress = ctx.progress;
      const totalSessions = (prevProgress?.total_sessions || 0) + 1;
      const prevAvg = prevProgress?.average_score || 0;
      const newAvg = (prevAvg * (totalSessions - 1) + (sum.score || 0)) / totalSessions;

      // Streak: increment if last session was yesterday or today, else reset to 1
      let streak = prevProgress?.streak_days || 0;
      if (prevProgress?.last_session_at) {
        const last = new Date(prevProgress.last_session_at);
        const diffDays = Math.floor((Date.now() - last.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 1) streak += 1;
        else streak = 1;
      } else {
        streak = 1;
      }

      const progressData = {
        user_id: userId,
        level: ctx.profile?.level || "niveau_1",
        total_sessions: totalSessions,
        average_score: Number(newAvg.toFixed(2)),
        streak_days: streak,
        last_session_at: new Date().toISOString(),
        weak_letters: sum.weak_points || [],
        strong_letters: sum.strong_points || [],
      };

      if (prevProgress) {
        await supabase.from("tutor_progress").update(progressData).eq("user_id", userId);
      } else {
        await supabase.from("tutor_progress").insert(progressData);
      }

      return new Response(JSON.stringify({ summary: sum, homework }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============ GENERATE_HOMEWORK (manual) ============
    if (body.action === "generate_homework") {
      const ctxStr = JSON.stringify({
        level: ctx.profile?.level,
        weak_letters: ctx.progress?.weak_letters,
        recent_sessions: ctx.recentSessions.slice(0, 2),
      });

      const json = await callAI([
        { role: "system", content: `${SYSTEM_PROMPT}\n\nأنشِئْ تمريناً منزلياً مخصَّصاً. أَجِبْ بصيغةِ JSON فقط.` },
        { role: "user", content: `أنشِئْ تمريناً منزلياً يَستهدفُ نقاطَ ضعفِ الطالبِ. أَعِدْ JSON: { "title": "string", "content": { "instructions": "string", "exercises": [{ "question": "string", "expected_answer": "string" }] }, "due_date_days": 3 }\n\nالطالب:\n${ctxStr}` },
      ], true);

      const hwData = JSON.parse(json);
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (hwData.due_date_days || 3));

      const { data: hw, error } = await supabase.from("tutor_homework").insert({
        user_id: userId,
        title: hwData.title,
        content: hwData.content,
        due_date: dueDate.toISOString().slice(0, 10),
        status: "pending",
      }).select().single();
      if (error) throw error;

      return new Response(JSON.stringify({ homework: hw }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============ CORRECT_HOMEWORK ============
    if (body.action === "correct_homework") {
      if (!body.homework_id || !body.submission) throw new Error("homework_id and submission required");

      const { data: hw, error: hwErr } = await supabase
        .from("tutor_homework").select("*").eq("id", body.homework_id).eq("user_id", userId).single();
      if (hwErr || !hw) throw new Error("Homework not found");

      const json = await callAI([
        { role: "system", content: `${SYSTEM_PROMPT}\n\nأنتَ تُصحِّحُ تمريناً منزلياً. أَجِبْ بصيغةِ JSON فقط.` },
        { role: "user", content: `صحِّحْ هذا التمرينَ ومنحْ نتيجةً.\n\nالتمرين:\n${JSON.stringify(hw.content)}\n\nإجابةُ الطالب:\n${JSON.stringify(body.submission)}\n\nأَعِدْ JSON: { "score": number 0-100, "feedback": "string بالعربيةِ والفرنسيةِ، مفصَّلٌ ومشجِّعٌ", "corrections": [{ "exercise_index": number, "correct": boolean, "explanation": "string" }] }` },
      ], true);

      const result = JSON.parse(json);
      await supabase.from("tutor_homework").update({
        submission: body.submission,
        score: result.score,
        feedback: result.feedback,
        status: "corrected",
      }).eq("id", hw.id);

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============ WEEKLY_PLAN ============
    if (body.action === "weekly_plan") {
      const ctxStr = JSON.stringify({
        level: ctx.profile?.level,
        progress: ctx.progress,
        recent_sessions: ctx.recentSessions,
      });

      const json = await callAI([
        { role: "system", content: `${SYSTEM_PROMPT}\n\nأنشِئْ خطَّةً أسبوعيَّةً مخصَّصةً. أَجِبْ بصيغةِ JSON فقط.` },
        { role: "user", content: `أنشِئْ خطَّةً أسبوعيَّةً للطالبِ. أَعِدْ JSON: { "week_focus": "string", "daily_plan": [{ "day": "lundi|mardi|...", "topic": "string", "duration_minutes": number, "exercise": "string" }] }\n\nالطالب:\n${ctxStr}` },
      ], true);

      const plan = JSON.parse(json);

      const prog = ctx.progress;
      if (prog) {
        await supabase.from("tutor_progress").update({ weekly_plan: plan }).eq("user_id", userId);
      } else {
        await supabase.from("tutor_progress").insert({
          user_id: userId,
          level: ctx.profile?.level || "niveau_1",
          weekly_plan: plan,
        });
      }

      return new Response(JSON.stringify({ plan }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[ai-tutor]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

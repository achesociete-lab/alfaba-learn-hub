// Quran-specialized speech-to-text edge function.
//
// Strategy:
//   1. Try Hugging Face Inference API with `tarteel-ai/whisper-base-ar-quran`
//      — this is the actual model open-sourced by the Tarteel team, fine-tuned
//      on Quranic recitation. It does NOT auto-correct mispronounced words
//      (unlike generic Arabic STT), so it surfaces real errors.
//   2. If HF fails / not configured / cold-start times out → fall back to
//      ElevenLabs Scribe v2 so the live recitation never breaks.
//
// Returns { text: string, engine: "whisper-quran" | "elevenlabs-scribe" }.
// Same contract as the previous /elevenlabs-stt function so the frontend
// only needs to change the URL.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const HF_MODEL = "tarteel-ai/whisper-base-ar-quran";
const HF_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

async function transcribeWithHF(
  audioBytes: ArrayBuffer,
  contentType: string,
  hfKey: string,
): Promise<string | null> {
  try {
    const response = await fetch(HF_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hfKey}`,
        "Content-Type": contentType || "audio/webm",
        // Wait up to ~20s if the model needs to cold-start (otherwise we
        // get a 503 with "model is loading" on the first call).
        "x-wait-for-model": "true",
      },
      body: audioBytes,
    });
    if (!response.ok) {
      const body = await response.text();
      console.warn(`HF Whisper-Quran error [${response.status}]: ${body.slice(0, 300)}`);
      return null;
    }
    const data = await response.json();
    // HF inference returns either { text: "..." } or [{ text: "..." }] depending on task
    if (typeof data?.text === "string") return data.text;
    if (Array.isArray(data) && typeof data[0]?.text === "string") return data[0].text;
    console.warn("HF Whisper-Quran returned unexpected shape:", JSON.stringify(data).slice(0, 200));
    return null;
  } catch (e) {
    console.warn("HF Whisper-Quran exception:", e);
    return null;
  }
}

async function transcribeWithElevenLabs(
  audioFile: File,
  elevenKey: string,
  lang: string,
): Promise<string> {
  const apiFormData = new FormData();
  apiFormData.append("file", audioFile);
  apiFormData.append("model_id", "scribe_v2");
  apiFormData.append("language_code", lang);

  const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: { "xi-api-key": elevenKey },
    body: apiFormData,
  });
  if (!response.ok) {
    const body = await response.text();
    console.error(`ElevenLabs STT error [${response.status}]: ${body.slice(0, 200)}`);
    throw new Error(`ElevenLabs STT failed [${response.status}]`);
  }
  const data = await response.json();
  return typeof data.text === "string" ? data.text : "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get("file") as File | null;

    if (!audioFile) {
      return new Response(JSON.stringify({ error: "Audio file is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const HF_KEY = Deno.env.get("HUGGINGFACE_API_KEY");
    const ELEVENLABS_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    const lang = (formData.get("language_code") as string) || "ara";

    let text = "";
    let engine: "whisper-quran" | "elevenlabs-scribe" | "none" = "none";

    // 1. Try HF Whisper-Quran first (specialized for Quranic recitation)
    if (HF_KEY) {
      const audioBytes = await audioFile.arrayBuffer();
      const contentType = audioFile.type || "audio/webm";
      const hfText = await transcribeWithHF(audioBytes, contentType, HF_KEY);
      if (hfText !== null && hfText.trim().length > 0) {
        text = hfText;
        engine = "whisper-quran";
      }
    }

    // 2. Fallback to ElevenLabs Scribe (or primary if HF not configured)
    if (!text && ELEVENLABS_KEY) {
      try {
        text = await transcribeWithElevenLabs(audioFile, ELEVENLABS_KEY, lang);
        engine = "elevenlabs-scribe";
      } catch (e) {
        console.error("ElevenLabs fallback failed:", e);
      }
    }

    if (!text && !HF_KEY && !ELEVENLABS_KEY) {
      throw new Error(
        "No STT provider configured. Set HUGGINGFACE_API_KEY (preferred for Quran) and/or ELEVENLABS_API_KEY in Supabase secrets.",
      );
    }

    return new Response(JSON.stringify({ text, engine }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("quran-stt error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Quran-specialized speech-to-text edge function
// Cascade strategy (best → fallback):
//   1. Tarteel whisper-base-ar-quran (only works if user sets up paid HF Inference Endpoint)
//   2. OpenAI whisper-large-v3 on HF Serverless (FREE, transcribes literally — catches mispronunciations)
//   3. ElevenLabs Scribe v2 (last resort — auto-corrects, hides errors)

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const HF_TARTEEL_MODEL = "tarteel-ai/whisper-base-ar-quran";
const HF_WHISPER_LARGE = "openai/whisper-large-v3";

async function callHfInference(
  model: string,
  audio: Uint8Array,
  contentType: string,
  hfKey: string,
  timeoutMs: number,
): Promise<{ ok: boolean; text?: string; status: number; body?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfKey}`,
          "Content-Type": contentType,
          "x-wait-for-model": "true",
        },
        body: audio,
        signal: controller.signal,
      },
    );
    clearTimeout(timer);
    if (!resp.ok) {
      const body = await resp.text().catch(() => "");
      return { ok: false, status: resp.status, body: body.slice(0, 200) };
    }
    const data = await resp.json();
    const text =
      typeof data === "string"
        ? data
        : data.text ?? data.transcription ?? "";
    return { ok: true, status: resp.status, text: String(text).trim() };
  } catch (e) {
    clearTimeout(timer);
    return { ok: false, status: 0, body: String(e).slice(0, 200) };
  }
}

async function callElevenLabs(
  audio: Uint8Array,
  contentType: string,
  elKey: string,
): Promise<{ ok: boolean; text?: string; error?: string }> {
  try {
    const fd = new FormData();
    fd.append(
      "file",
      new Blob([audio], { type: contentType }),
      "audio.webm",
    );
    fd.append("model_id", "scribe_v1");
    fd.append("language_code", "ara");
    const resp = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: { "xi-api-key": elKey },
      body: fd,
    });
    if (!resp.ok) {
      return { ok: false, error: `EL ${resp.status}` };
    }
    const data = await resp.json();
    return { ok: true, text: String(data.text ?? "").trim() };
  } catch (e) {
    return { ok: false, error: String(e).slice(0, 100) };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType) {
      return new Response(JSON.stringify({ error: "Missing content type" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const audio = new Uint8Array(await req.arrayBuffer());
    if (audio.byteLength < 100) {
      return new Response(
        JSON.stringify({ error: "Audio too small", text: "" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const hfKey = Deno.env.get("HUGGINGFACE_API_KEY");
    const elKey = Deno.env.get("ELEVENLABS_API_KEY");

    const debug: Record<string, unknown> = {};

    // STAGE 1: try Tarteel specialized model (only works on paid HF Endpoint)
    if (hfKey) {
      const r1 = await callHfInference(
        HF_TARTEEL_MODEL,
        audio,
        contentType,
        hfKey,
        20000,
      );
      debug.tarteel = { status: r1.status, ok: r1.ok };
      if (r1.ok && r1.text) {
        return new Response(
          JSON.stringify({
            text: r1.text,
            engine: "whisper-quran-tarteel",
            debug,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    } else {
      debug.tarteel = "no-hf-key";
    }

    // STAGE 2: OpenAI Whisper-Large-v3 on HF Serverless (FREE, literal transcription)
    if (hfKey) {
      const r2 = await callHfInference(
        HF_WHISPER_LARGE,
        audio,
        contentType,
        hfKey,
        25000,
      );
      debug.whisperLarge = { status: r2.status, ok: r2.ok };
      if (r2.ok && r2.text) {
        return new Response(
          JSON.stringify({
            text: r2.text,
            engine: "whisper-large-v3",
            debug,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    // STAGE 3: ElevenLabs Scribe (auto-corrects, last resort)
    if (elKey) {
      const r3 = await callElevenLabs(audio, contentType, elKey);
      debug.elevenlabs = { ok: r3.ok };
      if (r3.ok && r3.text) {
        return new Response(
          JSON.stringify({
            text: r3.text,
            engine: "elevenlabs-scribe",
            debug,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    } else {
      debug.elevenlabs = "no-el-key";
    }

    return new Response(
      JSON.stringify({
        error: "All STT engines failed",
        text: "",
        debug,
      }),
      {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e).slice(0, 200), text: "" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

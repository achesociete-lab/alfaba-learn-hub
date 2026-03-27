import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) throw new Error('ELEVENLABS_API_KEY is not configured');

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Authorization required');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) throw new Error('Unauthorized');

    // Get user's vocal profile audio
    const { data: profile } = await supabase
      .from('vocal_profiles')
      .select('reference_audio_url, elevenlabs_voice_id')
      .eq('user_id', user.id)
      .single();

    if (!profile?.reference_audio_url) {
      throw new Error('No vocal profile found. Please record your voice first.');
    }

    // If already cloned, return existing voice ID
    if (profile.elevenlabs_voice_id) {
      return new Response(JSON.stringify({ voiceId: profile.elevenlabs_voice_id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Download the reference audio from storage
    const { data: audioData, error: dlErr } = await supabase.storage
      .from('quran-recordings')
      .download(profile.reference_audio_url);

    if (dlErr || !audioData) throw new Error('Failed to download reference audio');

    // Clone voice via ElevenLabs Instant Voice Cloning API
    const formData = new FormData();
    formData.append('name', `user-${user.id.slice(0, 8)}`);
    formData.append('description', 'Quran recitation voice clone');
    formData.append('files', new File([audioData], 'reference.webm', { type: 'audio/webm' }));

    const cloneRes = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: formData,
    });

    if (!cloneRes.ok) {
      const errBody = await cloneRes.text();
      console.error(`Voice clone error [${cloneRes.status}]: ${errBody}`);
      throw new Error(`Voice cloning failed [${cloneRes.status}]`);
    }

    const { voice_id } = await cloneRes.json();

    // Save voice ID to vocal_profiles
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    await serviceClient
      .from('vocal_profiles')
      .update({ elevenlabs_voice_id: voice_id })
      .eq('user_id', user.id);

    return new Response(JSON.stringify({ voiceId: voice_id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Clone voice error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

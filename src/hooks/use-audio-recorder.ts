import { useState, useRef, useCallback } from "react";

type StartOptions = {
  /** Auto-stop after this many ms of silence (after speech was detected). Set to 0/undefined to disable. */
  silenceTimeoutMs?: number;
  /** RMS threshold below which audio is considered "silence" (0-1). */
  silenceThreshold?: number;
  /** Auto-stop after this many ms if NO speech is ever detected (inactivity cutoff). 0/undefined disables. */
  noSpeechTimeoutMs?: number;
  /** Called when recording stops automatically due to silence. */
  onAutoStop?: () => void;
};

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);

  // VAD refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const vadRafRef = useRef<number | null>(null);
  const silenceStartRef = useRef<number | null>(null);
  const speechDetectedRef = useRef(false);

  const cleanupVad = () => {
    if (vadRafRef.current) cancelAnimationFrame(vadRafRef.current);
    vadRafRef.current = null;
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    silenceStartRef.current = null;
    speechDetectedRef.current = false;
  };

  const startRecording = useCallback(async (opts?: StartOptions | unknown) => {
    const safeOpts: StartOptions =
      opts && typeof opts === "object" && !("nativeEvent" in (opts as object))
        ? (opts as StartOptions)
        : {};
    const { silenceTimeoutMs = 0, silenceThreshold = 0.015, noSpeechTimeoutMs = 0, onAutoStop } = safeOpts;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      setAudioBlob(null);
      setAudioUrl(null);
      setDuration(0);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
        cleanupVad();
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      startTimeRef.current = Date.now();
      timerRef.current = window.setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 500);

      // Voice Activity Detection
      if (silenceTimeoutMs > 0 || noSpeechTimeoutMs > 0) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioCtxRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        source.connect(analyser);
        analyserRef.current = analyser;
        const data = new Uint8Array(analyser.fftSize);
        const recordingStartedAt = Date.now();

        const tick = () => {
          if (!analyserRef.current) return;
          analyser.getByteTimeDomainData(data);
          // Compute RMS
          let sum = 0;
          for (let i = 0; i < data.length; i++) {
            const v = (data[i] - 128) / 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / data.length);

          const now = Date.now();

          // Inactivity cutoff: no speech ever detected within noSpeechTimeoutMs
          if (
            noSpeechTimeoutMs > 0 &&
            !speechDetectedRef.current &&
            now - recordingStartedAt >= noSpeechTimeoutMs
          ) {
            if (mediaRecorderRef.current?.state === "recording") {
              mediaRecorderRef.current.stop();
              setIsRecording(false);
              onAutoStop?.();
            }
            return;
          }

          if (rms > silenceThreshold) {
            speechDetectedRef.current = true;
            silenceStartRef.current = null;
          } else if (speechDetectedRef.current && silenceTimeoutMs > 0) {
            if (silenceStartRef.current === null) {
              silenceStartRef.current = now;
            } else if (now - silenceStartRef.current >= silenceTimeoutMs) {
              // Auto-stop after end of speech
              if (mediaRecorderRef.current?.state === "recording") {
                mediaRecorderRef.current.stop();
                setIsRecording(false);
                onAutoStop?.();
              }
              return;
            }
          }
          vadRafRef.current = requestAnimationFrame(tick);
        };
        vadRafRef.current = requestAnimationFrame(tick);
      }
    } catch (err) {
      console.error("Microphone access denied:", err);
      throw err;
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  const reset = useCallback(() => {
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
  }, []);

  return { isRecording, audioBlob, audioUrl, duration, startRecording, stopRecording, reset };
}

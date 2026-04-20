// Duolingo-style audio feedback using Web Audio API
const audioCtx = () => new (window.AudioContext || (window as any).webkitAudioContext)();

function playNote(
  ctx: AudioContext,
  freq: number,
  start: number,
  duration: number,
  type: OscillatorType = "triangle",
  volume = 0.18
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
  gain.gain.setValueAtTime(0, ctx.currentTime + start);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + duration);
}

// Joyful Duolingo-style "ding-ding" — rising major arpeggio
export function playCorrectSound() {
  try {
    const ctx = audioCtx();
    // C major-ish ascending: C5, E5, G5, C6 — bright, satisfying
    playNote(ctx, 523.25, 0.00, 0.18, "triangle", 0.20); // C5
    playNote(ctx, 659.25, 0.08, 0.18, "triangle", 0.20); // E5
    playNote(ctx, 783.99, 0.16, 0.22, "triangle", 0.22); // G5
    playNote(ctx, 1046.5, 0.24, 0.35, "triangle", 0.24); // C6
    // Sparkle on top
    playNote(ctx, 1568.0, 0.28, 0.25, "sine", 0.10);
  } catch {}
}

// Sad/wrong — descending minor with a soft buzz
export function playWrongSound() {
  try {
    const ctx = audioCtx();
    // Descending: E4 -> C4 -> A3 — short, clearly negative but not harsh
    playNote(ctx, 329.63, 0.00, 0.18, "sawtooth", 0.10); // E4
    playNote(ctx, 261.63, 0.12, 0.20, "sawtooth", 0.10); // C4
    playNote(ctx, 220.00, 0.26, 0.32, "sawtooth", 0.12); // A3
    // Soft low thud
    playNote(ctx, 110.00, 0.00, 0.40, "sine", 0.08);
  } catch {}
}

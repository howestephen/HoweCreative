// Created only by the explicit Sound control. No external audio/service calls
// and no dependency: a generative ambient piece in plain Web Audio.
//
// A slow pad in D major pentatonic, one note every few seconds with a long
// attack and release, a bass note now and then, all through a low-pass tone
// and a synthesised reverb, over a very quiet noise bed. Scroll opens the
// tone and lifts the bed a little; nothing steps or clicks.

// D major pentatonic across three octaves, as MIDI numbers, weighted towards
// the middle register by listing it twice.
export const PAD_NOTES = [50, 52, 54, 57, 59, 62, 64, 66, 69, 71, 62, 64, 66, 69, 71, 74, 76];
export const BASS_NOTES = [38, 45, 50];

export const midiToFrequency = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

// The next note is never the previous one and never more than a fifth away
// from it, so the line drifts rather than leaps. `random` is injectable so
// the choice is testable.
export const pickNote = (notes: number[], previous: number | null, random: () => number) => {
  const candidates = notes.filter((note) => note !== previous && (previous === null || Math.abs(note - previous) <= 7));
  const pool = candidates.length ? candidates : notes.filter((note) => note !== previous);
  return pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
};

// Seconds until the next pad note: between 2.8 and 6.5, closer together as
// scroll energy rises.
export const nextNoteDelay = (energy: number, random: () => number) =>
  (2.8 + random() * 3.7) * (1 - Math.min(1, Math.max(0, energy)) * 0.35);

const impulseResponse = (context: BaseAudioContext, seconds: number, decay: number) => {
  const length = Math.floor(context.sampleRate * seconds);
  const buffer = context.createBuffer(2, length, context.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return buffer;
};

export const createPortraitAudio = async () => {
  const context = new AudioContext();
  const master = context.createGain();
  master.gain.value = 0;
  // Tone shaping shared by every voice, then a dry path and a reverb path.
  const tone = context.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 760;
  tone.Q.value = 0.4;
  const dry = context.createGain();
  dry.gain.value = 0.62;
  const reverb = context.createConvolver();
  reverb.buffer = impulseResponse(context, 4.5, 2.6);
  const wet = context.createGain();
  wet.gain.value = 0.7;
  tone.connect(dry).connect(master);
  tone.connect(reverb).connect(wet).connect(master);
  master.connect(context.destination);

  // The noise bed from the original study, now a texture under the pad.
  const bedFilter = context.createBiquadFilter();
  bedFilter.type = "lowpass";
  bedFilter.frequency.value = 240;
  bedFilter.Q.value = 0.35;
  const bed = context.createGain();
  bed.gain.value = 0.012;
  const buffer = context.createBuffer(2, context.sampleRate * 4, context.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    let previous = 0;
    for (let i = 0; i < data.length; i++) {
      previous = (previous + (Math.random() * 2 - 1) * 0.02) / 1.02;
      data[i] = previous * 3.5;
    }
  }
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.connect(bedFilter).connect(bed).connect(tone);
  source.start();

  let previousNote: number | null = null;
  let energy = 0;
  let timer = 0;
  let bassCountdown = 2;
  let closed = false;

  const voice = (midi: number, peak: number, attack: number, hold: number, release: number, detune: number) => {
    const now = context.currentTime;
    const envelope = context.createGain();
    envelope.gain.setValueAtTime(0.0001, now);
    envelope.gain.exponentialRampToValueAtTime(peak, now + attack);
    envelope.gain.setValueAtTime(peak, now + attack + hold);
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + attack + hold + release);
    envelope.connect(tone);
    const frequency = midiToFrequency(midi);
    const oscillators = [
      { type: "sine" as OscillatorType, cents: -detune, level: 1 },
      { type: "triangle" as OscillatorType, cents: detune, level: 0.45 },
    ].map(({ type, cents, level }) => {
      const oscillator = context.createOscillator();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      oscillator.detune.value = cents;
      const trim = context.createGain();
      trim.gain.value = level;
      oscillator.connect(trim).connect(envelope);
      oscillator.start(now);
      oscillator.stop(now + attack + hold + release + 0.1);
      return oscillator;
    });
    for (const oscillator of oscillators) oscillator.onended = () => { envelope.disconnect(); };
  };

  const schedule = () => {
    window.clearTimeout(timer);
    timer = 0;
    if (closed || context.state !== "running") return;
    previousNote = pickNote(PAD_NOTES, previousNote, Math.random);
    voice(previousNote, 0.07 + Math.random() * 0.03, 2.4 + Math.random() * 1.6, 0.8 + Math.random() * 1.2, 5 + Math.random() * 2.5, 4 + Math.random() * 3);
    if (--bassCountdown <= 0) {
      bassCountdown = 3 + Math.floor(Math.random() * 3);
      voice(BASS_NOTES[Math.floor(Math.random() * BASS_NOTES.length)], 0.05, 3.5, 2, 7, 2);
    }
    timer = window.setTimeout(schedule, nextNoteDelay(energy, Math.random) * 1000);
  };

  try { await context.resume(); } catch (error) { await context.close(); throw error; }
  schedule();
  return {
    update: (release: number, speed: number, muted: boolean) => {
      if (context.state !== "running") return;
      const t = context.currentTime;
      energy = Math.min(1, Math.max(0, speed));
      master.gain.setTargetAtTime(muted ? 0 : 0.55 + release * 0.15, t, 0.25);
      tone.frequency.setTargetAtTime(680 + release * 520 + energy * 900, t, 0.3);
      bed.gain.setTargetAtTime(0.012 + energy * 0.04, t, 0.3);
    },
    suspend: async () => { window.clearTimeout(timer); timer = 0; await context.suspend(); },
    // The component resumes a freshly created engine as well as a suspended
    // one; only restart the line when nothing is already scheduled.
    resume: async () => { await context.resume(); if (!timer) schedule(); },
    close: async () => { closed = true; window.clearTimeout(timer); timer = 0; await context.close(); },
  };
};
export type PortraitAudio = Awaited<ReturnType<typeof createPortraitAudio>>;

// Created only by the explicit Sound control. No external audio/service calls.
export const createPortraitAudio = async () => {
  const context = new AudioContext();
  const gain = context.createGain();
  gain.gain.value = 0;
  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 240;
  filter.Q.value = 0.35;
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
  source.connect(filter).connect(gain).connect(context.destination);
  source.start();
  try { await context.resume(); } catch (error) { await context.close(); throw error; }
  return {
    update: (release: number, speed: number, muted: boolean) => {
      if (context.state !== "running") return;
      const t = context.currentTime;
      const energy = Math.min(1, Math.max(0, speed));
      // It settles almost to silence at rest. No sharp attacks or pitch steps.
      gain.gain.setTargetAtTime(muted ? 0 : (0.004 + energy * 0.055) * (0.3 + release * 0.7), t, 0.18);
      filter.frequency.setTargetAtTime(170 + release * 380 + energy * 900, t, 0.22);
    },
    suspend: () => context.suspend(),
    resume: () => context.resume(),
    close: () => context.close(),
  };
};
export type PortraitAudio = Awaited<ReturnType<typeof createPortraitAudio>>;

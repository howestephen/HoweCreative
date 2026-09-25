import { describe, expect, it } from "vitest";
import { BASS_NOTES, midiToFrequency, nextNoteDelay, PAD_NOTES, pickNote } from "./portrait-audio";

describe("generative portrait music", () => {
  it("tunes to concert pitch and keeps every note in D major pentatonic", () => {
    expect(midiToFrequency(69)).toBe(440);
    expect(midiToFrequency(57)).toBeCloseTo(220, 9);
    const pentatonic = new Set([2, 4, 6, 9, 11]); // D E F# A B as pitch classes
    for (const note of [...PAD_NOTES, ...BASS_NOTES]) expect(pentatonic.has(note % 12)).toBe(true);
  });

  it("never repeats a note and never leaps more than a fifth, for any random draw", () => {
    let previous: number | null = null;
    for (let i = 0; i < 400; i++) {
      const draw = ((i * 7919) % 1000) / 1000;
      const note = pickNote(PAD_NOTES, previous, () => draw);
      expect(PAD_NOTES).toContain(note);
      expect(note).not.toBe(previous);
      if (previous !== null) expect(Math.abs(note - previous)).toBeLessThanOrEqual(7);
      previous = note;
    }
    // A draw of exactly 1 still lands on a note.
    expect(PAD_NOTES).toContain(pickNote(PAD_NOTES, 62, () => 1));
  });

  it("spaces notes between 1.8 and 6.5 seconds, closer as scroll energy rises", () => {
    for (const draw of [0, 0.5, 1]) {
      const still = nextNoteDelay(0, () => draw);
      const moving = nextNoteDelay(1, () => draw);
      expect(still).toBeGreaterThanOrEqual(2.8);
      expect(still).toBeLessThanOrEqual(6.5);
      expect(moving).toBeLessThan(still);
      expect(moving).toBeGreaterThanOrEqual(1.8);
    }
    expect(nextNoteDelay(5, () => 0.5)).toBe(nextNoteDelay(1, () => 0.5));
  });
});

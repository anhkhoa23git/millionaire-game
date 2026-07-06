// Central audio system.
// SFX are synthesized with Web Audio (no asset files needed); music tracks
// play the existing files in /public. Swap a synth for a real file later by
// changing only this module — callers just use sfx("name") / music("name").

export type SfxName =
  | "buttonClick"
  | "answerSelect"
  | "finalAnswer"
  | "suspense"
  | "correct"
  | "wrong"
  | "timerTick"
  | "timerWarning"
  | "lifeline";

export type MusicName = "contestant" | "ladder" | "safeHaven";

const MUSIC_FILES: Record<MusicName, string> = {
  contestant: "/contestant.mp3",
  ladder: "/ladder1.mp3",
  safeHaven: "/safe-haven-3.ogg",
};

interface ToneStep {
  freq: number;        // Hz
  start: number;       // seconds from now
  duration: number;    // seconds
  type: OscillatorType;
  gain: number;        // peak gain 0..1
  glideTo?: number;    // optional frequency glide target
}

class AudioManager {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private currentMusic: HTMLAudioElement | null = null;
  private suspenseNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
  private sfxVolume = 0.7;
  private musicVolume = 0.6;

  // Must be called from a user gesture at least once (autoplay policy).
  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  setSfxVolume(v: number) {
    this.sfxVolume = Math.max(0, Math.min(1, v));
    if (this.sfxGain) this.sfxGain.gain.value = this.sfxVolume;
  }

  setMusicVolume(v: number) {
    this.musicVolume = Math.max(0, Math.min(1, v));
    if (this.currentMusic) this.currentMusic.volume = this.musicVolume;
  }

  private playTones(steps: ToneStep[]) {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime;
    for (const s of steps) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = s.type;
      osc.frequency.setValueAtTime(s.freq, now + s.start);
      if (s.glideTo !== undefined) {
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(1, s.glideTo),
          now + s.start + s.duration
        );
      }
      // Quick attack, exponential release envelope
      gain.gain.setValueAtTime(0, now + s.start);
      gain.gain.linearRampToValueAtTime(s.gain, now + s.start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + s.start + s.duration);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + s.start);
      osc.stop(now + s.start + s.duration + 0.05);
    }
  }

  sfx(name: SfxName) {
    switch (name) {
      case "buttonClick":
        this.playTones([
          { freq: 600, start: 0, duration: 0.06, type: "square", gain: 0.15 },
        ]);
        break;
      case "answerSelect":
        this.playTones([
          { freq: 440, start: 0, duration: 0.08, type: "triangle", gain: 0.3 },
          { freq: 660, start: 0.06, duration: 0.1, type: "triangle", gain: 0.25 },
        ]);
        break;
      case "finalAnswer":
        // Low drum-like hit
        this.playTones([
          { freq: 150, start: 0, duration: 0.4, type: "sine", gain: 0.6, glideTo: 40 },
          { freq: 80, start: 0.02, duration: 0.5, type: "triangle", gain: 0.4, glideTo: 30 },
        ]);
        break;
      case "correct":
        // Ascending chime
        this.playTones([
          { freq: 523.25, start: 0, duration: 0.15, type: "sine", gain: 0.4 },   // C5
          { freq: 659.25, start: 0.12, duration: 0.15, type: "sine", gain: 0.4 }, // E5
          { freq: 783.99, start: 0.24, duration: 0.3, type: "sine", gain: 0.45 }, // G5
          { freq: 1046.5, start: 0.36, duration: 0.5, type: "sine", gain: 0.4 },  // C6
        ]);
        break;
      case "wrong":
        // Dissonant descending buzz
        this.playTones([
          { freq: 220, start: 0, duration: 0.6, type: "sawtooth", gain: 0.35, glideTo: 110 },
          { freq: 233, start: 0, duration: 0.6, type: "sawtooth", gain: 0.3, glideTo: 116 },
        ]);
        break;
      case "timerTick":
        this.playTones([
          { freq: 880, start: 0, duration: 0.05, type: "square", gain: 0.12 },
        ]);
        break;
      case "timerWarning":
        this.playTones([
          { freq: 880, start: 0, duration: 0.1, type: "square", gain: 0.25 },
          { freq: 880, start: 0.15, duration: 0.1, type: "square", gain: 0.25 },
        ]);
        break;
      case "lifeline":
        // Rising whoosh
        this.playTones([
          { freq: 200, start: 0, duration: 0.35, type: "sine", gain: 0.35, glideTo: 900 },
        ]);
        break;
      case "suspense":
        this.startSuspense();
        break;
    }
  }

  // Low pulsing drone that builds tension until stopSuspense()
  private startSuspense() {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;
    this.stopSuspense();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(65, now);
    osc.frequency.linearRampToValueAtTime(98, now + 4);

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(4, now);
    lfo.frequency.linearRampToValueAtTime(8, now + 4); // heartbeat quickens
    lfoGain.gain.value = 0.12;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.5);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    lfo.start(now);
    this.suspenseNodes = [
      { osc, gain },
      { osc: lfo, gain: lfoGain },
    ];
  }

  stopSuspense() {
    const ctx = this.ctx;
    for (const { osc, gain } of this.suspenseNodes) {
      try {
        if (ctx) {
          gain.gain.cancelScheduledValues(ctx.currentTime);
          gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
        }
        osc.stop(ctx ? ctx.currentTime + 0.25 : undefined);
      } catch {
        // already stopped
      }
    }
    this.suspenseNodes = [];
  }

  music(name: MusicName, { loop = false }: { loop?: boolean } = {}) {
    if (typeof window === "undefined") return;
    this.stopMusic();
    const audio = new Audio(MUSIC_FILES[name]);
    audio.volume = this.musicVolume;
    audio.loop = loop;
    audio.play().catch((err) => console.warn("Music play failed:", err));
    this.currentMusic = audio;
  }

  stopMusic() {
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic = null;
    }
  }

  stopAll() {
    this.stopMusic();
    this.stopSuspense();
  }
}

// Singleton — client-only module state
export const audioManager = new AudioManager();

export class AudioManager {
  constructor(audio, settings = {}) {
    this.audio = audio;
    this.volume = settings.volume ?? 0.22;
    this.fadeMs = settings.fadeMs ?? 500;
    this.muted = false;
    this.operation = 0;
    this.audio.volume = 0;
  }

  async fade(target, { play = false, pause = false } = {}) {
    const operation = ++this.operation;
    if (play && !this.muted) await this.audio.play().catch(() => {});
    const start = this.audio.volume;
    const steps = Math.max(1, Math.round(this.fadeMs / 25));
    for (let step = 1; step <= steps; step += 1) {
      if (operation !== this.operation) return false;
      this.audio.volume = start + (target - start) * (step / steps);
      await new Promise(resolve => setTimeout(resolve, this.fadeMs / steps));
    }
    if (operation !== this.operation) return false;
    if (pause) this.audio.pause();
    return true;
  }

  fadeIn() {
    return this.fade(this.muted ? 0 : this.volume, { play: true });
  }

  fadeOutAndPause() {
    return this.fade(0, { pause: true });
  }

  pause() {
    this.operation += 1;
    this.audio.pause();
  }

  setMuted(muted) {
    this.muted = muted;
    this.audio.muted = muted;
  }
}

const VIDEO_TYPE = 'video';

export class PlaylistEngine {
  constructor({ playlist, settings, activate, scheduler = globalThis, random = Math.random }) {
    this.playlist = playlist;
    this.settings = settings;
    this.activate = activate;
    this.scheduler = scheduler;
    this.random = random;
    this.index = -1;
    this.timer = null;
    this.timerStartedAt = 0;
    this.remainingMs = 0;
    this.controller = null;
    this.paused = false;
    this.transitioning = false;
    this.runId = 0;
    this.pendingAdvance = false;
  }

  isVideo(item = this.currentItem) {
    return item?.type === VIDEO_TYPE;
  }

  get currentItem() {
    return this.playlist[this.index];
  }

  shuffleFollowingQuotes() {
    if (!this.currentItem?.shuffleFollowingQuotes) return;
    let end = this.index + 1;
    while (this.playlist[end]?.type === 'quote') end += 1;
    for (let cursor = end - 1; cursor > this.index + 1; cursor -= 1) {
      const target = this.index + 1 + Math.floor(this.random() * (cursor - this.index));
      [this.playlist[cursor], this.playlist[target]] = [this.playlist[target], this.playlist[cursor]];
    }
  }

  clearTimer() {
    if (this.timer !== null) this.scheduler.clearTimeout(this.timer);
    this.timer = null;
  }

  schedule(ms) {
    if (this.isVideo() || this.paused) return;
    this.clearTimer();
    this.remainingMs = ms;
    this.timerStartedAt = Date.now();
    this.timer = this.scheduler.setTimeout(() => this.next(), ms);
  }

  async start() {
    return this.goTo(0);
  }

  async goTo(target, direction = 1) {
    if (this.transitioning || this.playlist.length === 0) return false;
    if (target >= this.playlist.length && this.settings.loop === false) {
      this.clearTimer();
      return false;
    }
    this.transitioning = true;
    this.clearTimer();
    const runId = ++this.runId;
    await this.controller?.dispose?.();
    this.controller = null;
    this.index = ((target % this.playlist.length) + this.playlist.length) % this.playlist.length;
    this.shuffleFollowingQuotes();
    const item = this.currentItem;
    const complete = () => {
      if (runId !== this.runId || this.paused) return;
      if (this.transitioning) this.pendingAdvance = true;
      else this.next();
    };
    try {
      this.controller = await this.activate(item, this.index, { complete, direction });
      if (runId !== this.runId) return false;
      if (this.paused) this.controller?.pause?.();
      if (!this.isVideo(item)) {
        const duration = Number(item.duration ?? this.settings.defaultDuration) * 1000;
        this.schedule(duration);
      }
      return true;
    } finally {
      this.transitioning = false;
      if (this.pendingAdvance && runId === this.runId && !this.paused) {
        this.pendingAdvance = false;
        queueMicrotask(() => this.next());
      }
    }
  }

  next() {
    return this.goTo(this.index + 1, 1);
  }

  previous() {
    return this.goTo(this.index - 1, -1);
  }

  pause() {
    if (this.paused) return;
    this.paused = true;
    if (this.timer !== null) {
      this.remainingMs = Math.max(0, this.remainingMs - (Date.now() - this.timerStartedAt));
    }
    this.clearTimer();
    this.controller?.pause?.();
  }

  resume() {
    if (!this.paused) return;
    this.paused = false;
    this.controller?.resume?.();
    if (!this.isVideo()) this.schedule(this.remainingMs || 1);
  }

  async destroy() {
    this.runId += 1;
    this.clearTimer();
    await this.controller?.dispose?.();
    this.controller = null;
  }
}

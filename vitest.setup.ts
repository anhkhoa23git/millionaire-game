import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement these; stub so audio-dependent components mount.
if (typeof window !== "undefined") {
  window.HTMLMediaElement.prototype.play = () => Promise.resolve();
  window.HTMLMediaElement.prototype.pause = () => {};
  // AudioContext may be undefined in jsdom — audioManager guards on it.
}

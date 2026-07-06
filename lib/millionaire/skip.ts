// Central skip system.
//
// Each screen registers ONE handler for the segment currently playing
// (intro video, ladder animation, result reveal...). Space / the Skip
// button triggers it. Semantics:
//   - One-shot: the handler is consumed on trigger — holding Space cannot
//     re-skip the same segment.
//   - Cooldown: consecutive triggers within COOLDOWN_MS are ignored, so
//     mashing Space cannot blow through multiple chained segments.
//   - Registering returns an unregister function; it only clears the store
//     if the handler is still the active one (safe across screen changes).

import { useSyncExternalStore } from "react";

type SkipHandler = () => void;

const COOLDOWN_MS = 400;

let handler: SkipHandler | null = null;
let lastTriggerAt = 0;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function setSkipHandler(h: SkipHandler): () => void {
  handler = h;
  emit();
  return () => {
    if (handler === h) {
      handler = null;
      emit();
    }
  };
}

export function triggerSkip(): boolean {
  if (!handler) return false;
  const now = Date.now();
  if (now - lastTriggerAt < COOLDOWN_MS) return false;
  lastTriggerAt = now;
  const h = handler;
  handler = null; // consume BEFORE invoking — repeat presses are no-ops
  emit();
  h();
  return true;
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

const getSnapshot = () => handler !== null;
const getServerSnapshot = () => false;

// Reactive "is anything skippable right now?" for the Skip button/hint UI
export function useCanSkip(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

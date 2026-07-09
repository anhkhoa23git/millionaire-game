"use client";

import { useEffect } from "react";
import { useCanSkip, triggerSkip } from "@/lib/millionaire/skip";

// Global skip UI: Space key listener + corner button + bottom hint.
// Rendered once inside the stage (page.tsx); visible only while some
// screen has a skippable segment registered.
export function SkipControls() {
  const canSkip = useCanSkip();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      // Space inside text fields must type a space, never skip
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (triggerSkip()) {
        e.preventDefault(); // keep Space from scrolling / re-clicking focused buttons
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!canSkip) return null;

  return (
    <>
      {/* Corner skip button — bottom right (ReturnButton owns bottom left) */}
      <button
        type="button"
        onClick={() => triggerSkip()}
        className="absolute z-50 tracking-widest transition-all hover:scale-105 active:scale-95"
        style={{
          bottom: "clamp(12px, 3cqh, 24px)",
          right: "clamp(12px, 2cqw, 24px)",
          minHeight: "40px",
          padding: "0.5em 1.1em",
          fontSize: "clamp(12px, 1.2cqw, 14px)",
          color: "rgba(255,255,255,0.75)",
          background: "rgba(10, 25, 41, 0.7)",
          border: "1px solid rgba(212,175,55,0.5)",
          borderRadius: "8px",
          backdropFilter: "blur(6px)",
          animation: "fade-in 0.3s ease-out",
        }}
      >
        SKIP ▸
      </button>

      {/* Bottom-center hint */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-50 pointer-events-none tracking-widest"
        style={{
          bottom: "4px",
          fontSize: "clamp(9px, 1cqw, 12px)",
          color: "rgba(255,255,255,0.45)",
          textShadow: "0 1px 3px rgba(0,0,0,0.8)",
          animation: "fade-in 0.3s ease-out",
          whiteSpace: "nowrap",
        }}
      >
        Nhấn Space để bỏ qua
      </div>
    </>
  );
}

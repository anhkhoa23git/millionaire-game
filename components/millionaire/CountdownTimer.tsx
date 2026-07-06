"use client";

import { useState, useEffect, useRef } from "react";
import { audioManager } from "@/lib/millionaire/audio";

interface CountdownTimerProps {
  totalSeconds: number;
  running: boolean;        // pause while modals/reveal are active
  onTimeout: () => void;
}

const WARNING_AT = 10;

export function CountdownTimer({ totalSeconds, running, onTimeout }: CountdownTimerProps) {
  // GameplayScreen remounts this component every question (key={currentLevel}),
  // so initializing from the prop is enough — no reset effect needed
  const [remaining, setRemaining] = useState(totalSeconds);
  const timeoutFired = useRef(false);

  useEffect(() => {
    if (!running || timeoutFired.current) return;
    const interval = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1;
        if (next <= WARNING_AT && next > 0) {
          audioManager.sfx("timerTick");
        }
        if (next <= 0 && !timeoutFired.current) {
          timeoutFired.current = true;
          audioManager.sfx("timerWarning");
          // Defer so we don't call parent state updates mid-render
          setTimeout(onTimeout, 0);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, onTimeout]);

  const isWarning = remaining <= WARNING_AT;
  const ratio = totalSeconds > 0 ? remaining / totalSeconds : 0;

  // SVG ring geometry — drawn in a fixed 92×92 viewBox, scaled by the
  // fluid wrapper size so it shrinks with the stage
  const size = 92;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: "clamp(56px, 7.5cqw, 92px)", height: "clamp(56px, 7.5cqw, 92px)" }}
    >
      <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%" style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="rgba(1,29,84,0.85)"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={isWarning ? "#D0021B" : "#D4AF37"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
        />
      </svg>
      <span
        className="absolute font-black"
        style={{
          fontFamily: "Arial, sans-serif",
          fontSize: "clamp(17px, 2.3cqw, 28px)",
          color: isWarning ? "#D0021B" : "#FFFFFF",
          textShadow: "0 2px 6px rgba(0,0,0,0.8)",
          animation: isWarning && running ? "timer-flash 1s ease-in-out infinite" : "none",
        }}
      >
        {remaining}
      </span>
    </div>
  );
}

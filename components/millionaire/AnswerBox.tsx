"use client";

import { AnswerState } from "@/lib/millionaire/state";

interface AnswerBoxProps {
  letter: "A" | "B" | "C" | "D";
  text: string;
  state: AnswerState;
  index: number;
  onClick?: () => void;
}

const STATE_STYLES: Record<AnswerState, { bg: string; border: string; letterColor: string; textColor: string; animation: string }> = {
  default:  { bg: "#011D54", border: "#FFFFFF", letterColor: "#FFA500", textColor: "#FFFFFF", animation: "" },
  hover:    { bg: "#022264", border: "#FFFFFF", letterColor: "#FFA500", textColor: "#FFFFFF", animation: "" },
  selected: { bg: "#F38D05", border: "#FFFFFF", letterColor: "#FFFFFF", textColor: "#000000", animation: "answer-pulse 1.2s ease-in-out infinite" },
  correct:  { bg: "#4FAE1A", border: "#FFFFFF", letterColor: "#FFFFFF", textColor: "#000000", animation: "answer-glow 0.6s ease-out" },
  wrong:    { bg: "#D0021B", border: "#FFFFFF", letterColor: "#FFFFFF", textColor: "#000000", animation: "answer-shake 0.4s ease-out" },
  disabled: { bg: "#3A3A3A", border: "#666666", letterColor: "#666666", textColor: "#666666", animation: "" },
};

export function AnswerBox({ letter, text, state, onClick }: AnswerBoxProps) {
  const s = STATE_STYLES[state];
  const isInteractive = state === "default" || state === "hover";

  return (
    <button
      type="button"
      disabled={!isInteractive}
      onClick={onClick}
      className="answer-box group relative flex items-center rounded-lg transition-all duration-200"
      style={{
        width: "100%",
        minHeight: "clamp(52px, 12cqh, 120px)",
        gap: "clamp(8px, 1.2cqw, 16px)",
        background: s.bg,
        border: `2px solid ${s.border}`,
        padding: "clamp(8px, 1.2cqh, 15px) clamp(12px, 2cqw, 25px)",
        cursor: isInteractive ? "pointer" : "default",
        animation: s.animation,
        boxShadow: state === "correct"
          ? "0 0 30px rgba(79,174,26,0.7), 0 0 60px rgba(79,174,26,0.4)"
          : state === "selected"
          ? "0 0 20px rgba(243,141,5,0.5)"
          : "0 4px 12px rgba(0,0,0,0.4)",
      }}
    >
      {/* Letter */}
      <span
        className="font-black flex-shrink-0"
        style={{
          color: s.letterColor,
          fontFamily: "Arial, sans-serif",
          fontSize: "clamp(18px, 2.8cqw, 36px)",
          minWidth: "clamp(24px, 3cqw, 40px)",
          textAlign: "center",
        }}
      >
        {letter}
      </span>

      {/* Separator dot */}
      <span
        className="font-bold flex-shrink-0"
        style={{ color: s.letterColor, fontSize: "clamp(14px, 1.9cqw, 24px)" }}
      >
        :
      </span>

      {/* Answer text */}
      <span
        className="font-medium flex-1 text-left"
        style={{
          color: s.textColor,
          fontFamily: "Arial, sans-serif",
          fontSize: "clamp(14px, 1.9cqw, 24px)",
          lineHeight: 1.3,
          textDecoration: state === "disabled" ? "line-through" : "none",
          opacity: state === "disabled" ? 0.6 : 1,
        }}
      >
        {text}
      </span>
    </button>
  );
}

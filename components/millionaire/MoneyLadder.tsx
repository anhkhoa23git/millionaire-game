"use client";

import { formatMoney } from "@/lib/millionaire/questions";
import { PrizeStep } from "@/lib/millionaire/prize";

interface MoneyLadderProps {
  ladder: PrizeStep[];         // full prize ladder, index 0 = question 1
  currentLevel: number;        // the question currently being played
  finalLevel: number;          // highest level reached (for highlight when walked away)
  height?: number;             // total height in pixels
  width?: number;
}

export function MoneyLadder({
  ladder,
  currentLevel,
  height = 840,
  width = 280,
}: MoneyLadderProps) {
  const rowH = Math.floor(height / Math.max(ladder.length, 1));
  // Display top-to-bottom: highest prize first
  const rows = [...ladder].reverse();

  return (
    <div
      className="money-ladder flex flex-col rounded-md overflow-hidden border border-[#D4AF37]/30"
      style={{
        width,
        height,
        background: "#001847",
        boxShadow: "0 0 20px rgba(0,0,0,0.5) inset",
      }}
    >
      {rows.map(({ level, amount, safe }) => {
        const isCurrent = level === currentLevel;
        const isPast = level < currentLevel;

        let bg = "#001847";        // default unselected
        if (isCurrent) bg = "#022264";  // current highlight (blue brighter)
        else if (safe) bg = "#012455";  // safe haven slight tint
        else if (isPast) bg = "#00102E"; // past — darker

        return (
          <div
            key={level}
            className={`money-row flex items-center justify-between px-3 transition-all duration-500 ${
              isCurrent ? "ladder-row-current" : ""
            }`}
            style={{
              height: rowH,
              background: bg,
              borderBottom: "1px solid rgba(212,175,55,0.15)",
              borderLeft: safe ? "4px solid #D4AF37" : "4px solid transparent",
              opacity: isPast ? 0.55 : 1,
            }}
          >
            <span
              className="text-[14px] font-bold tracking-wider"
              style={{ color: isCurrent ? "#FFFFFF" : "#C0C0C0", fontFamily: "Arial, sans-serif" }}
            >
              {level}
            </span>
            <span
              className="text-[16px] font-bold"
              style={{
                color: isCurrent ? "#FFFFFF" : safe ? "#D4AF37" : "#FFFFFF",
                fontFamily: "Arial, sans-serif",
                textShadow: isCurrent ? "0 0 8px rgba(212,175,55,0.6)" : "none",
              }}
            >
              {formatMoney(amount)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

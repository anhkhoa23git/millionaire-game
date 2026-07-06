"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ContestantInfo } from "@/lib/millionaire/state";
import { setSkipHandler } from "@/lib/millionaire/skip";
import { formatMoney } from "@/lib/millionaire/questions";
import { PrizeStep } from "@/lib/millionaire/prize";
import { LIFELINES } from "@/lib/millionaire/lifelines";
import { audioManager } from "@/lib/millionaire/audio";

interface IntroductionScreenProps {
  contestant: ContestantInfo;
  ladder: PrizeStep[];
  onContinue: () => void;
}

export function IntroductionScreen({ ladder, onContinue }: IntroductionScreenProps) {
  const [highlightLevel, setHighlightLevel] = useState(0);
  const [visibleLifelines, setVisibleLifelines] = useState<number>(0);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [pausedSafeHavens, setPausedSafeHavens] = useState<Set<number>>(new Set());
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  const totalLevels = ladder.length;

  useEffect(() => {
    const schedule = (fn: () => void, ms: number) => {
      timeouts.current.push(setTimeout(fn, ms));
    };

    audioManager.music("ladder");

    // After 3s, climb the ladder bottom-to-top, pausing at safe havens,
    // then reveal lifelines one by one.
    schedule(() => {
      let level = 1;
      const highlightNext = () => {
        setHighlightLevel(level);
        const step = ladder[level - 1];
        const isSafe = step?.safe ?? false;
        if (isSafe) {
          setPausedSafeHavens((prev) => new Set(prev).add(level));
        }
        schedule(() => {
          level++;
          if (level <= totalLevels) {
            highlightNext();
          } else {
            schedule(() => {
              let count = 0;
              const showNext = () => {
                setVisibleLifelines(count + 1);
                count++;
                if (count < LIFELINES.length) {
                  schedule(showNext, 1500);
                } else {
                  schedule(() => setAnimationComplete(true), 1500);
                }
              };
              showNext();
            }, 3000); // pause before lifelines
          }
        }, isSafe ? 2000 : 400);
      };
      highlightNext();
    }, 3000);

    const pending = timeouts.current;
    return () => {
      pending.forEach(clearTimeout);
      timeouts.current = [];
    };
  }, [ladder, totalLevels]);

  // Fast-forward the ladder animation: cancel pending steps, silence the
  // music, and jump straight to the finished state (row transitions are
  // 0.3s so the jump still eases in, no hard cut).
  const fastForward = useCallback(() => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    audioManager.stopMusic();
    setHighlightLevel(totalLevels);
    setPausedSafeHavens(new Set(ladder.filter((s) => s.safe).map((s) => s.level)));
    setVisibleLifelines(LIFELINES.length);
    setAnimationComplete(true);
  }, [ladder, totalLevels]);

  // Two skip segments on this screen: (1) the running animation,
  // (2) once finished, the "click to start" wait
  useEffect(() => {
    return setSkipHandler(animationComplete ? onContinue : fastForward);
  }, [animationComplete, fastForward, onContinue]);

  // Row height shrinks when the set is long so the ladder always fits
  const rowHeight = Math.min(48, Math.floor(560 / Math.max(totalLevels, 1)));

  return (
    <div
      className="introduction-screen relative w-full h-full overflow-hidden flex flex-col items-center justify-center cursor-pointer"
      onClick={animationComplete ? onContinue : undefined}
      style={{
        backgroundImage: "url('/background-reversemain.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Logo top-center */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
        <img
          src="/icons/Main Logo Cropped.png"
          alt="Who Wants to Be a Millionaire"
          style={{
            width: "200px",
            height: "auto",
            filter: "drop-shadow(0 0 20px rgba(212,175,55,0.5))",
          }}
        />
      </div>

      {/* Lifelines top-left */}
      {visibleLifelines > 0 && (
        <div
          className="absolute z-30"
          style={{
            top: "42px",
            left: "42px",
          }}
        >
          <div className="flex gap-4">
            {LIFELINES.map((lifeline, idx) => (
              <div
                key={lifeline.id}
                className="lifeline"
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  background: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  opacity: idx < visibleLifelines ? 1 : 0,
                  transition: "opacity 0.5s ease-out",
                }}
              >
                <img
                  src={lifeline.icon}
                  alt={lifeline.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Money Ladder with highlight animation */}
      <div
        className="absolute right-8 top-1/2 -translate-y-1/2 z-20"
        style={{
          animation: "slide-in-right 0.8s ease-out",
          width: "min(72cqw, 380px)",
          maxHeight: "85cqh",
          background: "linear-gradient(to bottom, #0a1f3f 0%, #001529 100%)",
          boxShadow: "inset 0 0 60px rgba(0, 21, 41, 0.8), 0 0 40px rgba(212, 175, 55, 0.3)",
          border: "2px solid #d4af37",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div
          className="text-center mb-3 text-[#D4AF37] font-bold text-[16px] tracking-widest"
          style={{ fontFamily: "Arial, sans-serif" }}
        >
          PRIZE LADDER
        </div>
        <div className="relative">
          {[...ladder].reverse().map((item) => (
            <div
              key={item.level}
              className="money-row relative"
              style={{
                height: `${rowHeight}px`,
                background: item.level === highlightLevel ? "#D4AF37" : "#001847",
                display: "flex",
                alignItems: "center",
                padding: "0 15px",
                transition: "all 0.3s ease-out",
                borderTop: item.level === highlightLevel ? "2px solid #FFA500" : "none",
                borderRight: item.level === highlightLevel ? "2px solid #FFA500" : "none",
                borderBottom: item.level === highlightLevel ? "2px solid #FFA500" : "1px solid rgba(255,255,255,0.1)",
                borderLeft:
                  item.level === highlightLevel
                    ? "2px solid #FFA500"
                    : item.safe
                    ? "4px solid #D4AF37"
                    : "none",
                boxShadow: item.level === highlightLevel ? "0 0 20px rgba(212,175,55,0.8)" : "none",
              }}
            >
              <span
                className="font-bold"
                style={{
                  fontSize: "16px",
                  color: item.level === highlightLevel ? "#000000" : "#C0C0C0",
                  minWidth: "35px",
                  fontFamily: "Arial, sans-serif",
                }}
              >
                {item.level}
              </span>
              <span
                className="font-bold ml-auto"
                style={{
                  fontSize: rowHeight < 40 ? "16px" : "20px",
                  color: pausedSafeHavens.has(item.level)
                    ? "#FFFAF0" // Ivory white for paused safe havens
                    : "#D4AF37", // Golden for all other levels
                  fontFamily: "Arial, sans-serif",
                }}
              >
                {formatMoney(item.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Click hint */}
      {animationComplete && (
        <div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/60 text-[14px] tracking-widest"
          style={{
            fontFamily: "Arial, sans-serif",
            animation: "fade-in 0.8s ease-out",
          }}
        >
          CLICK TO START
        </div>
      )}

      <style>{`
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

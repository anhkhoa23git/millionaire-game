"use client";

import { useState, useEffect } from "react";
import { MillionaireLogo } from "./MillionaireLogo";
import { ContestantInfo } from "@/lib/millionaire/state";
import { MONEY_LADDER, formatMoney } from "@/lib/millionaire/questions";
import { LIFELINES } from "@/lib/millionaire/lifelines";

interface IntroductionScreenProps {
  contestant: ContestantInfo;
  onContinue: () => void;
}

export function IntroductionScreen({ contestant, onContinue }: IntroductionScreenProps) {
  const [showName, setShowName] = useState(false);
  const [showMoneyLadder, setShowMoneyLadder] = useState(false);
  const [highlightLevel, setHighlightLevel] = useState(0);
  const [visibleLifelines, setVisibleLifelines] = useState<number>(0);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [pausedSafeHavens, setPausedSafeHavens] = useState<Set<number>>(new Set());
  const [ladderAudio] = useState(() => {
    if (typeof window !== "undefined") {
      const audio = new Audio("/ladder1.mp3");
      audio.volume = 0.6;
      return audio;
    }
    return null;
  });

  useEffect(() => {
    // Sequence:
    // Show screen immediately
    setShowMoneyLadder(true);
    
    // 2s: Start highlight animation from bottom to top with pause at safe havens
    const t3 = setTimeout(() => {
      let level = 1;
      const highlightNext = () => {
        setHighlightLevel(level);
        
        // Check if current level is a safe haven (3, 6, 9)
        if (level === 3 || level === 6 || level === 9) {
          // Mark as paused safe haven
          setPausedSafeHavens(prev => new Set(prev).add(level));
          // Pause for 2s at safe haven
          setTimeout(() => {
            level++;
            if (level <= 9) {
              highlightNext();
            } else {
              // Show lifelines one by one
              setTimeout(() => {
                let count = 0;
                const showNext = () => {
                  setVisibleLifelines(count + 1);
                  count++;
                  if (count < LIFELINES.length) {
                    setTimeout(showNext, 1500); // 1.5s between each lifeline
                  } else {
                    setTimeout(() => {
                      setAnimationComplete(true);
                    }, 1500); // 1.5s pause after last lifeline
                  }
                };
                showNext();
              }, 3000); // 3s pause before lifelines
            }
          }, 2000); // 2s pause at safe haven
        } else {
          // Normal speed for non-safe levels (slower)
          setTimeout(() => {
            level++;
            if (level <= 9) {
              highlightNext();
            } else {
              // Show lifelines one by one
              setTimeout(() => {
                let count = 0;
                const showNext = () => {
                  setVisibleLifelines(count + 1);
                  count++;
                  if (count < LIFELINES.length) {
                    setTimeout(showNext, 1500); // 1.5s between each lifeline
                  } else {
                    setTimeout(() => {
                      setAnimationComplete(true);
                    }, 1500); // 1.5s pause after last lifeline
                  }
                };
                showNext();
              }, 3000); // 3s pause before lifelines
            }
          }, 400); // 400ms normal speed (600 - 200 = faster)
        }
      };
      highlightNext();
    }, 3000); // Start after 3s

    return () => {
      clearTimeout(t3);
    };
  }, []);

  // Play ladder audio when money ladder is shown
  useEffect(() => {
    if (showMoneyLadder && ladderAudio) {
      ladderAudio.currentTime = 0;
      ladderAudio.play().catch(err => console.error('Audio play failed:', err));
    }
  }, [showMoneyLadder, ladderAudio]);

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
        >          <div className="flex gap-4">
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
      {showMoneyLadder && (
        <div
          className="absolute right-8 top-1/2 -translate-y-1/2 z-20"
          style={{
            animation: "slide-in-right 0.8s ease-out",
            width: "380px",
            height: "85vh",
            background: "linear-gradient(to bottom, #0a1f3f 0%, #001529 100%)",
            boxShadow: "inset 0 0 60px rgba(0, 21, 41, 0.8), 0 0 40px rgba(212, 175, 55, 0.3)",
            border: "2px solid #d4af37",
            borderRadius: "12px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "20px",
            cursor: "pointer",
          }}
          onClick={() => {
            if (ladderAudio) {
              ladderAudio.currentTime = 0;
              ladderAudio.play().catch(err => console.error('Audio play failed:', err));
            }
          }}
        >
          <div
            className="text-center mb-3 text-[#D4AF37] font-bold text-[16px] tracking-widest"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            PRIZE LADDER
          </div>
          <div className="relative">
            {MONEY_LADDER.map((item, index) => (
              <div
                key={item.level}
                className="money-row relative"
                style={{
                  height: "48px",
                  background: item.level === highlightLevel ? "#D4AF37" : "#001847",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 15px",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                  transition: "all 0.3s ease-out",
                  border: item.level === highlightLevel ? "2px solid #FFA500" : "none",
                  boxShadow: item.level === highlightLevel ? "0 0 20px rgba(212,175,55,0.8)" : "none",
                  animation: showMoneyLadder ? `fly-in-bottom 1s ease-out ${index * 0.1}s both` : "none",
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
                    fontSize: "20px",
                    color: pausedSafeHavens.has(item.level) 
                      ? "#FFFAF0" // Ivory white for paused safe havens
                      : "#D4AF37", // Golden for all other levels (including current highlight)
                    fontFamily: "Arial, sans-serif",
                  }}
                >
                  {formatMoney(item.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

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
        @keyframes fly-in-bottom {
          from {
            opacity: 0;
            transform: translateY(100px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
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
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

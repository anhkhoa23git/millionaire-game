"use client";

import { useEffect, useState } from "react";

import { MoneyLadder } from "./MoneyLadder";
import { LifelinesBar } from "./LifelinesBar";
import { ContestantInfo } from "@/lib/millionaire/state";

interface StageRevealProps {
  contestant: ContestantInfo;
  onContinue: () => void;
}

export function StageReveal({ contestant, onContinue }: StageRevealProps) {
  const [showName, setShowName] = useState(false);
  const [showMoneyLadder, setShowMoneyLadder] = useState(false);
  const [showLifelines, setShowLifelines] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowName(true), 1500);
    const t2 = setTimeout(() => setShowMoneyLadder(true), 3000);
    const t3 = setTimeout(() => setShowLifelines(true), 3500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div
      className="stage-reveal relative w-full h-full overflow-hidden flex flex-col items-center justify-center cursor-pointer"
      onClick={onContinue}
      style={{
        background:
          "radial-gradient(ellipse at center, #1A1A2E 0%, #0A0A1F 60%, #000000 100%)",
      }}
    >
      {/* Stage spotlights (purple) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(119,73,200,0.35) 0%, transparent 70%), radial-gradient(ellipse 40% 30% at 20% 80%, rgba(123,74,212,0.25) 0%, transparent 60%), radial-gradient(ellipse 40% 30% at 80% 80%, rgba(123,74,212,0.25) 0%, transparent 60%)",
        }}
      />

      {/* Stage pillars (orange-yellow decorative) */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: "8%",
          top: "20%",
          width: "120px",
          height: "60%",
          background:
            "linear-gradient(180deg, transparent 0%, #FFB74D 20%, #FF8C00 50%, #FFB74D 80%, transparent 100%)",
          filter: "blur(8px)",
          opacity: 0.4,
          borderRadius: "60px 60px 0 0",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          right: "8%",
          top: "20%",
          width: "120px",
          height: "60%",
          background:
            "linear-gradient(180deg, transparent 0%, #FFB74D 20%, #FF8C00 50%, #FFB74D 80%, transparent 100%)",
          filter: "blur(8px)",
          opacity: 0.4,
          borderRadius: "60px 60px 0 0",
        }}
      />

      {/* Logo */}
      <div className="relative z-10" style={{ marginBottom: "80px" }}>
        <img src="/icons/Main Logo Cropped.png" alt="Who Wants to Be a Millionaire" style={{ width: "200px", height: "auto", filter: "drop-shadow(0 0 20px rgba(212,175,55,0.5))" }} />
      </div>

      {/* Contestant name + location */}
      {showName && (
        <div className="relative z-10 text-center" style={{ animation: "fade-in-up 1.5s ease-out" }}>
          <h1
            className="text-white font-black uppercase"
            style={{
              fontFamily: "Arial, sans-serif",
              fontSize: "72px",
              letterSpacing: "0.05em",
              textShadow: "0 0 30px rgba(212,175,55,0.5), 0 8px 16px rgba(0,0,0,0.8)",
            }}
          >
            {contestant.name}
          </h1>
          <p
            className="text-[#C0C0C0] mt-4"
            style={{
              fontFamily: "Arial, sans-serif",
              fontSize: "32px",
              letterSpacing: "0.1em",
            }}
          >
            {contestant.location}
          </p>
        </div>
      )}

      {/* Money Ladder with animation */}
      {showMoneyLadder && (
        <div
          className="absolute right-8 top-8 z-20"
          style={{
            animation: "slide-in-right 1s ease-out",
            width: "300px",
          }}
        >
          <div
            className="text-center mb-2 text-[#D4AF37] font-bold text-[14px] tracking-widest"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            PRIZE LADDER
          </div>
          <MoneyLadder currentLevel={1} finalLevel={1} />
        </div>
      )}

      {/* Lifelines with animation */}
      {showLifelines && (
        <div
          className="absolute left-8 top-8 z-20"
          style={{
            animation: "slide-in-left 1s ease-out",
          }}
        >
          <div
            className="text-center mb-2 text-[#D4AF37] font-bold text-[14px] tracking-widest"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            YOUR LIFELINES
          </div>
          <LifelinesBar usedLifelines={new Set()} onUse={() => {}} />
        </div>
      )}

      {/* Click hint */}
      {showLifelines && (
        <div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/60 text-[14px] tracking-widest"
          style={{
            fontFamily: "Arial, sans-serif",
            animation: "fade-in 0.8s ease-out",
          }}
        >
          CLICK TO ANSWER QUESTIONS
        </div>
      )}

      {/* Intro text */}
      {showMoneyLadder && !showLifelines && (
        <div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[#D4AF37]/80 text-[16px] tracking-wider"
          style={{
            fontFamily: "Arial, sans-serif",
            animation: "fade-in 0.8s ease-out",
          }}
        >
          15 QUESTIONS • 4 LIFELINES • £1,000,000 TO WIN
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


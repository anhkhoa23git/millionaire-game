"use client";

import { useEffect, useState } from "react";
import { Khung1Frame } from "./Khung1Frame";

interface WelcomeScreenProps {
  onContinue: () => void;
  showLogo?: boolean;
}

export function WelcomeScreen({ onContinue, showLogo = true }: WelcomeScreenProps) {
  const [phase, setPhase] = useState<"background" | "welcome" | "transition" | "contestant">("background");

  useEffect(() => {
    // Background shows for 2s
    const timer1 = setTimeout(() => {
      setPhase("welcome");
    }, 2000);

    // Welcome text shows for 3s
    const timer2 = setTimeout(() => {
      setPhase("transition");
    }, 5000);

    // Auto-continue after fade out
    const timer3 = setTimeout(() => {
      onContinue();
    }, 5500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onContinue]);

  return (
    <div
      className="welcome-screen relative w-full h-full overflow-hidden flex items-center justify-center cursor-pointer"
      onClick={onContinue}
      style={{
        backgroundImage: "url('/end-background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Text overlay - positioned near top of screen */}
      <div className="absolute top-[8%] left-[51%] -translate-x-1/2 text-center">
        {/* Horizontal glow lines extending to screen edges */}
        {(phase === "welcome" || phase === "transition") && (
          <>
            <div className="glow-line-left" />
            <div className="glow-line-right" />
          </>
        )}
        
        {/* Welcome To text with Khung1Frame - appears after 2s background */}
        {(phase === "welcome" || phase === "transition") && (
          <Khung1Frame>
            <h1
              className="text-[#FFE7A0] font-bold tracking-[0.15em] relative z-10 whitespace-nowrap"
              style={{
                fontSize: "clamp(28px, 5cqw, 64px)",
                fontFamily: "Arial, sans-serif",
                textShadow: "0 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(255,231,160,0.4)",
                animation: phase === "welcome" ? "fade-in-glow 1s ease-out" : "fade-out 0.5s ease-out",
                opacity: phase === "transition" ? 0 : 1,
              }}
            >
              WELCOME TO
            </h1>
          </Khung1Frame>
        )}
      </div>

      {/* Click hint - subtle */}
      <div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/40 text-[14px] tracking-widest"
        style={{
          fontFamily: "Arial, sans-serif",
          animation: "fade-in 2s ease-out",
        }}
      >
        CLICK ANYWHERE TO CONTINUE
      </div>

      <style jsx>{`
        .glow-line-left,
        .glow-line-right {
          position: absolute;
          height: 2px;
          top: 50%;
          transform: translateY(-50%);
          background: linear-gradient(
            90deg,
            transparent 0%,
            #8B7355 30%,
            #D4AF37 50%,
            #8B7355 70%,
            transparent 100%
          );
          box-shadow: 
            0 0 8px #D4AF37,
            0 0 16px rgba(212, 175, 55, 0.4),
            0 0 24px rgba(99, 102, 241, 0.2);
          animation: glow-pulse 3s ease-in-out infinite;
        }

        .glow-line-left {
          right: 50%;
          width: 100vw;
        }

        .glow-line-right {
          left: 50%;
          width: 100vw;
        }

        @keyframes glow-pulse {
          0%, 100% {
            box-shadow: 
              0 0 8px #D4AF37,
              0 0 16px rgba(212, 175, 55, 0.4),
              0 0 24px rgba(99, 102, 241, 0.2);
          }
          50% {
            box-shadow: 
              0 0 12px #D4AF37,
              0 0 24px rgba(212, 175, 55, 0.6),
              0 0 36px rgba(99, 102, 241, 0.3);
          }
        }

        @keyframes fade-in-glow {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes fade-out {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

        @keyframes fade-in {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

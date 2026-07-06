"use client";

import { useEffect } from "react";
import { Khung1Frame } from "./Khung1Frame";

interface ContestantIntroScreenProps {
  onContinue: () => void;
  showLogo?: boolean;
}

export function ContestantIntroScreen({ onContinue, showLogo = true }: ContestantIntroScreenProps) {
  useEffect(() => {
    // Auto-continue after 3s
    const timer = setTimeout(() => {
      onContinue();
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [onContinue]);

  return (
    <div
      className="contestant-intro relative w-full h-full overflow-hidden flex items-center justify-center cursor-pointer"
      onClick={onContinue}
      style={{
        backgroundImage: "url('/end-background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Text with Khung1Frame overlay - positioned near top of screen */}
      <div className="absolute top-[8%] left-[51%] -translate-x-1/2 text-center">
        {/* Horizontal glow lines extending to screen edges */}
        <div className="glow-line-left" />
        <div className="glow-line-right" />
        
        <Khung1Frame>
          <h2
            className="contestant-intro-text text-[#FFE7A0] font-bold tracking-[0.1em] relative z-10 whitespace-nowrap"
            style={{
              fontFamily: "Arial, sans-serif",
              fontSize: "56px",
              textShadow: "0 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(255,231,160,0.4)",
              animation: "fade-in-glow 1s ease-out",
            }}
          >
            LET&apos;S MEET TODAY&apos;S CONTESTANT
          </h2>
        </Khung1Frame>
      </div>

      {/* Click hint */}
      <div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/40 text-[14px] tracking-widest"
        style={{
          fontFamily: "Arial, sans-serif",
          animation: "fade-in 2s ease-out",
        }}
      >
        CLICK TO CONTINUE
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

"use client";

import { useEffect, useState } from "react";

interface WelcomeIntroScreenProps {
  onContinue: () => void;
}

export function WelcomeIntroScreen({ onContinue }: WelcomeIntroScreenProps) {
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

    // Brief transition
    const timer3 = setTimeout(() => {
      setPhase("contestant");
    }, 5500);

    // Contestant text shows for 3s, then auto-continue
    const timer4 = setTimeout(() => {
      onContinue();
    }, 8500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onContinue]);

  return (
    <div
      className="welcome-intro-screen relative w-full h-full overflow-hidden flex items-center justify-center cursor-pointer"
      onClick={onContinue}
      style={{
        backgroundImage: "url('/end-background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Text overlay - positioned above the logo in the end.png image */}
      <div className="absolute top-[35%] left-1/2 -translate-x-1/2 text-center">
        {/* Welcome To text - appears after 2s background */}
        {(phase === "welcome" || phase === "transition") && (
          <h1
            className="text-[#FFD700] font-bold tracking-[0.15em]"
            style={{
              fontSize: "64px",
              fontFamily: "Arial, sans-serif",
              textShadow: "0 0 40px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.6)",
              animation: phase === "welcome" ? "fade-in-glow 1s ease-out" : "fade-out 0.5s ease-out",
              opacity: phase === "transition" ? 0 : 1,
            }}
          >
            WELCOME TO
          </h1>
        )}

        {/* Let's Meet Today's Contestant text */}
        {phase === "contestant" && (
          <h1
            className="text-[#FFD700] font-bold tracking-[0.1em]"
            style={{
              fontSize: "56px",
              fontFamily: "Arial, sans-serif",
              textShadow: "0 0 40px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.6)",
              animation: "fade-in-glow 1s ease-out",
            }}
          >
            LET&apos;S MEET TODAY&apos;S CONTESTANT
          </h1>
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

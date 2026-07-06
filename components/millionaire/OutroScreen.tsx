"use client";

import { useEffect } from "react";
import { setSkipHandler } from "@/lib/millionaire/skip";

interface OutroScreenProps {
  onContinue: () => void;
}

export function OutroScreen({ onContinue }: OutroScreenProps) {
  // Space/Skip = same as clicking to continue
  useEffect(() => setSkipHandler(onContinue), [onContinue]);
  return (
    <div
      className="outro-screen relative w-full h-full overflow-hidden flex flex-col items-center justify-center cursor-pointer"
      onClick={onContinue}
      style={{
        background:
          "radial-gradient(ellipse at center, #1A1A2E 0%, #000000 90%)",
        animation: "fade-to-black 2s ease-in",
      }}
    >
      <img src="/icons/Main Logo Cropped.png" alt="Who Wants to Be a Millionaire" style={{ width: "200px", height: "auto", filter: "drop-shadow(0 0 20px rgba(212,175,55,0.5))" }} />

      <h1
        className="text-white mt-8"
        style={{
          fontFamily: "Arial, sans-serif",
          fontSize: "80px",
          fontWeight: "bold",
          letterSpacing: "0.2em",
          textShadow: "0 0 24px rgba(212,175,55,0.4)",
          animation: "fade-in 1.5s ease-out 0.5s both",
        }}
      >
        GOODBYE!
      </h1>

      <p
        className="text-[#D4AF37] mt-6 tracking-[0.3em] text-[16px]"
        style={{
          fontFamily: "Arial, sans-serif",
          animation: "fade-in 2s ease-out 1.5s both",
        }}
      >
        THANKS FOR PLAYING
      </p>

      <div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/60 text-[14px] tracking-widest"
        style={{
          fontFamily: "Arial, sans-serif",
          animation: "fade-in 3s ease-out",
        }}
      >
        CLICK TO RETURN TO MENU
      </div>
    </div>
  );
}


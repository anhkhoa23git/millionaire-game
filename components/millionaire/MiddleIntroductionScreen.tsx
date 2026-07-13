"use client";

import { useState, useEffect } from "react";
import { ContestantInfo } from "@/lib/millionaire/state";
import { PrizeStep } from "@/lib/millionaire/prize";

interface MiddleIntroductionScreenProps {
  contestant: ContestantInfo;
  ladder: PrizeStep[];
  currentLevel: number;
  onContinue: () => void;
}

export function MiddleIntroductionScreen({ 
  contestant, 
  ladder, 
  currentLevel,
  onContinue 
}: MiddleIntroductionScreenProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Fade in after mount
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="middle-intro-screen relative w-full h-full overflow-hidden flex items-center justify-center cursor-pointer"
      onClick={onContinue}
      style={{
        backgroundImage: "url('/menu-background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: visible ? 1 : 0,
        transition: "opacity 1s ease-in-out",
      }}
    >
      {/* Lower Third Banners - Same layout as Scene 6 */}
      <div className="lower-third-container">
        {/* Upper small banner - "Contestant" */}
        <div className="upper-banner">
          <span>Contestant</span>
        </div>
        
        {/* Lower main banner - Name & Location */}
        <div className="lower-banner">
          <div className="contestant-name">{contestant.name}</div>
          <div className="contestant-location">{contestant.location}</div>
        </div>
      </div>

      {/* Click hint */}
      <div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/60 text-[14px] tracking-widest"
        style={{
          fontFamily: "Arial, sans-serif",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.8s ease-out 1s",
        }}
      >
        CLICK TO CONTINUE
      </div>

      <style jsx>{`
        /* Lower Third Container — absolute so it stays inside the stage */
        .lower-third-container {
          position: absolute;
          bottom: clamp(16px, 5cqh, 40px);
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          opacity: ${visible ? 1 : 0};
          transition: opacity 1s ease-out 0.5s;
        }

        /* Upper small banner - "Contestant" */
        .upper-banner {
          position: absolute;
          bottom: clamp(60px, 11cqh, 85px);
          left: 50%;
          transform: translateX(-50%);
          width: clamp(180px, 24cqw, 280px);
          height: clamp(30px, 5cqh, 38px);
          background: linear-gradient(135deg, rgba(10, 25, 41, 0.95) 0%, rgba(15, 30, 50, 0.95) 100%);
          border: 2px solid #D4AF37;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 
            0 0 20px rgba(212, 175, 55, 0.6),
            0 0 40px rgba(212, 175, 55, 0.3),
            0 4px 12px rgba(0, 0, 0, 0.6);
          animation: slide-in-from-top 0.6s ease-out;
        }

        .upper-banner span {
          color: #FFFFFF;
          font-family: Arial, sans-serif;
          font-size: 16px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
        }

        /* Lower main banner - Name & Location */
        .lower-banner {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: min(90cqw, 520px);
          height: clamp(58px, 10cqh, 78px);
          background: linear-gradient(135deg, rgba(10, 25, 41, 0.95) 0%, rgba(15, 30, 50, 0.95) 100%);
          border: 3px solid #D4AF37;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 12px 24px;
          box-shadow: 
            0 0 25px rgba(212, 175, 55, 0.7),
            0 0 50px rgba(212, 175, 55, 0.4),
            0 0 75px rgba(99, 102, 241, 0.2),
            0 6px 16px rgba(0, 0, 0, 0.7);
          animation: slide-in-from-bottom 0.6s ease-out 0.2s backwards;
        }

        .contestant-name {
          color: #D4AF37;
          font-family: Arial, sans-serif;
          font-size: clamp(20px, 3.2cqw, 32px);
          font-weight: 800;
          letter-spacing: 0.05em;
          text-shadow: 
            0 2px 4px rgba(0, 0, 0, 0.9),
            0 0 20px rgba(212, 175, 55, 0.4);
        }

        .contestant-location {
          color: #FFFFFF;
          font-family: Arial, sans-serif;
          font-size: clamp(13px, 1.8cqw, 18px);
          font-weight: 500;
          letter-spacing: 0.08em;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
        }

        /* Slide-in animations */
        @keyframes slide-in-from-top {
          from {
            opacity: 0;
            transform: translate(-50%, -100px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        @keyframes slide-in-from-bottom {
          from {
            opacity: 0;
            transform: translate(-50%, 100px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </div>
  );
}

"use client";

import { formatMoney } from "@/lib/millionaire/questions";
import { PrizeStep } from "@/lib/millionaire/prize";

interface SafeHavenMoneyLadderProps {
  visible: boolean;
  ladder: PrizeStep[];
  safeHavenLevel: number;
  onContinue: () => void;
}

export function SafeHavenMoneyLadder({ visible, ladder, safeHavenLevel, onContinue }: SafeHavenMoneyLadderProps) {
  if (!visible) return null;

  // Display highest prize first, same convention as MoneyLadder.tsx
  const rows = [...ladder].reverse();

  return (
    <div
      className="modal-overlay cursor-pointer"
      style={{ zIndex: 60, background: "rgba(0,0,0,0.5)" }}
      onClick={onContinue}
    >
      {/* Money Ladder */}
      <div
        className="absolute"
        style={{
          right: "clamp(12px, 3cqw, 32px)",
          top: "50%",
          transform: "translateY(-50%)",
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
          padding: "clamp(10px, 2cqw, 20px)",
        }}
      >
        <div
          className="text-center mb-3 text-[#D4AF37] font-bold tracking-widest"
          style={{ fontFamily: "Arial, sans-serif", fontSize: "clamp(13px, 1.6cqw, 16px)" }}
        >
          SAFE HAVEN REACHED
        </div>
        <div className="relative">
          {rows.map((item, index) => (
            <div
              key={item.level}
              className="money-row relative"
              style={{
                height: `clamp(32px, ${Math.min(48, Math.floor(400 / rows.length))}px, 48px)`,
                background: item.level === safeHavenLevel ? "#D4AF37" : "#001847",
                display: "flex",
                alignItems: "center",
                padding: "0 clamp(8px, 1.2cqw, 15px)",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                transition: "all 0.3s ease-out",
                border: item.level === safeHavenLevel ? "2px solid #FFA500" : "none",
                boxShadow: item.level === safeHavenLevel ? "0 0 20px rgba(212,175,55,0.8)" : "none",
                animation: `fly-in-bottom 1s ease-out ${index * 0.1}s both`,
              }}
            >
              <span
                className="font-bold"
                style={{
                  fontSize: "clamp(12px, 1.5cqw, 16px)",
                  color: item.level === safeHavenLevel ? "#000000" : "#C0C0C0",
                  minWidth: "clamp(24px, 3cqw, 35px)",
                  fontFamily: "Arial, sans-serif",
                }}
              >
                {item.level}
              </span>
              <span
                className="font-bold ml-auto"
                style={{
                  fontSize: "clamp(14px, 1.9cqw, 20px)",
                  color: item.level === safeHavenLevel ? "#000000" : "#D4AF37",
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
      <div
        className="absolute left-1/2 -translate-x-1/2 text-white/60 tracking-widest"
        style={{
          bottom: "clamp(20px, 5cqh, 48px)",
          fontFamily: "Arial, sans-serif",
          fontSize: "clamp(11px, 1.2cqw, 14px)",
          animation: "fade-in 0.8s ease-out 1s both",
        }}
      >
        CLICK TO CONTINUE
      </div>

      <style jsx>{`
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

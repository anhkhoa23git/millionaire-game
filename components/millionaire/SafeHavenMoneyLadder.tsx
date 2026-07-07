"use client";

import { MONEY_LADDER, formatMoney } from "@/lib/millionaire/questions";

interface SafeHavenMoneyLadderProps {
  visible: boolean;
  safeHavenLevel: number;
  onContinue: () => void;
}

export function SafeHavenMoneyLadder({ visible, safeHavenLevel, onContinue }: SafeHavenMoneyLadderProps) {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center cursor-pointer"
      onClick={onContinue}
      style={{
        background: "rgba(0, 0, 0, 0.5)",
      }}
    >
      {/* Money Ladder */}
      <div
        className="absolute right-8 top-1/2 -translate-y-1/2"
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
        }}
      >
        <div
          className="text-center mb-3 text-[#D4AF37] font-bold text-[16px] tracking-widest"
          style={{ fontFamily: "Arial, sans-serif" }}
        >
          SAFE HAVEN REACHED
        </div>
        <div className="relative">
          {MONEY_LADDER.slice(0, 9).map((item, index) => (
            <div
              key={item.level}
              className="money-row relative"
              style={{
                height: "48px",
                background: item.level === safeHavenLevel ? "#D4AF37" : "#001847",
                display: "flex",
                alignItems: "center",
                padding: "0 15px",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                transition: "all 0.3s ease-out",
                border: item.level === safeHavenLevel ? "2px solid #FFA500" : "none",
                boxShadow: item.level === safeHavenLevel ? "0 0 20px rgba(212,175,55,0.8)" : "none",
                animation: visible ? `fly-in-bottom 1s ease-out ${index * 0.1}s both` : "none",
              }}
            >
              <span
                className="font-bold"
                style={{
                  fontSize: "16px",
                  color: item.level === safeHavenLevel ? "#000000" : "#C0C0C0",
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
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/60 text-[14px] tracking-widest"
        style={{
          fontFamily: "Arial, sans-serif",
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

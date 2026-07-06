"use client";

import { formatMoney } from "@/lib/millionaire/questions";

interface EndScreenProps {
  variant: "walk_away" | "win" | "lose";
  amount: number;     // winnings amount in £
  onContinue: () => void;
}

export function EndScreen({ variant, amount, onContinue }: EndScreenProps) {
  if (variant === "win") {
    return <WinScreen amount={amount} onContinue={onContinue} />;
  }
  if (variant === "walk_away") {
    return <WalkAwayScreen amount={amount} onContinue={onContinue} />;
  }
  return <LoseScreen amount={amount} onContinue={onContinue} />;
}

function WalkAwayScreen({ amount, onContinue }: { amount: number; onContinue: () => void }) {
  return (
    <div
      className="walk-away relative w-full h-full overflow-hidden flex flex-col items-center justify-center cursor-pointer"
      onClick={onContinue}
      style={{
        background:
          "radial-gradient(ellipse at center, #1E3A8A 0%, #0A0A1F 70%, #000000 100%)",
      }}
    >
      {/* Confetti subtle */}
      <Confetti count={60} />

      <div
        className="px-12 py-6 rounded-lg mb-8"
        style={{
          background: "#1E3A8A",
          border: "2px solid #FFD700",
          boxShadow: "0 0 32px rgba(255,215,0,0.4)",
        }}
      >
        <p
          className="text-[#FFD700] tracking-[0.2em] text-[20px]"
          style={{ fontFamily: "Arial, sans-serif" }}
        >
          COLLECT WINNINGS
        </p>
      </div>

      <h1
        className="text-white text-center mb-4"
        style={{
          fontFamily: "Arial, sans-serif",
          fontSize: "clamp(18px, 2.8cqw, 32px)",
          letterSpacing: "0.1em",
        }}
      >
        You walk away with
      </h1>

      <div
        className="text-[#FFD700] font-black"
        style={{
          fontFamily: "Arial, sans-serif",
          fontSize: "clamp(48px, 10cqw, 120px)",
          textShadow: "0 0 40px rgba(255,215,0,0.6), 0 8px 16px rgba(0,0,0,0.8)",
          animation: "fade-in-up 1s ease-out",
        }}
      >
        {formatMoney(amount)}
      </div>

      <img src="/icons/Main Logo Cropped.png" alt="Who Wants to Be a Millionaire" style={{ width: "180px", height: "auto", filter: "drop-shadow(0 0 20px rgba(212,175,55,0.5))" }} />

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/60 text-[14px] tracking-widest" style={{ fontFamily: "Arial, sans-serif" }}>
        CLICK TO CONTINUE
      </div>
    </div>
  );
}

function WinScreen({ amount, onContinue }: { amount: number; onContinue: () => void }) {
  return (
    <div
      className="win-screen relative w-full h-full overflow-hidden flex flex-col items-center justify-center cursor-pointer"
      onClick={onContinue}
      style={{
        background:
          "radial-gradient(ellipse at center, #9370DB 0%, #4B0082 40%, #000000 100%)",
      }}
    >
      {/* Confetti heavy */}
      <Confetti count={150} heavy />

      {/* Light rays */}
      <div className="win-light-rays absolute inset-0 pointer-events-none" />

      <img src="/icons/Main Logo Cropped.png" alt="Who Wants to Be a Millionaire" style={{ width: "clamp(140px, 22cqw, 280px)", height: "auto", filter: "drop-shadow(0 0 30px rgba(212,175,55,0.6))" }} />

      <h1
        className="text-white mt-12 mb-4"
        style={{
          fontFamily: "Arial, sans-serif",
          fontSize: "clamp(26px, 5cqw, 60px)",
          fontWeight: "bold",
          letterSpacing: "0.05em",
          textShadow: "0 0 30px rgba(255,215,0,0.6)",
          animation: "fade-in-up 1.5s ease-out",
        }}
      >
        CONGRATULATIONS!
      </h1>

      <div
        className="text-[#FFD700] font-black"
        style={{
          fontFamily: "Arial, sans-serif",
          fontSize: "clamp(56px, 13cqw, 160px)",
          textShadow: "0 0 60px rgba(255,215,0,0.8), 0 8px 24px rgba(0,0,0,0.9)",
          animation: "fade-in-up 2s ease-out",
        }}
      >
        {formatMoney(amount)}
      </div>

      <p
        className="text-[#FFD700] mt-8 tracking-[0.3em] text-[20px]"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        YOU ARE A MILLIONAIRE!
      </p>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/60 text-[14px] tracking-widest" style={{ fontFamily: "Arial, sans-serif" }}>
        CLICK TO CONTINUE
      </div>
    </div>
  );
}

function LoseScreen({ amount, onContinue }: { amount: number; onContinue: () => void }) {
  return (
    <div
      className="lose-screen relative w-full h-full overflow-hidden flex flex-col items-center justify-center cursor-pointer"
      onClick={onContinue}
      style={{
        background:
          "radial-gradient(ellipse at center, #4A0000 0%, #1A0000 60%, #000000 100%)",
      }}
    >
      <h1
        className="text-[#D0021B] mb-8"
        style={{
          fontFamily: "Arial, sans-serif",
          fontSize: "clamp(36px, 6.5cqw, 80px)",
          fontWeight: "bold",
          letterSpacing: "0.1em",
          textShadow: "0 0 30px rgba(208,2,27,0.6)",
          animation: "fade-in-up 1s ease-out",
        }}
      >
        GAME OVER
      </h1>

      <p
        className="text-white mb-4"
        style={{
          fontFamily: "Arial, sans-serif",
          fontSize: "28px",
          textAlign: "center",
        }}
      >
        You leave with
      </p>

      <div
        className="text-[#FFD700] font-black mb-12"
        style={{
          fontFamily: "Arial, sans-serif",
          fontSize: "clamp(44px, 8.5cqw, 100px)",
          textShadow: "0 0 30px rgba(255,215,0,0.4)",
          animation: "fade-in-up 1.5s ease-out",
        }}
      >
        {formatMoney(amount)}
      </div>

      <p
        className="text-white/60 tracking-widest text-[14px]"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        Better luck next time!
      </p>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/60 text-[14px] tracking-widest" style={{ fontFamily: "Arial, sans-serif" }}>
        CLICK TO CONTINUE
      </div>
    </div>
  );
}

function Confetti({ count = 100, heavy = false }: { count?: number; heavy?: boolean }) {
  // Static confetti rendered as positioned divs with random colors + delays
  const colors = ["#FFD700", "#87CEEB", "#D4AF37", "#FFFFFF", "#9370DB"];
  const pieces = Array.from({ length: count }).map((_, i) => {
    const left = (i * 37) % 100;
    const delay = (i * 0.13) % 4;
    const duration = 3 + (i % 4);
    const color = colors[i % colors.length];
    const size = 8 + (i % 4) * 4;
    return { left, delay, duration, color, size, key: i };
  });
  return (
    <div className="confetti-container absolute inset-0 pointer-events-none overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.key}
          className="confetti-piece"
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: "-20px",
            width: `${p.size}px`,
            height: `${p.size * 1.6}px`,
            background: p.color,
            borderRadius: "2px",
            animation: `confetti-fall ${p.duration}s linear ${p.delay}s infinite`,
            opacity: heavy ? 0.95 : 0.7,
          }}
        />
      ))}
    </div>
  );
}


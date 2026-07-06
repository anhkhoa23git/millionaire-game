"use client";

interface MenuScreenProps {
  onPlay: () => void;
  onCustomize: () => void;
  onHistory: () => void;
  onSettings: () => void;
  onReset: () => void;
  onExit: () => void;
}

export function MenuScreen({ onPlay, onCustomize, onHistory, onSettings, onReset, onExit }: MenuScreenProps) {
  return (
    <div className="menu-screen relative w-full h-full overflow-hidden flex flex-col">
      {/* Background Image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/menu-background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Overlay gradient - lighter for visibility */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      {/* Animated light rays */}
      <div className="menu-light-rays absolute inset-0 pointer-events-none" />

      {/* Particles */}
      <div className="menu-particles absolute inset-0 pointer-events-none" />

      {/* Header row: MENU title + logo */}
      <div
        className="relative z-10 flex items-center justify-between"
        style={{ padding: "clamp(16px, 3cqh, 32px) clamp(16px, 3cqw, 40px) 0" }}
      >
        <h1
          className="text-white tracking-[0.3em] font-black"
          style={{
            fontSize: "clamp(32px, 6.5cqw, 80px)",
            textShadow: "0 0 24px rgba(212,175,55,0.5), 0 4px 8px rgba(0,0,0,0.8)",
          }}
        >
          MENU
        </h1>
        <img
          src="/icons/Main Logo Cropped.png"
          alt="Who Wants to Be a Millionaire"
          style={{
            width: "clamp(100px, 17cqw, 220px)",
            height: "auto",
            filter: "drop-shadow(0 0 20px rgba(212,175,55,0.5))",
          }}
        />
      </div>

      {/* Buttons stack — vertically centered, scrolls if it ever overflows */}
      <div
        className="relative z-10 flex-1 flex flex-col justify-center overflow-y-auto"
        style={{
          gap: "clamp(8px, 1.8cqh, 20px)",
          padding: "clamp(12px, 2cqh, 24px) clamp(16px, 6cqw, 80px)",
          maxWidth: "min(92cqw, 560px)",
        }}
      >
        <MenuButton label="Play" primary onClick={onPlay} />
        <MenuButton label="Customize questions" onClick={onCustomize} />
        <MenuButton label="History" onClick={onHistory} />
        <MenuButton label="Settings" onClick={onSettings} />
        <MenuButton label="Reset game" onClick={onReset} />
      </div>

      {/* EXIT bottom-right */}
      <button
        type="button"
        onClick={onExit}
        className="absolute z-10 text-white tracking-[0.2em] hover:text-[#D4AF37] transition-colors"
        style={{
          bottom: "clamp(12px, 3cqh, 32px)",
          right: "clamp(12px, 3cqw, 32px)",
          fontSize: "clamp(15px, 1.7cqw, 20px)",
          minHeight: "44px",
          padding: "0 12px",
        }}
      >
        EXIT
      </button>

      {/* Subtle floor reflection */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(123,74,212,0.08) 50%, rgba(212,175,55,0.05) 100%)",
        }}
      />
    </div>
  );
}

function MenuButton({
  label,
  onClick,
  primary = false,
}: {
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="menu-btn group relative overflow-hidden text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
      style={{
        width: "100%",
        minHeight: "clamp(48px, 8cqh, 64px)",
        background: "#0A1A3A",
        border: "2px solid #D4AF37",
        borderRadius: "8px",
        padding: "0 clamp(14px, 2.2cqw, 28px)",
        color: "#FFFFFF",
        fontSize: "clamp(16px, 2cqw, 24px)",
        fontWeight: "500",
        letterSpacing: "0.05em",
        boxShadow: primary
          ? "0 0 20px rgba(212,175,55,0.25), 0 4px 12px rgba(0,0,0,0.5)"
          : "0 4px 12px rgba(0,0,0,0.4)",
      }}
    >
      <span className="relative z-10 flex items-center gap-3">
        <span style={{ color: "#D4AF37", fontSize: "0.75em" }}>▸</span>
        {label}
      </span>
      <span
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.15) 50%, transparent 100%)",
        }}
      />
    </button>
  );
}

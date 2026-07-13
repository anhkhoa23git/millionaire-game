"use client";

interface SafeHavenFrameProps {
  amount: number;
  visible: boolean;
}

export function SafeHavenFrame({ amount, visible }: SafeHavenFrameProps) {
  if (!visible) return null;

  return (
    <div
      className="safe-haven-frame"
      style={{
        position: "absolute",
        bottom: "clamp(12px, 4cqh, 30px)",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        width: "90%",
        maxWidth: "1200px",
        height: "clamp(64px, 14cqh, 100px)",
      }}
    >
      {/* Hexagonal shape with pointed ends */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #003087 0%, #0A2A6B 100%)",
          clipPath: "polygon(3% 0%, 97% 0%, 100% 50%, 97% 100%, 3% 100%, 0% 50%)",
          border: "6px solid #FFD700",
          boxShadow: "0 0 30px rgba(255, 215, 0, 0.6), 0 0 60px rgba(255, 215, 0, 0.3), inset 0 0 20px rgba(255, 215, 0, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Inner glow */}
        <div
          style={{
            position: "absolute",
            inset: "10px",
            background: "radial-gradient(ellipse at center, rgba(255, 215, 0, 0.1) 0%, transparent 70%)",
            clipPath: "polygon(3% 0%, 97% 0%, 100% 50%, 97% 100%, 3% 100%, 0% 50%)",
            pointerEvents: "none",
          }}
        />
        
        {/* Prize text */}
        <p
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: "clamp(24px, 4cqw, 48px)",
            fontWeight: "bold",
            color: "#FFED00",
            textShadow: "0 4px 12px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 237, 0, 0.5)",
            letterSpacing: "0.1em",
            margin: 0,
            padding: "0 60px",
            zIndex: 1,
          }}
        >
          {amount.toLocaleString("vi-VN")}
        </p>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .safe-haven-frame {
            width: 95% !important;
            height: 70px !important;
          }
          .safe-haven-frame p {
            font-size: 32px !important;
            padding: 0 30px !important;
          }
        }
      `}</style>
    </div>
  );
}

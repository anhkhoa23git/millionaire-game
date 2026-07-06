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
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, calc(-50% + 280px))",
        zIndex: 9999,
        width: "70%",
        maxWidth: "900px",
        height: "90px",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.5s ease-in",
      }}
    >
      {/* Left line extending to screen edge */}
      <div
        style={{
          position: "absolute",
          left: "-100vw",
          top: "50%",
          width: "100vw",
          height: "3px",
          background: "linear-gradient(to right, transparent 0%, #FFD700 100%)",
          transform: "translateY(-50%)",
        }}
      />
      
      {/* Right line extending to screen edge */}
      <div
        style={{
          position: "absolute",
          right: "-100vw",
          top: "50%",
          width: "100vw",
          height: "3px",
          background: "linear-gradient(to left, transparent 0%, #FFD700 100%)",
          transform: "translateY(-50%)",
        }}
      />
      {/* Hexagonal shape with pointed ends */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #003087 0%, #0A2A6B 100%)",
          clipPath: "polygon(3% 0%, 97% 0%, 100% 50%, 97% 100%, 3% 100%, 0% 50%)",
          border: "2px solid #FFD700",
          boxShadow: "0 0 30px rgba(255, 215, 0, 0.6), 0 0 60px rgba(255, 215, 0, 0.3), inset 0 0 20px rgba(255, 215, 0, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.3s ease",
          outline: "2px solid #FFD700",
          outlineOffset: "-2px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.02)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
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
            fontSize: "42px",
            fontWeight: "bold",
            color: "#FFED00",
            textShadow: "0 4px 12px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 237, 0, 0.5)",
            letterSpacing: "0.1em",
            margin: 0,
            padding: "0 60px",
            zIndex: 1,
          }}
        >
          YOU JUST WON {amount.toLocaleString("en-US")}
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

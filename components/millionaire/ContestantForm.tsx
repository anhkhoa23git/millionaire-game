"use client";

import { useState, useEffect } from "react";

interface ContestantFormProps {
  onSubmit: (name: string, location: string) => void;
  showLogo?: boolean;
  logoMoveUp?: boolean;
  fadeOut?: boolean;
}

export function ContestantForm({ onSubmit, showLogo = true, logoMoveUp = false, fadeOut = false }: ContestantFormProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Show form after 1s delay (logo animation time)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowForm(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Hide form when fadeOut is triggered
  useEffect(() => {
    if (fadeOut) {
      const timer = setTimeout(() => {
        setShowForm(false);
      }, 500); // Wait for fade-out animation
      return () => clearTimeout(timer);
    }
  }, [fadeOut]);

  // Derived state — no useEffect needed
  const showLetsPlay = name.trim().length > 0 && location.trim().length > 0;

  return (
    <div
      className="contestant-form relative w-full h-full overflow-hidden flex flex-col items-center justify-center"
      style={{
        background:
          "radial-gradient(ellipse at center, #0A1929 0%, #000000 90%)",
      }}
    >
      {/* Light rays */}
      <div className="welcome-light-rays absolute inset-0 pointer-events-none opacity-50" />

      {/* Form card - only show after logo animation */}
      {showForm && (
        <div
          className="form-card relative z-10 flex flex-col gap-6"
          style={{
            width: "min(92cqw, 640px)",
            padding: "clamp(20px, 4cqw, 48px) clamp(20px, 4.5cqw, 56px)",
            marginTop: "clamp(20px, 8cqh, 60px)",
            background: "rgba(10, 25, 41, 0.6)",
            border: "1px solid rgba(212,175,55,0.3)",
            borderRadius: "12px",
            boxShadow: "0 12px 48px rgba(0,0,0,0.6), 0 0 24px rgba(212,175,55,0.1) inset",
            backdropFilter: "blur(8px)",
            animation: fadeOut ? "form-fade-out 0.5s ease-out forwards" : "form-fade-in 0.5s ease-out",
          }}
        >
          <Field
            label="Name"
            value={name}
            onChange={setName}
            placeholder="Enter your name"
            autoFocus
          />
          <Field
            label="Location"
            value={location}
            onChange={setLocation}
            placeholder="Enter your location"
          />

          {/* Let's Play button — blinking */}
          {showLetsPlay && (
            <button
              type="button"
              onClick={() => onSubmit(name.trim(), location.trim())}
              className="lets-play-btn mx-auto mt-4 transition-transform hover:scale-105"
              style={{
                width: "clamp(160px, 30cqw, 220px)",
                height: "clamp(48px, 8cqh, 64px)",
                background: "#D4AF37",
                border: "2px solid #FFA500",
                borderRadius: "8px",
                color: "#000000",
                fontFamily: "Arial, sans-serif",
                fontSize: "24px",
                fontWeight: "800",
                letterSpacing: "0.08em",
                cursor: "pointer",
                animation: "lets-play-blink 0.8s ease-in-out infinite",
                boxShadow: "0 4px 16px rgba(212,175,55,0.4)",
              }}
            >
              Let&apos;s Play
            </button>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes form-fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes form-fade-out {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-20px);
          }
        }

        @keyframes lets-play-blink {
          0%, 100% {
            opacity: 1;
            box-shadow: 0 4px 16px rgba(212,175,55,0.4);
          }
          50% {
            opacity: 0.85;
            box-shadow: 0 4px 24px rgba(212,175,55,0.6);
          }
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  autoFocus = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoFocus?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        className="text-white text-[16px] tracking-wider font-medium"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="contestant-input"
        style={{
          width: "100%",
          height: "clamp(44px, 7cqh, 56px)",
          padding: "0 clamp(12px, 1.6cqw, 20px)",
          background: "rgba(255,255,255,0.05)",
          border: "2px solid #D4AF37",
          borderRadius: "6px",
          color: "#FFFFFF",
          fontFamily: "Arial, sans-serif",
          fontSize: "20px",
          outline: "none",
        }}
      />
    </div>
  );
}

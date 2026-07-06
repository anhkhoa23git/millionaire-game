"use client";

import { useState } from "react";
import { GameSettings } from "@/lib/millionaire/settings";
import { audioManager } from "@/lib/millionaire/audio";

interface SettingsModalProps {
  settings: GameSettings;
  onSave: (s: GameSettings) => void;
  onClose: () => void;
}

export function SettingsModal({ settings, onSave, onClose }: SettingsModalProps) {
  const [draft, setDraft] = useState<GameSettings>(settings);

  const handleSave = () => {
    audioManager.sfx("buttonClick");
    onSave(draft);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 40 }} onClick={onClose}>
      <div
        className="modal-box game-panel"
        style={{ width: "min(92cqw, 520px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          className="text-white text-center mb-8"
          style={{ fontSize: "clamp(22px, 2.8cqw, 32px)", fontWeight: "bold", letterSpacing: "0.1em" }}
        >
          SETTINGS
        </h2>

        {/* Timer on/off */}
        <label className="flex items-center justify-between mb-6 cursor-pointer">
          <span className="text-white text-[18px]" style={{ fontFamily: "Arial, sans-serif" }}>
            Countdown timer
          </span>
          <input
            type="checkbox"
            checked={draft.timerEnabled}
            onChange={(e) => setDraft({ ...draft, timerEnabled: e.target.checked })}
            style={{ width: "22px", height: "22px", accentColor: "#D4AF37" }}
          />
        </label>

        {/* Timer base seconds */}
        <div className="mb-6" style={{ opacity: draft.timerEnabled ? 1 : 0.4 }}>
          <div className="flex justify-between mb-2">
            <span className="text-white text-[18px]" style={{ fontFamily: "Arial, sans-serif" }}>
              Base time (easy questions)
            </span>
            <span className="text-[#D4AF37] font-bold text-[18px]">{draft.timerBaseSeconds}s</span>
          </div>
          <input
            type="range"
            min={10}
            max={90}
            step={5}
            disabled={!draft.timerEnabled}
            value={draft.timerBaseSeconds}
            onChange={(e) => setDraft({ ...draft, timerBaseSeconds: Number(e.target.value) })}
            className="w-full"
            style={{ accentColor: "#D4AF37" }}
          />
          <p className="text-white/50 text-[13px] mt-1" style={{ fontFamily: "Arial, sans-serif" }}>
            Mid questions get 1.5×, final stretch 2× this time.
          </p>
        </div>

        {/* SFX volume */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-white text-[18px]" style={{ fontFamily: "Arial, sans-serif" }}>
              Sound effects
            </span>
            <span className="text-[#D4AF37] font-bold text-[18px]">{Math.round(draft.sfxVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(draft.sfxVolume * 100)}
            onChange={(e) => {
              const v = Number(e.target.value) / 100;
              setDraft({ ...draft, sfxVolume: v });
              audioManager.setSfxVolume(v);
              audioManager.sfx("answerSelect"); // preview
            }}
            className="w-full"
            style={{ accentColor: "#D4AF37" }}
          />
        </div>

        {/* Music volume */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-white text-[18px]" style={{ fontFamily: "Arial, sans-serif" }}>
              Music
            </span>
            <span className="text-[#D4AF37] font-bold text-[18px]">{Math.round(draft.musicVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(draft.musicVolume * 100)}
            onChange={(e) => {
              const v = Number(e.target.value) / 100;
              setDraft({ ...draft, musicVolume: v });
              audioManager.setMusicVolume(v);
            }}
            className="w-full"
            style={{ accentColor: "#D4AF37" }}
          />
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="btn-gold">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

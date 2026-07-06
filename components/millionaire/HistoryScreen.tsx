"use client";

import { useState } from "react";
import { GameRecord, loadHistory, clearHistory, computeStats } from "@/lib/millionaire/history";
import { formatMoney } from "@/lib/millionaire/questions";

interface HistoryScreenProps {
  onBack: () => void;
}

const OUTCOME_LABELS: Record<GameRecord["outcome"], { label: string; color: string }> = {
  win: { label: "THẮNG", color: "#4FAE1A" },
  wrong: { label: "SAI", color: "#D0021B" },
  timeout: { label: "HẾT GIỜ", color: "#D0021B" },
  walk_away: { label: "DỪNG CUỘC CHƠI", color: "#D4AF37" },
};

export function HistoryScreen({ onBack }: HistoryScreenProps) {
  // Screen only mounts client-side (after a menu click), so reading
  // localStorage in the lazy initializer is safe
  const [history, setHistory] = useState<GameRecord[]>(() => loadHistory());

  const stats = computeStats(history);

  const handleClear = () => {
    if (confirm("Xoá toàn bộ lịch sử chơi?")) {
      clearHistory();
      setHistory([]);
    }
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden flex flex-col"
      style={{
        background: "radial-gradient(ellipse at center, #0A1A3A 0%, #050A18 80%, #000000 100%)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between flex-wrap"
        style={{ padding: "clamp(12px, 2cqh, 24px) clamp(12px, 3cqw, 40px) clamp(8px, 1.5cqh, 16px)", gap: "10px" }}
      >
        <h1
          className="text-white tracking-[0.2em] font-black"
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: "clamp(22px, 3.3cqw, 40px)",
            textShadow: "0 0 24px rgba(212,175,55,0.5)",
          }}
        >
          HISTORY
        </h1>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              border: "1px solid rgba(208,2,27,0.7)",
              color: "#FF6B6B",
              fontFamily: "Arial, sans-serif",
              fontSize: "15px",
            }}
          >
            Xoá lịch sử
          </button>
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              background: "rgba(1,29,84,0.8)",
              border: "1px solid #D4AF37",
              color: "#FFFFFF",
              fontFamily: "Arial, sans-serif",
              fontSize: "15px",
            }}
          >
            ← Menu
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div
        className="grid mb-4"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "clamp(8px, 1.2cqw, 16px)",
          padding: "0 clamp(12px, 3cqw, 40px)",
        }}
      >
        <StatCard label="Lượt chơi" value={String(stats.totalGames)} />
        <StatCard label="Kỷ lục thưởng" value={formatMoney(stats.bestWinnings)} gold />
        <StatCard label="Số lần thắng" value={String(stats.wins)} />
        <StatCard label="Tỉ lệ đúng TB" value={`${Math.round(stats.avgCorrectRate * 100)}%`} />
      </div>

      {/* Records */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: "0 clamp(12px, 3cqw, 40px) clamp(16px, 3cqh, 32px)" }}
      >
        {history.length === 0 ? (
          <p
            className="text-white/40 text-center mt-16 text-[18px]"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            Chưa có lượt chơi nào được ghi lại.
          </p>
        ) : (
          history.map((r, idx) => {
            const outcome = OUTCOME_LABELS[r.outcome] ?? OUTCOME_LABELS.wrong;
            return (
              <div
                key={idx}
                className="flex items-center flex-wrap gap-x-5 gap-y-1 mb-2 px-5 py-3 rounded-lg"
                style={{
                  background: "linear-gradient(135deg, rgba(1,29,84,0.6) 0%, rgba(26,22,84,0.6) 100%)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <span className="text-white/50 text-[14px] flex-shrink-0" style={{ fontFamily: "Arial, sans-serif", width: "150px" }}>
                  {new Date(r.date).toLocaleString("vi-VN")}
                </span>
                <span className="text-white font-bold text-[17px] flex-1 truncate" style={{ fontFamily: "Arial, sans-serif" }}>
                  {r.contestantName || "(không tên)"}
                  {r.location && <span className="text-white/50 font-normal text-[14px]"> — {r.location}</span>}
                </span>
                <span className="text-white text-[15px] flex-shrink-0" style={{ fontFamily: "Arial, sans-serif" }}>
                  Đúng {r.correctCount}/{r.totalQuestions}
                </span>
                <span
                  className="font-black text-[18px] flex-shrink-0 text-right"
                  style={{ color: "#FFD700", fontFamily: "Arial, sans-serif", width: "110px" }}
                >
                  {formatMoney(r.winnings)}
                </span>
                <span
                  className="font-bold text-[13px] flex-shrink-0 text-center px-2 py-1 rounded"
                  style={{
                    color: outcome.color,
                    border: `1px solid ${outcome.color}`,
                    fontFamily: "Arial, sans-serif",
                    width: "150px",
                  }}
                >
                  {outcome.label}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, gold = false }: { label: string; value: string; gold?: boolean }) {
  return (
    <div
      className="flex-1 text-center py-4 rounded-lg"
      style={{
        background: "linear-gradient(135deg, rgba(1,29,84,0.7) 0%, rgba(26,22,84,0.7) 100%)",
        border: `1px solid ${gold ? "#D4AF37" : "rgba(255,255,255,0.2)"}`,
      }}
    >
      <div
        className="font-black text-[28px]"
        style={{ color: gold ? "#FFD700" : "#FFFFFF", fontFamily: "Arial, sans-serif" }}
      >
        {value}
      </div>
      <div className="text-white/50 text-[13px] tracking-widest uppercase" style={{ fontFamily: "Arial, sans-serif" }}>
        {label}
      </div>
    </div>
  );
}

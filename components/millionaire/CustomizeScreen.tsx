"use client";

import { useState, useRef, useMemo } from "react";
import { Question, formatMoney } from "@/lib/millionaire/questions";
import {
  saveQuestions,
  resetToDefault,
  exportJson,
  importJson,
  MIN_QUESTIONS,
  MAX_QUESTIONS,
} from "@/lib/millionaire/questionStore";
import { buildPrizeLadder } from "@/lib/millionaire/prize";
import { QuestionEditor } from "./QuestionEditor";
import { audioManager } from "@/lib/millionaire/audio";

interface CustomizeScreenProps {
  questions: Question[];
  onQuestionsChange: (qs: Question[]) => void;
  onBack: () => void;
}

export function CustomizeScreen({ questions, onQuestionsChange, onBack }: CustomizeScreenProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null); // index being edited
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ladder = useMemo(() => buildPrizeLadder(questions.length), [questions.length]);

  const persist = (next: Question[]) => {
    onQuestionsChange(next);
    if (!saveQuestions(next)) {
      setNotice("Không lưu được vào bộ nhớ trình duyệt.");
    }
  };

  const handleSaveEdit = (q: Question) => {
    if (adding) {
      persist([...questions, q]);
      setAdding(false);
    } else if (editingIndex !== null) {
      const next = [...questions];
      next[editingIndex] = q;
      persist(next);
      setEditingIndex(null);
    }
    audioManager.sfx("buttonClick");
  };

  const handleDelete = (idx: number) => {
    if (questions.length <= MIN_QUESTIONS) {
      setNotice(`Bộ câu hỏi cần tối thiểu ${MIN_QUESTIONS} câu.`);
      return;
    }
    if (confirm(`Xoá câu hỏi #${idx + 1}?`)) {
      persist(questions.filter((_, i) => i !== idx));
    }
  };

  const handleMove = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= questions.length) return;
    const next = [...questions];
    [next[idx], next[target]] = [next[target], next[idx]];
    persist(next);
  };

  const handleReset = () => {
    if (confirm("Khôi phục bộ câu hỏi mặc định? Toàn bộ câu hỏi tự tạo sẽ bị xoá.")) {
      onQuestionsChange(resetToDefault());
      setNotice("Đã khôi phục bộ mặc định.");
    }
  };

  const handleExport = () => {
    const blob = new Blob([exportJson(questions)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "millionaire-questions.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const imported = importJson(String(reader.result));
      if (imported) {
        persist(imported);
        setNotice(`Đã nhập ${imported.length} câu hỏi.`);
      } else {
        setNotice(`File không hợp lệ. Cần mảng JSON gồm ${MIN_QUESTIONS}–${MAX_QUESTIONS} câu hỏi đúng định dạng.`);
      }
    };
    reader.readAsText(file);
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
          CUSTOMIZE
        </h1>
        <div className="flex gap-2 flex-wrap">
          <ToolbarButton label="+ Thêm câu hỏi" primary onClick={() => {
            if (questions.length >= MAX_QUESTIONS) {
              setNotice(`Tối đa ${MAX_QUESTIONS} câu hỏi.`);
              return;
            }
            setAdding(true);
          }} />
          <ToolbarButton label="Export JSON" onClick={handleExport} />
          <ToolbarButton label="Import JSON" onClick={() => fileInputRef.current?.click()} />
          <ToolbarButton label="Khôi phục mặc định" onClick={handleReset} />
          <ToolbarButton label="← Menu" onClick={onBack} />
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleImportFile(f);
          e.target.value = "";
        }}
      />

      {notice && (
        <div
          className="mx-10 mb-2 px-4 py-2 rounded-lg text-[15px] cursor-pointer"
          style={{
            background: "rgba(212,175,55,0.15)",
            border: "1px solid #D4AF37",
            color: "#D4AF37",
            fontFamily: "Arial, sans-serif",
          }}
          onClick={() => setNotice(null)}
        >
          {notice} (bấm để ẩn)
        </div>
      )}

      {/* Question list */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: "0 clamp(12px, 3cqw, 40px) clamp(16px, 3cqh, 32px)" }}
      >
        {questions.map((q, idx) => {
          const step = ladder[idx];
          return (
            <div
              key={idx}
              className="flex items-center flex-wrap gap-3 mb-3 rounded-lg"
              style={{
                padding: "clamp(10px, 1.5cqh, 16px) clamp(10px, 1.6cqw, 20px)",
                background: "linear-gradient(135deg, rgba(1,29,84,0.7) 0%, rgba(26,22,84,0.7) 100%)",
                border: `1px solid ${step?.safe ? "#D4AF37" : "rgba(255,255,255,0.2)"}`,
              }}
            >
              {/* Level + prize */}
              <div className="flex-shrink-0 text-center" style={{ width: "clamp(70px, 9cqw, 110px)" }}>
                <div className="text-white font-black text-[20px]" style={{ fontFamily: "Arial, sans-serif" }}>
                  #{idx + 1}
                </div>
                <div
                  className="text-[15px] font-bold"
                  style={{ color: step?.safe ? "#D4AF37" : "#FFFFFF99", fontFamily: "Arial, sans-serif" }}
                >
                  {step ? formatMoney(step.amount) : ""}
                  {step?.safe && " ★"}
                </div>
              </div>

              {/* Question + correct answer */}
              <div className="flex-1" style={{ minWidth: "min(200px, 50cqw)" }}>
                <p className="text-white text-[17px] truncate" style={{ fontFamily: "Arial, sans-serif" }}>
                  {q.question}
                </p>
                <p className="text-[#4FAE1A] text-[14px] truncate" style={{ fontFamily: "Arial, sans-serif" }}>
                  Đúng: {["A", "B", "C", "D"][q.correct]} — {q.answers[q.correct]}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                <SmallButton label="↑" onClick={() => handleMove(idx, -1)} disabled={idx === 0} />
                <SmallButton label="↓" onClick={() => handleMove(idx, 1)} disabled={idx === questions.length - 1} />
                <SmallButton label="Sửa" onClick={() => setEditingIndex(idx)} />
                <SmallButton label="Xoá" danger onClick={() => handleDelete(idx)} />
              </div>
            </div>
          );
        })}

        <p className="text-white/40 text-[14px] mt-4 text-center" style={{ fontFamily: "Arial, sans-serif" }}>
          {questions.length} câu hỏi · Mốc an toàn (★) tự tính ở 1/3, 2/3 chặng đường và câu cuối · Thang tiền tự nhân đôi từ 200
        </p>
      </div>

      {/* Editor modal */}
      {(adding || editingIndex !== null) && (
        <QuestionEditor
          initial={adding ? null : questions[editingIndex!]}
          questionNumber={adding ? questions.length + 1 : editingIndex! + 1}
          onSave={handleSaveEdit}
          onCancel={() => {
            setAdding(false);
            setEditingIndex(null);
          }}
        />
      )}
    </div>
  );
}

function ToolbarButton({
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
      className="px-4 py-2 rounded-lg transition-all hover:scale-[1.03]"
      style={{
        background: primary ? "#D4AF37" : "rgba(1,29,84,0.8)",
        border: `1px solid ${primary ? "#FFA500" : "#D4AF37"}`,
        color: primary ? "#000000" : "#FFFFFF",
        fontFamily: "Arial, sans-serif",
        fontSize: "15px",
        fontWeight: primary ? 700 : 500,
      }}
    >
      {label}
    </button>
  );
}

function SmallButton({
  label,
  onClick,
  disabled = false,
  danger = false,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-2 rounded-md transition-colors"
      style={{
        background: "transparent",
        border: `1px solid ${danger ? "rgba(208,2,27,0.7)" : "rgba(255,255,255,0.3)"}`,
        color: danger ? "#FF6B6B" : "#FFFFFF",
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
        opacity: disabled ? 0.3 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {label}
    </button>
  );
}

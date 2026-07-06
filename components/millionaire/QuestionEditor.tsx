"use client";

import { useState } from "react";
import { Question } from "@/lib/millionaire/questions";
import { validateQuestion } from "@/lib/millionaire/questionStore";

interface QuestionEditorProps {
  initial: Question | null;   // null = creating a new question
  questionNumber: number;     // 1-based, for the header
  onSave: (q: Question) => void;
  onCancel: () => void;
}

const EMPTY: Question = {
  question: "",
  answers: ["", "", "", ""],
  correct: 0,
};

export function QuestionEditor({ initial, questionNumber, onSave, onCancel }: QuestionEditorProps) {
  const [draft, setDraft] = useState<Question>(initial ?? EMPTY);
  const [error, setError] = useState<string | null>(null);

  const setAnswer = (idx: number, value: string) => {
    const answers = [...draft.answers] as Question["answers"];
    answers[idx] = value;
    setDraft({ ...draft, answers });
  };

  const handleSave = () => {
    if (!validateQuestion(draft)) {
      setError("Cần nhập nội dung câu hỏi và đủ 4 đáp án.");
      return;
    }
    onSave(draft);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 40 }}>
      <div className="modal-box game-panel" style={{ width: "min(94cqw, 720px)" }}>
        <h2
          className="text-white mb-6"
          style={{ fontSize: "clamp(19px, 2.2cqw, 26px)", fontWeight: "bold" }}
        >
          {initial ? `Sửa câu hỏi #${questionNumber}` : `Thêm câu hỏi #${questionNumber}`}
        </h2>

        <label className="block mb-5">
          <span className="text-[#D4AF37] text-[15px] block mb-2" style={{ fontFamily: "Arial, sans-serif" }}>
            Nội dung câu hỏi
          </span>
          <textarea
            value={draft.question}
            onChange={(e) => setDraft({ ...draft, question: e.target.value })}
            rows={3}
            className="w-full rounded-lg p-3 text-white"
            style={{
              background: "rgba(1,29,84,0.6)",
              border: "1px solid rgba(212,175,55,0.5)",
              fontFamily: "Arial, sans-serif",
              fontSize: "17px",
              resize: "vertical",
            }}
            placeholder="Nhập câu hỏi..."
          />
        </label>

        <span className="text-[#D4AF37] text-[15px] block mb-2" style={{ fontFamily: "Arial, sans-serif" }}>
          Đáp án (chọn nút tròn bên trái để đánh dấu đáp án đúng)
        </span>
        {draft.answers.map((ans, idx) => (
          <div key={idx} className="flex items-center gap-3 mb-3">
            <input
              type="radio"
              name="correct-answer"
              checked={draft.correct === idx}
              onChange={() => setDraft({ ...draft, correct: idx as Question["correct"] })}
              style={{ width: "20px", height: "20px", accentColor: "#4FAE1A", flexShrink: 0 }}
              title="Đáp án đúng"
            />
            <span
              className="font-black text-[20px] flex-shrink-0"
              style={{ color: draft.correct === idx ? "#4FAE1A" : "#FFA500", width: "28px", fontFamily: "Arial, sans-serif" }}
            >
              {["A", "B", "C", "D"][idx]}
            </span>
            <input
              type="text"
              value={ans}
              onChange={(e) => setAnswer(idx, e.target.value)}
              className="flex-1 rounded-lg p-3 text-white"
              style={{
                background: "rgba(1,29,84,0.6)",
                border: `1px solid ${draft.correct === idx ? "rgba(79,174,26,0.7)" : "rgba(212,175,55,0.4)"}`,
                fontFamily: "Arial, sans-serif",
                fontSize: "16px",
              }}
              placeholder={`Đáp án ${["A", "B", "C", "D"][idx]}...`}
            />
          </div>
        ))}

        {error && (
          <p className="text-[#FF6B6B] text-[15px] mt-3" style={{ fontFamily: "Arial, sans-serif" }}>
            {error}
          </p>
        )}

        <div className="flex gap-4 justify-end mt-6 flex-wrap">
          <button type="button" onClick={onCancel} className="btn-ghost">
            Huỷ
          </button>
          <button type="button" onClick={handleSave} className="btn-gold">
            Lưu câu hỏi
          </button>
        </div>
      </div>
    </div>
  );
}

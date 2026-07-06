"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AnswerBox } from "./AnswerBox";
import { LifelinesBar } from "./LifelinesBar";
import { SafeHavenFrame } from "./SafeHavenFrame";
import { SafeHavenMoneyLadder } from "./SafeHavenMoneyLadder";
import { CountdownTimer } from "./CountdownTimer";
import { Question, formatMoney } from "@/lib/millionaire/questions";
import { PrizeStep } from "@/lib/millionaire/prize";
import { GameSettings, timeLimitForLevel } from "@/lib/millionaire/settings";
import { audioManager } from "@/lib/millionaire/audio";
import {
  LifelineId,
  simulateAudiencePoll,
} from "@/lib/millionaire/lifelines";
import { AnswerState } from "@/lib/millionaire/state";

interface GameplayScreenProps {
  questions: Question[];
  ladder: PrizeStep[];
  settings: GameSettings;
  currentLevel: number;
  usedLifelines: Set<LifelineId>;
  onUseLifeline: (id: LifelineId) => void;
  onCorrect: (newLevel: number) => void;
  onWrong: () => void;
  onTimeout: () => void;
  onWalkAway: () => void;
  // 50:50 state
  disabledAnswers: Set<number>;
  setDisabledAnswers: (s: Set<number>) => void;
  // Double dip state
  doubleDipActive: boolean;
  setDoubleDipActive: (v: boolean) => void;
  doubleDipGuessesLeft: number;
  setDoubleDipGuessesLeft: (n: number) => void;
}

type RevealState =
  | "idle"           // choosing
  | "selected"       // answer selected, awaiting final confirm
  | "revealing"      // drum roll
  | "correct"        // green reveal
  | "wrong";         // red reveal

export function GameplayScreen(props: GameplayScreenProps) {
  const {
    questions,
    ladder,
    settings,
    currentLevel,
    usedLifelines,
    onUseLifeline,
    onCorrect,
    onWrong,
    onTimeout,
    onWalkAway,
    disabledAnswers,
    setDisabledAnswers,
    doubleDipActive,
    setDoubleDipActive,
    doubleDipGuessesLeft,
    setDoubleDipGuessesLeft,
  } = props;

  const question = questions[currentLevel - 1];
  const step = ladder[currentLevel - 1];
  const totalQuestions = questions.length;

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [revealState, setRevealState] = useState<RevealState>("idle");
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const [showAudienceModal, setShowAudienceModal] = useState(false);
  const [audiencePoll, setAudiencePoll] = useState<number[] | null>(null);
  const [showSafeHavenFrame, setShowSafeHavenFrame] = useState(false);
  const [safeHavenAmount, setSafeHavenAmount] = useState(0);
  const [fadeOutContent, setFadeOutContent] = useState(false);
  const [showSafeHavenMoneyLadder, setShowSafeHavenMoneyLadder] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  const schedule = useCallback((fn: () => void, ms: number) => {
    timeouts.current.push(setTimeout(fn, ms));
  }, []);

  useEffect(() => {
    const pending = timeouts.current;
    return () => {
      pending.forEach(clearTimeout);
      audioManager.stopSuspense();
    };
  }, []);

  const handleAnswerClick = useCallback(
    (idx: number) => {
      if (revealState !== "idle" && revealState !== "selected") return;
      if (disabledAnswers.has(idx)) return;
      audioManager.sfx("answerSelect");
      setSelectedAnswer(idx);
      setRevealState("selected");
      setShowFinalConfirm(true);
    },
    [revealState, disabledAnswers]
  );

  const handleFinalAnswer = useCallback(() => {
    if (selectedAnswer === null) return;
    setShowFinalConfirm(false);
    setRevealState("revealing");
    audioManager.sfx("finalAnswer");
    audioManager.sfx("suspense");

    // Suspense grows with the stakes: 1.5s early, up to 3s near the top
    const progress = totalQuestions > 1 ? (currentLevel - 1) / (totalQuestions - 1) : 0;
    const suspenseMs = 1500 + Math.round(progress * 1500);

    schedule(() => {
      audioManager.stopSuspense();
      const isCorrect = selectedAnswer === question.correct;
      if (isCorrect) {
        setRevealState("correct");
        audioManager.sfx("correct");

        // Safe haven celebration (not on the final question — the win screen handles that)
        const isSafeHavenStop = (step?.safe ?? false) && currentLevel < totalQuestions;

        if (isSafeHavenStop) {
          schedule(() => {
            // Special handling for level 3: play moc3 then mocintro
            if (currentLevel === 3) {
              const moc3Audio = new Audio("/moc3.mp3");
              moc3Audio.play().catch((e) => console.error("moc3 play failed:", e));
              moc3Audio.addEventListener('ended', () => {
                const mocintroAudio = new Audio("/mocintro.mp3");
                mocintroAudio.play().catch((e) => console.error("mocintro play failed:", e));
              });
            } else {
              audioManager.music("safeHaven");
            }
            
            setFadeOutContent(true);
            schedule(() => {
              setSafeHavenAmount(step.amount);
              setShowSafeHavenFrame(true);
              schedule(() => {
                setShowSafeHavenFrame(false);
                
                // Special handling for level 3: show money ladder after 2s
                if (currentLevel === 3) {
                  schedule(() => {
                    setShowSafeHavenMoneyLadder(true);
                  }, 2000);
                } else {
                  setFadeOutContent(false);
                  if (doubleDipActive) {
                    setDoubleDipActive(false);
                    setDoubleDipGuessesLeft(0);
                  }
                  onCorrect(currentLevel + 1);
                }
              }, 5000);
            }, 1000);
          }, 2500);
        } else {
          schedule(() => {
            if (doubleDipActive) {
              setDoubleDipActive(false);
              setDoubleDipGuessesLeft(0);
            }
            onCorrect(currentLevel + 1);
          }, 2500);
        }
      } else {
        // If double dip active and guesses left, just shake and reset
        if (doubleDipActive && doubleDipGuessesLeft > 1) {
          setRevealState("wrong");
          audioManager.sfx("wrong");
          schedule(() => {
            setRevealState("idle");
            setSelectedAnswer(null);
            setDisabledAnswers(new Set([...disabledAnswers, selectedAnswer]));
            setDoubleDipGuessesLeft(doubleDipGuessesLeft - 1);
          }, 1500);
        } else {
          setRevealState("wrong");
          audioManager.sfx("wrong");
          schedule(() => {
            onWrong();
          }, 3000);
        }
      }
    }, suspenseMs);
  }, [
    selectedAnswer,
    question,
    step,
    currentLevel,
    totalQuestions,
    onCorrect,
    onWrong,
    doubleDipActive,
    doubleDipGuessesLeft,
    disabledAnswers,
    setDisabledAnswers,
    setDoubleDipActive,
    setDoubleDipGuessesLeft,
    schedule,
  ]);

  const handleCancelFinal = useCallback(() => {
    audioManager.sfx("buttonClick");
    setShowFinalConfirm(false);
    setSelectedAnswer(null);
    setRevealState("idle");
  }, []);

  const handleTimeUp = useCallback(() => {
    if (revealState === "correct" || revealState === "wrong" || timedOut) return;
    setTimedOut(true);
    setShowFinalConfirm(false);
    setRevealState("wrong");
    audioManager.stopSuspense();
    audioManager.sfx("wrong");
    schedule(() => {
      onTimeout();
    }, 3000);
  }, [revealState, timedOut, onTimeout, schedule]);

  const handleMoneyLadderContinue = useCallback(() => {
    setShowSafeHavenMoneyLadder(false);
    setFadeOutContent(false);
    if (doubleDipActive) {
      setDoubleDipActive(false);
      setDoubleDipGuessesLeft(0);
    }
    onCorrect(currentLevel + 1);
  }, [doubleDipActive, currentLevel, onCorrect, setDoubleDipActive, setDoubleDipGuessesLeft]);

  const handleUseLifeline = useCallback(
    (id: LifelineId) => {
      if (usedLifelines.has(id)) return;
      if (revealState !== "idle") return;
      audioManager.sfx("lifeline");
      onUseLifeline(id);

      if (id === "fifty") {
        // Disable 2 wrong answers (keep correct + 1 wrong)
        const wrongIndices = [0, 1, 2, 3].filter((i) => i !== question.correct);
        const shuffled = wrongIndices.sort(() => Math.random() - 0.5);
        const toDisable = new Set([...disabledAnswers, shuffled[0], shuffled[1]]);
        setDisabledAnswers(toDisable);
      } else if (id === "audience") {
        const poll = simulateAudiencePoll(question.correct);
        setAudiencePoll(poll);
        setShowAudienceModal(true);
      } else if (id === "double") {
        setDoubleDipActive(true);
        setDoubleDipGuessesLeft(2);
      }
    },
    [
      usedLifelines,
      revealState,
      onUseLifeline,
      question,
      disabledAnswers,
      setDisabledAnswers,
      setDoubleDipActive,
      setDoubleDipGuessesLeft,
    ]
  );

  // Keyboard shortcuts: A-D select, Enter confirm, Escape cancel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (showFinalConfirm) {
        if (e.key === "Enter") handleFinalAnswer();
        if (e.key === "Escape") handleCancelFinal();
        return;
      }
      if (showAudienceModal && (e.key === "Enter" || e.key === "Escape")) {
        setShowAudienceModal(false);
        return;
      }
      const idx = ["A", "B", "C", "D"].indexOf(key);
      if (idx >= 0) handleAnswerClick(idx);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showFinalConfirm, showAudienceModal, handleFinalAnswer, handleCancelFinal, handleAnswerClick]);

  // Guard: if question doesn't exist, show error
  if (!question) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <p className="text-white text-2xl">Error: Invalid question level {currentLevel}</p>
      </div>
    );
  }

  // Compute answer state for each box
  const getAnswerState = (idx: number): AnswerState => {
    if (disabledAnswers.has(idx)) return "disabled";
    if (revealState === "correct" && idx === question.correct) return "correct";
    if (revealState === "wrong") {
      if (idx === selectedAnswer) return "wrong";
      if (idx === question.correct) return "correct";
    }
    if (selectedAnswer === idx) return "selected";
    return "default";
  };

  const timerRunning =
    settings.timerEnabled &&
    revealState === "idle" &&
    !showFinalConfirm &&
    !showAudienceModal;

  const isRevealing = revealState === "revealing";
  const contentFade = {
    opacity: fadeOutContent ? 0 : 1,
    transition: "opacity 1s ease-out",
  } as const;

  return (
    <div
      className={`gameplay-screen relative w-full h-full overflow-hidden flex flex-col ${
        revealState === "wrong" ? "shake-screen" : ""
      }`}
      style={{
        backgroundImage: "url('/gameplay-background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "clamp(10px, 1.8cqw, 24px)",
        gap: "clamp(6px, 1.2cqh, 16px)",
      }}
    >
      {/* Dark overlay for better text readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{background: "rgba(0, 0, 0, 0.45)"}}
      />
      {/* Stage glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 20%, rgba(119,73,200,0.15) 0%, transparent 70%)",
        }}
      />

      {/* Suspense dim while revealing */}
      {isRevealing && (
        <div
          className="absolute inset-0 pointer-events-none z-[15]"
          style={{ animation: "suspense-dim 1s ease-out forwards" }}
        />
      )}

      {/* Result flash */}
      {(revealState === "correct" || revealState === "wrong") && (
        <div
          className="absolute inset-0 pointer-events-none z-[15]"
          style={{
            animation: `${revealState === "correct" ? "flash-green" : "flash-red"} 1.2s ease-out forwards`,
          }}
        />
      )}

      {/* ===== Header: lifelines | level + walk away | logo + timer ===== */}
      <header
        className="relative z-20 flex items-start justify-between flex-wrap"
        style={{ gap: "clamp(6px, 1.5cqw, 16px)", ...contentFade }}
      >
        <div className="flex flex-col" style={{ gap: "6px" }}>
          <LifelinesBar
            usedLifelines={usedLifelines}
            onUse={handleUseLifeline}
            disabled={revealState !== "idle"}
          />
          {doubleDipActive && (
            <div
              className="px-3 py-1 tracking-widest text-center"
              style={{
                fontSize: "clamp(10px, 1cqw, 12px)",
                background: "rgba(212,175,55,0.2)",
                border: "1px solid var(--gold)",
                color: "var(--gold)",
                borderRadius: "4px",
              }}
            >
              DOUBLE DIP · {doubleDipGuessesLeft} GUESS LEFT
            </div>
          )}
        </div>

        <div className="flex flex-col items-center" style={{ gap: "6px" }}>
          <div
            className="tracking-widest text-center"
            style={{
              color: "var(--gold)",
              fontSize: "clamp(11px, 1.3cqw, 14px)",
              fontWeight: 700,
              textShadow: "0 2px 6px rgba(0,0,0,0.8)",
            }}
          >
            QUESTION {currentLevel} / {totalQuestions} — {formatMoney(step?.amount ?? 0)}
          </div>
          <button
            type="button"
            onClick={() => {
              audioManager.sfx("buttonClick");
              onWalkAway();
            }}
            disabled={revealState !== "idle" || currentLevel === 1}
            className="walk-away-btn tracking-widest transition-all"
            style={{
              fontSize: "clamp(10px, 1.1cqw, 12px)",
              padding: "0.6em 1.2em",
              minHeight: "38px",
              background: "rgba(255,255,153,0.15)",
              border: "1px solid #FFFF99",
              color: "#FFFF99",
              borderRadius: "4px",
              cursor: revealState !== "idle" || currentLevel === 1 ? "not-allowed" : "pointer",
              opacity: currentLevel === 1 ? 0.3 : 1,
            }}
          >
            WALK AWAY WITH {formatMoney(ladder[currentLevel - 2]?.amount || 0)}
          </button>
        </div>

        <div className="flex items-start" style={{ gap: "clamp(8px, 1.5cqw, 16px)" }}>
          {settings.timerEnabled && (
            <CountdownTimer
              totalSeconds={timeLimitForLevel(currentLevel, totalQuestions, settings)}
              running={timerRunning}
              onTimeout={handleTimeUp}
            />
          )}
          <img
            className="gp-logo"
            src="/icons/Main Logo Cropped.png"
            alt="Who Wants to Be a Millionaire"
            style={{
              width: "clamp(80px, 11cqw, 140px)",
              height: "auto",
              filter: "drop-shadow(0 0 20px rgba(212,175,55,0.5))",
            }}
          />
        </div>
      </header>

      {/* ===== Question banner (fills the middle) ===== */}
      <div
        className="relative z-10 flex-1 flex items-center justify-center min-h-0"
        style={{
          ...contentFade,
          opacity: fadeOutContent ? 0 : isRevealing ? 0.5 : 1,
        }}
      >
        <div
          className="question-banner rounded-xl flex items-center justify-center"
          style={{
            width: "min(96cqw, 1180px)",
            minHeight: "clamp(80px, 20cqh, 160px)",
            padding: "clamp(14px, 2.5cqw, 40px)",
            background: "linear-gradient(135deg, #0D0A10 0%, #131044 100%)",
            border: "2px solid var(--gold)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 16px rgba(212,175,55,0.15) inset",
          }}
        >
          <p
            className="text-white text-center"
            style={{
              fontSize:
                question.question.length > 180
                  ? "clamp(14px, 2cqw, 26px)"
                  : question.question.length > 110
                  ? "clamp(15px, 2.3cqw, 30px)"
                  : "clamp(16px, 2.7cqw, 34px)",
              fontWeight: 500,
              lineHeight: 1.4,
            }}
          >
            {question.question}
          </p>
        </div>
      </div>

      {/* ===== Answer grid ===== */}
      <div className="answer-grid relative z-20" style={contentFade}>
        {question.answers.map((ans, idx) => (
          <div
            key={idx}
            style={{
              // Spotlight: while revealing, dim every answer except the chosen one
              opacity: isRevealing && idx !== selectedAnswer ? 0.25 : 1,
              transition: "opacity 0.6s ease-out",
            }}
          >
            <AnswerBox
              letter={["A", "B", "C", "D"][idx] as "A" | "B" | "C" | "D"}
              text={ans}
              state={getAnswerState(idx)}
              index={idx}
              onClick={() => handleAnswerClick(idx)}
            />
          </div>
        ))}
      </div>

      {/* Keyboard hint (hidden on touch-first narrow stages via CSS) */}
      <div
        className="gp-logo relative z-10 text-center text-white/30 tracking-widest"
        style={{ fontSize: "clamp(9px, 1cqw, 12px)" }}
      >
        PRESS A · B · C · D TO ANSWER
      </div>

      {/* Final answer confirm modal */}
      {showFinalConfirm && (
        <div className="modal-overlay">
          <div className="modal-box game-panel text-center">
            <h3
              className="text-white mb-2"
              style={{ fontSize: "clamp(20px, 2.8cqw, 32px)", fontWeight: "bold" }}
            >
              Is that your final answer?
            </h3>
            <p
              className="mb-8"
              style={{
                color: "var(--gold)",
                fontSize: "clamp(14px, 1.6cqw, 18px)",
                letterSpacing: "0.1em",
              }}
            >
              You selected: {["A", "B", "C", "D"][selectedAnswer!]} — {question.answers[selectedAnswer!]}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button type="button" onClick={handleCancelFinal} className="btn-ghost">
                No, change (Esc)
              </button>
              <button type="button" onClick={handleFinalAnswer} className="btn-gold">
                Yes, final answer (Enter)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audience poll modal */}
      {showAudienceModal && audiencePoll && (
        <div className="modal-overlay">
          <div className="modal-box game-panel">
            <h3
              className="text-white text-center mb-8"
              style={{ fontSize: "clamp(18px, 2.4cqw, 28px)", fontWeight: "bold" }}
            >
              Ask the Audience
            </h3>
            <div
              className="flex items-end justify-around gap-2"
              style={{ height: "clamp(140px, 32cqh, 240px)" }}
            >
              {audiencePoll.map((pct, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 flex-1" style={{ maxWidth: "100px" }}>
                  <span className="text-white font-bold" style={{ fontSize: "clamp(14px, 2cqw, 24px)" }}>
                    {pct}%
                  </span>
                  <div
                    style={{
                      width: "min(60px, 70%)",
                      height: `${pct}%`,
                      minHeight: "4px",
                      background: "#081D5E",
                      border: "2px solid #DFE8F2",
                      borderRadius: "4px 4px 0 0",
                    }}
                  />
                  <span className="font-bold" style={{ color: "var(--gold)", fontSize: "clamp(14px, 1.7cqw, 20px)" }}>
                    {["A", "B", "C", "D"][idx]}
                  </span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                audioManager.sfx("buttonClick");
                setShowAudienceModal(false);
              }}
              className="btn-gold block mx-auto mt-8"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Reveal overlay text */}
      {(revealState === "correct" || revealState === "wrong") && (
        <div
          className="absolute left-1/2 -translate-x-1/2 z-30"
          style={{ bottom: "clamp(8px, 2cqh, 24px)", maxWidth: "94cqw" }}
        >
          <div
            className="px-6 py-3 rounded-lg text-center"
            style={{
              background: revealState === "correct" ? "var(--green)" : "var(--red)",
              color: "#FFFFFF",
              fontSize: "clamp(13px, 1.7cqw, 20px)",
              fontWeight: "bold",
              letterSpacing: "0.1em",
              boxShadow: "0 0 24px " + (revealState === "correct" ? "rgba(79,174,26,0.6)" : "rgba(208,2,27,0.6)"),
            }}
          >
            {revealState === "correct"
              ? currentLevel >= totalQuestions
                ? "CORRECT!"
                : `CORRECT! Moving to ${formatMoney(ladder[currentLevel]?.amount || 0)}`
              : timedOut
              ? `TIME'S UP — The correct answer was ${["A", "B", "C", "D"][question.correct]}`
              : `WRONG — The correct answer was ${["A", "B", "C", "D"][question.correct]}`}
          </div>
        </div>
      )}

      {/* Safe Haven Frame */}
      <SafeHavenFrame amount={safeHavenAmount} visible={showSafeHavenFrame} />
      
      {/* Safe Haven Money Ladder (for level 3 only) */}
      <SafeHavenMoneyLadder 
        visible={showSafeHavenMoneyLadder} 
        safeHavenLevel={3} 
        onContinue={handleMoneyLadderContinue}
      />
    </div>
  );
}

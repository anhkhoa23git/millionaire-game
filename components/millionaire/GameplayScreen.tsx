"use client";

import { useState, useEffect, useCallback } from "react";
import { AnswerBox } from "./AnswerBox";
import { LifelinesBar } from "./LifelinesBar";
import { MillionaireLogo } from "./MillionaireLogo";
import { SafeHavenFrame } from "./SafeHavenFrame";
import { SafeHavenMoneyLadder } from "./SafeHavenMoneyLadder";
import { QUESTIONS, formatMoney, SAFE_HAVENS } from "@/lib/millionaire/questions";
import {
  LifelineId,
  simulateAudiencePoll,
} from "@/lib/millionaire/lifelines";
import { AnswerState } from "@/lib/millionaire/state";

interface GameplayScreenProps {
  currentLevel: number;
  usedLifelines: Set<LifelineId>;
  onUseLifeline: (id: LifelineId) => void;
  onCorrect: (newLevel: number) => void;
  onWrong: () => void;
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
    currentLevel,
    usedLifelines,
    onUseLifeline,
    onCorrect,
    onWrong,
    onWalkAway,
    disabledAnswers,
    setDisabledAnswers,
    doubleDipActive,
    setDoubleDipActive,
    doubleDipGuessesLeft,
    setDoubleDipGuessesLeft,
  } = props;

  const question = QUESTIONS[currentLevel - 1];
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [revealState, setRevealState] = useState<RevealState>("idle");
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const [showAudienceModal, setShowAudienceModal] = useState(false);
  const [audiencePoll, setAudiencePoll] = useState<number[] | null>(null);
  const [showSafeHavenFrame, setShowSafeHavenFrame] = useState(false);
  const [safeHavenAmount, setSafeHavenAmount] = useState(0);
  const [fadeOutContent, setFadeOutContent] = useState(false);
  const [waitingForClick, setWaitingForClick] = useState(false);
  const [showCorrectMessage, setShowCorrectMessage] = useState(false);
  const [showSafeHavenMoneyLadder, setShowSafeHavenMoneyLadder] = useState(false);

  const handleAnswerClick = useCallback(
    (idx: number) => {
      if (revealState !== "idle" && revealState !== "selected") return;
      if (disabledAnswers.has(idx)) return;
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

    // Wait 3s before showing correct state
    setTimeout(() => {
      const isCorrect = selectedAnswer === question.correct;
      console.log("Answer check:", { isCorrect, currentLevel, questionSafe: question.safe });
      if (isCorrect) {
        setRevealState("correct");
        setShowCorrectMessage(true);
        
        // Play audio: moc3 for level 3, dapandung for others
        const audioFile = currentLevel === 3 ? "/moc3.mp3" : "/dapandung.mp3";
        const audio = new Audio(audioFile);
        audio.play().catch((e) => console.error("Audio play failed:", e));
        
        // For level 3: play mocintro after moc3 ends
        if (currentLevel === 3) {
          audio.addEventListener('ended', () => {
            const mocintroAudio = new Audio("/mocintro.mp3");
            mocintroAudio.play().catch((e) => console.error("Mocintro audio play failed:", e));
          });
        }
        
        // Wait 3s for "CORRECT" message, then hide it and show prize frame
        setTimeout(() => {
          setShowCorrectMessage(false);
          
          // Fade out question and answers
          setFadeOutContent(true);
          
          // Show prize won frame after 500ms
          setTimeout(() => {
            setSafeHavenAmount(question.amount);
            setShowSafeHavenFrame(true);
            
            // Hide frame after 5s
            setTimeout(() => {
              setShowSafeHavenFrame(false);
              
              // Special handling for level 3: show money ladder after 2s delay
              if (currentLevel === 3) {
                setTimeout(() => {
                  setShowSafeHavenMoneyLadder(true);
                }, 2000);
              } else {
                setWaitingForClick(true);
              }
            }, 5000);
          }, 500);
        }, 3000);
      } else {
        // If double dip active and guesses left, just shake and reset
        if (doubleDipActive && doubleDipGuessesLeft > 1) {
          setRevealState("wrong");
          setTimeout(() => {
            setRevealState("idle");
            setSelectedAnswer(null);
            setDisabledAnswers(new Set([...disabledAnswers, selectedAnswer]));
            setDoubleDipGuessesLeft(doubleDipGuessesLeft - 1);
          }, 1500);
        } else {
          setRevealState("wrong");
          setTimeout(() => {
            onWrong();
          }, 3000);
        }
      }
    }, 1500);
  }, [
    selectedAnswer,
    question,
    currentLevel,
    onCorrect,
    onWrong,
    doubleDipActive,
    doubleDipGuessesLeft,
    disabledAnswers,
    setDisabledAnswers,
    setDoubleDipActive,
    setDoubleDipGuessesLeft,
  ]);

  const handleCancelFinal = useCallback(() => {
    setShowFinalConfirm(false);
    setSelectedAnswer(null);
    setRevealState("idle");
  }, []);

  // Handle click to continue after prize display
  const handleClickToContinue = useCallback(() => {
    if (!waitingForClick) return;
    setWaitingForClick(false);
    setFadeOutContent(false);
    if (doubleDipActive) {
      setDoubleDipActive(false);
      setDoubleDipGuessesLeft(0);
    }
    onCorrect(currentLevel + 1);
  }, [waitingForClick, doubleDipActive, currentLevel, onCorrect, setDoubleDipActive, setDoubleDipGuessesLeft]);

  // Handle money ladder continue (for level 3)
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
      onUseLifeline(id);

      if (id === "fifty") {
        // Disable 2 wrong answers (keep correct + 1 wrong)
        const wrongIndices = [0, 1, 2, 3].filter((i) => i !== question.correct);
        // Pick 2 random wrong to disable
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

  return (
    <div
      className="gameplay-screen relative w-full h-full overflow-hidden cursor-pointer"
      style={{backgroundImage: "url('/gameplay-background.png')", backgroundSize: "cover", backgroundPosition: "center"}}
      onClick={waitingForClick ? handleClickToContinue : undefined}
    >
      {/* Dark overlay for better text readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{background: "rgba(0, 0, 0, 0.3)"}}
      />
      {/* Stage glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 20%, rgba(119,73,200,0.15) 0%, transparent 70%)",
        }}
      />

      {/* Lifelines top-left */}
      <div 
        className="absolute top-6 left-6 z-20"
        style={{
          opacity: fadeOutContent ? 0 : 1,
          transition: "opacity 1s ease-out",
        }}
      >
        <LifelinesBar
          usedLifelines={usedLifelines}
          onUse={handleUseLifeline}
          disabled={revealState !== "idle"}
        />
        {/* Double dip indicator */}
        {doubleDipActive && (
          <div
            className="mt-2 px-3 py-1 text-[12px] tracking-widest text-center"
            style={{
              background: "rgba(212,175,55,0.2)",
              border: "1px solid #D4AF37",
              color: "#D4AF37",
              borderRadius: "4px",
              fontFamily: "Arial, sans-serif",
            }}
          >
            DOUBLE DIP · {doubleDipGuessesLeft} GUESS LEFT
          </div>
        )}
      </div>

      {/* Logo top-right */}
      <div 
        className="absolute top-6 right-6 z-20"
        style={{
          opacity: fadeOutContent ? 0 : 1,
          transition: "opacity 1s ease-out",
        }}
      >
        <img
          src="/icons/Main Logo Cropped.png"
          alt="Who Wants to Be a Millionaire"
          style={{
            width: "140px",
            height: "auto",
            filter: "drop-shadow(0 0 20px rgba(212,175,55,0.5))",
          }}
        />
      </div>

      {/* Walk Away button — top center, small */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
        <button
          type="button"
          onClick={onWalkAway}
          disabled={revealState !== "idle" || currentLevel === 1}
          className="walk-away-btn px-4 py-2 text-[12px] tracking-widest transition-all"
          style={{
            background: "rgba(255,255,153,0.15)",
            border: "1px solid #FFFF99",
            color: "#FFFF99",
            borderRadius: "4px",
            fontFamily: "Arial, sans-serif",
            cursor: revealState !== "idle" || currentLevel === 1 ? "not-allowed" : "pointer",
            opacity: currentLevel === 1 ? 0.3 : 1,
          }}
        >
          WALK AWAY WITH {formatMoney(QUESTIONS[currentLevel - 2]?.amount || 0)}
        </button>
      </div>

      {/* Question banner */}
      <div
        className="absolute z-10"
        style={{
          top: "140px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "1180px",
          opacity: fadeOutContent ? 0 : 1,
          transition: "opacity 1s ease-out",
        }}
      >
        <div
          className="question-banner relative rounded-xl px-10 py-8"
          style={{
            background: "linear-gradient(135deg, #16111A 0%, #1A1654 100%)",
            border: "2px solid #D4AF37",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 16px rgba(212,175,55,0.15) inset",
            minHeight: "160px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p
            className="text-white text-center"
            style={{
              fontFamily: "Arial, sans-serif",
              fontSize: "34px",
              fontWeight: "500",
              lineHeight: 1.3,
              textShadow: "0 2px 8px rgba(0,0,0,0.8)",
            }}
          >
            {question.question}
          </p>
        </div>
      </div>

      {/* Answer grid 2x2 */}
      <div
        className="absolute z-10 grid grid-cols-2 gap-5"
        style={{
          bottom: "60px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "1180px",
          opacity: fadeOutContent ? 0 : 1,
          transition: "opacity 1s ease-out",
        }}
      >
        {question.answers.map((ans, idx) => (
          <AnswerBox
            key={idx}
            letter={["A", "B", "C", "D"][idx] as "A" | "B" | "C" | "D"}
            text={ans}
            state={getAnswerState(idx)}
            index={idx}
            onClick={() => handleAnswerClick(idx)}
          />
        ))}
      </div>

      {/* Final answer confirm modal */}
      {showFinalConfirm && (
        <div className="absolute inset-0 z-30 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div
            className="text-center p-10 rounded-xl"
            style={{
              background: "linear-gradient(135deg, #16111A 0%, #1A1654 100%)",
              border: "2px solid #D4AF37",
              boxShadow: "0 0 48px rgba(212,175,55,0.4)",
            }}
          >
            <h3
              className="text-white mb-2"
              style={{
                fontFamily: "Arial, sans-serif",
                fontSize: "32px",
                fontWeight: "bold",
              }}
            >
              Is that your final answer?
            </h3>
            <p
              className="text-[#D4AF37] mb-8"
              style={{ fontFamily: "Arial, sans-serif", fontSize: "18px", letterSpacing: "0.1em" }}
            >
              You selected: {["A", "B", "C", "D"][selectedAnswer!]} — {question.answers[selectedAnswer!]}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                type="button"
                onClick={handleCancelFinal}
                className="px-8 py-3 text-white border-2 border-white/40 hover:border-white rounded-lg transition-colors"
                style={{ fontFamily: "Arial, sans-serif", fontSize: "18px" }}
              >
                No, change
              </button>
              <button
                type="button"
                onClick={handleFinalAnswer}
                className="px-8 py-3 rounded-lg font-bold transition-transform hover:scale-105"
                style={{
                  background: "#D4AF37",
                  border: "2px solid #FFA500",
                  color: "#000000",
                  fontFamily: "Arial, sans-serif",
                  fontSize: "18px",
                }}
              >
                Yes, final answer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audience poll modal */}
      {showAudienceModal && audiencePoll && (
        <div className="absolute inset-0 z-30 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div
            className="p-10 rounded-xl"
            style={{
              background: "linear-gradient(135deg, #16111A 0%, #1A1654 100%)",
              border: "2px solid #D4AF37",
              width: "640px",
            }}
          >
            <h3
              className="text-white text-center mb-8"
              style={{ fontFamily: "Arial, sans-serif", fontSize: "28px", fontWeight: "bold" }}
            >
              Ask the Audience
            </h3>
            <div className="flex items-end justify-around gap-4" style={{ height: "240px" }}>
              {audiencePoll.map((pct, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2" style={{ width: "100px" }}>
                  <span className="text-white text-[24px] font-bold" style={{ fontFamily: "Arial, sans-serif" }}>
                    {pct}%
                  </span>
                  <div
                    style={{
                      width: "60px",
                      height: `${pct * 1.8}px`,
                      background: idx === question.correct ? "#4FAE1A" : "#081D5E",
                      border: "2px solid #DFE8F2",
                      borderRadius: "4px 4px 0 0",
                    }}
                  />
                  <span className="text-[#D4AF37] text-[20px] font-bold" style={{ fontFamily: "Arial, sans-serif" }}>
                    {["A", "B", "C", "D"][idx]}
                  </span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowAudienceModal(false)}
              className="block mx-auto mt-8 px-8 py-3 rounded-lg font-bold"
              style={{
                background: "#D4AF37",
                border: "2px solid #FFA500",
                color: "#000000",
                fontFamily: "Arial, sans-serif",
                fontSize: "16px",
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Reveal overlay text */}
      {showCorrectMessage && revealState === "correct" && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
          <div
            className="px-8 py-3 rounded-lg"
            style={{
              background: "#4FAE1A",
              color: "#FFFFFF",
              fontFamily: "Arial, sans-serif",
              fontSize: "20px",
              fontWeight: "bold",
              letterSpacing: "0.1em",
              boxShadow: "0 0 24px rgba(79,174,26,0.6)",
            }}
          >
            CORRECT! Moving to {formatMoney(QUESTIONS[currentLevel]?.amount || 0)}
          </div>
        </div>
      )}
      
      {/* Wrong answer message */}
      {revealState === "wrong" && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
          <div
            className="px-8 py-3 rounded-lg"
            style={{
              background: "#D0021B",
              color: "#FFFFFF",
              fontFamily: "Arial, sans-serif",
              fontSize: "20px",
              fontWeight: "bold",
              letterSpacing: "0.1em",
              boxShadow: "0 0 24px rgba(208,2,27,0.6)",
            }}
          >
            WRONG — The correct answer was {["A", "B", "C", "D"][question.correct]}
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





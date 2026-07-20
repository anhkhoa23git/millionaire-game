// Central game-flow state machine for the millionaire game.
// Extracted from app/page.tsx so the page component stays a thin render
// layer. Holds every screen state + transition handler and exposes them
// for the JSX in Home().

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { setSkipHandler } from "@/lib/millionaire/skip";
import { Question } from "@/lib/millionaire/questions";
import { loadQuestions } from "@/lib/millionaire/questionStore";
import { buildPrizeLadder, computeWinnings, GameOutcome } from "@/lib/millionaire/prize";
import { appendGameRecord } from "@/lib/millionaire/history";
import { GameSettings, loadSettings, saveSettings, clampTotalQuestions } from "@/lib/millionaire/settings";
import { audioManager } from "@/lib/millionaire/audio";
import { ContestantInfo, ScreenId } from "@/lib/millionaire/state";
import { LifelineId } from "@/lib/millionaire/lifelines";

export interface GameFlow {
  // screen state
  screen: ScreenId;
  setScreen: React.Dispatch<React.SetStateAction<ScreenId>>;
  contestant: ContestantInfo;
  currentLevel: number;
  finalLevel: number;
  usedLifelines: Set<LifelineId>;
  disabledAnswers: Set<number>;
  doubleDipActive: boolean;
  doubleDipGuessesLeft: number;
  endWinnings: number;
  // logo / banner animation state
  showLogo: boolean;
  logoMoveUp: boolean;
  logoMoveToCenter: boolean;
  formFadeOut: boolean;
  videoEnded: boolean;
  bannersSlideOut: boolean;
  // settings modal
  showSettings: boolean;
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
  settings: GameSettings;
  questions: Question[];
  ladder: ReturnType<typeof buildPrizeLadder>;
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  setDisabledAnswers: React.Dispatch<React.SetStateAction<Set<number>>>;
  setDoubleDipActive: React.Dispatch<React.SetStateAction<boolean>>;
  setDoubleDipGuessesLeft: React.Dispatch<React.SetStateAction<number>>;
  // handlers
  handlePlay: () => void;
  handleCustomize: () => void;
  handleHistory: () => void;
  handleSettings: () => void;
  handleSaveSettings: (s: GameSettings) => void;
  handleReset: () => void;
  handleExit: () => void;
  handleIntroVideoEnd: () => void;
  handleWelcomeContinue: () => void;
  handleContestantIntroContinue: () => void;
  handleFormSubmit: (name: string, location: string) => void;
  handleTransitionVideoEnd: () => void;
  handleBannersContinue: () => void;
  handleIntroductionContinue: () => void;
  handleUseLifeline: (id: LifelineId) => void;
  handleCorrect: (newLevel: number) => void;
  handleWrong: () => void;
  handleTimeout: () => void;
  handleWalkAway: () => void;
  handleEndContinue: () => void;
  handleOutroContinue: () => void;
  handleReturn: () => void;
  showLogoInScreens: boolean;
}

export function useGameFlow(): GameFlow {
  const [screen, setScreen] = useState<ScreenId>("menu");
  const [contestant, setContestant] = useState<ContestantInfo>({ name: "", location: "" });
  const [currentLevel, setCurrentLevel] = useState(1);
  const [finalLevel, setFinalLevel] = useState(1);
  const [usedLifelines, setUsedLifelines] = useState<Set<LifelineId>>(new Set());
  const [disabledAnswers, setDisabledAnswers] = useState<Set<number>>(new Set());
  const [doubleDipActive, setDoubleDipActive] = useState(false);
  const [doubleDipGuessesLeft, setDoubleDipGuessesLeft] = useState(0);
  const [endWinnings, setEndWinnings] = useState(0);
  const [showLogo, setShowLogo] = useState(false);
  const [logoMoveUp, setLogoMoveUp] = useState(false);
  const [logoMoveToCenter, setLogoMoveToCenter] = useState(false);
  const [formFadeOut, setFormFadeOut] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [bannersSlideOut, setBannersSlideOut] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Questions + settings live in localStorage. Lazy initializers read it on the
  // client; on the server the loaders fall back to defaults. The menu screen
  // renders identically either way, so hydration stays consistent.
  const [questions, setQuestions] = useState<Question[]>(() => loadQuestions());
  const [settings, setSettings] = useState<GameSettings>(() => loadSettings());

  useEffect(() => {
    audioManager.setSfxVolume(settings.sfxVolume);
    audioManager.setMusicVolume(settings.musicVolume);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ladder = useMemo(
    () => buildPrizeLadder(settings.totalQuestions, settings.topPrize),
    [settings.totalQuestions, settings.topPrize]
  );

  const recordGame = useCallback(
    (correctCount: number, winnings: number, outcome: GameOutcome) => {
      appendGameRecord({
        date: new Date().toISOString(),
        contestantName: contestant.name,
        location: contestant.location,
        correctCount,
        totalQuestions: questions.length,
        winnings,
        outcome,
        lifelinesUsed: [...usedLifelines],
      });
    },
    [contestant, questions.length, usedLifelines]
  );

  // Pending logo-animation timers. Tracked so we can cancel them when the
  // user navigates back (or replays) — otherwise a queued "move logo up"
  // fires on a later screen and the logo gets stuck at the top over its text.
  const logoTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const scheduleLogo = useCallback((fn: () => void, ms: number) => {
    logoTimers.current.push(setTimeout(fn, ms));
  }, []);
  const resetLogoPosition = useCallback(() => {
    logoTimers.current.forEach(clearTimeout);
    logoTimers.current = [];
    setLogoMoveUp(false);
    setLogoMoveToCenter(false);
    setFormFadeOut(false);
  }, []);

  // ---------- State transitions ----------
  const handlePlay = useCallback(() => {
    // Reset all state for new game; re-read questions so edits apply immediately
    audioManager.sfx("buttonClick");
    const loaded = loadQuestions();
    // Require at least as many questions as the chosen total.
    if (loaded.length < settings.totalQuestions) {
      alert(
        `Cần ít nhất ${settings.totalQuestions} câu hỏi để chơi (hiện có ${loaded.length}). ` +
          `Hãy thêm câu hỏi trong màn hình Customize.`
      );
      return;
    }
    setQuestions(loaded);
    setCurrentLevel(1);
    setFinalLevel(1);
    setUsedLifelines(new Set());
    setDisabledAnswers(new Set());
    setDoubleDipActive(false);
    setDoubleDipGuessesLeft(0);
    resetLogoPosition();
    setShowLogo(false);
    setScreen("intro_video");
  }, [resetLogoPosition, settings.totalQuestions]);

  const handleCustomize = useCallback(() => {
    audioManager.sfx("buttonClick");
    setQuestions(loadQuestions());
    setScreen("customize");
  }, []);

  const handleHistory = useCallback(() => {
    audioManager.sfx("buttonClick");
    setScreen("history");
  }, []);

  const handleSettings = useCallback(() => {
    audioManager.sfx("buttonClick");
    setShowSettings(true);
  }, []);

  const handleSaveSettings = useCallback((s: GameSettings) => {
    setSettings(s);
    saveSettings(s);
    audioManager.setSfxVolume(s.sfxVolume);
    audioManager.setMusicVolume(s.musicVolume);
  }, []);

  const handleReset = useCallback(() => {
    if (confirm("Are you sure you want to reset the game?")) {
      setCurrentLevel(1);
      setFinalLevel(1);
      setUsedLifelines(new Set());
      setDisabledAnswers(new Set());
      setDoubleDipActive(false);
      setDoubleDipGuessesLeft(0);
      setContestant({ name: "", location: "" });
      resetLogoPosition();
      setScreen("menu");
    }
  }, [resetLogoPosition]);

  const handleExit = useCallback(() => {
    if (confirm("Exit the game?")) {
      // In browser, we can't actually close the tab unless we opened it
      // So just go back to menu (simulate exit)
      setScreen("menu");
    }
  }, []);

  const handleIntroVideoEnd = useCallback(() => {
    setShowLogo(true); // Show logo when entering welcome screen
    setScreen("welcome");
  }, []);

  const handleWelcomeContinue = useCallback(() => {
    setScreen("contestant_intro");
  }, []);

  const handleContestantIntroContinue = useCallback(() => {
    setScreen("contestant_form");
    // Trigger logo move-up animation after 1s
    scheduleLogo(() => {
      setLogoMoveUp(true);
    }, 1000);
  }, [scheduleLogo]);

  const handleFormSubmit = useCallback((name: string, location: string) => {
    setContestant({ name, location });
    audioManager.music("contestant");
    // Start form fade out
    setFormFadeOut(true);
    // Wait for form to fade out (0.5s), then reset and move logo to center
    scheduleLogo(() => {
      setShowLogo(true);
      setLogoMoveUp(false);
      setLogoMoveToCenter(true);
      setFormFadeOut(false);
      // Wait for logo animation, then switch to video
      scheduleLogo(() => {
        setScreen("transition_video");
        // Hide logo after 4s of video
        scheduleLogo(() => {
          setShowLogo(false);
          setLogoMoveToCenter(false);
        }, 4000);
      }, 1000);
    }, 500);
  }, [scheduleLogo]);

  const handleTransitionVideoEnd = useCallback(() => {
    // Instead of switching screen, just mark video as ended
    setVideoEnded(true);
  }, []);

  // Leave the contestant-banner segment (click, Skip button, or Space).
  // Ref guard so double-clicks can't stack the timeout chain.
  const bannersLeavingRef = useRef(false);
  const handleBannersContinue = useCallback(() => {
    if (bannersLeavingRef.current) return;
    bannersLeavingRef.current = true;
    setBannersSlideOut(true);
    setTimeout(() => {
      setScreen("introduction");
      setVideoEnded(false);
      setBannersSlideOut(false);
      bannersLeavingRef.current = false;
    }, 1500);
  }, []);

  // While the banner segment is showing, register it as skippable
  useEffect(() => {
    if (screen === "transition_video" && videoEnded && !bannersSlideOut) {
      return setSkipHandler(handleBannersContinue);
    }
  }, [screen, videoEnded, bannersSlideOut, handleBannersContinue]);

  const handleIntroductionContinue = useCallback(() => {
    audioManager.stopMusic();
    setScreen("gameplay");
  }, []);

  const handleUseLifeline = useCallback((id: LifelineId) => {
    setUsedLifelines((prev) => new Set([...prev, id]));
  }, []);

  const handleCorrect = useCallback(
    (newLevel: number) => {
      // Reset per-question state
      setDisabledAnswers(new Set());

      if (newLevel > questions.length) {
        // Answered every question — champion!
        const winnings = computeWinnings(questions.length, "win", ladder);
        setEndWinnings(winnings);
        setFinalLevel(questions.length);
        recordGame(questions.length, winnings, "win");
        setScreen("end_win");
        return;
      }
      setCurrentLevel(newLevel);
      setFinalLevel(newLevel);
    },
    [questions.length, ladder, recordGame]
  );

  const endWithLoss = useCallback(
    (outcome: "wrong" | "timeout") => {
      const correctCount = currentLevel - 1;
      const winnings = computeWinnings(correctCount, outcome, ladder);
      setEndWinnings(winnings);
      setFinalLevel(currentLevel);
      recordGame(correctCount, winnings, outcome);
      setScreen("end_lose");
    },
    [currentLevel, ladder, recordGame]
  );

  const handleWrong = useCallback(() => endWithLoss("wrong"), [endWithLoss]);
  const handleTimeout = useCallback(() => endWithLoss("timeout"), [endWithLoss]);

  const handleWalkAway = useCallback(() => {
    // Keep the amount of the last question answered correctly
    const correctCount = currentLevel - 1;
    const winnings = computeWinnings(correctCount, "walk_away", ladder);
    setEndWinnings(winnings);
    setFinalLevel(correctCount);
    recordGame(correctCount, winnings, "walk_away");
    setScreen("end_walk_away");
  }, [currentLevel, ladder, recordGame]);

  const handleEndContinue = useCallback(() => {
    setScreen("outro");
  }, []);

  const handleOutroContinue = useCallback(() => {
    setScreen("menu");
  }, []);

  const handleReturn = useCallback(() => {
    // Mid-game the run cannot be "stepped back" — offer to abandon it instead
    if (screen === "gameplay") {
      if (confirm("Return to menu? Your current game progress will be lost.")) {
        audioManager.stopAll();
        setCurrentLevel(1);
        setFinalLevel(1);
        setUsedLifelines(new Set());
        setDisabledAnswers(new Set());
        setDoubleDipActive(false);
        setDoubleDipGuessesLeft(0);
        setScreen("menu");
      }
      return;
    }

    // Special handling for end_lose: allow retry from the failed question
    if (screen === "end_lose") {
      if (confirm("Retry from the failed question?")) {
        audioManager.stopAll();
        // Retry the same question that was failed
        setDisabledAnswers(new Set());
        setDoubleDipActive(false);
        setDoubleDipGuessesLeft(0);
        setScreen("gameplay");
      }
      return;
    }

    // Define navigation logic for return button
    const navigationMap: Record<ScreenId, ScreenId | null> = {
      "menu": null, // No return from menu
      "customize": "menu",
      "history": "menu",
      "intro_video": "menu",
      "welcome": "intro_video",
      "contestant_intro": "welcome",
      "contestant_form": "contestant_intro",
      "transition_video": "contestant_form",
      "transition_background": "transition_video",
      "introduction": "transition_video",
      "gameplay": "menu", // unreachable — handled above with confirm
      "end_walk_away": "menu",
      "end_win": "menu",
      "end_lose": "menu",
      "outro": "menu",
    };

    const previousScreen = navigationMap[screen];
    if (previousScreen) {
      // Clear queued logo moves + reset its position so it never lands at the
      // top over the previous screen's text.
      resetLogoPosition();
      audioManager.stopAll();
      setScreen(previousScreen);
    }
  }, [screen, currentLevel]);

  const showLogoInScreens =
    screen === "welcome" ||
    screen === "contestant_intro" ||
    screen === "contestant_form" ||
    screen === "transition_video";

  return {
    screen,
    contestant,
    currentLevel,
    finalLevel,
    usedLifelines,
    disabledAnswers,
    doubleDipActive,
    doubleDipGuessesLeft,
    endWinnings,
    showLogo,
    logoMoveUp,
    logoMoveToCenter,
    formFadeOut,
    videoEnded,
    bannersSlideOut,
    showSettings,
    settings,
    questions,
    ladder,
    setQuestions,
    setScreen,
    setShowSettings,
    setDisabledAnswers,
    setDoubleDipActive,
    setDoubleDipGuessesLeft,
    handlePlay,
    handleCustomize,
    handleHistory,
    handleSettings,
    handleSaveSettings,
    handleReset,
    handleExit,
    handleIntroVideoEnd,
    handleWelcomeContinue,
    handleContestantIntroContinue,
    handleFormSubmit,
    handleTransitionVideoEnd,
    handleBannersContinue,
    handleIntroductionContinue,
    handleUseLifeline,
    handleCorrect,
    handleWrong,
    handleTimeout,
    handleWalkAway,
    handleEndContinue,
    handleOutroContinue,
    handleReturn,
    showLogoInScreens,
  };
}

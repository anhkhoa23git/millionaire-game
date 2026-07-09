"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { MenuScreen } from "@/components/millionaire/MenuScreen";
import { WelcomeScreen } from "@/components/millionaire/WelcomeScreen";
import { ContestantIntroScreen } from "@/components/millionaire/ContestantIntroScreen";
import { ContestantForm } from "@/components/millionaire/ContestantForm";
import { VideoPlaceholder } from "@/components/millionaire/VideoPlaceholder";
import { IntroductionScreen } from "@/components/millionaire/IntroductionScreen";
import { GameplayScreen } from "@/components/millionaire/GameplayScreen";
import { EndScreen } from "@/components/millionaire/EndScreen";
import { OutroScreen } from "@/components/millionaire/OutroScreen";
import { ReturnButton } from "@/components/millionaire/ReturnButton";
import { CustomizeScreen } from "@/components/millionaire/CustomizeScreen";
import { HistoryScreen } from "@/components/millionaire/HistoryScreen";
import { SettingsModal } from "@/components/millionaire/SettingsModal";
import { SkipControls } from "@/components/millionaire/SkipControls";
import { setSkipHandler } from "@/lib/millionaire/skip";
import { Question } from "@/lib/millionaire/questions";
import { loadQuestions } from "@/lib/millionaire/questionStore";
import { buildPrizeLadder, computeWinnings, GameOutcome } from "@/lib/millionaire/prize";
import { appendGameRecord } from "@/lib/millionaire/history";
import { GameSettings, loadSettings, saveSettings } from "@/lib/millionaire/settings";
import { audioManager } from "@/lib/millionaire/audio";
import { ContestantInfo, ScreenId } from "@/lib/millionaire/state";
import { LifelineId } from "@/lib/millionaire/lifelines";

export default function Home() {
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

  const ladder = useMemo(() => buildPrizeLadder(questions.length), [questions]);

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

  // ---------- State transitions ----------
  const handlePlay = useCallback(() => {
    // Reset all state for new game; re-read questions so edits apply immediately
    audioManager.sfx("buttonClick");
    setQuestions(loadQuestions());
    setCurrentLevel(1);
    setFinalLevel(1);
    setUsedLifelines(new Set());
    setDisabledAnswers(new Set());
    setDoubleDipActive(false);
    setDoubleDipGuessesLeft(0);
    setShowLogo(false);
    setScreen("intro_video");
  }, []);

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
      setScreen("menu");
    }
  }, []);

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
    setTimeout(() => {
      setLogoMoveUp(true);
    }, 1000);
  }, []);

  const handleFormSubmit = useCallback((name: string, location: string) => {
    setContestant({ name, location });
    audioManager.music("contestant");
    // Start form fade out
    setFormFadeOut(true);
    // Wait for form to fade out (0.5s), then reset and move logo to center
    setTimeout(() => {
      setShowLogo(true);
      setLogoMoveUp(false);
      setLogoMoveToCenter(true);
      setFormFadeOut(false);
      // Wait for logo animation, then switch to video
      setTimeout(() => {
        setScreen("transition_video");
        // Hide logo after 4s of video
        setTimeout(() => {
          setShowLogo(false);
          setLogoMoveToCenter(false);
        }, 4000);
      }, 1000);
    }, 500);
  }, []);

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
      audioManager.stopAll();
      setScreen(previousScreen);
    }
  }, [screen]);

  // ---------- Render ----------
  const showLogoInScreens = screen === "welcome" || screen === "contestant_intro" || screen === "contestant_form" || screen === "transition_video";

  return (
    <main className="w-screen h-screen overflow-hidden bg-black flex items-center justify-center">
      <div className="game-stage shadow-2xl">
        {/* Persistent Logo - appears once and persists across welcome/intro/form */}
        {showLogo && showLogoInScreens && (
          <div
            className="absolute left-1/2 z-50 pointer-events-none"
            style={{
              top: logoMoveUp ? "20px" : logoMoveToCenter ? "50%" : "50%",
              transform: logoMoveUp ? "translate(-50%, 0)" : logoMoveToCenter ? "translate(-50%, -50%)" : "translate(-50%, -50%)",
              transition: logoMoveUp || logoMoveToCenter ? "all 1s ease-out" : "none",
              animation: showLogo && !logoMoveUp && !logoMoveToCenter ? "logo-fade-in 1s ease-out" : "none",
            }}
          >
            <img
              src="/icons/Main Logo Cropped.png"
              alt="Who Wants to Be a Millionaire"
              style={{
                width: "clamp(140px, 24cqw, 280px)",
                height: "auto",
                filter: "drop-shadow(0 0 30px rgba(212,175,55,0.6))",
              }}
            />
          </div>
        )}
        {screen === "menu" && (
          <MenuScreen
            onPlay={handlePlay}
            onCustomize={handleCustomize}
            onHistory={handleHistory}
            onSettings={handleSettings}
            onReset={handleReset}
            onExit={handleExit}
          />
        )}

        {screen === "customize" && (
          <CustomizeScreen
            questions={questions}
            onQuestionsChange={setQuestions}
            onBack={() => setScreen("menu")}
          />
        )}

        {screen === "history" && <HistoryScreen onBack={() => setScreen("menu")} />}

        {/* Settings modal — overlays the menu */}
        {showSettings && (
          <SettingsModal
            settings={settings}
            onSave={handleSaveSettings}
            onClose={() => setShowSettings(false)}
          />
        )}

        {/* Return Button - show on all screens except menu/customize/history (they have their own back buttons) */}
        {screen !== "menu" && screen !== "customize" && screen !== "history" && (
          <ReturnButton onReturn={handleReturn} />
        )}

        {screen === "intro_video" && (
          <VideoPlaceholder
            title="Who Wants to Be a Millionaire?"
            subtitle="INTRO VIDEO"
            duration={20}
            videoSrc="/videos/intro-background.mp4"
            onSkip={handleIntroVideoEnd}
            onAutoAdvance={handleIntroVideoEnd}
          />
        )}

        {screen === "welcome" && <WelcomeScreen onContinue={handleWelcomeContinue} showLogo={false} />}

        {screen === "contestant_intro" && (
          <ContestantIntroScreen onContinue={handleContestantIntroContinue} showLogo={false} />
        )}

        {screen === "contestant_form" && (
          <ContestantForm onSubmit={handleFormSubmit} showLogo={false} logoMoveUp={logoMoveUp} fadeOut={formFadeOut} />
        )}

        {/* Unmounted once the video ends — the background block below takes
            over, so only ONE contestant lower-third exists at a time */}
        {screen === "transition_video" && !videoEnded && (
          <VideoPlaceholder
            title={`Welcome, ${contestant.name}!`}
            subtitle="TRANSITION VIDEO"
            duration={6}
            videoSrc="/videos/contestant.mp4"
            onSkip={handleTransitionVideoEnd}
            onAutoAdvance={handleTransitionVideoEnd}
            fadeIn={true}
            showLowerThird={true}
            contestantName={contestant.name}
            contestantLocation={contestant.location}
          />
        )}

        {/* Background image with banners - shown after video ends */}
        {screen === "transition_video" && videoEnded && (
          <div
            className="transition-background relative w-full h-full overflow-hidden cursor-pointer"
            onClick={handleBannersContinue}
            style={{
              backgroundImage: "url('/background-reversemain.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              animation: "fade-in-bg 0.5s ease-out",
            }}
          >
            {/* Lower Third Banners - Contestant Info */}
            <div className={`lower-third-container ${bannersSlideOut ? 'slide-out' : ''}`}>
              {/* Upper small banner */}
              <div className="upper-banner">
                <span>Contestant</span>
              </div>

              {/* Lower main banner */}
              <div className="lower-banner">
                <div className="contestant-name">{contestant.name}</div>
                <div className="contestant-location">{contestant.location}</div>
              </div>
            </div>
          </div>
        )}

        {screen === "introduction" && (
          <IntroductionScreen contestant={contestant} ladder={ladder} onContinue={handleIntroductionContinue} />
        )}

        {screen === "gameplay" && (
          <GameplayScreen
            key={currentLevel}
            questions={questions}
            ladder={ladder}
            settings={settings}
            currentLevel={currentLevel}
            usedLifelines={usedLifelines}
            onUseLifeline={handleUseLifeline}
            onCorrect={handleCorrect}
            onWrong={handleWrong}
            onTimeout={handleTimeout}
            onWalkAway={handleWalkAway}
            disabledAnswers={disabledAnswers}
            setDisabledAnswers={setDisabledAnswers}
            doubleDipActive={doubleDipActive}
            setDoubleDipActive={setDoubleDipActive}
            doubleDipGuessesLeft={doubleDipGuessesLeft}
            setDoubleDipGuessesLeft={setDoubleDipGuessesLeft}
          />
        )}

        {screen === "end_walk_away" && (
          <EndScreen variant="walk_away" amount={endWinnings} onContinue={handleEndContinue} />
        )}

        {screen === "end_win" && (
          <EndScreen variant="win" amount={endWinnings} onContinue={handleEndContinue} />
        )}

        {screen === "end_lose" && (
          <EndScreen variant="lose" amount={endWinnings} onContinue={handleEndContinue} />
        )}

        {screen === "outro" && <OutroScreen onContinue={handleOutroContinue} />}

        {/* Global skip: Space key + corner button + hint (visible only when a segment is skippable) */}
        <SkipControls />
      </div>

      <style jsx>{`
        @keyframes logo-fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-bg {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .transition-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 10;
        }

        .lower-third-container {
          position: absolute;
          bottom: clamp(16px, 5cqh, 40px);
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          transition: all 1.5s ease-out;
        }

        .lower-third-container.slide-out {
          opacity: 0;
        }

        .upper-banner {
          position: absolute;
          bottom: clamp(60px, 11cqh, 85px);
          left: 50%;
          transform: translateX(-50%);
          width: clamp(180px, 24cqw, 280px);
          height: clamp(30px, 5cqh, 38px);
          background: linear-gradient(135deg, rgba(10, 25, 41, 0.95) 0%, rgba(15, 30, 50, 0.95) 100%);
          border: 2px solid #D4AF37;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow:
            0 0 20px rgba(212, 175, 55, 0.6),
            0 0 40px rgba(212, 175, 55, 0.3),
            0 4px 12px rgba(0, 0, 0, 0.6);
        }

        .upper-banner span {
          color: #FFFFFF;
          font-family: Arial, sans-serif;
          font-size: 16px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
        }

        .lower-banner {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: min(90cqw, 520px);
          height: clamp(58px, 10cqh, 78px);
          background: linear-gradient(135deg, rgba(10, 25, 41, 0.95) 0%, rgba(15, 30, 50, 0.95) 100%);
          border: 3px solid #D4AF37;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 12px 24px;
          box-shadow:
            0 0 25px rgba(212, 175, 55, 0.7),
            0 0 50px rgba(212, 175, 55, 0.4),
            0 0 75px rgba(99, 102, 241, 0.2),
            0 6px 16px rgba(0, 0, 0, 0.7);
        }

        .contestant-name {
          color: #D4AF37;
          font-family: Arial, sans-serif;
          font-size: clamp(20px, 3.2cqw, 32px);
          font-weight: 800;
          letter-spacing: 0.05em;
          text-shadow:
            0 2px 4px rgba(0, 0, 0, 0.9),
            0 0 20px rgba(212, 175, 55, 0.4);
        }

        .contestant-location {
          color: #FFFFFF;
          font-family: Arial, sans-serif;
          font-size: clamp(13px, 1.8cqw, 18px);
          font-weight: 500;
          letter-spacing: 0.08em;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
        }
      `}</style>
    </main>
  );
}

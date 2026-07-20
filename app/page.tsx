"use client";

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
import { useGameFlow } from "@/lib/millionaire/gameFlow";

export default function Home() {
  const flow = useGameFlow();
  const {
    screen,
    contestant,
    currentLevel,
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
    setScreen,
    setQuestions,
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
  } = flow;

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
            topPrize={settings.topPrize}
            onTopPrizeChange={(v) => handleSaveSettings({ ...settings, topPrize: v })}
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
            contestant={contestant}
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
    </main>
  );
}

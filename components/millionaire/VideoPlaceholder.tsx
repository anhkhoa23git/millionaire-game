"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { setSkipHandler } from "@/lib/millionaire/skip";

interface VideoPlaceholderProps {
  title: string;
  subtitle: string;
  duration: number; // seconds (fallback if video doesn't exist)
  onSkip: () => void;
  onAutoAdvance: () => void;
  videoSrc?: string; // Optional video source
  fadeIn?: boolean; // Fade in from black
  showLowerThird?: boolean; // Show contestant lower third
  contestantName?: string;
  contestantLocation?: string;
}

export function VideoPlaceholder({
  title,
  subtitle,
  duration,
  onSkip,
  onAutoAdvance,
  videoSrc,
  fadeIn = false,
  showLowerThird = false,
  contestantName = "",
  contestantLocation = "",
}: VideoPlaceholderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [showBanners, setShowBanners] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const skipPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (skipPollRef.current) clearInterval(skipPollRef.current);
    };
  }, []);

  // Skip = mute + fast-forward, not a hard cut:
  // - real video: mute it and play at 16× so it visibly rushes to its end
  // - placeholder: quick 0.3s fade, then advance
  // A poll watches the fast-forward instead of trusting the 'ended' event:
  // it advances the flow when the video finishes OR stalls (strict autoplay
  // policies can refuse playback entirely).
  const handleSkip = useCallback(() => {
    setSkipping(true);
    const video = videoRef.current;
    if (video && videoSrc && videoLoaded && !video.ended) {
      video.muted = true;
      video.playbackRate = 16;
      video.play().catch(() => onSkip());
      let last = video.currentTime;
      skipPollRef.current = setInterval(() => {
        const finished = video.ended;
        const stalled = video.currentTime <= last;
        if (finished || stalled) {
          if (skipPollRef.current) clearInterval(skipPollRef.current);
          skipPollRef.current = null;
          onSkip();
        }
        last = video.currentTime;
      }, 400);
    } else {
      setTimeout(onSkip, 300);
    }
  }, [videoSrc, videoLoaded, onSkip]);

  // Register as the current skippable segment (one-shot: not re-registered
  // once skipping has started)
  useEffect(() => {
    if (skipping) return;
    return setSkipHandler(handleSkip);
  }, [skipping, handleSkip]);

  useEffect(() => {
    const video = videoRef.current;
    if (video && videoSrc) {
      video.play().catch(() => {
        // Autoplay with sound blocked → standard fallback: retry muted so the
        // flow can never get stuck waiting for a video that won't start
        video.muted = true;
        video.play().catch((error) => console.warn("Video play failed:", error));
      });
    }
  }, [videoSrc]);

  const handleVideoEnd = () => {
    onAutoAdvance();
  };

  const handleVideoLoaded = () => {
    setVideoLoaded(true);
  };

  // Show lower third banners 2s before video ends
  useEffect(() => {
    if (showLowerThird && videoRef.current) {
      const videoDuration = videoRef.current.duration || duration;
      const startTime = Math.max(0, videoDuration - 2);
      const timer = setTimeout(() => {
        setShowBanners(true);
      }, startTime * 1000);
      return () => clearTimeout(timer);
    }
  }, [showLowerThird, duration]);

  // Keep last frame after video ends
  const handleVideoEnded = () => {
    // Don't auto-advance, let handleVideoEnd do it
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <div
      className="video-placeholder relative w-full h-full overflow-hidden flex items-center justify-center"
      style={{
        animation: fadeIn ? "fade-in-video 1s ease-out" : "none",
        // Placeholder mode has no video to fast-forward — fade out instead
        opacity: skipping && !(videoSrc && videoLoaded) ? 0 : 1,
        transition: "opacity 0.3s ease-out",
      }}
    >
      {/* Background image (same as menu) */}
      {/* Removed - using solid color instead */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "#000000",
        }}
      />

      {/* Video element */}
      {videoSrc && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: videoLoaded ? 1 : 0,
            transition: "opacity 0.5s ease-in-out",
          }}
          playsInline
          onLoadedData={handleVideoLoaded}
          onEnded={handleVideoEnd}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      {/* Fallback for no video */}
      {!videoSrc && (
        <>
          {/* Animated radial background to suggest video is playing */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(123,74,212,0.25) 0%, rgba(0,0,0,0.95) 70%)",
            }}
          />

          {/* Light rays */}
          <div className="welcome-light-rays absolute inset-0 pointer-events-none opacity-70" />

          {/* Title */}
          <div className="relative z-10 text-center">
            <div
              className="text-[#D4AF37] text-[20px] tracking-[0.3em] mb-4"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              {subtitle}
            </div>
            <h2
              className="text-white font-black"
              style={{
                fontFamily: "Arial, sans-serif",
                fontSize: "clamp(26px, 5cqw, 60px)",
                textShadow: "0 0 30px rgba(212,175,55,0.6)",
                letterSpacing: "0.02em",
              }}
            >
              {title}
            </h2>

            {/* Progress bar */}
            <div
              className="mx-auto mt-12 overflow-hidden rounded-full"
              style={{
                width: "min(70cqw, 480px)",
                height: "6px",
                background: "rgba(255,255,255,0.1)",
              }}
            >
              <div
                className="h-full"
                style={{
                  background: "linear-gradient(90deg, #D4AF37, #FFA500)",
                  animation: `video-progress ${duration}s linear forwards`,
                  width: "100%",
                  transformOrigin: "left",
                }}
                onAnimationEnd={onAutoAdvance}
              />
            </div>

            <p
              className="mt-6 text-white/50 text-[13px] tracking-widest"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              [ VIDEO PLACEHOLDER · {duration}s ]
            </p>
          </div>
        </>
      )}

      {/* Skip UI is provided globally by SkipControls (Space / corner button) */}

      {/* Lower Third Banners - Contestant Info */}
      {showLowerThird && showBanners && (
        <div className="lower-third-container">
          {/* Upper small banner */}
          <div className="upper-banner">
            <span>Contestant</span>
          </div>
          
          {/* Lower main banner */}
          <div className="lower-banner">
            <div className="contestant-name">{contestantName}</div>
            <div className="contestant-location">{contestantLocation}</div>
          </div>
        </div>
      )}

      <style jsx>{`
        /* Lower Third Container — absolute so it stays inside the stage */
        .lower-third-container {
          position: absolute;
          bottom: clamp(16px, 5cqh, 40px);
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
        }

        /* Upper small banner - "Contestant" */
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
          animation: slide-in-from-top 0.6s ease-out;
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

        /* Lower main banner - Name & Location */
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
          animation: slide-in-from-bottom 0.6s ease-out 0.2s backwards;
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

        /* Slide-in animations */
        @keyframes slide-in-from-top {
          from {
            opacity: 0;
            transform: translate(-50%, -100px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        @keyframes slide-in-from-bottom {
          from {
            opacity: 0;
            transform: translate(-50%, 100px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        @keyframes fade-in-video {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

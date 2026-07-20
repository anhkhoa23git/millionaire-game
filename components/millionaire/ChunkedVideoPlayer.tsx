"use client";

import { useEffect, useRef, useState } from "react";

interface ChunkedVideoPlayerProps {
  videoFolder: string; // e.g., "/videos/middle"
  totalChunks: number;
  onVideoEnd: () => void;
}

export function ChunkedVideoPlayer({ 
  videoFolder, 
  totalChunks, 
  onVideoEnd 
}: ChunkedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentChunk, setCurrentChunk] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      if (currentChunk < totalChunks - 1) {
        // Load next chunk
        setCurrentChunk(prev => prev + 1);
      } else {
        // All chunks finished
        setFadeOut(true);
        setTimeout(onVideoEnd, 500);
      }
    };

    const handleCanPlay = () => {
      video.play().catch((e) => console.error("Chunk play failed:", e));
    };

    const handleTimeUpdate = () => {
      // Preload next chunk when current is near end (within 2s)
      if (currentChunk < totalChunks - 1) {
        const timeRemaining = video.duration - video.currentTime;
        if (timeRemaining < 2 && timeRemaining > 0) {
          const nextChunkNum = currentChunk + 1;
          const nextChunkSrc = `${videoFolder}/chunk_${nextChunkNum.toString().padStart(4, '0')}.mp4`;
          
          // Preload next chunk
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = nextChunkSrc;
          document.head.appendChild(link);
        }
      }
    };

    video.addEventListener("canplaythrough", handleCanPlay, { once: true });
    video.addEventListener("ended", handleEnded);
    video.addEventListener("timeupdate", handleTimeUpdate);

    // Trigger load
    video.load();

    return () => {
      video.removeEventListener("canplaythrough", handleCanPlay);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [currentChunk, totalChunks, onVideoEnd, videoFolder]);

  const chunkSrc = `${videoFolder}/chunk_${currentChunk.toString().padStart(4, '0')}.mp4`;

  return (
    <div
      className="chunked-video-player relative w-full h-full overflow-hidden flex items-center justify-center bg-black"
      style={{
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 0.5s ease-out",
      }}
    >
      <video
        key={currentChunk}
        ref={videoRef}
        src={chunkSrc}
        className="w-full h-full object-cover"
        playsInline
        muted={false}
        preload="auto"
      />
    </div>
  );
}

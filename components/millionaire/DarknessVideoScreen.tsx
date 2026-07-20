"use client";

import { ChunkedVideoPlayer } from "./ChunkedVideoPlayer";

interface DarknessVideoScreenProps {
  onVideoEnd: () => void;
}

export function DarknessVideoScreen({ onVideoEnd }: DarknessVideoScreenProps) {
  return (
    <div className="darkness-video-screen fixed inset-0 z-[10000] bg-black">
      <ChunkedVideoPlayer
        videoFolder="/videos/darknessau"
        totalChunks={2}
        onVideoEnd={onVideoEnd}
      />
    </div>
  );
}

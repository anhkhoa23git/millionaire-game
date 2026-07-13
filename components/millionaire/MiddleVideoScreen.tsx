"use client";

import { ChunkedVideoPlayer } from "./ChunkedVideoPlayer";

interface MiddleVideoScreenProps {
  onVideoEnd: () => void;
}

export function MiddleVideoScreen({ onVideoEnd }: MiddleVideoScreenProps) {
  return (
    <div className="middle-video-screen fixed inset-0 z-[10000] bg-black">
      <ChunkedVideoPlayer
        videoFolder="/videos/middle"
        totalChunks={2}
        onVideoEnd={onVideoEnd}
      />
    </div>
  );
}

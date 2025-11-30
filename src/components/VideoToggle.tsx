import { useState, useEffect, useCallback } from 'react';

export default function VideoToggle() {
  const [isPaused, setIsPaused] = useState(false);

  const toggleVideos = useCallback(() => {
    const videos = document.querySelectorAll('video');

    if (isPaused) {
      // Play all videos
      videos.forEach(video => {
        video.play().catch(() => {
          // Ignore autoplay errors
        });
      });
    } else {
      // Pause all videos
      videos.forEach(video => {
        video.pause();
      });
    }

    setIsPaused(!isPaused);
  }, [isPaused]);

  // Ensure videos match state on mount (in case of hydration)
  useEffect(() => {
    const videos = document.querySelectorAll('video');
    if (isPaused) {
      videos.forEach(video => video.pause());
    }
  }, []);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleVideos();
      }}
      className="w-7 h-7 rounded-full border border-white/50 bg-transparent flex items-center justify-center transition-all duration-300 hover:border-white/80 cursor-pointer"
      aria-label={isPaused ? 'Lancer les vidéos' : 'Mettre en pause les vidéos'}
    >
      {isPaused ? (
        // Play icon (triangle)
        <svg
          className="w-2.5 h-2.5 text-white/50 ml-0.5"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      ) : (
        // Pause icon (two bars)
        <svg
          className="w-2.5 h-2.5 text-white/50"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
        </svg>
      )}
    </button>
  );
}

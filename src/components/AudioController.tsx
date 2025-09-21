import React, { useRef, useEffect, useState } from 'react';

interface AudioControllerProps {
  audioUrl?: string;
  onAudioStart?: (audioElement: HTMLAudioElement) => void;
  onAudioEnd?: () => void;
  onAudioTimeUpdate?: (currentTime: number, duration: number) => void;
  autoPlay?: boolean;
  volume?: number;
}

const AudioController: React.FC<AudioControllerProps> = ({
  audioUrl,
  onAudioStart,
  onAudioEnd,
  onAudioTimeUpdate,
  autoPlay = true,
  volume = 1.0
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Update audio source when audioUrl changes
  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl;
      if (autoPlay) {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [audioUrl, autoPlay]);

  // Set volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handlePlay = () => {
    setIsPlaying(true);
    if (audioRef.current) {
      onAudioStart?.(audioRef.current);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    onAudioEnd?.();
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration || 0;
      setCurrentTime(current);
      onAudioTimeUpdate?.(current, total);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg">
      <audio
        ref={audioRef}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        preload="metadata"
      />
      
      {/* Play/Pause Button */}
      <button
        onClick={togglePlayPause}
        disabled={!audioUrl}
        className="p-1 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPlaying ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 4a1 1 0 011 1v10a1 1 0 11-2 0V5a1 1 0 011-1zM13 4a1 1 0 011 1v10a1 1 0 11-2 0V5a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Time Display */}
      <span className="text-xs text-gray-600 font-mono">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>

      {/* Volume Control */}
      <button
        onClick={toggleMute}
        className="p-1 text-gray-500 hover:text-gray-700"
      >
        {isMuted ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.784L6.218 15H4a1 1 0 01-1-1V6a1 1 0 011-1h2.218l2.165-1.784a1 1 0 011-.14zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.784L6.218 15H4a1 1 0 01-1-1V6a1 1 0 011-1h2.218l2.165-1.784a1 1 0 011-.14zM12 6.5a1 1 0 011.414 0c.781.781 1.281 1.914 1.281 3.5s-.5 2.719-1.281 3.5a1 1 0 01-1.414-1.414c.387-.387.7-.947.7-2.086s-.313-1.699-.7-2.086A1 1 0 0112 6.5z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Volume Slider */}
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={isMuted ? 0 : volume}
        onChange={() => setIsMuted(false)}
        className="w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(isMuted ? 0 : volume) * 100}%, #E5E7EB ${(isMuted ? 0 : volume) * 100}%, #E5E7EB 100%)` }}
      />
    </div>
  );
};

export default AudioController;

import React, { useState, useEffect, useRef } from 'react';
import { Track } from '../types.ts';

interface PlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  toggleLibrary: () => void;
  isInLibrary: boolean;
}

const Player: React.FC<PlayerProps> = ({ currentTrack, isPlaying, setIsPlaying, toggleLibrary, isInLibrary }) => {
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && currentTrack) {
      if (isPlaying) {
        audio.play().catch(err => {
          console.warn("Audio play blocked:", err);
          setIsPlaying(false);
        });
      } else {
        audio.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && currentTrack) {
      audio.currentTime = 0;
      setCurrentTime(0);
      if (isPlaying) {
        audio.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentTrack]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio) {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (audio && duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      audio.currentTime = percentage * duration;
    }
  };

  if (!currentTrack) return null;

  const audioSource = currentTrack.audioUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
  const coverSource = currentTrack.coverUrl || `https://picsum.photos/seed/${currentTrack.id}/100/100`;

  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 h-20 md:h-24 bg-black border-t border-white/10 px-4 flex items-center justify-between z-[100] shadow-2xl animate-fade backdrop-blur-lg bg-black/80">
      <audio 
        ref={audioRef} 
        src={audioSource} 
        onTimeUpdate={handleTimeUpdate} 
        onEnded={() => setIsPlaying(false)}
        onLoadedMetadata={handleTimeUpdate}
      />
      
      {/* Track Info */}
      <div className="flex items-center w-full md:w-1/3 space-x-3 min-w-0">
        <img 
          src={coverSource} 
          alt={currentTrack.title} 
          className="w-12 h-12 md:w-14 md:h-14 rounded shadow-lg shrink-0 object-cover bg-[#282828]" 
        />
        <div className="min-w-0 flex-1">
          <h4 className="text-white text-sm font-bold truncate leading-tight">{currentTrack.title}</h4>
          <p className="text-gray-400 text-xs truncate">{currentTrack.artist}</p>
        </div>
        <div className="flex items-center space-x-4 md:hidden">
            <button onClick={toggleLibrary} className={`transition-colors ${isInLibrary ? 'text-[#1DB954]' : 'text-gray-400'}`}>
              <svg className="w-6 h-6" fill={isInLibrary ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </button>
            <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-white active:scale-90 transition-transform"
            >
                {isPlaying ? (
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                ) : (
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                )}
            </button>
        </div>
      </div>

      {/* Desktop Controls */}
      <div className="hidden md:flex flex-col items-center w-1/3 max-w-xl">
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform text-black shadow-lg"
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>
        </div>
        
        <div className="flex w-full items-center space-x-2 text-[10px] text-gray-400 mt-2">
          <span className="w-10 text-right">{formatTime(currentTime)}</span>
          <div className="flex-1 h-1 bg-white/10 rounded-full cursor-pointer group relative" onClick={handleSeek}>
            <div className="absolute h-full bg-white group-hover:bg-[#1DB954] rounded-full transition-colors" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="w-10">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume Placeholder (Desktop Only) */}
      <div className="hidden md:flex items-center w-1/3 justify-end space-x-3">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
        <div className="w-24 h-1 bg-white/10 rounded-full relative overflow-hidden">
          <div className="absolute h-full bg-white" style={{ width: `70%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default Player;

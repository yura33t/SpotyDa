
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
  const [isBuffering, setIsBuffering] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && currentTrack) {
      if (isPlaying) {
        audio.play().catch(error => {
          // Мобильные браузеры часто блокируют первый запуск (Autoplay policy)
          console.warn("Playback blocked by browser policy. Interaction required.");
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
      audio.pause();
      audio.src = currentTrack.audioUrl;
      audio.load();
      
      setIsBuffering(true);
      setProgress(0);
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
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const bar = progressBarRef.current;
    if (audio && duration && bar) {
      const rect = bar.getBoundingClientRect();
      let clientX = 0;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
      } else {
        clientX = e.clientX;
      }
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      audio.currentTime = percentage * duration;
    }
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-[64px] md:bottom-0 left-0 right-0 h-[76px] md:h-24 bg-[#0a0a0a]/95 border-t border-white/5 px-4 flex flex-col z-[100] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all">
      <div 
        className="absolute -top-1.5 left-0 right-0 h-5 cursor-pointer z-10 group"
        onClick={handleSeek}
      >
        <div ref={progressBarRef} className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-white/10 overflow-hidden group-hover:h-1.5 transition-all">
          <div 
            className="h-full bg-[#1DB954] transition-all duration-75 ease-linear relative" 
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-xl transition-opacity"></div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between h-full pt-1">
        <div className="flex items-center w-1/2 md:w-1/3 space-x-3 min-w-0">
          <div className="relative shrink-0 group">
            <img 
              src={currentTrack.coverUrl} 
              alt={currentTrack.title} 
              className={`w-11 h-11 md:w-16 md:h-16 rounded shadow-lg object-cover bg-white/5 transition-all ${isBuffering ? 'opacity-40 blur-[1px]' : 'opacity-100'}`} 
            />
            {isBuffering && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-white text-sm md:text-base font-bold truncate leading-tight">{currentTrack.title}</h4>
            <p className="text-[#b3b3b3] text-[11px] md:text-sm truncate">{currentTrack.artist}</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 md:w-1/3">
          <div className="flex items-center space-x-5 md:space-x-8">
            <button onClick={() => setIsPlaying(!isPlaying)} className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-black shadow-xl">
              {isPlaying ? (
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ) : (
                <svg className="w-5 h-5 md:w-6 md:h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>
            <button onClick={toggleLibrary} className={`transition-all hover:scale-110 ${isInLibrary ? 'text-[#1DB954]' : 'text-gray-400'} hover:text-white`}>
              <svg className="w-5 h-5 md:w-6 md:h-6" fill={isInLibrary ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
          
          <div className="flex w-full items-center justify-center space-x-3 text-[10px] md:text-xs text-[#b3b3b3] mt-2 font-medium">
            <span className="w-10 text-right">{formatTime(currentTime)}</span>
            <div className="hidden md:block flex-1 max-w-[400px] h-1 bg-white/10 rounded-full relative overflow-hidden">
               <div className="absolute top-0 left-0 h-full bg-[#1DB954]" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="w-10 text-left">{formatTime(duration) || currentTrack.duration}</span>
          </div>
        </div>

        <div className="hidden md:flex items-center w-1/3 justify-end space-x-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
            <div className="w-24 h-1 bg-white/10 rounded-full relative cursor-pointer">
              <div className="absolute top-0 left-0 h-full bg-white rounded-full" style={{ width: `75%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <audio 
        ref={audioRef} 
        onTimeUpdate={handleTimeUpdate} 
        onEnded={() => setIsPlaying(false)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onCanPlay={() => setIsBuffering(false)}
        onLoadedMetadata={handleTimeUpdate}
        preload="auto"
        crossOrigin="anonymous"
      />
    </div>
  );
};

export default Player;

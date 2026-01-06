
import React, { useState, useEffect, useRef } from 'react';
import { Track } from '../types';

interface PlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  toggleLibrary: () => void;
  isInLibrary: boolean;
}

const Player: React.FC<PlayerProps> = ({ currentTrack, isPlaying, setIsPlaying, toggleLibrary, isInLibrary }) => {
  const [volume, setVolume] = useState(70);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Используем аудио-ссылку из трека, если она есть, иначе - демо-файл
  const audioSource = currentTrack?.audioUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.warn("Playback blocked or link invalid"));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      if (isPlaying) audioRef.current.play().catch(() => {});
    }
  }, [currentTrack]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const dur = audioRef.current.duration;
      setCurrentTime(current);
      setDuration(dur || 0);
      setProgress(dur ? (current / dur) * 100 : 0);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      audioRef.current.currentTime = percentage * duration;
    }
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 h-20 md:h-24 bg-black border-t border-white/5 px-4 flex items-center justify-between z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
      <audio 
        ref={audioRef} 
        src={audioSource} 
        onTimeUpdate={handleTimeUpdate} 
        onEnded={() => setIsPlaying(false)}
        onLoadedMetadata={handleTimeUpdate}
      />
      
      <div className="flex items-center w-2/3 md:w-1/3 space-x-3">
        <img 
          src={currentTrack.coverUrl} 
          alt={currentTrack.title} 
          className="w-12 h-12 md:w-14 md:h-14 rounded shadow-lg shrink-0 object-cover" 
          onError={(e) => e.currentTarget.src = `https://picsum.photos/seed/${currentTrack.id}/100/100`}
        />
        <div className="min-w-0">
          <h4 className="text-white text-xs md:text-sm font-bold truncate leading-tight">{currentTrack.title}</h4>
          <p className="text-gray-400 text-[10px] md:text-xs truncate">{currentTrack.artist}</p>
        </div>
        <button 
          onClick={toggleLibrary}
          className={`transition-colors shrink-0 ml-2 ${isInLibrary ? 'text-[#1DB954]' : 'text-gray-400 hover:text-white'}`}
        >
          <svg className="w-5 h-5" fill={isInLibrary ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col items-center w-1/3 md:max-w-xl">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform text-black shadow-lg"
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>
        </div>
        
        <div className="hidden md:flex w-full items-center space-x-2 text-[10px] text-gray-400 mt-2">
          <span className="w-8 text-right font-medium">{formatTime(currentTime)}</span>
          <div 
            className="flex-1 h-1 bg-white/10 rounded-full group cursor-pointer relative"
            onClick={handleSeek}
          >
            <div className="absolute h-full bg-white group-hover:bg-[#1DB954] rounded-full transition-colors" style={{ width: `${progress}%` }}></div>
            <div 
               className="absolute w-3 h-3 bg-white rounded-full -top-1 opacity-0 group-hover:opacity-100 shadow-lg" 
               style={{ left: `calc(${progress}% - 6px)` }}
            ></div>
          </div>
          <span className="w-8 font-medium">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="hidden md:flex items-center w-1/3 justify-end space-x-3">
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
        <div className="w-24 h-1 bg-white/10 rounded-full relative overflow-hidden group">
          <div className="absolute h-full bg-white group-hover:bg-[#1DB954] transition-colors" style={{ width: `${volume}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default Player;

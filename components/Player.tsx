
import { Track } from '../types.ts';
import React, { useState, useEffect, useRef } from 'react';
import { getStreamUrl } from '../services/musicApi.ts';

interface PlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  onNext: () => void;
  onPrevious: () => void;
  toggleLibrary: () => void;
  isInLibrary: boolean;
  customBg?: string | null;
  bgType?: 'image' | 'video';
  bgAnalysis?: {
    focalPoint: { x: number; y: number };
    filters: string;
    themeColor: string;
  } | null;
  isDarkMode: boolean;
}

const Player: React.FC<PlayerProps> = ({ 
  currentTrack, 
  isPlaying, 
  setIsPlaying, 
  onNext, 
  onPrevious,
  toggleLibrary, 
  isInLibrary,
  customBg,
  bgType = 'image',
  bgAnalysis,
  isDarkMode
}) => {
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const touchStartY = useRef<number>(0);

  // Синхронизация состояния Play/Pause
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && audio.src && currentTrack) {
      if (isPlaying) {
        audio.play().catch(err => {
          console.warn("Playback failed:", err);
          setIsPlaying(false);
        });
      } else {
        audio.pause();
      }
    }
  }, [isPlaying]);

  // Загрузка нового трека
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && currentTrack) {
      const loadAndPlay = async () => {
        setIsBuffering(true);
        audio.pause();
        
        try {
          const streamUrl = await getStreamUrl(currentTrack);
          if (!streamUrl) throw new Error("No stream URL");
          
          audio.src = streamUrl;
          audio.load();
          
          // В браузерах play() должен вызываться после взаимодействия пользователя
          if (isPlaying) {
            await audio.play();
          }
        } catch (err) {
          console.error("Audio Load Error:", err);
          setIsBuffering(false);
          // Если трек не грузится (например, заблокирован в регионе), идем к следующему
          onNext();
        }
      };

      loadAndPlay();
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

  const handleAudioError = () => {
    setIsBuffering(false);
    console.error("Audio element error detected");
    // Небольшая задержка перед скипом, чтобы не зациклиться
    setTimeout(onNext, 2000);
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
      const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      audio.currentTime = percentage * duration;
    }
  };

  if (!currentTrack) return null;

  return (
    <>
      {/* Полный экран плеера */}
      <div 
        className={`fixed inset-0 z-[400] transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'} ${isDarkMode ? 'bg-black' : 'bg-gray-50'}`}
        onTouchStart={(e) => touchStartY.current = e.touches[0].clientY}
        onTouchEnd={(e) => {
            const touchEndY = e.changedTouches[0].clientY;
            if (touchEndY - touchStartY.current > 100) setIsExpanded(false);
        }}
      >
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {customBg ? (
            bgType === 'video' ? (
              <video src={customBg} autoPlay loop muted playsInline className={`w-full h-full object-cover ${isDarkMode ? 'opacity-40' : 'opacity-20'}`} />
            ) : (
              <div 
                className={`absolute inset-0 bg-cover ${isDarkMode ? 'opacity-35' : 'opacity-20'}`} 
                style={{ 
                  backgroundImage: `url(${customBg})`,
                  backgroundPosition: bgAnalysis ? `${bgAnalysis.focalPoint.x}% ${bgAnalysis.focalPoint.y}%` : 'center'
                }} 
              />
            )
          ) : (
            <div 
              className={`absolute inset-0 blur-2xl scale-110 bg-cover bg-center ${isDarkMode ? 'opacity-40' : 'opacity-20'}`} 
              style={{ backgroundImage: `url(${currentTrack.coverUrl})` }}
            />
          )}
          <div className={`absolute inset-0 bg-gradient-to-b via-transparent ${isDarkMode ? 'from-black/60 to-black' : 'from-white/60 to-gray-50'}`} />
        </div>

        <div className="relative h-full flex flex-col p-6 pt-12 pb-12 max-w-lg mx-auto z-10">
          <button 
            onClick={() => setIsExpanded(false)}
            className={`self-center md:self-start w-12 h-1 rounded-full mb-12 transition-colors ${isDarkMode ? 'bg-white/30 hover:bg-white/50' : 'bg-black/20 hover:bg-black/40'}`}
          />

          <div className="flex-1 flex flex-col items-center justify-center space-y-10 md:space-y-12">
            <div className={`relative w-full aspect-square shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] rounded-2xl overflow-hidden transition-all duration-700 ${isPlaying ? 'scale-100' : 'scale-[0.85] opacity-60'}`}>
              <img src={currentTrack.coverUrl} className="w-full h-full object-cover" alt={currentTrack.title} />
              {isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                  <div className="w-12 h-12 border-4 border-[#FF5500] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            <div className="w-full space-y-8">
              <div className="flex items-center justify-between">
                <div className="min-w-0 pr-4">
                  <h2 className={`text-2xl md:text-3xl font-black truncate leading-tight tracking-tight drop-shadow-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{currentTrack.title}</h2>
                  <p className={`text-lg md:text-xl font-bold truncate tracking-tight ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>{currentTrack.artist}</p>
                </div>
                <button onClick={toggleLibrary} className={`transition-all active:scale-75 ${isInLibrary ? 'text-[#FF5500]' : (isDarkMode ? 'text-white/40' : 'text-gray-400')}`}>
                  <svg className="w-8 h-8" fill={isInLibrary ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              <div className="w-full">
                <div 
                  ref={progressBarRef}
                  onClick={handleSeek}
                  className={`h-1.5 rounded-full relative cursor-pointer ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`}
                >
                  <div 
                    className="absolute inset-0 h-full rounded-full transition-all duration-100" 
                    style={{ width: `${progress}%`, backgroundColor: '#FF5500' }} 
                  />
                  <div 
                    className={`absolute h-4 w-4 rounded-full -top-[5px] -ml-2 shadow-lg ${isDarkMode ? 'bg-white' : 'bg-gray-900'}`}
                    style={{ left: `${progress}%` }}
                  />
                </div>
                <div className={`flex justify-between mt-3 text-[10px] md:text-xs font-bold ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration) || currentTrack.duration}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button className={`transition-colors ${isDarkMode ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg></button>
                <div className="flex items-center space-x-8 md:space-x-12">
                  <button onClick={onPrevious} className={`active:scale-75 transition-transform ${isDarkMode ? 'text-white' : 'text-gray-900'}`}><svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6L18 6v12z"/></svg></button>
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center active:scale-90 transition-all shadow-2xl ${isDarkMode ? 'bg-white text-black' : 'bg-gray-900 text-white'}`}
                  >
                    {isPlaying ? <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> : <svg className="w-10 h-10 ml-1.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>}
                  </button>
                  <button onClick={onNext} className={`active:scale-75 transition-transform ${isDarkMode ? 'text-white' : 'text-gray-900'}`}><svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6zm9-12v12h2V6z"/></svg></button>
                </div>
                <button className={`transition-colors ${isDarkMode ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10.59 9.17L5.41 14.35 4 12.94l6.59-6.59 6.59 6.59-1.41 1.41-5.18-5.18zm0 5.66l5.18-5.18 1.41 1.41-6.59 6.59-6.59-6.59 1.41-1.41 5.18 5.18z"/></svg></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Мини-плеер */}
      <div 
        onClick={() => setIsExpanded(true)}
        className={`fixed bottom-[calc(64px+env(safe-area-inset-bottom))] md:bottom-6 left-2 right-2 md:left-[272px] md:right-6 h-[64px] backdrop-blur-md border rounded-xl px-3 flex items-center justify-between z-[170] shadow-2xl active:scale-[0.98] transition-all duration-500 ${isDarkMode ? 'bg-[#1a1a1a]/90 border-white/5' : 'bg-white/90 border-gray-100'}`}
      >
        <div className="flex items-center w-2/3 space-x-3 min-w-0">
          <img src={currentTrack.coverUrl} className="w-11 h-11 rounded-md shadow-lg object-cover" alt={currentTrack.title} />
          <div className="min-w-0">
            <h4 className={`text-xs font-bold truncate leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{currentTrack.title}</h4>
            <p className="text-gray-500 text-[10px] truncate">{currentTrack.artist}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 pr-1">
          <button 
            onClick={(e) => {e.stopPropagation(); setIsPlaying(!isPlaying);}}
            className={`w-10 h-10 flex items-center justify-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
             {isPlaying ? <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> : <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>}
          </button>
          <button onClick={(e) => {e.stopPropagation(); toggleLibrary();}} className={`transition-all ${isInLibrary ? 'text-[#FF5500]' : (isDarkMode ? 'text-white/40' : 'text-gray-400')}`}>
             <svg className="w-6 h-6" fill={isInLibrary ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </button>
        </div>
        
        <div className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl overflow-hidden ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`}>
            <div className={`h-full transition-all duration-300 ${isDarkMode ? 'bg-white/40' : 'bg-gray-500'}`} style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <audio 
        ref={audioRef} 
        onTimeUpdate={handleTimeUpdate} 
        onEnded={onNext}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onCanPlay={() => setIsBuffering(false)}
        onLoadedMetadata={handleTimeUpdate}
        onError={handleAudioError}
        preload="auto"
      />
    </>
  );
};

export default Player;
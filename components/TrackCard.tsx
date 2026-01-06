
import React from 'react';
import { Track } from '../types';

interface TrackCardProps {
  track: Track;
  onPlay: () => void;
  onToggleLibrary?: () => void;
  isInLibrary?: boolean;
  isActive?: boolean;
}

const TrackCard: React.FC<TrackCardProps> = React.memo(({ track, onPlay, onToggleLibrary, isInLibrary, isActive }) => {
  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleLibrary?.();
  };

  return (
    <div 
      onClick={onPlay}
      className={`bg-[#121212] p-3 md:p-4 rounded-lg hover:bg-[#202020] transition-all duration-300 cursor-pointer group shadow-md relative will-change-transform ${isActive ? 'ring-1 ring-[#1DB954]' : ''}`}
      style={{ contentVisibility: 'auto' }}
    >
      <div className="relative mb-3 aspect-square overflow-hidden rounded-md">
        <img 
          src={track.coverUrl} 
          alt={track.title} 
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover shadow-lg transition-transform duration-500 group-hover:scale-105" 
        />
        
        <button 
          onClick={handleLikeClick}
          className={`absolute top-2 right-2 p-1.5 rounded-full transition-all duration-200 md:opacity-0 group-hover:opacity-100 ${isInLibrary ? 'text-[#1DB954] opacity-100 bg-black/20' : 'text-white/70 hover:text-white bg-black/40'}`}
        >
          <svg className="w-5 h-5" fill={isInLibrary ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        <div className="hidden md:flex absolute right-2 bottom-2 w-10 h-10 bg-[#1DB954] rounded-full items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl">
          <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>
      <h3 className={`font-bold truncate text-sm md:text-base transition-colors ${isActive ? 'text-[#1DB954]' : 'text-white'}`}>{track.title}</h3>
      <p className="text-gray-400 text-[11px] md:text-sm font-medium truncate mt-0.5">{track.artist}</p>
    </div>
  );
});

TrackCard.displayName = 'TrackCard';

export default TrackCard;

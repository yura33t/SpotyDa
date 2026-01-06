
import React from 'react';
import { Track } from '../types.ts';

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
      className={`bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-all duration-300 cursor-pointer group shadow-xl relative will-change-transform ${isActive ? 'ring-2 ring-[#1DB954]' : ''}`}
    >
      <div className="relative mb-4 aspect-square overflow-hidden rounded-md shadow-2xl">
        <img 
          src={track.coverUrl} 
          alt={track.title} 
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        
        <button 
          onClick={handleLikeClick}
          className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 md:opacity-0 group-hover:opacity-100 ${isInLibrary ? 'text-[#1DB954] opacity-100 bg-black/40' : 'text-white/70 hover:text-white bg-black/40'}`}
        >
          <svg className="w-5 h-5" fill={isInLibrary ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        <div className="hidden md:flex absolute right-2 bottom-2 w-12 h-12 bg-[#1DB954] rounded-full items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-2xl">
          <svg className="w-6 h-6 text-black ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>
      <h3 className={`font-bold truncate text-base mb-1 ${isActive ? 'text-[#1DB954]' : 'text-white'}`}>{track.title}</h3>
      <p className="text-[#b3b3b3] text-sm font-semibold truncate">{track.artist}</p>
    </div>
  );
});

TrackCard.displayName = 'TrackCard';

export default TrackCard;

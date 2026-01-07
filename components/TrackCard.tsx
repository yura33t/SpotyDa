
import React from 'react';
import { Track } from '../types.ts';

interface TrackCardProps {
  track: Track;
  index?: number;
  onPlay: () => void;
  onToggleLibrary?: () => void;
  onMove?: (direction: 'up' | 'down') => void;
  isInLibrary?: boolean;
  isActive?: boolean;
  viewMode?: 'grid' | 'list';
}

const TrackCard: React.FC<TrackCardProps> = React.memo(({ 
  track, 
  index, 
  onPlay, 
  onToggleLibrary, 
  onMove,
  isInLibrary, 
  isActive, 
  viewMode = 'grid' 
}) => {
  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  if (viewMode === 'list') {
    return (
      <div 
        onClick={onPlay}
        className={`flex items-center p-2 rounded-md hover:bg-white/10 transition-colors group cursor-pointer ${isActive ? 'bg-white/5' : ''}`}
      >
        <div className="w-8 text-right mr-4 text-gray-500 font-medium text-sm">
          {index !== undefined ? index + 1 : ''}
        </div>
        <div className="relative w-10 h-10 mr-4 shrink-0">
          <img src={track.coverUrl} className="w-full h-full object-cover rounded shadow" alt={track.title} />
          {isActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded">
               <div className="w-2 h-2 bg-[#1DB954] rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-bold truncate ${isActive ? 'text-[#1DB954]' : 'text-white'}`}>{track.title}</div>
          <div className="text-xs text-gray-400 truncate">{track.artist}</div>
        </div>
        <div className="hidden md:block text-xs text-gray-500 px-4 truncate max-w-[150px]">
          {track.album}
        </div>
        <div className="flex items-center space-x-2 ml-auto">
          {onMove && (
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => handleActionClick(e, () => onMove('up'))}
                className="p-1 hover:text-white text-gray-500"
                title="Move Up"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
              </button>
              <button 
                onClick={(e) => handleActionClick(e, () => onMove('down'))}
                className="p-1 hover:text-white text-gray-500"
                title="Move Down"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
            </div>
          )}
          <div className="text-xs text-gray-500 w-10 text-right">{track.duration}</div>
          <button 
            onClick={(e) => handleActionClick(e, onToggleLibrary!)}
            className={`p-2 transition-colors ${isInLibrary ? 'text-[#1DB954]' : 'text-gray-500 hover:text-white'}`}
          >
            <svg className="w-5 h-5" fill={isInLibrary ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={onPlay}
      className={`bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-all duration-300 cursor-pointer group shadow-xl relative will-change-transform ${isActive ? 'ring-2 ring-[#1DB954]' : ''}`}
    >
      <div className="relative mb-4 aspect-square overflow-hidden rounded-md shadow-2xl">
        {index !== undefined && (
          <div className="absolute top-2 left-2 z-10 w-6 h-6 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-[10px] font-black text-white border border-white/10">
            {index + 1}
          </div>
        )}
        <img 
          src={track.coverUrl} 
          alt={track.title} 
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        
        <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {track.duration}
        </div>

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
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0 flex-1">
          <h3 className={`font-bold truncate text-base mb-1 ${isActive ? 'text-[#1DB954]' : 'text-white'}`}>{track.title}</h3>
          <p className="text-[#b3b3b3] text-sm font-semibold truncate">{track.artist}</p>
        </div>
        <span className="text-[10px] text-gray-500 font-medium mt-1.5 md:hidden">{track.duration}</span>
      </div>
    </div>
  );

  function handleLikeClick(e: React.MouseEvent) {
    e.stopPropagation();
    onToggleLibrary?.();
  }
});

TrackCard.displayName = 'TrackCard';

export default TrackCard;

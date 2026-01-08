
import React from 'react';
import { Track } from '../types.ts';

interface TrackCardProps {
  track: Track;
  index?: number;
  onPlay: () => void;
  onToggleLibrary?: () => void;
  onAddToPlaylist?: () => void;
  onMove?: (direction: 'up' | 'down') => void;
  isInLibrary?: boolean;
  isActive?: boolean;
  viewMode?: 'grid' | 'list';
  accentColor?: string;
  isDarkMode: boolean;
}

const TrackCard: React.FC<TrackCardProps> = React.memo(({ 
  track, 
  index, 
  onPlay, 
  onToggleLibrary, 
  onAddToPlaylist,
  onMove,
  isInLibrary, 
  isActive, 
  viewMode = 'grid',
  accentColor = '#1DB954',
  isDarkMode
}) => {
  
  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleLibrary?.();
  };

  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToPlaylist?.();
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.onerror = null; 
    target.src = `https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=480&h=480&fit=crop&auto=format&q=80`;
  };

  if (viewMode === 'list') {
    return (
      <div 
        onClick={onPlay}
        className={`flex items-center p-2 rounded-md transition-colors group cursor-pointer ${isActive ? (isDarkMode ? 'bg-white/5' : 'bg-gray-100') : (isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-50')}`}
      >
        <div className="w-8 text-right mr-4 text-gray-500 font-medium text-sm">
          {index !== undefined ? index + 1 : ''}
        </div>
        <div className="relative w-10 h-10 mr-4 shrink-0">
          <img 
            src={track.coverUrl} 
            className="w-full h-full object-cover rounded shadow" 
            alt={track.title} 
            onError={handleImageError}
          />
          {isActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded">
               <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accentColor }}></div>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-bold truncate ${isActive ? 'text-current' : isDarkMode ? 'text-white' : 'text-gray-900'}`} style={{ color: isActive ? accentColor : undefined }}>{track.title}</div>
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
            onClick={handlePlusClick}
            className={`p-2 transition-colors text-gray-500 hover:text-white`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </button>
          <button 
            onClick={handleLikeClick}
            className={`p-2 transition-colors ${isInLibrary ? 'text-current' : 'text-gray-500 hover:text-white'}`}
            style={{ color: isInLibrary ? accentColor : undefined }}
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
      className={`p-4 rounded-lg transition-all duration-300 cursor-pointer group shadow-xl relative will-change-transform ${isActive ? 'ring-2' : ''} ${isDarkMode ? 'bg-[#181818] hover:bg-[#282828]' : 'bg-white hover:bg-gray-50 border border-gray-100'}`}
      style={{ '--tw-ring-color': accentColor } as any}
    >
      <div className={`relative mb-4 aspect-square overflow-hidden rounded-md shadow-2xl ${isDarkMode ? 'bg-[#282828]' : 'bg-gray-100'}`}>
        {index !== undefined && (
          <div className="absolute top-2 left-2 z-10 w-6 h-6 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-[10px] font-black text-white border border-white/10">
            {index + 1}
          </div>
        )}
        <img 
          src={track.coverUrl} 
          alt={track.title} 
          loading="lazy"
          onError={handleImageError}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        
        <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {track.duration}
        </div>

        <div className="absolute top-2 right-2 flex flex-col space-y-2">
            <button 
                onClick={handleLikeClick}
                className={`p-2 rounded-full transition-all duration-200 md:opacity-0 group-hover:opacity-100 ${isInLibrary ? 'opacity-100 bg-black/40' : 'text-white/70 hover:text-white bg-black/40'}`}
                style={{ color: isInLibrary ? accentColor : undefined }}
            >
                <svg className="w-5 h-5" fill={isInLibrary ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            </button>
            <button 
                onClick={handlePlusClick}
                className="p-2 rounded-full transition-all duration-200 md:opacity-0 group-hover:opacity-100 text-white/70 hover:text-white bg-black/40"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            </button>
        </div>

        <div 
          className="hidden md:flex absolute right-2 bottom-2 w-12 h-12 rounded-full items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-2xl"
          style={{ backgroundColor: accentColor }}
        >
          <svg className="w-6 h-6 text-black ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0 flex-1">
          <h3 className={`font-bold truncate text-base mb-1 ${isActive ? 'text-current' : isDarkMode ? 'text-white' : 'text-gray-900'}`} style={{ color: isActive ? accentColor : undefined }}>{track.title}</h3>
          <p className="text-[#b3b3b3] text-sm font-semibold truncate">{track.artist}</p>
        </div>
        <span className="text-[10px] text-gray-500 font-medium mt-1.5 md:hidden">{track.duration}</span>
      </div>
    </div>
  );
});

TrackCard.displayName = 'TrackCard';

export default TrackCard;

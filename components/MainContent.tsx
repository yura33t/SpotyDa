
import React, { useState, useEffect, useRef } from 'react';
import { AppSection, Track } from '../types.ts';
import TrackCard from './TrackCard.tsx';

interface MainContentProps {
  currentSection: AppSection;
  recommendations: Track[];
  searchResults: Track[];
  recentlyPlayed: Track[];
  libraryTracks: Track[];
  onSearch: (query: string) => void;
  onPlayTrack: (track: Track) => void;
  toggleLibrary: (track: Track) => void;
  onMoveTrack?: (from: number, to: number) => void;
  isLoading: boolean;
  currentTrackId?: string;
  setCurrentSection: (section: AppSection) => void;
}

const MainContent: React.FC<MainContentProps> = ({ 
  currentSection, 
  recommendations, 
  searchResults, 
  recentlyPlayed,
  libraryTracks,
  onSearch, 
  onPlayTrack,
  toggleLibrary,
  onMoveTrack,
  isLoading,
  currentTrackId,
  setCurrentSection
}) => {
  const [searchInput, setSearchInput] = useState('');
  const debounceTimer = useRef<number | null>(null);

  // Живой поиск с задержкой (debounce)
  useEffect(() => {
    if (currentSection === AppSection.SEARCH && searchInput.trim().length > 0) {
      if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
      debounceTimer.current = window.setTimeout(() => {
        onSearch(searchInput);
      }, 600);
    }
    return () => {
      if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    };
  }, [searchInput, currentSection, onSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchInput.trim()) {
      if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
      onSearch(searchInput);
    }
  };

  const renderTrackGrid = (tracks: Track[], title: string, showIndex = false) => (
    <div className="mb-8 animate-fade px-1">
      <h2 className="text-xl md:text-2xl font-black mb-4 tracking-tight">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6">
        {(tracks || []).map((track, idx) => (
          <TrackCard 
            key={track.id} 
            track={track} 
            index={showIndex ? idx : undefined}
            onPlay={() => onPlayTrack(track)}
            onToggleLibrary={() => toggleLibrary(track)}
            isInLibrary={libraryTracks.some(t => t.id === track.id)}
            isActive={track.id === currentTrackId}
          />
        ))}
      </div>
    </div>
  );

  const renderLibraryList = () => (
    <div className="mt-4 animate-fade">
      <div className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/10 pb-2 mb-4 px-2">
        <div className="w-8 text-right mr-4">#</div>
        <div className="flex-1">Title</div>
        <div className="hidden md:block px-4 max-w-[150px] w-full">Album</div>
        <div className="ml-auto flex items-center space-x-2">
           <div className="w-10 text-right"><svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
           <div className="w-9"></div>
        </div>
      </div>
      <div className="space-y-1">
        {libraryTracks.map((track, idx) => (
          <TrackCard 
            key={track.id}
            track={track}
            index={idx}
            viewMode="list"
            onPlay={() => onPlayTrack(track)}
            onToggleLibrary={() => toggleLibrary(track)}
            onMove={(direction) => {
              if (onMoveTrack) {
                const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
                onMoveTrack(idx, targetIdx);
              }
            }}
            isInLibrary={true}
            isActive={track.id === currentTrackId}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="relative h-full pb-48 md:pb-32">
      <div className="p-4 md:p-8 pt-6">
        {currentSection === AppSection.HOME && (
          <>
            <h1 className="text-2xl md:text-3xl font-black mb-6 tracking-tighter">Good day</h1>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 mb-8">
              {(recommendations || []).slice(0, 6).map((track) => (
                <div 
                  key={track.id} 
                  onClick={() => onPlayTrack(track)}
                  className="flex items-center bg-white/5 rounded-md overflow-hidden hover:bg-white/10 transition-all cursor-pointer group border border-white/5 active:scale-95"
                >
                  <div className="relative shrink-0">
                    <img src={track.coverUrl} className="w-12 h-12 md:w-16 md:h-16 object-cover" alt={track.title} />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  </div>
                  <div className="flex flex-1 items-center justify-between px-3 min-w-0">
                    <div className="flex flex-col min-w-0">
                       <span className="text-[11px] font-bold truncate">{track.title}</span>
                       <span className="text-[9px] text-gray-500 truncate">{track.artist}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {recentlyPlayed.length > 0 && renderTrackGrid(recentlyPlayed, "Recently Played")}
            {renderTrackGrid(recommendations, "Fresh Picks", true)}
          </>
        )}

        {currentSection === AppSection.SEARCH && (
          <div className="animate-fade">
            <div className="sticky top-0 z-10 py-3 bg-black/95 -mx-4 px-4 mb-6">
               <div className="relative">
                  <input
                    type="text"
                    autoFocus
                    value={searchInput}
                    onKeyDown={handleKeyDown}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search artists, songs or genres..."
                    className="w-full bg-[#242424] text-white py-3.5 px-12 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1DB954]/50 transition-all"
                  />
                  <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  {isLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
               </div>
            </div>
            {isLoading && searchResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-10 h-10 border-4 border-[#1DB954] border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-400 animate-pulse font-bold">Searching Jamendo library...</p>
                </div>
            ) : searchResults.length > 0 ? (
                renderTrackGrid(searchResults, "Top Results", true)
            ) : searchInput.trim() !== '' && !isLoading ? (
                <div className="text-center py-20">
                  <p className="text-xl font-bold mb-2">No results for "{searchInput}"</p>
                  <p className="text-gray-400">Try searching for something else or check your spelling.</p>
                </div>
            ) : (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                     <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <p className="text-white text-xl font-bold mb-1">Search for your favorite music</p>
                  <p className="text-gray-400">Explore millions of independent tracks on SpotyDa</p>
                </div>
            )}
          </div>
        )}

        {currentSection === AppSection.LIBRARY && (
           <div className="animate-fade">
             <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-6 mb-8 text-center md:text-left">
               <div className="w-40 h-40 md:w-52 md:h-52 bg-gradient-to-br from-[#450af5] to-[#c4efd9] shadow-2xl rounded-sm flex items-center justify-center">
                 <svg className="w-20 h-20 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
               </div>
               <div>
                 <p className="text-xs font-bold uppercase tracking-widest mb-2">Playlist</p>
                 <h1 className="text-3xl md:text-7xl font-black tracking-tighter mb-4">Liked Songs</h1>
                 <p className="text-sm text-gray-400 font-semibold">{libraryTracks.length} tracks</p>
               </div>
             </div>
             
             {libraryTracks.length > 0 ? renderLibraryList() : (
               <div className="py-20 text-center">
                 <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </div>
                 <p className="text-gray-400 font-bold">Songs you like will appear here</p>
                 <button 
                  onClick={() => setCurrentSection(AppSection.SEARCH)}
                  className="mt-4 bg-white text-black font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform"
                 >
                  Find songs
                 </button>
               </div>
             )}
           </div>
        )}
      </div>
    </div>
  );
};

export default MainContent;

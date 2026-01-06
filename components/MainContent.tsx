
import React, { useState, useEffect, useRef } from 'react';
import { AppSection, Track } from '../types';
import TrackCard from './TrackCard';

interface MainContentProps {
  currentSection: AppSection;
  recommendations: Track[];
  searchResults: Track[];
  recentlyPlayed: Track[];
  libraryTracks: Track[];
  onSearch: (query: string) => void;
  onPlayTrack: (track: Track) => void;
  toggleLibrary: (track: Track) => void;
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
  isLoading,
  currentTrackId,
  setCurrentSection
}) => {
  const [searchInput, setSearchInput] = useState('');
  const debounceTimer = useRef<number | null>(null);

  // Оптимизированный поиск с Debounce
  useEffect(() => {
    if (currentSection === AppSection.SEARCH && searchInput.trim().length > 1) {
      if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
      debounceTimer.current = window.setTimeout(() => {
        onSearch(searchInput);
      }, 500);
    }
    return () => {
      if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    };
  }, [searchInput, currentSection, onSearch]);

  const renderTrackGrid = (tracks: Track[], title: string) => (
    <div className="mb-10 animate-page-enter">
      <h2 className="text-xl md:text-2xl font-bold mb-4 tracking-tight">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6">
        {tracks.map(track => (
          <TrackCard 
            key={track.id} 
            track={track} 
            onPlay={() => onPlayTrack(track)}
            onToggleLibrary={() => toggleLibrary(track)}
            isInLibrary={libraryTracks.some(t => t.id === track.id)}
            isActive={track.id === currentTrackId}
          />
        ))}
      </div>
    </div>
  );

  const renderHome = () => (
    <div className="p-4 md:p-8 pb-40 md:pb-32 animate-page-enter">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-tighter">Welcome back</h1>
      
      {/* Сетка быстрого доступа */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4 mb-10">
        {recommendations.slice(0, 8).map(track => (
          <div 
            key={track.id} 
            onClick={() => onPlayTrack(track)}
            className="flex items-center bg-white/5 rounded-md overflow-hidden hover:bg-white/10 transition-all cursor-pointer group shadow-lg border border-white/5"
          >
            <div className="w-12 h-12 md:w-20 md:h-20 shrink-0 bg-neutral-800">
              <img 
                src={track.coverUrl} 
                alt={track.title} 
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = `https://picsum.photos/seed/${track.id}/200/200?grayscale`;
                }}
              />
            </div>
            <span className="flex-1 px-3 text-[11px] md:text-sm font-bold truncate">{track.title}</span>
            <div className="pr-3 opacity-0 group-hover:opacity-100 transition-opacity">
               <div className="w-8 h-8 bg-[#1DB954] rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
               </div>
            </div>
          </div>
        ))}
      </div>

      {recentlyPlayed.length > 0 && renderTrackGrid(recentlyPlayed, "Recently Played")}
      {renderTrackGrid(recommendations, "Made for you")}
    </div>
  );

  const renderLibrary = () => (
    <div className="p-4 md:p-8 pb-40 md:pb-32 animate-page-enter">
      <div className="flex items-end space-x-6 mb-8 bg-gradient-to-b from-green-900/20 to-transparent -m-8 p-8 pt-16">
        <div className="w-40 h-40 md:w-52 md:h-52 bg-gradient-to-br from-indigo-700 to-indigo-400 shadow-2xl flex items-center justify-center rounded-lg">
          <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-2">Playlist</p>
          <h1 className="text-4xl md:text-7xl font-black mb-6 tracking-tighter">Liked Songs</h1>
          <p className="text-sm font-medium text-gray-300">{libraryTracks.length} tracks</p>
        </div>
      </div>

      {libraryTracks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6 mt-8">
          {libraryTracks.map(track => (
            <TrackCard 
              key={track.id} 
              track={track} 
              onPlay={() => onPlayTrack(track)}
              onToggleLibrary={() => toggleLibrary(track)}
              isInLibrary={true}
              isActive={track.id === currentTrackId}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-32">
          <h2 className="text-2xl font-bold mb-4">Your library is empty</h2>
          <button 
            onClick={() => setCurrentSection(AppSection.SEARCH)}
            className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform"
          >
            Find something to like
          </button>
        </div>
      )}
    </div>
  );

  const renderSearch = () => (
    <div className="p-4 md:p-8 pb-40 md:pb-32 animate-page-enter">
      <div className="mb-10">
        <div className="relative w-full md:max-w-xl group">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search for songs, artists, or albums"
            className="w-full bg-[#242424] text-white py-3.5 px-14 rounded-full text-sm font-medium focus:outline-none focus:bg-[#2a2a2a] border border-transparent focus:border-white/10 transition-all shadow-2xl"
          />
          <svg className="w-6 h-6 absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-10 h-10 border-2 border-white/10 border-t-[#1DB954] rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 text-sm">Searching the galaxy...</p>
        </div>
      ) : searchResults.length > 0 ? (
        renderTrackGrid(searchResults, "Top results")
      ) : (
        <div className="text-center py-20 opacity-40">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>
          <h2 className="text-xl font-bold">Discover new music</h2>
          <p className="text-sm mt-1">Search for your favorite tracks and artists.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative h-full">
      <header className="sticky top-0 h-16 flex items-center px-4 md:px-8 bg-[#121212]/80 backdrop-blur-md z-40 border-b border-white/5">
        <div className="flex items-center space-x-4">
           <div className="flex space-x-2">
              <button onClick={() => window.history.back()} className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
              </button>
              <button onClick={() => window.history.forward()} className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
              </button>
           </div>
        </div>
      </header>
      
      <div className="relative">
        {currentSection === AppSection.HOME && renderHome()}
        {currentSection === AppSection.SEARCH && renderSearch()}
        {currentSection === AppSection.LIBRARY && renderLibrary()}
      </div>

      {/* Мобильная навигация */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black border-t border-white/5 flex items-center justify-around z-[60] pb-safe">
        <button onClick={() => setCurrentSection(AppSection.HOME)} className={`flex flex-col items-center space-y-1 ${currentSection === AppSection.HOME ? 'text-white' : 'text-gray-500'}`}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button onClick={() => setCurrentSection(AppSection.SEARCH)} className={`flex flex-col items-center space-y-1 ${currentSection === AppSection.SEARCH ? 'text-white' : 'text-gray-500'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <span className="text-[10px] font-bold">Search</span>
        </button>
        <button onClick={() => setCurrentSection(AppSection.LIBRARY)} className={`flex flex-col items-center space-y-1 ${currentSection === AppSection.LIBRARY ? 'text-white' : 'text-gray-500'}`}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.75 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          <span className="text-[10px] font-bold">Library</span>
        </button>
      </nav>
    </div>
  );
};

export default MainContent;

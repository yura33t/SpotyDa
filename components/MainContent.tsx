
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
    <div className="mb-10 animate-fade">
      <h2 className="text-xl md:text-2xl font-bold mb-4 tracking-tight px-1">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6">
        {(tracks || []).map(track => (
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

  return (
    <div className="relative h-full safe-pb">
      <div className="p-4 md:p-8">
        {currentSection === AppSection.HOME && (
          <>
            <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-tighter">Good day</h1>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 mb-10">
              {(recommendations || []).slice(0, 6).map(track => (
                <div 
                  key={track.id} 
                  onClick={() => onPlayTrack(track)}
                  className="flex items-center bg-white/5 rounded-md overflow-hidden hover:bg-white/10 transition-all cursor-pointer group border border-white/5"
                >
                  <img src={track.coverUrl} className="w-12 h-12 md:w-16 md:h-16 shrink-0 object-cover" />
                  <span className="flex-1 px-3 text-[11px] font-bold truncate">{track.title}</span>
                </div>
              ))}
            </div>
            {recentlyPlayed.length > 0 && renderTrackGrid(recentlyPlayed, "Recently Played")}
            {renderTrackGrid(recommendations, "Fresh Finds")}
          </>
        )}

        {currentSection === AppSection.SEARCH && (
          <div className="animate-fade">
            <div className="sticky top-0 z-10 py-2 bg-black/95 -mx-4 px-4 mb-6">
               <div className="relative">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search music..."
                    className="w-full bg-[#242424] text-white py-3 px-12 rounded-full text-sm font-medium focus:outline-none focus:ring-1 focus:ring-white/20"
                  />
                  <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
               </div>
            </div>
            {isLoading ? (
                <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin"></div></div>
            ) : searchResults.length > 0 ? (
                renderTrackGrid(searchResults, "Results")
            ) : (
                <div className="text-center py-20 text-gray-500">Search for your favorite music</div>
            )}
          </div>
        )}

        {currentSection === AppSection.LIBRARY && (
           <div className="animate-fade">
             <h1 className="text-3xl font-bold mb-6">Library</h1>
             {libraryTracks.length > 0 ? renderTrackGrid(libraryTracks, "Liked Songs") : <div className="text-gray-500">No liked songs yet</div>}
           </div>
        )}
      </div>
    </div>
  );
};

export default MainContent;

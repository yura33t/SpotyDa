
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import Player from './components/Player';
import { AppSection, Track } from './types';
import { getRecommendations, searchMusic } from './services/gemini';

const App: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<AppSection>(AppSection.HOME);
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>([]);
  const [libraryTracks, setLibraryTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedRecs = localStorage.getItem('spotyda_recs');
    if (savedRecs) setRecommendations(JSON.parse(savedRecs));

    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const recs = await getRecommendations();
        if (recs && recs.length > 0) {
          setRecommendations(recs);
          localStorage.setItem('spotyda_recs', JSON.stringify(recs));
        }
      } catch (err) {
        console.error("Initial load failed", err);
      }
      setIsLoading(false);
    };
    fetchInitialData();

    const savedRecent = localStorage.getItem('spotyda_recent');
    if (savedRecent) setRecentlyPlayed(JSON.parse(savedRecent));

    const savedLibrary = localStorage.getItem('spotyda_library');
    if (savedLibrary) setLibraryTracks(JSON.parse(savedLibrary));
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setIsLoading(true);
    setCurrentSection(AppSection.SEARCH);
    try {
      const results = await searchMusic(query);
      setSearchResults(results || []);
    } catch (err) {
      console.error("Search error", err);
    }
    setIsLoading(false);
  }, []);

  const handlePlayTrack = useCallback((track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(t => t.id !== track.id);
      const updated = [track, ...filtered].slice(0, 10);
      localStorage.setItem('spotyda_recent', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const toggleLibrary = useCallback((track: Track) => {
    setLibraryTracks(prev => {
      const isBookmarked = prev.some(t => t.id === track.id);
      const updated = isBookmarked 
        ? prev.filter(t => t.id !== track.id) 
        : [track, ...prev];
      localStorage.setItem('spotyda_library', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isInLibrary = useMemo(() => 
    (trackId?: string) => !!libraryTracks.find(t => t.id === trackId),
  [libraryTracks]);

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden selection:bg-[#1DB954]/30">
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar currentSection={currentSection} setCurrentSection={setCurrentSection} />
        
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#121212] to-black scroll-smooth">
          <MainContent 
            currentSection={currentSection} 
            setCurrentSection={setCurrentSection}
            recommendations={recommendations}
            searchResults={searchResults}
            recentlyPlayed={recentlyPlayed}
            libraryTracks={libraryTracks}
            toggleLibrary={toggleLibrary}
            onSearch={handleSearch}
            onPlayTrack={handlePlayTrack}
            isLoading={isLoading}
            currentTrackId={currentTrack?.id}
          />
        </main>
      </div>

      {/* Мобильная навигация */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/95 backdrop-blur-md border-t border-white/10 flex items-center justify-around z-[60] px-4 pb-safe">
        <button 
          onClick={() => setCurrentSection(AppSection.HOME)}
          className={`flex flex-col items-center space-y-1 ${currentSection === AppSection.HOME ? 'text-white' : 'text-gray-500'}`}
        >
          <svg className="w-6 h-6" fill={currentSection === AppSection.HOME ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[10px] font-medium">Home</span>
        </button>
        <button 
          onClick={() => setCurrentSection(AppSection.SEARCH)}
          className={`flex flex-col items-center space-y-1 ${currentSection === AppSection.SEARCH ? 'text-white' : 'text-gray-500'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-[10px] font-medium">Search</span>
        </button>
        <button 
          onClick={() => setCurrentSection(AppSection.LIBRARY)}
          className={`flex flex-col items-center space-y-1 ${currentSection === AppSection.LIBRARY ? 'text-white' : 'text-gray-500'}`}
        >
          <svg className="w-6 h-6" fill={currentSection === AppSection.LIBRARY ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
          </svg>
          <span className="text-[10px] font-medium">Library</span>
        </button>
      </div>

      <Player 
        currentTrack={currentTrack} 
        isPlaying={isPlaying} 
        setIsPlaying={setIsPlaying}
        toggleLibrary={() => currentTrack && toggleLibrary(currentTrack)}
        isInLibrary={currentTrack ? isInLibrary(currentTrack.id) : false}
      />
    </div>
  );
};

export default App;

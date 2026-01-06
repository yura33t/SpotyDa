
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar.tsx';
import MainContent from './components/MainContent.tsx';
import Player from './components/Player.tsx';
import { AppSection, Track } from './types.ts';
import { getRecommendations, searchMusic } from './services/gemini.ts';

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

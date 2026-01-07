
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar.tsx';
import MainContent from './components/MainContent.tsx';
import Player from './components/Player.tsx';
import { AppSection, Track } from './types.ts';
import { getRecommendations, searchMusic } from './services/musicApi.ts';

const storage = {
  get: (key: string) => {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch (e) {
      return null;
    }
  },
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }
};

const App: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<AppSection>(AppSection.HOME);
  const [recommendations, setRecommendations] = useState<Track[]>(storage.get('spotyda_recs') || []);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>(storage.get('spotyda_recent') || []);
  const [libraryTracks, setLibraryTracks] = useState<Track[]>(storage.get('spotyda_library') || []);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Скрываем загрузчик сразу при монтировании, так как у нас есть кэшированные рекомендации
    const loader = document.getElementById('loader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 300);
    }

    const initData = async () => {
      // Даже если данные есть в кэше, пробуем обновить их незаметно
      try {
        const freshRecs = await getRecommendations();
        if (freshRecs && freshRecs.length > 0) {
          setRecommendations(freshRecs);
          storage.set('spotyda_recs', freshRecs);
        }
      } catch (err) {
        console.warn("Could not refresh data, using offline cache.");
      }
    };
    initData();
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setIsLoading(true);
    setCurrentSection(AppSection.SEARCH);
    try {
      const results = await searchMusic(query);
      setSearchResults(results);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePlayTrack = useCallback((track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(t => t.id !== track.id);
      const updated = [track, ...filtered].slice(0, 15);
      storage.set('spotyda_recent', updated);
      return updated;
    });
  }, []);

  const toggleLibrary = useCallback((track: Track) => {
    setLibraryTracks(prev => {
      const isBookmarked = prev.some(t => t.id === track.id);
      const updated = isBookmarked 
        ? prev.filter(t => t.id !== track.id) 
        : [track, ...prev];
      storage.set('spotyda_library', updated);
      return updated;
    });
  }, []);

  const isInLibrary = useMemo(() => 
    (trackId?: string) => !!libraryTracks.find(t => t.id === trackId),
  [libraryTracks]);

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden select-none">
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

      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[64px] bg-black/95 backdrop-blur-xl border-t border-white/5 flex items-center justify-around z-[110] px-6 pb-[env(safe-area-inset-bottom)]">
        {[
          { id: AppSection.HOME, label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
          { id: AppSection.SEARCH, label: 'Search', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
          { id: AppSection.LIBRARY, label: 'Library', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253' }
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => setCurrentSection(item.id)} 
            className={`flex flex-col items-center justify-center transition-all ${currentSection === item.id ? 'text-white scale-105' : 'text-gray-500'}`}
          >
            <svg className="w-6 h-6 mb-1" fill={currentSection === item.id ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;

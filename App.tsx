
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar.tsx';
import MainContent from './components/MainContent.tsx';
import Player from './components/Player.tsx';
import BottomNav from './components/BottomNav.tsx';
import SettingsModal from './components/SettingsModal.tsx';
import PlaylistModal from './components/PlaylistModal.tsx';
import { AppSection, Track, Playlist } from './types.ts';
import { getRecommendations, searchMusic } from './services/musicApi.ts';
import { getSmartSearchQuery, analyzeWallpaper, enhanceWallpaper, WallpaperAnalysis } from './services/gemini.ts';

const storage = {
  get: (key: string) => {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch { return null; }
  },
  set: (key: string, value: any) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {
      console.error("Storage limit reached", e);
    }
  }
};

const App: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<AppSection>(AppSection.HOME);
  const [recommendations, setRecommendations] = useState<Track[]>(storage.get('spotyda_recs') || []);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>(storage.get('spotyda_recent') || []);
  const [libraryTracks, setLibraryTracks] = useState<Track[]>(storage.get('spotyda_library') || []);
  const [playlists, setPlaylists] = useState<Playlist[]>(storage.get('spotyda_playlists') || []);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentQueue, setCurrentQueue] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshingRecs, setIsRefreshingRecs] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(storage.get('spotyda_theme_dark') ?? true);
  
  const [trackToAdd, setTrackToAdd] = useState<Track | null>(null);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);

  const [customBg, setCustomBg] = useState<string | null>(storage.get('spotyda_bg'));
  const [bgType, setBgType] = useState<'image' | 'video'>(storage.get('spotyda_bg_type') || 'image');
  const [bgAnalysis, setBgAnalysis] = useState<WallpaperAnalysis | null>(storage.get('spotyda_bg_analysis'));
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const toggleTheme = () => {
    const newVal = !isDarkMode;
    setIsDarkMode(newVal);
    storage.set('spotyda_theme_dark', newVal);
  };

  const fetchRecommendations = useCallback(async () => {
    setIsRefreshingRecs(true);
    try {
      const recs = await getRecommendations();
      if (recs && recs.length > 0) {
        setRecommendations(recs);
        storage.set('spotyda_recs', recs);
      }
    } catch (err) {
      console.warn("Failed to load recs", err);
    } finally {
      setIsRefreshingRecs(false);
    }
  }, []);

  useEffect(() => {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 500);
    }

    if (recommendations.length === 0) {
      fetchRecommendations();
    }
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setIsLoading(true);
    setCurrentSection(AppSection.SEARCH);
    try {
      const optimized = await getSmartSearchQuery(query);
      const results = await searchMusic(optimized);
      setSearchResults(results);
    } catch (err) {
      console.error("Search handle error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePlayTrack = useCallback((track: Track, queue: Track[] = []) => {
    setCurrentTrack(track);
    if (queue.length > 0) setCurrentQueue(queue);
    setIsPlaying(true);
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(t => t.id !== track.id);
      const updated = [track, ...filtered].slice(0, 15);
      storage.set('spotyda_recent', updated);
      return updated;
    });
  }, []);

  const playNext = useCallback(() => {
    if (!currentTrack || currentQueue.length === 0) return;
    const currentIndex = currentQueue.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % currentQueue.length;
    setCurrentTrack(currentQueue[nextIndex]);
  }, [currentTrack, currentQueue]);

  const playPrevious = useCallback(() => {
    if (!currentTrack || currentQueue.length === 0) return;
    const currentIndex = currentQueue.findIndex(t => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + currentQueue.length) % currentQueue.length;
    setCurrentTrack(currentQueue[prevIndex]);
  }, [currentTrack, currentQueue]);

  const toggleLibrary = useCallback((track: Track) => {
    setLibraryTracks(prev => {
      const exists = prev.some(t => t.id === track.id);
      const updated = exists ? prev.filter(t => t.id !== track.id) : [track, ...prev];
      storage.set('spotyda_library', updated);
      return updated;
    });
  }, []);

  const createPlaylist = () => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      title: `Мой плейлист #${playlists.length + 1}`,
      tracks: [],
      createdAt: Date.now()
    };
    const updated = [newPlaylist, ...playlists];
    setPlaylists(updated);
    storage.set('spotyda_playlists', updated);
    setSelectedPlaylistId(newPlaylist.id);
    setCurrentSection(AppSection.PLAYLIST);
  };

  const deletePlaylist = (id: string) => {
    const updated = playlists.filter(p => p.id !== id);
    setPlaylists(updated);
    storage.set('spotyda_playlists', updated);
    if (selectedPlaylistId === id) {
      setCurrentSection(AppSection.HOME);
      setSelectedPlaylistId(null);
    }
  };

  const renamePlaylist = (id: string, newTitle: string) => {
    const updated = playlists.map(p => p.id === id ? { ...p, title: newTitle } : p);
    setPlaylists(updated);
    storage.set('spotyda_playlists', updated);
  };

  const addToPlaylist = (playlistId: string, track: Track) => {
    const updated = playlists.map(p => {
      if (p.id === playlistId) {
        if (p.tracks.some(t => t.id === track.id)) return p;
        return { ...p, tracks: [...p.tracks, track] };
      }
      return p;
    });
    setPlaylists(updated);
    storage.set('spotyda_playlists', updated);
    setIsPlaylistModalOpen(false);
  };

  const removeFromPlaylist = (playlistId: string, trackId: string) => {
    const updated = playlists.map(p => {
      if (p.id === playlistId) {
        return { ...p, tracks: p.tracks.filter(t => t.id !== trackId) };
      }
      return p;
    });
    setPlaylists(updated);
    storage.set('spotyda_playlists', updated);
  };

  const handleOpenPlaylistModal = (track: Track) => {
    setTrackToAdd(track);
    setIsPlaylistModalOpen(true);
  };

  const optimizeImage = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const TARGET_WIDTH = 1920;
        const TARGET_HEIGHT = 1080;
        let width = img.width;
        let height = img.height;
        const aspectRatio = width / height;
        if (width > TARGET_WIDTH || height > TARGET_HEIGHT) {
          if (aspectRatio > (TARGET_WIDTH / TARGET_HEIGHT)) {
            width = TARGET_WIDTH;
            height = TARGET_WIDTH / aspectRatio;
          } else {
            height = TARGET_HEIGHT;
            width = TARGET_HEIGHT * aspectRatio;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          resolve(base64);
        }
      };
    });
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsAnalyzing(true);
      const isVideo = file.type.startsWith('video/');
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        if (isVideo) {
          setCustomBg(base64);
          setBgType('video');
          setBgAnalysis(null);
          storage.set('spotyda_bg', base64);
          storage.set('spotyda_bg_type', 'video');
          storage.set('spotyda_bg_analysis', null);
          setIsAnalyzing(false);
        } else {
          const initialOptimized = await optimizeImage(base64);
          const enhanced = await enhanceWallpaper(initialOptimized);
          const finalOptimized = await optimizeImage(enhanced);
          const analysis = await analyzeWallpaper(finalOptimized);
          setCustomBg(finalOptimized);
          setBgType('image');
          setBgAnalysis(analysis);
          storage.set('spotyda_bg', finalOptimized);
          storage.set('spotyda_bg_type', 'image');
          storage.set('spotyda_bg_analysis', analysis);
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBg = () => {
    setCustomBg(null);
    setBgAnalysis(null);
    localStorage.removeItem('spotyda_bg');
    localStorage.removeItem('spotyda_bg_type');
    localStorage.removeItem('spotyda_bg_analysis');
  };

  const selectedPlaylist = playlists.find(p => p.id === selectedPlaylistId);

  return (
    <div className={`flex flex-col h-screen overflow-hidden select-none relative transition-colors duration-500 ${isDarkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'} ${isDarkMode ? 'dark' : ''}`}>
      {customBg && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          {bgType === 'video' ? (
            <video 
              src={customBg} 
              autoPlay loop muted playsInline
              className={`w-full h-full object-cover ${isDarkMode ? 'opacity-70' : 'opacity-40'}`}
            />
          ) : (
            <div 
              className="absolute inset-0 bg-cover transition-all duration-1000 ease-in-out" 
              style={{ 
                backgroundImage: `url(${customBg})`,
                filter: bgAnalysis?.filters || (isDarkMode ? 'brightness(0.5)' : 'brightness(0.8)'),
                backgroundPosition: bgAnalysis ? `${bgAnalysis.focalPoint.x}% ${bgAnalysis.focalPoint.y}%` : 'center',
                backgroundSize: 'cover'
              }}
            />
          )}
          <div className={`absolute inset-0 z-0 ${isDarkMode ? 'bg-black/20' : 'bg-white/10'}`} />
        </div>
      )}
      
      {isAnalyzing && (
        <div className="fixed top-6 right-6 z-[200] flex items-center bg-white text-black px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-tighter shadow-2xl animate-pulse">
          <div className="w-2 h-2 bg-[#1DB954] rounded-full mr-2"></div>
          Gemini AI Enhancing...
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative z-10">
        <Sidebar 
          currentSection={currentSection} 
          setCurrentSection={setCurrentSection} 
          onBgUpload={handleBgUpload}
          onRemoveBg={removeBg}
          hasCustomBg={!!customBg}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          playlists={playlists}
          selectedPlaylistId={selectedPlaylistId}
          setSelectedPlaylistId={setSelectedPlaylistId}
          onCreatePlaylist={createPlaylist}
        />
        <main className={`flex-1 overflow-y-auto relative ${customBg ? 'bg-transparent' : isDarkMode ? 'bg-gradient-to-b from-[#121212] to-black' : 'bg-gradient-to-b from-white to-gray-100'}`}>
          <div className="md:hidden absolute top-4 right-4 z-[50]">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className={`p-3 backdrop-blur-md rounded-full border active:scale-90 transition-transform ${isDarkMode ? 'bg-white/10 text-white border-white/10' : 'bg-black/5 text-gray-900 border-black/5'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
          </div>

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
            isLoading={isLoading || isRefreshingRecs}
            onRefreshRecs={fetchRecommendations}
            isRefreshingRecs={isRefreshingRecs}
            currentTrackId={currentTrack?.id}
            accentColor={bgAnalysis?.themeColor}
            isDarkMode={isDarkMode}
            selectedPlaylist={selectedPlaylist}
            onRenamePlaylist={renamePlaylist}
            onDeletePlaylist={deletePlaylist}
            onRemoveFromPlaylist={removeFromPlaylist}
            onAddToPlaylistClick={handleOpenPlaylistModal}
          />
        </main>
      </div>
      
      <Player 
        currentTrack={currentTrack} 
        isPlaying={isPlaying} 
        setIsPlaying={setIsPlaying}
        onNext={playNext}
        onPrevious={playPrevious}
        toggleLibrary={() => currentTrack && toggleLibrary(currentTrack)}
        isInLibrary={currentTrack ? libraryTracks.some(t => t.id === currentTrack.id) : false}
        customBg={customBg}
        bgType={bgType}
        bgAnalysis={bgAnalysis}
        isDarkMode={isDarkMode}
      />

      <BottomNav 
        currentSection={currentSection} 
        setCurrentSection={setCurrentSection} 
        accentColor={bgAnalysis?.themeColor}
        isDarkMode={isDarkMode}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onBgUpload={handleBgUpload}
        onRemoveBg={removeBg}
        hasCustomBg={!!customBg}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />

      <PlaylistModal 
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
        playlists={playlists}
        track={trackToAdd}
        onAddToPlaylist={addToPlaylist}
        onCreatePlaylist={createPlaylist}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default App;

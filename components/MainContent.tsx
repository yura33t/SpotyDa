
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AppSection, Track, Playlist } from '../types.ts';
import TrackCard from './TrackCard.tsx';

interface MainContentProps {
  currentSection: AppSection;
  recommendations: Track[];
  searchResults: Track[];
  recentlyPlayed: Track[];
  libraryTracks: Track[];
  onSearch: (query: string) => void;
  onPlayTrack: (track: Track, queue: Track[]) => void;
  toggleLibrary: (track: Track) => void;
  isLoading: boolean;
  onRefreshRecs?: () => void;
  isRefreshingRecs?: boolean;
  currentTrackId?: string;
  setCurrentSection: (section: AppSection) => void;
  accentColor?: string;
  isDarkMode: boolean;
  selectedPlaylist?: Playlist;
  onRenamePlaylist?: (id: string, name: string) => void;
  onDeletePlaylist?: (id: string) => void;
  onRemoveFromPlaylist?: (pid: string, tid: string) => void;
  onAddToPlaylistClick?: (track: Track) => void;
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
  onRefreshRecs,
  isRefreshingRecs,
  currentTrackId,
  setCurrentSection,
  accentColor,
  isDarkMode,
  selectedPlaylist,
  onRenamePlaylist,
  onDeletePlaylist,
  onRemoveFromPlaylist,
  onAddToPlaylistClick
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const debounceTimer = useRef<number | null>(null);

  const activeColor = accentColor || '#1DB954';

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 6) return "Доброй ночи";
    if (hour < 12) return "Доброе утро";
    if (hour < 18) return "Добрый день";
    return "Добрый вечер";
  }, []);

  useEffect(() => {
    if (currentSection === AppSection.SEARCH && searchInput.trim().length > 0) {
      if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
      debounceTimer.current = window.setTimeout(() => {
        onSearch(searchInput);
      }, 300);
    }
    return () => {
      if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    };
  }, [searchInput, currentSection, onSearch]);

  const renderTrackGrid = (tracks: Track[], title: string, showIndex = false) => (
    <div className="mb-8 md:mb-10 animate-fade">
      <div className="flex items-center justify-between mb-4 md:mb-5 px-1">
        <h2 className={`text-xl md:text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
        {title === "Популярно сейчас" && onRefreshRecs && (
           <button 
             onClick={(e) => {
               e.stopPropagation();
               onRefreshRecs();
             }}
             disabled={isRefreshingRecs}
             className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-all active:scale-95 ${isRefreshingRecs ? 'opacity-50' : ''} ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`}
           >
             <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Обновить</span>
             <svg className={`w-4 h-4 text-gray-400 ${isRefreshingRecs ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
             </svg>
           </button>
        )}
      </div>
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6 transition-all duration-500 ${isRefreshingRecs ? 'opacity-20 blur-sm scale-95' : 'opacity-100'}`}>
        {(tracks || []).map((track, idx) => (
          <TrackCard 
            key={track.id + idx} 
            track={track} 
            index={showIndex ? idx : undefined}
            onPlay={() => onPlayTrack(track, tracks)}
            onToggleLibrary={() => toggleLibrary(track)}
            isInLibrary={libraryTracks.some(t => t.id === track.id)}
            isActive={track.id === currentTrackId}
            accentColor={activeColor}
            isDarkMode={isDarkMode}
            onAddToPlaylist={() => onAddToPlaylistClick?.(track)}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="relative h-full pb-40 md:pb-32 overflow-x-hidden">
      <div className="p-4 md:p-8 pt-6 md:pt-10">
        {currentSection === AppSection.HOME && (
          <div className="animate-fade">
            <div className="flex items-center justify-between mb-5 md:mb-6">
              <h1 className={`text-2xl md:text-3xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{greeting}</h1>
              <button 
                onClick={onRefreshRecs}
                disabled={isRefreshingRecs}
                className={`md:hidden p-2 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}
              >
                <svg className={`w-5 h-5 ${isRefreshingRecs ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            
            <div className={`grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 mb-8 md:mb-10 transition-all duration-500 ${isRefreshingRecs ? 'opacity-20 blur-sm' : 'opacity-100'}`}>
              {(recommendations || []).slice(0, 6).map((track, idx) => (
                <div 
                  key={track.id + "top" + idx} 
                  onClick={() => onPlayTrack(track, recommendations)}
                  className={`flex items-center rounded-md overflow-hidden transition-all cursor-pointer group border active:scale-95 ${isDarkMode ? 'bg-white/5 hover:bg-white/10 border-white/5' : 'bg-white hover:bg-gray-50 border-gray-100 shadow-sm'}`}
                >
                  <img src={track.coverUrl} className="w-14 h-14 md:w-20 md:h-20 object-cover" alt={track.title} />
                  <div className="flex flex-1 items-center justify-between px-2 md:px-3 min-w-0">
                    <div className="flex flex-col min-w-0">
                       <span className={`text-[11px] md:text-xs font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{track.title}</span>
                       <span className="text-[9px] md:text-[10px] text-gray-500 truncate">{track.artist}</span>
                    </div>
                    <div 
                      className="hidden md:flex w-8 h-8 md:w-10 md:h-10 rounded-full items-center justify-center opacity-0 group-hover:opacity-100 shadow-xl transition-all scale-75 group-hover:scale-100"
                      style={{ backgroundColor: activeColor }}
                    >
                      <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {recentlyPlayed.length > 0 && renderTrackGrid(recentlyPlayed, "Для вас")}
            {renderTrackGrid(recommendations, "Популярно сейчас", true)}
          </div>
        )}

        {currentSection === AppSection.SEARCH && (
          <div className="animate-fade">
            <div className={`sticky top-0 z-20 py-2 md:py-3 backdrop-blur-md -mx-4 px-4 mb-6 ${isDarkMode ? 'bg-black/40' : 'bg-gray-50/60'}`}>
               <div className="relative">
                  <input
                    type="text"
                    autoFocus
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Артисты или треки..."
                    className={`w-full py-3 md:py-4 pl-11 md:pl-12 pr-4 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 transition-all shadow-xl ${isDarkMode ? 'bg-[#242424] text-white' : 'bg-white text-gray-900 border border-gray-100'}`}
                    style={{ '--tw-ring-color': activeColor } as any}
                  />
                  <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  {isLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: activeColor, borderTopColor: 'transparent' }}></div>
                    </div>
                  )}
               </div>
            </div>
            {isLoading && searchResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mb-6" style={{ borderColor: activeColor, borderTopColor: 'transparent' }}></div>
                  <p className="text-gray-400 font-bold animate-pulse">Ищем лучшие ритмы...</p>
                </div>
            ) : searchResults.length > 0 ? (
                renderTrackGrid(searchResults, "Результаты поиска", true)
            ) : (
                <div className="text-center py-20 md:py-24 px-4">
                  <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border transition-colors ${isDarkMode ? 'bg-[#1a1a1a] border-white/5' : 'bg-white border-gray-100'}`}>
                     <svg className="w-10 h-10 md:w-12 md:h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <p className={`text-xl md:text-2xl font-black mb-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Слушай то, что любишь</p>
                  <p className="text-gray-400 text-xs md:text-sm">Ищи любимых исполнителей или треки</p>
                </div>
            )}
          </div>
        )}

        {currentSection === AppSection.LIBRARY && (
           <div className="animate-fade">
             <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-8 mb-8 md:mb-10 text-center md:text-left">
               <div className="w-40 h-40 md:w-64 md:h-64 bg-gradient-to-br from-[#450af5] to-[#c4efd9] shadow-2xl rounded-2xl md:rounded-lg flex items-center justify-center">
                 <svg className="w-20 h-20 md:w-24 md:h-24 text-white drop-shadow-2xl" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
               </div>
               <div className="flex-1">
                 <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2" style={{ color: activeColor }}>Плейлист</p>
                 <h1 className={`text-3xl md:text-8xl font-black tracking-tighter mb-4 md:mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Любимое</h1>
                 <div className="flex items-center justify-center md:justify-start space-x-2 text-xs font-bold text-gray-300">
                   <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] text-black font-black" style={{ backgroundColor: activeColor }}>SD</div>
                   <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>SpotyDa User</span>
                   <span className="text-gray-500">•</span>
                   <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{libraryTracks.length} треков</span>
                 </div>
               </div>
             </div>
             
             {libraryTracks.length > 0 ? (
               <div className="space-y-1">
                 {libraryTracks.map((track, idx) => (
                    <div key={track.id} className={`flex items-center p-3 rounded-lg transition-all group cursor-pointer active:scale-[0.98] ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`} onClick={() => onPlayTrack(track, libraryTracks)}>
                      <span className="hidden md:inline w-8 text-gray-500 text-sm font-medium">{idx + 1}</span>
                      <img src={track.coverUrl} className="w-12 h-12 md:w-10 md:h-10 rounded-md mr-4 shadow-md" />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm md:text-base font-bold truncate ${track.id === currentTrackId ? 'text-current' : isDarkMode ? 'text-white' : 'text-gray-900'}`} style={{ color: track.id === currentTrackId ? activeColor : undefined }}>{track.title}</p>
                        <p className="text-[11px] md:text-xs text-gray-400 truncate">{track.artist}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button onClick={(e) => { e.stopPropagation(); onAddToPlaylistClick?.(track); }} className="p-2 text-gray-400 hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); toggleLibrary(track); }} className="p-2" style={{ color: activeColor }}>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        </button>
                      </div>
                    </div>
                 ))}
               </div>
             ) : (
               <div className="py-20 text-center">
                 <p className="text-gray-400 font-bold mb-6 text-sm">Твои любимые треки появятся здесь</p>
                 <button 
                  onClick={() => setCurrentSection(AppSection.SEARCH)}
                  className={`py-3 px-8 rounded-full hover:scale-105 transition-transform shadow-xl active:scale-95 text-sm font-black ${isDarkMode ? 'bg-white text-black' : 'bg-gray-900 text-white'}`}
                 >
                  Найти что-нибудь
                 </button>
               </div>
             )}
           </div>
        )}

        {currentSection === AppSection.PLAYLIST && selectedPlaylist && (
           <div className="animate-fade">
             <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-8 mb-8 md:mb-10 text-center md:text-left">
               <div className={`w-40 h-40 md:w-64 md:h-64 shadow-2xl rounded-2xl md:rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-gradient-to-br from-gray-700 to-gray-900' : 'bg-gradient-to-br from-gray-200 to-gray-300'}`}>
                 <span className="text-6xl md:text-9xl font-black text-white/20">{selectedPlaylist.title.charAt(0).toUpperCase()}</span>
               </div>
               <div className="flex-1">
                 <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2" style={{ color: activeColor }}>Плейлист</p>
                 
                 {isEditingTitle ? (
                    <input 
                        type="text"
                        autoFocus
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onBlur={() => {
                            if (newTitle.trim()) onRenamePlaylist?.(selectedPlaylist.id, newTitle);
                            setIsEditingTitle(false);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && newTitle.trim()) {
                                onRenamePlaylist?.(selectedPlaylist.id, newTitle);
                                setIsEditingTitle(false);
                            }
                        }}
                        className={`text-3xl md:text-8xl font-black tracking-tighter mb-4 md:mb-6 bg-transparent border-b-2 outline-none w-full ${isDarkMode ? 'text-white border-white/20' : 'text-gray-900 border-black/10'}`}
                    />
                 ) : (
                    <h1 
                        onClick={() => {
                            setNewTitle(selectedPlaylist.title);
                            setIsEditingTitle(true);
                        }}
                        className={`text-3xl md:text-8xl font-black tracking-tighter mb-4 md:mb-6 cursor-pointer hover:opacity-80 transition-opacity ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                    >
                        {selectedPlaylist.title}
                    </h1>
                 )}

                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <div className="flex items-center space-x-2 text-xs font-bold">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] text-black font-black" style={{ backgroundColor: activeColor }}>SD</div>
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>SpotyDa User • {selectedPlaylist.tracks.length} треков</span>
                    </div>
                    <button 
                        onClick={() => onDeletePlaylist?.(selectedPlaylist.id)}
                        className={`text-[10px] font-black uppercase tracking-widest py-1.5 px-3 rounded-full border transition-all active:scale-95 ${isDarkMode ? 'border-red-500/30 text-red-500/70 hover:bg-red-500/10' : 'border-red-200 text-red-600 hover:bg-red-50'}`}
                    >
                        Удалить
                    </button>
                 </div>
               </div>
             </div>
             
             {selectedPlaylist.tracks.length > 0 ? (
               <div className="space-y-1">
                 {selectedPlaylist.tracks.map((track, idx) => (
                    <div key={track.id + idx} className={`flex items-center p-3 rounded-lg transition-all group cursor-pointer active:scale-[0.98] ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`} onClick={() => onPlayTrack(track, selectedPlaylist.tracks)}>
                      <span className="hidden md:inline w-8 text-gray-500 text-sm font-medium">{idx + 1}</span>
                      <img src={track.coverUrl} className="w-12 h-12 md:w-10 md:h-10 rounded-md mr-4 shadow-md" />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm md:text-base font-bold truncate ${track.id === currentTrackId ? 'text-current' : isDarkMode ? 'text-white' : 'text-gray-900'}`} style={{ color: track.id === currentTrackId ? activeColor : undefined }}>{track.title}</p>
                        <p className="text-[11px] md:text-xs text-gray-400 truncate">{track.artist}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onRemoveFromPlaylist?.(selectedPlaylist.id, track.id); }} 
                            className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                            title="Удалить из плейлиста"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                 ))}
               </div>
             ) : (
               <div className="py-20 text-center">
                 <p className="text-gray-400 font-bold mb-6 text-sm">Этот плейлист пока пуст</p>
                 <button 
                  onClick={() => setCurrentSection(AppSection.SEARCH)}
                  className={`py-3 px-8 rounded-full hover:scale-105 transition-transform shadow-xl active:scale-95 text-sm font-black ${isDarkMode ? 'bg-white text-black' : 'bg-gray-900 text-white'}`}
                 >
                  Найти музыку
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

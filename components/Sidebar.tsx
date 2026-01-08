import React, { useRef } from 'react';
import { AppSection, Playlist } from '../types.ts';

interface SidebarProps {
  currentSection: AppSection;
  setCurrentSection: (section: AppSection) => void;
  onBgUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveBg: () => void;
  hasCustomBg: boolean;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  playlists: Playlist[];
  selectedPlaylistId: string | null;
  setSelectedPlaylistId: (id: string | null) => void;
  onCreatePlaylist: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentSection, 
  setCurrentSection, 
  onBgUpload, 
  onRemoveBg,
  hasCustomBg,
  isDarkMode,
  onToggleTheme,
  playlists,
  selectedPlaylistId,
  setSelectedPlaylistId,
  onCreatePlaylist
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navItems = [
    { id: AppSection.HOME, label: 'Главная', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: AppSection.SEARCH, label: 'Поиск', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
    { id: AppSection.LIBRARY, label: 'Медиатека', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  ];

  return (
    <div className={`hidden md:flex w-64 backdrop-blur-md h-full flex-col p-4 pb-8 space-y-6 shrink-0 border-r transition-colors duration-500 ${isDarkMode ? 'bg-black/60 border-white/5' : 'bg-white/60 border-gray-200'}`}>
      <div className="flex flex-col px-2 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[#1DB954] rounded-full shadow-lg shadow-[#1DB954]/20 flex-shrink-0"></div>
          <span className={`text-2xl font-black tracking-tighter transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>SpotyDa</span>
        </div>
        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-[3px] mt-1 ml-11">by GOODvibe studio</span>
      </div>

      <nav className="flex flex-col space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
                setCurrentSection(item.id);
                setSelectedPlaylistId(null);
            }}
            className={`flex items-center space-x-4 px-3 py-3 rounded-lg transition-all ${
              currentSection === item.id && !selectedPlaylistId
                ? (isDarkMode ? 'bg-[#282828] text-white shadow-md' : 'bg-gray-200 text-gray-900 shadow-sm') 
                : (isDarkMode ? 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100')
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            <span className="font-bold">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between px-3 py-2">
            <h4 className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Плейлисты</h4>
            <button 
                onClick={onCreatePlaylist}
                className={`p-1 rounded-full transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-black hover:bg-black/5'}`}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
        </div>
        
        <div className="flex-1 overflow-y-auto mt-2 space-y-1 pr-1 custom-scrollbar">
            {playlists.length > 0 ? (
                playlists.map(p => (
                    <button
                        key={p.id}
                        onClick={() => {
                            setSelectedPlaylistId(p.id);
                            setCurrentSection(AppSection.PLAYLIST);
                        }}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all group ${
                            selectedPlaylistId === p.id 
                                ? (isDarkMode ? 'bg-[#282828] text-white' : 'bg-gray-200 text-gray-900') 
                                : (isDarkMode ? 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100')
                        }`}
                    >
                        <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center text-[10px] font-black ${isDarkMode ? 'bg-gradient-to-br from-gray-700 to-gray-900' : 'bg-gradient-to-br from-gray-200 to-gray-300'}`}>
                            {p.title.substring(0, 1).toUpperCase()}
                        </div>
                        <span className="font-medium text-sm truncate">{p.title}</span>
                    </button>
                ))
            ) : (
                <div className="px-3 py-4 text-center">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Список пуст</p>
                </div>
            )}
        </div>
      </div>

      <div className={`pt-6 space-y-4 border-t transition-colors ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
        <div className={`p-4 rounded-lg transition-colors ${isDarkMode ? 'bg-[#121212]' : 'bg-gray-100'}`}>
            <div className="flex items-center justify-between mb-2">
                <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Тема</h4>
                <button 
                    onClick={onToggleTheme}
                    className={`p-1.5 rounded-full transition-all ${isDarkMode ? 'bg-white/10 text-yellow-400 hover:bg-white/20' : 'bg-black/5 text-gray-600 hover:bg-black/10'}`}
                >
                    {isDarkMode ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z"/></svg>
                    ) : (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
                    )}
                </button>
            </div>
            <p className="text-[10px] text-gray-400">{isDarkMode ? 'Тёмный режим' : 'Светлый режим'}</p>
        </div>

        <div className={`p-4 rounded-lg transition-colors ${isDarkMode ? 'bg-[#121212]' : 'bg-gray-100'}`}>
            <h4 className={`font-bold text-sm mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Живые обои</h4>
            <p className="text-[10px] text-gray-400 leading-relaxed mb-3">Загрузи фото, GIF или видео (MP4) для фона.</p>
            <div className="flex flex-col space-y-2">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className={`w-full py-2 rounded-full text-xs font-black hover:scale-105 active:scale-95 transition-all ${isDarkMode ? 'bg-white text-black' : 'bg-gray-900 text-white'}`}
              >
                Выбрать медиа
              </button>
              {hasCustomBg && (
                <button 
                  onClick={onRemoveBg}
                  className="w-full py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-xs font-black hover:bg-red-500/20 transition-all"
                >
                  Удалить
                </button>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={onBgUpload} 
              accept="image/*,video/mp4,video/webm" 
              className="hidden" 
            />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
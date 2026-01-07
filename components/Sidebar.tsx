import React, { useRef } from 'react';
import { AppSection } from '../types.ts';

interface SidebarProps {
  currentSection: AppSection;
  setCurrentSection: (section: AppSection) => void;
  onBgUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveBg: () => void;
  hasCustomBg: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentSection, 
  setCurrentSection, 
  onBgUpload, 
  onRemoveBg,
  hasCustomBg
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navItems = [
    { id: AppSection.HOME, label: 'Главная', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: AppSection.SEARCH, label: 'Поиск', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
    { id: AppSection.LIBRARY, label: 'Медиатека', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  ];

  return (
    <div className="hidden md:flex w-64 bg-black/60 backdrop-blur-md h-full flex-col p-4 space-y-6 shrink-0 border-r border-white/5">
      <div className="flex items-center space-x-3 px-2 py-4">
        <div className="w-8 h-8 bg-[#1DB954] rounded-full shadow-lg shadow-[#1DB954]/20 flex-shrink-0"></div>
        <span className="text-2xl font-black tracking-tighter">SpotyDa</span>
      </div>

      <nav className="flex flex-col space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentSection(item.id)}
            className={`flex items-center space-x-4 px-3 py-3 rounded-lg transition-all ${
              currentSection === item.id ? 'bg-[#282828] text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            <span className="font-bold">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="flex-1 border-t border-white/10 pt-6 space-y-4">
        <div className="bg-[#121212] p-4 rounded-lg">
            <h4 className="font-bold text-sm mb-2 text-white">Живые обои</h4>
            <p className="text-[10px] text-gray-400 leading-relaxed mb-1">Загрузи фото, GIF или видео (MP4) для фона.</p>
            <p className="text-[9px] text-[#1DB954] font-bold uppercase mb-3 opacity-80">Full HD | 1920x1080</p>
            <div className="flex flex-col space-y-2">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 bg-white text-black rounded-full text-xs font-black hover:scale-105 active:scale-95 transition-all"
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

        <div className="bg-[#121212] p-4 rounded-lg">
            <h4 className="font-bold text-sm mb-2 text-white">Твоя музыка</h4>
            <p className="text-[10px] text-gray-400 leading-relaxed">Добавляй треки в любимое, и они всегда будут под рукой.</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
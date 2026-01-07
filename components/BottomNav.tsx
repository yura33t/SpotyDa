import React from 'react';
import { AppSection } from '../types.ts';

interface BottomNavProps {
  currentSection: AppSection;
  setCurrentSection: (section: AppSection) => void;
  accentColor?: string;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentSection, setCurrentSection, accentColor = '#1DB954' }) => {
  const items = [
    { id: AppSection.HOME, label: 'Главная', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: AppSection.SEARCH, label: 'Поиск', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
    { id: AppSection.LIBRARY, label: 'Медиатека', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[calc(64px+env(safe-area-inset-bottom))] bg-black/60 backdrop-blur-xl border-t border-white/5 px-6 pb-[env(safe-area-inset-bottom)] flex items-center justify-between z-[180]">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setCurrentSection(item.id)}
          className="flex flex-col items-center justify-center space-y-1 py-1"
        >
          <svg 
            className={`w-6 h-6 transition-colors ${currentSection === item.id ? '' : 'text-gray-400'}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            style={{ color: currentSection === item.id ? accentColor : undefined }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
          </svg>
          <span 
            className={`text-[10px] font-bold transition-colors ${currentSection === item.id ? '' : 'text-gray-400'}`}
            style={{ color: currentSection === item.id ? accentColor : undefined }}
          >
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
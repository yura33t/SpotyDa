
import React from 'react';
import { AppSection } from '../types';

interface SidebarProps {
  currentSection: AppSection;
  setCurrentSection: (section: AppSection) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentSection, setCurrentSection }) => {
  const navItems = [
    { id: AppSection.HOME, label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: AppSection.SEARCH, label: 'Search', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
    { id: AppSection.LIBRARY, label: 'Your Library', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  ];

  return (
    <div className="hidden md:flex w-64 bg-black h-full flex-col p-4 space-y-6 shrink-0">
      <div className="flex items-center space-x-2 px-2 py-4">
        <div className="w-8 h-8 bg-[#1DB954] rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.494 17.3c-.216.353-.674.464-1.026.248-2.865-1.75-6.471-2.147-10.718-1.18-.403.093-.81-.158-.903-.561-.093-.403.158-.81.561-.903 4.654-1.064 8.636-.615 11.83 1.334.352.216.463.674.248 1.026zm1.467-3.264c-.272.44-.848.578-1.288.306-3.279-2.015-8.279-2.599-12.158-1.42-.495.15-1.02-.132-1.17-.627-.15-.495.132-1.02.627-1.17 4.417-1.34 9.932-.693 13.685 1.61.44.272.578.848.306 1.288zm.126-3.398C15.3 8.356 9.074 8.148 5.503 9.232c-.567.171-1.17-.151-1.342-.718-.171-.567.151-1.17.718-1.342 4.103-1.246 11-1.006 15.352 1.577.51.303.676.963.373 1.474-.303.51-.963.676-1.474.373z"/></svg>
        </div>
        <span className="text-2xl font-bold tracking-tight">SpotyDa</span>
      </div>

      <nav className="flex flex-col space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentSection(item.id)}
            className={`flex items-center space-x-4 px-3 py-3 rounded-md transition-colors ${
              currentSection === item.id ? 'bg-[#282828] text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            <span className="font-semibold">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="flex-1 border-t border-white/10 pt-6">
        <p className="px-3 text-xs text-gray-500">Your library is currently empty. Start following artists or liked songs.</p>
      </div>
    </div>
  );
};

export default Sidebar;

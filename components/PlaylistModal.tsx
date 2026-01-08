
import React from 'react';
import { Track, Playlist } from '../types.ts';

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlists: Playlist[];
  track: Track | null;
  onAddToPlaylist: (pid: string, track: Track) => void;
  onCreatePlaylist: () => void;
  isDarkMode: boolean;
}

const PlaylistModal: React.FC<PlaylistModalProps> = ({ 
  isOpen, 
  onClose, 
  playlists, 
  track, 
  onAddToPlaylist,
  onCreatePlaylist,
  isDarkMode
}) => {
  if (!isOpen || !track) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 animate-fade">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className={`relative w-full max-w-sm rounded-3xl p-8 border shadow-2xl transition-colors duration-500 ${isDarkMode ? 'bg-[#181818] border-white/10 text-white' : 'bg-white border-gray-100 text-gray-900'}`}>
        <button 
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-black'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h3 className="text-xl font-black mb-1 tracking-tight">Добавить в плейлист</h3>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-6">"{track.title}"</p>
        
        <div className="max-h-64 overflow-y-auto space-y-2 mb-6 custom-scrollbar pr-2">
            <button 
                onClick={() => {
                    onCreatePlaylist();
                    onClose();
                }}
                className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all border border-dashed ${isDarkMode ? 'border-white/20 hover:bg-white/5 text-gray-300' : 'border-black/10 hover:bg-black/5 text-gray-600'}`}
            >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/10 border border-white/5">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </div>
                <span className="font-bold text-sm">Создать новый плейлист</span>
            </button>

            {playlists.map(p => (
                <button
                    key={p.id}
                    onClick={() => onAddToPlaylist(p.id, track)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}
                >
                    <div className={`w-10 h-10 rounded-lg shrink-0 flex items-center justify-center text-xs font-black ${isDarkMode ? 'bg-gradient-to-br from-gray-700 to-gray-900' : 'bg-gradient-to-br from-gray-200 to-gray-300'}`}>
                        {p.title.substring(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                        <p className="font-bold text-sm truncate">{p.title}</p>
                        <p className="text-[10px] text-gray-500">{p.tracks.length} треков</p>
                    </div>
                </button>
            ))}
        </div>

        <button 
            onClick={onClose}
            className={`w-full py-4 rounded-full font-black text-sm active:scale-95 transition-transform ${isDarkMode ? 'bg-white text-black' : 'bg-gray-900 text-white'}`}
        >
            Закрыть
        </button>
      </div>
    </div>
  );
};

export default PlaylistModal;

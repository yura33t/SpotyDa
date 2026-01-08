import React, { useRef } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBgUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveBg: () => void;
  hasCustomBg: boolean;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  onBgUpload, 
  onRemoveBg, 
  hasCustomBg,
  isDarkMode,
  onToggleTheme
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 animate-fade">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className={`relative w-full max-w-sm rounded-3xl p-8 border shadow-2xl transition-colors duration-500 ${isDarkMode ? 'bg-[#181818] border-white/10 text-white' : 'bg-white border-gray-100 text-gray-900'}`}>
        <button 
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-black'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h3 className="text-xl font-black mb-6 tracking-tight">Настройки</h3>
        
        <div className="space-y-4">
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                <div>
                   <p className="font-bold text-sm">Внешний вид</p>
                   <p className="text-[10px] text-gray-400">{isDarkMode ? 'Тёмная тема' : 'Светлая тема'}</p>
                </div>
                <button 
                    onClick={onToggleTheme}
                    className={`px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${isDarkMode ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-900'}`}
                >
                    Сменить
                </button>
            </div>

            <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                    Вы можете установить анимированный фон (MP4) или изображение.
                </p>
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full py-4 rounded-full font-black text-sm active:scale-95 transition-transform ${isDarkMode ? 'bg-white text-black' : 'bg-gray-900 text-white'}`}
                >
                    Загрузить медиа
                </button>
            </div>

            {hasCustomBg && (
                <button 
                    onClick={() => { onRemoveBg(); onClose(); }}
                    className="w-full py-4 bg-red-500/10 text-red-500 rounded-full font-black text-sm border border-red-500/20 active:scale-95 transition-transform"
                >
                    Удалить фон
                </button>
            )}
        </div>

        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => { onBgUpload(e); onClose(); }} 
            accept="image/*,video/mp4,video/webm" 
            className="hidden" 
        />
      </div>
    </div>
  );
};

export default SettingsModal;
import React, { useRef } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBgUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveBg: () => void;
  hasCustomBg: boolean;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onBgUpload, onRemoveBg, hasCustomBg }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 animate-fade">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[#181818] rounded-3xl p-8 border border-white/10 shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h3 className="text-xl font-black mb-6 tracking-tight">Настройки фона</h3>
        
        <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                    Вы можете установить анимированный фон (MP4/WebM) или любое изображение. Gemini автоматически оптимизирует его под экран.
                </p>
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 bg-white text-black rounded-full font-black text-sm active:scale-95 transition-transform"
                >
                    Загрузить медиа
                </button>
            </div>

            {hasCustomBg && (
                <button 
                    onClick={() => { onRemoveBg(); onClose(); }}
                    className="w-full py-4 bg-red-500/10 text-red-500 rounded-full font-black text-sm border border-red-500/20 active:scale-95 transition-transform"
                >
                    Удалить кастомный фон
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
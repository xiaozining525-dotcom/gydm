import React, { useRef } from 'react';
import { X, Image as ImageIcon, Video, Monitor } from 'lucide-react';
import { BackgroundSettings } from '../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BackgroundSettings;
  onUpdateSettings: (s: BackgroundSettings) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, settings, onUpdateSettings }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith('video') ? 'video' : 'image';
      onUpdateSettings({ type, src: url });
    }
  };

  const getModeLabel = (type: string) => {
    switch(type) {
        case 'video': return '视频模式';
        case 'image': return '图片模式';
        default: return '纯色模式';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 text-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold">背景设置</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">当前背景</label>
            <div className="h-32 w-full rounded-lg bg-gray-800 overflow-hidden relative border border-gray-700 flex items-center justify-center">
                {settings.type === 'video' ? (
                    <video src={settings.src} className="w-full h-full object-cover" muted loop autoPlay />
                ) : settings.type === 'image' ? (
                    <img src={settings.src} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                    <div className="w-full h-full" style={{backgroundColor: settings.src}}></div>
                )}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <span className="bg-black/50 px-2 py-1 rounded text-xs backdrop-blur-sm">{getModeLabel(settings.type)}</span>
                </div>
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-2 gap-3">
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors border border-gray-700 hover:border-blue-500/50 group"
             >
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-full group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <ImageIcon size={24} />
                </div>
                <span className="text-sm font-medium">上传媒体</span>
                <span className="text-xs text-gray-500">图片或视频</span>
             </button>

             <button 
                onClick={() => onUpdateSettings({ type: 'color', src: '#111827' })}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors border border-gray-700 hover:border-purple-500/50 group"
             >
                <div className="p-2 bg-purple-500/10 text-purple-400 rounded-full group-hover:bg-purple-500 group-hover:text-white transition-colors">
                    <Monitor size={24} />
                </div>
                <span className="text-sm font-medium">恢复默认</span>
                <span className="text-xs text-gray-500">深色背景</span>
             </button>
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*,video/*" 
            onChange={handleFileChange}
          />

          <div className="text-xs text-gray-500 text-center">
            注意：上传的文件仅临时保存在浏览器内存中。
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
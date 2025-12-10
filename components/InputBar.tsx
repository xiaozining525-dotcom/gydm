import React, { useState, useEffect, useRef } from 'react';
import { Send, Palette, Type } from 'lucide-react';
import { COOLDOWN_MS, FONT_OPTIONS } from '../constants';

interface InputBarProps {
  onSend: (text: string, color: string, font: string) => void;
}

const InputBar: React.FC<InputBarProps> = ({ onSend }) => {
  const [text, setText] = useState('');
  const [color, setColor] = useState('#ffffff');
  const [font, setFont] = useState(FONT_OPTIONS[0].value);
  
  const [lastSent, setLastSent] = useState(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);
  
  // Anti-spam history
  const [sentHistory, setSentHistory] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: number;
    if (lastSent > 0) {
      interval = window.setInterval(() => {
        const remaining = Math.max(0, COOLDOWN_MS - (Date.now() - lastSent));
        setCooldownRemaining(remaining);
        if (remaining === 0) {
          clearInterval(interval);
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [lastSent]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmedText = text.trim();
    if (!trimmedText || cooldownRemaining > 0) return;

    // Check duplicates (Max 3 times same message)
    const duplicateCount = sentHistory.filter(t => t === trimmedText).length;
    if (duplicateCount >= 3) {
      alert("请勿重复发送相同内容！休息一下吧~");
      return;
    }

    onSend(trimmedText, color, font);
    
    setLastSent(Date.now());
    setText('');
    setCooldownRemaining(COOLDOWN_MS);
    setSentHistory(prev => [...prev.slice(-9), trimmedText]); // Keep last 10
    setShowColorPicker(false);
    setShowFontPicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const remainingSeconds = Math.ceil(cooldownRemaining / 1000);

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 flex justify-center pb-8 pt-4 px-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
      <div className="w-full max-w-3xl backdrop-blur-md bg-white/10 border border-white/20 rounded-full px-2 py-2 flex items-center shadow-2xl transition-all focus-within:bg-white/15 focus-within:border-white/40">
        
        {/* Font Picker Toggle */}
        <div className="relative">
           <button
             type="button"
             onClick={() => { setShowFontPicker(!showFontPicker); setShowColorPicker(false); }}
             className="p-3 text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10"
             title="选择字体"
           >
             <Type size={20} />
           </button>
           {showFontPicker && (
             <div className="absolute bottom-16 left-0 bg-gray-900/95 border border-gray-700 p-2 rounded-xl shadow-xl w-40 animate-in fade-in slide-in-from-bottom-2 backdrop-blur-sm">
                <div className="space-y-1">
                  {FONT_OPTIONS.map(f => (
                    <button
                      key={f.value}
                      onClick={() => { setFont(f.value); setShowFontPicker(false); inputRef.current?.focus(); }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${font === f.value ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-white/10'}`}
                      style={{ fontFamily: f.value }}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
             </div>
           )}
        </div>

        {/* Color Picker Toggle */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { setShowColorPicker(!showColorPicker); setShowFontPicker(false); }}
            className="p-3 text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10"
            style={{ color: showColorPicker ? color : undefined }}
            title="选择颜色"
          >
            <Palette size={20} />
          </button>
          
          {showColorPicker && (
            <div className="absolute bottom-16 left-0 bg-gray-900/95 border border-gray-700 p-3 rounded-xl shadow-xl grid grid-cols-5 gap-2 w-52 animate-in fade-in slide-in-from-bottom-2 backdrop-blur-sm">
               {['#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#06b6d4', '#84cc16'].map(c => (
                 <button
                    key={c}
                    onClick={() => { setColor(c); setShowColorPicker(false); inputRef.current?.focus(); }}
                    className="w-8 h-8 rounded-full border border-white/20 hover:scale-110 transition-transform shadow-sm"
                    style={{ backgroundColor: c }}
                 />
               ))}
               <label className="w-8 h-8 rounded-full border border-white/20 hover:scale-110 transition-transform overflow-hidden cursor-pointer relative shadow-sm">
                  <input 
                    type="color" 
                    value={color} 
                    onChange={(e) => setColor(e.target.value)} 
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" 
                  />
                  <div className="w-full h-full bg-gradient-to-br from-white to-black"></div>
               </label>
            </div>
          )}
        </div>

        {/* Text Input */}
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={cooldownRemaining > 0 ? `冷却中 ${remainingSeconds}s` : "发条弹幕见证此刻..."}
          className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/40 px-4 font-medium text-base min-w-0"
          disabled={cooldownRemaining > 0}
          maxLength={60}
          style={{ fontFamily: font }}
        />

        {/* Send Button */}
        <button
          onClick={() => handleSubmit()}
          disabled={!text.trim() || cooldownRemaining > 0}
          className={`p-3 rounded-full transition-all ml-1 flex-shrink-0 ${
            !text.trim() || cooldownRemaining > 0
              ? 'text-white/30 cursor-not-allowed bg-white/5'
              : 'text-white bg-blue-600 hover:bg-blue-500 shadow-lg hover:shadow-blue-500/50 hover:scale-105 active:scale-95'
          }`}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default InputBar;
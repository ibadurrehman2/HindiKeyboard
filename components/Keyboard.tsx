
import React from 'react';
import { HINDI_KEYBOARD_LAYOUT } from '../constants';
import { KeyboardKey } from '../types';

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  darkMode: boolean;
}

const Keyboard: React.FC<KeyboardProps> = ({ onKeyPress, darkMode }) => {
  const getKeyStyles = (key: KeyboardKey) => {
    const base = "flex items-center justify-center rounded-lg shadow-sm font-medium transition-all active:scale-95 text-base h-10 sm:h-12 devanagari ";
    if (key.type === 'action') {
      return base + (darkMode 
        ? "bg-slate-700 hover:bg-slate-600 text-white flex-grow min-w-[50px]" 
        : "bg-slate-200 hover:bg-slate-300 text-slate-700 flex-grow min-w-[50px]");
    }
    return base + (darkMode 
      ? "bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white min-w-[36px] sm:min-w-[42px]" 
      : "bg-white hover:bg-slate-50 border border-slate-100 text-slate-800 min-w-[36px] sm:min-w-[42px]");
  };

  return (
    <div className="max-w-3xl mx-auto overflow-x-auto">
      <div className="flex flex-col gap-1.5">
        {HINDI_KEYBOARD_LAYOUT.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1">
            {row.map((key, keyIndex) => (
              <button
                key={`${rowIndex}-${keyIndex}`}
                onClick={() => onKeyPress(key.value)}
                className={getKeyStyles(key)}
                title={key.label}
              >
                {key.label === 'BACKSPACE' ? <i className="fa-solid fa-backspace text-sm"></i> : key.label}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Keyboard;

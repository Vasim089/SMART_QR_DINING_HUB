import React from 'react';
import { UserCheck } from 'lucide-react';

export function Navbar({
  restaurant,
  tableNumber,
  currentLanguage,
  onOpenLanguageModal,
  mode,
  setMode
}) {
  const flagMap = {
    en: '🇬🇧',
    hi: '🇮🇳',
    es: '🇪🇸',
    fr: '🇫🇷',
  };
  const flag = flagMap[currentLanguage?.language_code] || '🌐';

  return (
    <header className="sticky top-0 z-40 bg-transparent px-4 pt-3 pb-1 shrink-0">
      <div className="flex items-center justify-between relative">
        
        {/* Left balance spacer (matches right button width for perfect centering) */}
        <div className="w-14 flex items-center justify-start">
          {/* Subtle logo or empty spacer */}
        </div>

        {/* Center: The Royal Spice Bistro & TABLE #5 directly on text (No card, no bg) */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <h1 className="text-sm font-black text-white tracking-tight">
            {restaurant?.name || 'The Royal Spice Bistro'}
          </h1>
          {tableNumber ? (
            <div className="text-xs font-black text-amber-400 tracking-widest uppercase mt-0.5">
              TABLE #{tableNumber}
            </div>
          ) : null}
        </div>

        {/* Right: Language Selector Pill */}
        <div className="w-14 flex items-center justify-end">
          <button
            onClick={onOpenLanguageModal}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs font-bold rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-800 transition shadow-xs active:scale-95"
            title="Change Language"
          >
            <span className="text-xs">{flag}</span>
            <span className="uppercase text-[10px] font-black text-amber-300">
              {currentLanguage?.language_code || 'EN'}
            </span>
          </button>

          {/* Only shown in Admin/Owner preview mode */}
          {mode === 'owner' && (
            <button
              onClick={() => setMode('customer')}
              className="ml-2 flex items-center space-x-1 px-2 py-1 text-xs font-bold rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition"
            >
              <UserCheck className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </header>
  );
}

export default Navbar;

import React from 'react';
import { UtensilsCrossed, Globe, UserCheck } from 'lucide-react';

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
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-2.5">
      <div className="flex items-center justify-between">
        
        {/* Brand & Table Badge */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-600/30">
            <UtensilsCrossed className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs font-black text-white leading-tight tracking-wide">
              {restaurant?.name || 'Smart Dining Hub'}
            </h1>
            <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 mt-0.5">
              {tableNumber ? (
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-md font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  Table #{tableNumber}
                </span>
              ) : null}
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                AI Active
              </span>
            </div>
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center space-x-1.5">
          {/* Language Selector Pill */}
          <button
            onClick={onOpenLanguageModal}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs font-bold rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition shadow-xs"
            title="Change Language"
          >
            <span>{flag}</span>
            <span className="uppercase text-[11px]">{currentLanguage?.language_code || 'EN'}</span>
          </button>

          {/* Only shown when in Owner mode to return to dining */}
          {mode === 'owner' && (
            <button
              onClick={() => setMode('customer')}
              className="flex items-center space-x-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Dining</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

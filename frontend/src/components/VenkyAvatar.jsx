import React, { useState, useEffect } from 'react';
import { Mic, Volume2, Sparkles, NotebookPen, PenLine } from 'lucide-react';

export function VenkyAvatar({ size = 'lg', isListening = false, isSpeaking = false, onClick }) {
  const [imgError, setImgError] = useState(false);

  const isSmall = size === 'sm';
  const sizeClasses = isSmall ? 'w-10 h-10' : 'w-44 h-44 sm:w-48 sm:h-48';

  // Preload realistic portraits for instantaneous flicker-free transitions
  useEffect(() => {
    const img1 = new Image();
    img1.src = '/venky_realistic.png';
    const img2 = new Image();
    img2.src = '/venky_realistic_writing.png';
  }, []);

  return (
    <div
      onClick={onClick}
      className={`relative select-none ${sizeClasses} rounded-full cursor-pointer transition-all duration-300 transform ${
        isSmall
          ? 'shrink-0'
          : isListening
          ? 'scale-105'
          : isSpeaking
          ? 'scale-105'
          : 'hover:scale-105 active:scale-95'
      }`}
    >
      {/* Inline styles for subtle natural breathing */}
      <style>{`
        @keyframes venkyBreathing {
          0%, 100% { transform: scale(1) translateY(0px); }
          50% { transform: scale(1.012) translateY(-1.5px); }
        }
        .animate-realistic-breathe {
          animation: venkyBreathing 4s ease-in-out infinite;
        }
      `}</style>

      {/* Atmospheric Halo Aura for Hero Avatar */}
      {!isSmall && (
        <>
          <div
            className={`absolute inset-0 -m-6 rounded-full blur-2xl transition-all duration-700 pointer-events-none ${
              isListening
                ? 'bg-amber-500/40 scale-125'
                : isSpeaking
                ? 'bg-orange-500/50 scale-130'
                : 'bg-linear-to-b from-orange-600/25 to-amber-500/20 scale-100'
            }`}
          />
          {/* Animated soundwave attention rings */}
          {(isListening || isSpeaking) && (
            <>
              <div
                className={`absolute inset-0 -m-5 rounded-full border-2 animate-ping pointer-events-none ${
                  isListening ? 'border-amber-400/60' : 'border-orange-400/50'
                }`}
              />
              <div
                className={`absolute inset-0 -m-10 rounded-full border animate-pulse pointer-events-none ${
                  isListening ? 'border-amber-500/30' : 'border-orange-500/25'
                }`}
              />
            </>
          )}
        </>
      )}

      {/* Main Avatar Circular Frame */}
      <div
        className={`w-full h-full rounded-full overflow-hidden relative shadow-2xl transition-all bg-slate-950 ${
          isSmall
            ? 'border border-amber-500/40 ring-1 ring-slate-950'
            : isListening
            ? 'ring-6 ring-amber-400/70 shadow-amber-500/60 border-2 border-amber-300'
            : isSpeaking
            ? 'ring-6 ring-orange-500/60 shadow-orange-500/50 border-2 border-amber-300'
            : 'ring-4 ring-orange-500/30 shadow-orange-600/40 border-2 border-amber-500/40'
        }`}
      >
        {/* TRUE-TO-LIFE PHOTOREALISTIC WAITER VENKY */}
        <div className="w-full h-full relative animate-realistic-breathe">
          {/* 1. Photorealistic Base Portrait: Speaking / Idle Mode */}
          <img
            src="/venky_realistic.png"
            alt="Waiter Venky"
            onError={() => setImgError(true)}
            className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-300 ${
              isListening ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
            }`}
          />

          {/* 2. Photorealistic Base Portrait: Order-Writing Mode */}
          <img
            src="/venky_realistic_writing.png"
            alt="Waiter Venky Writing Order"
            onError={() => setImgError(true)}
            className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-300 ${
              isListening ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
          />
        </div>

        {/* Ambient Subtle Warm Highlight */}
        {isSpeaking && (
          <div className="absolute inset-0 bg-amber-500/10 pointer-events-none animate-pulse" />
        )}
        {isListening && (
          <div className="absolute inset-0 bg-amber-500/10 pointer-events-none" />
        )}
      </div>

      {/* Floating Order Writing Badge at Bottom Center of Avatar */}
      {!isSmall && isListening && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-950/95 border border-amber-400/80 shadow-2xl px-3 py-1 rounded-full flex items-center space-x-1.5 whitespace-nowrap z-20 animate-pulse">
          <PenLine className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
          <span className="text-[11px] font-black tracking-wide text-amber-300">Taking Down Order...</span>
        </div>
      )}

      {/* Floating Status Badge Pill on bottom right of Avatar */}
      {!isSmall && (
        <div
          className={`absolute bottom-0 right-0 p-2.5 rounded-full shadow-lg border-2 border-slate-950 transition-all ${
            isListening
              ? 'bg-amber-400 text-slate-950 animate-bounce scale-110 ring-2 ring-amber-300'
              : isSpeaking
              ? 'bg-amber-500 text-slate-950 animate-pulse scale-110 ring-2 ring-amber-300'
              : 'bg-linear-to-tr from-orange-600 to-amber-500 text-white'
          }`}
        >
          {isListening ? (
            <NotebookPen className="w-4 h-4 animate-pulse stroke-[2.5]" />
          ) : isSpeaking ? (
            <Volume2 className="w-4 h-4 stroke-[3]" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
        </div>
      )}
    </div>
  );
}

export default VenkyAvatar;

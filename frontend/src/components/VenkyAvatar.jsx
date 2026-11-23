import React, { useState } from 'react';
import { Mic, Volume2, Sparkles } from 'lucide-react';

export function VenkyAvatar({ size = 'lg', isListening = false, isSpeaking = false, onClick }) {
  const [imgError, setImgError] = useState(false);

  const isSmall = size === 'sm';
  const sizeClasses = isSmall ? 'w-9 h-9' : 'w-36 h-36';

  return (
    <div
      onClick={onClick}
      className={`relative select-none ${sizeClasses} rounded-full cursor-pointer transition-all duration-300 transform ${
        isSmall
          ? 'shrink-0'
          : isListening
          ? 'scale-110'
          : isSpeaking
          ? 'scale-105'
          : 'hover:scale-105 active:scale-95'
      }`}
    >
      {/* Outer Atmospheric Aura for Large Avatar */}
      {!isSmall && (
        <>
          <div
            className={`absolute inset-0 -m-6 rounded-full blur-2xl transition-all duration-700 pointer-events-none ${
              isListening
                ? 'bg-rose-600/40 scale-125'
                : isSpeaking
                ? 'bg-amber-500/45 scale-125'
                : 'bg-linear-to-b from-orange-600/25 to-amber-500/20 scale-100'
            }`}
          />
          {/* Animated soundwave rings when Venky is active */}
          {(isListening || isSpeaking) && (
            <>
              <div
                className={`absolute inset-0 -m-5 rounded-full border-2 animate-ping pointer-events-none ${
                  isListening ? 'border-rose-500/50' : 'border-amber-400/50'
                }`}
              />
              <div
                className={`absolute inset-0 -m-10 rounded-full border animate-pulse pointer-events-none ${
                  isListening ? 'border-rose-500/25' : 'border-orange-500/25'
                }`}
              />
            </>
          )}
        </>
      )}

      {/* Main Avatar Container */}
      <div
        className={`w-full h-full rounded-full overflow-hidden relative shadow-2xl transition-all ${
          isSmall
            ? 'border border-amber-500/40 ring-1 ring-slate-950'
            : isListening
            ? 'ring-6 ring-rose-500/50 shadow-rose-600/50 border-2 border-rose-400'
            : isSpeaking
            ? 'ring-6 ring-amber-500/50 shadow-amber-500/50 border-2 border-amber-300'
            : 'ring-4 ring-orange-500/30 shadow-orange-600/40 border-2 border-amber-500/40'
        }`}
      >
        {/* Render Generated PNG Avatar if available, otherwise Vector Waiter Illustration */}
        {!imgError ? (
          <img
            src="/venky_avatar.png"
            alt="Waiter Venky"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          /* High-detail SVG illustration of Waiter Venky */
          <svg viewBox="0 0 160 160" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e1b4b" />
                <stop offset="50%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#451a03" />
              </linearGradient>
              <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e0a370" />
                <stop offset="100%" stopColor="#c5834f" />
              </linearGradient>
              <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
              <linearGradient id="vestGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#090d16" />
              </linearGradient>
              <linearGradient id="tieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#991b1b" />
              </linearGradient>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#ca8a04" />
              </linearGradient>
            </defs>

            {/* Background disc with subtle warm glow */}
            <circle cx="80" cy="80" r="80" fill="url(#bgGrad)" />
            <circle cx="80" cy="50" r="45" fill="#f59e0b" opacity="0.12" filter="blur(10px)" />

            {/* Waiter Body & Suit */}
            <g id="body">
              {/* White collared shirt */}
              <path d="M 40 160 L 52 110 L 80 128 L 108 110 L 120 160 Z" fill="#ffffff" />
              
              {/* Black formal waiter waistcoat / vest */}
              <path d="M 32 160 L 46 112 L 68 116 L 80 148 L 92 116 L 114 112 L 128 160 Z" fill="url(#vestGrad)" stroke="#334155" strokeWidth="1" />
              
              {/* Gold vest buttons */}
              <circle cx="80" cy="148" r="2.5" fill="url(#goldGrad)" />
              <circle cx="80" cy="156" r="2.5" fill="url(#goldGrad)" />
              
              {/* Waiter Name Pin "VENKY" on lapel */}
              <rect x="42" y="128" width="16" height="5" rx="1.5" fill="url(#goldGrad)" />
              <text x="50" y="132" fontSize="3.5" fontWeight="900" fill="#000" textAnchor="middle" fontFamily="sans-serif">VENKY</text>
              
              {/* Burgundy Bow Tie */}
              <path d="M 69 111 L 80 115 L 69 119 Z" fill="url(#tieGrad)" />
              <path d="M 91 111 L 80 115 L 91 119 Z" fill="url(#tieGrad)" />
              <circle cx="80" cy="115" r="3" fill="#ef4444" stroke="#7f1d1d" strokeWidth="0.5" />
            </g>

            {/* Neck & Ears */}
            <rect x="71" y="90" width="18" height="24" rx="4" fill="url(#skinGrad)" />
            <ellipse cx="51" cy="74" rx="4.5" ry="7" fill="url(#skinGrad)" />
            <ellipse cx="109" cy="74" rx="4.5" ry="7" fill="url(#skinGrad)" />

            {/* Head & Face */}
            <ellipse cx="80" cy="72" rx="28" ry="32" fill="url(#skinGrad)" />

            {/* Stylish Groomed Hair */}
            <path
              d="M 52 64 C 50 42, 65 30, 80 28 C 96 26, 112 36, 108 58 C 104 46, 95 38, 80 38 C 68 38, 56 48, 52 64 Z"
              fill="url(#hairGrad)"
            />
            <path
              d="M 52 64 Q 50 78, 54 82 Q 56 70, 54 62 Z"
              fill="url(#hairGrad)"
            />
            <path
              d="M 108 58 Q 110 74, 106 82 Q 104 70, 106 58 Z"
              fill="url(#hairGrad)"
            />

            {/* Eyebrows */}
            <path d="M 60 62 Q 68 59, 73 63" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 87 63 Q 92 59, 100 62" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />

            {/* Eyes with friendly sparkle */}
            <ellipse cx="67" cy="69" rx="3.5" ry="4" fill="#0f172a" />
            <ellipse cx="93" cy="69" rx="3.5" ry="4" fill="#0f172a" />
            <circle cx="68" cy="67.5" r="1.2" fill="#ffffff" />
            <circle cx="94" cy="67.5" r="1.2" fill="#ffffff" />

            {/* Nose */}
            <path d="M 80 67 L 78 78 L 83 78" stroke="#a16207" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />

            {/* Friendly Warm Waiter Smile */}
            {isSpeaking ? (
              /* Animated open talking mouth when speaking */
              <ellipse cx="80" cy="88" rx="6" ry="4" fill="#881337" stroke="#dc2626" strokeWidth="1" />
            ) : (
              /* Warm friendly smile */
              <path d="M 70 85 Q 80 94, 90 85" stroke="#991b1b" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            )}
          </svg>
        )}

        {/* Live Speaking / Listening Overlays */}
        {isSpeaking && (
          <div className="absolute inset-0 bg-amber-500/10 pointer-events-none animate-pulse" />
        )}
        {isListening && (
          <div className="absolute inset-0 bg-rose-500/15 pointer-events-none animate-pulse" />
        )}
      </div>

      {/* Floating Status Badge Pill on bottom right of Avatar */}
      {!isSmall && (
        <div
          className={`absolute bottom-0 right-0 p-2.5 rounded-full shadow-lg border-2 border-slate-950 transition-all ${
            isListening
              ? 'bg-rose-600 text-white animate-bounce scale-110'
              : isSpeaking
              ? 'bg-amber-500 text-slate-950 animate-pulse scale-110'
              : 'bg-linear-to-tr from-orange-600 to-amber-500 text-white'
          }`}
        >
          {isListening ? (
            <Mic className="w-4 h-4 animate-pulse stroke-[3]" />
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

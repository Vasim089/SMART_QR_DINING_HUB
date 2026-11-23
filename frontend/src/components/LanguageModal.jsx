import React from 'react';
import { Globe2, Sparkles, Check, X } from 'lucide-react';

export function LanguageModal({ isOpen, onClose, languages, selectedCode, onSelectLanguage }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 transform transition-all">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Choose Your Language</h3>
              <p className="text-xs text-slate-500">भाषा चुनें / Seleccionar idioma</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-600 mb-4">
          Our AI Voice Waiter and Digital Menu will automatically talk and assist you in your chosen language:
        </p>

        {/* Language Options List */}
        <div className="grid grid-cols-1 gap-2.5 mb-6">
          {languages.map((lang) => {
            const isSelected = selectedCode === lang.language_code;
            return (
              <button
                key={lang.language_code}
                onClick={() => {
                  onSelectLanguage(lang.language_code);
                  onClose();
                }}
                className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50/70 text-orange-950 font-semibold shadow-xs ring-2 ring-orange-500/20'
                    : 'border-slate-200 hover:border-orange-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">
                    {lang.language_code === 'en' && '🇬🇧'}
                    {lang.language_code === 'hi' && '🇮🇳'}
                    {lang.language_code === 'es' && '🇪🇸'}
                    {lang.language_code === 'fr' && '🇫🇷'}
                  </span>
                  <div>
                    <div className="text-sm">{lang.language_name}</div>
                    <div className="text-xs text-slate-400 capitalize">{lang.language_code}</div>
                  </div>
                </div>
                {isSelected && <Check className="w-5 h-5 text-orange-600" />}
              </button>
            );
          })}
        </div>

        {/* CTA Confirmation */}
        <button
          onClick={onClose}
          className="w-full py-3 px-4 rounded-xl font-bold bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg shadow-orange-600/20 flex items-center justify-center space-x-2 transition"
        >
          <Sparkles className="w-4 h-4" />
          <span>Continue to Dining Hub</span>
        </button>
      </div>
    </div>
  );
}

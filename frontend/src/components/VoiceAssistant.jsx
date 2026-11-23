import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Flame,
  Leaf,
  PlusCircle,
  CheckCircle2,
  Bot
} from 'lucide-react';
import { useSpeech } from '../hooks/useSpeech';
import { sendChatMessage, trackEvent, getOllamaStatus } from '../services/api';
import { VenkyAvatar } from './VenkyAvatar';

export function VoiceAssistant({
  restaurantId,
  tableId,
  languageCode,
  sessionToken,
  setSessionToken,
  onAddToCart,
  cartItems
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendedDishes, setRecommendedDishes] = useState([]);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [ollamaInfo, setOllamaInfo] = useState({ online: false, target_model: 'qwen2.5:3b', model_available: false });
  const [hasSpokenWelcome, setHasSpokenWelcome] = useState(false);

  const welcomeEn = "Hello! I am Venky, your personal waiter for today. It is my absolute pleasure to serve your table. What can I get started for you today? Any drinks, appetizers, or can I recommend our chef's special?";
  const welcomeHi = "नमस्ते! मैं आपकी टेबल का वेटर वेंकी हूँ। आज आपकी सेवा करने में मुझे बहुत खुशी होगी। आप क्या लेना पसंद करेंगे? क्या मैं आपके लिए कुछ खास सुझाव दूँ?";
  const initialGreeting = languageCode === 'hi' ? welcomeHi : welcomeEn;

  // Speech Recognition & Synthesis Hook
  const {
    isListening,
    isSpeaking,
    interimText,
    startListening,
    stopListening,
    speak,
    stopSpeaking
  } = useSpeech({
    languageCode,
    onTranscriptReady: (transcript) => {
      handleVoiceQuery(transcript);
    }
  });

  // Check Ollama Local AI Status
  useEffect(() => {
    async function checkOllama() {
      const status = await getOllamaStatus();
      setOllamaInfo(status);
    }
    checkOllama();
    const interval = setInterval(checkOllama, 8000);
    return () => clearInterval(interval);
  }, []);

  // Speak Venky's welcome greeting on arrival
  useEffect(() => {
    const timer = setTimeout(() => {
      if (ttsEnabled && !hasSpokenWelcome) {
        speak(initialGreeting, languageCode);
        setHasSpokenWelcome(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [languageCode, ttsEnabled]);

  // Process diner's voice conversation
  const handleVoiceQuery = async (queryText) => {
    if (!queryText || !queryText.trim() || isLoading) return;

    setIsLoading(true);

    trackEvent({
      restaurantId,
      tableId,
      eventType: 'voice_interaction',
      eventData: { query: queryText, waiter: 'Venky' }
    });

    try {
      const data = await sendChatMessage({
        restaurantId,
        tableId,
        sessionToken,
        message: queryText,
        languageCode
      });

      if (data.session_token) {
        setSessionToken(data.session_token);
      }

      if (data.recommended_dishes && data.recommended_dishes.length > 0) {
        setRecommendedDishes(data.recommended_dishes);
      }

      // Venky speaks response aloud
      if (ttsEnabled && data.speech_text) {
        speak(data.speech_text, languageCode);
      }
    } catch (err) {
      console.error('Waiter Venky Voice Error:', err);
      if (ttsEnabled) {
        speak("Pardon me, I couldn't hear that clearly. Please tap and tell me your preference again.", languageCode);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Center Orb click handler
  const handleOrbClick = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    if (!hasSpokenWelcome) {
      setHasSpokenWelcome(true);
      speak(initialGreeting, languageCode);
      return;
    }

    startListening();
  };

  return (
    <div className="flex-1 flex flex-col justify-between py-2 text-white relative h-full">
      
      {/* Top Waiter Badge with Small Avatar */}
      <div className="flex items-center justify-between px-2 pt-1 pb-2">
        <div className="flex items-center space-x-2.5">
          <VenkyAvatar size="sm" isListening={isListening} isSpeaking={isSpeaking} />
          <div className="flex flex-col">
            <span className="text-xs font-black tracking-wide text-amber-300 flex items-center gap-1.5">
              <span>Venky</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Your Table Waiter</span>
          </div>
        </div>

        {/* Audio Mute/Unmute Toggle */}
        <button
          onClick={() => {
            if (isSpeaking) stopSpeaking();
            setTtsEnabled(!ttsEnabled);
          }}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
            ttsEnabled
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs'
              : 'bg-slate-900 text-slate-500 border-slate-800'
          }`}
          title={ttsEnabled ? "Venky Voice On" : "Voice Muted"}
        >
          {ttsEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span>{ttsEnabled ? 'Voice On' : 'Muted'}</span>
        </button>
      </div>

      {/* HERO VOICE STAGE: Realistic Waiter Venky Avatar & Interaction */}
      <div className="my-auto py-6 flex flex-col items-center justify-center text-center select-none relative">
        
        {/* Venky Interactive Avatar (Tap to talk) */}
        <div className="relative mb-3.5">
          <VenkyAvatar
            size="lg"
            isListening={isListening}
            isSpeaking={isSpeaking}
            onClick={handleOrbClick}
          />
        </div>

        {/* Action Title */}
        <div className="mb-2">
          <h3 className="text-sm font-black text-white flex items-center justify-center gap-1.5">
            <span>
              {isSpeaking ? 'Venky is speaking...' : isListening ? 'Venky is listening...' : 'Talk with Venky'}
            </span>
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">
            {isSpeaking
              ? 'Listen to recommendations'
              : isListening
              ? 'Speak your order naturally'
              : 'Tap Venky to speak or order food'}
          </p>
        </div>

        {/* Live Equalizer Soundwaves */}
        <div className="flex items-end justify-center space-x-1.5 h-7 mb-2.5">
          <span className={`w-1.5 bg-amber-400 rounded-full transition-all duration-200 ${isListening || isSpeaking ? 'h-7 animate-pulse' : 'h-2'}`}></span>
          <span className={`w-1.5 bg-orange-500 rounded-full transition-all duration-200 ${isListening || isSpeaking ? 'h-5 animate-pulse [animation-delay:0.1s]' : 'h-3'}`}></span>
          <span className={`w-1.5 bg-amber-300 rounded-full transition-all duration-200 ${isListening || isSpeaking ? 'h-8 animate-pulse [animation-delay:0.2s]' : 'h-2'}`}></span>
          <span className={`w-1.5 bg-orange-600 rounded-full transition-all duration-200 ${isListening || isSpeaking ? 'h-6 animate-pulse [animation-delay:0.3s]' : 'h-4'}`}></span>
          <span className={`w-1.5 bg-amber-500 rounded-full transition-all duration-200 ${isListening || isSpeaking ? 'h-5 animate-pulse [animation-delay:0.4s]' : 'h-2'}`}></span>
        </div>

        {/* Real-time Dynamic Waiter Status Caption */}
        <div className="px-4 min-h-[36px] flex items-center justify-center">
          {isListening ? (
            <div className="px-3.5 py-1.5 rounded-full bg-rose-950/80 border border-rose-800/80 text-amber-300 text-xs font-semibold animate-pulse">
              🎙️ {interimText ? `"${interimText}..."` : "Venky is listening attentively..."}
            </div>
          ) : isSpeaking ? (
            <div className="px-3.5 py-1.5 rounded-full bg-amber-950/80 border border-amber-800/80 text-amber-300 text-xs font-semibold flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-amber-400" />
              <span>Venky is speaking to your table...</span>
            </div>
          ) : isLoading ? (
            <div className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-orange-400 text-xs font-semibold flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Venky is checking with the chef...</span>
            </div>
          ) : (
            <p className="text-xs text-slate-400 font-medium max-w-xs">
              "Venky, recommend something spicy" or "What's good for dinner?"
            </p>
          )}
        </div>
      </div>

      {/* DYNAMIC DISH RECOMMENDATIONS: Appear seamlessly when Venky suggests items */}
      {recommendedDishes.length > 0 && (
        <div className="mb-2 bg-slate-900/90 border border-amber-500/20 rounded-2xl p-3 shadow-xl max-h-[250px] overflow-y-auto no-scrollbar backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-black text-amber-400 mb-2 px-1">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              Venky's Table Recommendations:
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">Available Now</span>
          </div>

          <div className="space-y-2">
            {recommendedDishes.map((dish) => {
              const inCart = cartItems?.find((item) => item.id === dish.id);
              return (
                <div
                  key={dish.id}
                  className="p-2.5 bg-slate-950/90 rounded-xl border border-slate-800/90 flex items-center justify-between gap-3 hover:border-amber-500/40 transition"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    {dish.image_url && (
                      <img
                        src={dish.image_url}
                        alt={dish.name}
                        className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-700/80"
                      />
                    )}
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-xs truncate">{dish.name}</h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                        <span className="font-black text-amber-400">${dish.effective_price.toFixed(2)}</span>
                        {dish.is_vegetarian && (
                          <span className="text-emerald-400 flex items-center gap-0.5"><Leaf className="w-2.5 h-2.5" /> Veg</span>
                        )}
                        {dish.is_spicy && (
                          <span className="text-rose-400 flex items-center gap-0.5"><Flame className="w-2.5 h-2.5" /> Spicy</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onAddToCart && onAddToCart(dish)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold shrink-0 transition flex items-center space-x-1 ${
                      inCart
                        ? 'bg-emerald-600 text-white'
                        : 'bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-sm'
                    }`}
                  >
                    {inCart ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>({inCart.quantity})</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-3 h-3" />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}

export default VoiceAssistant;

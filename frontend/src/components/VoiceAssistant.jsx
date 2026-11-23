import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Flame,
  Leaf,
  PlusCircle,
  CheckCircle2,
  RotateCcw,
  Bot
} from 'lucide-react';
import { useSpeech } from '../hooks/useSpeech';
import { sendChatMessage, trackEvent, getOllamaStatus } from '../services/api';

export function VoiceAssistant({
  restaurantId,
  tableId,
  languageCode,
  sessionToken,
  setSessionToken,
  onAddToCart,
  cartItems
}) {
  const [currentQuery, setCurrentQuery] = useState('');
  const [agentResponse, setAgentResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendedDishes, setRecommendedDishes] = useState([]);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [ollamaInfo, setOllamaInfo] = useState({ online: false, target_model: 'qwen2.5:3b', model_available: false });
  const [conversationTurn, setConversationTurn] = useState(0);

  // Setup initial welcome greeting
  useEffect(() => {
    const welcomeEn = "Hi! Welcome to our restaurant. I'm your dining assistant. What would you like to eat today? You can tell me your preferences, and I'll help you find the perfect dish.";
    const welcomeHi = "नमस्ते! हमारे रेस्तरां में आपका स्वागत है। मैं आपका AI डाइनिंग असिस्टेंट हूँ। आप अपनी पसंद बताइए, और मैं आपके लिए सबसे उपयुक्त व्यंजन सुझाऊँगा!";

    const initialGreeting = languageCode === 'hi' ? welcomeHi : welcomeEn;
    setAgentResponse(initialGreeting);
  }, [languageCode]);

  // Hook for STT & TTS
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

  // Check Ollama status
  useEffect(() => {
    async function checkOllama() {
      const status = await getOllamaStatus();
      setOllamaInfo(status);
    }
    checkOllama();
    const interval = setInterval(checkOllama, 8000);
    return () => clearInterval(interval);
  }, []);

  // Process voice input
  const handleVoiceQuery = async (queryText) => {
    if (!queryText || !queryText.trim() || isLoading) return;

    setCurrentQuery(queryText);
    setIsLoading(true);

    trackEvent({
      restaurantId,
      tableId,
      eventType: 'voice_interaction',
      eventData: { query: queryText }
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

      setAgentResponse(data.response_text);
      setConversationTurn((t) => t + 1);

      if (data.recommended_dishes && data.recommended_dishes.length > 0) {
        setRecommendedDishes(data.recommended_dishes);
      }

      // Automatically speak the response aloud
      if (ttsEnabled && data.speech_text) {
        speak(data.speech_text, languageCode);
      }
    } catch (err) {
      console.error('AI Voice Agent Error:', err);
      setAgentResponse("I'm having trouble connecting to the kitchen recommendations. Please tap the mic and try again!");
    } finally {
      setIsLoading(false);
    }
  };

  const sampleVoicePrompts = [
    "Suggest something spicy and vegetarian under $14",
    "Is it spicy?",
    "Suggest something less spicy",
    "Do you have Jain food?",
    "What food is suitable for children?",
    "What are today's chef specials?"
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)] bg-slate-900 text-white rounded-3xl p-5 shadow-2xl border border-slate-800 relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Status & Controls */}
      <div className="flex items-center justify-between z-10 border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <div>
            <h2 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <span>AI Voice Waiter</span>
              {ollamaInfo.online && ollamaInfo.model_available ? (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                  Qwen 2.5 3B Live
                </span>
              ) : (
                <span className="text-[10px] bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2 py-0.5 rounded-full font-bold">
                  Voice Agent Ready
                </span>
              )}
            </h2>
            <p className="text-[11px] text-slate-400">Direct voice dining assistance</p>
          </div>
        </div>

        {/* TTS Speaker Mute/Unmute */}
        <button
          onClick={() => {
            if (isSpeaking) stopSpeaking();
            setTtsEnabled(!ttsEnabled);
          }}
          className={`p-2 rounded-xl border transition ${
            ttsEnabled
              ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
              : 'bg-slate-800 text-slate-500 border-slate-700'
          }`}
          title={ttsEnabled ? "Voice Output Active" : "Voice Output Muted"}
        >
          {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* MAIN CENTER STAGE: Direct Voice Agent Orb */}
      <div className="flex-1 flex flex-col items-center justify-center text-center z-10 py-6">
        
        {/* Animated Glowing Voice Orb / Mic Circle */}
        <div className="relative mb-6">
          {/* Pulsing ring waves when active */}
          {(isListening || isSpeaking) && (
            <>
              <div className="absolute inset-0 -m-4 rounded-full border-2 border-orange-500/40 animate-ping"></div>
              <div className="absolute inset-0 -m-8 rounded-full border border-amber-500/20 animate-pulse"></div>
            </>
          )}

          <button
            onClick={isListening ? stopListening : startListening}
            className={`w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all duration-300 transform shadow-2xl relative select-none ${
              isListening
                ? 'bg-linear-to-tr from-rose-600 to-red-500 scale-105 ring-8 ring-rose-500/30 shadow-rose-600/50'
                : isSpeaking
                ? 'bg-linear-to-tr from-amber-500 to-orange-600 scale-105 ring-8 ring-orange-500/30 shadow-orange-600/50'
                : 'bg-linear-to-tr from-orange-600 to-amber-500 hover:scale-105 ring-4 ring-orange-500/20 shadow-orange-600/40'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-10 h-10 text-white mb-1 animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-wider text-white">Listening</span>
              </>
            ) : isSpeaking ? (
              <>
                <Volume2 className="w-10 h-10 text-white mb-1 animate-bounce" />
                <span className="text-[11px] font-black uppercase tracking-wider text-white">Speaking</span>
              </>
            ) : (
              <>
                <Mic className="w-10 h-10 text-white mb-1" />
                <span className="text-[11px] font-black uppercase tracking-wider text-white">Tap to Speak</span>
              </>
            )}
          </button>
        </div>

        {/* Live Audio Waves Visualizer */}
        <div className="flex items-end justify-center space-x-1.5 h-8 mb-4">
          <span className={`w-1.5 bg-orange-500 rounded-full ${isListening || isSpeaking ? 'wave-animate-1' : 'h-2'}`}></span>
          <span className={`w-1.5 bg-amber-400 rounded-full ${isListening || isSpeaking ? 'wave-animate-2' : 'h-3'}`}></span>
          <span className={`w-1.5 bg-orange-600 rounded-full ${isListening || isSpeaking ? 'wave-animate-3' : 'h-2'}`}></span>
          <span className={`w-1.5 bg-amber-500 rounded-full ${isListening || isSpeaking ? 'wave-animate-4' : 'h-4'}`}></span>
          <span className={`w-1.5 bg-orange-400 rounded-full ${isListening || isSpeaking ? 'wave-animate-5' : 'h-2'}`}></span>
        </div>

        {/* Real-time Status / User Query */}
        <div className="max-w-md w-full px-4 mb-2">
          {isListening ? (
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-amber-300 font-semibold text-sm">
              🎙️ {interimText ? `"${interimText}..."` : "Listening... Speak your preference!"}
            </div>
          ) : isLoading ? (
            <div className="text-sm font-semibold text-orange-400 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce [animation-delay:0.2s]"></div>
              <span>Checking fresh daily menu & chef specials...</span>
            </div>
          ) : currentQuery ? (
            <div className="text-xs text-slate-400">
              You asked: <span className="text-slate-200 font-semibold">"{currentQuery}"</span>
            </div>
          ) : null}
        </div>

        {/* AI Voice Agent Spoken Response Subtitle Card */}
        {agentResponse && !isListening && (
          <div className="max-w-md w-full p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 text-white shadow-lg text-sm leading-relaxed mb-4 animate-fadeIn">
            <div className="flex items-center space-x-1.5 text-xs text-orange-400 font-bold mb-1">
              <Bot className="w-3.5 h-3.5" />
              <span>AI Waiter:</span>
            </div>
            <p className="text-slate-100">{agentResponse}</p>
          </div>
        )}

      </div>

      {/* RECOMMENDED DISH CARDS: Dynamically Appears Below Voice Agent */}
      {recommendedDishes.length > 0 && (
        <div className="z-10 bg-slate-800/80 border border-slate-700 p-4 rounded-2xl mb-4">
          <div className="flex items-center justify-between text-xs font-bold text-amber-300 mb-2.5">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-orange-400" />
              Recommended From Today's Menu:
            </span>
            <span className="text-slate-400 text-[11px]">Strictly Available Today</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {recommendedDishes.map((dish) => {
              const inCart = cartItems?.find((item) => item.id === dish.id);
              return (
                <div
                  key={dish.id}
                  className="p-3 bg-slate-900/90 rounded-xl border border-slate-700/90 flex flex-col justify-between"
                >
                  <div>
                    {dish.image_url && (
                      <img
                        src={dish.image_url}
                        alt={dish.name}
                        className="w-full h-20 object-cover rounded-lg mb-2"
                      />
                    )}
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-bold text-white text-sm">{dish.name}</h4>
                      <span className="font-extrabold text-orange-400 text-sm whitespace-nowrap">
                        ${dish.effective_price.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 my-1.5">
                      {dish.is_vegetarian && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-0.5">
                          <Leaf className="w-2.5 h-2.5" /> Veg
                        </span>
                      )}
                      {dish.is_spicy && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-0.5">
                          <Flame className="w-2.5 h-2.5" /> Spicy
                        </span>
                      )}
                      {dish.is_today_special && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-amber-950 text-amber-300 border border-amber-800">
                          ⭐ Special
                        </span>
                      )}
                    </div>

                    {dish.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">{dish.description}</p>
                    )}
                  </div>

                  <button
                    onClick={() => onAddToCart && onAddToCart(dish)}
                    className={`mt-2.5 w-full py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition ${
                      inCart
                        ? 'bg-emerald-600 text-white'
                        : 'bg-orange-600 hover:bg-orange-700 text-white'
                    }`}
                  >
                    {inCart ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Added ({inCart.quantity})</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Add to Table Order</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* QUICK VOICE PROMPTS: Tap to say aloud */}
      <div className="z-10 pt-2 border-t border-slate-800">
        <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
          Or tap to ask your AI Waiter:
        </span>
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1">
          {sampleVoicePrompts.map((promptText, idx) => (
            <button
              key={idx}
              onClick={() => handleVoiceQuery(promptText)}
              className="text-xs font-medium px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 hover:text-orange-400 text-slate-200 border border-slate-700 whitespace-nowrap transition shadow-xs"
            >
              "{promptText}"
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

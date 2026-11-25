import { useState, useEffect, useRef, useCallback } from 'react';
import { getNeuralTtsUrl } from '../services/api';

export function useSpeech({ onTranscriptReady, languageCode = 'en' }) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [interimText, setInterimText] = useState('');
  
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    
    // Set recognition language
    const langMap = {
      en: 'en-US',
      hi: 'hi-IN',
      es: 'es-ES',
      fr: 'fr-FR',
    };
    recognition.lang = langMap[languageCode] || 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setInterimText('');
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      setInterimText(interimTranscript);

      if (finalTranscript.trim()) {
        setIsListening(false);
        setInterimText('');
        if (onTranscriptReady) {
          onTranscriptReady(finalTranscript.trim());
        }
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
      setInterimText('');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [languageCode, onTranscriptReady]);

  // Stop any active spoken audio
  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  // Fallback to browser SpeechSynthesis if offline
  const speakFallback = useCallback((text, langCode) => {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const langMap = { en: 'en-US', hi: 'hi-IN', es: 'es-ES', fr: 'fr-FR' };
    utterance.lang = langMap[langCode] || 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  // Main speaking function: Streams Edge-TTS Neural Voice (Microsoft Azure Neural)
  const speak = useCallback((text, langCode = languageCode) => {
    if (!text || !text.trim()) return;

    // Stop ongoing speech
    stopSpeaking();

    try {
      const url = getNeuralTtsUrl(text.trim(), langCode);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => {
        setIsSpeaking(false);
        audioRef.current = null;
      };
      audio.onerror = (e) => {
        console.warn('Neural TTS stream error, falling back to browser voice:', e);
        setIsSpeaking(false);
        audioRef.current = null;
        speakFallback(text, langCode);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio play restricted by browser policy, using fallback:', err);
          speakFallback(text, langCode);
        });
      }
    } catch (err) {
      console.warn('Audio initialization error:', err);
      speakFallback(text, langCode);
    }
  }, [languageCode, stopSpeaking, speakFallback]);

  // Start listening function
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. You can type your request directly!');
      return;
    }
    // Stop ongoing TTS before listening
    stopSpeaking();

    try {
      recognitionRef.current.start();
    } catch (e) {
      console.warn('Recognition start issue:', e);
    }
  }, [stopSpeaking]);

  // Stop listening function
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  return {
    isListening,
    isSpeaking,
    speechSupported,
    interimText,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}

export default useSpeech;

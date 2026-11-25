import io
import asyncio
import logging
from typing import Dict
import edge_tts

logger = logging.getLogger(__name__)

# In-memory audio cache for instant playback (<5ms latency on repeated queries)
_audio_cache: Dict[str, bytes] = {}
MAX_CACHE_SIZE = 256

# Curated warm, polite, highly natural neural voices for Waiter Venky
VOICE_MAP = {
    "en": "en-IN-PrabhatNeural",  # Polite, warm Indian English male waiter voice
    "hi": "hi-IN-MadhurNeural",   # Courteous, respectful Hindi male waiter voice
    "es": "es-ES-AlvaroNeural",   # Warm Spanish male voice
    "fr": "fr-FR-HenriNeural",    # Courteous French male voice
}

async def generate_neural_speech(text: str, language_code: str = "en") -> bytes:
    """
    Synthesizes natural studio-grade speech for Waiter Venky using Edge-TTS (Microsoft Neural).
    100% Free, unlimited, zero API key required.
    """
    clean_text = text.strip()
    if not clean_text:
        return b""

    voice = VOICE_MAP.get(language_code.lower(), "en-IN-PrabhatNeural")
    cache_key = f"{voice}:{clean_text}"

    # Return cached audio if already generated
    if cache_key in _audio_cache:
        return _audio_cache[cache_key]

    try:
        communicate = edge_tts.Communicate(clean_text, voice=voice, rate="+0%", pitch="+0Hz")
        buffer = bytearray()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                buffer.extend(chunk["data"])

        audio_bytes = bytes(buffer)

        # Cache result
        if len(_audio_cache) >= MAX_CACHE_SIZE:
            _audio_cache.pop(next(iter(_audio_cache)))
        _audio_cache[cache_key] = audio_bytes

        return audio_bytes
    except Exception as e:
        logger.error(f"Edge-TTS synthesis error: {e}")
        raise e

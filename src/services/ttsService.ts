// Text-to-Speech service using Sarvam AI

export interface TTSOptions {
  speaker?: string;
  language_code?: string;
  pitch?: number;
  pace?: number;
  loudness?: number;
  speech_sample_rate?: number;
  enable_preprocessing?: boolean;
  model?: string;
}

export interface TTSResponse {
  audioUrl?: string;
  audioBlob?: Blob;
  audioElement?: HTMLAudioElement;
  error?: string;
}

class TTSService {
  private sarvamApiKey: string = '';
  private sarvamBaseUrl = 'https://api.sarvam.ai';
  
  private defaultSpeaker = 'meera';
  private defaultLanguage = 'en-IN';
  private defaultSettings = {
    pitch: 0,
    pace: 1.0,
    loudness: 1.0,
    speech_sample_rate: 22050,
    enable_preprocessing: true,
    model: 'bulbul:v1'
  };

  constructor() {
    this.sarvamApiKey = import.meta.env.VITE_SARVAM_API_KEY || '';
    console.log('🎤 Sarvam AI TTS Service initialized');
  }

  async convertTextToSpeech(
    text: string, 
    options: TTSOptions = {}
  ): Promise<TTSResponse> {
    if (!text.trim()) {
      return { error: 'Text cannot be empty' };
    }

    if (!this.sarvamApiKey) {
      console.log('No Sarvam AI API key found, using browser TTS fallback');
      return this.useBrowserTTS(text);
    }

    try {
      const speaker = options.speaker || this.defaultSpeaker;
      const languageCode = options.language_code || this.defaultLanguage;
      
      console.log('Making Sarvam AI TTS request with:', { 
        speaker, 
        languageCode,
        textLength: text.length
      });
      
      const response = await fetch(`${this.sarvamBaseUrl}/text-to-speech`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'API-Subscription-Key': this.sarvamApiKey,
        },
        body: JSON.stringify({
          inputs: [text],
          target_language_code: languageCode,
          speaker: speaker,
          pitch: options.pitch || this.defaultSettings.pitch,
          pace: options.pace || this.defaultSettings.pace,
          loudness: options.loudness || this.defaultSettings.loudness,
          speech_sample_rate: options.speech_sample_rate || this.defaultSettings.speech_sample_rate,
          enable_preprocessing: options.enable_preprocessing !== undefined ? options.enable_preprocessing : this.defaultSettings.enable_preprocessing,
          model: options.model || this.defaultSettings.model
        }),
      });

      if (!response.ok) {
        console.log('🔄 Sarvam AI error, falling back to browser TTS');
        return this.useBrowserTTS(text);
      }

      const responseData = await response.json();
      
      if (responseData.audios && responseData.audios[0]) {
        const base64Audio = responseData.audios[0];
        const audioBuffer = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0));
        const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

        return {
          audioBlob,
          audioUrl
        };
      } else {
        return this.useBrowserTTS(text);
      }

    } catch (error) {
      console.error('Sarvam TTS Error:', error);
      return this.useBrowserTTS(text);
    }
  }

  private async useBrowserTTS(text: string): Promise<TTSResponse> {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve({ error: 'Speech synthesis not supported in this browser' });
        return;
      }

      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        const voices = speechSynthesis.getVoices();
        const femaleVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('female') || 
          voice.lang.includes('en')
        );
        
        if (femaleVoice) {
          utterance.voice = femaleVoice;
        }

        utterance.onend = () => {
          resolve({ 
            audioUrl: 'browser-tts://' + encodeURIComponent(text)
          });
        };

        utterance.onerror = (error) => {
          resolve({ error: 'Browser TTS failed: ' + error.error });
        };

        speechSynthesis.speak(utterance);
        
      } catch (error) {
        resolve({ error: 'Browser TTS failed: ' + (error as Error).message });
      }
    });
  }

  revokeAudioUrl(audioUrl: string) {
    if (audioUrl && !audioUrl.startsWith('browser-tts://')) {
      URL.revokeObjectURL(audioUrl);
    }
  }

  async testService(): Promise<boolean> {
    try {
      const result = await this.convertTextToSpeech('Test');
      return !result.error;
    } catch (error) {
      return false;
    }
  }

  // Force browser TTS for testing (bypasses API)
  async testBrowserTTS(text: string = "Hello! This is a test of the browser text-to-speech system. The mouth should move naturally with these words."): Promise<TTSResponse> {
    console.log('🧪 Testing Browser TTS with text:', text.substring(0, 50) + '...');
    return this.useBrowserTTS(text);
  }

  // Test different voice speeds
  async testBrowserTTSSpeed(text: string, rate: number = 0.9): Promise<TTSResponse> {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve({ error: 'Speech synthesis not supported in this browser' });
        return;
      }

      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate; // Use custom rate
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        const voices = speechSynthesis.getVoices();
        const femaleVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('female') || 
          voice.lang.includes('en')
        );
        
        if (femaleVoice) {
          utterance.voice = femaleVoice;
        }

        utterance.onend = () => {
          resolve({ 
            audioUrl: 'browser-tts://' + encodeURIComponent(text)
          });
        };

        utterance.onerror = (error) => {
          resolve({ error: 'Browser TTS failed: ' + error.error });
        };

        console.log(`🎤 Testing browser TTS at ${rate}x speed with voice:`, utterance.voice?.name || 'default');
        speechSynthesis.speak(utterance);
        
      } catch (error) {
        resolve({ error: 'Browser TTS failed: ' + (error as Error).message });
      }
    });
  }

  // List available browser voices for testing
  getBrowserVoices() {
    if (!('speechSynthesis' in window)) {
      return [];
    }
    
    const voices = speechSynthesis.getVoices();
    return voices.map(voice => ({
      name: voice.name,
      lang: voice.lang,
      gender: voice.name.toLowerCase().includes('female') ? 'female' : 
              voice.name.toLowerCase().includes('male') ? 'male' : 'unknown'
    }));
  }

  getSupportedLanguages() {
    return [
      { code: 'en-IN', name: 'English (India)', native: 'English' },
      { code: 'hi-IN', name: 'Hindi (India)', native: 'हिन्दी' },
      { code: 'bn-IN', name: 'Bengali (India)', native: 'বাংলা' },
      { code: 'te-IN', name: 'Telugu (India)', native: 'తెలుగు' },
      { code: 'ta-IN', name: 'Tamil (India)', native: 'தमিழ்' },
      { code: 'mr-IN', name: 'Marathi (India)', native: 'मराठी' },
      { code: 'gu-IN', name: 'Gujarati (India)', native: 'ગુજરાતી' },
      { code: 'kn-IN', name: 'Kannada (India)', native: 'ಕನ್ನಡ' },
      { code: 'or-IN', name: 'Odia (India)', native: 'ଓଡ଼ିଆ' },
      { code: 'pa-IN', name: 'Punjabi (India)', native: 'ਪੰਜਾਬੀ' }
    ];
  }
}

export const ttsService = new TTSService();
export default ttsService;
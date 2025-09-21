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
  chunksProcessed?: number;
  totalChunks?: number;
}

export interface TTSProgressCallback {
  (current: number, total: number, currentChunk: string): void;
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

  /**
   * Split text into chunks that respect sentence boundaries
   * @param text - The text to split
   * @param maxLength - Maximum length per chunk (default 400)
   * @returns Array of text chunks
   */
  private splitTextIntoChunks(text: string, maxLength: number = 400): string[] {
    if (text.length <= maxLength) {
      return [text];
    }

    const chunks: string[] = [];
    let currentChunk = '';
    
    // Split by sentences first
    const sentences = text.split(/(?<=[.!?])\s+/);
    
    for (const sentence of sentences) {
      // If a single sentence is too long, we need to split it further
      if (sentence.length > maxLength) {
        // If we have a current chunk, add it first
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
        
        // Split long sentence by clauses or words
        const words = sentence.split(' ');
        let wordChunk = '';
        
        for (const word of words) {
          if ((wordChunk + ' ' + word).length <= maxLength) {
            wordChunk += (wordChunk ? ' ' : '') + word;
          } else {
            if (wordChunk.trim()) {
              chunks.push(wordChunk.trim());
            }
            wordChunk = word;
          }
        }
        
        if (wordChunk.trim()) {
          chunks.push(wordChunk.trim());
        }
      } else {
        // Check if adding this sentence would exceed the limit
        if ((currentChunk + ' ' + sentence).length <= maxLength) {
          currentChunk += (currentChunk ? ' ' : '') + sentence;
        } else {
          // Add current chunk and start a new one
          if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
          }
          currentChunk = sentence;
        }
      }
    }
    
    // Add any remaining text
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }

  /**
   * Combine multiple audio blobs into a single continuous audio stream
   * @param audioBlobs - Array of audio blobs to combine
   * @returns Combined audio blob
   */
  private async combineAudioBlobs(audioBlobs: Blob[]): Promise<Blob> {
    if (audioBlobs.length === 0) {
      throw new Error('No audio blobs to combine');
    }
    
    if (audioBlobs.length === 1) {
      return audioBlobs[0];
    }

    try {
      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const combinedBuffers: AudioBuffer[] = [];

      // Decode all audio blobs
      for (const blob of audioBlobs) {
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        combinedBuffers.push(audioBuffer);
      }

      // Calculate total length
      const totalLength = combinedBuffers.reduce((sum, buffer) => sum + buffer.length, 0);
      const sampleRate = combinedBuffers[0].sampleRate;
      const numberOfChannels = combinedBuffers[0].numberOfChannels;

      // Create combined buffer
      const combinedBuffer = audioContext.createBuffer(numberOfChannels, totalLength, sampleRate);

      // Copy all buffers into the combined buffer
      let offset = 0;
      for (const buffer of combinedBuffers) {
        for (let channel = 0; channel < numberOfChannels; channel++) {
          const channelData = buffer.getChannelData(channel);
          combinedBuffer.getChannelData(channel).set(channelData, offset);
        }
        offset += buffer.length;
      }

      // Convert back to blob
      const offlineContext = new OfflineAudioContext(numberOfChannels, totalLength, sampleRate);
      const source = offlineContext.createBufferSource();
      source.buffer = combinedBuffer;
      source.connect(offlineContext.destination);
      source.start();

      const renderedBuffer = await offlineContext.startRendering();
      
      // Convert to WAV blob
      const wavBlob = await this.audioBufferToWav(renderedBuffer);
      
      // Close audio context to free resources
      await audioContext.close();
      
      return wavBlob;
    } catch (error) {
      console.error('Error combining audio blobs:', error);
      throw error;
    }
  }

  /**
   * Convert AudioBuffer to WAV Blob
   * @param audioBuffer - AudioBuffer to convert
   * @returns WAV Blob
   */
  private async audioBufferToWav(audioBuffer: AudioBuffer): Promise<Blob> {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length * numberOfChannels * 2;
    const buffer = new ArrayBuffer(44 + length);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length, true);
    
    // Convert float32 to int16
    const channelData: Float32Array[] = [];
    for (let channel = 0; channel < numberOfChannels; channel++) {
      channelData.push(audioBuffer.getChannelData(channel));
    }
    
    let offset = 44;
    for (let i = 0; i < audioBuffer.length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, channelData[channel][i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return new Blob([buffer], { type: 'audio/wav' });
  }

  async convertTextToSpeech(
    text: string, 
    options: TTSOptions = {},
    onProgress?: TTSProgressCallback
  ): Promise<TTSResponse> {
    if (!text.trim()) {
      return { error: 'Text cannot be empty' };
    }

    if (!this.sarvamApiKey) {
      console.log('No Sarvam AI API key found, using browser TTS fallback');
      return this.useBrowserTTS(text);
    }

    try {
      // Check if text needs to be split
      if (text.length <= 400) {
        // Single chunk processing
        return await this.processSingleChunk(text, options);
      } else {
        // Multi-chunk processing
        return await this.processMultipleChunks(text, options, onProgress);
      }
    } catch (error) {
      console.error('Sarvam TTS Error:', error);
      return this.useBrowserTTS(text);
    }
  }

  /**
   * Process a single text chunk
   */
  private async processSingleChunk(text: string, options: TTSOptions): Promise<TTSResponse> {
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
      const errorData = await response.text();
      console.log('🔄 Sarvam AI error:', errorData, 'falling back to browser TTS');
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
        audioUrl,
        chunksProcessed: 1,
        totalChunks: 1
      };
    } else {
      return this.useBrowserTTS(text);
    }
  }

  /**
   * Process multiple text chunks and combine the results
   */
  private async processMultipleChunks(
    text: string, 
    options: TTSOptions, 
    onProgress?: TTSProgressCallback
  ): Promise<TTSResponse> {
    const chunks = this.splitTextIntoChunks(text, 400);
    console.log(`📝 Split text into ${chunks.length} chunks for TTS processing`);
    
    const audioBlobs: Blob[] = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      // Call progress callback if provided
      if (onProgress) {
        onProgress(i + 1, chunks.length, chunk);
      }
      
      console.log(`🎤 Processing chunk ${i + 1}/${chunks.length}: "${chunk.substring(0, 50)}..."`);
      
      try {
        const chunkResponse = await this.processSingleChunk(chunk, options);
        
        if (chunkResponse.error) {
          console.error(`Error processing chunk ${i + 1}:`, chunkResponse.error);
          // Fallback to browser TTS for the entire text
          return this.useBrowserTTS(text);
        }
        
        if (chunkResponse.audioBlob) {
          audioBlobs.push(chunkResponse.audioBlob);
        }
        
        // Small delay between requests to avoid rate limiting
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Error processing chunk ${i + 1}:`, error);
        // Fallback to browser TTS for the entire text
        return this.useBrowserTTS(text);
      }
    }
    
    if (audioBlobs.length === 0) {
      return { error: 'No audio chunks were successfully generated' };
    }
    
    try {
      // Combine all audio blobs
      console.log(`🔗 Combining ${audioBlobs.length} audio chunks`);
      const combinedBlob = await this.combineAudioBlobs(audioBlobs);
      const combinedAudioUrl = URL.createObjectURL(combinedBlob);
      
      return {
        audioBlob: combinedBlob,
        audioUrl: combinedAudioUrl,
        chunksProcessed: audioBlobs.length,
        totalChunks: chunks.length
      };
    } catch (error) {
      console.error('Error combining audio chunks:', error);
      // Fallback to browser TTS
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

  /**
   * Test the chunking functionality with a long text
   */
  async testChunkingTTS(longText?: string): Promise<TTSResponse> {
    const testText = longText || 
      "This is a very long text that should be automatically split into multiple chunks when processed by the TTS service. " +
      "Each chunk will be processed individually by the Sarvam AI API, and then all the audio chunks will be combined into a single, " +
      "continuous audio stream. This allows us to handle texts that are longer than the 500 character limit imposed by the API. " +
      "The chunking algorithm tries to preserve sentence boundaries whenever possible to maintain natural speech flow. " +
      "If a single sentence is too long, it will be split at word boundaries. This ensures that the final audio sounds natural " +
      "and maintains proper pacing and pronunciation throughout the entire text.";

    console.log('🧪 Testing chunking TTS with text length:', testText.length);
    
    const progressCallback: TTSProgressCallback = (current, total, chunk) => {
      console.log(`📊 Progress: ${current}/${total} - Processing: "${chunk.substring(0, 30)}..."`);
    };

    return this.convertTextToSpeech(testText, {}, progressCallback);
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
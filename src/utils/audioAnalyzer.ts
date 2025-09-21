// Audio analysis utilities for lip sync

export interface AudioAnalytics {
  volume: number;
  frequency: number;
  isPlaying: boolean;
}

export class AudioAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyzer: AnalyserNode | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;
  private rafId: number | null = null;
  private previousVolume: number = 0;
  private volumeSmoothing: number = 0.7; // Smoothing factor for volume changes

  constructor() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.error('AudioContext not supported:', error);
    }
  }

  // Connect to an audio element for analysis
  connectToAudio(audioElement: HTMLAudioElement): boolean {
    if (!this.audioContext) return false;

    try {
      // Resume context if suspended (required by some browsers)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      this.analyzer = this.audioContext.createAnalyser();
      this.analyzer.fftSize = 512; // Increased for better frequency resolution
      this.analyzer.smoothingTimeConstant = 0.6; // Reduced for more responsiveness

      this.source = this.audioContext.createMediaElementSource(audioElement);
      this.source.connect(this.analyzer);
      this.analyzer.connect(this.audioContext.destination);

      this.dataArray = new Uint8Array(this.analyzer.frequencyBinCount);
      
      return true;
    } catch (error) {
      console.error('Failed to connect audio analyzer:', error);
      return false;
    }
  }

  // Start analyzing audio and call callback with analytics - IMPROVED VERSION
  startAnalysis(callback: (analytics: AudioAnalytics) => void) {
    if (!this.analyzer || !this.dataArray) return;

    const analyze = () => {
      if (!this.analyzer || !this.dataArray) return;

      this.analyzer.getByteFrequencyData(this.dataArray);
      
      // Calculate volume (RMS of frequency data) with improved algorithm
      let sum = 0;
      let peakValue = 0;
      for (let i = 0; i < this.dataArray.length; i++) {
        const value = this.dataArray[i];
        sum += value * value;
        if (value > peakValue) peakValue = value;
      }
      const rms = Math.sqrt(sum / this.dataArray.length);
      let rawVolume = rms / 255; // Normalize to 0-1
      
      // Apply smoothing to prevent jittery movements
      const smoothedVolume = (this.previousVolume * this.volumeSmoothing) + 
                           (rawVolume * (1 - this.volumeSmoothing));
      this.previousVolume = smoothedVolume;

      // Enhanced frequency analysis - find the most prominent frequency bands
      const nyquist = (this.audioContext?.sampleRate || 44100) / 2;
      const binWidth = nyquist / this.dataArray.length;
      
      // Analyze frequency bands for better phoneme detection
      let maxEnergy = 0;
      let dominantFrequency = 0;
      
      for (let i = 1; i < this.dataArray.length; i++) { // Skip DC component
        const frequency = i * binWidth;
        const energy = this.dataArray[i];
        
        if (energy > maxEnergy && frequency > 80 && frequency < 8000) {
          maxEnergy = energy;
          dominantFrequency = frequency;
        }
      }

      callback({
        volume: smoothedVolume,
        frequency: dominantFrequency,
        isPlaying: smoothedVolume > 0.008 // Lowered threshold for better sensitivity
      });

      this.rafId = requestAnimationFrame(analyze);
    };

    analyze();
  }

  // Stop analysis
  stopAnalysis() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  // Clean up resources
  disconnect() {
    this.stopAnalysis();
    
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    
    if (this.analyzer) {
      this.analyzer.disconnect();
      this.analyzer = null;
    }
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Simple viseme mapping based on volume and frequency - MORE RESPONSIVE  
export const mapAudioToViseme = (analytics: AudioAnalytics): string => {
  const { volume, frequency } = analytics;
  
  // Lower thresholds for better responsiveness while maintaining natural feel
  if (volume < 0.015) {
    return 'closed'; // Silence - close mouth between words
  }
  
  // Brief pause detection - more sensitive to capture micro-movements
  if (volume < 0.04) {
    return 'slight_close'; // Slightly closed for micro-pauses
  }
  
  // Lower thresholds for opening mouth - more visible movement
  if (frequency > 3000 && volume > 0.08) {
    return volume > 0.5 ? 'ee' : 'smile'; // Much lower threshold for high frequency
  }
  
  if (frequency > 2000 && volume > 0.1) {
    return volume > 0.4 ? 'ah' : 'half_open'; // Lower threshold for mid-high
  }
  
  if (frequency > 1000 && volume > 0.12) {
    return volume > 0.5 ? 'open_wide' : 'half_open'; // More responsive wide opening
  }
  
  if (frequency > 500 && volume > 0.08) {
    return 'oh'; // Much lower threshold for OH sounds
  }
  
  if (frequency < 300 && volume > 0.06) {
    return 'oo'; // Lower threshold for low frequency
  }
  
  // Default to visible movement for more sounds
  return volume > 0.05 ? 'slight_close' : 'closed';
};

// Enhanced viseme configurations with VISIBLE, professional mouth shapes based on Ready Player Me patterns
export const visemeConfig = {
  closed: { mouthOpen: 0, mouthSmile: 0, mouthRound: 0 },
  slight_close: { mouthOpen: 0.15, mouthSmile: 0, mouthRound: 0.05 }, // Now visible
  half_open: { mouthOpen: 0.4, mouthSmile: 0.1, mouthRound: 0.1 }, // Much more visible
  open_wide: { mouthOpen: 0.7, mouthSmile: 0, mouthRound: 0.1 }, // Clear wide opening
  smile: { mouthOpen: 0.25, mouthSmile: 0.4, mouthRound: 0 }, // Visible smile
  ee: { mouthOpen: 0.2, mouthSmile: 0.5, mouthRound: 0 }, // Strong 'EE' expression
  ah: { mouthOpen: 0.6, mouthSmile: 0, mouthRound: 0.2 }, // Clear 'AH' opening  
  oh: { mouthOpen: 0.5, mouthSmile: 0, mouthRound: 0.6 }, // Prominent 'OH' shape
  oo: { mouthOpen: 0.35, mouthSmile: 0, mouthRound: 0.7 }, // Strong 'OO' pucker
  round: { mouthOpen: 0.3, mouthSmile: 0, mouthRound: 0.5 }, // Visible rounding
};
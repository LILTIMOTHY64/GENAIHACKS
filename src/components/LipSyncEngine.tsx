import { useRef, useImperativeHandle, forwardRef } from 'react';
import { AudioAnalyzer, mapAudioToViseme, visemeConfig } from '../utils/audioAnalyzer';
import type { AudioAnalytics } from '../utils/audioAnalyzer';

export interface LipSyncHandle {
  startLipSync: (audioElement: HTMLAudioElement) => void;
  stopLipSync: () => void;
}

interface LipSyncEngineProps {
  onVisemeChange?: (viseme: string, morphValues: any) => void;
}

const LipSyncEngine = forwardRef<LipSyncHandle, LipSyncEngineProps>(
  ({ onVisemeChange }, ref) => {
    const analyzerRef = useRef<AudioAnalyzer | null>(null);
    const currentVisemeRef = useRef<string>('closed');
    const currentMorphRef = useRef({ mouthOpen: 0, mouthSmile: 0, mouthRound: 0 });
    const smoothingFactor = 0.25; // Faster transitions for more visible movement
    const lastSpeechTime = useRef<number>(0);
    const lastVisemeTime = useRef<number>(0);
    const silenceThreshold = 200; // Shorter silence for more responsive feel
    const visemeChangeInterval = 300; // Shorter intervals between changes
    const minOpenDuration = 100; // Shorter minimum open duration
    const lastOpenTime = useRef<number>(0);

    // Smooth interpolation between morph values
    const smoothMorphTransition = (targetMorph: any) => {
      const current = currentMorphRef.current;
      const smoothed = {
        mouthOpen: current.mouthOpen + (targetMorph.mouthOpen - current.mouthOpen) * smoothingFactor,
        mouthSmile: current.mouthSmile + (targetMorph.mouthSmile - current.mouthSmile) * smoothingFactor,
        mouthRound: current.mouthRound + (targetMorph.mouthRound - current.mouthRound) * smoothingFactor,
      };
      currentMorphRef.current = smoothed;
      return smoothed;
    };

    useImperativeHandle(ref, () => ({
      startLipSync: (audioElement: HTMLAudioElement) => {
        // Clean up any existing analyzer
        if (analyzerRef.current) {
          analyzerRef.current.disconnect();
        }

        // Create new analyzer
        analyzerRef.current = new AudioAnalyzer();
        
        if (analyzerRef.current.connectToAudio(audioElement)) {
          analyzerRef.current.startAnalysis((analytics: AudioAnalytics) => {
            const now = Date.now();
            const { volume } = analytics;
            
            // Track when we last had significant speech
            if (volume > 0.03) { // Lower threshold for better speech detection
              lastSpeechTime.current = now;
            }
            
            let newViseme = mapAudioToViseme(analytics);
            
            // MORE RESPONSIVE MOVEMENT:
            
            // 1. Close after moderate silence periods
            const timeSinceLastSpeech = now - lastSpeechTime.current;
            if (timeSinceLastSpeech > silenceThreshold && volume < 0.02) {
              newViseme = 'closed';
            }
            
            // 2. More frequent viseme changes for responsiveness
            const timeSinceLastViseme = now - lastVisemeTime.current;
            if (timeSinceLastViseme > visemeChangeInterval && currentVisemeRef.current !== 'closed') {
              newViseme = 'closed';
              lastVisemeTime.current = now;
            }
            
            // 3. Lower threshold for quiet closure (more responsive)
            if (volume < 0.015) {
              newViseme = 'closed';
            }
            
            // 4. Occasional random closures for natural pauses
            if (Math.random() < 0.02 && volume < 0.05) { // Slightly more frequent for naturalness
              newViseme = 'closed';
            }
            
            // 5. Longer minimum gaps between movements
            if (newViseme !== 'closed' && currentVisemeRef.current === 'closed') {
              const timeSinceLastOpen = now - lastOpenTime.current;
              if (timeSinceLastOpen < minOpenDuration) {
                newViseme = 'closed'; // Keep closed longer
              } else {
                lastOpenTime.current = now;
              }
            }
            
            const targetMorphValues = visemeConfig[newViseme as keyof typeof visemeConfig];
            
            // Always update with smooth transition
            const smoothedMorphValues = smoothMorphTransition(targetMorphValues);
            currentVisemeRef.current = newViseme;
            onVisemeChange?.(newViseme, smoothedMorphValues);
          });
        }
      },

      stopLipSync: () => {
        if (analyzerRef.current) {
          analyzerRef.current.disconnect();
          analyzerRef.current = null;
        }
        
        // Smooth transition back to closed mouth
        const targetMorphValues = visemeConfig.closed;
        const smoothedMorphValues = smoothMorphTransition(targetMorphValues);
        currentVisemeRef.current = 'closed';
        onVisemeChange?.('closed', smoothedMorphValues);
      }
    }));

    return null; // This component doesn't render anything
  }
);

LipSyncEngine.displayName = 'LipSyncEngine';

export default LipSyncEngine;
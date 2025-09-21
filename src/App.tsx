import { useRef, useState } from 'react';
import './App.css';
import ChatInterface from './components/ChatInterface';
import Avatar from './components/Avatar';
import LipSyncEngine from './components/LipSyncEngine';
import type { LipSyncHandle } from './components/LipSyncEngine';

function App() {
  const lipSyncRef = useRef<LipSyncHandle>(null);
  const [morphValues, setMorphValues] = useState({ 
    mouthOpen: 0, 
    mouthSmile: 0, 
    mouthRound: 0 
  });

  const handleAudioStart = (audioElement: HTMLAudioElement) => {
    lipSyncRef.current?.startLipSync(audioElement);
  };

  const handleAudioEnd = () => {
    lipSyncRef.current?.stopLipSync();
  };

  // Simple animation for browser TTS
  const startSimpleAnimation = (duration: number = 3000) => {
    let startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;
      
      if (progress < 1) {
        // Create simple mouth movements
        const cycle = (elapsed / 200) % (Math.PI * 2); // Fast mouth cycle
        const mouthOpen = (Math.sin(cycle) + 1) * 0.3; // 0 to 0.6
        const mouthSmile = 0.1;
        
        setMorphValues({ 
          mouthOpen, 
          mouthSmile, 
          mouthRound: mouthOpen * 0.5 
        });
        
        requestAnimationFrame(animate);
      } else {
        // Animation finished - reset mouth
        setMorphValues({ mouthOpen: 0, mouthSmile: 0, mouthRound: 0 });
      }
    };
    
    requestAnimationFrame(animate);
  };

  const handleVisemeChange = (_viseme: string, newMorphValues: any) => {
    setMorphValues(newMorphValues);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900">
      {/* Modern Header with Glass Effect */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-white/10 px-4 lg:px-8 py-4 lg:py-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <svg className="w-4 h-4 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg lg:text-2xl font-bold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
                MindfulCompanion
              </h1>
              <p className="text-xs lg:text-sm text-emerald-200/70 hidden sm:block">Your AI Mental Health Support</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 lg:space-x-3">
            <div className="flex items-center space-x-1 lg:space-x-2 px-2 lg:px-4 py-1 lg:py-2 bg-green-500/10 rounded-full border border-green-400/20">
              <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-xs lg:text-sm font-medium">Online</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex max-w-7xl mx-auto p-4 lg:p-6 gap-4 lg:gap-6 h-[calc(100vh-120px)] flex-col lg:flex-row">
        {/* Avatar Section - Top on mobile, Left on desktop */}
        <div className="flex-1 bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden relative min-h-[300px] lg:min-h-0">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10"></div>
          <div className="relative z-10 h-full">
            <Avatar morphValues={morphValues} />
          </div>
        </div>
        
        {/* Chat Interface - Bottom on mobile, Right on desktop */}
        <div className="flex-1 bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden min-h-[400px] lg:min-h-0">
          <ChatInterface 
            onAudioStart={handleAudioStart}
            onAudioEnd={handleAudioEnd}
            onSimpleAnimation={startSimpleAnimation}
          />
        </div>
      </div>
      
      {/* Lip Sync Engine (invisible component) */}
      <LipSyncEngine 
        ref={lipSyncRef}
        onVisemeChange={handleVisemeChange}
      />
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { llmService } from '../services/llmService';
import { ttsService } from '../services/ttsService';
import AudioController from './AudioController';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatInterfaceProps {
  onAudioStart?: (audioElement: HTMLAudioElement) => void;
  onAudioEnd?: () => void;
  onSimpleAnimation?: (duration?: number) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  onAudioStart, 
  onAudioEnd, 
  onSimpleAnimation 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string>('');
  const [isTTSEnabled, setIsTTSEnabled] = useState(true);
  const [showTTSTest, setShowTTSTest] = useState(false);
  const [testText, setTestText] = useState("I'm here to support you through whatever you're experiencing. Remember, it's okay to not be okay, and seeking support shows great strength.");
  const [ttsProgress, setTtsProgress] = useState<{ current: number; total: number; chunk?: string } | null>(null);
  const [serviceStatus, setServiceStatus] = useState<string>('Unknown');

  // Initialize service status on component mount
  useEffect(() => {
    const initStatus = llmService.getServiceStatus();
    setServiceStatus(initStatus);
  }, []);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    try {
      // Call actual LLM API
      const response = await llmService.sendMessage(inputText);
      
      if (response.error) {
        // Handle error case
        const errorMessage: Message = {
          id: Date.now() + 1,
          text: `Error: ${response.error}`,
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      } else {
        // Handle successful response
        const aiMessage: Message = {
          id: Date.now() + 1,
          text: response.text,
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // Convert response to speech if TTS is enabled
        if (isTTSEnabled && response.text) {
          try {
            // Show progress for long texts
            const progressCallback = (current: number, total: number, chunk: string) => {
              if (total > 1) {
                setTtsProgress({ current, total, chunk });
              }
            };

            const ttsResponse = await ttsService.convertTextToSpeech(response.text, {}, progressCallback);
            
            // Clear progress indicator
            setTtsProgress(null);
            
            if (ttsResponse.audioUrl) {
              // Log chunking info if applicable
              if (ttsResponse.chunksProcessed && ttsResponse.totalChunks) {
                console.log(`✅ TTS completed: ${ttsResponse.chunksProcessed}/${ttsResponse.totalChunks} chunks processed`);
              }
              
              if (ttsResponse.audioUrl.startsWith('browser-tts://')) {
                // Handle browser TTS - start simple mouth animation
                startBrowserTTSAnimation(response.text);
              } else {
                // Handle normal audio URL
                setCurrentAudioUrl(ttsResponse.audioUrl);
              }
            } else if (ttsResponse.error) {
              console.warn('TTS Error:', ttsResponse.error);
            }
          } catch (ttsError) {
            console.error('TTS Error:', ttsError);
            setTtsProgress(null);
          }
        }
      }
    } catch (error) {
      // Handle unexpected errors
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an unexpected error. Please try again.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      console.error('Unexpected error in handleSendMessage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearHistory = () => {
    setMessages([]);
    llmService.clearHistory(); // Also clear the LLM service history
  };

  // Test LLM connection and update service status
  const testLLMConnection = async () => {
    try {
      console.log('🧪 Testing AI connections...');
      const isConnected = await llmService.testConnection();
      const status = llmService.getServiceStatus();
      setServiceStatus(status);
      
      if (isConnected) {
        alert(`✅ AI services are working perfectly!`);
      } else {
        alert(`⚠️ Using demo mode - AI services offline`);
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setServiceStatus('Error');
      alert('❌ Connection test failed!');
    }
  };

  // Test browser TTS with improved lip sync
  const testBrowserTTS = async () => {
    try {
      console.log('🧪 Testing Browser TTS...');
      const result = await ttsService.testBrowserTTS(testText);
      if (result.audioUrl?.startsWith('browser-tts://')) {
        startBrowserTTSAnimation(testText);
      }
    } catch (error) {
      console.error('Browser TTS test failed:', error);
    }
  };

  // Test Sarvam AI TTS
  const testSarvamTTS = async () => {
    try {
      console.log('🧪 Testing Sarvam AI TTS...');
      const result = await ttsService.convertTextToSpeech(testText, { speaker: 'meera' });
      if (result.audioUrl && !result.audioUrl.startsWith('browser-tts://')) {
        setCurrentAudioUrl(result.audioUrl);
      } else if (result.audioUrl?.startsWith('browser-tts://')) {
        startBrowserTTSAnimation(testText);
      }
    } catch (error) {
      console.error('Sarvam TTS test failed:', error);
    }
  };

  // Simple mouth animation for browser TTS
  const startBrowserTTSAnimation = (text: string) => {
    // Estimate duration based on text length (roughly 150 words per minute)
    const words = text.split(' ');
    const estimatedDuration = Math.max(2000, words.length * 400); // Minimum 2 seconds
    
    // Trigger the simple animation
    onSimpleAnimation?.(estimatedDuration);
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Modern Header */}
      <div className="px-4 lg:px-8 py-4 lg:py-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg lg:text-xl font-bold text-white">Mental Health Companion</h2>
              {(serviceStatus === 'Demo Mode' || serviceStatus === 'Error') && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {serviceStatus}
                </span>
              )}
            </div>
            <p className="text-emerald-200/70 text-xs lg:text-sm">Here to support and listen</p>
          </div>
          <div className="flex items-center space-x-2 lg:space-x-3">
            <button
              onClick={testLLMConnection}
              className="px-2 lg:px-4 py-1 lg:py-2 bg-green-500/10 hover:bg-green-500/20 rounded-xl text-green-400 border border-green-500/20 transition-all duration-200 text-xs lg:text-sm font-medium"
              title={`Test AI connection (${serviceStatus})`}
            >
              <span className="hidden sm:inline">Test</span>
              <span className="sm:hidden">✓</span>
            </button>
            <label className="flex items-center space-x-1 lg:space-x-2 px-2 lg:px-4 py-1 lg:py-2 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-200">
              <input
                type="checkbox"
                checked={isTTSEnabled}
                onChange={(e) => setIsTTSEnabled(e.target.checked)}
                className="rounded bg-white/10 border-white/20"
              />
              <span className="text-xs lg:text-sm text-purple-200 hidden sm:inline">Voice</span>
              <span className="text-xs lg:text-sm text-purple-200 sm:hidden">🔊</span>
            </label>
            <button
              onClick={clearHistory}
              className="px-2 lg:px-4 py-1 lg:py-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-400 border border-red-500/20 transition-all duration-200 text-xs lg:text-sm font-medium"
            >
              <span className="hidden sm:inline">Clear</span>
              <span className="sm:hidden">🗑</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area with Modern Styling */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="text-center mt-8 lg:mt-16">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
              <svg className="w-6 h-6 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-white mb-2">Welcome to Your Safe Space</h3>
            <p className="text-emerald-200/70 text-sm lg:text-base mb-4">I'm here to listen, support, and help you navigate your mental wellness journey.</p>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4 text-left">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-amber-200 font-medium text-sm mb-1">Important Note</h4>
                  <p className="text-amber-200/80 text-xs leading-relaxed">I'm an AI companion designed to provide emotional support and wellness guidance. For crisis situations, please contact emergency services or a mental health professional.</p>
                </div>
              </div>
            </div>
            <p className="text-emerald-200/60 text-sm">Share what's on your mind, and let's talk through it together.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
            >
              <div className={`max-w-xs lg:max-w-md xl:max-w-lg relative group ${message.sender === 'user' ? 'ml-8 lg:ml-12' : 'mr-8 lg:mr-12'}`}>
                {message.sender === 'ai' && (
                  <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mb-2">
                    <svg className="w-3 h-3 lg:w-4 lg:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                )}
                <div
                  className={`px-4 lg:px-6 py-3 lg:py-4 rounded-2xl backdrop-blur-sm ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                      : 'bg-white/10 text-white border border-white/10 shadow-lg shadow-black/20'
                  } transition-all duration-200 group-hover:scale-[1.02]`}
                >
                  <p className="text-sm lg:text-base leading-relaxed break-words">{message.text}</p>
                  <p className={`text-xs mt-2 ${message.sender === 'user' ? 'text-purple-100' : 'text-purple-200/70'}`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="mr-12">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-2">
                <svg className="w-4 h-4 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/10 px-6 py-4 rounded-2xl max-w-sm shadow-lg shadow-black/20">
                <div className="flex space-x-2 items-center">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-purple-200/70 text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {ttsProgress && (
          <div className="flex justify-start">
            <div className="mr-12">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mb-2">
                <svg className="w-4 h-4 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728m-5.657-2.829a3 3 0 010-4.243m-2.828-2.828a7 7 0 000 9.899" />
                </svg>
              </div>
              <div className="bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20 px-6 py-4 rounded-2xl max-w-sm shadow-lg shadow-black/20">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-200 text-sm font-medium">Generating Speech</span>
                    <span className="text-emerald-300 text-xs">{ttsProgress.current}/{ttsProgress.total}</span>
                  </div>
                  <div className="w-full bg-emerald-900/30 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-400 to-teal-400 h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${(ttsProgress.current / ttsProgress.total) * 100}%` }}
                    ></div>
                  </div>
                  {ttsProgress.chunk && (
                    <p className="text-emerald-200/70 text-xs truncate">
                      "{ttsProgress.chunk.substring(0, 40)}..."
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Audio Controller with Modern Design */}
      {currentAudioUrl && (
        <div className="p-6 border-t border-white/10 bg-white/5">
          <AudioController 
            audioUrl={currentAudioUrl}
            onAudioStart={(audioElement) => onAudioStart?.(audioElement)}
            onAudioEnd={() => {
              setCurrentAudioUrl('');
              onAudioEnd?.();
            }}
            volume={0.8}
          />
        </div>
      )}

      {/* TTS Testing Panel */}
      <div className="border-t border-white/10 bg-black/10 backdrop-blur-sm">
        <button 
          onClick={() => setShowTTSTest(!showTTSTest)}
          className="w-full p-3 text-left text-purple-300 hover:text-white hover:bg-white/5 transition-all duration-200 flex items-center justify-between"
        >
          <span className="text-sm font-medium">🧪 TTS Testing Panel</span>
          <svg 
            className={`w-4 h-4 transition-transform duration-200 ${showTTSTest ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showTTSTest && (
          <div className="p-4 border-t border-white/5">
            <div className="space-y-4">
              {/* Test Text Input */}
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">Test Text</label>
                <textarea
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-200/50 text-sm resize-none"
                  rows={3}
                  placeholder="Enter text to test TTS..."
                />
              </div>
              
              {/* Test Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={testBrowserTTS}
                  className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-sm border border-blue-500/30 transition-all duration-200"
                >
                  🌐 Test Browser TTS
                </button>
                <button
                  onClick={testSarvamTTS}
                  className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg text-sm border border-green-500/30 transition-all duration-200"
                >
                  🎤 Test Sarvam AI
                </button>
                <button
                  onClick={() => setTestText("I'm here to listen and support you through whatever you're experiencing. Remember, your feelings are valid, and it's okay to take things one step at a time.")}
                  className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-sm border border-emerald-500/30 transition-all duration-200"
                >
                  � Load Sample
                </button>
              </div>
              
              {/* Voice Information */}
              <div className="text-xs text-purple-200/70">
                💡 <strong>Browser TTS</strong>: Uses improved lip sync timing with longer gaps between words.
                <br />
                🎯 <strong>Sarvam AI</strong>: High-quality Indian TTS with natural voice synthesis.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modern Input Area */}
      <div className="p-4 lg:p-6 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="flex space-x-2 lg:space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what's on your mind... I'm here to listen"
              className="w-full px-4 lg:px-6 py-3 lg:py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-emerald-200/50 transition-all duration-200 text-sm lg:text-base"
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputText.trim()}
            className="px-4 lg:px-8 py-3 lg:py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-emerald-500/20 font-medium"
          >
            {isLoading ? (
              <svg className="w-4 h-4 lg:w-5 lg:h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
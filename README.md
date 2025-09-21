# 🤖 LLM Avatar Chat

An immersive 3D avatar chat application that brings AI conversations to life through realistic avatars with synchronized lip movements and natural text-to-speech capabilities.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript)
![Three.js](https://img.shields.io/badge/Three.js-Latest-000000?logo=three.js)

## 🌟 Features

- **🎭 3D Avatar Integration**: Realistic 3D avatars using Three.js and React Three Fiber
- **🗣️ Lip Sync Technology**: Advanced lip synchronization with audio using custom algorithms
- **🧠 AI-Powered Conversations**: Integration with Large Language Models for intelligent responses
- **🔊 High-Quality TTS**: Multiple TTS providers including ElevenLabs and Sarvam AI
- **⚡ Real-time Communication**: Seamless real-time chat experience
- **🎨 Modern UI/UX**: Clean, responsive design built with Tailwind CSS
- **📱 Cross-Platform**: Works across desktop and mobile devices

## 🚀 Live Demo

**🌐 [View Live Application](https://genaihacks-43vp6h1a2-liltimothy64s-projects.vercel.app)**

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest React with modern hooks and concurrent features
- **TypeScript** - Type-safe development experience
- **Vite** - Lightning-fast build tool and development server
- **Three.js** - 3D graphics and WebGL rendering
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Useful helpers for React Three Fiber

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS processing and optimization

### AI & Audio
- **ElevenLabs API** - Premium text-to-speech services
- **Sarvam AI** - Alternative TTS provider
- **Custom Lip Sync Engine** - Proprietary audio-visual synchronization
- **Web Audio API** - Real-time audio processing and analysis

### Deployment & Infrastructure
- **Vercel** - Serverless deployment platform
- **Vercel Functions** - API endpoints and proxy services

## 📋 Prerequisites

Before running this application, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **API Keys** for:
  - ElevenLabs API
  - Sarvam AI (optional)

## ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/LILTIMOTHY64/GENAIHACKS.git
   cd llm-avatar-chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the root directory:
   ```env
   # ElevenLabs Configuration
   VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   ELEVENLABS_VOICE_ID=your_preferred_voice_id
   
   # Sarvam AI Configuration (Optional)
   VITE_SARVAM_API_KEY=your_sarvam_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173` to see the application running.

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── Avatar.tsx       # 3D avatar component
│   ├── ChatInterface.tsx # Chat UI component
│   ├── AudioController.tsx # Audio management
│   └── LipSyncEngine.tsx # Lip synchronization logic
├── services/            # API and external services
│   ├── llmService.ts    # LLM integration
│   └── ttsService.ts    # Text-to-speech services
├── utils/               # Utility functions
│   └── audioAnalyzer.ts # Audio processing utilities
├── assets/              # Static assets
└── styles/              # CSS and styling files

api/
└── proxy.js            # Vercel serverless functions

public/
└── models/             # 3D model files
    └── avatar.glb      # 3D avatar model
```

## 🎯 Key Components

### Avatar System
- **3D Model Loading**: Efficient GLB/GLTF model loading and rendering
- **Animation Controller**: Smooth animation transitions and states
- **Facial Animation**: Morph targets for realistic facial expressions

### Lip Sync Engine
- **Audio Analysis**: Real-time frequency analysis of speech audio
- **Phoneme Detection**: Advanced algorithms for speech-to-viseme mapping
- **Smooth Interpolation**: Natural lip movement transitions

### Chat Interface
- **Real-time Messaging**: Instant message handling and display
- **Typing Indicators**: Visual feedback for ongoing conversations
- **Message History**: Persistent chat history management

## 🔧 Configuration

### Audio Settings
Customize audio processing in `src/utils/audioAnalyzer.ts`:
```typescript
const audioConfig = {
  sampleRate: 44100,
  bufferSize: 2048,
  smoothingTimeConstant: 0.3
};
```

### Avatar Customization
Modify avatar behavior in `src/components/Avatar.tsx`:
```typescript
const avatarConfig = {
  idleAnimation: 'idle',
  talkingAnimation: 'talking',
  expressionBlendTime: 0.2
};
```

## 🚀 Deployment

The application is automatically deployed to Vercel on every push to the main branch.

### Manual Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

### Environment Variables
Set the following environment variables in your Vercel dashboard:
- `VITE_ELEVENLABS_API_KEY`
- `VITE_SARVAM_API_KEY`
- `ELEVENLABS_VOICE_ID`

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Three.js Community** for excellent 3D web graphics
- **React Team** for the powerful React framework
- **ElevenLabs** for high-quality text-to-speech API
- **Vercel** for seamless deployment platform

## 📞 Support & Contact

If you have any questions or need support:

- 🐛 **Issues**: [GitHub Issues](https://github.com/LILTIMOTHY64/GENAIHACKS/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/LILTIMOTHY64/GENAIHACKS/discussions)
- 📧 **Email**: Contact through GitHub profile

---

<div align="center">
  <strong>Made with ❤️ and cutting-edge technology</strong>
</div>
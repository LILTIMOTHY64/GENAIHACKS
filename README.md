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
- **🔊 High-Quality TTS**: Multiple TTS providers including ElevenLabs and Sarvam AI with automatic text chunking
- **📚 RAG System**: Retrieval-Augmented Generation with mental health knowledge base
- **🤖 Local AI Support**: Optional Ollama integration for private, local AI inference  
- **🔍 Semantic Search**: Vector-based document retrieval for contextually relevant responses
- **⚡ Real-time Communication**: Seamless real-time chat experience
- **🎨 Modern UI/UX**: Clean, responsive design built with Tailwind CSS
- **📱 Cross-Platform**: Works across desktop and mobile devices

## 🚀 Live Demo

**🌐 [View Live Application](https://genaihacks.vercel.app/)**

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest React with modern hooks and concurrent features
- **TypeScript** - Type-safe development experience
- **Vite** - Lightning-fast build tool and development server
- **Three.js** - 3D graphics and WebGL rendering
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Useful helpers for React Three Fiber

### Backend & AI Infrastructure
- **FastAPI** - Modern Python web framework for API development
- **LangChain** - Framework for building LLM-powered applications
- **Ollama** - Local LLM inference with custom mental health model
- **ChromaDB** - Vector database for document storage and retrieval
- **HuggingFace Transformers** - Sentence embedding models for semantic search
- **Pandas** - Data preprocessing and manipulation
- **RAG (Retrieval-Augmented Generation)** - Context-aware AI responses

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

### Frontend Requirements
- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **API Keys** for:
  - ElevenLabs API
  - Sarvam AI (optional)

### Backend Requirements (Optional - for local AI)
- **Python** (v3.8 or higher)
- **Ollama** - For running local LLM models
- **Data CSV** - Mental health conversation dataset in `data/data.csv`
- **System Requirements**: 8GB+ RAM recommended for local AI inference

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

backend/                 # Python backend services
├── api.py              # FastAPI server and endpoints
├── data_preprocessing.py # Data cleaning and chunking
├── vectorization.py     # Document embedding and vector storage
└── retrieval_aug.py    # RAG chain setup and LLM integration

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

### Backend AI System
- **RAG Architecture**: Retrieval-Augmented Generation for context-aware responses
- **Mental Health Model**: Custom Ollama model (`final:latest`) trained for psychology support
- **Vector Search**: Semantic similarity search using ChromaDB and HuggingFace embeddings
- **Document Processing**: Intelligent text chunking and preprocessing pipeline
- **FastAPI Server**: High-performance async API with CORS support

## 🧠 Backend Architecture

The backend implements a sophisticated RAG (Retrieval-Augmented Generation) system for delivering contextually relevant mental health support:

### 📊 Data Processing Pipeline (`data_preprocessing.py`)
```python
def preprocess():
    # Clean and normalize text data
    # Chunk documents with overlap for better retrieval
    # Structure data with metadata for enhanced search
```

**Features:**
- Text cleaning and normalization
- Smart chunking with 500-word segments and 50-word overlap
- Metadata preservation for source tracking
- CSV data ingestion and processing

### 🔍 Vector Storage (`vectorization.py`)
```python
def vectorize_documents(documents):
    # Create embeddings using HuggingFace models
    # Store in ChromaDB for fast retrieval
    # Enable semantic similarity search
```

**Features:**
- HuggingFace sentence-transformers embeddings (`all-MiniLM-L6-v2`)
- ChromaDB persistent vector storage
- Optimized for CPU inference
- Document-metadata linking

### 🤖 AI Integration (`retrieval_aug.py`)
```python
def create_retrieval_chain(vectorstore):
    # Setup Ollama LLM with custom mental health model
    # Configure retrieval with similarity search
    # Return structured responses with sources
```

**Features:**
- Custom Ollama model for mental health psychology
- Retrieval-based context injection
- Source document tracking
- Empathetic response templates

### 🚀 API Server (`api.py`)
```python
@app.post("/chat")
async def chat_endpoint(question: Question):
    # Process user queries through RAG pipeline
    # Return structured responses with sources
    # Handle errors gracefully
```

**Features:**
- FastAPI async endpoints
- CORS-enabled for frontend integration
- Structured error handling
- Request/response validation with Pydantic
- Source document attribution

### 🏃‍♂️ Running the Backend

```bash
# Install Python dependencies
pip install fastapi uvicorn langchain langchain-community langchain-ollama chromadb sentence-transformers pandas

# Start the FastAPI server
cd backend
uvicorn api:app --reload --host 0.0.0.0 --port 8000

# Backend will be available at http://localhost:8000
# API docs at http://localhost:8000/docs
```

### 📊 Data Requirements

The backend expects a CSV file at `data/data.csv` with the following structure:
```csv
Context,Response
"User expressing anxiety about work","I understand that work anxiety can be overwhelming. Let's explore some coping strategies..."
"Someone feeling depressed","It's important to acknowledge these feelings. Depression is treatable..."
```

**Required Columns:**
- `Context`: The user's question or situation description
- `Response`: The appropriate therapeutic response

**Data Preprocessing:**
- Text is automatically cleaned and normalized
- Long responses are chunked into 500-word segments with 50-word overlap
- Metadata is preserved for source attribution

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
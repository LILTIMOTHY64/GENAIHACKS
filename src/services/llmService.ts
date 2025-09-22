// LLM Service for connecting to hosted Ollama instance

export interface LLMResponse {
  text: string;
  error?: string;
}

export interface LLMRequest {
  query: string;
  context?: string[];
}

class LLMService {
  private baseUrl = 'https://446d219732b2.ngrok-free.app'; // Use ngrok endpoint
  private groqApiKey = import.meta.env.VITE_GROQ_API_KEY || '';
  private groqBaseUrl = 'https://api.groq.com/openai/v1/chat/completions';
  private conversationHistory: string[] = [];
  private useMockResponse = false; // Fallback for when service is down
  
  // System prompt for mental health support
  private systemPrompt = `You are a compassionate and professional mental health companion AI. Your role is to:
- Provide empathetic, supportive, and non-judgmental responses
- Offer practical coping strategies and mental wellness guidance
- Listen actively and validate the user's feelings and experiences
- Encourage professional help when appropriate
- Maintain appropriate boundaries as an AI assistant
- Use a warm, understanding, and encouraging tone
- Do not use emojis or special characters in your responses whatsoever
Remember: You are not a replacement for professional therapy, but a supportive companion for mental wellness conversations. Always prioritize the user's safety and well-being.`;

  async sendMessage(query: string): Promise<LLMResponse> {
    // If we're in mock mode, return a mock response
    if (this.useMockResponse) {
      return {
        text: `Mock response to: "${query}". The LLM service appears to be offline, but the TTS and lip sync features are still working!`
      };
    }

    // First try the primary ngrok endpoint
    try {
      const response = await this.sendToNgrokApi(query);
      if (response.text && !response.error) {
        return response;
      }
    } catch (error) {
      console.warn('Primary API failed, trying Groq fallback:', error);
    }

    // Fallback to Groq if primary service fails
    if (this.groqApiKey) {
      try {
        console.log('🔄 Using Groq fallback...');
        return await this.sendToGroqApi(query);
      } catch (error) {
        console.warn('Groq fallback failed, using demo mode');
      }
    }

    // Final fallback to mock response
    console.log('📱 Demo mode active');
    this.useMockResponse = true;
    return {
      text: `I'm having trouble connecting to the AI services right now. Let me switch to demo mode! You asked: "${query}" - This is a demo response to show that the TTS and lip sync features work even when the LLM is offline.`
    };
  }

  private async sendToNgrokApi(query: string): Promise<LLMResponse> {
    // Add the current query to conversation history
    this.conversationHistory.push(`User: ${query}`);
    
    // Keep only last 10 messages for context
    if (this.conversationHistory.length > 10) {
      this.conversationHistory = this.conversationHistory.slice(-10);
    }

    const response = await fetch(`${this.baseUrl}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Add AI response to conversation history
    let responseText = '';
    if (data.response) {
      responseText = data.response;
    } else if (data.text) {
      responseText = data.text;
    } else if (data.message) {
      responseText = data.message;
    } else {
      throw new Error('Invalid response format from ngrok API');
    }
    
    this.conversationHistory.push(`AI: ${responseText}`);
    return { text: responseText };
  }

  private async sendToGroqApi(query: string): Promise<LLMResponse> {
    // Build conversation context for Groq
    const messages = [
      {
        role: "system",
        content: this.systemPrompt
      }
    ];

    // Add conversation history as context (last 8 messages to stay within token limits)
    const recentHistory = this.conversationHistory.slice(-8);
    for (const entry of recentHistory) {
      if (entry.startsWith('User: ')) {
        messages.push({
          role: "user",
          content: entry.substring(6) // Remove "User: " prefix
        });
      } else if (entry.startsWith('AI: ')) {
        messages.push({
          role: "assistant",
          content: entry.substring(4) // Remove "AI: " prefix
        });
      }
    }

    // Add current query
    messages.push({
      role: "user",
      content: query
    });

    const response = await fetch(this.groqBaseUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemma2-9b-it",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 0.9,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Groq API error! status: ${response.status}, message: ${errorData}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from Groq API');
    }

    const responseText = data.choices[0].message.content;
    
    // Update conversation history
    this.conversationHistory.push(`User: ${query}`);
    this.conversationHistory.push(`AI: ${responseText}`);
    
    // Keep only last 10 messages for context
    if (this.conversationHistory.length > 10) {
      this.conversationHistory = this.conversationHistory.slice(-10);
    }

    return { text: responseText };
  }

  // Clear conversation history
  clearHistory(): void {
    this.conversationHistory = [];
  }

  // Get conversation history (useful for debugging or export features)
  getHistory(): string[] {
    return [...this.conversationHistory];
  }

  // Test connection to both services
  async testConnection(): Promise<boolean> {
    console.log('🔗 Testing AI services...');
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: "test connection"
        })
      });
      
      if (response.ok) {
        this.useMockResponse = false;
        console.log('✅ Primary service active');
        return true;
      } else {
        console.log('⚠️ Primary service unavailable');
      }
    } catch (error) {
      console.log('⚠️ Primary service offline');
    }

    // Test Groq fallback
    if (this.groqApiKey) {
      console.log('🔄 Testing Groq fallback...');
      try {
        const response = await fetch(this.groqBaseUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.groqApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gemma2-9b-it",
            messages: [
              {
                role: "system",
                content: this.systemPrompt
              },
              {
                role: "user",
                content: "test connection"
              }
            ],
            temperature: 0.7,
            max_tokens: 50
          })
        });
        
        if (response.ok) {
          console.log('✅ Groq fallback ready');
          return true;
        } else {
          console.log('❌ Groq service failed');
        }
      } catch (error) {
        console.log('❌ Groq service unavailable');
      }
    } else {
      console.log('⚠️ No Groq API key - limited fallback available');
    }

    console.log('📱 Demo mode available');
    return false;
  }

  // Enable/disable mock mode manually
  setMockMode(enabled: boolean): void {
    this.useMockResponse = enabled;
  }

  // Get current service status
  getServiceStatus(): string {
    if (this.useMockResponse) {
      return 'Demo Mode';
    }
    if (this.groqApiKey) {
      return 'AI Ready';
    }
    return 'Primary';
  }

  // Check if Groq is available
  isGroqAvailable(): boolean {
    return !!this.groqApiKey;
  }

  // Force use of Groq for testing
  async testGroqConnection(): Promise<LLMResponse> {
    if (!this.groqApiKey) {
      return { 
        text: '', 
        error: 'Groq API key not found' 
      };
    }
    
    try {
      return await this.sendToGroqApi('Hello, this is a connection test.');
    } catch (error) {
      return { 
        text: '', 
        error: `Groq test failed: ${error}` 
      };
    }
  }
}

// Export a singleton instance
export const llmService = new LLMService();
export default llmService;
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
  private conversationHistory: string[] = [];
  private useMockResponse = false; // Fallback for when service is down

  async sendMessage(query: string): Promise<LLMResponse> {
    // If we're in mock mode, return a mock response
    if (this.useMockResponse) {
      return {
        text: `Mock response to: "${query}". The LLM service appears to be offline, but the TTS and lip sync features are still working!`
      };
    }

    try {
      // Add the current query to conversation history
      this.conversationHistory.push(`User: ${query}`);
      
      // Keep only last 10 messages for context (as per PRD requirements)
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-10);
      }

      // Use ngrok endpoint with the correct format
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
      
      // Add AI response to conversation history (handle various response formats)
      if (data.response) {
        this.conversationHistory.push(`AI: ${data.response}`);
        return { text: data.response };
      } else if (data.text) {
        this.conversationHistory.push(`AI: ${data.text}`);
        return { text: data.text };
      } else if (data.message) {
        this.conversationHistory.push(`AI: ${data.message}`);
        return { text: data.message };
      } else {
        throw new Error('Invalid response format from ngrok API');
      }
      
    } catch (error) {
      console.error('Error calling LLM API:', error);
      
      // Enable mock mode for subsequent requests on connection error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        this.useMockResponse = true;
        return {
          text: `I'm having trouble connecting to the AI service right now. Let me switch to demo mode! You asked: "${query}" - This is a demo response to show that the TTS and lip sync features work even when the LLM is offline.`
        };
      } else if (error instanceof Error && error.message.includes('HTTP error')) {
        return {
          text: '',
          error: `Server error: ${error.message}`
        };
      } else {
        return {
          text: '',
          error: 'An unexpected error occurred while processing your request.'
        };
      }
    }
  }

  // Clear conversation history
  clearHistory(): void {
    this.conversationHistory = [];
  }

  // Get conversation history (useful for debugging or export features)
  getHistory(): string[] {
    return [...this.conversationHistory];
  }

  // Test connection to the ngrok service
  async testConnection(): Promise<boolean> {
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
      
      const success = response.ok;
      if (success) {
        this.useMockResponse = false; // Re-enable real service if it's working
        console.log('Connection test successful');
      } else {
        console.warn('Connection test failed with status:', response.status);
      }
      return success;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  // Enable/disable mock mode manually
  setMockMode(enabled: boolean): void {
    this.useMockResponse = enabled;
  }
}

// Export a singleton instance
export const llmService = new LLMService();
export default llmService;
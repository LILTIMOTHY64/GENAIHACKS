// Test script to verify Groq fallback functionality
import { llmService } from './src/services/llmService.js';

console.log('🧪 Testing LLM Service with Groq Fallback...\n');

async function testServices() {
  console.log('1️⃣ Testing service status...');
  console.log(`Current service status: ${llmService.getServiceStatus()}`);
  console.log(`Groq available: ${llmService.isGroqAvailable()}`);
  
  console.log('\n2️⃣ Testing connection to both services...');
  const connectionResult = await llmService.testConnection();
  console.log(`Connection test result: ${connectionResult ? '✅ Success' : '❌ Failed'}`);
  
  console.log('\n3️⃣ Testing Groq directly...');
  try {
    const groqResult = await llmService.testGroqConnection();
    if (groqResult.error) {
      console.log(`❌ Groq test failed: ${groqResult.error}`);
    } else {
      console.log(`✅ Groq test successful: "${groqResult.text.substring(0, 100)}..."`);
    }
  } catch (error) {
    console.log(`❌ Groq test error: ${error}`);
  }
  
  console.log('\n4️⃣ Testing actual conversation...');
  try {
    const response = await llmService.sendMessage("Hello, I'm feeling anxious about an upcoming presentation. Can you help?");
    if (response.error) {
      console.log(`❌ Conversation failed: ${response.error}`);
    } else {
      console.log(`✅ Conversation successful!`);
      console.log(`Response length: ${response.text.length} characters`);
      console.log(`Response preview: "${response.text.substring(0, 200)}..."`);
      console.log(`Final service status: ${llmService.getServiceStatus()}`);
    }
  } catch (error) {
    console.log(`❌ Conversation error: ${error}`);
  }
  
  console.log('\n5️⃣ Testing conversation history...');
  const history = llmService.getHistory();
  console.log(`History entries: ${history.length}`);
  history.forEach((entry, i) => {
    console.log(`  ${i + 1}. ${entry.substring(0, 50)}...`);
  });
  
  console.log('\n🏁 Test completed!');
}

// Run the test
testServices().catch(console.error);
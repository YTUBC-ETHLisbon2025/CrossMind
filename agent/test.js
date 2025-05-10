// Simple test script to verify Claude API connectivity
require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

// Check if API key is set
if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
  console.error('Error: ANTHROPIC_API_KEY not set in environment variables');
  console.error('Please set a valid Anthropic API key in the .env file');
  process.exit(1);
}

async function testClaudeAPI() {
  console.log('Testing Claude API connection...');
  
  try {
    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    
    console.log('Sending test message to Claude...');
    
    // Send a simple message to Claude
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 100,
      messages: [
        { role: 'user', content: 'Hello Claude! This is a test message. Please respond with a simple greeting.' }
      ]
    });
    
    // Extract text from the response
    const responseText = response.content
      .filter(content => content.type === 'text')
      .map(content => content.text)
      .join('\n');
    
    console.log('\nSuccess! Received response from Claude:');
    console.log('-----------------------------------------');
    console.log(responseText);
    console.log('-----------------------------------------');
    console.log('\nAPI connection is working correctly!');
    
  } catch (error) {
    console.error('Error connecting to Claude API:', error);
    console.error('\nAPI connection failed. Please check your API key and network connection.');
  }
}

// Run the test
testClaudeAPI(); 
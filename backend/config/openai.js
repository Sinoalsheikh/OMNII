console.log('Environment Variables in openai.js:', process.env); // Log all environment variables for debugging
const OpenAI = require('openai');

const validateApiKey = (key) => {
  if (!key) {
    throw new Error('OPENAI_API_KEY environment variable is not defined');
  }
  return key;
};

// Initialize OpenAI client
console.log('Environment Variables in openai.js:', process.env); // Log all environment variables for debugging
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY); // Log the API key for debugging
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000, // 30 second timeout
  maxRetries: 3
});

// Test the configuration
const testConfig = async () => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not defined');
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'system', content: 'Test connection' }],
      max_tokens: 5,
      temperature: 0
    });

    if (response && response.choices && response.choices.length > 0) {
      console.log('OpenAI configuration validated successfully');
      return true;
    }
    throw new Error('Invalid response from OpenAI API');
  } catch (error) {
    if (error.response) {
      console.error('OpenAI API error:', error.response.data.error.message);
    } else {
      console.error('OpenAI configuration error:', error.message);
    }
    return false;
  }
};

// Export both the client and the test function
module.exports = { openai, testConfig };

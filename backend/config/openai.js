const OpenAI = require('openai');

const validateApiKey = (key) => {
  if (!key) {
    throw new Error('OPENAI_API_KEY environment variable is not defined');
  }
  // Return the key as-is without validation since we're using a project key
  return key;
};

// Use the API key directly
const apiKey = process.env.OPENAI_API_KEY || '';

const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: 'https://api.projectopenai.com/v1',
  timeout: 30000, // 30 second timeout
  maxRetries: 3,
  defaultHeaders: {
    'OpenAI-Beta': 'assistants=v1'
  }
});

// Test the configuration
const testConfig = async () => {
  try {
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

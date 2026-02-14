const axios = require('axios');

/**
 * Appeler API Claude (Anthropic)
 */
async function callClaudeAPI(prompt, options = {}) {
  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: options.model || 'claude-sonnet-4-20250514',
        max_tokens: options.maxTokens || 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    );
    
    const content = response.data.content[0].text;
    
    return {
      ...content,
      usage: response.data.usage
    };
    
  } catch (error) {
    console.error('Erreur API Claude:', error.response?.data || error.message);
    throw new Error('Erreur lors de l\'appel à l\'IA');
  }
}

module.exports = {
  callClaudeAPI
};
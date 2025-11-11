const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Extract filters from natural language
async function extractFiltersFromText(userMessage, conversationHistory = []) {
  try {
    const systemPrompt = `You are a real estate assistant. Extract property search criteria from user messages.
Return ONLY a valid JSON object with these fields (use null for missing values):
{
  "budget": number or null,
  "location": string or null,
  "bedrooms": number or null,
  "bathrooms": number or null,
  "minSize": number or null,
  "maxSize": number or null,
  "amenities": string (comma-separated) or null,
  "intent": "search" | "compare" | "save" | "help" | "general"
}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: userMessage }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      temperature: 0.3,
      max_tokens: 200,
    });

    const responseText = completion.choices[0].message.content.trim();
    
    // Try to extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return { intent: 'general' };
  } catch (error) {
    console.error('NLP Error:', error);
    return { intent: 'general' };
  }
}

// Generate intelligent chatbot response
async function generateChatResponse(userMessage, context = {}) {
  try {
    const systemPrompt = `You are AgentMeera, a friendly and helpful real estate assistant. 
You help users find their dream properties. Be conversational, helpful, and concise.
If properties are found, mention the count. If no properties found, suggest adjusting filters.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    if (context.propertiesFound) {
      messages.push({
        role: 'assistant',
        content: `Found ${context.propertiesFound} properties matching the criteria.`
      });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      temperature: 0.7,
      max_tokens: 150,
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Chat Response Error:', error);
    return "I'm here to help you find your dream property! Use the filters or describe what you're looking for.";
  }
}

module.exports = {
  extractFiltersFromText,
  generateChatResponse,
};
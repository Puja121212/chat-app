const { GoogleGenerativeAI } = require('@google/generative-ai');
const Message = require('../models/Message');

// Fallback suggestions when API key is invalid
const getFallbackSuggestions = (currentMessage) => {
  const message = currentMessage.toLowerCase();
  
  if (message.includes('hello') || message.includes('hi')) {
    return ['Hello! How are you?', 'Hi there!', 'Hey! What\'s up?', 'Hello! Nice to meet you'];
  } else if (message.includes('how are you')) {
    return ['I\'m doing great, thanks!', 'I\'m fine, how about you?', 'Pretty good!', 'All good here!'];
  } else if (message.includes('bye') || message.includes('goodbye')) {
    return ['Goodbye! Take care!', 'See you later!', 'Bye bye!', 'Have a great day!'];
  } else if (message.includes('thank')) {
    return ['You\'re welcome!', 'No problem!', 'My pleasure!', 'Happy to help!'];
  } else if (message.includes('what') || message.includes('how') || message.includes('why')) {
    return ['That\'s a good question!', 'Let me think about that...', 'Interesting point!', 'I\'m not sure about that'];
  } else {
    return ['That sounds interesting!', 'Tell me more!', 'I see what you mean', 'That\'s cool!'];
  }
};

// Fallback completions when API key is invalid
const getFallbackCompletions = (partialMessage) => {
  const message = partialMessage.toLowerCase();
  
  if (message.includes('hello')) {
    return ['hello there!', 'hello! how are you?'];
  } else if (message.includes('how are')) {
    return ['how are you doing?', 'how are you feeling?'];
  } else if (message.includes('what are')) {
    return ['what are you up to?', 'what are you doing?'];
  } else if (message.includes('i am')) {
    return ['i am doing great', 'i am fine, thanks'];
  } else if (message.includes('thank')) {
    return ['thank you so much', 'thank you very much'];
  } else {
    return [partialMessage + '!', partialMessage + '?', partialMessage + '...'];
  }
};

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get smart reply suggestions
const getSmartReplies = async (req, res) => {
  try {
    const { currentMessage, chatHistory, context } = req.body;

    if (!currentMessage) {
      return res.status(400).json({ message: 'Current message is required' });
    }

    // Check if API key is valid
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_CORRECT_VALID_API_KEY' || process.env.GEMINI_API_KEY ) {
      // Return fallback suggestions when API key is invalid
      const fallbackSuggestions = getFallbackSuggestions(currentMessage);
      return res.json({
        suggestions: fallbackSuggestions,
        success: true,
        fallback: true
      });
    }

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Create context-aware prompt
    let prompt = `You are a helpful chat assistant. Based on the current message, provide 3-4 smart reply suggestions that are natural, friendly, and contextually appropriate.

Current message: "${currentMessage}"

Context: ${context || 'Casual conversation'}

Recent chat history: ${chatHistory ? chatHistory.slice(-5).map(msg => `${msg.senderName}: ${msg.content}`).join('\n') : 'No recent history'}

Please provide suggestions in JSON format like this:
{
  "suggestions": [
    "Reply 1",
    "Reply 2", 
    "Reply 3",
    "Reply 4"
  ]
}

Keep suggestions:
- Natural and conversational
- Contextually relevant
- Not too long (under 50 characters each)
- Appropriate for the given context`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the response
    let suggestions;
    try {
      // Try to parse as JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: extract suggestions from text
        const lines = text.split('\n').filter(line => line.trim());
        suggestions = {
          suggestions: lines.slice(0, 4).map(line => line.replace(/^\d+\.\s*/, '').trim()).filter(s => s.length > 0)
        };
      }
    } catch (parseError) {
      // If parsing fails, create fallback suggestions
      suggestions = {
        suggestions: [
          "That's interesting!",
          "Tell me more about that.",
          "I see what you mean.",
          "Thanks for sharing!"
        ]
      };
    }

    res.json({
      suggestions: suggestions.suggestions || [
        "That's interesting!",
        "Tell me more about that.",
        "I see what you mean.",
        "Thanks for sharing!"
      ]
    });

  } catch (error) {
    console.error('AI Smart Replies Error:', error);
    res.status(500).json({ 
      message: 'Failed to generate smart replies',
      suggestions: [
        "That's interesting!",
        "Tell me more about that.",
        "I see what you mean.",
        "Thanks for sharing!"
      ]
    });
  }
};

// Auto-complete message
const autoCompleteMessage = async (req, res) => {
  try {
    const { partialMessage, context } = req.body;

    if (!partialMessage) {
      return res.status(400).json({ message: 'Partial message is required' });
    }

    // Check if API key is valid
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_CORRECT_VALID_API_KEY' || process.env.GEMINI_API_KEY === 'AIzaSyD-tOwEzi9qCEUXT7S-jBF601kkawO7IX8') {
      // Return fallback completions when API key is invalid
      const fallbackCompletions = getFallbackCompletions(partialMessage);
      return res.json({
        completions: fallbackCompletions,
        success: true,
        fallback: true
      });
    }

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Create completion prompt
    const prompt = `You are a helpful message completion assistant. Complete the following partial message in a natural, conversational way.

Partial message: "${partialMessage}"
Context: ${context || 'Casual conversation'}

Please provide 2-3 natural completions in JSON format:
{
  "completions": [
    "Completion 1",
    "Completion 2",
    "Completion 3"
  ]
}

Keep completions:
- Natural and conversational
- Contextually appropriate
- Not too long (complete the thought naturally)
- Different from each other`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the response
    let completions;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        completions = JSON.parse(jsonMatch[0]);
      } else {
        const lines = text.split('\n').filter(line => line.trim());
        completions = {
          completions: lines.slice(0, 3).map(line => line.replace(/^\d+\.\s*/, '').trim()).filter(c => c.length > 0)
        };
      }
    } catch (parseError) {
      completions = {
        completions: [
          partialMessage + "...",
          partialMessage + "!",
          partialMessage + "?"
        ]
      };
    }

    res.json({
      completions: completions.completions || [
        partialMessage + "...",
        partialMessage + "!",
        partialMessage + "?"
      ]
    });

  } catch (error) {
    console.error('AI Auto-complete Error:', error);
    res.status(500).json({
      message: 'Failed to generate auto-completions',
      completions: [
        (req.body.partialMessage || "Type something") + "...",
        (req.body.partialMessage || "Type something") + "!",
        (req.body.partialMessage || "Type something") + "?"
      ]
    });
  }
};

// Context-aware response
const getContextualResponse = async (req, res) => {
  try {
    const { message, chatHistory, userProfile } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Create contextual prompt
    const prompt = `You are a helpful chat assistant. Provide a contextual response to the given message based on the conversation history and user profile.

Message: "${message}"
User Profile: ${userProfile ? `Name: ${userProfile.username}, Online: ${userProfile.isOnline}` : 'Unknown user'}

Recent Chat History: ${chatHistory ? chatHistory.slice(-10).map(msg => `${msg.senderName}: ${msg.content}`).join('\n') : 'No recent history'}

Please provide a helpful, contextual response in JSON format:
{
  "response": "Your contextual response here",
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}

Keep the response:
- Helpful and relevant
- Not too long (under 100 characters)
- Natural and conversational
- Appropriate for the context`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the response
    let responseData;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        responseData = JSON.parse(jsonMatch[0]);
      } else {
        responseData = {
          response: text.trim(),
          suggestions: ["That's interesting!", "Tell me more", "I understand"]
        };
      }
    } catch (parseError) {
      responseData = {
        response: "I understand what you're saying.",
        suggestions: ["That's interesting!", "Tell me more", "I understand"]
      };
    }

    res.json(responseData);

  } catch (error) {
    console.error('AI Contextual Response Error:', error);
    res.status(500).json({ 
      message: 'Failed to generate contextual response',
      response: "I understand what you're saying.",
      suggestions: ["That's interesting!", "Tell me more", "I understand"]
    });
  }
};

module.exports = {
  getSmartReplies,
  autoCompleteMessage,
  getContextualResponse
};

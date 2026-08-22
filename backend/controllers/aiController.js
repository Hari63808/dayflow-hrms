const { generateAIResponse } = require('../services/geminiService');

// @desc    Process AI Chatbot message
// @route   POST /api/ai/chat
// @access  Private
const chatWithAI = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message text is required.' });
    }

    const reply = await generateAIResponse(message, history || []);

    return res.json({
      success: true,
      reply,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process AI chat message.',
      reply: 'I am having trouble connecting to AI services right now. Please try again shortly.'
    });
  }
};

module.exports = {
  chatWithAI
};

const { generateAIResponse } = require('../services/geminiService');
const { chatWithAI } = require('../controllers/aiController');

async function testAIChatbot() {
  console.log('=================================================');
  console.log('TESTING DAYFLOW AI ASSISTANT SERVICE & CONTROLLER');
  console.log('=================================================');

  const testQueries = [
    "How do I apply for leave in Dayflow?",
    "How does attendance clock in work?",
    "Where can I view my payslips and salary breakdown?",
    "Who can assign tasks to employees?"
  ];

  for (const q of testQueries) {
    console.log(`\nUser Question: "${q}"`);
    const mockReq = { body: { message: q } };
    const mockRes = {
      status: function(code) { this.statusCode = code; return this; },
      json: function(data) { this.body = data; return this; }
    };

    await chatWithAI(mockReq, mockRes);
    console.log('HTTP Response Status:', mockRes.statusCode || 200);
    console.log('AI Reply:', mockRes.body.reply);
  }
}

testAIChatbot().catch(console.error);

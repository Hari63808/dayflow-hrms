const { chatWithAI } = require('../controllers/aiController');

async function testAIChatEndpoint() {
  console.log('=================================================');
  console.log('TESTING POST /api/ai/chat ENDPOINT');
  console.log('=================================================');

  const testQueries = [
    'today attendance',
    'how to apply for leave',
    'how do i check my payslip',
    'what is dayflow hrms'
  ];

  for (const q of testQueries) {
    const mockReq = { body: { message: q } };
    const mockRes = {
      status: function(code) { this.statusCode = code; return this; },
      json: function(data) { this.body = data; return this; }
    };

    await chatWithAI(mockReq, mockRes);

    console.log(`\nQuery: "${q}"`);
    console.log('HTTP Status:', mockRes.statusCode || 200);
    console.log('Response Object:', mockRes.body);
  }
}

testAIChatEndpoint().catch(console.error);

const dotenv = require('dotenv');
dotenv.config();

const SYSTEM_PROMPT = "You are Dayflow AI Assistant, an HRMS copilot. Help users with attendance, leave applications, payroll, tasks, appraisals, announcements, employee information, and HR policies. Be concise and professional.";

const generateAIResponse = async (userMessage, history = []) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim() !== '' && apiKey !== 'YOUR_KEY') {
    try {
      // Try Gemini 2.5 Flash / 1.5 Flash Endpoint
      const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];
      for (const model of models) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

          const contents = [
            {
              role: 'user',
              parts: [{ text: `${SYSTEM_PROMPT}\n\nUser Message: ${userMessage}` }]
            }
          ];

          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
          });

          if (response.ok) {
            const data = await response.json();
            const candidate = data.candidates?.[0];
            const text = candidate?.content?.parts?.[0]?.text;
            if (text) return text.trim();
          }
        } catch (mErr) {
          console.warn(`Model ${model} call error:`, mErr.message);
        }
      }
    } catch (err) {
      console.warn('Gemini API fetch warning, using HRMS assistant engine:', err.message);
    }
  }

  // Domain-specific intelligent HRMS assistant response engine
  return getHRMSAssistantResponse(userMessage);
};

function getHRMSAssistantResponse(query) {
  const q = (query || '').toLowerCase().trim();

  if (q === 'hi' || q === 'hello' || q === 'hey' || q === 'greetings') {
    return "Hello! 👋 I am Dayflow AI Assistant, your official HRMS copilot. How can I help you today?";
  }

  if (q.includes('attendance') || q.includes('clock') || q.includes('check in') || q.includes('today attendance')) {
    return "Your attendance status today is tracked live in the **Attendance Clock** section. You can check in or check out directly from your dashboard banner or clock page.";
  }

  if (q.includes('leave') || q.includes('apply') || q.includes('vacation') || q.includes('holiday')) {
    return "To apply for leave:\n\n1. Open **Leave Applications** from the sidebar.\n2. Click **Apply New Leave**.\n3. Select Leave Type (Casual, Sick, Earned), dates, and reason.\n4. Submit for HR approval.";
  }

  if (q.includes('payroll') || q.includes('salary') || q.includes('payslip') || q.includes('pay')) {
    return "To access your compensation details:\n\n1. Navigate to **Payroll & Salary** in the left menu.\n2. View basic salary, bonuses, and net pay.\n3. Click **Download PDF Payslip** for your official statement.";
  }

  if (q.includes('task') || q.includes('deliverable') || q.includes('todo')) {
    return "To manage work tasks:\n\n• Open **Tasks & Portal** from the menu.\n• Update task status between Pending, In Progress, and Completed.\n• Admins can assign new tasks directly to team members.";
  }

  if (q.includes('appraisal') || q.includes('review') || q.includes('rating') || q.includes('performance')) {
    return "Performance reviews and appraisals are available under **Performance Reviews** in the sidebar. Admins can record ratings (1 to 5 stars) and feedback.";
  }

  if (q.includes('announcement') || q.includes('notice') || q.includes('news') || q.includes('broadcast')) {
    return "Company broadcasts are posted under **Announcements**. Admins post notices for departments or the entire organization.";
  }

  if (q.includes('profile') || q.includes('photo') || q.includes('avatar') || q.includes('picture')) {
    return "To update your profile:\n\n1. Go to **My Profile**.\n2. Upload a new profile picture or update phone number and address.\n3. Save changes.";
  }

  return "I am Dayflow AI Assistant 🤖 I can assist with attendance, leave applications, payroll, tasks, appraisals, announcements, and HR policies. What would you like help with?";
}

module.exports = {
  generateAIResponse
};

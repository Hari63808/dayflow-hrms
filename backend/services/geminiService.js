const dotenv = require('dotenv');
dotenv.config();

const SYSTEM_PROMPT = `You are Dayflow AI Assistant, an intelligent HRMS assistant.
Help employees and administrators use the Dayflow HRMS system.
Be professional, concise, and helpful.
Answer questions about attendance, leave management, payroll, tasks, employee management, and HR policies.
If information is unavailable, politely inform the user.`;

const generateAIResponse = async (userMessage, history = []) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim() !== '') {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const contents = [
        {
          role: 'user',
          parts: [{ text: `${SYSTEM_PROMPT}\n\nUser Question: ${userMessage}` }]
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
    } catch (err) {
      console.warn('Gemini API fetch warning, falling back to intelligent HRMS assistant:', err.message);
    }
  }

  // Domain-specific intelligent HRMS fallback response generator
  return getHRMSFallbackResponse(userMessage);
};

function getHRMSFallbackResponse(query) {
  const q = (query || '').toLowerCase();

  if (q.includes('attendance') || q.includes('check in') || q.includes('clock') || q.includes('punch')) {
    return "You can manage your attendance on the **Attendance Clock** page. Click 'Check In' at the start of your shift and 'Check Out' when finishing. If you missed a clock timestamp, submit a request via **Clock Correction**!";
  }
  if (q.includes('leave') || q.includes('vacation') || q.includes('time off') || q.includes('sick') || q.includes('holiday')) {
    return "To apply for leave, navigate to **Leave Applications** in the sidebar. You can view remaining balances (Casual, Medical, Annual), track HR approval status, and check the **Holiday Calendar** for company holidays!";
  }
  if (q.includes('payroll') || q.includes('salary') || q.includes('pay') || q.includes('payslip') || q.includes('bonus')) {
    return "Your compensation details and monthly payslips are available under **Payroll & Salary**. You can view basic salary, bonuses, deductions, net pay, and download PDF payslips directly!";
  }
  if (q.includes('task') || q.includes('assign') || q.includes('todo') || q.includes('work')) {
    return "Access deliverables under **Tasks & Portal**. Admins can assign tasks to employees with priorities and due dates, while employees can update status between Pending, In Progress, and Completed.";
  }
  if (q.includes('department') || q.includes('role') || q.includes('employee') || q.includes('directory')) {
    return "Administrators can manage enterprise departments via **Departments** and browse staff in the **Employee Directory**. Contact HR for role permission updates!";
  }
  if (q.includes('profile') || q.includes('avatar') || q.includes('photo') || q.includes('picture')) {
    return "You can update personal details and upload a profile picture under **My Profile**. Click the camera button on your avatar to upload a new photo!";
  }
  if (q.includes('document') || q.includes('vault') || q.includes('file')) {
    return "Official company documents and policies can be securely viewed and uploaded under **Document Vault**.";
  }
  if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('greetings')) {
    return "Hello! I am Dayflow AI Assistant 👋 How can I help you today? You can ask me about Attendance, Leave Applications, Payroll & Salary, Task Management, or system navigation!";
  }

  return "I am Dayflow AI Assistant 🤖 I can help you navigate Attendance, Leave Applications, Payroll & Salary statements, Task assignments, Document Vault, and HR policies. What would you like to ask?";
}

module.exports = {
  generateAIResponse
};

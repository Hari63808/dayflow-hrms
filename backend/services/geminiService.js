const dotenv = require('dotenv');
dotenv.config();

const SYSTEM_PROMPT = `You are Dayflow AI Assistant, the official AI copilot for Dayflow HRMS.
Your role is to assist employees, managers, HR staff, and administrators using the Dayflow Human Resource Management System.

Rules:
1. Always be professional, friendly, and concise.
2. Provide step-by-step instructions when guiding users through HRMS features.
3. Never invent employee data, payroll records, attendance records, or leave balances.
4. If information is unavailable, clearly state that you do not have access to that data.
5. For greetings, respond naturally and conversationally (e.g. "Hello! 👋 Welcome to Dayflow HRMS. How can I assist you today?").
6. Format answers using numbered steps or bullet points when appropriate.
7. Keep responses easy to understand for non-technical users.
8. If a user asks where to find a feature, explain the exact menu path in Dayflow HRMS.
9. If a user asks about payroll, leave balances, attendance logs, or employee records, explain the process but do not fabricate specific personal values.
10. Focus on HRMS-related assistance.`;

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
  const q = (query || '').toLowerCase().trim();

  if (q === 'hi' || q === 'hello' || q === 'hey' || q === 'greetings') {
    return "Hello! 👋 Welcome to Dayflow HRMS. How can I assist you today?";
  }

  if (q.includes('what is my salary') || q.includes('my pay') || q.includes('how much do i earn')) {
    return "I do not have direct access to your personal payroll records. Please check the **Payroll & Salary** module in the sidebar or contact your HR administrator.";
  }

  if (q.includes('how do i apply for leave') || q.includes('apply leave') || q.includes('take leave')) {
    return "To apply for leave:\n\n1. Open the **Leave Applications** module from the left sidebar.\n2. Click **Apply New Leave**.\n3. Select your leave type (Casual, Medical, Earned).\n4. Choose start and end dates.\n5. Enter a reason for your request.\n6. Click **Submit Application**.\n\nYou can track approval status directly from the Leave Applications section.";
  }

  if (q.includes('attendance') || q.includes('check in') || q.includes('clock') || q.includes('punch')) {
    return "To log your shift attendance:\n\n1. Open the **Attendance Clock** module from the left sidebar.\n2. Click **Check In Now** when your shift begins.\n3. Click **Check Out Now** when your shift ends.\n\nIf you missed a clock timestamp, submit a request via the **Clock Correction** module.";
  }

  if (q.includes('leave') || q.includes('vacation') || q.includes('holiday')) {
    return "To manage leaves and holidays:\n\n• **Leave Applications**: View your leave quotas, submit new requests, and track HR approvals.\n• **Holiday Calendar**: Browse upcoming official company holidays and observances.";
  }

  if (q.includes('payroll') || q.includes('salary') || q.includes('payslip')) {
    return "To view your compensation details:\n\n1. Open the **Payroll & Salary** module from the sidebar.\n2. View your basic salary, bonuses, deductions, and net pay.\n3. Click **Download PDF Payslip** to export official payment statements.";
  }

  if (q.includes('task') || q.includes('deliverable') || q.includes('todo')) {
    return "To manage workplace tasks:\n\n1. Open the **Tasks & Portal** module.\n2. Employees can view assigned tasks and update status between Pending, In Progress, and Completed.\n3. Administrators can click **Assign New Task** to assign tasks to team members.";
  }

  if (q.includes('profile') || q.includes('avatar') || q.includes('photo') || q.includes('picture')) {
    return "To update your personal profile:\n\n1. Open the **My Profile** module.\n2. Hover over your avatar image and click the camera icon to upload a new profile picture.\n3. Edit phone number and address, then click **Save Profile Changes**.";
  }

  if (q.includes('department') || q.includes('employee') || q.includes('directory')) {
    return "For organizational structure and staff details:\n\n• **Departments**: Browse company department heads, budgets, and member counts.\n• **Employee Directory**: Administrators can search, filter, edit, or add new staff members.";
  }

  return "I am Dayflow AI Assistant 🤖 I can guide you step-by-step through Attendance, Leave Applications, Payroll & Salary, Task Management, Document Vault, and HR Policies. What would you like assistance with?";
}

module.exports = {
  generateAIResponse
};

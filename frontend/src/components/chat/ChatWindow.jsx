import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { aiService } from '../../services/aiService';
import { Bot, Send, X, Sparkles, Loader2 } from 'lucide-react';

const ChatWindow = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: "Hello! I am Dayflow AI Assistant 👋 How can I help you with Attendance, Leave Applications, Payroll, Tasks, or HR Policies today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input.trim();
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.slice(-6).map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await aiService.sendMessage(currentInput, historyPayload);

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: res?.reply || "I'm sorry, I couldn't generate a response. Please try again.",
        timestamp: res?.timestamp || new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat AI Error:', err);
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: "I'm having trouble reaching the AI server. Please check your internet connection or try again in a moment.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '90px',
        right: '24px',
        width: '380px',
        maxHeight: '560px',
        height: 'calc(100vh - 120px)',
        backgroundColor: 'var(--bg-card, #1e1b4b)',
        borderRadius: '20px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        overflow: 'hidden',
        animation: 'slideUpFade 0.3s ease-out forwards'
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          padding: '1rem 1.25rem',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)'
            }}
          >
            <Sparkles size={20} color="#ffffff" />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>
              Dayflow AI Assistant
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.725rem', opacity: 0.9 }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#4ade80', display: 'inline-block' }} />
              <span>Online • HRMS Copilot</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            padding: '0.35rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.8,
            transition: 'opacity 0.2s'
          }}
          title="Close Chat"
        >
          <X size={20} />
        </button>
      </div>

      {/* Message Stream Container */}
      <div
        style={{
          flex: 1,
          padding: '1.25rem 1rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-app, #0f172a)'
        }}
      >
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Typing Indicator */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-light, #a78bfa)', fontSize: '0.8rem', padding: '0.5rem', fontStyle: 'italic' }}>
            <Loader2 size={16} className="spin-icon" />
            <span>Dayflow AI is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSend}
        style={{
          padding: '0.85rem 1rem',
          backgroundColor: 'var(--bg-card, #1e1b4b)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        <input
          type="text"
          placeholder="Ask Dayflow AI about leaves, payroll, tasks..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          style={{
            flex: 1,
            padding: '0.65rem 0.85rem',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-surface, rgba(255, 255, 255, 0.05))',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            color: 'var(--text-main, #ffffff)',
            fontSize: '0.85rem',
            outline: 'none'
          }}
        />

        <button
          type="submit"
          disabled={!input.trim() || loading}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            backgroundColor: !input.trim() || loading ? 'rgba(99, 102, 241, 0.4)' : 'var(--primary, #6366f1)',
            border: 'none',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
            transition: 'all 0.2s ease'
          }}
          title="Send Message"
        >
          <Send size={16} />
        </button>
      </form>

      <style>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .spin-icon {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ChatWindow;

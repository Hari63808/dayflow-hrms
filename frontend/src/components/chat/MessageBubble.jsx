import React from 'react';
import { Bot, User } from 'lucide-react';

const MessageBubble = ({ message }) => {
  const isUser = message.sender === 'user';
  const formattedTime = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.65rem',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        marginBottom: '1rem'
      }}
    >
      {/* Sender Avatar Badge */}
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: isUser ? 'var(--primary)' : '#8b5cf6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: isUser ? '0 2px 8px rgba(99, 102, 241, 0.4)' : '0 2px 8px rgba(139, 92, 246, 0.4)',
          flexShrink: 0
        }}
      >
        {isUser ? <User size={16} /> : <Bot size={17} />}
      </div>

      {/* Message Content Bubble */}
      <div style={{ maxWidth: '80%', display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            backgroundColor: isUser ? 'var(--primary)' : 'rgba(139, 92, 246, 0.12)',
            border: isUser ? 'none' : '1px solid rgba(139, 92, 246, 0.25)',
            color: isUser ? '#ffffff' : 'var(--text-main)',
            fontSize: '0.875rem',
            lineHeight: '1.45',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            boxShadow: isUser ? '0 4px 12px rgba(99, 102, 241, 0.25)' : 'none'
          }}
        >
          {message.text}
        </div>

        {/* Timestamp */}
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem', padding: '0 0.25rem' }}>
          {formattedTime}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;

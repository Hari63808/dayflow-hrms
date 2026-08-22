import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle2 color="#10b981" size={20} />;
      case 'error': return <AlertCircle color="#f43f5e" size={20} />;
      default: return <Info color="#3b82f6" size={20} />;
    }
  };

  return (
    <div className="toast" style={{
      borderLeftColor: type === 'success' ? '#10b981' : type === 'error' ? '#f43f5e' : '#3b82f6'
    }}>
      {getIcon()}
      <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)'
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;

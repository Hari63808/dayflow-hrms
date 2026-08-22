import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const normalized = (status || '').toLowerCase();

  if (['present', 'approved', 'paid'].includes(normalized)) {
    return (
      <span className="badge badge-success">
        <CheckCircle2 size={13} />
        {status}
      </span>
    );
  }

  if (['pending', 'half-day'].includes(normalized)) {
    return (
      <span className="badge badge-warning">
        <Clock size={13} />
        {status}
      </span>
    );
  }

  if (['absent', 'rejected'].includes(normalized)) {
    return (
      <span className="badge badge-danger">
        <XCircle size={13} />
        {status}
      </span>
    );
  }

  return (
    <span className="badge badge-info">
      <AlertCircle size={13} />
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;

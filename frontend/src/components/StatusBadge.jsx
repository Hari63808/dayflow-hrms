import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const safeStatus = status ?? 'Pending';
  const normalized = (safeStatus ?? '').toString().toLowerCase();

  if (['present', 'approved', 'paid'].includes(normalized)) {
    return (
      <span className="badge badge-success">
        <CheckCircle2 size={13} />
        {safeStatus}
      </span>
    );
  }

  if (['pending', 'half-day'].includes(normalized)) {
    return (
      <span className="badge badge-warning">
        <Clock size={13} />
        {safeStatus}
      </span>
    );
  }

  if (['absent', 'rejected'].includes(normalized)) {
    return (
      <span className="badge badge-danger">
        <XCircle size={13} />
        {safeStatus}
      </span>
    );
  }

  return (
    <span className="badge badge-info">
      <AlertCircle size={13} />
      {safeStatus}
    </span>
  );
};

export default StatusBadge;

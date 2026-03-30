import React from 'react';
import { MACHINE_STATUS_LABELS, MACHINE_STATUS_COLORS } from '../../utils/constants';

export function StatusBadge({ status, showDot = true }) {
  const colorClass = MACHINE_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
  const label = MACHINE_STATUS_LABELS[status] || status;
  
  const dotColors = {
    received: 'bg-gray-500',
    diagnosis: 'bg-yellow-500',
    waiting_parts: 'bg-red-500',
    in_repair: 'bg-blue-500',
    completed: 'bg-green-500',
    delivered: 'bg-emerald-600',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColors[status] || 'bg-gray-500'}`} />
      )}
      {label}
    </span>
  );
}

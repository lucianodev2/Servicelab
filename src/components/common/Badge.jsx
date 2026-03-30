import React from 'react';
import { MACHINE_STATUS_COLORS, MACHINE_STATUS_LABELS, PART_STATUS_COLORS, PART_STATUS_LABELS } from '../../utils/constants';

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status, type = 'machine' }) {
  if (type === 'machine') {
    const colorClass = MACHINE_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
    const label = MACHINE_STATUS_LABELS[status] || status;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {label}
      </span>
    );
  }
  
  if (type === 'part') {
    const colorClass = PART_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
    const label = PART_STATUS_LABELS[status] || status;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {label}
      </span>
    );
  }

  return <Badge>{status}</Badge>;
}

export function PriorityBadge({ priority }) {
  const variants = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
    urgent: 'bg-red-200 text-red-900',
  };

  const labels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[priority] || variants.low}`}>
      {labels[priority] || priority}
    </span>
  );
}

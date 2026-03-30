import React from 'react';

export function Card({ children, className = '', padding = 'normal', shadow = 'sm' }) {
  const paddings = {
    none: '',
    small: 'p-3',
    normal: 'p-4',
    large: 'p-6',
  };
  
  const shadows = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${shadows[shadow]} ${className}`}>
      <div className={paddings[padding]}>
        {children}
      </div>
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`flex items-start justify-between mb-4 ${className}`}>
      <div>
        {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

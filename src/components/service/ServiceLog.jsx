import React from 'react';
import { 
  Wrench, 
  ClipboardCheck, 
  FileText, 
  Clock,
  User
} from 'lucide-react';
import { SERVICE_ENTRY_TYPES, SERVICE_ENTRY_TYPE_LABELS } from '../../utils/constants';
import { formatDateTime } from '../../utils/helpers';

const typeIcons = {
  [SERVICE_ENTRY_TYPES.ACTION]: Wrench,
  [SERVICE_ENTRY_TYPES.TEST]: ClipboardCheck,
  [SERVICE_ENTRY_TYPES.NOTE]: FileText,
};

const typeColors = {
  [SERVICE_ENTRY_TYPES.ACTION]: 'bg-blue-100 text-blue-600',
  [SERVICE_ENTRY_TYPES.TEST]: 'bg-green-100 text-green-600',
  [SERVICE_ENTRY_TYPES.NOTE]: 'bg-gray-100 text-gray-600',
};

export function ServiceLog({ entries = [] }) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>Nenhum histórico ainda</p>
        <p className="text-sm">Registros aparecerão aqui</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry, index) => {
        const Icon = typeIcons[entry.type] || FileText;
        const colorClass = typeColors[entry.type] || 'bg-gray-100 text-gray-600';
        const isLast = index === entries.length - 1;

        return (
          <div key={entry.id} className="relative flex gap-4">
            {/* Timeline line */}
            {!isLast && (
              <div className="absolute left-5 top-10 bottom-0 w-px bg-gray-200" />
            )}
            
            {/* Icon */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
              <Icon className="w-5 h-5" />
            </div>
            
            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {SERVICE_ENTRY_TYPE_LABELS[entry.type] || 'Update'}
                  </p>
                  <p className="text-gray-700 mt-1">{entry.description}</p>
                  
                  {/* Photos */}
                  {entry.photos && entry.photos.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {entry.photos.map((photo, idx) => (
                        <img
                          key={idx}
                          src={photo}
                          alt={`Foto ${idx + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(photo, '_blank');
                          }}
                        />
                      ))}
                    </div>
                  )}

                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDateTime(entry.timestamp)}
                </span>
                {entry.technician && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {entry.technician}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

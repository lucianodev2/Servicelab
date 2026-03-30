import React from 'react';
import { 
  Wrench, 
  Puzzle, 
  ClipboardCheck, 
  FileText, 
  Camera, 
  Clock,
  User
} from 'lucide-react';
import { SERVICE_ENTRY_TYPES, SERVICE_ENTRY_TYPE_LABELS } from '../../utils/constants';
import { formatDateTime } from '../../utils/helpers';

const typeIcons = {
  [SERVICE_ENTRY_TYPES.ACTION]: Wrench,
  [SERVICE_ENTRY_TYPES.PART_REPLACED]: Puzzle,
  [SERVICE_ENTRY_TYPES.TEST]: ClipboardCheck,
  [SERVICE_ENTRY_TYPES.NOTE]: FileText,
  [SERVICE_ENTRY_TYPES.PHOTO]: Camera,
};

const typeColors = {
  [SERVICE_ENTRY_TYPES.ACTION]: 'bg-blue-100 text-blue-600',
  [SERVICE_ENTRY_TYPES.PART_REPLACED]: 'bg-purple-100 text-purple-600',
  [SERVICE_ENTRY_TYPES.TEST]: 'bg-green-100 text-green-600',
  [SERVICE_ENTRY_TYPES.NOTE]: 'bg-gray-100 text-gray-600',
  [SERVICE_ENTRY_TYPES.PHOTO]: 'bg-orange-100 text-orange-600',
};

export function ServiceLog({ entries = [] }) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>No service history yet</p>
        <p className="text-sm">Updates will appear here</p>
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
                  
                  {/* Parts used */}
                  {entry.partsUsed && entry.partsUsed.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs font-medium text-gray-500">Parts used:</p>
                      <div className="flex flex-wrap gap-2">
                        {entry.partsUsed.map((part, idx) => (
                          <span 
                            key={idx}
                            className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {part.name} x{part.quantity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Photos */}
                  {entry.photos && entry.photos.length > 0 && (
                    <div className="mt-2 flex gap-2">
                      {entry.photos.map((photo, idx) => (
                        <img
                          key={idx}
                          src={photo}
                          alt={`Service photo ${idx + 1}`}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
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
                {entry.createdBy && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {entry.createdBy}
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

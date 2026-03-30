import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, MapPin, Calendar, AlertCircle, Clock } from 'lucide-react';
import { Card } from '../common/Card';
import { StatusBadge } from './StatusBadge';
import { formatRelativeTime, truncateText } from '../../utils/helpers';

export function MachineCard({ machine }) {
  const navigate = useNavigate();

  const locationLabels = {
    client: 'Cliente',
    sector: 'Setor',
    bench: 'Bancada'
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/machines/${machine.id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <Printer className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {machine.brand} {machine.model}
            </h3>
            <p className="text-sm text-gray-500">S/N: {machine.serialNumber}</p>
          </div>
        </div>
        <StatusBadge status={machine.status} />
      </div>

      {machine.isUrgent && (
        <div className="flex items-center gap-1.5 mb-3 text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <span className="text-xs font-medium">Urgente</span>
        </div>
      )}

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {truncateText(machine.problemDescription, 100)}
      </p>

      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          <span>{locationLabels[machine.location]}</span>
          {machine.locationDetail && (
            <span className="text-gray-400">- {machine.locationDetail}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatRelativeTime(machine.entryDate)}</span>
        </div>
        {machine.serviceLog.length > 0 && (
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{machine.serviceLog.length} atualizações</span>
          </div>
        )}
      </div>
    </Card>
  );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, MapPin, Calendar, User, Clock } from 'lucide-react';
import { Card } from '../common/Card';
import { StatusBadge } from './StatusBadge';
import { formatRelativeTime } from '../../utils/helpers';

export function MachineCard({ machine }) {
  const navigate = useNavigate();

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/machines/${machine.id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
            <Printer className="w-5 h-5 text-white" />
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

      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
        <div className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          <span>{machine.location}</span>
        </div>
        <div className="flex items-center gap-1">
          <User className="w-3.5 h-3.5" />
          <span>{machine.technician}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatRelativeTime(machine.entryDate)}</span>
        </div>
        {machine.serviceLog.length > 0 && (
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{machine.serviceLog.length} registros</span>
          </div>
        )}
      </div>
    </Card>
  );
}

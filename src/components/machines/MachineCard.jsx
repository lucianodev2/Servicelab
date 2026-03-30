import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, MapPin, Calendar, User, Clock, ChevronDown, Wrench, Package, TestTube, Truck, CheckCircle, Edit2, MoreVertical } from 'lucide-react';
import { Card } from '../common/Card';
import { StatusBadge } from './StatusBadge';
import { formatRelativeTime } from '../../utils/helpers';
import { MACHINE_STATUS, MACHINE_STATUS_LABELS } from '../../utils/constants';

const statusOptions = [
  { value: MACHINE_STATUS.MAINTENANCE, label: MACHINE_STATUS_LABELS[MACHINE_STATUS.MAINTENANCE], icon: Wrench, color: 'bg-blue-500' },
  { value: MACHINE_STATUS.WAITING_PARTS, label: MACHINE_STATUS_LABELS[MACHINE_STATUS.WAITING_PARTS], icon: Package, color: 'bg-yellow-500' },
  { value: MACHINE_STATUS.TESTING, label: MACHINE_STATUS_LABELS[MACHINE_STATUS.TESTING], icon: TestTube, color: 'bg-purple-500' },
  { value: MACHINE_STATUS.READY, label: MACHINE_STATUS_LABELS[MACHINE_STATUS.READY], icon: Truck, color: 'bg-green-500' },
  { value: MACHINE_STATUS.COMPLETED, label: MACHINE_STATUS_LABELS[MACHINE_STATUS.COMPLETED], icon: CheckCircle, color: 'bg-emerald-600' },
];

export function MachineCard({ machine, onStatusChange, onEdit }) {
  const navigate = useNavigate();
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  const handleStatusClick = (e) => {
    e.stopPropagation();
    setShowStatusMenu(!showStatusMenu);
    setShowActionsMenu(false);
  };

  const handleStatusSelect = (e, newStatus) => {
    e.stopPropagation();
    if (onStatusChange) {
      onStatusChange(machine.id, newStatus);
    }
    setShowStatusMenu(false);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(machine);
    }
    setShowActionsMenu(false);
  };

  const handleCardClick = () => {
    navigate(`/machines/${machine.id}`);
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow relative group"
      onClick={handleCardClick}
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
        
        <div className="flex items-center gap-1">
          {/* Status Badge com dropdown */}
          <div className="relative">
            <button
              onClick={handleStatusClick}
              className="flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              <StatusBadge status={machine.status} />
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            
            {/* Dropdown de status */}
            {showStatusMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={(e) => { e.stopPropagation(); setShowStatusMenu(false); }}
                />
                <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1">
                  <p className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
                    Alterar Status
                  </p>
                  {statusOptions.map((option) => {
                    const Icon = option.icon;
                    const isCurrent = machine.status === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={(e) => handleStatusSelect(e, option.value)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors ${
                          isCurrent ? 'bg-gray-50' : ''
                        }`}
                      >
                        <div className={`w-8 h-8 ${option.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${isCurrent ? 'text-gray-900' : 'text-gray-700'}`}>
                            {option.label}
                          </p>
                        </div>
                        {isCurrent && (
                          <div className="w-2 h-2 bg-primary-500 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Botão de ações (editar) */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActionsMenu(!showActionsMenu);
                setShowStatusMenu(false);
              }}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Menu de ações */}
            {showActionsMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={(e) => { e.stopPropagation(); setShowActionsMenu(false); }}
                />
                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1">
                  <button
                    onClick={handleEditClick}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Editar Máquina</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
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

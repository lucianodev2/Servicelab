import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Printer, MapPin, Calendar, User, Clock,
  ChevronDown, Wrench, Package, TestTube, Truck, CheckCircle, Edit2,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { formatRelativeTime } from '../../utils/helpers';
import { MACHINE_STATUS, MACHINE_STATUS_LABELS } from '../../utils/constants';

const statusOptions = [
  { value: MACHINE_STATUS.MAINTENANCE,   label: MACHINE_STATUS_LABELS[MACHINE_STATUS.MAINTENANCE],   icon: Wrench,       color: 'bg-blue-500' },
  { value: MACHINE_STATUS.WAITING_PARTS, label: MACHINE_STATUS_LABELS[MACHINE_STATUS.WAITING_PARTS], icon: Package,      color: 'bg-yellow-500' },
  { value: MACHINE_STATUS.TESTING,       label: MACHINE_STATUS_LABELS[MACHINE_STATUS.TESTING],       icon: TestTube,     color: 'bg-purple-500' },
  { value: MACHINE_STATUS.READY,         label: MACHINE_STATUS_LABELS[MACHINE_STATUS.READY],         icon: Truck,        color: 'bg-green-500' },
  { value: MACHINE_STATUS.COMPLETED,     label: MACHINE_STATUS_LABELS[MACHINE_STATUS.COMPLETED],     icon: CheckCircle,  color: 'bg-emerald-600' },
];

export function MachineCard({ machine, onStatusChange, onEdit }) {
  const navigate = useNavigate();
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const menuRef = useRef(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    if (!showStatusMenu) return;
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowStatusMenu(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [showStatusMenu]);

  const handleStatusClick = (e) => {
    e.stopPropagation();
    setShowStatusMenu(prev => !prev);
  };

  const handleStatusSelect = (e, newStatus) => {
    e.stopPropagation();
    onStatusChange?.(machine.id, newStatus);
    setShowStatusMenu(false);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit?.(machine);
  };

  return (
    // Sem overflow-hidden — permite que o dropdown flutue acima dos demais cards
    <div
      onClick={() => navigate(`/machines/${machine.id}`)}
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-4
                 cursor-pointer hover:shadow-md transition-shadow"
    >
      {/* Linha superior: identidade + ações */}
      <div className="flex items-start justify-between mb-3">

        {/* Ícone + nome */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center shrink-0">
            <Printer className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {machine.brand} {machine.model}
            </h3>
            <p className="text-sm text-gray-500">S/N: {machine.serialNumber}</p>
          </div>
        </div>

        {/* Dropdown de status + botão editar */}
        <div className="flex items-center gap-1 shrink-0 ml-2">

          {/* Status dropdown */}
          <div ref={menuRef} className="relative">
            <button
              onClick={handleStatusClick}
              className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <StatusBadge status={machine.status} />
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-150
                            ${showStatusMenu ? 'rotate-180' : ''}`}
              />
            </button>

            {showStatusMenu && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-50 py-1.5">
                <p className="px-4 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Alterar Status
                </p>
                {statusOptions.map(({ value, label, icon: Icon, color }) => {
                  const isCurrent = machine.status === value;
                  return (
                    <button
                      key={value}
                      onClick={(e) => handleStatusSelect(e, value)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left
                                  hover:bg-gray-50 transition-colors
                                  ${isCurrent ? 'bg-blue-50' : ''}`}
                    >
                      <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center shrink-0`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className={`text-sm font-medium flex-1 ${isCurrent ? 'text-gray-900' : 'text-gray-700'}`}>
                        {label}
                      </span>
                      {isCurrent && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Botão editar — sempre visível em todos os cards */}
          <button
            onClick={handleEditClick}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar máquina"
          >
            <Edit2 className="w-4 h-4" />
          </button>

        </div>
      </div>

      {/* Metadados */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {machine.location}
        </span>
        <span className="flex items-center gap-1">
          <User className="w-3.5 h-3.5" />
          {machine.technician}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {formatRelativeTime(machine.entryDate)}
        </span>
        {machine.serviceLog.length > 0 && (
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {machine.serviceLog.length} registros
          </span>
        )}
      </div>
    </div>
  );
}

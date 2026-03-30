import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { MachineCard } from './MachineCard';
import { Button } from '../common/Button';
import { Select } from '../common/Input';
import { MACHINE_STATUS, MACHINE_STATUS_LABELS } from '../../utils/constants';
import { searchItems, filterByStatus } from '../../utils/helpers';
import { useApp } from '../../context/AppContext';
import { MachineForm } from './MachineForm';

const sortOptions = [
  { value: 'newest', label: 'Mais Recentes' },
  { value: 'oldest', label: 'Mais Antigas' },
  { value: 'status', label: 'Por Status' },
];

export function MachineList({ machines, searchQuery = '' }) {
  const { updateMachine } = useApp();
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleStatusChange = (machineId, newStatus) => {
    updateMachine(machineId, { status: newStatus });
  };

  const handleEdit = (machine) => {
    setEditingMachine(machine);
    setIsEditModalOpen(true);
  };

  const handleUpdateMachine = (updates) => {
    if (editingMachine) {
      updateMachine(editingMachine.id, updates);
    }
    setIsEditModalOpen(false);
    setEditingMachine(null);
  };

  const filteredMachines = useMemo(() => {
    let result = [...machines];
    
    // Search by serial number, brand, model
    if (searchTerm) {
      result = searchItems(result, searchTerm, ['serialNumber', 'brand', 'model']);
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      result = filterByStatus(result, statusFilter);
    }
    
    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
    
    return result;
  }, [machines, searchTerm, statusFilter, sortBy]);

  const statusOptions = [
    { value: 'all', label: 'Todos os Status' },
    ...Object.values(MACHINE_STATUS).map(status => ({
      value: status,
      label: MACHINE_STATUS_LABELS[status]
    }))
  ];

  const hasActiveFilters = statusFilter !== 'all' || searchTerm;

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por número de série..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <Button
          variant="secondary"
          leftIcon={SlidersHorizontal}
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? 'bg-gray-100' : ''}
        >
          Filtros
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
            />
            <Select
              label="Ordenar Por"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={sortOptions}
            />
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setSortBy('newest');
              }}
              leftIcon={X}
            >
              Limpar Filtros
            </Button>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Mostrando {filteredMachines.length} de {machines.length} máquinas
        </span>
        {hasActiveFilters && (
          <span className="text-primary-600 font-medium">Filtros ativos</span>
        )}
      </div>

      {/* Machine Grid */}
      {filteredMachines.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredMachines.map(machine => (
            <MachineCard 
              key={machine.id} 
              machine={machine} 
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma máquina encontrada</h3>
          <p className="text-gray-500">
            {hasActiveFilters 
              ? 'Tente ajustar sua busca ou filtros'
              : 'Comece adicionando sua primeira máquina'
            }
          </p>
        </div>
      )}
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Printer, Search, Calendar, User, Wrench, ClipboardCheck, FileText, Filter, X } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useApp } from '../context/AppContext';
import { SERVICE_ENTRY_TYPES, SERVICE_ENTRY_TYPE_LABELS } from '../utils/constants';
import { formatDateTime, formatDate } from '../utils/helpers';

const typeIcons = {
  [SERVICE_ENTRY_TYPES.ACTION]: Wrench,
  [SERVICE_ENTRY_TYPES.TEST]: ClipboardCheck,
  [SERVICE_ENTRY_TYPES.NOTE]: FileText,
};

const typeColors = {
  [SERVICE_ENTRY_TYPES.ACTION]: 'bg-blue-100 text-blue-600 border-blue-200',
  [SERVICE_ENTRY_TYPES.TEST]: 'bg-green-100 text-green-600 border-green-200',
  [SERVICE_ENTRY_TYPES.NOTE]: 'bg-gray-100 text-gray-600 border-gray-200',
};

export function ServiceHistory() {
  const navigate = useNavigate();
  const { machines } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterMachine, setFilterMachine] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Get all service entries from all machines
  const allEntries = useMemo(() => {
    return machines
      .flatMap(machine => 
        machine.serviceLog.map(entry => ({
          ...entry,
          machine: {
            id: machine.id,
            brand: machine.brand,
            model: machine.model,
            serialNumber: machine.serialNumber,
          }
        }))
      )
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [machines]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return allEntries.filter(entry => {
      const matchesSearch = 
        entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.machine.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.machine.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.technician?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || entry.type === filterType;
      const matchesMachine = filterMachine === 'all' || entry.machine.id === filterMachine;
      
      let matchesDate = true;
      if (dateRange.start) {
        matchesDate = matchesDate && new Date(entry.timestamp) >= new Date(dateRange.start);
      }
      if (dateRange.end) {
        matchesDate = matchesDate && new Date(entry.timestamp) <= new Date(dateRange.end + 'T23:59:59');
      }
      
      return matchesSearch && matchesType && matchesMachine && matchesDate;
    });
  }, [allEntries, searchTerm, filterType, filterMachine, dateRange]);

  const hasFilters = searchTerm || filterType !== 'all' || filterMachine !== 'all' || dateRange.start || dateRange.end;

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterMachine('all');
    setDateRange({ start: '', end: '' });
  };

  // Group entries by date
  const groupedEntries = useMemo(() => {
    const groups = {};
    filteredEntries.forEach(entry => {
      const date = formatDate(entry.timestamp);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(entry);
    });
    return groups;
  }, [filteredEntries]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Histórico de Serviço</h1>
          <p className="text-gray-500 mt-1">
            {allEntries.length} registros de {machines.length} máquinas
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar registros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="all">Todos os tipos</option>
            <option value={SERVICE_ENTRY_TYPES.ACTION}>Ação</option>
            <option value={SERVICE_ENTRY_TYPES.TEST}>Teste</option>
            <option value={SERVICE_ENTRY_TYPES.NOTE}>Nota</option>
          </select>

          {/* Machine Filter */}
          <select
            value={filterMachine}
            onChange={(e) => setFilterMachine(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="all">Todas as máquinas</option>
            {machines.map(machine => (
              <option key={machine.id} value={machine.id}>
                {machine.brand} {machine.model}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          {hasFilters && (
            <Button variant="ghost" onClick={clearFilters} leftIcon={X}>
              Limpar Filtros
            </Button>
          )}
        </div>

        {/* Date Range */}
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Período:</span>
          </div>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <span className="text-gray-400">até</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </Card>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span>Mostrando {filteredEntries.length} de {allEntries.length} registros</span>
        {hasFilters && <span className="text-primary-600">• Filtros ativos</span>}
      </div>

      {/* Timeline */}
      {Object.keys(groupedEntries).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedEntries).map(([date, entries]) => (
            <div key={date}>
              {/* Date Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                  {new Date(entries[0].timestamp).getDate()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{date}</h3>
                  <p className="text-sm text-gray-500">{entries.length} registros</p>
                </div>
              </div>

              {/* Entries */}
              <div className="space-y-3 ml-6 border-l-2 border-gray-200 pl-6">
                {entries.map((entry) => {
                  const Icon = typeIcons[entry.type] || FileText;
                  const colorClass = typeColors[entry.type] || typeColors[SERVICE_ENTRY_TYPES.NOTE];
                  
                  return (
                    <Card 
                      key={entry.id} 
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/machines/${entry.machine.id}`)}
                    >
                      <div className="flex items-start gap-4">
                        {/* Type Icon */}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${colorClass}`}>
                          <Icon className="w-5 h-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                {SERVICE_ENTRY_TYPE_LABELS[entry.type] || 'Registro'}
                              </p>
                              <p className="text-gray-900 mt-1">{entry.description}</p>
                            </div>
                            <span className="text-xs text-gray-400 whitespace-nowrap">
                              {formatDateTime(entry.timestamp).split(' ')[1]}
                            </span>
                          </div>

                          {/* Machine Info */}
                          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                              <Printer className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">
                                {entry.machine.brand} {entry.machine.model}
                              </span>
                              <span className="text-xs text-gray-400">
                                S/N: {entry.machine.serialNumber}
                              </span>
                            </div>
                            {entry.technician && (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <User className="w-3.5 h-3.5" />
                                <span>{entry.technician}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {hasFilters ? 'Nenhum registro encontrado' : 'Nenhum histórico ainda'}
          </h3>
          <p className="text-gray-500">
            {hasFilters 
              ? 'Tente ajustar seus filtros' 
              : 'Os registros de serviço aparecerão aqui'}
          </p>
        </div>
      )}
    </div>
  );
}

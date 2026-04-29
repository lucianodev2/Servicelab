import React, { useState, useEffect } from 'react';
import {
  Package, Search, FileDown, Camera, Calendar, Hash, Cpu, Filter, RefreshCw,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/machines/StatusBadge';
import { machinesApi } from '../services/api';
import { formatDate } from '../utils/helpers';
import { generateStockReport } from '../utils/pdfExport';

export function MachineStock() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModel, setFilterModel] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [exportingPdf, setExportingPdf] = useState(false);

  const loadStock = () => {
    setLoading(true);
    setError(null);
    machinesApi
      .listStock()
      .then(setMachines)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStock();
  }, []);

  // Lista de modelos únicos para filtro
  const uniqueModels = [...new Set(machines.map(m => m.model).filter(Boolean))].sort();

  const filtered = machines.filter(m => {
    const matchSearch =
      !searchQuery ||
      m.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.patrimony?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.technician?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchModel = !filterModel || m.model === filterModel;

    const matchDate =
      !filterDate ||
      (m.entryDate && m.entryDate.split('T')[0] === filterDate);

    return matchSearch && matchModel && matchDate;
  });

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      await generateStockReport(filtered);
    } catch (e) {
      console.error('Erro ao gerar PDF:', e);
    } finally {
      setExportingPdf(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterModel('');
    setFilterDate('');
  };

  const hasFilters = searchQuery || filterModel || filterDate;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estoque de Máquinas</h1>
          <p className="text-gray-500 mt-1">
            Máquinas prontas para entrega ao cliente
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={RefreshCw}
            onClick={loadStock}
          >
            Atualizar
          </Button>
          <Button
            leftIcon={FileDown}
            onClick={handleExportPdf}
            disabled={exportingPdf || filtered.length === 0}
          >
            {exportingPdf ? 'Gerando PDF...' : 'Exportar PDF'}
          </Button>
        </div>
      </div>

      {/* Contador */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card padding="small">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{filtered.length}</p>
              <p className="text-sm text-gray-500">
                {hasFilters ? 'Máquinas encontradas' : 'Total em estoque'}
              </p>
            </div>
          </div>
        </Card>
        <Card padding="small">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Cpu className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{machines.length}</p>
              <p className="text-sm text-gray-500">Total no estoque (sem filtro)</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card padding="small">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Campo de busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por marca, modelo, série, patrimônio..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro por modelo */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterModel}
              onChange={e => setFilterModel(e.target.value)}
              className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
            >
              <option value="">Todos os modelos</option>
              {uniqueModels.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>

          {/* Filtro por data de entrada */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Filtrar por data de entrada"
            />
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </Card>

      {/* Erro */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          Erro ao carregar estoque: {error}
        </div>
      )}

      {/* Lista de máquinas */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {hasFilters ? 'Nenhuma máquina encontrada' : 'Estoque vazio'}
          </h3>
          <p className="text-gray-500 text-sm">
            {hasFilters
              ? 'Tente outros filtros de busca'
              : 'Máquinas com status "Pronta para Entrega" aparecerão aqui'}
          </p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((machine) => (
            <StockMachineCard key={machine.id} machine={machine} />
          ))}
        </div>
      )}
    </div>
  );
}

function StockMachineCard({ machine }) {
  const firstPhoto = machine.photos && machine.photos.length > 0 ? machine.photos[0] : null;

  return (
    <Card padding="small">
      <div className="flex gap-4">
        {/* Thumbnail */}
        <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
          {firstPhoto ? (
            <img
              src={firstPhoto.url}
              alt={`${machine.brand} ${machine.model}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.parentNode.innerHTML = '<div class="flex items-center justify-center w-full h-full"><svg class="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg></div>';
              }}
            />
          ) : (
            <Camera className="w-8 h-8 text-gray-300" />
          )}
        </div>

        {/* Dados */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h3 className="font-semibold text-gray-900">
                {machine.brand} {machine.model}
              </h3>
              <p className="text-sm text-gray-500">
                {machine.patrimony && <span className="mr-3">Pat.: {machine.patrimony}</span>}
                {machine.technician && <span>Técnico: {machine.technician}</span>}
              </p>
            </div>
            <StatusBadge status={machine.status} />
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2">
            <span className="flex items-center gap-1.5 text-sm text-gray-600">
              <Hash className="w-3.5 h-3.5 text-gray-400" />
              <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                {machine.serialNumber}
              </span>
            </span>

            {machine.entryDate && (
              <span className="flex items-center gap-1.5 text-sm text-gray-600">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                Entrada: {formatDate(machine.entryDate, 'dd/MM/yyyy')}
              </span>
            )}

            <span className="flex items-center gap-1.5 text-sm text-gray-600">
              <span className="text-gray-400">#</span>
              ID: {machine.id}
            </span>

            {machine.photos && machine.photos.length > 0 && (
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <Camera className="w-3.5 h-3.5 text-gray-400" />
                {machine.photos.length} foto{machine.photos.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {machine.location && (
            <p className="text-xs text-gray-400 mt-1">Local: {machine.location}</p>
          )}
        </div>
      </div>
    </Card>
  );
}

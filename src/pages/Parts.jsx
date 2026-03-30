import React, { useState } from 'react';
import { Plus, Package, Search, Filter } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input, Select } from '../components/common/Input';
import { Modal, ConfirmModal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/Badge';
import { useApp } from '../context/AppContext';
import { PART_STATUS, PART_STATUS_LABELS, PART_STATUS_COLORS } from '../utils/constants';
import { generateId, formatRelativeTime } from '../utils/helpers';

export function Parts() {
  const { parts, machines, addPart, updatePart, deletePart } = useApp();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPart, setEditaringPart] = useState(null);
  const [deletingPart, setDeletingPart] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    quantity: 1,
    status: PART_STATUS.IN_STOCK,
    machineId: '',
  });

  const filteredParts = parts.filter(part => {
    const matchesSearch = part.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || part.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const partData = {
      ...formData,
      requestedDate: formData.status === PART_STATUS.REQUESTED ? new Date().toISOString() : null,
      arrivedDate: formData.status === PART_STATUS.ARRIVED ? new Date().toISOString() : null,
    };

    if (editingPart) {
      updatePart(editingPart.id, partData);
    } else {
      addPart(partData);
    }
    
    closeForm();
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditaringPart(null);
    setFormData({
      name: '',
      quantity: 1,
      status: PART_STATUS.IN_STOCK,
      machineId: '',
    });
  };

  const openEditarForm = (part) => {
    setEditaringPart(part);
    setFormData({
      name: part.name,
      quantity: part.quantity,
      status: part.status,
      machineId: part.machineId || '',
    });
    setIsFormOpen(true);
  };

  const handleExcluir = () => {
    if (deletingPart) {
      deletePart(deletingPart.id);
      setDeletingPart(null);
    }
  };

  const statusOptions = [
    { value: 'all', label: 'Todos os Status' },
    { value: PART_STATUS.IN_STOCK, label: PART_STATUS_LABELS[PART_STATUS.IN_STOCK] },
    { value: PART_STATUS.REQUESTED, label: PART_STATUS_LABELS[PART_STATUS.REQUESTED] },
    { value: PART_STATUS.ARRIVED, label: PART_STATUS_LABELS[PART_STATUS.ARRIVED] },
  ];

  const partStatusOptions = [
    { value: PART_STATUS.IN_STOCK, label: PART_STATUS_LABELS[PART_STATUS.IN_STOCK] },
    { value: PART_STATUS.REQUESTED, label: PART_STATUS_LABELS[PART_STATUS.REQUESTED] },
    { value: PART_STATUS.ARRIVED, label: PART_STATUS_LABELS[PART_STATUS.ARRIVED] },
  ];

  const machineOptions = [
    { value: '', label: 'Não atribuída à máquina' },
    ...machines.map(m => ({
      value: m.id,
      label: `${m.brand} ${m.model} (${m.serialNumber})`
    }))
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Peças</h1>
          <p className="text-gray-500 mt-1">Controle o estoque e solicitações de peças</p>
        </div>
        <Button leftIcon={Plus} onClick={() => setIsFormOpen(true)}>
          Adicionar Peça
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar peças..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={statusOptions}
          className="w-full sm:w-48"
        />
      </div>

      {/* Parts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredParts.map(part => {
          const assignedMachine = machines.find(m => m.id === part.machineId);
          
          return (
            <Card key={part.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{part.name}</h3>
                    <p className="text-sm text-gray-500">Qtd: {part.quantity}</p>
                  </div>
                </div>
                <StatusBadge status={part.status} type="part" />
              </div>

              {assignedMachine && (
                <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Para máquina:</p>
                  <p className="text-sm font-medium text-gray-700">
                    {assignedMachine.brand} {assignedMachine.model}
                  </p>
                </div>
              )}

              {part.status === PART_STATUS.REQUESTED && part.requestedDate && (
                <p className="text-xs text-gray-500 mb-3">
                  Solicitado {formatRelativeTime(part.requestedDate)}
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => openEditarForm(part)}
                >
                  Editar
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setDeletingPart(part)}
                >
                  Excluir
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredParts.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma peça encontrada</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'Tente ajustar seus filtros'
              : 'Comece adicionando sua primeira peça'
            }
          </p>
        </div>
      )}

      {/* Add/Editar Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editingPart ? 'Editar Peça' : 'Adicionar Nova Peça'}
        footer={
          <>
            <Button variant="secondary" onClick={closeForm}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingPart ? 'Salvar Alterações' : 'Adicionar Peça'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome da Peça"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="ex: Fusor RM2-5678"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantidade"
              type="number"
              min="0"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              required
            />
            
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={partStatusOptions}
              required
            />
          </div>
          
          <Select
            label="Atribuída à Máquina (Opcional)"
            value={formData.machineId}
            onChange={(e) => setFormData({ ...formData, machineId: e.target.value })}
            options={machineOptions}
          />
        </form>
      </Modal>

      {/* Excluir Confirmation */}
      <ConfirmModal
        isOpen={!!deletingPart}
        onClose={() => setDeletingPart(null)}
        onConfirm={handleExcluir}
        title="Excluir Peça"
        message={`Tem certeza que deseja excluir "${deletingPart?.name}"?`}
        confirmText="Excluir"
        variant="danger"
      />
    </div>
  );
}

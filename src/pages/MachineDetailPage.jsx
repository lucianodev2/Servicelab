import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit2, 
  Trash2, 
  Printer, 
  MapPin, 
  Calendar, 
  User,
  Tag,
  FileDown
} from 'lucide-react';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/machines/StatusBadge';
import { PhotoGallery } from '../components/machines/PhotoGallery';
import { ServiceLog } from '../components/service/ServiceLog';
import { QuickUpdate } from '../components/service/QuickUpdate';
import { MachineForm } from '../components/machines/MachineForm';
import { ConfirmModal } from '../components/common/Modal';
import { useApp } from '../context/AppContext';
import { formatDate, formatRelativeTime } from '../utils/helpers';
import { MACHINE_STATUS, MACHINE_STATUS_LABELS } from '../utils/constants';

const statusOptions = Object.values(MACHINE_STATUS).map(status => ({
  value: status,
  label: MACHINE_STATUS_LABELS[status]
}));

export function MachineDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { machines, updateMachine, deleteMachine, addServiceEntry, addMachinePhoto } = useApp();
  
  const machine = machines.find(m => m.id === id);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  if (!machine) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Machine not found</h2>
        <Button onClick={() => navigate('/machines')} className="mt-4">
          Back to Machines
        </Button>
      </div>
    );
  }

  const handleUpdateMachine = (updates) => {
    updateMachine(machine.id, updates);
    setIsEditModalOpen(false);
  };

  const handleDeleteMachine = () => {
    deleteMachine(machine.id);
    navigate('/machines');
  };

  const handleAddServiceEntry = (entry) => {
    addServiceEntry(machine.id, entry);
  };

  const handleAddPhoto = (photoData) => {
    addMachinePhoto(machine.id, photoData);
  };

  const handleStatusChange = (newStatus) => {
    updateMachine(machine.id, { status: newStatus });
    setIsUpdatingStatus(false);
  };

  const handleExportPDF = () => {
    // PDF export functionality
    alert('Relatório exportado!');
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={ArrowLeft}
            onClick={() => navigate('/machines')}
          >
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {machine.brand} {machine.model}
            </h1>
            <p className="text-gray-500">S/N: {machine.serialNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={FileDown}
            onClick={handleExportPDF}
          >
            Exportar PDF
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={Edit2}
            onClick={() => setIsEditModalOpen(true)}
          >
            Editar
          </Button>
          <Button
            variant="danger"
            size="sm"
            leftIcon={Trash2}
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Machine Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status Card */}
          <Card>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <StatusBadge status={machine.status} />
              </div>
              
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Atualizar Status
                </label>
                <select
                  value={machine.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Details Card */}
          <Card>
            <CardHeader title="Detalhes da Máquina" />
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Printer className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Marca e Modelo</p>
                  <p className="font-medium">{machine.brand} {machine.model}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Patrimônio</p>
                  <p className="font-medium">{machine.patrimony}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Local</p>
                  <p className="font-medium">{machine.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Técnico Responsável</p>
                  <p className="font-medium">{machine.technician}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Data de Entrada</p>
                  <p className="font-medium">{formatDate(machine.entryDate)}</p>
                  <p className="text-xs text-gray-500">{formatRelativeTime(machine.entryDate)}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Problem Description */}
          <Card>
            <CardHeader title="Descrição do Problema" />
            <p className="text-gray-700 whitespace-pre-wrap">
              {machine.problemDescription}
            </p>
          </Card>

          {/* Photos */}
          <Card>
            <CardHeader title="Fotos" />
            <PhotoGallery 
              photos={machine.photos} 
              onAddPhoto={handleAddPhoto}
            />
          </Card>
        </div>

        {/* Right Column - Service Log */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Update */}
          <QuickUpdate 
            machineId={machine.id}
            onSubmit={handleAddServiceEntry}
          />

          {/* Service History */}
          <Card>
            <CardHeader 
              title="Histórico de Serviço" 
              subtitle={`${machine.serviceLog.length} registros`}
            />
            <ServiceLog entries={machine.serviceLog} />
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <MachineForm
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateMachine}
        initialData={machine}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteMachine}
        title="Excluir Máquina"
        message={`Tem certeza que deseja excluir ${machine.brand} ${machine.model}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        variant="danger"
      />
    </div>
  );
}

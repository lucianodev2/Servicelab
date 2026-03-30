import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input, TextArea, Select } from '../common/Input';
import { BRAND_OPTIONS, LOCATION_OPTIONS, MACHINE_STATUS } from '../../utils/constants';
import { getTodayDateString } from '../../utils/helpers';

const statusOptions = [
  { value: MACHINE_STATUS.RECEIVED, label: 'Received' },
  { value: MACHINE_STATUS.DIAGNOSIS, label: 'In Diagnosis' },
  { value: MACHINE_STATUS.WAITING_PARTS, label: 'Waiting Parts' },
  { value: MACHINE_STATUS.IN_REPAIR, label: 'In Repair' },
  { value: MACHINE_STATUS.COMPLETED, label: 'Completed' },
  { value: MACHINE_STATUS.DELIVERED, label: 'Delivered' },
];

export function MachineForm({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    serialNumber: '',
    brand: '',
    model: '',
    location: '',
    locationDetail: '',
    entryDate: getTodayDateString(),
    problemDescription: '',
    status: MACHINE_STATUS.RECEIVED,
    isUrgent: false,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        serialNumber: initialData.serialNumber || '',
        brand: initialData.brand || '',
        model: initialData.model || '',
        location: initialData.location || '',
        locationDetail: initialData.locationDetail || '',
        entryDate: initialData.entryDate ? initialData.entryDate.split('T')[0] : getTodayDateString(),
        problemDescription: initialData.problemDescription || '',
        status: initialData.status || MACHINE_STATUS.RECEIVED,
        isUrgent: initialData.isUrgent || false,
      });
    } else {
      setFormData({
        serialNumber: '',
        brand: '',
        model: '',
        location: '',
        locationDetail: '',
        entryDate: getTodayDateString(),
        problemDescription: '',
        status: MACHINE_STATUS.RECEIVED,
        isUrgent: false,
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.serialNumber.trim()) newErrors.serialNumber = 'Serial number is required';
    if (!formData.brand) newErrors.brand = 'Brand is required';
    if (!formData.model.trim()) newErrors.model = 'Model is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.problemDescription.trim()) newErrors.problemDescription = 'Problem description is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        entryDate: new Date(formData.entryDate).toISOString(),
      });
      onClose();
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Máquina' : 'Adicionar Nova Máquina'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            {initialData ? 'Salvar Alterações' : 'Adicionar Máquina'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Número de Série"
            value={formData.serialNumber}
            onChange={(e) => handleChange('serialNumber', e.target.value)}
            error={errors.serialNumber}
            required
            placeholder="ex: SN123456789"
          />
          
          <Select
            label="Marca"
            value={formData.brand}
            onChange={(e) => handleChange('brand', e.target.value)}
            options={BRAND_OPTIONS.map(b => ({ value: b, label: b }))}
            error={errors.brand}
            required
          />
        </div>

        <Input
          label="Modelo"
          value={formData.model}
          onChange={(e) => handleChange('model', e.target.value)}
          error={errors.model}
          required
          placeholder="ex: LaserJet Pro M404n"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Localização"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            options={LOCATION_OPTIONS}
            error={errors.location}
            required
          />
          
          <Input
            label="Detalhe da Localização"
            value={formData.locationDetail}
            onChange={(e) => handleChange('locationDetail', e.target.value)}
            placeholder="ex: Bancada A3, Andar 2"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Data de Entrada"
            type="date"
            value={formData.entryDate}
            onChange={(e) => handleChange('entryDate', e.target.value)}
            required
          />
          
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            options={statusOptions}
            required
          />
        </div>

        <TextArea
          label="Descrição do Problema"
          value={formData.problemDescription}
          onChange={(e) => handleChange('problemDescription', e.target.value)}
          error={errors.problemDescription}
          required
          rows={3}
          placeholder="Descreva o problema desta máquina..."
        />

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="isUrgent"
            checked={formData.isUrgent}
            onChange={(e) => handleChange('isUrgent', e.target.checked)}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <label htmlFor="isUrgent" className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
            <AlertCircle className="w-4 h-4 text-red-500" />
            Marcar como urgente
          </label>
        </div>
      </form>
    </Modal>
  );
}

import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input, TextArea, Select } from '../common/Input';
import { BRAND_OPTIONS, getModelsByBrand, LOCATION_OPTIONS, MACHINE_STATUS } from '../../utils/constants';
import { getTodayDateString } from '../../utils/helpers';

const statusOptions = [
  { value: MACHINE_STATUS.MAINTENANCE, label: 'Em Manutenção' },
  { value: MACHINE_STATUS.WAITING_PARTS, label: 'Aguardando Peça' },
  { value: MACHINE_STATUS.TESTING, label: 'Em Teste' },
  { value: MACHINE_STATUS.READY, label: 'Pronta para Entrega' },
  { value: MACHINE_STATUS.COMPLETED, label: 'Finalizada' },
];

export function MachineForm({ isOpen, onClose, onSubmit, initialData = null, submitting = false }) {
  const [formData, setFormData] = useState({
    serialNumber: '',
    brand: '',
    model: '',
    patrimony: '',
    location: '',
    technician: '',
    entryDate: getTodayDateString(),
    problemDescription: '',
    status: MACHINE_STATUS.MAINTENANCE,
  });
  const [errors, setErrors] = useState({});
  const [availableModels, setAvailableModels] = useState([]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        serialNumber: initialData.serialNumber || '',
        brand: initialData.brand || '',
        model: initialData.model || '',
        patrimony: initialData.patrimony || '',
        location: initialData.location || '',
        technician: initialData.technician || '',
        entryDate: initialData.entryDate ? initialData.entryDate.split('T')[0] : getTodayDateString(),
        problemDescription: initialData.problemDescription || '',
        status: initialData.status || MACHINE_STATUS.MAINTENANCE,
      });
      if (initialData.brand) {
        setAvailableModels(getModelsByBrand(initialData.brand));
      }
    } else {
      setFormData({
        serialNumber: '',
        brand: '',
        model: '',
        patrimony: '',
        location: '',
        technician: '',
        entryDate: getTodayDateString(),
        problemDescription: '',
        status: MACHINE_STATUS.MAINTENANCE,
      });
      setAvailableModels([]);
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.serialNumber.trim()) newErrors.serialNumber = 'Número de série é obrigatório';
    if (!formData.brand) newErrors.brand = 'Marca é obrigatória';
    if (!formData.model) newErrors.model = 'Modelo é obrigatório';
    if (!formData.patrimony.trim()) newErrors.patrimony = 'Patrimônio é obrigatório';
    if (!formData.location.trim()) newErrors.location = 'Local é obrigatório';
    if (!formData.technician.trim()) newErrors.technician = 'Técnico é obrigatório';
    if (!formData.problemDescription.trim()) newErrors.problemDescription = 'Descrição do problema é obrigatória';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBrandChange = (brand) => {
    setFormData(prev => ({ ...prev, brand, model: '' }));
    setAvailableModels(getModelsByBrand(brand));
    if (errors.brand) {
      setErrors(prev => ({ ...prev, brand: undefined }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        entryDate: new Date(formData.entryDate).toISOString(),
      });
      // Não fecha aqui — Machines.jsx fecha após sucesso da API
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
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <span className="flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                Salvando...
              </span>
            ) : initialData ? 'Salvar Alterações' : 'Adicionar Máquina'}
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
          
          <Input
            label="Patrimônio"
            value={formData.patrimony}
            onChange={(e) => handleChange('patrimony', e.target.value)}
            error={errors.patrimony}
            required
            placeholder="ex: PAT-001"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Marca"
            value={formData.brand}
            onChange={(e) => handleBrandChange(e.target.value)}
            options={BRAND_OPTIONS.map(b => ({ value: b, label: b }))}
            error={errors.brand}
            required
          />
          
          <Select
            label="Modelo"
            value={formData.model}
            onChange={(e) => handleChange('model', e.target.value)}
            options={availableModels.map(m => ({ value: m, label: m }))}
            error={errors.model}
            required
            disabled={!formData.brand}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Local do Equipamento"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            error={errors.location}
            required
            placeholder="ex: Laboratório, Cliente - Contabilidade"
          />
          
          <Input
            label="Técnico Responsável"
            value={formData.technician}
            onChange={(e) => handleChange('technician', e.target.value)}
            error={errors.technician}
            required
            placeholder="ex: João Silva"
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
      </form>
    </Modal>
  );
}

import React, { useState, useRef } from 'react';
import { Send, Wrench, ClipboardCheck, FileText, User, Camera, X } from 'lucide-react';
import { Button } from '../common/Button';
import { VoiceInput } from '../common/VoiceInput';
import { SERVICE_ENTRY_TYPES } from '../../utils/constants';
import { generateId } from '../../utils/helpers';

const quickActions = [
  { type: SERVICE_ENTRY_TYPES.ACTION, label: 'Ação', icon: Wrench, color: 'blue' },
  { type: SERVICE_ENTRY_TYPES.TEST, label: 'Teste', icon: ClipboardCheck, color: 'green' },
  { type: SERVICE_ENTRY_TYPES.NOTE, label: 'Nota', icon: FileText, color: 'gray' },
];

export function QuickUpdate({ onSubmit, machineId, defaultTechnician = '' }) {
  const [selectedType, setSelectedType] = useState(SERVICE_ENTRY_TYPES.ACTION);
  const [description, setDescription] = useState('');
  const [technician, setTechnician] = useState(defaultTechnician);
  const [photos, setPhotos] = useState([]);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim() && photos.length === 0) return;

    const entry = {
      id: generateId(),
      machineId,
      type: selectedType,
      description: description.trim() || (photos.length > 0 ? 'Fotos do teste/serviço' : ''),
      technician: technician || 'Técnico',
      photos: photos,
      timestamp: new Date().toISOString(),
    };

    onSubmit(entry);
    setDescription('');
    setPhotos([]);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Adicionar Registro</h4>
      
      {/* Action Type Selector */}
      <div className="flex flex-wrap gap-2 mb-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          const isSelected = selectedType === action.type;
          return (
            <button
              key={action.type}
              type="button"
              onClick={() => setSelectedType(action.type)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${isSelected 
                  ? `bg-${action.color}-100 text-${action.color}-700 ring-2 ring-${action.color}-500` 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {action.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Technician */}
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Técnico responsável"
            value={technician}
            onChange={(e) => setTechnician(e.target.value)}
            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <VoiceInput
          value={description}
          onChange={setDescription}
          placeholder={`Descreva a ${selectedType === 'action' ? 'ação' : selectedType === 'test' ? 'teste' : 'nota'}...`}
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            leftIcon={Send}
            disabled={!description.trim()}
          >
            Adicionar Registro
          </Button>
        </div>
      </form>
    </div>
  );
}

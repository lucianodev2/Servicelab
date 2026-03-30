import React, { useState } from 'react';
import { Send, Wrench, Puzzle, ClipboardCheck, FileText, Camera } from 'lucide-react';
import { Button } from '../common/Button';
import { VoiceInput } from '../common/VoiceInput';
import { SERVICE_ENTRY_TYPES } from '../../utils/constants';
import { generateId } from '../../utils/helpers';

const quickActions = [
  { type: SERVICE_ENTRY_TYPES.ACTION, label: 'Action', icon: Wrench, color: 'blue' },
  { type: SERVICE_ENTRY_TYPES.PART_REPLACED, label: 'Part', icon: Puzzle, color: 'purple' },
  { type: SERVICE_ENTRY_TYPES.TEST, label: 'Test', icon: ClipboardCheck, color: 'green' },
  { type: SERVICE_ENTRY_TYPES.NOTE, label: 'Note', icon: FileText, color: 'gray' },
];

export function QuickUpdate({ onSubmit, machineId }) {
  const [selectedType, setSelectedType] = useState(SERVICE_ENTRY_TYPES.ACTION);
  const [description, setDescription] = useState('');
  const [partsUsed, setPartsUsed] = useState([{ name: '', quantity: 1 }]);
  const [showPartsInput, setShowPartsInput] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    const entry = {
      id: generateId(),
      machineId,
      type: selectedType,
      description: description.trim(),
      partsUsed: selectedType === SERVICE_ENTRY_TYPES.PART_REPLACED 
        ? partsUsed.filter(p => p.name.trim())
        : [],
      photos: [],
      timestamp: new Date().toISOString(),
      createdBy: 'Technician'
    };

    onSubmit(entry);
    setDescription('');
    setPartsUsed([{ name: '', quantity: 1 }]);
    setShowPartsInput(false);
  };

  const addPartField = () => {
    setPartsUsed([...partsUsed, { name: '', quantity: 1 }]);
  };

  const updatePart = (index, field, value) => {
    const updated = [...partsUsed];
    updated[index][field] = field === 'quantity' ? parseInt(value) || 1 : value;
    setPartsUsed(updated);
  };

  const removePart = (index) => {
    setPartsUsed(partsUsed.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Update</h4>
      
      {/* Action Type Selector */}
      <div className="flex flex-wrap gap-2 mb-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          const isSelected = selectedType === action.type;
          return (
            <button
              key={action.type}
              type="button"
              onClick={() => {
                setSelectedType(action.type);
                setShowPartsInput(action.type === SERVICE_ENTRY_TYPES.PART_REPLACED);
              }}
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
        <VoiceInput
          value={description}
          onChange={setDescription}
          placeholder={`Describe the ${selectedType.replace('_', ' ')}...`}
        />

        {/* Parts Input */}
        {showPartsInput && (
          <div className="space-y-2 p-3 bg-white rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-700">Parts Used</p>
            {partsUsed.map((part, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Part name"
                  value={part.name}
                  onChange={(e) => updatePart(index, 'name', e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="number"
                  min="1"
                  value={part.quantity}
                  onChange={(e) => updatePart(index, 'quantity', e.target.value)}
                  className="w-20 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {partsUsed.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePart(index)}
                    className="px-2 py-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addPartField}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              + Add another part
            </button>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            leftIcon={Send}
            disabled={!description.trim()}
          >
            Add Update
          </Button>
        </div>
      </form>
    </div>
  );
}

import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { MachineList } from '../components/machines/MachineList';
import { MachineForm } from '../components/machines/MachineForm';
import { Button } from '../components/common/Button';
import { useApp } from '../context/AppContext';

export function Machines() {
  const { machines, addMachine } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const searchQuery = searchParams.get('search') || '';
  const showNewForm = searchParams.get('action') === 'new';

  React.useEffect(() => {
    if (showNewForm) {
      setIsFormOpen(true);
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [showNewForm]);

  const handleAddMachine = (machineData) => {
    addMachine(machineData);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Máquinas</h1>
          <p className="text-gray-500 mt-1">
            Gerencie e acompanhe todas as impressoras do seu laboratório
          </p>
        </div>
        <Button
          leftIcon={Plus}
          onClick={() => setIsFormOpen(true)}
          className="hidden sm:flex"
        >
          Adicionar Máquina
        </Button>
      </div>

      <MachineList machines={machines} searchQuery={searchQuery} />

      {/* Floating Action Button for Mobile */}
      <button
        onClick={() => setIsFormOpen(true)}
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-700 transition-colors z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      <MachineForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleAddMachine}
      />
    </div>
  );
}

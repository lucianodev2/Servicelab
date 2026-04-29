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
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const searchQuery = searchParams.get('search') || '';
  const statusFromUrl = searchParams.get('status') || 'all';
  const showNewForm = searchParams.get('action') === 'new';

  React.useEffect(() => {
    if (showNewForm) {
      setIsFormOpen(true);
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [showNewForm]);

  // Aguarda a API e mantém a lista estável — sem flickering
  const handleAddMachine = async (machineData) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await addMachine(machineData);
      setIsFormOpen(false);
    } catch (err) {
      setSubmitError(err.message || 'Erro ao cadastrar máquina. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
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
          onClick={() => { setIsFormOpen(true); setSubmitError(null); }}
          className="hidden sm:flex"
        >
          Adicionar Máquina
        </Button>
      </div>

      {/* Erro de cadastro */}
      {submitError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center justify-between">
          <span>{submitError}</span>
          <button onClick={() => setSubmitError(null)} className="ml-2 text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      <MachineList
        machines={machines}
        searchQuery={searchQuery}
        initialStatusFilter={statusFromUrl}
      />

      {/* Floating Action Button para Mobile */}
      <button
        onClick={() => { setIsFormOpen(true); setSubmitError(null); }}
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-40"
        style={{ background: 'linear-gradient(135deg, #1e88e5 0%, #7b1fa2 100%)' }}
      >
        <Plus className="w-6 h-6" />
      </button>

      <MachineForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSubmitError(null); }}
        onSubmit={handleAddMachine}
        submitting={submitting}
      />
    </div>
  );
}

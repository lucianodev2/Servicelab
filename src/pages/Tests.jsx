import React, { useState, useMemo, useRef } from 'react';
import { Camera, X, Search, Calendar, User, ClipboardCheck, Plus, Trash2 } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useApp } from '../context/AppContext';
import { formatDate, formatDateTime, generateId } from '../utils/helpers';

export function Tests() {
  const { machines, updateMachine } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMachine, setSelectedMachine] = useState('');
  const [description, setDescription] = useState('');
  const [technician, setTechnician] = useState('');
  const [photos, setPhotos] = useState([]);
  const fileInputRef = useRef(null);

  // Get all test entries from all machines
  const allTests = useMemo(() => {
    return machines
      .flatMap(machine => 
        (machine.tests || []).map(test => ({
          ...test,
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

  // Filter tests
  const filteredTests = useMemo(() => {
    return allTests.filter(test => {
      const matchesSearch = 
        test.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.machine.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.machine.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.technician?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesMachine = !selectedMachine || test.machine.id === selectedMachine;
      
      return matchesSearch && matchesMachine;
    });
  }, [allTests, searchTerm, selectedMachine]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedMachine || !description.trim()) return;

    const newTest = {
      id: generateId(),
      description: description.trim(),
      technician: technician || 'Técnico',
      photos: photos,
      timestamp: new Date().toISOString(),
    };

    const machine = machines.find(m => m.id === selectedMachine);
    if (machine) {
      updateMachine(selectedMachine, {
        tests: [...(machine.tests || []), newTest]
      });
    }

    // Reset form
    setDescription('');
    setPhotos([]);
    setTechnician('');
  };

  const handleDeleteTest = (machineId, testId) => {
    const machine = machines.find(m => m.id === machineId);
    if (machine) {
      updateMachine(machineId, {
        tests: (machine.tests || []).filter(t => t.id !== testId)
      });
    }
  };

  // Group tests by date
  const groupedTests = useMemo(() => {
    const groups = {};
    filteredTests.forEach(test => {
      const date = formatDate(test.timestamp);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(test);
    });
    return groups;
  }, [filteredTests]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Testes</h1>
        <p className="text-gray-500 mt-1">
          Registre fotos e descrições dos testes realizados nas máquinas
        </p>
      </div>

      {/* Add Test Form */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary-500" />
          Novo Teste
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Machine Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Máquina *
              </label>
              <select
                value={selectedMachine}
                onChange={(e) => setSelectedMachine(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                required
              >
                <option value="">Selecione uma máquina</option>
                {machines.map(machine => (
                  <option key={machine.id} value={machine.id}>
                    {machine.brand} {machine.model} - S/N: {machine.serialNumber}
                  </option>
                ))}
              </select>
            </div>

            {/* Technician */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Técnico
              </label>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={technician}
                  onChange={(e) => setTechnician(e.target.value)}
                  placeholder="Nome do técnico"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição do Teste *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o que foi testado, resultados, observações..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              required
            />
          </div>

          {/* Photo Upload */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Fotos do Teste
            </label>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              multiple
              className="hidden"
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Camera className="w-4 h-4" />
              {photos.length > 0 ? `${photos.length} foto(s) selecionada(s)` : 'Adicionar Fotos'}
            </button>

            {/* Photo Preview */}
            {photos.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              leftIcon={ClipboardCheck}
              disabled={!selectedMachine || !description.trim()}
            >
              Salvar Teste
            </Button>
          </div>
        </form>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar testes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <select
          value={selectedMachine}
          onChange={(e) => setSelectedMachine(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          <option value="">Todas as máquinas</option>
          {machines.map(machine => (
            <option key={machine.id} value={machine.id}>
              {machine.brand} {machine.model}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="text-sm text-gray-500">
        Mostrando {filteredTests.length} de {allTests.length} testes
      </div>

      {/* Tests List */}
      {Object.keys(groupedTests).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedTests).map(([date, tests]) => (
            <div key={date}>
              {/* Date Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{date}</h3>
                  <p className="text-sm text-gray-500">{tests.length} teste(s)</p>
                </div>
              </div>

              {/* Tests */}
              <div className="space-y-4 ml-6 border-l-2 border-gray-200 pl-6">
                {tests.map((test) => (
                  <Card key={test.id} className="hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Machine Info */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-900">
                            {test.machine.brand} {test.machine.model}
                          </span>
                          <span className="text-xs text-gray-400">
                            S/N: {test.machine.serialNumber}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-gray-700 whitespace-pre-wrap">{test.description}</p>

                        {/* Technician & Time */}
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          {test.technician && (
                            <div className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              <span>{test.technician}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formatDateTime(test.timestamp).split(' ')[1]}</span>
                          </div>
                        </div>

                        {/* Photos */}
                        {test.photos && test.photos.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {test.photos.map((photo, idx) => (
                              <img
                                key={idx}
                                src={photo}
                                alt={`Foto ${idx + 1}`}
                                className="w-24 h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(photo, '_blank')}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteTest(test.machine.id, test.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir teste"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <ClipboardCheck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {searchTerm || selectedMachine ? 'Nenhum teste encontrado' : 'Nenhum teste registrado'}
          </h3>
          <p className="text-gray-500">
            {searchTerm || selectedMachine
              ? 'Tente ajustar sua busca'
              : 'Adicione seu primeiro teste usando o formulário acima'}
          </p>
        </div>
      )}
    </div>
  );
}

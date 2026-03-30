import React, { useState } from 'react';
import { Plus, CheckSquare, Calendar, AlertCircle, Clock } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input, Select } from '../components/common/Input';
import { Modal, ConfirmModal } from '../components/common/Modal';
import { PriorityBadge } from '../components/common/Badge';
import { VoiceInput } from '../components/common/VoiceInput';
import { useApp } from '../context/AppContext';
import { PRIORITY_OPTIONS } from '../utils/constants';
import { formatDate, getTodayDateString } from '../utils/helpers';

export function Tasks() {
  const { tasks, machines, addTask, updateTask, deleteTask, toggleTaskStatus } = useApp();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [filter, setFilter] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: getTodayDateString(),
    machineId: '',
    futureNote: '', // Campo especial: Observação Futura
  });

  const filteredTarefas = tasks.filter(task => {
    if (filter === 'pending') return task.status === 'pending';
    if (filter === 'completed') return task.status === 'completed';
    if (filter === 'today') {
      return task.dueDate && task.dueDate.split('T')[0] === getTodayDateString();
    }
    return true;
  }).sort((a, b) => {
    // Sort by status (pending first), then by priority
    if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const todayCount = tasks.filter(t => 
    t.dueDate && t.dueDate.split('T')[0] === getTodayDateString()
  ).length;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const taskData = {
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      status: 'pending',
    };

    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
    
    closeForm();
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: getTodayDateString(),
      machineId: '',
      futureNote: '',
    });
  };

  const openEditForm = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      machineId: task.machineId || '',
      futureNote: task.futureNote || '',
    });
    setIsFormOpen(true);
  };

  const handleDelete = () => {
    if (deletingTask) {
      deleteTask(deletingTask.id);
      setDeletingTask(null);
    }
  };

  const machineOptions = [
    { value: '', label: 'Não relacionada à máquina' },
    ...machines.map(m => ({
      value: m.id,
      label: `${m.brand} ${m.model}`
    }))
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tarefas</h1>
          <p className="text-gray-500 mt-1">Gerencie seu trabalho diário</p>
        </div>
        <Button leftIcon={Plus} onClick={() => setIsFormOpen(true)}>
          Adicionar Tarefa
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => setFilter('all')}
          className={`p-4 rounded-xl text-left transition-colors ${
            filter === 'all' ? 'bg-primary-50 border-2 border-primary-200' : 'bg-white border border-gray-200'
          }`}
        >
          <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
          <p className="text-sm text-gray-500">Todas Tarefas</p>
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`p-4 rounded-xl text-left transition-colors ${
            filter === 'pending' ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-white border border-gray-200'
          }`}
        >
          <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
          <p className="text-sm text-gray-500">Pendentes</p>
        </button>
        <button
          onClick={() => setFilter('today')}
          className={`p-4 rounded-xl text-left transition-colors ${
            filter === 'today' ? 'bg-green-50 border-2 border-green-200' : 'bg-white border border-gray-200'
          }`}
        >
          <p className="text-2xl font-bold text-gray-900">{todayCount}</p>
          <p className="text-sm text-gray-500">Para Hoje</p>
        </button>
      </div>

      {/* Tarefas List */}
      <div className="space-y-3">
        {filteredTarefas.map(task => {
          const relatedMachine = machines.find(m => m.id === task.machineId);
          const isCompleted = task.status === 'completed';
          
          return (
            <Card
              key={task.id}
              className={`transition-all ${isCompleted ? 'opacity-60' : ''}`}
              padding="small"
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleTaskStatus(task.id)}
                  className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-primary-400'
                  }`}
                >
                  {isCompleted && <CheckSquare className="w-3.5 h-3.5" />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className={`font-medium ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className={`text-sm mt-1 ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                          {task.description}
                        </p>
                      )}
                    </div>
                    <PriorityBadge priority={task.priority} />
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    {task.dueDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(task.dueDate)}
                      </span>
                    )}
                    {relatedMachine && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {relatedMachine.brand} {relatedMachine.model}
                      </span>
                    )}
                  </div>
                  
                  {/* Observação Futura */}
                  {task.futureNote && (
                    <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="text-xs text-purple-700">
                        <span className="font-medium">Observação Futura:</span> {task.futureNote}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditForm(task)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => setDeletingTask(task)}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <CheckSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {filter === 'completed' ? 'Nenhuma tarefa concluída' : 'Nenhuma tarefa encontrada'}
          </h3>
          <p className="text-gray-500">
            {filter === 'all' ? 'Comece adicionando sua primeira tarefa' : 'Tente um filtro diferente'}
          </p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editingTask ? 'Editar Tarefa' : 'Adicionar Nova Tarefa'}
        footer={
          <>
            <Button variant="secondary" onClick={closeForm}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingTask ? 'Salvar Alterações' : 'Adicionar Tarefa'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Título da Tarefa"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="O que precisa ser feito?"
          />
          
          <VoiceInput
            value={formData.description}
            onChange={(value) => setFormData({ ...formData, description: value })}
            placeholder="Adicione detalhes (opcional)..."
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Prioridade"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              options={PRIORITY_OPTIONS}
              required
            />
            
            <Input
              label="Data de Vencimento"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>
          
          <Select
            label="Máquina Relacionada (Opcional)"
            value={formData.machineId}
            onChange={(e) => setFormData({ ...formData, machineId: e.target.value })}
            options={machineOptions}
          />
          
          {/* Campo Observação Futura */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Observação Futura (Opcional)
            </label>
            <p className="text-xs text-gray-500">
              Ex: "Quando chegar peça X, instalar na máquina série Y"
            </p>
            <textarea
              value={formData.futureNote}
              onChange={(e) => setFormData({ ...formData, futureNote: e.target.value })}
              placeholder="Adicione uma observação para o futuro..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDelete}
        title="Excluir Tarefa"
        message={`Tem certeza que deseja excluir "${deletingTask?.title}"?`}
        confirmText="Excluir"
        variant="danger"
      />
    </div>
  );
}

import React, { useState, useCallback } from 'react';
import { Plus, CheckSquare, Calendar, Clock, Loader, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input, Select } from '../components/common/Input';
import { Modal, ConfirmModal } from '../components/common/Modal';
import { PriorityBadge } from '../components/common/Badge';
import { VoiceInput } from '../components/common/VoiceInput';
import { useApp } from '../context/AppContext';
import { PRIORITY_OPTIONS } from '../utils/constants';
import { formatDate, getTodayDateString } from '../utils/helpers';

// Notificação de feedback (sucesso/erro)
function Toast({ message, type, onClose }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${
        type === 'success' ? 'bg-green-600' : 'bg-red-600'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle className="w-4 h-4 shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 shrink-0" />
      )}
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">✕</button>
    </div>
  );
}

export function Tasks() {
  const { tasks, machines, addTask, updateTask, deleteTask, toggleTaskStatus } = useApp();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [filter, setFilter] = useState('all');

  // Estados de loading por tarefa e de formulário
  const [loadingTaskId, setLoadingTaskId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: getTodayDateString(),
    machineId: '',
    futureNote: '',
  });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const filteredTarefas = tasks.filter(task => {
    if (filter === 'pending') return task.status === 'pending';
    if (filter === 'completed') return task.status === 'completed';
    if (filter === 'today') {
      return task.dueDate && task.dueDate.split('T')[0] === getTodayDateString();
    }
    return true;
  }).sort((a, b) => {
    if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const todayCount = tasks.filter(t =>
    t.dueDate && t.dueDate.split('T')[0] === getTodayDateString()
  ).length;

  // Alterna status com loading e feedback visual
  const handleToggle = async (taskId) => {
    if (loadingTaskId) return;
    setLoadingTaskId(taskId);
    try {
      await toggleTaskStatus(taskId);
      const task = tasks.find(t => t.id === taskId);
      const wasCompleted = task?.status === 'completed';
      showToast(
        wasCompleted ? 'Tarefa marcada como pendente' : 'Tarefa concluída!',
        'success'
      );
    } catch (err) {
      showToast('Erro ao atualizar tarefa. Tente novamente.', 'error');
    } finally {
      setLoadingTaskId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setSubmitting(true);
    try {
      const taskData = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        status: 'pending',
      };

      if (editingTask) {
        await updateTask(editingTask.id, taskData);
        showToast('Tarefa atualizada com sucesso!');
      } else {
        await addTask(taskData);
        showToast('Tarefa adicionada com sucesso!');
      }
      closeForm();
    } catch (err) {
      showToast('Erro ao salvar tarefa. Tente novamente.', 'error');
    } finally {
      setSubmitting(false);
    }
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

  const handleDelete = async () => {
    if (!deletingTask) return;
    try {
      await deleteTask(deletingTask.id);
      showToast('Tarefa excluída.');
    } catch {
      showToast('Erro ao excluir tarefa.', 'error');
    }
    setDeletingTask(null);
  };

  const machineOptions = [
    { value: '', label: 'Não relacionada à máquina' },
    ...machines.map(m => ({
      value: m.id,
      label: `${m.brand} ${m.model}`,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Toast de feedback */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tarefas</h1>
          <p className="text-gray-500 mt-1">Gerencie seu trabalho diário</p>
        </div>
        <Button leftIcon={Plus} onClick={() => setIsFormOpen(true)}>
          Adicionar Tarefa
        </Button>
      </div>

      {/* Contadores / Filtros */}
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

      {/* Lista de tarefas */}
      <div className="space-y-3">
        {filteredTarefas.map(task => {
          const relatedMachine = machines.find(m => m.id === task.machineId);
          const isCompleted = task.status === 'completed';
          const isLoading = loadingTaskId === task.id;

          return (
            <Card
              key={task.id}
              className={`transition-all ${isCompleted ? 'opacity-60' : ''}`}
              padding="small"
            >
              <div className="flex items-start gap-3">
                {/* Checkbox com loading */}
                <button
                  onClick={() => handleToggle(task.id)}
                  disabled={!!loadingTaskId}
                  className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                    isLoading
                      ? 'border-blue-400 bg-blue-50 cursor-wait'
                      : isCompleted
                      ? 'bg-green-500 border-green-500 text-white hover:bg-green-600'
                      : 'border-gray-300 hover:border-primary-400 cursor-pointer'
                  }`}
                  title={isCompleted ? 'Marcar como pendente' : 'Marcar como concluída'}
                >
                  {isLoading ? (
                    <Loader className="w-3 h-3 text-blue-500 animate-spin" />
                  ) : isCompleted ? (
                    <CheckSquare className="w-3.5 h-3.5" />
                  ) : null}
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

                  {task.futureNote && (
                    <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="text-xs text-purple-700">
                        <span className="font-medium">Observação Futura:</span> {task.futureNote}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditForm(task)}
                    disabled={!!loadingTaskId}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => setDeletingTask(task)}
                    disabled={!!loadingTaskId}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredTarefas.length === 0 && (
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

      {/* Modal Adicionar/Editar */}
      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editingTask ? 'Editar Tarefa' : 'Adicionar Nova Tarefa'}
        footer={
          <>
            <Button variant="secondary" onClick={closeForm} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  Salvando...
                </span>
              ) : editingTask ? 'Salvar Alterações' : 'Adicionar Tarefa'}
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

      {/* Modal de Exclusão */}
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

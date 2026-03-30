import React, { useState } from 'react';
import { Plus, StickyNote, Trash2, Edit2, Pin, Search, X } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal, ConfirmModal } from '../components/common/Modal';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateId, getTodayISO } from '../utils/helpers';

const NOTE_COLORS = [
  { name: 'Amarelo', bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-900' },
  { name: 'Azul', bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-900' },
  { name: 'Verde', bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-900' },
  { name: 'Rosa', bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-900' },
  { name: 'Roxo', bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-900' },
  { name: 'Laranja', bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-900' },
];

export function Notes() {
  const [notes, setNotes] = useLocalStorage('servicelab_notes', []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [deletingNote, setDeletingNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterColor, setFilterColor] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    color: NOTE_COLORS[0],
    isPinned: false,
  });

  const filteredNotes = notes
    .filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          note.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesColor = filterColor === 'all' || note.color.name === filterColor;
      return matchesSearch && matchesColor;
    })
    .sort((a, b) => {
      // Pinned notes first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // Then by date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const noteData = {
      ...formData,
      id: editingNote ? editingNote.id : generateId(),
      createdAt: editingNote ? editingNote.createdAt : getTodayISO(),
      updatedAt: getTodayISO(),
    };

    if (editingNote) {
      setNotes(prev => prev.map(n => n.id === editingNote.id ? noteData : n));
    } else {
      setNotes(prev => [noteData, ...prev]);
    }
    
    closeForm();
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingNote(null);
    setFormData({
      title: '',
      content: '',
      color: NOTE_COLORS[0],
      isPinned: false,
    });
  };

  const openEditForm = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      color: note.color,
      isPinned: note.isPinned,
    });
    setIsFormOpen(true);
  };

  const handleDelete = () => {
    if (deletingNote) {
      setNotes(prev => prev.filter(n => n.id !== deletingNote.id));
      setDeletingNote(null);
    }
  };

  const togglePin = (noteId) => {
    setNotes(prev => prev.map(n => 
      n.id === noteId ? { ...n, isPinned: !n.isPinned } : n
    ));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterColor('all');
  };

  const hasFilters = searchTerm || filterColor !== 'all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notas</h1>
          <p className="text-gray-500 mt-1">Lembretes e anotações gerais</p>
        </div>
        <Button leftIcon={Plus} onClick={() => setIsFormOpen(true)}>
          Nova Nota
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar notas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <select
          value={filterColor}
          onChange={(e) => setFilterColor(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          <option value="all">Todas as cores</option>
          {NOTE_COLORS.map(color => (
            <option key={color.name} value={color.name}>{color.name}</option>
          ))}
        </select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} leftIcon={X}>
            Limpar
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span>Total: {notes.length} notas</span>
        <span>•</span>
        <span>Fixadas: {notes.filter(n => n.isPinned).length}</span>
        {hasFilters && (
          <>
            <span>•</span>
            <span className="text-primary-600">Mostrando: {filteredNotes.length}</span>
          </>
        )}
      </div>

      {/* Notes Grid */}
      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map(note => (
            <Card 
              key={note.id} 
              className={`${note.color.bg} ${note.color.border} border-2 relative group transition-all hover:shadow-md`}
              padding="small"
            >
              {/* Pin Button */}
              <button
                onClick={() => togglePin(note.id)}
                className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors ${
                  note.isPinned 
                    ? 'text-yellow-600 bg-yellow-200' 
                    : 'text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100'
                }`}
              >
                <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-current' : ''}`} />
              </button>

              <div className="pr-8">
                <h3 className={`font-semibold ${note.color.text} mb-2`}>
                  {note.title}
                </h3>
                <p className={`${note.color.text} opacity-90 whitespace-pre-wrap text-sm`}>
                  {note.content}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-black/10">
                <span className="text-xs text-gray-500">
                  {new Date(note.updatedAt).toLocaleDateString('pt-BR')}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditForm(note)}
                    className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-white/50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingNote(note)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-white/50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <StickyNote className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {hasFilters ? 'Nenhuma nota encontrada' : 'Nenhuma nota ainda'}
          </h3>
          <p className="text-gray-500">
            {hasFilters 
              ? 'Tente ajustar seus filtros' 
              : 'Crie sua primeira nota para lembretes e anotações'}
          </p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editingNote ? 'Editar Nota' : 'Nova Nota'}
        footer={
          <>
            <Button variant="secondary" onClick={closeForm}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingNote ? 'Salvar Alterações' : 'Criar Nota'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Título"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="Ex: Comprar toner HP"
          />
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Conteúdo
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={4}
              placeholder="Escreva seu lembrete aqui..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Cor da Nota
            </label>
            <div className="flex flex-wrap gap-2">
              {NOTE_COLORS.map(color => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-10 h-10 rounded-lg ${color.bg} ${color.border} border-2 transition-all ${
                    formData.color.name === color.name 
                      ? 'ring-2 ring-offset-2 ring-primary-500 scale-110' 
                      : 'hover:scale-105'
                  }`}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Pin Option */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="isPinned"
              checked={formData.isPinned}
              onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="isPinned" className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
              <Pin className="w-4 h-4" />
              Fixar no topo
            </label>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingNote}
        onClose={() => setDeletingNote(null)}
        onConfirm={handleDelete}
        title="Excluir Nota"
        message={`Tem certeza que deseja excluir a nota "${deletingNote?.title}"?`}
        confirmText="Excluir"
        variant="danger"
      />
    </div>
  );
}

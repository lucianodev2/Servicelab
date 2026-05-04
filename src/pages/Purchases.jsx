import React, { useState, useMemo } from 'react';
import {
  ShoppingCart, Plus, Pencil, Trash2, CheckCircle2,
  FileDown, ClipboardList, X, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generatePurchaseReport } from '../utils/pdfExport';

// ── Constantes ────────────────────────────────────────────────────────────────

const PRIORITY_LABELS   = { low: 'Baixa', medium: 'Média', high: 'Alta' };
const STATUS_LABELS     = { pending: 'Pendente', purchased: 'Comprado' };

const PRIORITY_BADGE = {
  high:   'bg-red-100 text-red-700 border border-red-200',
  medium: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  low:    'bg-gray-100 text-gray-600 border border-gray-200',
};
const STATUS_BADGE = {
  pending:   'bg-blue-100 text-blue-700 border border-blue-200',
  purchased: 'bg-green-100 text-green-700 border border-green-200',
};

const EMPTY_FORM = { name: '', description: '', quantity: 1, priority: 'medium', status: 'pending' };

// ── Componente principal ──────────────────────────────────────────────────────

export function Purchases() {
  const { purchases, addPurchase, updatePurchase, deletePurchase } = useApp();

  const [formOpen, setFormOpen]   = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  const [statusFilter, setStatusFilter]     = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const [summaryOpen, setSummaryOpen] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  // ── Filtragem ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return purchases.filter(p => {
      if (statusFilter   !== 'all' && p.status   !== statusFilter)   return false;
      if (priorityFilter !== 'all' && p.priority !== priorityFilter) return false;
      return true;
    });
  }, [purchases, statusFilter, priorityFilter]);

  // ── Stats ──────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:     purchases.length,
    pending:   purchases.filter(p => p.status === 'pending').length,
    purchased: purchases.filter(p => p.status === 'purchased').length,
    highPrio:  purchases.filter(p => p.priority === 'high' && p.status === 'pending').length,
  }), [purchases]);

  // ── Handlers de formulário ─────────────────────────────────────
  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name:        item.name,
      description: item.description || '',
      quantity:    item.quantity,
      priority:    item.priority,
      status:      item.status,
    });
    setFormError('');
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setFormError('O nome do item é obrigatório.'); return; }
    if (form.quantity < 1)  { setFormError('A quantidade deve ser pelo menos 1.'); return; }
    setFormError('');
    try {
      if (editing) {
        updatePurchase(editing.id, form);
      } else {
        addPurchase(form);
      }
      closeForm();
    } catch {
      setFormError('Erro ao salvar item. Tente novamente.');
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm('Excluir este item da lista de compras?')) return;
    deletePurchase(id);
  };

  const handleToggleStatus = (item) => {
    const next = item.status === 'pending' ? 'purchased' : 'pending';
    updatePurchase(item.id, { ...item, status: next });
  };

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try { await generatePurchaseReport(filtered); }
    finally { setExportingPdf(false); }
  };

  // ── Resumo para supervisor ─────────────────────────────────────
  const summaryText = useMemo(() => {
    const now = new Date().toLocaleString('pt-BR');
    const pendentes = purchases.filter(p => p.status === 'pending');
    if (!pendentes.length) return `Resumo de Compras — ServiceLab\nData: ${now}\n\nNenhum item pendente.`;

    const byPriority = { high: [], medium: [], low: [] };
    pendentes.forEach(p => (byPriority[p.priority] || byPriority.medium).push(p));

    const lines = [
      `📋 Resumo de Compras — ServiceLab`,
      `Data: ${now}`,
      '',
    ];

    const sections = [
      { key: 'high',   emoji: '🔴', label: 'Alta Prioridade' },
      { key: 'medium', emoji: '🟡', label: 'Média Prioridade' },
      { key: 'low',    emoji: '⚪', label: 'Baixa Prioridade' },
    ];
    sections.forEach(({ key, emoji, label }) => {
      const items = byPriority[key];
      if (!items.length) return;
      lines.push(`${emoji} ${label} (${items.length} item${items.length > 1 ? 's' : ''}):`);
      items.forEach(p => {
        lines.push(`  • ${p.name} — Qtd: ${p.quantity}${p.description ? ` — ${p.description}` : ''}`);
      });
      lines.push('');
    });

    lines.push(`Total de itens pendentes: ${pendentes.length}`);
    return lines.join('\n');
  }, [purchases]);

  const handleCopySummary = () => {
    navigator.clipboard.writeText(summaryText).catch(() => {});
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compras</h1>
          <p className="text-gray-500 mt-1">Gerencie os itens que precisam ser adquiridos para o laboratório</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSummaryOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 text-sm font-medium transition-colors"
          >
            <ClipboardList className="w-4 h-4" />
            Resumo Supervisor
          </button>
          <button
            onClick={handleExportPdf}
            disabled={exportingPdf}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium transition-colors disabled:opacity-60"
          >
            <FileDown className="w-4 h-4" />
            {exportingPdf ? 'Exportando…' : 'Exportar PDF'}
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' }}
          >
            <Plus className="w-4 h-4" />
            Novo Item
          </button>
        </div>
      </div>

      {/* Cards de stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total',               value: stats.total,     color: 'text-gray-700',   bg: 'bg-gray-50' },
          { label: 'Pendentes',           value: stats.pending,   color: 'text-blue-700',   bg: 'bg-blue-50' },
          { label: 'Comprados',           value: stats.purchased, color: 'text-green-700',  bg: 'bg-green-50' },
          { label: 'Alta Prio. Pendente', value: stats.highPrio,  color: 'text-red-700',    bg: 'bg-red-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
            <p className="text-xs font-medium text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="all">Todos os Status</option>
            <option value="pending">Pendente</option>
            <option value="purchased">Comprado</option>
          </select>
        </div>
        <div>
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="all">Todas as Prioridades</option>
            <option value="high">Alta</option>
            <option value="medium">Média</option>
            <option value="low">Baixa</option>
          </select>
        </div>
        {(statusFilter !== 'all' || priorityFilter !== 'all') && (
          <button
            onClick={() => { setStatusFilter('all'); setPriorityFilter('all'); }}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <X className="w-3.5 h-3.5" /> Limpar filtros
          </button>
        )}
        <span className="ml-auto self-center text-sm text-gray-500">
          {filtered.length} de {purchases.length} item{purchases.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Lista de itens */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-700 mb-1">
            {purchases.length === 0 ? 'Nenhum item cadastrado' : 'Nenhum item encontrado'}
          </h3>
          <p className="text-sm text-gray-500">
            {purchases.length === 0
              ? 'Clique em "Novo Item" para começar a lista de compras.'
              : 'Tente ajustar os filtros.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => (
            <div
              key={item.id}
              className={`bg-white border rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 transition-all
                ${item.status === 'purchased' ? 'opacity-70' : ''}
              `}
            >
              {/* Botão marcar comprado */}
              <button
                onClick={() => handleToggleStatus(item)}
                title={item.status === 'pending' ? 'Marcar como comprado' : 'Marcar como pendente'}
                className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                  ${item.status === 'purchased'
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-gray-300 hover:border-green-400'
                  }`}
              >
                {item.status === 'purchased' && <CheckCircle2 className="w-4 h-4" />}
              </button>

              {/* Conteúdo */}
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-gray-900 ${item.status === 'purchased' ? 'line-through text-gray-400' : ''}`}>
                  {item.name}
                </p>
                {item.description && (
                  <p className="text-sm text-gray-500 truncate">{item.description}</p>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <span className="text-sm font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                  Qtd: {item.quantity}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_BADGE[item.priority]}`}>
                  {PRIORITY_LABELS[item.priority]}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[item.status]}`}>
                  {STATUS_LABELS[item.status]}
                </span>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => openEdit(item)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Formulário */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                {editing ? 'Editar Item' : 'Novo Item de Compra'}
              </h2>
              <button onClick={closeForm} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Item <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Toner HP 85A"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Detalhes adicionais, especificações..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                  <input
                    type="number"
                    min={1}
                    value={form.quantity}
                    onChange={e => setForm(f => ({ ...f, quantity: Math.max(1, parseInt(e.target.value) || 1) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                  >
                    <option value="high">Alta</option>
                    <option value="medium">Média</option>
                    <option value="low">Baixa</option>
                  </select>
                </div>
              </div>

              {editing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                  >
                    <option value="pending">Pendente</option>
                    <option value="purchased">Comprado</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
                  style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' }}
                >
                  {editing ? 'Salvar Alterações' : 'Adicionar Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Resumo para Supervisor */}
      {summaryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Resumo para Supervisor</h2>
              <button onClick={() => setSummaryOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <textarea
                readOnly
                value={summaryText}
                rows={12}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono bg-gray-50 resize-none focus:outline-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleCopySummary}
                  className="flex-1 px-4 py-2 rounded-lg border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 text-sm font-medium transition-colors"
                >
                  Copiar texto
                </button>
                <button
                  onClick={() => setSummaryOpen(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Plus, PackageOpen, Clock, CheckCircle, AlertTriangle, Printer, RotateCcw, X, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateWithdrawalTerm } from '../utils/pdfExport';
import { formatDate, getTodayDateString } from '../utils/helpers';

function getStatus(withdrawal) {
  if (withdrawal.status === 'returned') return 'returned';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expected = new Date(withdrawal.expectedReturn + 'T00:00:00');
  return expected < today ? 'overdue' : 'pending';
}

const STATUS_CONFIG = {
  pending: { label: 'Pendente', icon: Clock, classes: 'bg-yellow-100 text-yellow-800' },
  overdue: { label: 'Atrasado', icon: AlertTriangle, classes: 'bg-red-100 text-red-800' },
  returned: { label: 'Devolvido', icon: CheckCircle, classes: 'bg-green-100 text-green-800' },
};

const EMPTY_FORM = {
  technicianName: '',
  company: '',
  cpf: '',
  withdrawalDate: getTodayDateString(),
  expectedReturn: '',
  purpose: '',
  observations: '',
};

function WithdrawalForm({ onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [tools, setTools] = useState(['']);
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const addTool = () => setTools(prev => [...prev, '']);
  const removeTool = (i) => setTools(prev => prev.filter((_, idx) => idx !== i));
  const setTool = (i, value) =>
    setTools(prev => prev.map((t, idx) => (idx === i ? value : t)));

  const validate = () => {
    const e = {};
    if (!form.technicianName.trim()) e.technicianName = 'Campo obrigatório';
    if (!form.withdrawalDate) e.withdrawalDate = 'Campo obrigatório';
    if (!form.expectedReturn) e.expectedReturn = 'Campo obrigatório';
    if (tools.every(t => !t.trim())) e.tools = 'Adicione ao menos uma ferramenta';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      tools: tools.filter(t => t.trim()),
    });
  };

  const inputClass = (field) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      errors[field] ? 'border-red-400' : 'border-gray-300'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Nova Retirada de Ferramentas</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Técnico */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Dados do Técnico</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Nome completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.technicianName}
                  onChange={set('technicianName')}
                  placeholder="Nome do técnico"
                  className={inputClass('technicianName')}
                />
                {errors.technicianName && (
                  <p className="text-xs text-red-500 mt-1">{errors.technicianName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Empresa / Contratada</label>
                <input
                  type="text"
                  value={form.company}
                  onChange={set('company')}
                  placeholder="Nome da empresa"
                  className={inputClass('company')}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">CPF / Identificação</label>
                <input
                  type="text"
                  value={form.cpf}
                  onChange={set('cpf')}
                  placeholder="000.000.000-00"
                  className={inputClass('cpf')}
                />
              </div>
            </div>
          </div>

          {/* Período */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Período de Uso</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Data de retirada <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.withdrawalDate}
                  onChange={set('withdrawalDate')}
                  className={inputClass('withdrawalDate')}
                />
                {errors.withdrawalDate && (
                  <p className="text-xs text-red-500 mt-1">{errors.withdrawalDate}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Previsão de devolução <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.expectedReturn}
                  onChange={set('expectedReturn')}
                  min={form.withdrawalDate}
                  className={inputClass('expectedReturn')}
                />
                {errors.expectedReturn && (
                  <p className="text-xs text-red-500 mt-1">{errors.expectedReturn}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Finalidade / Local de uso</label>
                <input
                  type="text"
                  value={form.purpose}
                  onChange={set('purpose')}
                  placeholder="Ex: Manutenção em campo — Unidade Centro"
                  className={inputClass('purpose')}
                />
              </div>
            </div>
          </div>

          {/* Ferramentas */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">
                Ferramentas <span className="text-red-500">*</span>
              </h3>
              <button
                type="button"
                onClick={addTool}
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </button>
            </div>
            <div className="space-y-2">
              {tools.map((tool, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-5 text-right shrink-0">{i + 1}.</span>
                  <input
                    type="text"
                    value={tool}
                    onChange={(e) => setTool(i, e.target.value)}
                    placeholder="Descrição da ferramenta"
                    className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.tools ? 'border-red-400' : 'border-gray-300'
                    }`}
                  />
                  {tools.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTool(i)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.tools && <p className="text-xs text-red-500 mt-1">{errors.tools}</p>}
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Observações</label>
            <textarea
              value={form.observations}
              onChange={set('observations')}
              rows={3}
              placeholder="Informações adicionais..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg"
            style={{ background: 'linear-gradient(135deg, #1e88e5 0%, #7b1fa2 100%)' }}
          >
            <Printer className="w-4 h-4" />
            Salvar e Gerar Termo
          </button>
        </div>
      </div>
    </div>
  );
}

function WithdrawalCard({ withdrawal, onMarkReturned, onDelete }) {
  const status = getStatus(withdrawal);
  const { label, icon: Icon, classes } = STATUS_CONFIG[status];
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              {withdrawal.protocol}
            </span>
            <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${classes}`}>
              <Icon className="w-3 h-3" />
              {label}
            </span>
          </div>
          <p className="text-base font-semibold text-gray-900">{withdrawal.technicianName}</p>
          {withdrawal.company && (
            <p className="text-sm text-gray-500">{withdrawal.company}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {confirmDelete ? (
            <>
              <button
                onClick={() => onDelete(withdrawal.id)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Confirmar
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500"
                title="Cancelar exclusão"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-2 rounded-lg border border-gray-200 hover:bg-red-50 text-gray-400 hover:text-red-500"
              title="Excluir registro"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => generateWithdrawalTerm(withdrawal)}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-blue-600"
            title="Reimprimir Termo"
          >
            <Printer className="w-4 h-4" />
          </button>
          {status !== 'returned' && (
            <button
              onClick={() => onMarkReturned(withdrawal.id)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Marcar como Devolvido
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
        <span>
          Retirada:{' '}
          <span className="font-medium text-gray-700">
            {formatDate(withdrawal.withdrawalDate + 'T00:00:00', 'dd/MM/yyyy')}
          </span>
        </span>
        <span>
          Devolução prevista:{' '}
          <span className={`font-medium ${status === 'overdue' ? 'text-red-600' : 'text-gray-700'}`}>
            {formatDate(withdrawal.expectedReturn + 'T00:00:00', 'dd/MM/yyyy')}
          </span>
        </span>
        {withdrawal.returnedAt && (
          <span className="col-span-2">
            Devolvido em:{' '}
            <span className="font-medium text-green-700">
              {formatDate(withdrawal.returnedAt, 'dd/MM/yyyy')}
            </span>
          </span>
        )}
      </div>

      {withdrawal.tools?.length > 0 && (
        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs font-medium text-gray-500 mb-1.5">Ferramentas retiradas:</p>
          <ul className="space-y-1">
            {withdrawal.tools.map((tool, i) => (
              <li key={i} className="flex items-center gap-1.5 text-xs text-gray-700">
                <span className="w-4 h-4 rounded-full bg-gray-100 text-gray-500 text-[10px] flex items-center justify-center shrink-0 font-medium">
                  {i + 1}
                </span>
                {tool}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function ToolWithdrawal() {
  const { withdrawals, addWithdrawal, markWithdrawalReturned, deleteWithdrawal } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');

  const handleSubmit = (data) => {
    const created = addWithdrawal(data);
    generateWithdrawalTerm(created);
    setShowForm(false);
  };

  const sorted = [...withdrawals].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const filtered = sorted.filter(w => {
    if (filter === 'all') return true;
    return getStatus(w) === filter;
  });

  const counts = {
    all: sorted.length,
    pending: sorted.filter(w => getStatus(w) === 'pending').length,
    overdue: sorted.filter(w => getStatus(w) === 'overdue').length,
    returned: sorted.filter(w => getStatus(w) === 'returned').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1e88e5 0%, #7b1fa2 100%)' }}
          >
            <PackageOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Retirada de Ferramentas</h1>
            <p className="text-sm text-gray-500">Controle de ferramentas retiradas por técnicos externos</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm"
          style={{ background: 'linear-gradient(135deg, #1e88e5 0%, #7b1fa2 100%)' }}
        >
          <Plus className="w-4 h-4" />
          Nova Retirada
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'Todos' },
          { key: 'pending', label: 'Pendentes' },
          { key: 'overdue', label: 'Atrasados' },
          { key: 'returned', label: 'Devolvidos' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === key
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {label}
            <span className={`ml-1.5 text-xs ${filter === key ? 'text-blue-100' : 'text-gray-400'}`}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <PackageOpen className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">Nenhum registro encontrado</p>
          <p className="text-sm text-gray-400 mt-1">
            {filter === 'all'
              ? 'Clique em "Nova Retirada" para registrar a primeira.'
              : 'Nenhum registro com este status.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {filtered.map(w => (
            <WithdrawalCard
              key={w.id}
              withdrawal={w}
              onMarkReturned={markWithdrawalReturned}
              onDelete={deleteWithdrawal}
            />
          ))}
        </div>
      )}

      {showForm && (
        <WithdrawalForm
          onClose={() => setShowForm(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

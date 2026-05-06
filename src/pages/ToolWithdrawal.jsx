import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Plus, PackageOpen, Clock, CheckCircle, AlertTriangle, Printer,
  RotateCcw, X, Trash2, Search, Package2, ArrowLeftRight, FileDown, Pencil,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateWithdrawalTerm, generateToolStockReport } from '../utils/pdfExport';
import { formatDate, getTodayDateString } from '../utils/helpers';

// ─── Withdrawal helpers (unchanged) ──────────────────────────────────────────

function getStatus(withdrawal) {
  if (withdrawal.status === 'returned') return 'returned';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expected = new Date(withdrawal.expectedReturn + 'T00:00:00');
  return expected < today ? 'overdue' : 'pending';
}

const STATUS_CONFIG = {
  pending:  { label: 'Pendente',  icon: Clock,          classes: 'bg-yellow-100 text-yellow-800' },
  overdue:  { label: 'Atrasado',  icon: AlertTriangle,  classes: 'bg-red-100 text-red-800'      },
  returned: { label: 'Devolvido', icon: CheckCircle,    classes: 'bg-green-100 text-green-800'  },
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

// ─── WithdrawalForm (unchanged) ───────────────────────────────────────────────

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
    onSubmit({ ...form, tools: tools.filter(t => t.trim()) });
  };

  const inputClass = (field) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      errors[field] ? 'border-red-400' : 'border-gray-300'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Nova Retirada de Ferramentas</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Dados do Técnico</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Nome completo <span className="text-red-500">*</span>
                </label>
                <input type="text" value={form.technicianName} onChange={set('technicianName')}
                  placeholder="Nome do técnico" className={inputClass('technicianName')} />
                {errors.technicianName && <p className="text-xs text-red-500 mt-1">{errors.technicianName}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Empresa / Contratada</label>
                <input type="text" value={form.company} onChange={set('company')}
                  placeholder="Nome da empresa" className={inputClass('company')} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">CPF / Identificação</label>
                <input type="text" value={form.cpf} onChange={set('cpf')}
                  placeholder="000.000.000-00" className={inputClass('cpf')} />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Período de Uso</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Data de retirada <span className="text-red-500">*</span>
                </label>
                <input type="date" value={form.withdrawalDate} onChange={set('withdrawalDate')}
                  className={inputClass('withdrawalDate')} />
                {errors.withdrawalDate && <p className="text-xs text-red-500 mt-1">{errors.withdrawalDate}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Previsão de devolução <span className="text-red-500">*</span>
                </label>
                <input type="date" value={form.expectedReturn} onChange={set('expectedReturn')}
                  min={form.withdrawalDate} className={inputClass('expectedReturn')} />
                {errors.expectedReturn && <p className="text-xs text-red-500 mt-1">{errors.expectedReturn}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Finalidade / Local de uso</label>
                <input type="text" value={form.purpose} onChange={set('purpose')}
                  placeholder="Ex: Manutenção em campo — Unidade Centro" className={inputClass('purpose')} />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">
                Ferramentas <span className="text-red-500">*</span>
              </h3>
              <button type="button" onClick={addTool}
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700">
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </button>
            </div>
            <div className="space-y-2">
              {tools.map((tool, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-5 text-right shrink-0">{i + 1}.</span>
                  <input type="text" value={tool} onChange={(e) => setTool(i, e.target.value)}
                    placeholder="Descrição da ferramenta"
                    className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.tools ? 'border-red-400' : 'border-gray-300'
                    }`} />
                  {tools.length > 1 && (
                    <button type="button" onClick={() => removeTool(i)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.tools && <p className="text-xs text-red-500 mt-1">{errors.tools}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Observações</label>
            <textarea value={form.observations} onChange={set('observations')} rows={3}
              placeholder="Informações adicionais..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
        </form>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancelar
          </button>
          <button onClick={handleSubmit}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg"
            style={{ background: 'linear-gradient(135deg, #1e88e5 0%, #7b1fa2 100%)' }}>
            <Printer className="w-4 h-4" />
            Salvar e Gerar Termo
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── WithdrawalCard (unchanged) ───────────────────────────────────────────────

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
          {withdrawal.company && <p className="text-sm text-gray-500">{withdrawal.company}</p>}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {confirmDelete ? (
            <>
              <button onClick={() => onDelete(withdrawal.id)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg">
                <Trash2 className="w-3.5 h-3.5" /> Confirmar
              </button>
              <button onClick={() => setConfirmDelete(false)}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button onClick={() => setConfirmDelete(true)}
              className="p-2 rounded-lg border border-gray-200 hover:bg-red-50 text-gray-400 hover:text-red-500">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => generateWithdrawalTerm(withdrawal)}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-blue-600"
            title="Reimprimir Termo">
            <Printer className="w-4 h-4" />
          </button>
          {status !== 'returned' && (
            <button onClick={() => onMarkReturned(withdrawal.id)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg">
              <RotateCcw className="w-3.5 h-3.5" />
              Marcar como Devolvido
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
        <span>Retirada:{' '}
          <span className="font-medium text-gray-700">
            {formatDate(withdrawal.withdrawalDate + 'T00:00:00', 'dd/MM/yyyy')}
          </span>
        </span>
        <span>Devolução prevista:{' '}
          <span className={`font-medium ${status === 'overdue' ? 'text-red-600' : 'text-gray-700'}`}>
            {formatDate(withdrawal.expectedReturn + 'T00:00:00', 'dd/MM/yyyy')}
          </span>
        </span>
        {withdrawal.returnedAt && (
          <span className="col-span-2">Devolvido em:{' '}
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

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, type = 'success', onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className={`fixed top-4 right-4 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-lg transition-all ${
      type === 'error' ? 'bg-red-600' : 'bg-green-600'
    }`}>
      {message}
      <button onClick={onDismiss} className="opacity-80 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── ToolFormModal ─────────────────────────────────────────────────────────────

function ToolFormModal({ initial, existingCodes, onClose, onSave }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(
    initial
      ? { codigo: initial.codigo, nome: initial.nome, quantidadeTotal: String(initial.quantidadeTotal) }
      : { codigo: '', nome: '', quantidadeTotal: '' }
  );
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.codigo.trim()) {
      e.codigo = 'Campo obrigatório';
    } else if (!isEdit && existingCodes.has(form.codigo.trim().toUpperCase())) {
      e.codigo = 'Código já cadastrado';
    }
    if (!form.nome.trim()) e.nome = 'Campo obrigatório';
    const qty = Number(form.quantidadeTotal);
    if (!form.quantidadeTotal || isNaN(qty) || qty < 1 || !Number.isInteger(qty))
      e.quantidadeTotal = 'Informe um número inteiro maior que zero';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    onSave({
      codigo: form.codigo.trim().toUpperCase(),
      nome: form.nome.trim(),
      quantidadeTotal: Number(form.quantidadeTotal),
    });
  };

  const inputClass = (field) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      errors[field] ? 'border-red-400' : 'border-gray-300'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Editar Ferramenta' : 'Nova Ferramenta'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Código <span className="text-red-500">*</span>
            </label>
            <input type="text" value={form.codigo}
              onChange={e => setForm(p => ({ ...p, codigo: e.target.value }))}
              placeholder="Ex: FERR-001"
              disabled={isEdit}
              className={`${inputClass('codigo')} uppercase placeholder:normal-case ${isEdit ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
            />
            {errors.codigo && <p className="text-xs text-red-500 mt-1">{errors.codigo}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Nome <span className="text-red-500">*</span>
            </label>
            <input type="text" value={form.nome}
              onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
              placeholder="Ex: Chave de Fenda Phillips"
              className={inputClass('nome')}
            />
            {errors.nome && <p className="text-xs text-red-500 mt-1">{errors.nome}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Quantidade Total <span className="text-red-500">*</span>
            </label>
            <input type="number" min="1" step="1" value={form.quantidadeTotal}
              onChange={e => setForm(p => ({ ...p, quantidadeTotal: e.target.value }))}
              placeholder="1"
              className={inputClass('quantidadeTotal')}
            />
            {errors.quantidadeTotal && <p className="text-xs text-red-500 mt-1">{errors.quantidadeTotal}</p>}
          </div>
        </form>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancelar
          </button>
          <button onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg"
            style={{ background: 'linear-gradient(135deg, #1e88e5 0%, #7b1fa2 100%)' }}>
            {isEdit ? 'Salvar Alterações' : 'Cadastrar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── LoanFormModal ─────────────────────────────────────────────────────────────

function LoanFormModal({ tool, disponivel, onClose, onSave }) {
  const [form, setForm] = useState({ responsavel: '', quantidade: '1', data: getTodayDateString() });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.responsavel.trim()) e.responsavel = 'Campo obrigatório';
    const qty = Number(form.quantidade);
    if (!form.quantidade || isNaN(qty) || qty < 1 || !Number.isInteger(qty))
      e.quantidade = 'Informe um número inteiro maior que zero';
    else if (qty > disponivel)
      e.quantidade = `Apenas ${disponivel} unidade${disponivel !== 1 ? 's' : ''} disponível${disponivel !== 1 ? 'is' : ''}`;
    if (!form.data) e.data = 'Campo obrigatório';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    onSave({
      toolId: tool.id,
      codigoFerramenta: tool.codigo,
      nomeFerramenta: tool.nome,
      responsavel: form.responsavel.trim(),
      quantidade: Number(form.quantidade),
      data: form.data,
    });
  };

  const inputClass = (field) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      errors[field] ? 'border-red-400' : 'border-gray-300'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Registrar Empréstimo</h2>
            <p className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
              {tool.nome}
              <span className="text-xs font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{tool.codigo}</span>
              <span className="text-xs font-semibold text-green-600">{disponivel} disponível{disponivel !== 1 ? 'is' : ''}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 shrink-0 ml-3">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Responsável <span className="text-red-500">*</span>
            </label>
            <input type="text" value={form.responsavel}
              onChange={e => setForm(p => ({ ...p, responsavel: e.target.value }))}
              placeholder="Nome de quem está retirando"
              autoFocus
              className={inputClass('responsavel')}
            />
            {errors.responsavel && <p className="text-xs text-red-500 mt-1">{errors.responsavel}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Quantidade <span className="text-red-500">*</span>
              </label>
              <input type="number" min="1" max={disponivel} step="1" value={form.quantidade}
                onChange={e => setForm(p => ({ ...p, quantidade: e.target.value }))}
                className={inputClass('quantidade')}
              />
              {errors.quantidade && <p className="text-xs text-red-500 mt-1">{errors.quantidade}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Data <span className="text-red-500">*</span>
              </label>
              <input type="date" value={form.data}
                onChange={e => setForm(p => ({ ...p, data: e.target.value }))}
                className={inputClass('data')}
              />
              {errors.data && <p className="text-xs text-red-500 mt-1">{errors.data}</p>}
            </div>
          </div>
        </form>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancelar
          </button>
          <button onClick={handleSubmit}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg"
            style={{ background: 'linear-gradient(135deg, #1e88e5 0%, #7b1fa2 100%)' }}>
            <ArrowLeftRight className="w-4 h-4" />
            Registrar Empréstimo
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ReturnModal ───────────────────────────────────────────────────────────────

function ReturnModal({ loan, onClose, onConfirm }) {
  const [quantidade, setQuantidade] = useState(String(loan.quantidade));
  const [error, setError] = useState('');

  const handleConfirm = () => {
    const qty = Number(quantidade);
    if (!quantidade || isNaN(qty) || qty < 1 || !Number.isInteger(qty)) {
      setError('Informe um número inteiro maior que zero');
      return;
    }
    if (qty > loan.quantidade) {
      setError(`Máximo: ${loan.quantidade} unidade${loan.quantidade !== 1 ? 's' : ''}`);
      return;
    }
    onConfirm(loan.id, qty);
  };

  const remaining = loan.quantidade - Number(quantidade || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Registrar Devolução</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
            <p className="font-semibold text-gray-900">{loan.nomeFerramenta}</p>
            <p className="text-gray-500">Responsável: <span className="font-medium text-gray-700">{loan.responsavel}</span></p>
            <p className="text-gray-500">Emprestado: <span className="font-medium text-gray-700">{loan.quantidade} unidade{loan.quantidade !== 1 ? 's' : ''}</span></p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Quantidade a devolver (máx: {loan.quantidade})
            </label>
            <input type="number" min="1" max={loan.quantidade} step="1" value={quantidade}
              onChange={e => { setQuantidade(e.target.value); setError(''); }}
              autoFocus
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                error ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            {!error && Number(quantidade) > 0 && remaining > 0 && (
              <p className="text-xs text-amber-600 mt-1">
                Devolução parcial — {remaining} unidade{remaining !== 1 ? 's' : ''} ainda ficará{remaining !== 1 ? 'o' : ''} emprestada{remaining !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancelar
          </button>
          <button onClick={handleConfirm}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg">
            <RotateCcw className="w-4 h-4" />
            Confirmar Devolução
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ToolRow ──────────────────────────────────────────────────────────────────

function ToolRow({ tool, onEdit, onDelete, onLend, confirmingDelete, onCancelDelete, onConfirmDelete }) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <span className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
          {tool.codigo}
        </span>
      </td>
      <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">{tool.nome}</td>
      <td className="px-4 py-3 text-center font-medium text-gray-700">{tool.quantidadeTotal}</td>
      <td className="px-4 py-3 text-center">
        <span className={`font-semibold ${tool.quantidadeDisponivel > 0 ? 'text-green-600' : 'text-red-500'}`}>
          {tool.quantidadeDisponivel}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        {tool.quantidadeEmprestada > 0
          ? <span className="font-semibold text-orange-600">{tool.quantidadeEmprestada}</span>
          : <span className="text-gray-300">—</span>}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          {confirmingDelete ? (
            <>
              <button onClick={onConfirmDelete}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg">
                <Trash2 className="w-3.5 h-3.5" /> Confirmar
              </button>
              <button onClick={onCancelDelete}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500">
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              <button onClick={onEdit}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600" title="Editar">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={onDelete}
                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500" title="Excluir">
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onLend}
                disabled={tool.quantidadeDisponivel === 0}
                title={tool.quantidadeDisponivel === 0 ? 'Sem unidades disponíveis' : 'Registrar empréstimo'}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
                style={tool.quantidadeDisponivel > 0 ? { background: 'linear-gradient(135deg, #1e88e5 0%, #7b1fa2 100%)' } : { background: '#9ca3af' }}
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                Emprestar
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── LoanCard ─────────────────────────────────────────────────────────────────

function LoanCard({ loan, onReturn }) {
  const isActive = loan.status === 'emprestado';

  return (
    <div className={`bg-white rounded-xl border p-4 shadow-sm ${isActive ? 'border-gray-200' : 'border-gray-100 opacity-80'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded shrink-0">
              {loan.codigoFerramenta}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
              isActive ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
            }`}>
              {isActive ? 'Emprestado' : 'Devolvido'}
            </span>
          </div>
          <p className="font-semibold text-gray-900 truncate">{loan.nomeFerramenta}</p>
          <p className="text-sm text-gray-500">{loan.responsavel}</p>
        </div>
        {isActive && (
          <button onClick={onReturn}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shrink-0">
            <RotateCcw className="w-3.5 h-3.5" />
            Devolver
          </button>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
        <span>Qtd: <span className="font-semibold text-gray-700">{loan.quantidade}</span></span>
        <span>Data: <span className="font-medium text-gray-700">
          {formatDate(loan.data + 'T00:00:00', 'dd/MM/yyyy')}
        </span></span>
        {loan.dataDevolucao && (
          <span className="col-span-2">Devolvido em:{' '}
            <span className="font-medium text-green-700">
              {formatDate(loan.dataDevolucao, 'dd/MM/yyyy')}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function ToolWithdrawal() {
  const {
    withdrawals, addWithdrawal, markWithdrawalReturned, deleteWithdrawal,
    tools, loans, addTool, updateTool, deleteTool, lendTool, returnLoan,
  } = useApp();

  const [activeTab, setActiveTab] = useState('estoque');
  const [toast, setToast] = useState(null);

  // Estoque tab
  const [search, setSearch] = useState('');
  const [toolModal, setToolModal] = useState(null); // null | 'new' | tool object
  const [loanModal, setLoanModal] = useState(null); // null | enriched tool
  const [deleteConfirm, setDeleteConfirm] = useState(null); // null | toolId

  // Empréstimos tab
  const [loanFilter, setLoanFilter] = useState('ativos');
  const [returnModal, setReturnModal] = useState(null); // null | loan

  // Retiradas tab
  const [showForm, setShowForm] = useState(false);
  const [withdrawalFilter, setWithdrawalFilter] = useState('all');

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, key: Date.now() });
  }, []);

  // ── computed ──────────────────────────────────────────────────────────────────

  const enrichedTools = useMemo(() => tools.map(t => {
    const emprestado = loans
      .filter(l => l.toolId === t.id && l.status === 'emprestado')
      .reduce((sum, l) => sum + l.quantidade, 0);
    return { ...t, quantidadeEmprestada: emprestado, quantidadeDisponivel: t.quantidadeTotal - emprestado };
  }), [tools, loans]);

  const filteredTools = useMemo(() => {
    if (!search.trim()) return enrichedTools;
    const q = search.toLowerCase();
    return enrichedTools.filter(t => t.nome.toLowerCase().includes(q) || t.codigo.toLowerCase().includes(q));
  }, [enrichedTools, search]);

  const existingCodes = useMemo(() => new Set(tools.map(t => t.codigo.toUpperCase())), [tools]);

  const sortedLoans = useMemo(() =>
    [...loans].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
  [loans]);

  const filteredLoans = useMemo(() => sortedLoans.filter(l => {
    if (loanFilter === 'ativos')     return l.status === 'emprestado';
    if (loanFilter === 'devolvidos') return l.status === 'devolvido';
    return true;
  }), [sortedLoans, loanFilter]);

  const loanCounts = useMemo(() => ({
    ativos:     loans.filter(l => l.status === 'emprestado').length,
    devolvidos: loans.filter(l => l.status === 'devolvido').length,
    todos:      loans.length,
  }), [loans]);

  const stockStats = useMemo(() => ({
    total:        tools.length,
    totalUnidades: tools.reduce((s, t) => s + t.quantidadeTotal, 0),
    disponiveis:  enrichedTools.reduce((s, t) => s + t.quantidadeDisponivel, 0),
    emprestadas:  enrichedTools.reduce((s, t) => s + t.quantidadeEmprestada, 0),
  }), [tools, enrichedTools]);

  const sortedWithdrawals = useMemo(() =>
    [...withdrawals].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
  [withdrawals]);

  const filteredWithdrawals = useMemo(() =>
    sortedWithdrawals.filter(w => withdrawalFilter === 'all' || getStatus(w) === withdrawalFilter),
  [sortedWithdrawals, withdrawalFilter]);

  const withdrawalCounts = useMemo(() => ({
    all:      sortedWithdrawals.length,
    pending:  sortedWithdrawals.filter(w => getStatus(w) === 'pending').length,
    overdue:  sortedWithdrawals.filter(w => getStatus(w) === 'overdue').length,
    returned: sortedWithdrawals.filter(w => getStatus(w) === 'returned').length,
  }), [sortedWithdrawals]);

  // ── handlers ───────────────────────────────────────────────────────────────────

  const handleSaveTool = useCallback((data) => {
    if (toolModal && toolModal !== 'new') {
      updateTool(toolModal.id, data);
      showToast('Ferramenta atualizada com sucesso');
    } else {
      addTool(data);
      showToast('Ferramenta cadastrada com sucesso');
    }
    setToolModal(null);
  }, [toolModal, addTool, updateTool, showToast]);

  const handleDeleteTool = useCallback((id) => {
    const hasActive = loans.some(l => l.toolId === id && l.status === 'emprestado');
    if (hasActive) {
      showToast('Não é possível excluir: há empréstimos ativos para esta ferramenta.', 'error');
      setDeleteConfirm(null);
      return;
    }
    deleteTool(id);
    setDeleteConfirm(null);
    showToast('Ferramenta excluída');
  }, [loans, deleteTool, showToast]);

  const handleLoan = useCallback((data) => {
    lendTool(data);
    setLoanModal(null);
    showToast(`Empréstimo registrado para ${data.responsavel}`);
  }, [lendTool, showToast]);

  const handleReturn = useCallback((loanId, qty) => {
    returnLoan(loanId, qty);
    setReturnModal(null);
    showToast('Devolução registrada com sucesso');
  }, [returnLoan, showToast]);

  const handleWithdrawalSubmit = useCallback((data) => {
    const created = addWithdrawal(data);
    generateWithdrawalTerm(created);
    setShowForm(false);
  }, [addWithdrawal]);

  // ── tabs config ───────────────────────────────────────────────────────────────

  const tabs = [
    { key: 'estoque',     label: 'Estoque',     badge: tools.length },
    { key: 'emprestimos', label: 'Empréstimos', badge: loanCounts.ativos },
    { key: 'retiradas',   label: 'Retiradas',   badge: withdrawalCounts.pending + withdrawalCounts.overdue },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1e88e5 0%, #7b1fa2 100%)' }}>
            <PackageOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Ferramentas</h1>
            <p className="text-sm text-gray-500">Estoque, empréstimos e retiradas</p>
          </div>
        </div>

        {activeTab === 'estoque' && (
          <div className="flex gap-2">
            <button
              onClick={() => generateToolStockReport(enrichedTools)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <FileDown className="w-4 h-4" />
              Exportar PDF
            </button>
            <button
              onClick={() => setToolModal('new')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm"
              style={{ background: 'linear-gradient(135deg, #1e88e5 0%, #7b1fa2 100%)' }}
            >
              <Plus className="w-4 h-4" />
              Nova Ferramenta
            </button>
          </div>
        )}

        {activeTab === 'retiradas' && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm"
            style={{ background: 'linear-gradient(135deg, #1e88e5 0%, #7b1fa2 100%)' }}
          >
            <Plus className="w-4 h-4" />
            Nova Retirada
          </button>
        )}
      </div>

      {/* Tab bar */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 -mb-px">
          {tabs.map(({ key, label, badge }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === key
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}>
              {label}
              {badge > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* ── TAB: Estoque ─────────────────────────────────────────────────────── */}
      {activeTab === 'estoque' && (
        <div className="space-y-5">
          {/* Stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Ferramentas',    value: stockStats.total,        color: 'text-blue-700',   bg: 'bg-blue-50'   },
              { label: 'Total Unidades', value: stockStats.totalUnidades, color: 'text-gray-700',   bg: 'bg-gray-50'   },
              { label: 'Disponíveis',    value: stockStats.disponiveis,   color: 'text-green-700',  bg: 'bg-green-50'  },
              { label: 'Emprestadas',    value: stockStats.emprestadas,   color: 'text-orange-700', bg: 'bg-orange-50' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} rounded-xl p-4`}>
                <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome ou código..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Table */}
          {filteredTools.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package2 className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">
                {search ? 'Nenhuma ferramenta encontrada' : 'Nenhuma ferramenta cadastrada'}
              </p>
              {!search && (
                <p className="text-sm text-gray-400 mt-1">Clique em "Nova Ferramenta" para começar.</p>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Código</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Disponível</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Emprestado</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTools.map(tool => (
                      <ToolRow
                        key={tool.id}
                        tool={tool}
                        onEdit={() => setToolModal(tool)}
                        onDelete={() => setDeleteConfirm(tool.id)}
                        onLend={() => setLoanModal(tool)}
                        confirmingDelete={deleteConfirm === tool.id}
                        onCancelDelete={() => setDeleteConfirm(null)}
                        onConfirmDelete={() => handleDeleteTool(tool.id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Empréstimos ─────────────────────────────────────────────────── */}
      {activeTab === 'emprestimos' && (
        <div className="space-y-5">
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'ativos',     label: 'Ativos'     },
              { key: 'devolvidos', label: 'Devolvidos' },
              { key: 'todos',      label: 'Todos'      },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setLoanFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  loanFilter === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}>
                {label}
                <span className={`ml-1.5 text-xs ${loanFilter === key ? 'text-blue-100' : 'text-gray-400'}`}>
                  {loanCounts[key]}
                </span>
              </button>
            ))}
          </div>

          {filteredLoans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ArrowLeftRight className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">Nenhum empréstimo encontrado</p>
              <p className="text-sm text-gray-400 mt-1">
                {loanFilter === 'ativos'
                  ? 'Nenhum empréstimo ativo no momento. Use "Emprestar" no estoque.'
                  : 'Nenhum registro com este filtro.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
              {filteredLoans.map(loan => (
                <LoanCard key={loan.id} loan={loan} onReturn={() => setReturnModal(loan)} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Retiradas ───────────────────────────────────────────────────── */}
      {activeTab === 'retiradas' && (
        <div className="space-y-5">
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all',      label: 'Todos'      },
              { key: 'pending',  label: 'Pendentes'  },
              { key: 'overdue',  label: 'Atrasados'  },
              { key: 'returned', label: 'Devolvidos' },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setWithdrawalFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  withdrawalFilter === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}>
                {label}
                <span className={`ml-1.5 text-xs ${withdrawalFilter === key ? 'text-blue-100' : 'text-gray-400'}`}>
                  {withdrawalCounts[key]}
                </span>
              </button>
            ))}
          </div>

          {filteredWithdrawals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <PackageOpen className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">Nenhum registro encontrado</p>
              <p className="text-sm text-gray-400 mt-1">
                {withdrawalFilter === 'all'
                  ? 'Clique em "Nova Retirada" para registrar.'
                  : 'Nenhum registro com este status.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              {filteredWithdrawals.map(w => (
                <WithdrawalCard
                  key={w.id}
                  withdrawal={w}
                  onMarkReturned={markWithdrawalReturned}
                  onDelete={deleteWithdrawal}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Modals ────────────────────────────────────────────────────────────── */}
      {toolModal && (
        <ToolFormModal
          initial={toolModal === 'new' ? null : toolModal}
          existingCodes={existingCodes}
          onClose={() => setToolModal(null)}
          onSave={handleSaveTool}
        />
      )}
      {loanModal && (
        <LoanFormModal
          tool={loanModal}
          disponivel={loanModal.quantidadeDisponivel}
          onClose={() => setLoanModal(null)}
          onSave={handleLoan}
        />
      )}
      {returnModal && (
        <ReturnModal
          loan={returnModal}
          onClose={() => setReturnModal(null)}
          onConfirm={handleReturn}
        />
      )}
      {showForm && (
        <WithdrawalForm
          onClose={() => setShowForm(false)}
          onSubmit={handleWithdrawalSubmit}
        />
      )}
      {toast && (
        <Toast key={toast.key} message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}
    </div>
  );
}

import React, { useState, useCallback } from 'react';
import { Plus, Trash2, FileDown, RefreshCcw, ClipboardList, AlertCircle } from 'lucide-react';
import { generateRequisitionPDF } from '../utils/pdfExport';

// ── Helpers locais ────────────────────────────────────────────────────────────

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const todayISO = () => new Date().toISOString().split('T')[0];

const EMPTY_ROW = () => ({
  id:          uid(),
  description: '',
  reference:   '',
  quantity:    1,
  location:    '',
});

const DEFAULT_HEADER = {
  empresa: 'INOVE IDEIAS E SOLUÇÕES',
  setor:   'LABORATÓRIO',
  filial:  'São Luís',
  data:    todayISO(),
};

// ── Componente de campo de cabeçalho ──────────────────────────────────────────

function HeaderField({ label, name, value, type = 'text', error, onChange }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(name, e.target.value)}
        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition
          ${error ? 'border-red-400 bg-red-50 focus:ring-red-400' : 'border-gray-300 bg-white'}`}
      />
      {error && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  );
}

// ── Componente de linha da tabela ─────────────────────────────────────────────

function ItemRow({ item, index, errors, canRemove, onUpdate, onRemove }) {
  const e = (field) => errors[`${item.id}.${field}`];

  return (
    <div className="grid grid-cols-1 md:grid-cols-[2fr_1.5fr_90px_1.5fr_44px] gap-2 p-3 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-blue-50/20 hover:border-blue-100 transition-colors group">
      {/* Número da linha — mobile only */}
      <div className="md:hidden text-xs font-bold text-gray-400 tracking-wide">
        ITEM #{index + 1}
      </div>

      {/* Descrição do Produto */}
      <div>
        <span className="md:hidden block text-[11px] font-medium text-gray-500 mb-1">
          Descrição do Produto
        </span>
        <input
          type="text"
          placeholder="Ex: Toner HP 85A"
          value={item.description}
          onChange={e => onUpdate(item.id, 'description', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white
            ${e('description') ? 'border-red-400 focus:ring-red-400' : 'border-gray-200'}`}
        />
        {e('description') && (
          <p className="text-[11px] text-red-500 mt-0.5">{e('description')}</p>
        )}
      </div>

      {/* Referência do Fornecedor */}
      <div>
        <span className="md:hidden block text-[11px] font-medium text-gray-500 mb-1">
          Referência do Fornecedor
        </span>
        <input
          type="text"
          placeholder="Ex: CE285A"
          value={item.reference}
          onChange={e => onUpdate(item.id, 'reference', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white
            ${e('reference') ? 'border-red-400 focus:ring-red-400' : 'border-gray-200'}`}
        />
        {e('reference') && (
          <p className="text-[11px] text-red-500 mt-0.5">{e('reference')}</p>
        )}
      </div>

      {/* Quantidade */}
      <div>
        <span className="md:hidden block text-[11px] font-medium text-gray-500 mb-1">
          Quantidade
        </span>
        <input
          type="number"
          min={1}
          placeholder="1"
          value={item.quantity}
          onChange={e => onUpdate(item.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
          className={`w-full px-3 py-2 border rounded-lg text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white
            ${e('quantity') ? 'border-red-400 focus:ring-red-400' : 'border-gray-200'}`}
        />
        {e('quantity') && (
          <p className="text-[11px] text-red-500 mt-0.5">{e('quantity')}</p>
        )}
      </div>

      {/* Local de Estoque */}
      <div>
        <span className="md:hidden block text-[11px] font-medium text-gray-500 mb-1">
          Local de Estoque
        </span>
        <input
          type="text"
          placeholder="Ex: Almoxarifado A"
          value={item.location}
          onChange={e => onUpdate(item.id, 'location', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white
            ${e('location') ? 'border-red-400 focus:ring-red-400' : 'border-gray-200'}`}
        />
        {e('location') && (
          <p className="text-[11px] text-red-500 mt-0.5">{e('location')}</p>
        )}
      </div>

      {/* Botão remover */}
      <div className="flex items-start justify-end md:justify-center pt-0 md:pt-1.5">
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          disabled={!canRemove}
          title="Remover linha"
          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export function InternalRequisition() {
  const [header, setHeader] = useState({ ...DEFAULT_HEADER });
  const [items,  setItems]  = useState([EMPTY_ROW()]);
  const [errors, setErrors] = useState({});
  const [generating, setGenerating] = useState(false);

  // ── Atualização de cabeçalho ────────────────────────────────────────────────
  const updateHeader = useCallback((field, value) => {
    setHeader(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
  }, []);

  // ── Operações da tabela ─────────────────────────────────────────────────────
  const addItem = useCallback(() => {
    setItems(prev => [...prev, EMPTY_ROW()]);
  }, []);

  const removeItem = useCallback((id) => {
    setItems(prev => prev.length > 1 ? prev.filter(r => r.id !== id) : prev);
  }, []);

  // updateItem usa useCallback para ser estável — evita re-renders desnecessários nas linhas
  const updateItem = useCallback((id, field, value) => {
    setItems(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    setErrors(prev => { const next = { ...prev }; delete next[`${id}.${field}`]; return next; });
  }, []);

  // ── Validação ───────────────────────────────────────────────────────────────
  const validate = useCallback((currentHeader, currentItems) => {
    const errs = {};

    if (!currentHeader.empresa.trim()) errs.empresa = 'Campo obrigatório';
    if (!currentHeader.setor.trim())   errs.setor   = 'Campo obrigatório';
    if (!currentHeader.filial.trim())  errs.filial  = 'Campo obrigatório';
    if (!currentHeader.data)           errs.data    = 'Campo obrigatório';

    currentItems.forEach(row => {
      if (!row.description.trim()) errs[`${row.id}.description`] = 'Obrigatório';
      if (!row.reference.trim())   errs[`${row.id}.reference`]   = 'Obrigatório';
      if (!row.location.trim())    errs[`${row.id}.location`]    = 'Obrigatório';
      if (!row.quantity || row.quantity < 1)
        errs[`${row.id}.quantity`] = 'Mín: 1';
    });

    return errs;
  }, []);

  // ── Gerar PDF ───────────────────────────────────────────────────────────────
  const handleGeneratePDF = useCallback(() => {
    const errs = validate(header, items);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Rola para o primeiro campo com erro
      setTimeout(() => {
        document.querySelector('[data-error="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }
    setGenerating(true);
    try {
      generateRequisitionPDF(header, items);
    } finally {
      setGenerating(false);
    }
  }, [header, items, validate]);

  // ── Limpar formulário ───────────────────────────────────────────────────────
  const handleClear = useCallback(() => {
    if (!window.confirm('Limpar todo o formulário? Esta ação não pode ser desfeita.')) return;
    setHeader({ ...DEFAULT_HEADER, data: todayISO() });
    setItems([EMPTY_ROW()]);
    setErrors({});
  }, []);

  const hasErrors = Object.keys(errors).length > 0;

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-5xl">

      {/* ── Cabeçalho da página ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Requisição Interna</h1>
          <p className="text-gray-500 mt-1">
            Solicite peças do estoque e gere o documento formal em PDF
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            Limpar
          </button>
          <button
            type="button"
            onClick={handleGeneratePDF}
            disabled={generating}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-60 shadow-sm"
            style={{ background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)' }}
          >
            <FileDown className="w-4 h-4" />
            {generating ? 'Gerando…' : 'Gerar PDF'}
          </button>
        </div>
      </div>

      {/* ── Banner de erros de validação ────────────────────────────────────── */}
      {hasErrors && (
        <div
          data-error="true"
          className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Preencha todos os campos obrigatórios antes de gerar o PDF.</p>
            <p className="text-red-500 mt-0.5 text-xs">Os campos com erro estão destacados em vermelho abaixo.</p>
          </div>
        </div>
      )}

      {/* ── Card do documento ───────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

        {/* Faixa superior — imita o cabeçalho do PDF */}
        <div
          className="px-6 py-5 flex items-center gap-4"
          style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)' }}
        >
          <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-base tracking-wide">
              REQUISIÇÃO INTERNA
            </h2>
            <p className="text-blue-200 text-xs mt-0.5">
              INOVE FILIAL SÃO LUÍS — Documento gerado pelo ServiceLab
            </p>
          </div>
        </div>

        {/* ── Campos fixos do cabeçalho ──────────────────────────────────────── */}
        <div className="p-6 border-b border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            Informações do Documento
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <HeaderField label="Empresa"  name="empresa" value={header.empresa} error={errors.empresa} onChange={updateHeader} />
            <HeaderField label="Setor"    name="setor"   value={header.setor}   error={errors.setor}   onChange={updateHeader} />
            <HeaderField label="Filial"   name="filial"  value={header.filial}  error={errors.filial}  onChange={updateHeader} />
            <HeaderField label="Data"     name="data"    value={header.data}    error={errors.data}    onChange={updateHeader} type="date" />
          </div>
        </div>

        {/* ── Tabela de itens ────────────────────────────────────────────────── */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Itens Solicitados
              <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold normal-case">
                {items.length}
              </span>
            </p>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adicionar Item
            </button>
          </div>

          {/* Cabeçalho da tabela — visível apenas em telas médias+ */}
          <div
            className="hidden md:grid grid-cols-[2fr_1.5fr_90px_1.5fr_44px] gap-2 px-3 py-2.5 rounded-xl mb-2 text-white text-xs font-bold uppercase tracking-wide"
            style={{ background: 'linear-gradient(90deg, #1e3a8a 0%, #1e40af 100%)' }}
          >
            <span>Descrição do Produto</span>
            <span>Referência do Fornecedor</span>
            <span className="text-center">Qtd.</span>
            <span>Local de Estoque</span>
            <span />
          </div>

          {/* Linhas — key={item.id} estável, NUNCA index */}
          <div className="space-y-2">
            {items.map((item, index) => (
              <ItemRow
                key={item.id}
                item={item}
                index={index}
                errors={errors}
                canRemove={items.length > 1}
                onUpdate={updateItem}
                onRemove={removeItem}
              />
            ))}
          </div>

          {/* Botão de nova linha estilo "dashed" */}
          <button
            type="button"
            onClick={addItem}
            className="mt-3 w-full py-3 rounded-xl border-2 border-dashed border-blue-200 text-blue-600 hover:border-blue-400 hover:bg-blue-50 text-sm font-medium transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar nova linha
          </button>
        </div>

        {/* ── Rodapé do card com ações ────────────────────────────────────────── */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-700">{items.length}</span>{' '}
            item{items.length !== 1 ? 's' : ''} na requisição
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Limpar formulário
            </button>
            <button
              type="button"
              onClick={handleGeneratePDF}
              disabled={generating}
              className="flex items-center gap-2 px-6 py-2 rounded-lg text-white text-sm font-semibold shadow-sm transition-all disabled:opacity-60 hover:shadow-md"
              style={{ background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)' }}
            >
              <FileDown className="w-4 h-4" />
              {generating ? 'Gerando…' : 'Gerar PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle2, FileText } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { fileToBase64, compressImage } from '../../utils/helpers';

export function CompletionModal({ isOpen, onClose, onConfirm, machine }) {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [finalNotes, setFinalNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileRef = useRef(null);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await fileToBase64(file);
    const compressed = await compressImage(b64, 1200, 900);
    setImage(compressed);
    setImagePreview(compressed);
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleClose = () => {
    setImage(null);
    setImagePreview(null);
    setFinalNotes('');
    onClose();
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    await onConfirm({
      image,
      finalNotes,
      completedAt: new Date().toISOString(),
      technician: machine?.technician ?? 'Luciano Martins',
    });
    setImage(null);
    setImagePreview(null);
    setFinalNotes('');
    setIsLoading(false);
  };

  if (!machine) return null;

  const procedures = (machine.serviceLog ?? []).filter(
    e => e.type === 'action' || e.type === 'test'
  );
  const partsReplaced = (machine.serviceLog ?? []).filter(
    e => e.type === 'part_replaced'
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Finalizar Máquina"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant="success"
            onClick={handleConfirm}
            isLoading={isLoading}
            leftIcon={CheckCircle2}
          >
            Finalizar e Gerar PDF
          </Button>
        </>
      }
    >
      <div className="space-y-5">

        {/* Resumo da máquina */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Resumo da Máquina
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            <div>
              <span className="text-gray-500">Máquina: </span>
              <span className="font-medium text-gray-900">{machine.brand} {machine.model}</span>
            </div>
            <div>
              <span className="text-gray-500">S/N: </span>
              <span className="font-medium text-gray-900">{machine.serialNumber}</span>
            </div>
            <div>
              <span className="text-gray-500">Técnico: </span>
              <span className="font-medium text-gray-900">{machine.technician}</span>
            </div>
            <div>
              <span className="text-gray-500">Status final: </span>
              <span className="font-semibold text-emerald-700">Finalizada</span>
            </div>
          </div>
          {machine.problemDescription && (
            <div className="pt-1 border-t border-gray-200 mt-2">
              <p className="text-xs text-gray-500 mb-0.5">Problema relatado:</p>
              <p className="text-sm text-gray-700">{machine.problemDescription}</p>
            </div>
          )}
        </div>

        {/* Procedimentos realizados */}
        {procedures.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Procedimentos Realizados ({procedures.length})
            </p>
            <ul className="space-y-1.5">
              {procedures.slice(0, 5).map(entry => (
                <li key={entry.id} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span>{entry.description}</span>
                </li>
              ))}
              {procedures.length > 5 && (
                <li className="text-xs text-gray-500 pl-6">
                  + {procedures.length - 5} procedimento(s) adicionais no relatório
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Peças substituídas */}
        {partsReplaced.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Peças Substituídas ({partsReplaced.length})
            </p>
            <ul className="space-y-1.5">
              {partsReplaced.map(entry => (
                <li key={entry.id} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-blue-500 font-bold mt-0.5">•</span>
                  <span>{entry.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Upload de foto */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Foto do Serviço Concluído{' '}
            <span className="text-gray-400 font-normal">(opcional)</span>
          </p>
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview do serviço"
                className="w-full h-44 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg
                         flex flex-col items-center justify-center gap-2 text-gray-500
                         hover:border-blue-400 hover:text-blue-500 transition-colors"
            >
              <Upload className="w-6 h-6" />
              <span className="text-sm">Clique para adicionar foto</span>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Observações finais */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Observações Finais{' '}
            <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <textarea
            value={finalNotes}
            onChange={e => setFinalNotes(e.target.value)}
            placeholder="Ex: Máquina testada e aprovada. Imprimindo normalmente em todos os modos..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                       resize-none"
          />
        </div>

        {/* Aviso sobre o PDF */}
        <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <FileText className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <p className="text-xs text-emerald-700 leading-relaxed">
            Ao confirmar, o status será atualizado para{' '}
            <strong>Finalizada</strong> e um relatório PDF será gerado automaticamente
            com todos os dados, procedimentos e foto do serviço.
          </p>
        </div>

      </div>
    </Modal>
  );
}

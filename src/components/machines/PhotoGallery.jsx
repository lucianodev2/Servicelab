import React, { useState } from 'react';
import { Camera, X, Upload, ChevronLeft, ChevronRight, Trash2, Loader } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

export function PhotoGallery({ photos = [], onAddPhoto, onDeletePhoto, readOnly = false }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        // Envia o arquivo diretamente ao servidor — sem localStorage
        await onAddPhoto(file);
      }
    } catch (error) {
      setUploadError('Erro ao enviar foto. Tente novamente.');
    } finally {
      setIsUploading(false);
      // Limpa o input para permitir re-upload do mesmo arquivo
      e.target.value = '';
    }
  };

  const openPhoto = (index) => {
    setSelectedPhoto(index);
  };

  const navigatePhoto = (direction) => {
    if (selectedPhoto === null) return;
    const newIndex = selectedPhoto + direction;
    if (newIndex >= 0 && newIndex < photos.length) {
      setSelectedPhoto(newIndex);
    }
  };

  const handleDeletePhoto = async (e, photo) => {
    e.stopPropagation();
    if (!onDeletePhoto) return;
    try {
      await onDeletePhoto(photo.id);
    } catch {}
  };

  return (
    <div>
      {/* Erro de upload */}
      {uploadError && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center justify-between">
          <span>{uploadError}</span>
          <button onClick={() => setUploadError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Photo Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {!readOnly && (
          <label className={`aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
            isUploading
              ? 'border-blue-300 bg-blue-50 cursor-not-allowed'
              : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'
          }`}>
            {isUploading ? (
              <>
                <Loader className="w-6 h-6 text-blue-500 mb-1 animate-spin" />
                <span className="text-xs text-blue-600">Enviando...</span>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-xs text-gray-500">Adicionar Foto</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        )}

        {photos.map((photo, index) => (
          <div
            key={photo.id || index}
            className="aspect-square relative group cursor-pointer overflow-hidden rounded-lg border border-gray-200"
            onClick={() => openPhoto(index)}
          >
            {/* Placeholder cinza enquanto imagem carrega */}
            <div className="absolute inset-0 bg-gray-200" />
            <img
              src={photo.url}
              alt={photo.caption || `Foto ${index + 1}`}
              className="relative w-full h-full object-cover transition-transform group-hover:scale-105"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            {photo.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="text-white text-xs truncate">{photo.caption}</p>
              </div>
            )}
            {!readOnly && onDeletePhoto && (
              <button
                onClick={(e) => handleDeletePhoto(e, photo)}
                className="absolute top-1 right-1 p-1 bg-red-500/80 hover:bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                title="Excluir foto"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}

        {photos.length === 0 && readOnly && (
          <div className="col-span-full aspect-video bg-gray-50 rounded-lg flex flex-col items-center justify-center text-gray-400">
            <Camera className="w-10 h-10 mb-2" />
            <p className="text-sm">Nenhuma foto registrada</p>
          </div>
        )}
      </div>

      {/* Photo Viewer Modal */}
      <Modal
        isOpen={selectedPhoto !== null}
        onClose={() => setSelectedPhoto(null)}
        title={`Foto ${selectedPhoto !== null ? selectedPhoto + 1 : ''} de ${photos.length}`}
        size="xl"
        showCloseButton={true}
      >
        {selectedPhoto !== null && photos[selectedPhoto] && (
          <div className="relative">
            <img
              src={photos[selectedPhoto].url}
              alt={photos[selectedPhoto].caption || `Foto ${selectedPhoto + 1}`}
              className="w-full max-h-[60vh] object-contain rounded-lg bg-gray-100"
            />

            {/* Navigation */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={() => navigatePhoto(-1)}
                  disabled={selectedPhoto === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigatePhoto(1)}
                  disabled={selectedPhoto === photos.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {photos[selectedPhoto].caption && (
              <p className="mt-3 text-center text-gray-600">
                {photos[selectedPhoto].caption}
              </p>
            )}

            {photos[selectedPhoto].timestamp && (
              <p className="text-center text-xs text-gray-400 mt-1">
                {new Date(photos[selectedPhoto].timestamp).toLocaleString('pt-BR')}
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

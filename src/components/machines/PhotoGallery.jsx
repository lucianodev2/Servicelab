import React, { useState } from 'react';
import { Camera, X, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { fileToBase64, compressImage } from '../../utils/helpers';

export function PhotoGallery({ photos = [], onAddPhoto, readOnly = false }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        
        const base64 = await fileToBase64(file);
        const compressed = await compressImage(base64, 1200, 1200);
        
        onAddPhoto({
          url: compressed,
          caption: '',
        });
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setIsUploading(false);
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

  return (
    <div>
      {/* Photo Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {!readOnly && (
          <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
            <Upload className="w-6 h-6 text-gray-400 mb-1" />
            <span className="text-xs text-gray-500">Add Photo</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        )}
        
        {photos.map((photo, index) => (
          <div
            key={photo.id || index}
            className="aspect-square relative group cursor-pointer overflow-hidden rounded-lg border border-gray-200"
            onClick={() => openPhoto(index)}
          >
            <img
              src={photo.url}
              alt={photo.caption || `Photo ${index + 1}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            {photo.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="text-white text-xs truncate">{photo.caption}</p>
              </div>
            )}
          </div>
        ))}
        
        {photos.length === 0 && readOnly && (
          <div className="col-span-full aspect-video bg-gray-50 rounded-lg flex flex-col items-center justify-center text-gray-400">
            <Camera className="w-10 h-10 mb-2" />
            <p className="text-sm">No photos yet</p>
          </div>
        )}
      </div>

      {/* Photo Viewer Modal */}
      <Modal
        isOpen={selectedPhoto !== null}
        onClose={() => setSelectedPhoto(null)}
        title={`Photo ${selectedPhoto !== null ? selectedPhoto + 1 : ''} of ${photos.length}`}
        size="xl"
        showCloseButton={true}
      >
        {selectedPhoto !== null && photos[selectedPhoto] && (
          <div className="relative">
            <img
              src={photos[selectedPhoto].url}
              alt={photos[selectedPhoto].caption || `Photo ${selectedPhoto + 1}`}
              className="w-full max-h-[60vh] object-contain rounded-lg"
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
            
            {/* Caption */}
            {photos[selectedPhoto].caption && (
              <p className="mt-3 text-center text-gray-600">
                {photos[selectedPhoto].caption}
              </p>
            )}
            
            {/* Timestamp */}
            {photos[selectedPhoto].timestamp && (
              <p className="text-center text-xs text-gray-400 mt-1">
                {new Date(photos[selectedPhoto].timestamp).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

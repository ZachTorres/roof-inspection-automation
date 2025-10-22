'use client';

import { useState, useEffect } from 'react';

interface PhotoLightboxProps {
  photos: { preview: string; category: string; file: File; annotations?: string; annotationsData?: any[] }[];
  initialIndex: number;
  onClose: () => void;
  onAnnotate?: (index: number) => void;
}

export default function PhotoLightbox({ photos, initialIndex, onClose, onAnnotate }: PhotoLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showInfo, setShowInfo] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
    setZoomLevel(1);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    setZoomLevel(1);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleDownload = () => {
    const photo = photos[currentIndex];
    const link = document.createElement('a');
    link.href = photo.annotations || photo.preview;
    link.download = `inspection-photo-${currentIndex + 1}.png`;
    link.click();
  };

  const currentPhoto = photos[currentIndex];

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm p-4 flex justify-between items-center">
        <div className="text-white">
          <h3 className="text-lg font-bold">
            Photo {currentIndex + 1} of {photos.length}
          </h3>
          <p className="text-sm text-slate-300 capitalize">{currentPhoto.category}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            title="Toggle Info"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          {onAnnotate && (
            <button
              onClick={() => onAnnotate(currentIndex)}
              className="px-4 py-2 bg-uc-blue hover:bg-uc-blue-dark text-white rounded-lg transition-colors"
              title="Annotate Photo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            title="Download"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            title="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Image Area */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
          title="Previous (Left Arrow)"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="relative max-w-full max-h-full overflow-auto">
          <img
            src={currentPhoto.annotations || currentPhoto.preview}
            alt={`Inspection ${currentIndex + 1}`}
            style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s' }}
            className="max-w-none"
          />
        </div>

        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
          title="Next (Right Arrow)"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Bottom Controls */}
      <div className="bg-black/50 backdrop-blur-sm p-4">
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={handleZoomOut}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            title="Zoom Out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>

          <span className="text-white font-medium min-w-[80px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>

          <button
            onClick={handleZoomIn}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            title="Zoom In"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </button>

          <button
            onClick={() => setZoomLevel(1)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
          >
            Reset
          </button>
        </div>

        {/* Thumbnail Strip */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {photos.map((photo, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setZoomLevel(1);
              }}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all ${
                index === currentIndex
                  ? 'ring-4 ring-uc-blue scale-110'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={photo.annotations || photo.preview}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="absolute right-4 top-24 bg-black/80 backdrop-blur-sm text-white p-4 rounded-lg max-w-xs">
          <h4 className="font-bold mb-2">Photo Information</h4>
          <div className="space-y-1 text-sm">
            <p><span className="text-slate-400">Category:</span> {currentPhoto.category}</p>
            <p><span className="text-slate-400">File:</span> {currentPhoto.file.name}</p>
            <p><span className="text-slate-400">Size:</span> {(currentPhoto.file.size / 1024 / 1024).toFixed(2)} MB</p>
            {currentPhoto.annotations && (
              <p className="text-green-400 mt-2">Annotated</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

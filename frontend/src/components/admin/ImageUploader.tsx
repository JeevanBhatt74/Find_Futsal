import { useState, useRef } from 'react';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import type { VenueImage } from '@/types';

interface ImageUploaderProps {
  images: VenueImage[];
  onChange: (images: VenueImage[]) => void;
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    // UI Simulation: Generate fake URLs for demonstration purposes
    const newImages: VenueImage[] = files.map((file, index) => ({
      url: URL.createObjectURL(file), // Using local blob URL for simulation
      altText: file.name,
      isPrimary: images.length === 0 && index === 0, // Make first image primary if none exists
    }));

    onChange([...images, ...newImages]);
  };

  const removeImage = (indexToRemove: number) => {
    const updatedImages = images.filter((_, index) => index !== indexToRemove);
    // Ensure there is at least one primary image if the list is not empty
    if (updatedImages.length > 0 && !updatedImages.some(img => img.isPrimary)) {
      updatedImages[0].isPrimary = true;
    }
    onChange(updatedImages);
  };

  const setPrimary = (indexToSet: number) => {
    const updatedImages = images.map((img, index) => ({
      ...img,
      isPrimary: index === indexToSet,
    }));
    onChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-[12px] p-8 text-center transition-colors cursor-pointer ${
          isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          accept="image/*"
          onChange={handleFileInput}
        />
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-3">
          <UploadCloud size={24} />
        </div>
        <p className="text-sm font-bold text-slate-text">Click or drag images here to upload</p>
        <p className="text-xs text-cool-grey mt-1">Supports JPG, PNG (Max 10 images)</p>
      </div>

      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
          {images.map((img, index) => (
            <div key={index} className="relative group rounded-[8px] overflow-hidden border border-gray-200 aspect-square">
              <img src={img.url} alt={img.altText} className="w-full h-full object-cover" />
              
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                  className="self-end bg-white/20 hover:bg-red-500 text-white rounded-full p-1 backdrop-blur-sm transition-colors"
                >
                  <X size={14} />
                </button>
                
                {!img.isPrimary && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setPrimary(index); }}
                    className="text-[10px] font-bold bg-white text-slate-text px-2 py-1 rounded shadow-sm hover:text-primary transition-colors"
                  >
                    Set Primary
                  </button>
                )}
              </div>

              {img.isPrimary && (
                <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                  <ImageIcon size={10} /> Primary
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

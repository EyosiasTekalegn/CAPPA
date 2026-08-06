import React, { useState, useRef } from 'react';
import { UploadCloud, X, Plus } from 'lucide-react';

interface ImageInputProps {
  value: string;
  onChange: (val: string) => void;
  label: string;
  multiline?: boolean;
}

// Compression helper
function compressImage(dataUrl: string, maxWidth = 1200, maxHeight = 1200, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Scale down if needed
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      // Convert to JPEG with quality to reduce size
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}

export const ImageInput: React.FC<ImageInputProps> = ({ value, onChange, label, multiline }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    try {
      if (multiline) {
        // For multiline, process each file individually
        const results: string[] = [];
        for (const file of Array.from(files)) {
          if (!file.type.startsWith('image/')) continue;
          const reader = new FileReader();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          // Compress if the dataUrl is large (> 500KB approx)
          let compressed = dataUrl;
          if (dataUrl.length > 500000) {
            compressed = await compressImage(dataUrl);
          }
          results.push(compressed);
        }
        const combined = results.join('\n');
        onChange(value ? `${value}\n${combined}` : combined);
      } else {
        // Single image mode
        const file = files[0];
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        let compressed = dataUrl;
        if (dataUrl.length > 500000) {
          compressed = await compressImage(dataUrl);
        }
        onChange(compressed);
      }
    } catch (err) {
      console.error('Image processing error:', err);
      // Fallback: try to use original data URL without compression if compression fails
      alert('Image compression failed. Please try a smaller image or use a different format.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleRemoveSingle = () => {
    onChange('');
  };

  const handleRemoveIndex = (index: number) => {
    const list = value.split('\n').filter(Boolean);
    list.splice(index, 1);
    onChange(list.join('\n'));
  };

  // Parse lines for multiple images
  const imagesList = multiline ? value.split('\n').filter(Boolean) : [];

  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
        {label}
      </label>

      {/* SINGLE IMAGE MODE */}
      {!multiline && value && (
        <div className="relative group w-full max-w-xs h-40 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
          <img 
            src={value} 
            alt="Uploaded preview" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-zinc-950 font-bold font-sans text-[10px] uppercase tracking-wider rounded-lg shadow hover:bg-zinc-100 transition cursor-pointer"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemoveSingle}
              className="p-1.5 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MULTIPLE IMAGES MODE */}
      {multiline && imagesList.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {imagesList.map((img, idx) => (
            <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xs bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
              <img 
                src={img} 
                alt={`Uploaded preview ${idx + 1}`} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={() => handleRemoveIndex(idx)}
                className="absolute top-1.5 right-1.5 p-1 bg-red-600/90 text-white rounded-md shadow hover:bg-red-700 transition opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          
          {/* Symmetrical Inline Plus Button to Append More Images */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 flex flex-col items-center justify-center gap-1 transition text-zinc-500 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Add Image</span>
          </button>
        </div>
      )}

      {/* DRAG-AND-DROP FILE PICKER */}
      {(!value || (multiline && imagesList.length === 0)) && (
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full rounded-2xl border-2 border-dashed p-6 transition text-center cursor-pointer ${
            isDragging 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-zinc-300 dark:border-zinc-700 hover:bg-black/5 dark:hover:bg-white/5 bg-zinc-50 dark:bg-zinc-900'
          }`}
        >
          {isCompressing ? (
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent" />
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Compressing image...</p>
            </div>
          ) : (
            <>
              <UploadCloud className="w-8 h-8 mx-auto mb-3 text-zinc-400 dark:text-zinc-500" />
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Tap to choose image</p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">Supports drag-and-drop & phone files</p>
            </>
          )}
        </div>
      )}

      <input 
        type="file" 
        multiple={multiline} 
        accept="image/*"
        ref={fileInputRef}
        onChange={(e) => processFiles(e.target.files)}
        className="hidden"
      />
    </div>
  );
};

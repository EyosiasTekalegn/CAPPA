import React, { useState, useRef } from 'react';
import { UploadCloud, X, Plus } from 'lucide-react';

interface ImageInputProps {
  value: string;
  onChange: (val: string) => void;
  label: string;
  multiline?: boolean;
}

export const ImageInput: React.FC<ImageInputProps> = ({ value, onChange, label, multiline }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    if (multiline) {
      // For multiline, convert each file to base64 and append
      Array.from(files).forEach((file) => {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            const resultStr = e.target.result.toString();
            onChange(value ? `${value}\n${resultStr}` : resultStr);
          }
        };
        reader.readAsDataURL(file);
      });
    } else {
      // For single image, replace the value
      const file = files[0];
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onChange(e.target.result.toString());
        }
      };
      reader.readAsDataURL(file);
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

      {/* DRAG-AND-DROP FILE PICKER (hide for single value screen) */}
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
          <UploadCloud className="w-8 h-8 mx-auto mb-3 text-zinc-400 dark:text-zinc-500" />
          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Tap to choose image</p>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">Supports drag-and-drop & phone files</p>
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

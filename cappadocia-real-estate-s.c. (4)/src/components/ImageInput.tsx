import React, { useCallback, useRef, useState } from "react";
import {
  UploadCloud,
  X,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface ImageInputProps {
  value: string;
  onChange: (val: string) => void;
  label: string;
  multiline?: boolean;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
}

const DEFAULT_MAX_SIZE_MB = 5;

// Compress image to reduce size (maxWidth/Height 1200, quality 0.8)
function compressImage(
  dataUrl: string,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
}

export function ImageInput({
  value,
  onChange,
  label,
  multiline = false,
  accept = "image/*",
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  disabled = false,
}: ImageInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropRef = useRef<HTMLDivElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  // If value is a URL, set preview to it; if base64, use as is.
  const getPreview = useCallback((val: string) => {
    if (!val) return "";
    // If it's already a data URL or an http URL, use it directly
    if (val.startsWith("data:") || val.startsWith("http")) return val;
    return "";
  }, []);

  const processFiles = useCallback(
    async (files: File[]) => {
      if (disabled || isProcessing || files.length === 0) return;

      setError("");
      setIsProcessing(true);

      try {
        // For single image
        if (!multiline) {
          const file = files[0];
          if (!file.type.startsWith("image/")) {
            throw new Error("Please select an image file.");
          }
          if (file.size > maxSizeMB * 1024 * 1024) {
            throw new Error(
              `Image too large. Maximum ${maxSizeMB}MB.`
            );
          }

          // Read file as data URL
          const reader = new FileReader();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          // Compress if large
          let finalData = dataUrl;
          if (dataUrl.length > 300000) {
            finalData = await compressImage(dataUrl);
          }

          setPreviewUrl(finalData);
          onChange(finalData);
          return;
        }

        // For multiple images
        const existingUrls = value
          ? value
              .split("\n")
              .map((u) => u.trim())
              .filter(Boolean)
          : [];

        const newUrls: string[] = [];
        for (const file of files) {
          if (!file.type.startsWith("image/")) continue;
          if (file.size > maxSizeMB * 1024 * 1024) continue;

          const reader = new FileReader();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          let finalData = dataUrl;
          if (dataUrl.length > 300000) {
            finalData = await compressImage(dataUrl);
          }
          newUrls.push(finalData);
        }

        const allUrls = [...existingUrls, ...newUrls];
        onChange(allUrls.join("\n"));
      } catch (err: any) {
        console.error("Image processing failed:", err);
        setError(err?.message || "Failed to process image.");
      } finally {
        setIsProcessing(false);
      }
    },
    [disabled, isProcessing, multiline, onChange, value, maxSizeMB]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) processFiles(files);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) processFiles(files);
  };

  const handleRemove = () => {
    if (disabled || isProcessing) return;
    onChange("");
    setPreviewUrl("");
    setError("");
  };

  const hasImage = Boolean(value && value.trim());
  const galleryUrls = multiline
    ? value
        .split("\n")
        .map((u) => u.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">
          {label}
        </label>
        {isProcessing && (
          <span className="text-[10px] font-bold text-red-600 dark:text-red-400">
            Processing...
          </span>
        )}
      </div>

      <div
        ref={dropRef}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); if (!disabled && !isProcessing) setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
        onDrop={handleDrop}
        onClick={() => {
          if (!disabled && !isProcessing) inputRef.current?.click();
        }}
        className={`
          relative w-full min-h-[150px]
          rounded-xl border-2 border-dashed
          transition-all duration-200
          overflow-hidden
          ${disabled || isProcessing ? "cursor-not-allowed opacity-70" : "cursor-pointer"}
          ${isDragging
            ? "border-red-600 bg-red-50 dark:bg-red-950/20"
            : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 hover:border-red-500 dark:hover:border-red-500"
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiline}
          disabled={disabled || isProcessing}
          onChange={handleFileChange}
          className="hidden"
        />

        {multiline && galleryUrls.length > 0 ? (
          <div className="p-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {galleryUrls.map((url, idx) => (
                <div
                  key={idx}
                  className="relative group aspect-video rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={url}
                    alt={`Gallery ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const next = galleryUrls.filter((_, i) => i !== idx);
                      onChange(next.join("\n"));
                    }}
                    disabled={disabled || isProcessing}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="aspect-video rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center gap-2 text-zinc-500 hover:text-red-600 hover:border-red-500 transition-colors">
                <UploadCloud className="w-6 h-6" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-center px-2">Add More</span>
              </div>
            </div>
            <p className="mt-3 text-[10px] text-zinc-500 dark:text-zinc-400">
              {galleryUrls.length} image{galleryUrls.length !== 1 ? "s" : ""} uploaded. Click here to add more.
            </p>
          </div>
        ) : !multiline && hasImage && (
          <div className="relative w-full min-h-[150px]" onClick={(e) => e.stopPropagation()}>
            <img
              src={getPreview(value) || value}
              alt={label}
              className="w-full max-h-72 object-cover"
              onError={() => setError("Image could not be loaded.")}
            />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all flex items-center justify-center">
              <div className="opacity-0 hover:opacity-100 transition-opacity flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={disabled || isProcessing}
                  className="px-3 py-2 rounded-lg bg-white text-zinc-900 text-xs font-bold shadow-lg flex items-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" /> Replace
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={disabled || isProcessing}
                  className="px-3 py-2 rounded-lg bg-red-600 text-white text-xs font-bold shadow-lg flex items-center gap-2"
                >
                  <X className="w-4 h-4" /> Remove
                </button>
              </div>
            </div>
            <div className="absolute left-3 bottom-3 px-2 py-1 rounded-md bg-black/70 text-white text-[9px] font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-green-400" />
              Stored (base64)
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            {isProcessing ? (
              <>
                <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center mb-3">
                  <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
                </div>
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Processing image...</p>
              </>
            ) : (
              <>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${isDragging ? "bg-red-100 dark:bg-red-950/40 text-red-600" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500"}`}>
                  {isDragging ? <ImageIcon className="w-6 h-6" /> : <UploadCloud className="w-6 h-6" />}
                </div>
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  {isDragging ? "Drop image here" : multiline ? "Click or drag images here" : "Click or drag an image here"}
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                  {multiline ? "You can select multiple images" : "JPG, PNG, WEBP and other image formats"}
                </p>
                <p className="text-[9px] text-zinc-400 mt-2">Maximum {maxSizeMB}MB per image</p>
              </>
            )}
          </div>
        )}
      </div>

      {isProcessing && (
        <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
          <div className="h-full bg-red-600 transition-all duration-300 animate-pulse" style={{ width: "100%" }} />
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-[10px] font-bold text-red-700 dark:text-red-400">Error</p>
            <p className="text-[10px] text-red-600 dark:text-red-300 mt-0.5">{error}</p>
          </div>
          <button type="button" onClick={() => setError("")} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default ImageInput;

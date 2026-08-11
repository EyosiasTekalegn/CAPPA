```tsx
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  UploadCloud,
  X,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { storage } from "../firebase";

interface ImageInputProps {
  value: string;
  onChange: (val: string) => void;
  label: string;
  multiline?: boolean;
  folder?: string;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
}

const DEFAULT_MAX_SIZE_MB = 10;

/**
 * Firebase Storage image uploader.
 *
 * IMPORTANT:
 * This component NEVER stores Base64 image data in Firestore.
 *
 * Flow:
 * Device File
 *    ↓
 * Browser preview
 *    ↓
 * Firebase Storage
 *    ↓
 * Permanent download URL
 *    ↓
 * onChange(downloadURL)
 *    ↓
 * Firestore stores only the URL
 */
export function ImageInput({
  value,
  onChange,
  label,
  multiline = false,
  folder = "website-images",
  accept = "image/*",
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  disabled = false,
}: ImageInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropRef = useRef<HTMLDivElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  /*
   * Keep the existing URL visible.
   *
   * If value is a Firebase Storage URL, Unsplash URL, etc.,
   * it is displayed directly.
   */
  useEffect(() => {
    if (value && !value.startsWith("data:")) {
      setPreviewUrl(value);
    } else {
      setPreviewUrl("");
    }
  }, [value]);

  /*
   * Converts a file into a browser preview only.
   *
   * This is NOT saved to Firestore.
   */
  const createPreview = useCallback((file: File) => {
    return URL.createObjectURL(file);
  }, []);

  /*
   * Upload one image to Firebase Storage.
   */
  const uploadImage = useCallback(
    async (file: File): Promise<string> => {
      if (!file) {
        throw new Error("No image was selected.");
      }

      if (!file.type.startsWith("image/")) {
        throw new Error("Please select an image file.");
      }

      const maxBytes = maxSizeMB * 1024 * 1024;

      if (file.size > maxBytes) {
        throw new Error(
          `Image is too large. Maximum allowed size is ${maxSizeMB}MB.`
        );
      }

      /*
       * Clean file name.
       */
      const originalName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .toLowerCase();

      const extension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      /*
       * Unique file name prevents collisions.
       */
      const uniqueId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      /*
       * Storage path.
       *
       * Example:
       * website-images/2026/08/abc123-property-image.jpg
       */
      const now = new Date();

      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");

      const storagePath =
        `${folder}/${year}/${month}/` +
        `${uniqueId}-${originalName || "image"}.${extension}`;

      const storageRef = ref(storage, storagePath);

      setUploadProgress(10);

      /*
       * Upload the ORIGINAL FILE.
       *
       * We intentionally don't use FileReader.readAsDataURL().
       * Therefore Base64 is never generated.
       */
      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
        },
      });

      setUploadProgress(75);

      /*
       * Firebase gives us the permanent URL.
       */
      const downloadUrl = await getDownloadURL(snapshot.ref);

      setUploadProgress(100);

      return downloadUrl;
    },
    [folder, maxSizeMB]
  );

  /*
   * Process selected files.
   *
   * Single mode:
   *    one image → one URL
   *
   * Multiline mode:
   *    multiple images → newline-separated URLs
   *
   * This keeps your existing AdminPanel API unchanged.
   */
  const processFiles = useCallback(
    async (files: File[]) => {
      if (disabled || isUploading || files.length === 0) {
        return;
      }

      setError("");
      setIsUploading(true);
      setUploadProgress(0);

      try {
        /*
         * Single-image mode.
         */
        if (!multiline) {
          const file = files[0];

          const preview = createPreview(file);
          setPreviewUrl(preview);

          try {
            const downloadUrl = await uploadImage(file);

            /*
             * THIS is what gets passed back to AdminPanel.
             *
             * It is a Firebase Storage URL,
             * NOT Base64.
             */
            onChange(downloadUrl);
            setPreviewUrl(downloadUrl);
          } finally {
            URL.revokeObjectURL(preview);
          }

          return;
        }

        /*
         * Multiple-image mode.
         *
         * Upload each image separately.
         */
        const existingUrls = value
          ? value
              .split("\n")
              .map((url) => url.trim())
              .filter(Boolean)
              .filter((url) => !url.startsWith("data:"))
          : [];

        const uploadedUrls: string[] = [];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          /*
           * Rough progress per file.
           */
          const baseProgress = Math.round(
            (i / files.length) * 100
          );

          setUploadProgress(baseProgress);

          const downloadUrl = await uploadImage(file);

          uploadedUrls.push(downloadUrl);
        }

        /*
         * Preserve existing gallery URLs and append new URLs.
         */
        const allUrls = [
          ...existingUrls,
          ...uploadedUrls,
        ];

        onChange(allUrls.join("\n"));
        setUploadProgress(100);
      } catch (err: any) {
        console.error("Image upload failed:", err);

        const message =
          err?.message ||
          "Failed to upload image. Please try again.";

        setError(message);
      } finally {
        setIsUploading(false);

        /*
         * Reset progress shortly after completion.
         */
        setTimeout(() => {
          setUploadProgress(0);
        }, 500);
      }
    },
    [
      createPreview,
      disabled,
      isUploading,
      multiline,
      onChange,
      uploadImage,
      value,
    ]
  );

  /*
   * File input handler.
   */
  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);

    if (files.length > 0) {
      processFiles(files);
    }

    /*
     * Reset input so selecting the same image again
     * triggers onChange.
     */
    event.target.value = "";
  };

  /*
   * Drag events.
   */
  const handleDragOver = (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    /*
     * Prevent flickering when moving between children.
     */
    if (
      dropRef.current &&
      !dropRef.current.contains(event.relatedTarget as Node)
    ) {
      setIsDragging(false);
    }
  };

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);

    if (disabled || isUploading) {
      return;
    }

    const files = Array.from(event.dataTransfer.files || []);

    if (files.length > 0) {
      processFiles(files);
    }
  };

  /*
   * Remove image.
   *
   * Important:
   * This removes the URL from Firestore's future value.
   *
   * It does NOT automatically delete the Storage file.
   *
   * That is intentional for now because deleting Storage files
   * requires deciding whether old files should be retained,
   * replaced, or permanently deleted.
   */
  const handleRemove = () => {
    if (disabled || isUploading) {
      return;
    }

    if (multiline) {
      onChange("");
    } else {
      onChange("");
    }

    setPreviewUrl("");
    setError("");
  };

  /*
   * Determine whether there is an actual image URL.
   */
  const hasImage = Boolean(value && value.trim());

  /*
   * Multiple image preview list.
   */
  const galleryUrls = multiline
    ? value
        .split("\n")
        .map((url) => url.trim())
        .filter(Boolean)
        .filter((url) => !url.startsWith("data:"))
    : [];

  return (
    <div className="w-full space-y-2">
      {/* Label */}
      <div className="flex items-center justify-between gap-3">
        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">
          {label}
        </label>

        {isUploading && (
          <span className="text-[10px] font-bold text-red-600 dark:text-red-400">
            Uploading {uploadProgress}%
          </span>
        )}
      </div>

      {/* Upload Area */}
      <div
        ref={dropRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (!disabled && !isUploading) {
            inputRef.current?.click();
          }
        }}
        className={`
          relative w-full min-h-[150px]
          rounded-xl border-2 border-dashed
          transition-all duration-200
          overflow-hidden
          ${
            disabled || isUploading
              ? "cursor-not-allowed opacity-70"
              : "cursor-pointer"
          }
          ${
            isDragging
              ? "border-red-600 bg-red-50 dark:bg-red-950/20"
              : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 hover:border-red-500 dark:hover:border-red-500"
          }
        `}
      >
        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiline}
          disabled={disabled || isUploading}
          onChange={handleFileChange}
          className="hidden"
        />

        {/* MULTIPLE IMAGE PREVIEW */}
        {multiline && galleryUrls.length > 0 ? (
          <div className="p-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {galleryUrls.map((url, index) => (
                <div
                  key={`${url}-${index}`}
                  className="relative group aspect-video rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900"
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                >
                  <img
                    src={url}
                    alt={`Gallery image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all" />

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();

                      const next = galleryUrls.filter(
                        (_, i) => i !== index
                      );

                      onChange(next.join("\n"));
                    }}
                    disabled={disabled || isUploading}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/60 text-white text-[9px] font-bold">
                    Image {index + 1}
                  </div>
                </div>
              ))}

              {/* Add more */}
              <div className="aspect-video rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center gap-2 text-zinc-500 hover:text-red-600 hover:border-red-500 transition-colors">
                <UploadCloud className="w-6 h-6" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-center px-2">
                  Add More
                </span>
              </div>
            </div>

            <p className="mt-3 text-[10px] text-zinc-500 dark:text-zinc-400">
              {galleryUrls.length} image
              {galleryUrls.length === 1 ? "" : "s"} uploaded.
              Click here to add more.
            </p>
          </div>
        ) : !multiline && hasImage && previewUrl ? (
          /*
           * SINGLE IMAGE PREVIEW
           */
          <div
            className="relative w-full min-h-[150px]"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={previewUrl}
              alt={label}
              className="w-full max-h-72 object-cover"
              onError={() => {
                setError(
                  "The image URL could not be loaded."
                );
              }}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all flex items-center justify-center">
              <div className="opacity-0 hover:opacity-100 transition-opacity flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={disabled || isUploading}
                  className="px-3 py-2 rounded-lg bg-white text-zinc-900 text-xs font-bold shadow-lg flex items-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  Replace
                </button>

                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={disabled || isUploading}
                  className="px-3 py-2 rounded-lg bg-red-600 text-white text-xs font-bold shadow-lg flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>

            {/* Uploaded indicator */}
            {value &&
              !value.startsWith("data:") &&
              (value.startsWith("https://") ||
                value.startsWith("http://")) && (
                <div className="absolute left-3 bottom-3 px-2 py-1 rounded-md bg-black/70 text-white text-[9px] font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-green-400" />
                  Stored
                </div>
              )}
          </div>
        ) : (
          /*
           * EMPTY STATE
           */
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            {isUploading ? (
              <>
                <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center mb-3">
                  <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
                </div>

                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Uploading image...
                </p>

                <p className="text-[10px] text-zinc-500 mt-1">
                  Please don't close this page.
                </p>
              </>
            ) : (
              <>
                <div
                  className={`
                    w-12 h-12 rounded-full
                    flex items-center justify-center mb-3
                    ${
                      isDragging
                        ? "bg-red-100 dark:bg-red-950/40 text-red-600"
                        : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500"
                    }
                  `}
                >
                  {isDragging ? (
                    <ImageIcon className="w-6 h-6" />
                  ) : (
                    <UploadCloud className="w-6 h-6" />
                  )}
                </div>

                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  {isDragging
                    ? "Drop image here"
                    : multiline
                    ? "Click or drag images here"
                    : "Click or drag an image here"}
                </p>

                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                  {multiline
                    ? "You can select multiple images"
                    : "JPG, PNG, WEBP and other image formats"}
                </p>

                <p className="text-[9px] text-zinc-400 mt-2">
                  Maximum {maxSizeMB}MB per image
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-red-600 transition-all duration-300"
            style={{
              width: `${uploadProgress}%`,
            }}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />

          <div className="flex-1">
            <p className="text-[10px] font-bold text-red-700 dark:text-red-400">
              Upload failed
            </p>

            <p className="text-[10px] text-red-600 dark:text-red-300 mt-0.5">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* URL information */}
      {!multiline && value && !value.startsWith("data:") && (
        <div className="flex items-center gap-2 text-[9px] text-zinc-500 dark:text-zinc-400">
          <CheckCircle2 className="w-3 h-3 text-green-600" />

          <span className="truncate">
            Image URL saved successfully
          </span>
        </div>
      )}
    </div>
  );
}

export default ImageInput;
```

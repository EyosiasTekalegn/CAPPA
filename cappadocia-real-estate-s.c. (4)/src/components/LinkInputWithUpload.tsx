import React, { useRef, useState } from "react";
import {
  Link as LinkIcon,
  UploadCloud,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

interface LinkInputWithUploadProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  accept?: string;
  hint?: string;
  folder?: string;
  maxSizeMB?: number;
  disabled?: boolean;
}

const DEFAULT_MAX_SIZE_MB = 25;

function getAcceptValue(accept?: string) {
  if (!accept || accept === "image") return "image/*";
  if (accept === "video") return "video/*";
  if (accept === "audio") return "audio/*";
  return accept;
}

function getFileKind(file: File) {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  return "file";
}

export function LinkInputWithUpload({
  value,
  onChange,
  label,
  placeholder = "Paste a URL or upload a file",
  accept = "image",
  hint,
  folder = "website-assets",
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  disabled = false,
}: LinkInputWithUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");

  const acceptedTypes = getAcceptValue(accept);

  const uploadFile = async (file: File) => {
    setError("");

    const maxBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxBytes) {
      throw new Error(
        `File is too large. Maximum allowed size is ${maxSizeMB}MB.`
      );
    }

    const requestedKind =
      accept === "image"
        ? "image"
        : accept === "video"
        ? "video"
        : accept === "audio"
        ? "audio"
        : null;

    if (requestedKind && !file.type.startsWith(`${requestedKind}/`)) {
      throw new Error(`Please select a valid ${requestedKind} file.`);
    }

    const cleanName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .toLowerCase();

    const extension =
      file.name.split(".").pop()?.toLowerCase() || "bin";

    const uniqueId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const storagePath =
      `${folder}/${year}/${month}/` +
      `${uniqueId}-${cleanName || "upload"}.${extension}`;

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const storageRef = ref(storage, storagePath);

      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          source: "LinkInputWithUpload",
        },
      });

      setUploadProgress(75);

      const downloadUrl = await getDownloadURL(snapshot.ref);

      setUploadProgress(100);
      onChange(downloadUrl);

      return downloadUrl;
    } finally {
      setIsUploading(false);

      window.setTimeout(() => {
        setUploadProgress(0);
      }, 500);
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file || disabled || isUploading) {
      return;
    }

    try {
      await uploadFile(file);
    } catch (err: any) {
      console.error("Asset upload failed:", err);

      setError(
        err?.message || "Upload failed. Please try again."
      );
    }
  };

  const handleRemove = () => {
    if (disabled || isUploading) {
      return;
    }

    onChange("");
    setError("");
  };

  const isHttpUrl =
    value.startsWith("http://") ||
    value.startsWith("https://");

  const isFirebaseStorageUrl =
    value.includes("firebasestorage.googleapis.com") ||
    value.includes("firebasestorage.app");

  const canPreviewImage =
    value &&
    (isHttpUrl || isFirebaseStorageUrl) &&
    (accept === "image" || value.match(/\.(jpg|jpeg|png|webp|gif|avif)(\?.*)?$/i));

  const fileKind = value ? getFileKindFromUrl(value) : null;

  return (
    <div className="w-full space-y-2">
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

      <div className="relative">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />

            <input
              type="text"
              value={value}
              disabled={disabled || isUploading}
              onChange={(event) => {
                setError("");
                onChange(event.target.value);
              }}
              placeholder={placeholder}
              className="w-full p-3 pl-9 pr-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all duration-200 disabled:opacity-60"
            />
          </div>

          <button
            type="button"
            disabled={disabled || isUploading}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UploadCloud className="w-4 h-4" />
            )}
            {isUploading ? "Uploading..." : "Upload"}
          </button>

          <input
            ref={inputRef}
            type="file"
            accept={acceptedTypes}
            disabled={disabled || isUploading}
            onChange={handleFileChange}
            className="hidden"
          />

          {value && !isUploading && (
            <button
              type="button"
              disabled={disabled}
              onClick={handleRemove}
              className="inline-flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-300 hover:text-red-600 hover:border-red-300 transition disabled:opacity-60"
              title="Clear value"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {hint && (
          <p className="text-[9px] text-zinc-500 dark:text-zinc-400 mt-1.5">
            {hint}
          </p>
        )}
      </div>

      {isUploading && (
        <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-red-600 transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />

          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-red-700 dark:text-red-400">
              Upload failed
            </p>

            <p className="text-[10px] text-red-600 dark:text-red-300 mt-0.5 break-words">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="text-red-500 hover:text-red-700 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {value && !error && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50 dark:bg-zinc-950">
          {canPreviewImage ? (
            <div className="relative aspect-video max-h-64">
              <img
                src={value}
                alt={label}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            </div>
          ) : (
            <div className="p-3 flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200">
                  {isFirebaseStorageUrl
                    ? "Firebase Storage asset"
                    : "URL / Link"}
                </p>

                <p className="text-[9px] text-zinc-500 dark:text-zinc-400 truncate">
                  {value}
                </p>
              </div>

              {isHttpUrl && (
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className="flex-shrink-0 text-zinc-500 hover:text-red-600 transition"
                  title="Open link"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          )}

          {canPreviewImage && (
            <div className="px-3 py-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />

              <span className="text-[9px] text-zinc-500 dark:text-zinc-400 truncate flex-1">
                {isFirebaseStorageUrl
                  ? "Stored in Firebase Storage"
                  : "Image URL"}
              </span>

              {isHttpUrl && (
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className="text-[9px] font-bold text-red-600 hover:text-red-700 inline-flex items-center gap-1"
                >
                  Open
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getFileKindFromUrl(url: string) {
  const cleanUrl = url.split("?")[0].toLowerCase();

  if (/\.(jpg|jpeg|png|webp|gif|avif)$/.test(cleanUrl)) {
    return "image";
  }

  if (/\.(mp4|webm|mov|avi|mkv)$/.test(cleanUrl)) {
    return "video";
  }

  if (/\.(mp3|wav|ogg|m4a)$/.test(cleanUrl)) {
    return "audio";
  }

  return "link";
}

export default LinkInputWithUpload;

"use client";

import { useCallback, useRef, useState } from "react";
import { api, ApiRequestError } from "@/lib/api";
import { proxiedImageUrl } from "@/lib/image";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
}

export function ImageUpload({ images, onImagesChange }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setError("");
      setUploading(true);

      try {
        const res = await api.uploadImage(file);
        onImagesChange([...images, res.path]);
      } catch (err) {
        if (err instanceof ApiRequestError) {
          setError(err.message);
        } else {
          setError("Upload failed");
        }
      } finally {
        setUploading(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [images, onImagesChange]
  );

  const handleRemove = useCallback(
    (index: number) => {
      onImagesChange(images.filter((_, i) => i !== index));
    },
    [images, onImagesChange]
  );

  return (
    <div className="space-y-3">
      {/* Image previews */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((path, index) => (
            <div key={path} className="group relative">
              <img
                src={proxiedImageUrl(path)}
                alt={`Product image ${index + 1}`}
                className="h-24 w-24 rounded-md object-cover border"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/heic"
          onChange={handleUpload}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Uploading...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" x2="12" y1="3" y2="15" />
              </svg>
              Upload Image
            </>
          )}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <p className="text-xs text-muted-foreground">
        JPG, PNG, or HEIC. Max 10MB. Images are auto-optimized to WebP.
      </p>
    </div>
  );
}

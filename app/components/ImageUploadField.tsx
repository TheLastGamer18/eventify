"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

/** Returns true when a URL points to our own Supabase Storage bucket */
function isSupabaseStorageUrl(url: string): boolean {
  return Boolean(SUPABASE_URL) && url.startsWith(SUPABASE_URL + "/storage/");
}

interface ImageUploadFieldProps {
  label: string;
  /** "banner", "logo", or "certificate" — passed to /api/upload-image as the `type` field */
  imageType: "banner" | "logo" | "certificate";
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  /** For banner: "h-48" aspect. For logo: square inside h-[270px] container */
  variant: "banner" | "logo";
  /** When true, hides the image preview area (useful when the parent provides its own preview) */
  hidePreview?: boolean;
}

const inputClass =
  "brutal-border bg-card text-card-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-brutal-pink";

export function ImageUploadField({
  label,
  imageType,
  value,
  onChange,
  disabled = false,
  variant,
  hidePreview = false,
}: ImageUploadFieldProps) {
  // Auto-detect mode based on the initial value:
  // If the URL is a Supabase storage URL → it was previously uploaded → show "file" tab
  // If it's empty or an external URL → show "url" tab
  const [mode, setMode] = useState<"url" | "file">(() =>
    value && isSupabaseStorageUrl(value) ? "file" : "url"
  );
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const switchMode = (next: "url" | "file") => {
    setMode(next);
    // Do NOT clear the value — the image URL should persist across tab switches
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", imageType);
      const res = await fetch("/api/upload-image", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Upload failed", { description: data.error ?? "Unknown error" });
        return;
      }
      onChange(data.url as string);
    } catch {
      toast.error("Upload failed", { description: "Network error" });
    } finally {
      setUploading(false);
      // Reset file input so the same file can be re-selected after clearing
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const clearImage = () => {
    onChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const containerClass =
    variant === "banner"
      ? "brutal-border flex h-48 flex-col items-center justify-center rounded-md border-dashed bg-secondary text-muted-foreground overflow-hidden relative"
      : "brutal-border flex h-[270px] w-full items-center justify-center rounded-md border-dashed bg-secondary/50 relative p-2";

  return (
    <div className="brutal-border brutal-shadow rounded-lg bg-card p-6 overflow-x-auto">
      <Label className="mb-3 block text-sm font-bold">{label}</Label>

      {/* Mode tabs */}
      {!disabled && (
        <div className="mb-3 flex gap-1 rounded-md border border-border bg-secondary p-1 w-fit">
          {(["url", "file"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => switchMode(tab)}
              className={`rounded px-3 py-1 text-xs font-bold transition-all ${
                mode === tab
                  ? "bg-brutal-pink text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "url" ? "Image URL" : "Upload File"}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      {mode === "url" ? (
        <div className="mb-2">
          <Input
            placeholder={imageType === "banner" ? "Paste image URL here..." : "Paste logo URL here..."}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
            disabled={disabled}
          />
        </div>
      ) : (
        <div className="mb-2 flex items-center gap-2">
          <label
            htmlFor={`${imageType}-file-input`}
            className={`brutal-border flex flex-1 cursor-pointer items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground ${
              uploading || disabled ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {uploading ? (
              <Loader2 size={16} className="animate-spin shrink-0" />
            ) : (
              <ImagePlus size={16} className="shrink-0" />
            )}
            {uploading ? "Uploading…" : value ? "Replace image" : "Choose image file"}
          </label>

          {/* Clear button — only shown when a file URL is set */}
          {value && !disabled && !uploading && (
            <button
              type="button"
              onClick={clearImage}
              title="Remove image"
              className="brutal-border flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <X size={15} />
            </button>
          )}

          <input
            ref={fileInputRef}
            id={`${imageType}-file-input`}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            className="sr-only"
            onChange={handleFileChange}
            disabled={uploading || disabled}
          />
        </div>
      )}

      {/* Preview — hidden when parent provides its own (e.g. CertificateTemplatePicker) */}
      {!hidePreview && variant === "banner" ? (
        <div className={containerClass}>
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={32} className="animate-spin" />
              <span className="text-sm font-semibold">Uploading…</span>
            </div>
          ) : value ? (
            <img src={value} alt="Banner Preview" className="w-full h-full object-cover" />
          ) : (
            <>
              <ImagePlus size={36} className="mb-2" />
              <span className="text-sm font-semibold">Preview will appear here</span>
            </>
          )}
        </div>
      ) : !hidePreview ? (
        <div className={containerClass}>
          <div className="brutal-border relative flex h-full aspect-square shrink-0 items-center justify-center overflow-hidden rounded-md bg-secondary text-muted-foreground">
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 size={36} className="animate-spin" />
                <span className="text-sm font-semibold">Uploading…</span>
              </div>
            ) : value ? (
              <img src={value} alt="Logo Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <ImagePlus size={48} className="mb-2" />
                <span className="text-lg font-bold">Preview</span>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {!hidePreview && (
        <p className="text-xs text-muted-foreground mt-2">
          {mode === "url"
            ? "Paste a direct image link (e.g. from Unsplash)"
            : "JPEG, PNG, WebP, GIF or SVG · Max 5 MB"}
        </p>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Upload, MoveVertical } from "lucide-react";
import { Label } from "@/components/ui/label";
import { ImageUploadField } from "@/components/ImageUploadField";

const BUILT_IN_TEMPLATES = ["default", "template1", "template2", "template3"];

function isCustomUrl(value: string): boolean {
  return value.startsWith("http");
}

// ── Live CSS preview that approximates the PDF layout ─────────────────────────
//
// Conversion notes:
//   PDF page: 842 × 595 pt (landscape A4)
//   `top` as % is relative to containing block HEIGHT.
//   Desired top (pt) = (20 + textOffset).
//   As % of height 595: (20 + textOffset) / 595 * 100
//
//   Font sizes use `cqw` (container query width) — set containerType on the wrapper.
//   PDF font pt → cqw: fontSize_pt / 842 * 100  (e.g. 48pt → 5.7cqw)
//
function CertificatePreview({
  bgUrl,
  textOffset,
}: {
  bgUrl: string;
  textOffset: number;
}) {
  const topPercent = ((20 + textOffset) / 595) * 100;

  return (
    // containerType: inline-size enables cqw units for descendants
    // max-w-2xl keeps the preview readable rather than full-page-width
    <div className="max-w-2xl mx-auto" style={{ containerType: "inline-size" }}>
      <div
        className="relative w-full rounded-lg overflow-hidden brutal-border bg-white"
        style={{ aspectRatio: "842 / 595" }}
      >
        {bgUrl ? (
          <img
            src={bgUrl}
            className="absolute inset-0 w-full h-full object-cover"
            alt="Certificate background"
            crossOrigin="anonymous"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Upload size={28} />
            <span className="text-sm font-semibold">Upload a template image to see the preview</span>
          </div>
        )}

        {/* Text overlay — mirrors CertificateTemplate.tsx content structure */}
        {bgUrl && (
          <div
            className="absolute left-0 right-0 flex flex-col items-center text-center pointer-events-none"
            style={{
              top: `${Math.max(-10, topPercent)}%`,
              paddingLeft: "9.5%",  /* 80pt / 842pt */
              paddingRight: "9.5%",
              fontFamily: "Georgia, 'Times New Roman', serif",
            }}
          >
            {/* Spacer matching the <View style={{ height: 30 }} /> in the PDF */}
            <div style={{ height: "5.04%" }} /* 30/595 */ />

            {/* Header — 48pt → 5.7cqw */}
            <p style={{ fontSize: "5.7cqw", color: "#2a2a2a", marginBottom: "1.19cqw" }}>
              Certificate of Participation
            </p>

            {/* Sub-header — 12pt → 1.42cqw */}
            <p
              style={{
                fontSize: "1.42cqw",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "#555",
                marginBottom: "2.38cqw",
              }}
            >
              The following award is given to
            </p>

            {/* Recipient name — 42pt → 4.99cqw */}
            <p
              style={{
                fontSize: "4.99cqw",
                fontWeight: "bold",
                color: "#1a1a1a",
                borderBottom: "1px solid #999",
                paddingBottom: "0.59cqw",
                marginBottom: "2.38cqw",
                width: "80%",
              }}
            >
              Attendee Name
            </p>

            {/* Body text — 14pt → 1.66cqw */}
            <p style={{ fontSize: "1.66cqw", color: "#444", marginTop: "2.38cqw", marginBottom: "1.19cqw" }}>
              For successfully attending and actively participating in
            </p>

            {/* Event name — 28pt → 3.33cqw */}
            <p style={{ fontSize: "3.33cqw", fontWeight: "bold", color: "#2a2a2a" }}>
              Your Event Name
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main picker component ─────────────────────────────────────────────────────
interface CertificateTemplatePickerProps {
  /** Built-in template name ("default", "template1"…) or a Supabase Storage URL */
  value: string;
  onChange: (v: string) => void;
  /** Vertical offset in PDF points. Passed through to CertificateTemplate at generation time. */
  textOffset: number;
  onTextOffsetChange: (offset: number) => void;
  disabled?: boolean;
}

export function CertificateTemplatePicker({
  value,
  onChange,
  textOffset,
  onTextOffsetChange,
  disabled = false,
}: CertificateTemplatePickerProps) {
  const [mode, setMode] = useState<"builtin" | "custom">(() =>
    isCustomUrl(value) ? "custom" : "builtin"
  );
  // Keep the uploaded URL across mode switches
  const [customBgUrl, setCustomBgUrl] = useState(() =>
    isCustomUrl(value) ? value : ""
  );

  const handleSelectBuiltin = (t: string) => {
    setMode("builtin");
    onChange(t);
  };

  const handleSelectCustom = () => {
    setMode("custom");
    // Propagate whatever URL is already uploaded (may be empty until they upload)
    onChange(customBgUrl);
  };

  const handleCustomBgChange = (url: string) => {
    setCustomBgUrl(url);
    onChange(url);
  };

  return (
    <div className="space-y-6">
      {/* ── Template grid ── */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
        {/* Built-in template cards */}
        {BUILT_IN_TEMPLATES.map((template) => (
          <div
            key={template}
            onClick={() => !disabled && handleSelectBuiltin(template)}
            className={`cursor-pointer rounded-lg p-2 transition-all overflow-hidden ${
              mode === "builtin" && value === template
                ? "ring-4 ring-brutal-pink scale-105"
                : "brutal-border hover:opacity-80 opacity-60"
            } ${disabled ? "pointer-events-none opacity-40" : ""}`}
          >
            <div className="aspect-[1.414] w-full overflow-hidden rounded-md bg-secondary relative">
              <img
                src={`/certificates/${template}.png`}
                alt={`${template} preview`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/420x297?text=Template";
                }}
              />
            </div>
            <p className="text-center text-xs font-bold mt-1 capitalize">
              {template === "default" ? "Default" : template.replace("template", "Style ")}
            </p>
          </div>
        ))}

        {/* Custom upload card */}
        <div
          onClick={() => !disabled && handleSelectCustom()}
          className={`cursor-pointer rounded-lg p-2 transition-all overflow-hidden ${
            mode === "custom"
              ? "ring-4 ring-brutal-pink scale-105"
              : "brutal-border hover:opacity-80 opacity-60"
          } ${disabled ? "pointer-events-none opacity-40" : ""}`}
        >
          <div className="aspect-[1.414] w-full overflow-hidden rounded-md bg-secondary relative flex flex-col items-center justify-center text-muted-foreground gap-1">
            {customBgUrl ? (
              <img
                src={customBgUrl}
                className="absolute inset-0 h-full w-full object-cover"
                alt="Custom template"
              />
            ) : (
              <>
                <Upload size={20} />
                <span className="text-xs font-semibold text-center leading-tight px-1">
                  Upload Your Own
                </span>
              </>
            )}
          </div>
          <p className="text-center text-xs font-bold mt-1">Custom</p>
        </div>
      </div>

      {/* ── Custom settings panel ── only when custom mode is active ── */}
      {mode === "custom" && !disabled && (
        <div className="brutal-border brutal-shadow rounded-lg bg-card p-6 space-y-8">
          <div className="flex items-center gap-2">
            <MoveVertical size={20} className="text-brutal-pink shrink-0" />
            <h3 className="font-black text-lg">Custom Certificate Settings</h3>
          </div>

          {/* Upload */}
          <div className="space-y-2">
            <Label className="font-bold">Template Image</Label>
            <p className="text-xs text-muted-foreground">
              Upload a landscape A4 image (PNG or JPG, max 5 MB). Leave the center area clear — the
              participant name, event name, and date will be overlaid automatically.
            </p>
            <ImageUploadField
              label=""
              imageType="certificate"
              value={customBgUrl}
              onChange={handleCustomBgChange}
              variant="banner"
              hidePreview
            />
          </div>

          {/* Vertical offset slider */}
          <div className="space-y-2">
            <Label className="font-bold">
              Text Vertical Position{" "}
              <span className="font-normal text-muted-foreground text-xs">
                ({textOffset > 0 ? `+${textOffset}` : textOffset} pt)
              </span>
            </Label>
            <p className="text-xs text-muted-foreground">
              Drag to move the text overlay up or down to fit your template's design. Adjust until the
              live preview looks right, then download to confirm.
            </p>
            <input
              type="range"
              min={-150}
              max={200}
              step={5}
              value={textOffset}
              onChange={(e) => onTextOffsetChange(Number(e.target.value))}
              className="w-full accent-brutal-pink cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground select-none">
              <span>↑ Move up</span>
              <button
                type="button"
                onClick={() => onTextOffsetChange(0)}
                className="underline hover:no-underline"
              >
                Reset
              </button>
              <span>Move down ↓</span>
            </div>
          </div>

          {/* Live preview */}
          <div className="space-y-2">
            <Label className="font-bold">Live Preview</Label>
            <p className="text-xs text-muted-foreground">
              Approximate placement of the text overlay. Download the certificate for the pixel-perfect result.
            </p>
            <CertificatePreview bgUrl={customBgUrl} textOffset={textOffset} />
          </div>
        </div>
      )}
    </div>
  );
}

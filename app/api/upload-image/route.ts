import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// Maps MIME type → safe file extension derived from MIME (NOT from the filename)
const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

// Only these values are accepted for the `type` field to prevent path injection
const ALLOWED_IMAGE_TYPES = ["banner", "logo", "certificate"] as const;
type ImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

const BUCKET = "event-images";

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check — no anonymous uploads
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const rawType = formData.get("type") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 2. Validate the `type` field — must be exactly "banner" or "logo"
    if (!rawType || !ALLOWED_IMAGE_TYPES.includes(rawType as ImageType)) {
      return NextResponse.json(
        { error: 'Invalid image type. Must be "banner" or "logo".' },
        { status: 400 }
      );
    }
    const type = rawType as ImageType;

    // 3. Validate MIME type against known-safe whitelist
    const ext = ALLOWED_MIME_TYPES[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, GIF, and SVG are allowed." },
        { status: 400 }
      );
    }

    // 4. Enforce file size limit
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5 MB." },
        { status: 400 }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 5. Build a safe, deterministic storage path scoped to the user.
    //    Extension comes from the MIME type map — NOT the original filename —
    //    so a file named "malicious.exe" with MIME "image/jpeg" still gets ".jpg".
    //    Path pattern: <userId>/<type>-<timestamp>.<ext>
    const uniqueName = `${session.user.id}/${type}-${Date.now()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(uniqueName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(uniqueName);

    return NextResponse.json({ url: data.publicUrl });
  } catch (err: unknown) {
    console.error("Upload route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

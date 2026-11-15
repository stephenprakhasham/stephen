import { NextResponse } from "next/server";
import { requireDivision, requirePermission, AuthError, type DivisionId } from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const VALID: DivisionId[] = ["mobiles", "jewellery", "digital"];
const parseDivision = (p: string): DivisionId | null =>
  (VALID as string[]).includes(p) ? (p as DivisionId) : null;

const authError = (e: unknown) =>
  NextResponse.json({ error: (e as Error).message }, { status: e instanceof AuthError ? e.status : 401 });

type Ctx = { params: Promise<{ division: string; id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { division, id } = await params;
  const div = parseDivision(division);
  if (!div) return NextResponse.json({ error: "Invalid division." }, { status: 400 });
  try { await requireDivision(div); } catch (e) { return authError(e); }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("product_videos")
    .select("*")
    .eq("product_id", id)
    .order("created_at");
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request, { params }: Ctx) {
  const { division, id } = await params;
  const div = parseDivision(division);
  if (!div) return NextResponse.json({ error: "Invalid division." }, { status: 400 });
  try {
    await requireDivision(div);
    await requirePermission("catalogue.edit");
  } catch (e) { return authError(e); }

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Expected multipart form data." }, { status: 400 });

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required." }, { status: 400 });
  }

  const title = (form.get("title") as string | null) ?? null;
  const isFeature = form.get("is_feature") === "true";

  try {
    const supabase = await createSupabaseServerClient();
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "mp4";
    const path = `${div}/${id}/videos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("product-media")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
    if (uploadError) throw new Error(uploadError.message);

    const { data: urlData } = supabase.storage.from("product-media").getPublicUrl(path);

    // If this is the first video or marked as feature, unset others
    if (isFeature) {
      await supabase
        .from("product_videos")
        .update({ is_feature: false })
        .eq("product_id", id);
    }

    const { data, error } = await supabase
      .from("product_videos")
      .insert({
        product_id: id,
        division_id: div,
        url: urlData.publicUrl,
        title,
        is_feature: isFeature,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  const { division, id } = await params;
  const div = parseDivision(division);
  if (!div) return NextResponse.json({ error: "Invalid division." }, { status: 400 });
  try {
    await requireDivision(div);
    await requirePermission("catalogue.edit");
  } catch (e) { return authError(e); }

  const body = (await req.json().catch(() => null)) as
    | { video_id?: string; title?: string; is_feature?: boolean }
    | null;
  if (!body?.video_id) {
    return NextResponse.json({ error: "video_id is required." }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    if (body.is_feature) {
      await supabase
        .from("product_videos")
        .update({ is_feature: false })
        .eq("product_id", id);
    }
    const { error } = await supabase
      .from("product_videos")
      .update({ title: body.title, is_feature: body.is_feature })
      .eq("id", body.video_id);
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: Ctx) {
  const { division, id } = await params;
  const div = parseDivision(division);
  if (!div) return NextResponse.json({ error: "Invalid division." }, { status: 400 });
  try {
    await requireDivision(div);
    await requirePermission("catalogue.edit");
  } catch (e) { return authError(e); }

  const videoId = new URL(req.url).searchParams.get("video_id");
  if (!videoId) {
    return NextResponse.json({ error: "video_id is required." }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("product_videos")
      .delete()
      .eq("id", videoId);
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
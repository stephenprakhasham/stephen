import { NextResponse } from "next/server";
import { requireDivision, requirePermission, AuthError, type DivisionId } from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  uploadProductImage,
  addProductImage,
  listProductImages,
  updateProductImage,
  removeProductImage,
} from "@/lib/storage";

const VALID: DivisionId[] = ["mobiles", "jewellery", "digital"];
const parseDivision = (p: string): DivisionId | null =>
  (VALID as string[]).includes(p) ? (p as DivisionId) : null;

const authError = (e: unknown) =>
  NextResponse.json({ error: (e as Error).message }, { status: e instanceof AuthError ? e.status : 401 });

type Ctx = { params: Promise<{ division: string; id: string }> };

async function syncMainImageToProduct(productId: string): Promise<void> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("product_images")
      .select("url, is_main")
      .eq("product_id", productId)
      .eq("is_main", true)
      .order("sort_order")
      .limit(1);
    if (data?.[0]?.url) {
      await supabase
        .from("catalogue_products")
        .update({ image_urls: [data[0].url] })
        .eq("id", productId);
    }
  } catch {
    // best-effort sync
  }
}

export async function GET(_req: Request, { params }: Ctx) {
  const { division, id } = await params;
  const div = parseDivision(division);
  if (!div) return NextResponse.json({ error: "Invalid division." }, { status: 400 });
  try { await requireDivision(div); } catch (e) { return authError(e); }

  const supabase = await createSupabaseServerClient();

  const [{ data: images }, { data: videos }] = await Promise.all([
    supabase
      .from("product_images")
      .select("*")
      .eq("product_id", id)
      .order("sort_order"),
    supabase
      .from("product_videos")
      .select("*")
      .eq("product_id", id)
      .order("created_at"),
  ]);

  return NextResponse.json({
    images: images ?? [],
    videos: videos ?? [],
  });
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
  const alt = (form.get("alt") as string | null) ?? null;
  const isMain = form.get("is_main") === "true";
  const sortOrder = Number(form.get("sort_order") ?? 0) || 0;
  const is360 = form.get("is_360") === "true";

  try {
    const url = await uploadProductImage(div, id, file);
    const row = await addProductImage(div, id, url, alt, isMain, sortOrder, is360);
    if (isMain && !is360) await syncMainImageToProduct(id);
    return NextResponse.json(row);
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
    | { image_id?: string; alt?: string | null; is_main?: boolean; sort_order?: number; is_360?: boolean }
    | null;
  if (!body?.image_id) {
    return NextResponse.json({ error: "image_id is required." }, { status: 400 });
  }

  try {
    await updateProductImage(id, body.image_id, {
      alt: body.alt,
      is_main: body.is_main,
      sort_order: body.sort_order,
      is_360: body.is_360,
    });
    if (body.is_main) await syncMainImageToProduct(id);
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

  const imageId = new URL(req.url).searchParams.get("image_id");
  if (!imageId) {
    return NextResponse.json({ error: "image_id is required." }, { status: 400 });
  }

  try {
    await removeProductImage(imageId);
    await syncMainImageToProduct(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
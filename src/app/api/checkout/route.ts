import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/supabase-db";
import { writeAudit } from "@/lib/audit";

const VALID = ["mobiles", "jewellery", "digital"];

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | {
        division?: string;
        customer_name?: string;
        phone?: string;
        email?: string | null;
        address?: string | null;
        items?: { productId: string; quantity: number }[];
      }
    | null;

  if (!body?.division || !VALID.includes(body.division)) {
    return NextResponse.json({ error: "Invalid division." }, { status: 400 });
  }
  if (!body.customer_name || !body.phone) {
    return NextResponse.json(
      { error: "customer_name and phone are required." },
      { status: 400 }
    );
  }
  if (!body.items?.length) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }

  const division = body.division;

  // Load products to validate & price.
  const productIds = body.items.map((i) => i.productId);
  const products = await dbQuery<{
    id: string;
    name: string;
    retail_price: number | null;
    division_id: string;
  }>(
    "select id, name, retail_price, division_id from public.catalogue_products where id = any($1::uuid[]) and division_id = $2",
    [productIds, division]
  );
  const productMap = new Map(products.map((p) => [p.id, p]));

  const lineItems: {
    product_id: string;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[] = [];
  let subtotal = 0;
  for (const it of body.items) {
    const p = productMap.get(it.productId);
    if (!p) {
      return NextResponse.json(
        { error: "A product in your cart is unavailable." },
        { status: 400 }
      );
    }
    const qty = Math.max(1, Number(it.quantity) || 1);
    const unit = p.retail_price ?? 0;
    const total = unit * qty;
    subtotal += total;
    lineItems.push({
      product_id: p.id,
      description: p.name,
      quantity: qty,
      unit_price: unit,
      total_price: total,
    });
  }

  // Upsert customer (dedupe by division + phone).
  const existing = await dbQuery<{ id: string }>(
    "select id from public.customers where division_id = $1 and phone = $2 limit 1",
    [division, body.phone]
  );
  let customerId: string;
  if (existing.length > 0) {
    customerId = existing[0].id;
    await dbQuery(
      "update public.customers set name = $2, email = coalesce($3, email), address = coalesce($4, address), updated_at = now() where id = $1",
      [customerId, body.customer_name, body.email ?? null, body.address ?? null]
    );
  } else {
    const inserted = await dbQuery<{ id: string }>(
      "insert into public.customers (division_id, name, phone, email, address) values ($1, $2, $3, $4, $5) returning id",
      [division, body.customer_name, body.phone, body.email ?? null, body.address ?? null]
    );
    customerId = inserted[0].id;
  }

  const total = subtotal;

  const orderRows = await dbQuery<{ id: string; order_number: string }>(
    `insert into public.orders (
       division_id, customer_id, customer_name, phone, subtotal, tax_amount,
       delivery_charge, total_amount, confirmed_total, payment_method,
       payment_status, fulfilment_status, status, source, items
     ) values ($1,$2,$3,$4,$5,0,0,$6,$6,'cash','pending','unfulfilled','awaiting_confirmation','website',$7::jsonb)
     returning id, order_number`,
    [
      division,
      customerId,
      body.customer_name,
      body.phone,
      subtotal,
      total,
      JSON.stringify(lineItems),
    ]
  );
  const order = orderRows[0];

  for (const li of lineItems) {
    await dbQuery(
      `insert into public.order_items (order_id, division_id, product_id, description, quantity, unit_price, total_price)
       values ($1,$2,$3,$4,$5,$6,$7)`,
      [order.id, division, li.product_id, li.description, li.quantity, li.unit_price, li.total_price]
    );
  }

  await dbQuery(
    `insert into public.payments (order_id, division_id, customer_id, amount, method, status)
     values ($1,$2,$3,$4,'cash','pending')`,
    [order.id, division, customerId, total]
  );

  await dbQuery(
    `insert into public.shipments (order_id, division_id, status) values ($1,$2,'pending')`,
    [order.id, division]
  );

  await writeAudit({
    action: "create",
    entityType: "orders",
    entityId: order.id,
    divisionId: division,
    newValues: { order_number: order.order_number, total_amount: total, source: "website" },
  });

  return NextResponse.json({ ok: true, order_number: order.order_number });
}
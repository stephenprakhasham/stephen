import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/wholesale-otp";

export async function POST(req: Request) {
  try {
    const { phone, code } = await req.json();
    const digits = String(phone || "").replace(/\D/g, "");
    if (digits.length < 10) {
      return NextResponse.json({ ok: false, error: "Enter a valid phone number." }, { status: 400 });
    }
    const normalized = String(phone).trim().startsWith("+")
      ? String(phone).trim()
      : `+91${digits}`;
    const ok = verifyOtp(normalized, String(code || "").trim());
    if (!ok) {
      return NextResponse.json({ ok: false, error: "Invalid or expired OTP." }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
}
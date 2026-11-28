import { NextResponse } from "next/server";
import { createOtp } from "@/lib/wholesale-otp";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    const digits = String(phone || "").replace(/\D/g, "");
    if (digits.length < 10) {
      return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
    }
    const normalized = String(phone).trim().startsWith("+")
      ? String(phone).trim()
      : `+91${digits}`;
    const otp = createOtp(normalized);
    // DEV MODE: return the OTP so it can be shown on-screen (no SMS/WhatsApp cost).
    return NextResponse.json({ ok: true, devOtp: otp });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
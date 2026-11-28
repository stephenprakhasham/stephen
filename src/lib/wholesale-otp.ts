import fs from "fs";
import os from "os";
import path from "path";

type OtpEntry = { code: string; expires: number };
type Store = Record<string, OtpEntry>;

const FILE = path.join(os.tmpdir(), "yaga-wholesale-otp.json");
const TTL_MS = 5 * 60 * 1000;

function read(): Store {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8")) as Store;
  } catch {
    return {};
  }
}

function write(store: Store) {
  try {
    fs.writeFileSync(FILE, JSON.stringify(store));
  } catch {
    /* ignore */
  }
}

export function createOtp(phone: string): string {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const store = read();
  store[phone] = { code, expires: Date.now() + TTL_MS };
  write(store);
  return code;
}

export function verifyOtp(phone: string, code: string): boolean {
  const store = read();
  const entry = store[phone];
  if (!entry) return false;
  if (Date.now() > entry.expires) {
    delete store[phone];
    write(store);
    return false;
  }
  const ok = entry.code === code;
  if (ok) {
    delete store[phone];
    write(store);
  }
  return ok;
}
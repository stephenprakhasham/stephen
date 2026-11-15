"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";
  const configError = params.get("error") === "not_configured";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(
    configError
      ? "Supabase is not configured. Set the environment variables and restart."
      : ""
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) {
      setMsg("Supabase is not configured. Add your project URL and anon key.");
      return;
    }
    setBusy(true);
    setMsg("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setBusy(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    router.replace(next.startsWith("/admin") ? next : "/admin");
    router.refresh();
  }

  return (
    <main className="admin-auth">
      <div className="admin-auth-card">
        <Link href="/" className="admin-auth-brand">
          YAGA GROUP
        </Link>
        <p className="admin-auth-sub">Admin sign in</p>
        <form className="form" onSubmit={submit}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              placeholder="you@yagagroup.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          <button className="btn gold" disabled={busy} type="submit">
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
        {msg && <p className="admin-auth-error">{msg}</p>}
        <p className="admin-auth-foot">
          Authorized personnel only. Access is logged.
        </p>
      </div>
    </main>
  );
}
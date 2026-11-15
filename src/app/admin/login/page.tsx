import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function AdminLogin() {
  return (
    <Suspense fallback={<main className="admin-auth" />}>
      <LoginForm />
    </Suspense>
  );
}
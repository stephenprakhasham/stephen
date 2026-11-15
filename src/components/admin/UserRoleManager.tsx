"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminUserRow } from "@/lib/admin-data";

interface Role {
  id: string;
  division_id: string | null;
  key: string;
  name: string;
  description: string | null;
}
interface Division {
  id: string;
  name: string;
}

export function UserRoleManager({
  users,
  roles,
  divisions,
}: {
  users: AdminUserRow[];
  roles: Role[];
  divisions: Division[];
}) {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<string>(users[0]?.id ?? "");
  const [roleId, setRoleId] = useState<string>("");
  const [divisionId, setDivisionId] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const selectedRole = roles.find((r) => r.id === roleId);

  async function assign() {
    if (!selectedUser || !roleId) {
      setMsg("Select a user and a role.");
      return;
    }
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/admin/super/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: selectedUser,
        role_id: roleId,
        division_id: divisionId || null,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setMsg(body.error || "Assignment failed.");
      return;
    }
    setMsg("Role assigned.");
    router.refresh();
  }

  return (
    <div className="admin-grid-2">
      <section className="admin-section">
        <h2>Assign a role</h2>
        <div className="form">
          <label className="field">
            <span>User</span>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.email || u.id} {u.fullName ? `(${u.fullName})` : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Role</span>
            <select value={roleId} onChange={(e) => setRoleId(e.target.value)}>
              <option value="">Select role…</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                  {r.division_id ? ` · ${r.division_id}` : " · group"}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Division scope (optional)</span>
            <select
              value={divisionId}
              onChange={(e) => setDivisionId(e.target.value)}
            >
              <option value="">All / inherit from role</option>
              {divisions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>

          {selectedRole?.description && (
            <p className="admin-muted">{selectedRole.description}</p>
          )}

          <button
            className="btn gold"
            onClick={assign}
            disabled={busy || !selectedUser || !roleId}
          >
            {busy ? "Assigning…" : "Assign role"}
          </button>
          {msg && <p className="admin-muted">{msg}</p>}
        </div>
      </section>

      <section className="admin-section">
        <h2>Users</h2>
        <div className="admin-table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Last sign-in</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.email || "—"}</td>
                  <td>{u.fullName || "—"}</td>
                  <td>
                    <span className="admin-role-badge">{u.role}</span>
                  </td>
                  <td>
                    {u.lastSignIn
                      ? new Date(u.lastSignIn).toLocaleString("en-IN")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
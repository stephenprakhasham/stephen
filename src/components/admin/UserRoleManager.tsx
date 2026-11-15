"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminUserRow } from "@/lib/admin-data";

const PROFILE_ROLES = ["super_admin", "admin", "staff", "customer"] as const;

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

const EMPTY_NEW_USER = {
  email: "",
  password: "",
  fullName: "",
  role: "staff" as string,
  roleId: "",
  divisionId: "",
};

export function UserRoleManager({
  users,
  roles,
  divisions,
  serviceRoleConfigured,
  currentUserId,
}: {
  users: AdminUserRow[];
  roles: Role[];
  divisions: Division[];
  serviceRoleConfigured: boolean;
  currentUserId: string;
}) {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<string>(users[0]?.id ?? "");
  const [roleId, setRoleId] = useState<string>("");
  const [divisionId, setDivisionId] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const [newUser, setNewUser] = useState(EMPTY_NEW_USER);
  const [createBusy, setCreateBusy] = useState(false);
  const [createMsg, setCreateMsg] = useState("");

  const [deletingId, setDeletingId] = useState<string>("");
  const [deleteMsg, setDeleteMsg] = useState("");

  const [editingId, setEditingId] = useState<string>("");
  const [editForm, setEditForm] = useState({
    fullName: "",
    role: "staff",
    divisionId: "",
  });
  const [editBusy, setEditBusy] = useState(false);

  function setNewUserField(k: keyof typeof EMPTY_NEW_USER, v: string) {
    setNewUser((s) => ({ ...s, [k]: v }));
  }

  const selectedRole = roles.find((r) => r.id === roleId);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    if (!newUser.email.trim() || !newUser.password) {
      setCreateMsg("Email and password are required.");
      return;
    }
    setCreateBusy(true);
    setCreateMsg("");
    const res = await fetch("/api/admin/super/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: newUser.email,
        password: newUser.password,
        full_name: newUser.fullName || null,
        role: newUser.role,
        role_id: newUser.roleId || null,
        division_id: newUser.divisionId || null,
      }),
    });
    setCreateBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setCreateMsg(body.error || "Create failed.");
      return;
    }
    setNewUser(EMPTY_NEW_USER);
    setCreateMsg("User created.");
    router.refresh();
  }

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

  async function removeUser(user: AdminUserRow) {
    if (user.id === currentUserId) {
      setDeleteMsg("You cannot delete your own account.");
      return;
    }
    if (
      !confirm(
        `Delete user ${user.email || user.id}? This cannot be undone.`
      )
    ) {
      return;
    }
    setDeletingId(user.id);
    setDeleteMsg("");
    const res = await fetch(`/api/admin/super/users/${user.id}`, {
      method: "DELETE",
    });
    setDeletingId("");
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setDeleteMsg(body.error || "Delete failed.");
      return;
    }
    router.refresh();
  }

  function startEdit(user: AdminUserRow) {
    setEditingId(user.id);
    setDeleteMsg("");
    setEditForm({
      fullName: user.fullName ?? "",
      role: user.role,
      divisionId: user.divisionIds[0] ?? "",
    });
  }

  function cancelEdit() {
    setEditingId("");
  }

  async function saveEdit(user: AdminUserRow) {
    setEditBusy(true);
    setDeleteMsg("");
    const res = await fetch(`/api/admin/super/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: editForm.fullName || null,
        role: editForm.role,
        division_id: editForm.divisionId || null,
      }),
    });
    setEditBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setDeleteMsg(body.error || "Update failed.");
      return;
    }
    setEditingId("");
    router.refresh();
  }

  return (
    <>
      {!serviceRoleConfigured && (
        <p className="admin-muted">
          User creation is unavailable: add SUPABASE_SERVICE_ROLE_KEY or
          SUPABASE_DB_PASSWORD to .env.local and restart the server. Role
          assignment still works.
        </p>
      )}
      {deleteMsg && <p className="admin-muted">{deleteMsg}</p>}

      <section className="admin-section admin-form-card">
        <h2>Create user</h2>
        <form className="admin-form-grid" onSubmit={createUser}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUserField("email", e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Temporary password</span>
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUserField("password", e.target.value)}
              required
              minLength={8}
            />
          </label>
          <label className="field">
            <span>Full name (optional)</span>
            <input
              value={newUser.fullName}
              onChange={(e) => setNewUserField("fullName", e.target.value)}
            />
          </label>
          <label className="field">
            <span>Account role</span>
            <select
              value={newUser.role}
              onChange={(e) => setNewUserField("role", e.target.value)}
            >
              {PROFILE_ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Role assignment (optional)</span>
            <select
              value={newUser.roleId}
              onChange={(e) => setNewUserField("roleId", e.target.value)}
            >
              <option value="">— none —</option>
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
              value={newUser.divisionId}
              onChange={(e) => setNewUserField("divisionId", e.target.value)}
            >
              <option value="">All / inherit from role</option>
              {divisions.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </label>
        </form>
        <div className="admin-form-actions">
          <button
            className="btn gold"
            onClick={createUser}
            disabled={createBusy || !newUser.email || !newUser.password}
          >
            {createBusy ? "Creating…" : "Create user"}
          </button>
        </div>
        {createMsg && <p className="admin-muted">{createMsg}</p>}
      </section>

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
                <th>Division</th>
                <th>Last sign-in</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isEditing = editingId === u.id;
                return (
                  <tr key={u.id}>
                    <td>{u.email || "—"}</td>
                    <td>
                      {isEditing ? (
                        <input
                          value={editForm.fullName}
                          onChange={(e) =>
                            setEditForm((s) => ({
                              ...s,
                              fullName: e.target.value,
                            }))
                          }
                          style={{ width: "100%", padding: "6px 8px" }}
                        />
                      ) : (
                        u.fullName || "—"
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <select
                          value={editForm.role}
                          onChange={(e) =>
                            setEditForm((s) => ({ ...s, role: e.target.value }))
                          }
                          disabled={u.id === currentUserId}
                          title={
                            u.id === currentUserId
                              ? "You cannot change your own super_admin role"
                              : undefined
                          }
                        >
                          {PROFILE_ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="admin-role-badge">{u.role}</span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <select
                          value={editForm.divisionId}
                          onChange={(e) =>
                            setEditForm((s) => ({
                              ...s,
                              divisionId: e.target.value,
                            }))
                          }
                        >
                          <option value="">— none —</option>
                          {divisions.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      ) : u.divisionIds.length > 0 ? (
                        u.divisionIds.join(", ")
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      {u.lastSignIn
                        ? new Date(u.lastSignIn).toLocaleString("en-IN")
                        : "—"}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        {isEditing ? (
                          <>
                            <button
                              className="btn gold"
                              style={{ padding: "6px 12px", fontSize: 12 }}
                              onClick={() => saveEdit(u)}
                              disabled={editBusy}
                            >
                              {editBusy ? "Saving…" : "Save"}
                            </button>
                            <button
                              className="btn outline"
                              style={{ padding: "6px 12px", fontSize: 12 }}
                              onClick={cancelEdit}
                              disabled={editBusy}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="btn outline"
                              style={{ padding: "6px 12px", fontSize: 12 }}
                              onClick={() => startEdit(u)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn outline"
                              style={{
                                padding: "6px 12px",
                                fontSize: 12,
                                color: "#a11",
                                borderColor: "#e3b6b6",
                              }}
                              onClick={() => removeUser(u)}
                              disabled={
                                deletingId === u.id || u.id === currentUserId
                              }
                              title={
                                u.id === currentUserId
                                  ? "You cannot delete your own account"
                                  : "Delete user"
                              }
                            >
                              {deletingId === u.id ? "Deleting…" : "Delete"}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
    </>
  );
}
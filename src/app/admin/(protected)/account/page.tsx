"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, KeyRound, UserCog, Loader2, CheckCircle2, ShieldCheck,
  Trash2, Mail, Users, Pencil, X, Plus, ArrowLeft,
} from "lucide-react";

type AdminRec = { email: string; role: "super" | "admin"; createdAt: string };

export default function AdminAccountPage() {
  const router = useRouter();
  const [isSuper, setIsSuper] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  // Change password
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  // Manage admins (super only)
  const [admins, setAdmins] = useState<AdminRec[]>([]);
  const [manageError, setManageError] = useState("");
  const [manageSuccess, setManageSuccess] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [editing, setEditing] = useState<AdminRec | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [acting, setActing] = useState<string | null>(null);

  const loadSession = useCallback(async () => {
    const res = await fetch("/api/admin/session");
    if (res.status === 401) {
      router.replace("/admin");
      return;
    }
    const data = await res.json();
    setIsSuper(!!data.isSuper);
    setEmail(data.email || "");
  }, [router]);

  const loadAdmins = useCallback(async () => {
    const res = await fetch("/api/admin/manage");
    if (res.status === 401) {
      router.replace("/admin");
      return;
    }
    if (res.status === 403) return;
    const data = await res.json();
    if (res.ok) setAdmins(data.admins);
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/session");
        if (res.status === 401) {
          router.replace("/admin");
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setIsSuper(!!data.isSuper);
          setEmail(data.email || "");
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (isSuper) loadAdmins();
  }, [isSuper, loadAdmins]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");
    if (next !== confirmPw) {
      setPwError("New passwords do not match");
      return;
    }
    if (next.length < 8) {
      setPwError("New password must be at least 8 characters");
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch("/api/admin/password/change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");
      setPwSuccess("Password changed. Please login again with your new password.");
      setCurrent("");
      setNext("");
      setConfirmPw("");
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setPwLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setManageError("");
    setManageSuccess("");
    setAddLoading(true);
    try {
      const res = await fetch("/api/admin/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail, password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add admin");
      setManageSuccess(`Admin ${newEmail} added successfully.`);
      setNewEmail("");
      setNewPassword("");
      setShowAdd(false);
      loadAdmins();
    } catch (err) {
      setManageError(err instanceof Error ? err.message : "Failed to add admin");
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async (adminEmail: string) => {
    if (!confirm(`Delete admin ${adminEmail}?`)) return;
    setActing(adminEmail);
    setManageError("");
    setManageSuccess("");
    try {
      const res = await fetch(`/api/admin/manage?email=${encodeURIComponent(adminEmail)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete admin");
      setManageSuccess(`Admin ${adminEmail} deleted.`);
      loadAdmins();
    } catch (err) {
      setManageError(err instanceof Error ? err.message : "Failed to delete admin");
    } finally {
      setActing(null);
    }
  };

  const handleEdit = (admin: AdminRec) => {
    setEditing(admin);
    setEditEmail(admin.email);
    setEditPassword("");
    setManageError("");
    setManageSuccess("");
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setEditLoading(true);
    setManageError("");
    setManageSuccess("");
    try {
      const res = await fetch("/api/admin/manage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: editing.email,
          newEmail: editEmail,
          newPassword: editPassword || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update admin");
      setManageSuccess(`Admin ${editing.email} updated.`);
      setEditing(null);
      loadAdmins();
    } catch (err) {
      setManageError(err instanceof Error ? err.message : "Failed to update admin");
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
      <Link href="/admin/dashboard" className="inline-flex items-center gap-2 mb-5 text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition-all">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
      <div className="relative mb-8 overflow-hidden rounded-3xl glass-card border border-white/8 p-8">
        <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 bg-brand-blue/15 blur-[90px] rounded-full" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-blue-light shadow-glow-sm flex items-center justify-center">
                <UserCog className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white">Admin Account</h1>
            </div>
            <p className="text-white/45 text-sm">Manage your login credentials and admin accounts.</p>
          </div>
          {email && (
            <div className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl border bg-white/4 border-white/10 text-white/70 self-start sm:self-center">
              <ShieldCheck className="w-4 h-4 text-brand-blue-light" />
              <span className="hidden sm:inline">Signed in as</span>
              <span className="text-white truncate max-w-[180px]">{email}</span>
              {isSuper && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-500/10 text-amber-300 border-amber-500/25">
                  Super Admin
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24 text-white/40">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      )}

      {!loading && (
        <div className="space-y-6">
          {/* Change Password */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl border border-white/8 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue to-brand-blue-light shadow-glow-sm flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold">Change Password</h2>
                <p className="text-white/40 text-xs">Update the password for your account.</p>
              </div>
            </div>

            {pwError && <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">{pwError}</div>}
            {pwSuccess && <div className="text-green-400 text-xs bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 mb-4 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> {pwSuccess}</div>}

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div>
                <label className="text-white/45 text-xs font-medium mb-1.5 block">Current Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="password"
                    value={current}
                    onChange={(e) => setCurrent(e.target.value)}
                    required
                    placeholder="Current password"
                    className="input-field-with-icon"
                  />
                </div>
              </div>
              <div>
                <label className="text-white/45 text-xs font-medium mb-1.5 block">New Password *</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="password"
                    value={next}
                    onChange={(e) => setNext(e.target.value)}
                    required
                    minLength={8}
                    placeholder="At least 8 characters"
                    className="input-field-with-icon"
                  />
                </div>
              </div>
              <div>
                <label className="text-white/45 text-xs font-medium mb-1.5 block">Confirm New Password *</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Confirm new password"
                    className="input-field-with-icon"
                  />
                </div>
              </div>
              <button type="submit" disabled={pwLoading} className="btn-primary justify-center disabled:opacity-60">
                {pwLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><KeyRound className="w-4 h-4" /> Update Password</>}
              </button>
            </form>
          </motion.div>

          {/* Manage Admins - super only */}
          {isSuper && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl border border-white/8 p-6">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue to-brand-blue-light shadow-glow-sm flex items-center justify-center">
                    <UserCog className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold">Manage Admins</h2>
                    <p className="text-white/40 text-xs">Add, edit or remove admin accounts.</p>
                  </div>
                </div>
                {!showAdd && !editing && (
                  <button onClick={() => { setShowAdd(true); }} className="btn-secondary px-4 py-2.5 text-sm">
                    <Plus className="w-4 h-4" /> Add Admin
                  </button>
                )}
              </div>

              {manageError && <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">{manageError}</div>}
              {manageSuccess && <div className="text-green-400 text-xs bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 mb-4 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> {manageSuccess}</div>}

              {showAdd && (
                <div className="border border-white/8 rounded-xl p-4 mb-4 bg-white/3">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-white font-semibold text-sm">Add New Admin</p>
                    <button onClick={() => { setShowAdd(false); setManageError(""); }} className="text-white/40 hover:text-white p-1" aria-label="Close">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <form onSubmit={handleAdd} className="space-y-3">
                    <div>
                      <label className="text-white/45 text-xs font-medium mb-1.5 block">Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          required
                          placeholder="admin@example.com"
                          className="input-field-with-icon"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-white/45 text-xs font-medium mb-1.5 block">Password *</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          minLength={8}
                          placeholder="At least 8 characters"
                          className="input-field-with-icon"
                        />
                      </div>
                    </div>
                    <button type="submit" disabled={addLoading} className="btn-primary justify-center disabled:opacity-60">
                      {addLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</> : <><Plus className="w-4 h-4" /> Add Admin</>}
                    </button>
                  </form>
                </div>
              )}

              {admins.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-8 h-8 text-white/20 mx-auto mb-2" />
                  <p className="text-white/40 text-xs">No admin accounts yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {admins.map((admin) => (
                    <div key={admin.email} className="flex items-center gap-3 bg-white/3 border border-white/6 rounded-xl px-4 py-3">
                      <div className="w-9 h-9 rounded-full bg-brand-blue/15 border border-brand-blue/25 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 text-brand-blue-light" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-white/85 text-sm font-medium truncate flex items-center gap-2">
                          {admin.email}
                          {admin.role === "super" && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-500/10 text-amber-300 border-amber-500/25 flex items-center gap-1 shrink-0">
                              <ShieldCheck className="w-3 h-3" /> Super
                            </span>
                          )}
                        </p>
                        <p className="text-white/35 text-[11px]">Added {new Date(admin.createdAt).toLocaleDateString()}</p>
                      </div>
                      {admin.role !== "super" && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleEdit(admin)}
                            className="p-2 rounded-lg text-white/25 hover:text-brand-blue-light hover:bg-white/5 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(admin.email)}
                            disabled={acting === admin.email}
                            className="p-2 rounded-lg text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete"
                          >
                            {acting === admin.email ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Edit modal */}
              <AnimatePresence>
                {editing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setEditing(null)}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-[var(--bg-secondary)] border border-white/10 rounded-2xl w-full max-w-md p-6"
                    >
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-white font-bold">Edit Admin</h3>
                        <button onClick={() => setEditing(null)} className="text-white/40 hover:text-white text-xl leading-none p-1">×</button>
                      </div>
                      <form onSubmit={submitEdit} className="space-y-4">
                        <div>
                          <label className="text-white/45 text-xs font-medium mb-1.5 block">Email *</label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <input
                              type="email"
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              required
                              className="input-field-with-icon"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-white/45 text-xs font-medium mb-1.5 block">New Password <span className="text-white/25">(optional)</span></label>
                          <div className="relative">
                            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <input
                              type="password"
                              value={editPassword}
                              onChange={(e) => setEditPassword(e.target.value)}
                              minLength={8}
                              placeholder="Leave blank to keep current"
                              className="input-field-with-icon"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button type="submit" disabled={editLoading} className="btn-primary flex-1 justify-center disabled:opacity-60">
                            {editLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <>Save</>}
                          </button>
                          <button type="button" onClick={() => setEditing(null)} className="btn-secondary">Cancel</button>
                        </div>
                      </form>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

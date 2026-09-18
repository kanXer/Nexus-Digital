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

  // Manage admins (super only)
  const [admins, setAdmins] = useState<AdminRec[]>([]);
  const [manageError, setManageError] = useState("");
  const [manageSuccess, setManageSuccess] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [acting, setActing] = useState<string | null>(null);

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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setManageError("");
    setManageSuccess("");
    setAddLoading(true);
    try {
      const res = await fetch("/api/admin/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add admin");
      setManageSuccess(`Admin ${newEmail} added successfully.`);
      setNewEmail("");
      setShowAdd(false);
      loadAdmins();
    } catch (err) {
      setManageError(err instanceof Error ? err.message : "Failed to add admin");
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async (adminEmail: string) => {
    if (!confirm(`Revoke admin access for ${adminEmail}?`)) return;
    setActing(adminEmail);
    setManageError("");
    setManageSuccess("");
    try {
      const res = await fetch(`/api/admin/manage?email=${encodeURIComponent(adminEmail)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete admin");
      setManageSuccess(`Admin access for ${adminEmail} revoked.`);
      loadAdmins();
    } catch (err) {
      setManageError(err instanceof Error ? err.message : "Failed to delete admin");
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
      <Link href="/admin/dashboard" className="inline-flex items-center gap-2 mb-5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] px-3 py-2 rounded-lg transition-all">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] p-8 shadow-card">
        <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 bg-brand-blue/10 blur-[90px] rounded-full" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-blue-light shadow-glow-sm flex items-center justify-center">
                <UserCog className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-[var(--text-primary)]">Admin Account</h1>
            </div>
            <p className="text-[var(--text-muted)] text-sm">Manage your login credentials and admin accounts.</p>
          </div>
          {email && (
            <div className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl border bg-[var(--bg-secondary)] border-[var(--border-default)] text-[var(--text-secondary)] self-start sm:self-center">
              <ShieldCheck className="w-4 h-4 text-brand-blue-light shrink-0" />
              <span className="hidden sm:inline text-[var(--text-muted)]">Signed in as</span>
              <span className="text-[var(--text-primary)] truncate max-w-[180px]">{email}</span>
              {isSuper && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-red text-white border border-brand-red/80 shrink-0">
                  Super Admin
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24 text-[var(--text-muted)]">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      )}

      {!loading && (
        <div className="space-y-6">
          {/* Firebase Identity & Security Status */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] p-6 shadow-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue to-brand-blue-light shadow-glow-sm flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-[var(--text-primary)] font-bold">Authentication & Security</h2>
                <p className="text-[var(--text-muted)] text-xs">Managed via Firebase Google Identity Services.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] space-y-2">
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Passwords are no longer stored or managed in the agency database. Admin sign-in is authenticated directly with Google and validated against the authorized admin list.
              </p>
              <div className="text-xs text-[var(--text-muted)] flex items-center gap-2 pt-1">
                <span>Account Role:</span>
                {isSuper ? (
                  <span className="font-bold text-brand flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Primary Super Administrator (.env)</span>
                ) : (
                  <span className="font-semibold text-emerald-500">Authorized Administrator</span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Manage Authorized Admin Emails - Super Admin Only */}
          {isSuper ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] p-6 shadow-card">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue to-brand-blue-light shadow-glow-sm flex items-center justify-center">
                    <UserCog className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-[var(--text-primary)] font-bold">Authorized Admin Access</h2>
                    <p className="text-[var(--text-muted)] text-xs">Grant or revoke administrative access for Google accounts.</p>
                  </div>
                </div>
                {!showAdd && (
                  <button onClick={() => { setShowAdd(true); setManageError(""); setManageSuccess(""); }} className="btn-secondary px-4 py-2.5 text-sm">
                    <Plus className="w-4 h-4" /> Authorize Admin Email
                  </button>
                )}
              </div>

              {manageError && <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">{manageError}</div>}
              {manageSuccess && <div className="text-green-400 text-xs bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 mb-4 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> {manageSuccess}</div>}

              {showAdd && (
                <div className="border border-[var(--border-default)] rounded-xl p-4 mb-5 bg-[var(--bg-secondary)]">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[var(--text-primary)] font-semibold text-sm">Authorize New Admin Google Email</p>
                    <button onClick={() => { setShowAdd(false); setManageError(""); }} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 transition-colors" aria-label="Close">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mb-3">
                    Enter the Google email address of the person you want to grant admin access. They will be able to sign in via Google.
                  </p>
                  <form onSubmit={handleAdd} className="space-y-3">
                    <div>
                      <label className="text-[var(--text-muted)] text-xs font-medium mb-1.5 block">Google Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          required
                          placeholder="admin.colleague@gmail.com"
                          className="input-field-with-icon"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button type="submit" disabled={addLoading} className="btn-primary justify-center disabled:opacity-60">
                        {addLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Authorizing...</> : <><Plus className="w-4 h-4" /> Authorize Admin</>}
                      </button>
                      <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary text-xs">Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              {admins.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
                  <p className="text-[var(--text-muted)] text-xs">No admin accounts configured.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {admins.map((admin) => (
                    <div key={admin.email} className="flex items-center gap-3 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl px-4 py-3">
                      <div className="w-9 h-9 rounded-full bg-brand-blue/15 border border-brand-blue/25 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 text-brand-blue-light" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[var(--text-primary)] text-sm font-medium truncate flex items-center gap-2">
                          {admin.email}
                          {admin.role === "super" && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-red text-white border border-brand-red/80 flex items-center gap-1 shrink-0">
                              <ShieldCheck className="w-3 h-3" /> Super Admin
                            </span>
                          )}
                        </p>
                        <p className="text-[var(--text-muted)] text-[11px]">Authorized {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "via .env"}</p>
                      </div>
                      {admin.role !== "super" && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleDelete(admin.email)}
                            disabled={acting === admin.email}
                            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Revoke Admin Access"
                          >
                            {acting === admin.email ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] text-xs text-[var(--text-muted)]">
              Admin delegation and member management can only be performed by the Primary Super Administrator configured in <code className="text-brand">.env</code>.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

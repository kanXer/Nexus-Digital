import { randomBytes, createHmac, timingSafeEqual } from "crypto";
import { getDb } from "@/lib/db";

export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAIL || process.env.ADMIN_EMAILS || "";
  return raw
    .split(/[,;\s]+/)
    .map((e) => e.replace(/^["']|["']$/g, "").trim().toLowerCase())
    .filter(Boolean);
}

export const ADMIN_EMAIL = getAdminEmails()[0] || "";
export const SESSION_COOKIE = "admin_session";
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "change-this-secret-in-production";

function signToken(token: string): string {
  return `${token}.${createHmac("sha256", SESSION_SECRET).update(token).digest("hex")}`;
}

export function verifySignedToken(signed: string): string | null {
  const dot = signed.lastIndexOf(".");
  if (dot <= 0) return null;
  const token = signed.slice(0, dot);
  const sig = signed.slice(dot + 1);
  const expected = createHmac("sha256", SESSION_SECRET).update(token).digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  return timingSafeEqual(a, b) ? token : null;
}

export function isTopAdmin(email: string): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return getAdminEmails().includes(normalized);
}

export async function isAllowedAdminEmail(email: string): Promise<boolean> {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  // 1. Superadmin defined in .env
  if (isTopAdmin(normalized)) {
    return true;
  }
  // 2. Additional admins added by the superadmin in DB
  try {
    const db = await getDb();
    const admin = await db.collection("admins").findOne({ email: normalized });
    return !!admin;
  } catch (err) {
    console.error("isAllowedAdminEmail DB lookup failed:", err);
    return false;
  }
}

export async function createAdminSession(email: string): Promise<string> {
  const normalized = email.toLowerCase().trim();
  const allowed = await isAllowedAdminEmail(normalized);
  if (!allowed) {
    throw new Error("Unauthorized: Email is not an authorized admin");
  }

  const token = randomBytes(32).toString("hex");
  const db = await getDb();
  await db.collection("sessions").insertOne({
    token,
    email: normalized,
    role: isTopAdmin(normalized) ? "super" : "admin",
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + SESSION_TTL_SECONDS * 1000),
  });
  return signToken(token);
}

export async function logoutSession(signedToken: string) {
  const token = verifySignedToken(signedToken);
  if (!token) return;
  const db = await getDb();
  await db.collection("sessions").deleteOne({ token });
}

export async function getSessionEmail(signedToken: string): Promise<string | null> {
  if (!signedToken) return null;
  const token = verifySignedToken(signedToken);
  if (!token) return null;
  try {
    const db = await getDb();
    const session = await db.collection("sessions").findOne({ token });
    if (!session || (session.expiresAt && session.expiresAt.getTime() < Date.now())) {
      return null;
    }
    const email = (session.email as string).toLowerCase().trim();
    const allowed = await isAllowedAdminEmail(email);
    if (!allowed) {
      await db.collection("sessions").deleteOne({ token });
      return null;
    }
    return email;
  } catch {
    return null;
  }
}

export interface AdminRecord {
  email: string;
  role: "super" | "admin";
  addedBy?: string;
  createdAt: string;
}

export async function getAllAdmins(): Promise<AdminRecord[]> {
  const db = await getDb();
  const admins = await db
    .collection("admins")
    .find({})
    .sort({ createdAt: 1 })
    .toArray();
  return admins
    .filter((a) => !isTopAdmin(a.email))
    .map((a) => ({
      email: a.email,
      role: a.role === "super" ? "super" : "admin",
      addedBy: a.addedBy || "superadmin",
      createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : new Date().toISOString(),
    }));
}

export async function addAdmin(email: string, addedByEmail: string) {
  const normalized = email.toLowerCase().trim();
  if (isTopAdmin(normalized)) {
    throw new Error("This account is configured as super admin in .env and already has full access");
  }
  const db = await getDb();
  const existing = await db.collection("admins").findOne({ email: normalized });
  if (existing) {
    throw new Error("An admin with this email already exists");
  }
  await db.collection("admins").insertOne({
    email: normalized,
    role: "admin",
    addedBy: addedByEmail.toLowerCase().trim(),
    createdAt: new Date(),
  });
}

export async function deleteAdmin(email: string) {
  const normalized = email.toLowerCase().trim();
  if (isTopAdmin(normalized)) {
    throw new Error("You cannot delete a super admin account configured in .env");
  }
  const db = await getDb();
  await db.collection("admins").deleteOne({ email: normalized });
  await db.collection("sessions").deleteMany({ email: normalized });
}

// Backward-compatibility stubs for Firebase-based admin authentication
export async function registerAdmin(..._args: any[]) {
  throw new Error("Public admin registration is disabled. Admin access is granted only via .env or by the super admin.");
}

export async function changeOwnPassword(..._args: any[]) {
  throw new Error("Password management is deprecated. Authentication is managed via Firebase Google Identity.");
}


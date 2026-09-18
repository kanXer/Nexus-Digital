import { randomBytes, createHmac, timingSafeEqual } from "crypto";
import { getDb } from "@/lib/db";

// Dynamic check taaki runtime par latest .env value mile
export function getAdminEmail(): string {
  const raw = process.env.ADMIN_EMAIL || "";
  return raw.replace(/^["']|["']$/g, "").toLowerCase().trim();
}

// Backward compatibility ke liye (agar kisi file me import { ADMIN_EMAIL } ho)
export const ADMIN_EMAIL: string = getAdminEmail();

function getSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || "change-this-secret-in-production";
}

export const SESSION_COOKIE = "admin_session";
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

function signToken(token: string): string {
  return `${token}.${createHmac("sha256", getSessionSecret()).update(token).digest("hex")}`;
}

export function verifySignedToken(signed: string): string | null {
  const dot = signed.lastIndexOf(".");
  if (dot <= 0) return null;
  const token = signed.slice(0, dot);
  const sig = signed.slice(dot + 1);
  const expected = createHmac("sha256", getSessionSecret()).update(token).digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  return timingSafeEqual(a, b) ? token : null;
}

export function isTopAdmin(email: string): boolean {
  const adminEmail = getAdminEmail();
  if (!adminEmail || !email) return false;
  return email.toLowerCase().trim() === adminEmail;
}

export async function isAllowedAdminEmail(email: string): Promise<boolean> {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  const adminEmail = getAdminEmail();

  // 1. Superadmin defined in .env
  if (adminEmail !== "" && normalized === adminEmail) {
    return true;
  }

  // 2. Additional admins added by the superadmin in DB
  try {
    const db = await getDb();
    const admin = await db.collection("admins").findOne({ email: normalized });
    return !!admin;
  } catch {
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

export async function logoutSession(signedToken: string): Promise<void> {
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
  const adminEmail = getAdminEmail();
  const db = await getDb();
  const admins = await db
    .collection("admins")
    .find({})
    .sort({ createdAt: 1 })
    .toArray();
  return admins
    .filter((a) => a.email.toLowerCase().trim() !== adminEmail)
    .map((a) => ({
      email: a.email,
      role: a.role === "super" ? "super" : "admin",
      addedBy: a.addedBy || "superadmin",
      createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : new Date().toISOString(),
    }));
}

export async function addAdmin(email: string, addedByEmail: string): Promise<void> {
  const normalized = email.toLowerCase().trim();
  const adminEmail = getAdminEmail();
  if (normalized === adminEmail) {
    throw new Error("This is the super admin account and already has full access");
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

export async function deleteAdmin(email: string): Promise<void> {
  const normalized = email.toLowerCase().trim();
  const adminEmail = getAdminEmail();
  if (normalized === adminEmail) {
    throw new Error("You cannot delete the super admin account configured in .env");
  }
  const db = await getDb();
  await db.collection("admins").deleteOne({ email: normalized });
  await db.collection("sessions").deleteMany({ email: normalized });
}

// Backward-compatibility stubs for Firebase-based admin authentication
export async function registerAdmin(..._args: unknown[]): Promise<never> {
  throw new Error("Public admin registration is disabled. Admin access is granted only via .env or by the super admin.");
}

export async function changeOwnPassword(..._args: unknown[]): Promise<never> {
  throw new Error("Password management is deprecated. Authentication is managed via Firebase Google Identity.");
}

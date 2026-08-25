import { randomBytes, createHmac, scryptSync, timingSafeEqual } from "crypto";
import { getDb } from "@/lib/db";

export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").toLowerCase();
export const SESSION_COOKIE = "admin_session";
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "change-this-secret-in-production";
const MIN_PASSWORD_LENGTH = 8;

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

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

export function isAllowedAdminEmail(email: string): boolean {
  return ADMIN_EMAIL !== "" && email.toLowerCase() === ADMIN_EMAIL;
}

export function isTopAdmin(email: string): boolean {
  return isAllowedAdminEmail(email);
}

export async function registerAdmin(email: string, password: string) {
  const db = await getDb();
  const normalized = email.toLowerCase();
  if (!isAllowedAdminEmail(normalized)) {
    throw new Error("Only the admin email saved in env can create an account");
  }
  const existingCount = await db.collection("admins").countDocuments();
  if (existingCount > 0) {
    throw new Error("Admin account already exists. Public registration is disabled.");
  }
  const existing = await db.collection("admins").findOne({ email: normalized });
  if (existing) throw new Error("Account already exists. Please login.");
  await db.collection("admins").insertOne({
    email: normalized,
    passwordHash: hashPassword(password),
    role: isTopAdmin(normalized) ? "super" : "admin",
    createdAt: new Date(),
  });
}

export async function loginAdmin(email: string, password: string) {
  const db = await getDb();
  const normalized = email.toLowerCase();
  if (ADMIN_EMAIL === "") {
    throw new Error("Admin email not configured");
  }
  const admin = await db.collection("admins").findOne({ email: normalized });
  if (!admin || !verifyPassword(password, admin.passwordHash)) {
    throw new Error("Invalid email or password");
  }
  const token = randomBytes(32).toString("hex");
  await db.collection("sessions").insertOne({
    token,
    email: normalized,
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
    return session.email as string;
  } catch {
    return null;
  }
}

export interface AdminRecord {
  email: string;
  role: "super" | "admin";
  createdAt: string;
}

async function requireAdminEntry(email: string) {
  const db = await getDb();
  const normalized = email.toLowerCase();
  const admin = await db.collection("admins").findOne({ email: normalized });
  return { db, admin };
}

export async function changeOwnPassword(email: string, currentPassword: string, newPassword: string) {
  const { db, admin } = await requireAdminEntry(email);
  if (!admin) throw new Error("Admin not found");
  if (!verifyPassword(currentPassword, admin.passwordHash)) {
    throw new Error("Current password is incorrect");
  }
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
  await db.collection("admins").updateOne(
    { email: email.toLowerCase() },
    { $set: { passwordHash: hashPassword(newPassword) } }
  );
  await db.collection("sessions").deleteMany({ email: email.toLowerCase() });
}

export async function getAllAdmins(): Promise<AdminRecord[]> {
  const db = await getDb();
  const admins = await db
    .collection("admins")
    .find({})
    .sort({ createdAt: 1 })
    .toArray();
  return admins
    .filter((a) => a.email !== ADMIN_EMAIL)
    .map((a) => ({
      email: a.email,
      role: a.role === "super" ? "super" : "admin",
      createdAt: (a.createdAt as Date).toISOString(),
    }));
}

export async function addAdmin(email: string, password: string) {
  const db = await getDb();
  const normalized = email.toLowerCase();
  if (normalized === ADMIN_EMAIL) {
    throw new Error("This is the super admin account and already exists");
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
  const existing = await db.collection("admins").findOne({ email: normalized });
  if (existing) throw new Error("An admin with this email already exists");
  await db.collection("admins").insertOne({
    email: normalized,
    passwordHash: hashPassword(password),
    role: "admin",
    createdAt: new Date(),
  });
}

export async function deleteAdmin(email: string) {
  const db = await getDb();
  const normalized = email.toLowerCase();
  if (normalized === ADMIN_EMAIL) {
    throw new Error("You cannot delete the super admin account");
  }
  await db.collection("admins").deleteOne({ email: normalized });
  await db.collection("sessions").deleteMany({ email: normalized });
}

export async function updateAdmin(
  email: string,
  updates: { email?: string; password?: string }
) {
  const db = await getDb();
  const target = email.toLowerCase();
  if (target === ADMIN_EMAIL) {
    throw new Error("You cannot edit the super admin account");
  }
  const admin = await db.collection("admins").findOne({ email: target });
  if (!admin) throw new Error("Admin not found");

  const set: Record<string, unknown> = {};
  if (updates.email) {
    const newEmail = updates.email.toLowerCase();
    if (newEmail === ADMIN_EMAIL) {
      throw new Error("That email is the super admin account");
    }
    const clash = await db.collection("admins").findOne({ email: newEmail });
    if (clash && clash.email !== target) {
      throw new Error("An admin with that email already exists");
    }
    set.email = newEmail;
  }
  if (updates.password) {
    if (updates.password.length < MIN_PASSWORD_LENGTH) {
      throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    }
    set.passwordHash = hashPassword(updates.password);
  }
  if (Object.keys(set).length === 0) {
    throw new Error("No changes provided");
  }
  await db.collection("admins").updateOne({ email: target }, { $set: set });
  if (updates.email && updates.email.toLowerCase() !== target) {
    await db.collection("sessions").deleteMany({ email: target });
  }
}

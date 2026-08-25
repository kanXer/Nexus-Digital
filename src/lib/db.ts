import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "nexusdigital";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb(): Promise<Db> {
  if (db) return db;
  if (!uri) throw new Error("MONGODB_URI not set");
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  await ensureIndexes(db);
  return db;
}

async function ensureIndexes(db: Db) {
  try {
    // Auto-expire admin sessions after their expiry so stale rows don't accumulate
    await db.collection("sessions").createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0 }
    );

    // Idempotency for payment-gateway transactions.
    await db
      .collection("payments")
      .createIndex(
        { merchantTransactionId: 1 },
        { unique: true, sparse: true, background: true }
      )
      .catch(() => {});
  } catch (err) {
    console.error("Failed to ensure indexes:", err);
  }
}

export async function saveSubmission(type: "contact" | "booking" | "enquiry" | "subscribe" | "leadmagnet", data: Record<string, unknown>) {
  try {
    const db = await getDb();
    const status = type === "contact" ? "pending" : type === "booking" ? "pending" : type === "enquiry" ? "pending" : undefined;
    await db.collection("submissions").insertOne({ type, data, status, createdAt: new Date(), updatedAt: null });
  } catch (err) {
    console.error("Mongo save error:", err);
  }
}

import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "nexusdigital";

// ---------------------------------------------------------------------------
// Global cache — survives Next.js hot-reload and multiple serverless
// invocations in the same Node.js process.
// ---------------------------------------------------------------------------
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  // eslint-disable-next-line no-var
  var _mongoDbPromise: Promise<Db> | undefined;
}

function getClientPromise(): Promise<MongoClient> {
  if (!uri) throw new Error("MONGODB_URI is not set");
  if (!globalThis._mongoClientPromise) {
    const client = new MongoClient(uri);
    globalThis._mongoClientPromise = client.connect();
  }
  return globalThis._mongoClientPromise;
}

export function getDb(): Promise<Db> {
  if (!globalThis._mongoDbPromise) {
    // Chain off the client promise so indexes are only set up once per process
    globalThis._mongoDbPromise = getClientPromise().then(async (client) => {
      const db = client.db(dbName);
      await ensureIndexes(db);
      return db;
    });
  }
  return globalThis._mongoDbPromise;
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

export async function saveOrder(data: {
  name: string;
  email: string;
  amount: number;
  planName: string;
  orderId: string;
  status: string;
  date: string;
  time: string;
}) {
  try {
    const db = await getDb();
    await db.collection("orders").insertOne({
      ...data,
      createdAt: new Date(),
    });
  } catch (err) {
    console.error("Mongo save order error:", err);
  }
}

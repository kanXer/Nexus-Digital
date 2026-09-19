/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionEmail, SESSION_COOKIE } from "@/lib/admin";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export type AudienceMember = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  source: string;
  sourceLabel: string;
  sources: string[];
  createdAt: string;
  lastActive: string;
};

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const adminEmail = await getSessionEmail(token || "");
  if (!adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 503 });
    }

    // 1. Fetch all form submissions (contact, newsletter, bookings, inquiries, lead magnets)
    const rawSubmissions = await db
      .collection("submissions")
      .find({})
      .sort({ createdAt: -1 })
      .limit(3000)
      .toArray();

    // 2. Fetch all Cashfree orders
    const rawOrders = await db
      .collection("orders")
      .find({})
      .sort({ createdAt: -1 })
      .limit(1000)
      .toArray();

    // 3. Fetch all logged-in members from users collection
    const rawUsers = await db
      .collection("users")
      .find({})
      .sort({ createdAt: -1 })
      .limit(1000)
      .toArray();

    const audienceMap = new Map<string, AudienceMember>();

    const getCleanEmail = (em: any) => {
      if (!em || typeof em !== "string") return "";
      const trimmed = em.trim().toLowerCase();
      return trimmed.includes("@") && trimmed.includes(".") ? trimmed : "";
    };

    // Process Form Submissions
    for (const sub of rawSubmissions) {
      const data = (sub.data as Record<string, any>) || {};
      const email = getCleanEmail(data.email || sub.email);
      if (!email) continue;

      const subType = sub.type || "inquiry";
      let sourceLabel = "Website Form";
      let sourceKey = "form";

      if (subType === "subscribe") {
        sourceLabel = "Newsletter Subscriber";
        sourceKey = "newsletter";
      } else if (subType === "contact") {
        sourceLabel = "Contact Us Form";
        sourceKey = "contact";
      } else if (subType === "booking") {
        sourceLabel = "Strategy Booking";
        sourceKey = "booking";
      } else if (subType === "leadmagnet") {
        sourceLabel = "Lead Magnet Download";
        sourceKey = "leadmagnet";
      } else if (subType === "enquiry") {
        sourceLabel = "Service Enquiry";
        sourceKey = "enquiry";
      }

      const name = String(data.name || data.fullName || email.split("@")[0]);
      const phone = String(data.phone || data.mobile || "");
      const dateStr = sub.createdAt ? new Date(sub.createdAt).toISOString() : new Date().toISOString();

      if (!audienceMap.has(email)) {
        audienceMap.set(email, {
          id: sub._id.toString(),
          email,
          name,
          phone,
          source: sourceKey,
          sourceLabel,
          sources: [sourceLabel],
          createdAt: dateStr,
          lastActive: dateStr,
        });
      } else {
        const existing = audienceMap.get(email)!;
        if (!existing.sources.includes(sourceLabel)) {
          existing.sources.push(sourceLabel);
        }
        if ((!existing.name || existing.name === email.split("@")[0]) && name) {
          existing.name = name;
        }
        if (!existing.phone && phone) {
          existing.phone = phone;
        }
        if (new Date(dateStr) > new Date(existing.lastActive)) {
          existing.lastActive = dateStr;
        }
      }
    }

    // Process Cashfree Orders
    for (const order of rawOrders) {
      const email = getCleanEmail(order.email || order.customerEmail);
      if (!email) continue;

      const sourceLabel = "Cashfree Buyer";
      const sourceKey = "cashfree";
      const name = String(order.name || order.customerName || email.split("@")[0]);
      const phone = String(order.phone || order.customerPhone || "");
      const dateStr = order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString();

      if (!audienceMap.has(email)) {
        audienceMap.set(email, {
          id: order._id.toString(),
          email,
          name,
          phone,
          source: sourceKey,
          sourceLabel,
          sources: [sourceLabel],
          createdAt: dateStr,
          lastActive: dateStr,
        });
      } else {
        const existing = audienceMap.get(email)!;
        if (!existing.sources.includes(sourceLabel)) {
          existing.sources.unshift(sourceLabel); // Prioritize customer badge
        }
        existing.source = sourceKey; // Prioritize buyer status
        existing.sourceLabel = sourceLabel;
        if ((!existing.name || existing.name === email.split("@")[0]) && name) {
          existing.name = name;
        }
        if (!existing.phone && phone) {
          existing.phone = phone;
        }
        if (new Date(dateStr) > new Date(existing.lastActive)) {
          existing.lastActive = dateStr;
        }
      }
    }

    // Process Logged-in Users
    for (const user of rawUsers) {
      const email = getCleanEmail(user.email);
      if (!email) continue;

      const sourceLabel = "Logged-in Account";
      const sourceKey = "user";
      const name = String(user.name || email.split("@")[0]);
      const phone = String(user.phone || "");
      const dateStr = user.lastLoginAt || user.createdAt ? new Date(user.lastLoginAt || user.createdAt).toISOString() : new Date().toISOString();

      if (!audienceMap.has(email)) {
        audienceMap.set(email, {
          id: user._id.toString(),
          email,
          name,
          phone,
          source: sourceKey,
          sourceLabel,
          sources: [sourceLabel],
          createdAt: dateStr,
          lastActive: dateStr,
        });
      } else {
        const existing = audienceMap.get(email)!;
        if (!existing.sources.includes(sourceLabel)) {
          existing.sources.push(sourceLabel);
        }
        if ((!existing.name || existing.name === email.split("@")[0]) && name) {
          existing.name = name;
        }
        if (!existing.phone && phone) {
          existing.phone = phone;
        }
        if (new Date(dateStr) > new Date(existing.lastActive)) {
          existing.lastActive = dateStr;
        }
      }
    }

    const subscribers = Array.from(audienceMap.values()).sort(
      (a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
    );

    // Source breakdown counts
    const counts = {
      total: subscribers.length,
      cashfree: subscribers.filter((s) => s.sources.some((src) => src.includes("Cashfree"))).length,
      contact: subscribers.filter((s) => s.sources.some((src) => src.includes("Contact"))).length,
      newsletter: subscribers.filter((s) => s.sources.some((src) => src.includes("Newsletter"))).length,
      bookings: subscribers.filter((s) => s.sources.some((src) => src.includes("Booking"))).length,
      leadmagnet: subscribers.filter((s) => s.sources.some((src) => src.includes("Lead Magnet"))).length,
      users: subscribers.filter((s) => s.sources.some((src) => src.includes("Account"))).length,
    };

    return NextResponse.json({
      subscribers,
      count: subscribers.length,
      counts,
    });
  } catch (err: any) {
    console.error("Subscribers fetch error:", err);
    return NextResponse.json({ error: "Failed to load subscribers" }, { status: 500 });
  }
}

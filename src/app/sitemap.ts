import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";
import { config } from "@/lib/config";

/**
 * Auto-discovers every route under src/app by scanning for page.tsx files,
 * so newly added pages are always included in the sitemap without manual edits.
 *
 * Excluded on purpose (private / login-required / system):
 *  - /admin            (dashboard + login)
 *  - /cart             (login required)
 *  - /checkout         (login required)
 *  - /payment-success  (transactional, login required)
 */
const EXCLUDED_ROUTES = new Set(["/cart", "/checkout", "/payment-success"]);

function isExcluded(route: string): boolean {
  if (EXCLUDED_ROUTES.has(route)) return true;
  // Everything under /admin is private (login + dashboard)
  return route.startsWith("/admin");
}

const PRIORITY_MAP: Record<string, { priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }> = {
  "/": { priority: 1, changeFrequency: "weekly" },
  "/services": { priority: 0.9, changeFrequency: "monthly" },
  "/pricing": { priority: 0.9, changeFrequency: "monthly" },
  "/contact": { priority: 0.9, changeFrequency: "monthly" },
  "/portfolio": { priority: 0.8, changeFrequency: "monthly" },
  "/case-studies": { priority: 0.8, changeFrequency: "monthly" },
  "/enquiry": { priority: 0.8, changeFrequency: "monthly" },
  "/testimonials": { priority: 0.7, changeFrequency: "monthly" },
  "/about": { priority: 0.7, changeFrequency: "monthly" },
  "/faq": { priority: 0.7, changeFrequency: "monthly" },
  "/privacy-policy": { priority: 0.3, changeFrequency: "yearly" },
  "/terms": { priority: 0.3, changeFrequency: "yearly" },
};

const DEFAULT_META = { priority: 0.6, changeFrequency: "monthly" as const };

function collectRoutes(dir: string, prefix = ""): string[] {
  let hasPage = false;
  const childRoutes: string[] = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const name = entry.name;

    if (!entry.isDirectory()) {
      // A folder becomes a routable page when it contains page.tsx
      if (name === "page.tsx" || name === "page.jsx" || name === "page.mdx") {
        hasPage = true;
      }
      continue;
    }

    // Skip private folders, parallel routes and dev-only folders
    if (name.startsWith("_") || name.startsWith("@") || name === "api") continue;

    // Route groups like (marketing)/(protected) do NOT add a URL segment
    const segment = /^\(.*\)$/.test(name) ? "" : `/${name}`;
    childRoutes.push(...collectRoutes(path.join(dir, name), prefix + segment));
  }

  const routes = childRoutes;
  if (hasPage) routes.push(prefix === "" ? "/" : prefix);
  return routes;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const appDir = path.join(process.cwd(), "src", "app");

  const routes = collectRoutes(appDir)
    .filter((route) => !isExcluded(route))
    .sort((a, b) => (a === "/" ? -1 : b === "/" ? 1 : a.localeCompare(b)));

  const lastModified = new Date();

  return routes.map((route) => {
    const meta = PRIORITY_MAP[route] ?? DEFAULT_META;
    return {
      url: route === "/" ? config.website : `${config.website}${route}`,
      lastModified,
      changeFrequency: meta.changeFrequency,
      priority: meta.priority,
    };
  });
}

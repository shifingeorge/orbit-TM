import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import dns from "node:dns";
import * as schema from "./schema";

// WSL2: undici prefers IPv6, which can't reach Neon; force IPv4 first.
// No-op outside Node (e.g. edge runtime never imports this with dns available).
dns.setDefaultResultOrder?.("ipv4first");

// The HTTP driver routes c-2 cell hosts through api.<cell>.neon.tech by
// default; some networks block those IPs. Query the endpoint host directly.
const url = new URL(process.env.DATABASE_URL!);
url.hostname = url.hostname.replace("-pooler.", ".");
neonConfig.fetchEndpoint = (host) => `https://${host}/sql`;

const sql = neon(url.toString());
export const db = drizzle(sql, { schema });

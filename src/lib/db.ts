//

import { drizzle, type VercelPgDatabase } from "drizzle-orm/vercel-postgres";
import { createPool } from "@vercel/postgres";
import { POSTGRES_URL } from "astro:env/server";

let db: VercelPgDatabase | undefined;
export function getDb(): VercelPgDatabase {
  if (!db) {
    db = drizzle(createPool({ connectionString: POSTGRES_URL }));
  }

  return db;
}

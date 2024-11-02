//

import type { APIRoute } from "astro";
import { getSession } from "../../../lib/session";
import { getDb } from "../../../lib/db";
import { feedsTable, subscriptions } from "../../../lib/schema";
import { and, count, eq } from "drizzle-orm";

export const GET: APIRoute = async ({ cookies, params, redirect }) => {
  const session = await getSession(cookies);
  if (!session) {
    return new Response("Not authorised", { status: 401 });
  }

  const id = params.id;
  if (!id) {
    return redirect("/");
  }

  const db = getDb();
  await db
    .delete(subscriptions)
    .where(
      and(
        eq(subscriptions.feed_id, id),
        eq(subscriptions.username, session.username)
      )
    );

  const resSubs = await db
    .select({ count: count() })
    .from(subscriptions)
    .where(eq(subscriptions.feed_id, id));
  if (resSubs[0]?.count === 0) {
    await db.delete(feedsTable).where(eq(feedsTable.id, id));
  }

  return redirect("/");
};

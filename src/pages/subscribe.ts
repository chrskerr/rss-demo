//

import type { APIRoute } from "astro";
import { getSession } from "../lib/session";
import { getDb } from "../lib/db";
import { feedsTable, subscriptions } from "../lib/schema";
import { inArray } from "drizzle-orm";

export const POST: APIRoute = async ({ cookies, request, redirect }) => {
  const session = await getSession(cookies);
  if (!session) {
    return new Response("Not authorised", { status: 401 });
  }

  const formdata = await request.formData();

  const feedsToSubscribe: string[] = [];
  for (const key of formdata.keys()) {
    if (isUrl(key)) {
      feedsToSubscribe.push(key);
    }
  }

  const db = getDb();

  const feeds = await db
    .select()
    .from(feedsTable)
    .where(inArray(feedsTable.url, feedsToSubscribe));

  await getDb()
    .insert(subscriptions)
    .values(
      feeds.map(({ id }) => ({ feed_id: id, username: session.username }))
    );

  return redirect("/");
};

function isUrl(key: string): boolean {
  try {
    new URL(key);
    return true;
  } catch {
    return false;
  }
}

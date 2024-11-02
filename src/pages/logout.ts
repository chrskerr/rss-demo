//

import type { APIRoute } from "astro";
import { deleteSessionCookie } from "../lib/session";

export const GET: APIRoute = ({ cookies, redirect }) => {
  deleteSessionCookie(cookies);
  return redirect("/");
};

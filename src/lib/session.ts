//

import { DEV } from "astro:env/client";
import type { AstroCookies } from "astro";

type Session = { username: string };

const ttl = 604_800;
const cookieName = "user_session";

export async function setSessionCookie(
  cookies: AstroCookies,
  session: Session
) {
  cookies.set(cookieName, JSON.stringify(session), {
    httpOnly: true,
    secure: !DEV,
    maxAge: ttl - 60,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSessionCookie(cookies: AstroCookies) {
  cookies.delete(cookieName);
}

export async function getSession(
  cookies: AstroCookies
): Promise<Session | undefined> {
  const existingCookie = cookies.get(cookieName);
  if (!existingCookie) {
    return undefined;
  }

  const unsealed = JSON.parse(existingCookie.value) as Session | undefined;
  if (!unsealed?.username) {
    return undefined;
  }

  // update TTL
  await setSessionCookie(cookies, unsealed);

  return unsealed;
}

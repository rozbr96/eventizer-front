import { type IncomingHttpHeaders } from "http";

const apiEndpoint = process.env.NEXT_SERVER_API_HOST || "http://localhost:3000";

type AuthHeaders = Headers | IncomingHttpHeaders;

const readCookie = (headers: AuthHeaders) => {
  if (headers instanceof Headers) return headers.get("cookie") || "";

  const cookie = headers.cookie;

  return Array.isArray(cookie) ? cookie.join("; ") : cookie || "";
}

export const authenticated = async (headers: AuthHeaders) => {
  const authResponse = await fetch(`${apiEndpoint}/auth/state`, {
    method: "GET",
    headers: {
      cookie: readCookie(headers),
    },
  }).catch(() => null);

  return Boolean(authResponse?.ok);
}

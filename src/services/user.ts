import { http } from "@/lib/http";
import { User } from "@/types/user";

const userCache = new Map<string, User>();
const userRequestCache = new Map<string, Promise<User>>();

export function getCachedUserById(id: string | null | undefined) {
  const normalizedId = id?.trim() ?? "";

  if (!normalizedId) {
    return null;
  }

  return userCache.get(normalizedId) ?? null;
}

export async function fetchUserById(id: string): Promise<User> {
  const normalizedId = id.trim();

  if (!normalizedId) {
    throw new Error("Missing user id");
  }

  const cachedUser = userCache.get(normalizedId);
  if (cachedUser) {
    return cachedUser;
  }

  const pendingRequest = userRequestCache.get(normalizedId);
  if (pendingRequest) {
    return pendingRequest;
  }

  const request = (async () => {
    const r = await http(`/api/users/${normalizedId}`, { method: "GET" });
    if (!r.ok) {
      const data = await r.json().catch(() => ({}));
      throw new Error(data?.message || "Failed to load users");
    }

    const data = await r.json();
    const user = data.user as User;
    userCache.set(normalizedId, user);
    return user;
  })();

  userRequestCache.set(normalizedId, request);

  try {
    return await request;
  } finally {
    userRequestCache.delete(normalizedId);
  }
}

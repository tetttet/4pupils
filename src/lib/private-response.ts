export function applyPrivateNoStore<T extends Response>(response: T): T {
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

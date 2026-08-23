type ClientFetchOptions = RequestInit & {
  retryOn401?: boolean;
  dedupe?: boolean;
  cacheTtlMs?: number;
  timeoutMs?: number;
};

type CachedResponse = {
  response: Response;
  expiresAt: number;
};

const DEFAULT_GET_CACHE_TTL_MS = 30_000;
const DEFAULT_TIMEOUT_MS = 20_000;
const MAX_CACHE_ENTRIES = 100;

const responseCache = new Map<string, CachedResponse>();
const pendingRequests = new Map<string, Promise<Response>>();

let cacheVersion = 0;
let refreshRequest: Promise<boolean> | null = null;

function getMethod(options: RequestInit) {
  return (options.method ?? "GET").toUpperCase();
}

function getRequestKey(url: string, options: RequestInit) {
  const headers = [...new Headers(options.headers).entries()].sort(([left], [right]) =>
    left.localeCompare(right),
  );

  return JSON.stringify([
    getMethod(options),
    url,
    options.credentials ?? "same-origin",
    headers,
  ]);
}

function getRequestSignal(signal: AbortSignal | null | undefined, timeoutMs: number) {
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  return signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;
}

function trimResponseCache() {
  while (responseCache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = responseCache.keys().next().value as string | undefined;
    if (!oldestKey) return;
    responseCache.delete(oldestKey);
  }
}

function readCachedResponse(key: string) {
  const cached = responseCache.get(key);
  if (!cached) return null;

  if (cached.expiresAt <= Date.now()) {
    responseCache.delete(key);
    return null;
  }

  return cached.response.clone();
}

export function invalidateClientFetchCache() {
  cacheVersion += 1;
  responseCache.clear();
}

async function fetchFromNetwork(
  url: string,
  options: RequestInit,
  timeoutMs: number,
) {
  return fetch(url, {
    ...options,
    signal: getRequestSignal(options.signal, timeoutMs),
  });
}

async function fetchCoordinated(
  url: string,
  options: RequestInit,
  policy: {
    dedupe: boolean;
    cacheTtlMs: number;
    timeoutMs: number;
  },
) {
  const method = getMethod(options);
  const isGet = method === "GET";

  if (!isGet) {
    invalidateClientFetchCache();
    return fetchFromNetwork(url, options, policy.timeoutMs);
  }

  const key = getRequestKey(url, options);
  const canUseCache = policy.cacheTtlMs > 0 && options.cache !== "no-store";

  if (canUseCache) {
    const cachedResponse = readCachedResponse(key);
    if (cachedResponse) return cachedResponse;
  }

  if (policy.dedupe) {
    const pendingRequest = pendingRequests.get(key);
    if (pendingRequest) {
      return (await pendingRequest).clone();
    }
  }

  const requestVersion = cacheVersion;
  const request = fetchFromNetwork(url, options, policy.timeoutMs);

  if (policy.dedupe) {
    pendingRequests.set(key, request);
  }

  try {
    const response = await request;

    if (
      canUseCache &&
      response.ok &&
      requestVersion === cacheVersion
    ) {
      responseCache.set(key, {
        response: response.clone(),
        expiresAt: Date.now() + policy.cacheTtlMs,
      });
      trimResponseCache();
    }

    return response.clone();
  } finally {
    if (pendingRequests.get(key) === request) {
      pendingRequests.delete(key);
    }
  }
}

async function refreshSession(timeoutMs: number) {
  if (refreshRequest) return refreshRequest;

  refreshRequest = (async () => {
    try {
      const response = await fetchFromNetwork(
        "/api/auth/refresh",
        {
          method: "POST",
          credentials: "include",
        },
        timeoutMs,
      );

      if (response.ok) {
        invalidateClientFetchCache();
      }

      return response.ok;
    } catch {
      return false;
    } finally {
      refreshRequest = null;
    }
  })();

  return refreshRequest;
}

export async function clientFetch(
  url: string,
  options: ClientFetchOptions = {},
) {
  const {
    retryOn401 = true,
    dedupe = getMethod(options) === "GET",
    cacheTtlMs = getMethod(options) === "GET"
      ? DEFAULT_GET_CACHE_TTL_MS
      : 0,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    ...requestOptions
  } = options;

  const response = await fetchCoordinated(url, requestOptions, {
    dedupe,
    cacheTtlMs,
    timeoutMs,
  });

  if (response.status !== 401 || !retryOn401) {
    return response;
  }

  const refreshed = await refreshSession(timeoutMs);
  if (!refreshed) return response;

  return fetchCoordinated(url, requestOptions, {
    dedupe,
    cacheTtlMs,
    timeoutMs,
  });
}

export type { ClientFetchOptions };

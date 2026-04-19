export type ApiOk<T> = { ok: true; data: T; meta?: unknown };

export type ApiErr = {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

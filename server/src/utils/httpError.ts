/**
 * An error that maps directly to an HTTP response.
 * Services throw these; middleware/errorHandler.ts turns them into JSON.
 */
export class HttpError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.details = details;
  }
}

export function badRequest(message: string, details?: unknown): HttpError {
  return new HttpError(400, message, details);
}

export function notFound(message: string, details?: unknown): HttpError {
  return new HttpError(404, message, details);
}

export function conflict(message: string, details?: unknown): HttpError {
  return new HttpError(409, message, details);
}

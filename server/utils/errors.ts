export class AppError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function badRequest(message: string, details?: unknown) {
  return new AppError(400, "VALIDATION_ERROR", message, details);
}

export function unauthorized(message = "Authentication required.") {
  return new AppError(401, "UNAUTHORIZED", message);
}

export function forbidden(message = "You do not have access to this resource.") {
  return new AppError(403, "FORBIDDEN", message);
}

export function notFound(message = "Resource not found.") {
  return new AppError(404, "NOT_FOUND", message);
}

export function conflict(message: string) {
  return new AppError(409, "CONFLICT", message);
}

export function aiUnavailable(message = "AI is temporarily unavailable. Configure GEMINI_API_KEY and try again.") {
  return new AppError(503, "AI_UNAVAILABLE", message);
}

export function asyncHandler(fn: (req: any, res: any, next: any) => Promise<any>) {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

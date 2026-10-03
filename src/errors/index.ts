/**
 * Error types for the PWHL API wrapper.
 *
 * Endpoint functions never throw: they return an `APIResult` whose error
 * is one of these classes.
 */

export const ErrorCategory = {
   /** Network-level errors (connection refused, timeout, proxy refusal) */
   NETWORK: 'NETWORK',
   /** HTTP 4xx client errors */
   CLIENT: 'CLIENT',
   /** HTTP 5xx server errors */
   SERVER: 'SERVER',
   /** Rate limiting (HTTP 429) */
   RATE_LIMIT: 'RATE_LIMIT',
   /** HTTP 200 with an error in the body (bad key, unknown view, ...) */
   API_ERROR: 'API_ERROR',
   /** Response body could not be parsed */
   PARSE: 'PARSE',
   /** Invalid user input */
   VALIDATION: 'VALIDATION',
} as const;

export type ErrorCategory =
   (typeof ErrorCategory)[keyof typeof ErrorCategory];

export interface ErrorContext {
   /** HTTP status code if applicable */
   statusCode?: number;
   /** Original error object */
   cause?: unknown;
   /** Request URL */
   endpoint?: string;
   /** Response body if available */
   responseBody?: unknown;
   /** Timestamp of error */
   timestamp?: Date;
}

/** Base error class for all PWHL API errors */
export class PWHLError extends Error {
   public readonly category: ErrorCategory;
   public readonly context: ErrorContext;

   constructor(
      message: string,
      category: ErrorCategory,
      context: ErrorContext = {},
   ) {
      super(message);
      this.name = this.constructor.name;
      this.category = category;
      this.context = {
         ...context,
         timestamp: context.timestamp ?? new Date(),
      };
      Error.captureStackTrace?.(this, this.constructor);
   }

   toJSON() {
      return {
         name: this.name,
         message: this.message,
         category: this.category,
         context: this.context,
         ...(this.stack && { stack: this.stack }),
      };
   }
}

/** Network-level errors (timeouts, connection failures) */
export class NetworkError extends PWHLError {
   constructor(message: string, context: ErrorContext = {}) {
      super(message, ErrorCategory.NETWORK, context);
   }
}

/** HTTP 4xx client errors */
export class ClientError extends PWHLError {
   constructor(message: string, context: ErrorContext = {}) {
      super(message, ErrorCategory.CLIENT, context);
   }
}

/**
 * Resource not found: HTTP 404, or a 200 body such as
 * `{"Player": {"error": "no such person/player found"}}`
 */
export class NotFoundError extends ClientError {
   constructor(message: string, context: ErrorContext = {}) {
      super(message, { ...context, statusCode: context.statusCode ?? 404 });
   }
}

/** HTTP 5xx server errors */
export class ServerError extends PWHLError {
   constructor(message: string, context: ErrorContext = {}) {
      super(message, ErrorCategory.SERVER, context);
   }
}

/** HTTP 429 rate limit errors */
export class RateLimitError extends PWHLError {
   public readonly retryAfter: number;

   constructor(
      message = 'Rate limit exceeded',
      context: ErrorContext = {},
      retryAfter = 0,
   ) {
      super(message, ErrorCategory.RATE_LIMIT, {
         ...context,
         statusCode: context.statusCode ?? 429,
      });
      this.retryAfter = retryAfter;
   }
}

/** The feed answered 200 but the body reports an error */
export class APIError extends PWHLError {
   constructor(message: string, context: ErrorContext = {}) {
      super(message, ErrorCategory.API_ERROR, context);
   }
}

/** Response parsing failures, including JSONP unwrapping */
export class ParseError extends PWHLError {
   constructor(message: string, context: ErrorContext = {}) {
      super(message, ErrorCategory.PARSE, context);
   }
}

/** Invalid user input */
export class ValidationError extends PWHLError {
   constructor(message: string, context: ErrorContext = {}) {
      super(message, ErrorCategory.VALIDATION, context);
   }
}

/** Map a non-OK HTTP response to an error */
export function errorFromStatus(
   response: Response,
   context: ErrorContext = {},
): PWHLError {
   const status = response.status;
   const message = `HTTP ${status}${response.statusText ? `: ${response.statusText}` : ''}`;
   const ctx = { ...context, statusCode: status };
   if (status === 429) {
      const retryAfter = response.headers?.get('Retry-After');
      return new RateLimitError(
         message,
         ctx,
         retryAfter ? Number.parseInt(retryAfter, 10) || 0 : 0,
      );
   }
   if (status === 404) return new NotFoundError(message, ctx);
   if (status >= 500) return new ServerError(message, ctx);
   return new ClientError(message, ctx);
}

/** Wrap an unknown thrown value as a PWHLError */
export function errorFromThrown(
   error: unknown,
   context: ErrorContext = {},
): PWHLError {
   if (error instanceof PWHLError) return error;
   if (error instanceof Error && error.name === 'AbortError') {
      return new NetworkError('Request timeout', {
         ...context,
         cause: error,
      });
   }
   const message =
      error instanceof Error ? error.message : 'An unknown error occurred';
   return new NetworkError(message, { ...context, cause: error });
}

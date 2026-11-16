import axios from 'axios';

export type ApiErrorKind =
  'configuration' | 'http' | 'network' | 'cancelled' | 'unknown';

export class ApiError extends Error {
  override readonly name = 'ApiError';

  constructor(
    message: string,
    readonly kind: ApiErrorKind,
    readonly status: number | undefined = undefined,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (axios.isCancel(error)) {
    return new ApiError('The request was cancelled.', 'cancelled', undefined, {
      cause: error,
    });
  }
  if (axios.isAxiosError(error)) {
    return new ApiError(
      error.response
        ? `Request failed (${error.response.status}).`
        : 'Unable to reach the server.',
      error.response ? 'http' : 'network',
      error.response?.status,
      { cause: error },
    );
  }
  return new ApiError(
    'An unexpected request error occurred.',
    'unknown',
    undefined,
    { cause: error },
  );
}

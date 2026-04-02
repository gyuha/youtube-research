export type ProviderErrorCode =
  | 'missing_configuration'
  | 'not_found'
  | 'provider_failure';

export interface ProviderError extends Error {
  cause?: unknown;
  code: ProviderErrorCode;
  operation: string;
  provider: string;
}

interface CreateProviderErrorInput {
  cause?: unknown;
  code: ProviderErrorCode;
  message: string;
  operation: string;
  provider: string;
}

function createProviderError(input: CreateProviderErrorInput): ProviderError {
  const error = new Error(input.message, {
    cause: input.cause,
  }) as ProviderError;

  error.code = input.code;
  error.operation = input.operation;
  error.provider = input.provider;

  return error;
}

export function createMissingConfigurationError(
  provider: string,
  operation: string,
  message: string,
) {
  return createProviderError({
    code: 'missing_configuration',
    message,
    operation,
    provider,
  });
}

export function createNotFoundError(
  provider: string,
  operation: string,
  message: string,
) {
  return createProviderError({
    code: 'not_found',
    message,
    operation,
    provider,
  });
}

export function createProviderFailureError(
  provider: string,
  operation: string,
  cause: unknown,
  message: string,
) {
  return createProviderError({
    cause,
    code: 'provider_failure',
    message,
    operation,
    provider,
  });
}

export function isProviderError(error: unknown): error is ProviderError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'provider' in error &&
    'operation' in error
  );
}

import type { FieldError } from './types';

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_TOKEN: 'Tu sesión es inválida. Intentá iniciar sesión de nuevo.',
  TOKEN_EXPIRED: 'Tu sesión expiró. Iniciá sesión de nuevo.',
  UNAUTHORIZED: 'No tenés permisos para realizar esta acción.',
  FORBIDDEN: 'Acceso denegado.',
  NOT_FOUND: 'El recurso solicitado no existe.',
  USER_NOT_FOUND: 'Usuario no encontrado.',
  VALIDATION_ERROR: 'Los datos enviados no son válidos.',
  INTERNAL_SERVER_ERROR: 'Error del servidor. Intentá de nuevo más tarde.',
  NETWORK_ERROR: 'Error de conexión. Verificá tu conexión e intentá de nuevo.',
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields?: FieldError[];

  constructor(status: number, code: string, message: string, fields?: FieldError[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fields = fields;
  }

  get userMessage(): string {
    return ERROR_MESSAGES[this.code] ?? this.message;
  }
}

export function parseApiError(status: number, body: string): ApiError {
  try {
    const parsed = JSON.parse(body);
    const code = parsed?.error?.code ?? 'UNKNOWN';
    const message = parsed?.error?.message ?? 'Error desconocido';
    return new ApiError(status, code, message);
  } catch {
    return new ApiError(status, 'UNKNOWN', body || 'Error desconocido');
  }
}

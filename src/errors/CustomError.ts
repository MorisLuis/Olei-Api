class AppError extends Error {
    public statusCode: number;
    public debugMessage?: string;
    public code?: string;

    constructor(message: string, statusCode = 500, debugMessage?: string, code?: string) {
        console.log({message, statusCode, debugMessage, code });
        super(message);
        this.statusCode = statusCode;
        this.debugMessage = debugMessage;
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
}

// 🔥 Errores específicos con categorías
class NotFoundError extends AppError {
    constructor(message = 'Recurso no encontrado', debugMessage?: string) {
        super(message, 404, debugMessage);
    }
}

class ValidationError extends AppError {
    constructor(message = 'Datos inválidos', debugMessage?: string) {
        super(message, 400, debugMessage);
    }
}

class UnauthorizedError extends AppError {
    constructor(message = 'No autorizado', debugMessage?: string, code?: string) {
        super(message, 401, debugMessage, code);
    }
}

class ForbiddenError extends AppError {
    constructor(message = 'Acceso prohibido', debugMessage?: string) {
        super(message, 403, debugMessage);
    }
}

export {
    AppError,
    NotFoundError,
    ValidationError,
    UnauthorizedError,
    ForbiddenError
};

class AppError extends Error {
    public statusCode: number;

    constructor(message: string, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

// 🔥 Errores específicos con categorías
class NotFoundError extends AppError {
    constructor(message = 'Recurso no encontrado') {
        super(message, 404);
    }
}

class ValidationError extends AppError {
    constructor(message = 'Datos inválidos') {
        super(message, 400);
    }
}

class UnauthorizedError extends AppError {
    constructor(message = 'No autorizado') {
        super(message, 401);
    }
}

class ForbiddenError extends AppError {
    constructor(message = 'Acceso prohibido') {
        super(message, 403);
    }
}

export { AppError, NotFoundError, ValidationError, UnauthorizedError, ForbiddenError };




// BORRAR
export type CustomErrorContent = {
    message: string,
    context?: { [key: string]: any }
};

export abstract class CustomError extends Error {

    abstract readonly statusCode: number;
    abstract readonly errors: CustomErrorContent[];
    abstract readonly logging: boolean;

    constructor(message: string) {
        super(message);
        // Solo porque estamos extendiendo una clase built-in
        Object.setPrototypeOf(this, CustomError.prototype);
    }

    // Método opcional para estandarizar la salida de errores
    serializeErrors(): CustomErrorContent[] {
        return this.errors;
    }
};

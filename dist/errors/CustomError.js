"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomError = exports.ForbiddenError = exports.UnauthorizedError = exports.ValidationError = exports.NotFoundError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
// 🔥 Errores específicos con categorías
class NotFoundError extends AppError {
    constructor(message = 'Recurso no encontrado') {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
class ValidationError extends AppError {
    constructor(message = 'Datos inválidos') {
        super(message, 400);
    }
}
exports.ValidationError = ValidationError;
class UnauthorizedError extends AppError {
    constructor(message = 'No autorizado') {
        super(message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Acceso prohibido') {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
class CustomError extends Error {
    constructor(message) {
        super(message);
        // Solo porque estamos extendiendo una clase built-in
        Object.setPrototypeOf(this, CustomError.prototype);
    }
    // Método opcional para estandarizar la salida de errores
    serializeErrors() {
        return this.errors;
    }
}
exports.CustomError = CustomError;
;
//# sourceMappingURL=CustomError.js.map
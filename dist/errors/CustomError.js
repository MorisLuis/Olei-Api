"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenError = exports.UnauthorizedError = exports.ValidationError = exports.NotFoundError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode = 500, debugMessage) {
        super(message);
        this.statusCode = statusCode;
        this.debugMessage = debugMessage;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
// 🔥 Errores específicos con categorías
class NotFoundError extends AppError {
    constructor(message = 'Recurso no encontrado', debugMessage) {
        super(message, 404, debugMessage);
    }
}
exports.NotFoundError = NotFoundError;
class ValidationError extends AppError {
    constructor(message = 'Datos inválidos', debugMessage) {
        super(message, 400, debugMessage);
    }
}
exports.ValidationError = ValidationError;
class UnauthorizedError extends AppError {
    constructor(message = 'No autorizado', debugMessage) {
        super(message, 401, debugMessage);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Acceso prohibido', debugMessage) {
        super(message, 403, debugMessage);
    }
}
exports.ForbiddenError = ForbiddenError;
//# sourceMappingURL=CustomError.js.map
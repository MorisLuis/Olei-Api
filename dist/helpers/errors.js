"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseError = exports.MailError = exports.MissingParametersError = exports.CreationError = exports.NotFoundError = exports.AuthError = exports.CustomError = void 0;
// Clase base para todos los errores personalizados
class CustomError extends Error {
    constructor(message, statusCode, errorType, resource, database_code, sql, uuid) {
        super(message);
        this.statusCode = statusCode;
        this.errorType = errorType;
        this.resource = resource;
        this.database_code = database_code;
        this.sql = sql;
        this.uuid = uuid;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.CustomError = CustomError;
// Error para fallos de autenticación
class AuthError extends CustomError {
    constructor(message = "Authentication failed", statusCode = 401) {
        super(message, statusCode, "AUTHENTICATION_ERROR");
    }
}
exports.AuthError = AuthError;
// Error cuando un recurso no se encuentra
class NotFoundError extends CustomError {
    constructor(message = "Resource", path = "") {
        super(message, 404, "NOT_FOUND_ERROR", path);
    }
}
exports.NotFoundError = NotFoundError;
// Error cuando falla la creación de un recurso
class CreationError extends CustomError {
    constructor(message = "Failed to create", resource = "Resource") {
        super(message, 400, "CREATION_ERROR", `Failed to create "${resource}"`);
    }
}
exports.CreationError = CreationError;
class MissingParametersError extends CustomError {
    constructor(message = "Missing parameters", resource = "Resource") {
        super(message, 400, "MISSING_PARAMETERS", `Missing parameters for "${resource}"`);
    }
}
exports.MissingParametersError = MissingParametersError;
class MailError extends CustomError {
    constructor(message = "Mail error", resource = "Mail") {
        super(message, 400, "MAIL_ERROR", `Mail error for "${resource}"`);
    }
}
exports.MailError = MailError;
class DatabaseError extends CustomError {
    constructor(error) {
        const message = error.parent?.message || error.message || 'Unknown database error';
        const code = error.parent?.code;
        const sql = error.parent?.sql;
        super(message, 500, "DATABASE_ERROR", undefined, code, sql);
    }
}
exports.DatabaseError = DatabaseError;
//# sourceMappingURL=errors.js.map
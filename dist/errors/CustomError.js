"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomError = void 0;
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
//# sourceMappingURL=CustomError.js.map
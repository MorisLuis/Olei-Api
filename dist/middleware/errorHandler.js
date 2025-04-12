"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errors_1 = require("../controllers/errors");
const errorHandler = async (err, req, res, _next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    //const Id_Usuario = (await getUserIdFromRequest(req)) ?? "Sin Usuario";
    console.error(`[ERROR] ${req.method} ${req.path} - ${message}`);
    // Omitir errores de "Token expirado o inválido: TokenExpiredError: jwt expired" por que es el error de refresh token
    // Omitir errores de 'login'.
    if (!message.includes("Token expirado o inválido: TokenExpiredError: jwt expired") &&
        req.path !== '/api/auth/login' &&
        req.path !== '/api/auth/loginServer' &&
        req.path !== '/api/auth/loginWeb') {
        try {
            await (0, errors_1.handleErrorsEndpoint)({
                From: req.path, // Endpoint donde ocurrió el error
                Message: message, // Mensaje de error
                Id_Usuario: "", // ID del usuario
                Metodo: req.method, // Método HTTP
                code: statusCode.toString() // Código de error convertido a string
            });
        }
        catch (loggingError) {
            console.error('Error guardando log en la DB:', loggingError);
        }
    }
    res.status(statusCode).json({ error: message });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map
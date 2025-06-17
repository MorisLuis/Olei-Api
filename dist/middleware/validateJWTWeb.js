"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateJWTWeb = void 0;
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const CustomError_1 = require("../errors/CustomError");
const redisClient_1 = __importDefault(require("../config/redisClient"));
const validateJWTWeb = async (req, _res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    if (!token) {
        return next(new CustomError_1.UnauthorizedError('TOKEN_EXPIRADO', 'Session is invalid or expired'));
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, 'access_secret');
        const sessionId = decoded.sessionId;
        req.sessionId = sessionId;
        const sessionDataRaw = await redisClient_1.default.get(`session:${sessionId}`);
        const sessionData = sessionDataRaw ?? null;
        if (!sessionData)
            return next(new CustomError_1.UnauthorizedError('SESSION_EXPIRADA', 'Session is invalid or expired'));
        try {
            const session = JSON.parse(sessionData);
            req.sessionWeb = session;
            return next();
        }
        catch (error) {
            return next(new CustomError_1.AppError(`Error parsing session data: ${error}`));
        }
    }
    catch (error) {
        switch (true) {
            case error instanceof jsonwebtoken_1.TokenExpiredError:
                return next(new CustomError_1.UnauthorizedError('El token ha expirado, por favor, inicia sesión nuevamente', `JWT verification failed: ${error instanceof Error ? error.message : String(error)}`));
            case error instanceof jsonwebtoken_1.JsonWebTokenError:
                return next(new CustomError_1.UnauthorizedError('Token inválido, por favor verifica tus credenciales', `JWT verification failed: ${error instanceof Error ? error.message : String(error)}`));
            case error instanceof Error:
                return next(new CustomError_1.UnauthorizedError(`Fallo al autenticar el token: ${error.message}`, `JWT verification failed: ${error instanceof Error ? error.message : String(error)}`));
            default:
                return next(new CustomError_1.UnauthorizedError('Fallo desconocido al autenticar el token', `JWT verification failed: ${error instanceof Error ? error.message : String(error)}`));
        }
    }
};
exports.validateJWTWeb = validateJWTWeb;
//# sourceMappingURL=validateJWTWeb.js.map
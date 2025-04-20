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
exports.validateJWTWeb = exports.validateRefreshToken = exports.validateJWTokenServer = exports.validateJWT = void 0;
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const CustomError_1 = require("../errors/CustomError");
const redisClient_1 = __importDefault(require("../config/redisClient"));
const validateJWT = async (req, _res, next) => {
    const authHeaderServer = req.headers['x-server-token'];
    const tokenServer = authHeaderServer?.split(' ')[1]; // Token 1
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1]; // Token 2
    // 1️⃣ Validar que venga el token 1 (server token)
    if (!tokenServer) {
        return next(new CustomError_1.UnauthorizedError('SESSION_EXPIRADA', 'Session is invalid or expired'));
    }
    ;
    if (!process.env.ACCESS_TOKEN_SEVER_SECRET) {
        return next(new CustomError_1.AppError('Config error: falta ACCESS_TOKEN_SEVER_SECRET'));
    }
    ;
    let sessionId;
    try {
        const decoded = jsonwebtoken_1.default.verify(tokenServer, process.env.ACCESS_TOKEN_SEVER_SECRET);
        sessionId = decoded.sessionId;
        if (!sessionId)
            return next(new CustomError_1.UnauthorizedError('SESSION_EXPIRADA', 'Session is invalid or expired'));
        const sessionDataRaw = await redisClient_1.default.get(`session:${sessionId}`);
        if (!sessionDataRaw)
            return next(new CustomError_1.UnauthorizedError('SESSION_EXPIRADA', 'Session is invalid or expired'));
        const session = JSON.parse(sessionDataRaw);
        if (!session.serverConected) {
            return next(new CustomError_1.ForbiddenError('Server connection required'));
        }
        req.sessionId = sessionId;
        req.session = session;
    }
    catch (error) {
        return next(new CustomError_1.UnauthorizedError('TOKEN_EXPIRADO', `JWT verification failed: ${error instanceof Error ? error.message : String(error)}`));
    }
    // 2️⃣ Validar token 2 si viene.
    if (token) {
        try {
            if (!process.env.ACCESS_TOKEN_SECRET)
                return next(new CustomError_1.AppError('Config error: falta ACCESS_TOKEN_SECRET'));
            jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
            // No hacemos nada con esto por ahora, solo validamos que sea válido.
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                return next(new CustomError_1.UnauthorizedError('TOKEN_2_EXPIRADO', `JWT verification failed: ${error instanceof Error ? error.message : String(error)}`));
            }
            ;
            return next(new CustomError_1.UnauthorizedError('TOKEN_2_INVALIDO', `JWT verification failed: ${error instanceof Error ? error.message : String(error)}`));
        }
    }
    ;
    // ✅ Todo fine, pasar al siguiente middleware
    return next();
};
exports.validateJWT = validateJWT;
const validateJWTokenServer = async (req, _res, next) => {
    const authHeaderServer = req.headers['x-server-token'];
    const tokenServer = authHeaderServer?.split(' ')[1]; // Token 1
    // 1️⃣ Validar que venga el token 1 (server token)
    if (!tokenServer) {
        return next(new CustomError_1.UnauthorizedError('SESSION_EXPIRADA', 'Session is invalid or expired'));
    }
    ;
    if (!process.env.ACCESS_TOKEN_SEVER_SECRET) {
        return next(new CustomError_1.AppError('Config error: falta ACCESS_TOKEN_SEVER_SECRET'));
    }
    ;
    let sessionId;
    try {
        const decoded = jsonwebtoken_1.default.verify(tokenServer, process.env.ACCESS_TOKEN_SEVER_SECRET);
        sessionId = decoded.sessionId;
        if (!sessionId)
            return next(new CustomError_1.UnauthorizedError('SESSION_EXPIRADA', 'Session is invalid or expired'));
        const sessionDataRaw = await redisClient_1.default.get(`session:${sessionId}`);
        if (!sessionDataRaw)
            return next(new CustomError_1.UnauthorizedError('SESSION_EXPIRADA', 'Session is invalid or expired'));
        const session = JSON.parse(sessionDataRaw);
        if (!session.serverConected) {
            return next(new CustomError_1.ForbiddenError('Server connection required'));
        }
        req.sessionId = sessionId;
        req.session = session;
    }
    catch (error) {
        return next(new CustomError_1.UnauthorizedError('TOKEN_EXPIRADO', `JWT verification failed: ${error instanceof Error ? error.message : String(error)}`));
    }
    // ✅ Todo fine, pasar al siguiente middleware
    return next();
};
exports.validateJWTokenServer = validateJWTokenServer;
const validateRefreshToken = async (req, _res, next) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        return next(new CustomError_1.UnauthorizedError('REFRESH_TOKEN_EXPIRADO', 'Session is invalid or expired'));
    }
    ;
    if (!process.env.REFRESH_TOKEN_SECRET) {
        return next(new CustomError_1.AppError('Falta la clave secreta del refresh token'));
    }
    ;
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const sessionId = decoded.sessionId;
        if (!sessionId)
            return next(new CustomError_1.UnauthorizedError('SESSION_EXPIRADA', 'Session is invalid or expired'));
        const sessionDataRaw = await redisClient_1.default.get(`session:${sessionId}`);
        if (!sessionDataRaw)
            return next(new CustomError_1.UnauthorizedError('SESSION_EXPIRADA', 'Session is invalid or expired'));
        const session = JSON.parse(sessionDataRaw);
        if (!session.serverConected || !session.userConected) {
            return next(new CustomError_1.UnauthorizedError('REFRESH_TOKEN_EXPIRADO', 'Session is invalid or expired'));
        }
        ;
        req.sessionId = sessionId;
        req.session = session;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return next(new CustomError_1.UnauthorizedError('REFRESH_TOKEN_EXPIRADO', `JWT verification failed: ${error instanceof Error ? error.message : String(error)}`));
        }
        return next(new CustomError_1.AppError('Error al validar el refresh token'));
    }
};
exports.validateRefreshToken = validateRefreshToken;
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
//# sourceMappingURL=validateJWT.js.map
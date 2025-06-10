"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRefreshToken = exports.validateJWTokenServer = exports.validateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
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
    ;
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
//# sourceMappingURL=validateJWT.js.map
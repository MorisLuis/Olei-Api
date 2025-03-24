"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRefreshJWT = exports.validateJWTWeb = exports.validateJWT = exports.validateJWTLogin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const CustomError_1 = require("../errors/CustomError");
const redisClient_1 = __importDefault(require("../config/redisClient"));
const validateJWTLogin = async (req, _res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    if (!token) {
        next(new CustomError_1.UnauthorizedError('Acceso denegado. Falta token o es invalido'));
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const sessionId = decoded.sessionId;
        if (!sessionId) {
            next(new CustomError_1.UnauthorizedError('Acceso denegado. Falta token o es invalido'));
            return;
        }
        req.sessionId = sessionId;
        const sessionDataRaw = await redisClient_1.default.get(`session:${sessionId}`);
        const sessionData = sessionDataRaw ?? null;
        if (!sessionData) {
            next(new CustomError_1.UnauthorizedError('Sesión no válida'));
            return;
        }
        try {
            const session = JSON.parse(sessionData);
            // Verificar si las conexiones requeridas están activas
            if (!session.serverConected) {
                next(new CustomError_1.ForbiddenError('Server connection required'));
                return;
            }
            req.session = session;
            return next();
        }
        catch (error) {
            next(new CustomError_1.AppError(`Error parsing session data: ${error}`));
            return;
        }
    }
    catch (error) {
        next(new CustomError_1.ForbiddenError(`Token expirado o inválido: ${error}`));
    }
};
exports.validateJWTLogin = validateJWTLogin;
const validateJWT = async (req, _res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    if (!token) {
        return next(new CustomError_1.UnauthorizedError('Acceso denegado. Falta token o es invalido'));
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const sessionId = decoded.sessionId;
        req.sessionId = sessionId;
        const sessionDataRaw = await redisClient_1.default.get(`session:${sessionId}`);
        const sessionData = sessionDataRaw ?? null;
        if (!sessionData) {
            return next(new CustomError_1.UnauthorizedError('Sesión no válida'));
        }
        try {
            const session = JSON.parse(sessionData);
            // Verificar si las conexiones requeridas están activas
            if (!session.serverConected || !session.userConected) {
                return next(new CustomError_1.ForbiddenError('Server and user connection required'));
            }
            req.session = session;
            return next();
        }
        catch (error) {
            return next(new CustomError_1.AppError(`Error parsing session data ${error}`));
        }
    }
    catch (error) {
        next(new CustomError_1.ForbiddenError(`Token expirado o inválido: ${error}`));
    }
};
exports.validateJWT = validateJWT;
const validateJWTWeb = async (req, _res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    if (!token) {
        return next(new CustomError_1.UnauthorizedError('Acceso denegado. Falta token o es invalido'));
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, 'access_secret');
        const sessionId = decoded.sessionId;
        req.sessionId = sessionId;
        const sessionDataRaw = await redisClient_1.default.get(`session:${sessionId}`);
        const sessionData = sessionDataRaw ?? null;
        if (!sessionData) {
            return next(new CustomError_1.UnauthorizedError('Sesión no válida'));
        }
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
        next(new CustomError_1.ForbiddenError(`Token expirado o inválido: ${error}`));
    }
};
exports.validateJWTWeb = validateJWTWeb;
const validateRefreshJWT = async (req, _res, next) => {
    // Obtener el refreshToken del body
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        return next(new CustomError_1.ForbiddenError('Token inválido o expirado'));
    }
    try {
        console.log("token_key", process.env.REFRESH_TOKEN_SECRET);
        // Verificar el refreshToken usando la clave secreta específica para el refreshToken
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const sessionId = decoded.sessionId;
        req.sessionId = sessionId;
        // Buscar la sesión en Redis usando el sessionId
        const sessionDataRaw = await redisClient_1.default.get(`session:${sessionId}`);
        const sessionData = sessionDataRaw ?? null;
        if (!sessionData) {
            return next(new CustomError_1.ForbiddenError('Sesion terminada'));
        }
        try {
            // Parsear los datos de la sesión obtenida de Redis
            const session = JSON.parse(sessionData);
            // Guardar la sesión en la solicitud para el uso posterior
            req.session = session;
            // Pasar al siguiente middleware
            return next();
        }
        catch (error) {
            return next(new CustomError_1.AppError(`Error parsing session data: ${error}`));
        }
    }
    catch (error) {
        // Si el refreshToken es inválido o ha expirado
        next(new CustomError_1.ForbiddenError(`Token expirado o inválido: ${error}`));
    }
};
exports.validateRefreshJWT = validateRefreshJWT;
//# sourceMappingURL=validateJWT.js.map
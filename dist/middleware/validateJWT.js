"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateJWTWeb = exports.validateJWTRefresh = exports.validateJWT = exports.validateJWTServer = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const CustomError_1 = require("../errors/CustomError");
const redisClient_1 = __importDefault(require("../config/redisClient"));
const validateJWTServer = async (req, _res, next) => {
    const authHeader = req.headers['x-server-token'];
    const tokenServer = authHeader?.split(' ')[1];
    if (!tokenServer) {
        next(new CustomError_1.UnauthorizedError('validateJWTServer - Acceso denegado. Falta token o es invalido'));
        return;
    }
    ;
    try {
        if (!process.env.ACCESS_TOKEN_SEVER_SECRET) {
            return next(new CustomError_1.ForbiddenError('variable ACCESS_TOKEN_SEVER_SECRET perdida!'));
        }
        ;
        const decoded = jsonwebtoken_1.default.verify(tokenServer, process.env.ACCESS_TOKEN_SEVER_SECRET);
        const sessionId = decoded.sessionId;
        if (!sessionId) {
            next(new CustomError_1.UnauthorizedError('validateJWTServer - Acceso denegado. Falta token o es invalido'));
            return;
        }
        const sessionDataRaw = await redisClient_1.default.get(`session:${sessionId}`);
        const sessionData = sessionDataRaw ?? null;
        if (!sessionData) {
            next(new CustomError_1.UnauthorizedError('validateJWTServer - Sesión no válida'));
            return;
        }
        try {
            const session = JSON.parse(sessionData);
            // Verificar si las conexiones requeridas están activas
            if (!session.serverConected) {
                next(new CustomError_1.ForbiddenError('Server connection required'));
                return;
            }
            req.sessionId = sessionId;
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
exports.validateJWTServer = validateJWTServer;
const validateJWTRefresh = async (req, _res, next) => {
    // Obtener el refreshToken del body
    const refreshToken = req.body.refreshToken;
    console.log({ refreshToken });
    if (!refreshToken) {
        return next(new CustomError_1.ForbiddenError('Token inválido o expirado'));
    }
    try {
        // Verificar el refreshToken usando la clave secreta específica para el refreshToken
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const sessionId = decoded.sessionId;
        // Buscar la sesión en Redis usando el sessionId
        const sessionDataRaw = await redisClient_1.default.get(`session:${sessionId}`);
        const sessionData = sessionDataRaw ?? null;
        if (!sessionData) {
            return next(new CustomError_1.ForbiddenError('Sesion terminada'));
        }
        try {
            // Parsear los datos de la sesión obtenida de Redis
            const session = JSON.parse(sessionData);
            // Verificar si las conexiones requeridas están activas
            if (!session.serverConected || !session.userConected) {
                return next(new CustomError_1.ForbiddenError('Server and user connection required'));
            }
            // Guardar la sesión en la solicitud para el uso posterior
            req.sessionId = sessionId;
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
exports.validateJWTRefresh = validateJWTRefresh;
/* mobile */
const validateJWT = async (req, _res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    if (!token) {
        return next(new CustomError_1.UnauthorizedError('validateJWT - Acceso denegado. Falta token o es invalido'));
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const sessionId = decoded.sessionId;
        const sessionDataRaw = await redisClient_1.default.get(`session:${sessionId}`);
        const sessionData = sessionDataRaw ?? null;
        if (!sessionData) {
            return next(new CustomError_1.UnauthorizedError('validateJWT - Sesión no válida'));
        }
        try {
            const session = JSON.parse(sessionData);
            // Verificar si las conexiones requeridas están activas
            if (!session.serverConected || !session.userConected) {
                return next(new CustomError_1.ForbiddenError('Server and user connection required'));
            }
            req.sessionId = sessionId;
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
/* web */
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
//# sourceMappingURL=validateJWT.js.map
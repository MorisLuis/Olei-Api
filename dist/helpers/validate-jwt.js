"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateJWTWeb = exports.validateJWT = exports.validateJWTDB = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const CustomError_1 = require("../errors/CustomError");
const server_1 = require("../models/server");
// Middleware to validate JWT from first login. (App)
const validateJWTDB = (req, _res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return next(new CustomError_1.UnauthorizedError('Acceso denegado. Falto token o es invalido'));
    }
    try {
        jsonwebtoken_1.default.verify(token, process.env.SECRETORPRIVATEKEY || '', (err, decoded) => {
            if (err) {
                return next(new CustomError_1.UnauthorizedError('Fallo la autenticación del token'));
            }
            const { IdUsuarioOLEI } = decoded;
            req.IdUsuarioOLEI = IdUsuarioOLEI;
            return next();
        });
    }
    catch (error) {
        return next(new CustomError_1.UnauthorizedError(`Fallo la autenticación del token: ${error}`));
    }
};
exports.validateJWTDB = validateJWTDB;
// Middleware to validate JWT from second login. (App)
const validateJWT = (req, _res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return next(new CustomError_1.UnauthorizedError('Acceso denegado. Falto token o es invalido'));
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.SECRETORPRIVATEKEY || '');
        req.Id_mobile = decoded.Id_mobile;
        next();
    }
    catch (error) {
        return next(new CustomError_1.UnauthorizedError(`Fallo la autenticación del token: ${error}`));
    }
};
exports.validateJWT = validateJWT;
/* web */
const validateJWTWeb = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({
            ok: false,
            message: 'Access denied. Token missing or invalid.',
        });
        return; // Retorna undefined
    }
    try {
        const decoded = (await jsonwebtoken_1.default.verify(token, process.env.SECRETORPRIVATEKEY || ''));
        const { Id, sessionRedis } = decoded;
        req.Id_web = Id;
        req.sessionRedis = sessionRedis;
        next();
    }
    catch (error) {
        return next(new CustomError_1.UnauthorizedError(`Fallo la autenticación del token: ${error}`));
    }
};
exports.validateJWTWeb = validateJWTWeb;
const authMiddleware = async (req, res, next, isLogin) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            ok: false,
            message: 'Access denied. Token missing or invalid.',
        });
    }
    try {
        const decoded = (await jsonwebtoken_1.default.verify(token, 's3Cr3t' || ''));
        const { sessionId } = decoded;
        req.sessionId = sessionId;
        return server_1.redisClient?.get(`session:${sessionId}`, (err, sessionData) => {
            if (err || !sessionData) {
                return res.status(401).json({ message: 'Sesión no válida' });
            }
            const session = JSON.parse(sessionData);
            console.log({ isLogin });
            // Verificar si las conexiones requeridas están activas
            if (!isLogin && (!session.userConected || !session.serverConected)) {
                return res.status(403).json({ message: 'Server connection required' });
            }
            req.sessionId = sessionId;
            req.session = JSON.parse(sessionData);
            return next();
        });
    }
    catch (error) {
        return next(new CustomError_1.UnauthorizedError(`Fallo la autenticación del token: ${error}`));
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=validate-jwt.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateJWTWeb = exports.validateJWT = exports.validateJWTDB = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const CustomError_1 = require("../errors/CustomError");
// Middleware to validate JWT from first login. (App)
const validateJWTDB = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        throw new CustomError_1.UnauthorizedError('Acceso denegado. Falto token o es invalido');
    }
    try {
        jsonwebtoken_1.default.verify(token, process.env.SECRETORPRIVATEKEY || '', (err, decoded) => {
            if (err) {
                throw new CustomError_1.UnauthorizedError('Fallo la autenticación del token');
            }
            ;
            const { IdUsuarioOLEI } = decoded;
            req.IdUsuarioOLEI = IdUsuarioOLEI;
            next();
        });
    }
    catch (error) {
        next(error);
    }
};
exports.validateJWTDB = validateJWTDB;
// Middleware to validate JWT from second login. (App)
const validateJWT = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        throw new CustomError_1.UnauthorizedError('Acceso denegado. Falto token o es invalido');
    }
    try {
        jsonwebtoken_1.default.verify(token, process.env.SECRETORPRIVATEKEY || '', (err, decoded) => {
            if (err) {
                throw new CustomError_1.UnauthorizedError('Fallo la autenticación del token');
            }
            const { id } = decoded;
            req.Id_mobile = id;
            next();
        });
    }
    catch (error) {
        next(error);
    }
};
exports.validateJWT = validateJWT;
// (Web)
const validateJWTWeb = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            ok: false,
            message: 'Access denied. Token missing or invalid.',
        });
    }
    try {
        jsonwebtoken_1.default.verify(token, process.env.SECRETORPRIVATEKEY || '', (err, decoded) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Failed to authenticate token' });
            }
            const { Id, sessionRedis } = decoded;
            req.Id_web = Id;
            req.sessionRedis = sessionRedis;
            next();
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.validateJWTWeb = validateJWTWeb;
//# sourceMappingURL=validate-jwt.js.map
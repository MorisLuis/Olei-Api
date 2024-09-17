"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateJWTWeb = exports.validateJWT = exports.validateJWTDB = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Middleware to validate JWT from first login. (App)
const validateJWTDB = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
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
            const { IdUsuarioOLEI } = decoded;
            req.IdUsuarioOLEI = IdUsuarioOLEI;
            next();
        });
    }
    catch (error) {
        console.log({ error });
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.validateJWTDB = validateJWTDB;
// Middleware to validate JWT from second login. (App)
const validateJWT = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
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
            const { id } = decoded;
            req.id = id;
            next();
        });
    }
    catch (error) {
        console.log({ error });
        return res.status(500).json({ success: false, message: 'Internal server error' });
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
            const { Id, sessionID } = decoded;
            req.Id = Id;
            req.sessionID = sessionID;
            next();
        });
    }
    catch (error) {
        console.log({ error });
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.validateJWTWeb = validateJWTWeb;
//# sourceMappingURL=validate-jwt.js.map
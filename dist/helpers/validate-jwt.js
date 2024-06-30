"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateJWT = exports.validateJWTDB = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Middleware to validate JWT from first login.
const validateJWTDB = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
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
            const { serverclientes, baseclientes } = decoded;
            req.serverclientes = serverclientes;
            req.baseclientes = baseclientes;
            next();
        });
    }
    catch (error) {
        console.log({ error });
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
exports.validateJWTDB = validateJWTDB;
// Middleware to validate JWT from second login.
const validateJWT = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.header('x-token');
    console.log({ token });
    if (!token) {
        return res.status(401).json({
            ok: false,
            message: 'Access denied. Token missing or invalid.',
        });
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, process.env.SECRETORPRIVATEKEY || '');
        console.log({ payload });
        req.id = payload.id;
        req.rol = payload.rol;
        req.server = payload.server;
        req.base = payload.base;
        next();
    }
    catch (error) {
        console.log({ error });
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
exports.validateJWT = validateJWT;
//# sourceMappingURL=validate-jwt.js.map
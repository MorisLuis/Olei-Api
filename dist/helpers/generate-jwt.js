"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshTokenWeb = exports.generateAccessTokenWeb = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';
/** Genera un Access Token con expiración corta (ej. 15min) */
const generateAccessToken = (sessionId) => {
    return jsonwebtoken_1.default.sign({ sessionId }, ACCESS_TOKEN_SECRET, { expiresIn: '30s' });
};
exports.generateAccessToken = generateAccessToken;
/** Genera un Refresh Token con expiración larga (ej. 30 días) */
const generateRefreshToken = (sessionId) => {
    return jsonwebtoken_1.default.sign({ sessionId }, REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
};
exports.generateRefreshToken = generateRefreshToken;
/** Genera un Access Token con expiración corta (ej. 15min) */
const generateAccessTokenWeb = (sessionId) => {
    return jsonwebtoken_1.default.sign({ sessionId }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};
exports.generateAccessTokenWeb = generateAccessTokenWeb;
/** Genera un Refresh Token con expiración larga (ej. 30 días) */
const generateRefreshTokenWeb = (sessionId) => {
    return jsonwebtoken_1.default.sign({ sessionId }, REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
};
exports.generateRefreshTokenWeb = generateRefreshTokenWeb;
//# sourceMappingURL=generate-jwt.js.map
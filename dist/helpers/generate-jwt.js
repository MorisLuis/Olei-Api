"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshTokenWeb = exports.generateAccessTokenWeb = exports.generateRefreshToken = exports.generateAccessToken = exports.generateAccessTokenServer = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ACCESS_TOKEN_SEVER_SECRET = process.env.ACCESS_TOKEN_SEVER_SECRET || 'access_server_secret';
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';
/* MOBILE */
const generateAccessTokenServer = (sessionId) => {
    return jsonwebtoken_1.default.sign({ sessionId }, ACCESS_TOKEN_SEVER_SECRET, { expiresIn: '1y' });
};
exports.generateAccessTokenServer = generateAccessTokenServer;
const generateAccessToken = (sessionId) => {
    return jsonwebtoken_1.default.sign({ sessionId }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (sessionId) => {
    return jsonwebtoken_1.default.sign({ sessionId }, REFRESH_TOKEN_SECRET, { expiresIn: '1d' });
};
exports.generateRefreshToken = generateRefreshToken;
/* WEB */
const generateAccessTokenWeb = (sessionId) => {
    return jsonwebtoken_1.default.sign({ sessionId }, 'access_secret', { expiresIn: '15m' });
};
exports.generateAccessTokenWeb = generateAccessTokenWeb;
const generateRefreshTokenWeb = (sessionId) => {
    return jsonwebtoken_1.default.sign({ sessionId }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};
exports.generateRefreshTokenWeb = generateRefreshTokenWeb;
//# sourceMappingURL=generate-jwt.js.map
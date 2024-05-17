"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateJWTDB = exports.generateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateJWT = ({ id, rol }) => {
    return new Promise((resolve, reject) => {
        const payload = { id, rol };
        jsonwebtoken_1.default.sign(payload, process.env.SECRETORPRIVATEKEY || '', {
            expiresIn: '8h'
        }, (error, token) => {
            if (error) {
                console.log(error);
                reject('No se pudo generar el token');
            }
            resolve(token);
        });
    });
};
exports.generateJWT = generateJWT;
const generateJWTDB = ({ servidor, database }) => {
    return new Promise((resolve, reject) => {
        const payload = { servidor, database };
        jsonwebtoken_1.default.sign(payload, process.env.SECRETORPRIVATEKEY || '', {
            expiresIn: '1y'
        }, (error, token) => {
            if (error) {
                console.log(error);
                reject('No se pudo generar el token');
            }
            resolve(token);
        });
    });
};
exports.generateJWTDB = generateJWTDB;
//# sourceMappingURL=generate-jwt.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWebJWT = exports.generateJWTDB = exports.generateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateJWTDB = ({ serverclientes, baseclientes, IdUsuarioOLEI }) => {
    return new Promise((resolve, reject) => {
        const payload = { serverclientes, baseclientes, IdUsuarioOLEI };
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
const generateJWT = ({ id, rol, server, base }) => {
    return new Promise((resolve, reject) => {
        const payload = { id, rol, server, base };
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
exports.generateJWT = generateJWT;
const generateWebJWT = ({ id, rol, serverweb, baseweb, clientid }) => {
    return new Promise((resolve, reject) => {
        const payload = { id, rol, serverweb, baseweb, clientid };
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
exports.generateWebJWT = generateWebJWT;
//# sourceMappingURL=generate-jwt.js.map
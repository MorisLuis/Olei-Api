"use strict";
/// <reference path="./types/express-session.d.ts" />
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("./models/server"));
const dotenv_1 = __importDefault(require("dotenv"));
require("./types/express"); // Asegúrate de que la ruta sea correcta.
dotenv_1.default.config();
const server = new server_1.default();
server.listen();
exports.default = server;
//# sourceMappingURL=index.js.map
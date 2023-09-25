"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sharedData = void 0;
const server_1 = __importDefault(require("./models/server"));
const dotenv_1 = __importDefault(require("dotenv"));
require("./database/connection");
dotenv_1.default.config();
// Create a shared data object to store user information for the session.
// The objective is to track 'Id_ListaPrecion' & 'Id_Almacen' throughout the entire backend.
exports.sharedData = {
    // 'currentUser' stores the current user using the 'UserInterface'.
    currentUser: null,
    // 'currentClient' stores the current client using the 'UserInterface'.
    currentClient: null,
    // 'userConnection' stores the connection information using 'ConnectionInterface'.
    userConnection: null
};
const server = new server_1.default();
server.listen();
//# sourceMappingURL=app.js.map
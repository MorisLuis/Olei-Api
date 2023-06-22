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
exports.logout = exports.login = void 0;
const database_1 = require("../database");
const moment_1 = __importDefault(require("moment"));
const generate_jwt_1 = require("../helpers/generate-jwt");
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pool = yield (0, database_1.dbConnection)();
        const { email, password } = req.body;
        // Buscar el usuario en la base de datos usando el correo electrónico
        const query_DBUsuariosool = `SELECT * FROM [OLEIDB1_CLIENTES].[dbo].[USUARIOSOOL] WHERE Id_UsuarioOOL = '${email}'`;
        const result = yield (pool === null || pool === void 0 ? void 0 : pool.request().query(query_DBUsuariosool));
        const user = result === null || result === void 0 ? void 0 : result.recordset[0];
        if (!user) {
            res.status(404).json({ error: 'Correo no encontrado' });
            return;
        }
        if (user.PasswordOOL.trim() !== password) {
            res.status(401).json({ error: 'Contraseña incorrecta' });
            return;
        }
        // Obtener la fecha de vencimiento de la suscripción del usuario
        const query_CLIENTES = `SELECT * FROM [OLEIDB1_CLIENTES].[dbo].[CLIENTES] WHERE Id_Cliente = '${user.Id_ClienteDBCLIENTES}'`;
        const resultCliente = yield (pool === null || pool === void 0 ? void 0 : pool.request().query(query_CLIENTES));
        const dueDate = resultCliente === null || resultCliente === void 0 ? void 0 : resultCliente.recordset[0].Vigencia;
        // Comparar la fecha de vencimiento con el día de hoy
        const today = (0, moment_1.default)().startOf('day');
        const isExpired = (0, moment_1.default)(dueDate).startOf('day').isBefore(today);
        if (isExpired) {
            res.status(401).json({ error: 'La suscripción ha expirado' });
            return;
        }
        // Generar un token JWT para el usuario
        const token = yield (0, generate_jwt_1.generateJWT)(user.Id_UsuarioOOL, user.TipoUsuario);
        // Realizar la conexión a otra base de datos
        const otherDBServer = user.ServidorSQL.trim();
        const otherDBDatabase = user.BaseSQL.trim();
        yield (pool === null || pool === void 0 ? void 0 : pool.close());
        const otherPool = yield (0, database_1.dbConnection)(otherDBServer, otherDBDatabase);
        res.json({
            user,
            token,
            otherPool
        });
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
exports.login = login;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, database_1.closeDbConnection)();
        const server = "babs4kdofr.database.windows.net";
        const database = "OLEIDB1_CLIENTES";
        const pool = yield (0, database_1.dbConnection)(server, database);
        const connectionStatus = (pool === null || pool === void 0 ? void 0 : pool.connected) ? 'Connected' : 'Not Connected';
        res.json({
            status: connectionStatus,
            pool
        });
    }
    catch (error) {
        console.log({ error });
    }
});
exports.logout = logout;
//# sourceMappingURL=auth.js.map
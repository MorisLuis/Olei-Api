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
exports.logout = exports.renewWeb = exports.loginWeb = void 0;
const database_1 = require("../../database");
const generate_jwt_1 = require("../../helpers/generate-jwt");
const config_1 = __importDefault(require("../../config"));
const moment_1 = __importDefault(require("moment"));
const storageWeb_1 = require("../../Storage/storageWeb");
const loginWeb = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // STEP 1 - LOGIN
        const mainPool = yield (0, database_1.dbConnection)(config_1.default.dbServer, config_1.default.dbDatabase);
        if (!mainPool) {
            return res.status(500).json({ error: 'Error connecting to the main database' });
        }
        // Search for the user in the database using their email.
        const { email, password } = req.body;
        if (email === "" || password === "") {
            return res.status(400).json({ error: 'Necesario escribir correo y contraseña' });
        }
        const user = yield getUserByEmailWeb(mainPool, email);
        if (!user) {
            return res.status(404).json({ error: 'Correo no encontrado' });
        }
        if (user.PasswordOOL.trim() !== password) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }
        // Get the user's subscription expiration date.
        /* const dueDate = await getUserSubscriptionDueDate(mainPool, user.Id_ClienteDBCLIENTES);
        console.log({dueDate})
        if (isSubscriptionExpired(dueDate)) {
            return res.status(401).json({ error: 'Subscripción ha expirado' });
        } */
        // Get user database connection details.
        const otherDBServer = user.ServidorSQL.trim();
        const otherDBDatabase = user.BaseSQL.trim();
        yield mainPool.close();
        // STEP 2 - CONNECT THE COMPANY DATABASE
        // Connect to the user's database.
        const otherDBConnection = yield connectToUserDatabase(user);
        const UserData = {
            Id_UsuarioOOL: user.Id_UsuarioOOL,
            TipoUsuario: user.TipoUsuario,
            PrivilegioTipoCliente: user.PrivilegioTipoCliente,
            Id_Almacen: user.Id_Almacen,
            SwImagenes: user.SwImagenes,
            SwSinStock: user.SwSinStock,
            SwsinPrecio: user.SwsinPrecio,
            TipoDocOO: user.TipoDocOO,
            IdOLEI: user.IdOLEI,
            Company: user.Company,
            Id_ListPre: otherDBConnection.currentUser.user.Id_ListPre
        };
        (0, storageWeb_1.setUserDataWeb)(user.BaseSQL.trim(), UserData);
        const currentUser = (0, storageWeb_1.getUserDataWeb)(user.BaseSQL.trim());
        return res.json({
            otherDBServer,
            otherDBDatabase,
            user: currentUser,
            token: otherDBConnection.token
        });
    }
    catch (error) {
        console.log({ error });
        return res.status(500).json({ error: error.message || 'Unexpected error' });
    }
    finally {
        yield (0, database_1.closeDbConnection)();
    }
});
exports.loginWeb = loginWeb;
const renewWeb = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const serverWeb = req.serverweb;
    const baseWeb = req.baseweb;
    const id = req.id;
    const rol = req.rol;
    const clientid = req.clientid;
    try {
        if (!id && !rol) {
            return res.status(401).json({ message: 'Id and rol are neccessary' });
        }
        ;
        if (!serverWeb && !baseWeb) {
            return res.status(401).json({ message: 'Server and base data is neccessary' });
        }
        ;
        let token;
        if (clientid) {
            token = yield (0, generate_jwt_1.generateWebJWT)({ id, rol, serverweb: serverWeb, baseweb: baseWeb, clientid });
        }
        else {
            token = yield (0, generate_jwt_1.generateWebJWT)({ id, rol, serverweb: serverWeb, baseweb: baseWeb });
        }
        if (!token) {
            return res.status(401).json({ message: 'Failed to generate token' });
        }
        ;
        const user = yield (0, storageWeb_1.getUserDataWeb)(baseWeb);
        res.json({
            user,
            token
        });
    }
    catch (error) {
        console.log({ errorRW: error });
        res.status(500).send(error.message);
    }
    finally {
        yield (0, database_1.closeDbConnection)();
    }
});
exports.renewWeb = renewWeb;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, database_1.closeDbConnection)();
        res.json({
            ok: false,
        });
    }
    catch (error) {
        console.log({ error });
    }
    finally {
        yield (0, database_1.closeDbConnection)();
    }
});
exports.logout = logout;
//Utils
const getUserByEmailWeb = (mainPool, email) => __awaiter(void 0, void 0, void 0, function* () {
    const query_DB = database_1.querys.authWeb;
    const result = yield mainPool.request().input('email', email).query(query_DB);
    return result === null || result === void 0 ? void 0 : result.recordset[0];
});
const getUserSubscriptionDueDate = (mainPool, clientId) => __awaiter(void 0, void 0, void 0, function* () {
    const query_CLIENTES = `SELECT * FROM [OLEIDB1_CLIENTES].[dbo].[CLIENTES] WHERE Id_Cliente = @clienteId`;
    const resultCliente = yield mainPool.request().input('clienteId', clientId).query(query_CLIENTES);
    return resultCliente === null || resultCliente === void 0 ? void 0 : resultCliente.recordset[0].Vigencia;
});
const isSubscriptionExpired = (dueDate) => {
    const today = (0, moment_1.default)().startOf('day');
    const isExpired = (0, moment_1.default)(dueDate).startOf('day').isBefore(today);
    return isExpired;
};
const connectToUserDatabase = (user) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const otherPool = yield (0, database_1.dbConnection)(user.ServidorSQL.trim(), user.BaseSQL.trim());
        const query_DB = database_1.querys.authCompany;
        const idListPreResult = yield otherPool.request()
            .input('Id_Cliente', user.Id_Cliente ? user.Id_Cliente : 1)
            .input("IdOLEI", user.IdOLEI)
            .query(query_DB);
        const Id_ListPre = (_a = idListPreResult === null || idListPreResult === void 0 ? void 0 : idListPreResult.recordset[0]) === null || _a === void 0 ? void 0 : _a.Id_ListPre;
        const Nombre = (_b = idListPreResult === null || idListPreResult === void 0 ? void 0 : idListPreResult.recordset[0]) === null || _b === void 0 ? void 0 : _b.Nombre;
        const TypeOfMovementsResult = yield otherPool.request().query(database_1.querys.getTypeOfMovementInitial);
        const TypeOfMovements = TypeOfMovementsResult.recordset[0];
        const UserData = {
            user: Object.assign(Object.assign({}, user), { Id_ListPre,
                Nombre, Id_TipoMovInv: {
                    Id_TipoMovInv: TypeOfMovements.Id_TipoMovInv,
                    Accion: TypeOfMovements.Accion,
                    Descripcion: TypeOfMovements.Descripcion,
                    Id_AlmDest: TypeOfMovements.Id_AlmDest
                } })
        };
        const Id_Cliente = (user === null || user === void 0 ? void 0 : user.Id_Cliente) ? user.Id_Cliente : 0;
        const client = {
            Id_Almacen: user.Id_Almacen,
            Id_Cliente: Id_Cliente,
            Id_ListPre,
            IsEmploye: false
        };
        (0, storageWeb_1.setClientData)(`${user.BaseSQL.trim()}_${Id_Cliente}`, client);
        const token = yield (0, generate_jwt_1.generateWebJWT)({
            id: user.Id_UsuarioOOL.trim(),
            rol: user.TipoUsuario,
            serverweb: user.ServidorSQL.trim(),
            baseweb: user.BaseSQL.trim(),
            clientid: Id_Cliente
        });
        return {
            server: user.ServidorSQL.trim(),
            database: user.BaseSQL.trim(),
            pool: otherPool,
            currentUser: UserData,
            token
        };
    }
    catch (error) {
        console.error("Error en connectToUserDatabase:", error);
        throw error;
    }
});
//# sourceMappingURL=authWeb.js.map
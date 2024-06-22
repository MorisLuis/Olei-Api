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
exports.renew = exports.login = exports.loginDB = void 0;
const database_1 = require("../../database");
const generate_jwt_1 = require("../../helpers/generate-jwt");
const __1 = require("../..");
const config_1 = __importDefault(require("../../config"));
const moment_1 = __importDefault(require("moment"));
const loginDB = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // STEP 1 - CONNECT TO OLIEDB1_CLIENTES
    const mainPool = yield (0, database_1.dbConnection)(config_1.default.dbServer, config_1.default.dbDatabase);
    if (!mainPool) {
        return res.status(500).json({ error: 'Error connecting to the main database' });
    }
    try {
        const { IdUsuarioOLEI, PasswordOLEI } = req.body;
        if (IdUsuarioOLEI.trim() === "" || PasswordOLEI.trim() === "") {
            return res.status(400).json({ error: 'Necesario enviar usuario y contraseña' });
        }
        const query_DB = database_1.querys.authDatabase;
        const result = yield mainPool.request().input('IdUsuarioOLEI', IdUsuarioOLEI).query(query_DB);
        const cleanResult = result === null || result === void 0 ? void 0 : result.recordset[0];
        if (cleanResult.PasswordOLEI.trim() !== PasswordOLEI) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }
        __1.sharedData.currentUser = {
            user: Object.assign(Object.assign({}, (_a = __1.sharedData.currentUser) === null || _a === void 0 ? void 0 : _a.user), { Nombre: cleanResult.Nombre, Id_ListPre: cleanResult.Id_ListPre, Id_Almacen: cleanResult.Id_Almacen, Id_UsuarioOOL: cleanResult.IdUsuarioOLEI, PasswordOOL: cleanResult.PasswordOLEI, ServidorSQL: cleanResult.ServidorSQL, BaseSQL: cleanResult.BaseSQL, TipoUsuario: 1, PrivilegioTipoCliente: 1, PrecioIncIVA: 1, SwImagenes: cleanResult.SwImagenes === true ? 1 : 0, SwSinStock: cleanResult.SwSinStock === true ? 1 : 0, SwsinPrecio: cleanResult.SwsinPrecio === true ? 1 : 0, TipoDocOO: cleanResult.TipoDocOO, IdOLEI: cleanResult.IdOLEI, Vigencia: cleanResult.Vigencia, RazonSocial: cleanResult.RazonSocial })
        };
        __1.sharedData.userConnection = {
            connection: {
                user: config_1.default.dbUser,
                password: config_1.default.dbPassword,
                server: cleanResult.ServidorSQL.trim(),
                database: cleanResult.BaseSQL.trim()
            }
        };
        const tokenDB = yield (0, generate_jwt_1.generateJWTDB)({ IdUsuarioOLEI, PasswordOLEI });
        return res.json({
            tokenDB,
            user: __1.sharedData.currentUser.user,
            userDB: {
                servidor: cleanResult.ServidorSQL,
                database: cleanResult.BaseSQL
            }
        });
    }
    catch (error) {
        console.log({ error });
        return res.status(500).send(error.message);
    }
    finally {
        mainPool.close();
    }
});
exports.loginDB = loginDB;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e, _f, _g;
    // STEP 1 - LOGIN
    const mainPool = yield (0, database_1.dbConnection)((_b = __1.sharedData.userConnection) === null || _b === void 0 ? void 0 : _b.connection.server, (_c = __1.sharedData.userConnection) === null || _c === void 0 ? void 0 : _c.connection.database);
    if (!mainPool) {
        return res.status(500).json({ error: 'Error connecting to the main database' });
    }
    try {
        // Search for the user in the database using their email.
        const { Id_Usuario, password } = req.body;
        if (Id_Usuario.trim() === "" || password.trim() === "") {
            return res.status(400).json({ error: 'Necesario escribir correo y contraseña' });
        }
        const user = yield getUserByEmail(mainPool, Id_Usuario);
        if (!user) {
            return res.status(404).json({ error: 'Correo no encontrado' });
        }
        if (user.Password.trim() !== password) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }
        if (!((_d = __1.sharedData.currentUser) === null || _d === void 0 ? void 0 : _d.user.Vigencia))
            return;
        // Get the user's subscription expiration date.
        const dueDate = yield isSubscriptionExpired((_e = __1.sharedData.currentUser) === null || _e === void 0 ? void 0 : _e.user.Vigencia);
        if (dueDate) {
            return res.status(401).json({ error: 'Subscripción ha expirado' });
        }
        // Update sharedData.userConnection for global access.
        __1.sharedData.userConnection = {
            connection: {
                user: config_1.default.dbUser,
                password: config_1.default.dbPassword,
                server: (_f = __1.sharedData.userConnection) === null || _f === void 0 ? void 0 : _f.connection.server,
                database: (_g = __1.sharedData.userConnection) === null || _g === void 0 ? void 0 : _g.connection.database
            }
        };
        const TypeOfMovementsResult = yield mainPool.request().query(database_1.querys.getTypeOfMovementInitial);
        const TypeOfMovements = TypeOfMovementsResult.recordset[0];
        __1.sharedData.currentUser = {
            user: Object.assign(Object.assign({}, __1.sharedData.currentUser.user), { Id_TipoMovInv: {
                    Id_TipoMovInv: TypeOfMovements.Id_TipoMovInv,
                    Accion: TypeOfMovements.Accion,
                    Descripcion: TypeOfMovements.Descripcion,
                    Id_AlmDest: TypeOfMovements.Id_AlmDest
                } })
        };
        const token = yield (0, generate_jwt_1.generateJWT)({ id: user.EMail, rol: user.Id_Perfil });
        return res.json({
            user,
            token
        });
    }
    catch (error) {
        console.log({ error });
        return res.status(500).json({ error: error.message || 'Unexpected error' });
    }
    finally {
        mainPool.close();
    }
});
exports.login = login;
const renew = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _h, _j;
    const userDB = (_h = __1.sharedData === null || __1.sharedData === void 0 ? void 0 : __1.sharedData.userConnection) === null || _h === void 0 ? void 0 : _h.connection;
    const user = (_j = __1.sharedData.currentUser) === null || _j === void 0 ? void 0 : _j.user;
    try {
        if (!userDB) {
            return res.status(401).json({ message: 'UserDB not authenticated' });
        }
        ;
        const token = yield (0, generate_jwt_1.generateJWTDB)({ IdUsuarioOLEI: userDB.server, PasswordOLEI: userDB.database });
        res.json({
            userDB,
            user,
            token
        });
    }
    catch (error) {
        res.status(500).send(error.message);
        console.log({ error });
    }
});
exports.renew = renew;
// Utils
const getUserByEmail = (mainPool, Id_Usuario) => __awaiter(void 0, void 0, void 0, function* () {
    const query_DB = database_1.querys.auth;
    const result = yield mainPool.request().input('Id_Usuario', Id_Usuario.trim()).query(query_DB);
    return result === null || result === void 0 ? void 0 : result.recordset[0];
});
const isSubscriptionExpired = (dueDate) => {
    const today = (0, moment_1.default)().startOf('day');
    const isExpired = (0, moment_1.default)(dueDate).startOf('day').isBefore(today);
    return isExpired;
};
//# sourceMappingURL=auth.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postInventoryService = void 0;
const database_1 = require("../database");
const CustomError_1 = require("../errors/CustomError");
const convertArrayToXml_1 = require("../utils/convertArrayToXml");
const currentTime_1 = require("../utils/currentTime");
const mssql_1 = __importDefault(require("mssql"));
const postInventoryService = async ({ userSession, inventoryDetails, typeOfMovement }) => {
    try {
        /* TodosAlmacenes PENDING */
        const { ServidorSQL, BaseSQL, PasswordSQL, UsuarioSQL, Id_Almacen, userId } = userSession;
        const pool = await (0, database_1.dbConnection)(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);
        if (!pool) {
            throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
        }
        ;
        const Accion = typeOfMovement.Accion;
        const Id_TipoMovInv = typeOfMovement.Id_TipoMovInv;
        const ExpectedRows = inventoryDetails.length;
        const ExpectedTotalQuantity = inventoryDetails.reduce((sum, item) => sum + (item.Cantidad ?? 0), 0);
        const transaction = new mssql_1.default.Transaction(pool);
        await transaction.begin();
        const request = new mssql_1.default.Request(transaction);
        // Si Accion es igual a 3, es traspaso. Si no es entrada o salida.
        const AlmacenDestino = typeOfMovement.Accion === '3' ? typeOfMovement?.Id_AlmDest : Id_Almacen;
        // Get the inventory data.
        const inventoryData = {
            Estado: 1, // If it were 0 it would mean a inventory was cancelled
            Fecha: (0, currentTime_1.currentTime)(),
            Id_TipoMovInv: typeOfMovement?.Id_TipoMovInv,
            Id_AlmacenDest: AlmacenDestino,
            SwPendiente: 0,
            Descripcion: '',
            SwTr: 0,
            FolioReq: null,
            AlmReq: 0,
        };
        const xmlDataInventory = await (0, convertArrayToXml_1.convertArrayToXml)(inventoryData);
        const xmlDataInventoryDetails = await (0, convertArrayToXml_1.convertArrayToXml)(inventoryDetails);
        const result = await request
            .input('xmlDataInventory', mssql_1.default.Xml, xmlDataInventory)
            .input('xmlDataInventoryDetails', mssql_1.default.Xml, xmlDataInventoryDetails)
            .input('Accion', mssql_1.default.Int, Accion)
            .input('Id_TipoMovInv', mssql_1.default.Int, Id_TipoMovInv)
            .input('Id_Almacen', mssql_1.default.Int, Id_Almacen)
            .input('user', mssql_1.default.NVarChar(50), userId)
            .input('ExpectedRows', mssql_1.default.Int, ExpectedRows)
            .input('ExpectedTotalQuantity', mssql_1.default.Decimal(18, 0), ExpectedTotalQuantity)
            .output('Folio', mssql_1.default.Int)
            .execute('fn_ExecuteInventory');
        const Folio = result.output.Folio;
        await transaction.commit();
        return {
            Folio
        };
    }
    catch (error) {
        throw new CustomError_1.ValidationError(`${error}`);
    }
};
exports.postInventoryService = postInventoryService;
//# sourceMappingURL=inventoryServices.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInventoryDetails = exports.getInventory = exports.postInventory = void 0;
const database_1 = require("../database");
const inventory_1 = require("../database/querys/inventory");
const BadRequestError_1 = __importDefault(require("../errors/BadRequestError"));
const inventoryServices_1 = require("../services/inventoryServices");
const inventoryValidations_1 = require("../validations/inventoryValidations");
const postInventory = async (req, res, next) => {
    try {
        const sessionId = req.sessionID;
        const Id_Usuario = req.id;
        const { inventoryDetails, typeOfMovement } = inventoryValidations_1.postInventoryBodySchema.parse(req.body);
        const { Folio } = await (0, inventoryServices_1.postInventoryService)({
            sessionId,
            inventoryDetails,
            typeOfMovement,
            Id_Usuario
        });
        res.json({ Folio });
    }
    catch (error) {
        next(error);
    }
};
exports.postInventory = postInventory;
const getInventory = async (req, res, next) => {
    try {
        const { Folio } = inventoryValidations_1.getInventoryQuerySchema.parse(req.query);
        const pool = await (0, database_1.dbConnection)();
        if (!pool) {
            throw new BadRequestError_1.default({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
        }
        const getInventoryQuery = inventory_1.inventoryQuerys.getInventory;
        const request = await pool.request()
            .input("Folio", Folio)
            .query(getInventoryQuery);
        let inventory = request.recordset[0];
        res.json(inventory);
    }
    catch (error) {
        next(error);
    }
};
exports.getInventory = getInventory;
const getInventoryDetails = async (req, res, next) => {
    try {
        const { Folio } = inventoryValidations_1.getInventoryQuerySchema.parse(req.query);
        const pool = await (0, database_1.dbConnection)();
        if (!pool) {
            throw new BadRequestError_1.default({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
        }
        const getInventoryQuery = inventory_1.inventoryQuerys.getInventoryDetails;
        const request = await pool.request()
            .input("Folio", Folio)
            .query(getInventoryQuery);
        const inventoryDetails = request.recordset;
        res.json(inventoryDetails);
    }
    catch (error) {
        next(error);
    }
};
exports.getInventoryDetails = getInventoryDetails;
//# sourceMappingURL=inventory.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchProductInventory = exports.getInventoryDetails = exports.getInventory = exports.postInventory = void 0;
const database_1 = require("../database");
const inventory_1 = require("../database/querys/inventory");
const inventoryServices_1 = require("../services/inventoryServices");
const inventoryValidations_1 = require("../validations/inventoryValidations");
const zod_1 = require("zod");
const CustomError_1 = require("../errors/CustomError");
const postInventory = async (req, res, next) => {
    try {
        const sessionId = req.sessionID;
        console.log({ sessionId });
        const Id_Usuario = req.Id_mobile;
        console.log({ Id_Usuario });
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
        console.log({ error });
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        }
        else {
            next(error);
        }
    }
};
exports.postInventory = postInventory;
const getInventory = async (req, res, next) => {
    try {
        const { Folio } = inventoryValidations_1.getInventoryQuerySchema.parse(req.query);
        const pool = await (0, database_1.dbConnection)();
        if (!pool) {
            throw new CustomError_1.ValidationError('Error al conectarse a base de datos');
        }
        const getInventoryQuery = inventory_1.inventoryQuerys.getInventory;
        const request = await pool.request()
            .input("Folio", Folio)
            .query(getInventoryQuery);
        let inventory = request.recordset[0];
        res.json(inventory);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        }
        else {
            next(error);
        }
    }
};
exports.getInventory = getInventory;
const getInventoryDetails = async (req, res, next) => {
    try {
        const { Folio } = inventoryValidations_1.getInventoryQuerySchema.parse(req.query);
        const pool = await (0, database_1.dbConnection)();
        if (!pool) {
            throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
        }
        const getInventoryQuery = inventory_1.inventoryQuerys.getInventoryDetails;
        const request = await pool.request()
            .input("Folio", Folio)
            .query(getInventoryQuery);
        const inventoryDetails = request.recordset;
        res.json(inventoryDetails);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        }
        else {
            next(error);
        }
    }
};
exports.getInventoryDetails = getInventoryDetails;
const searchProductInventory = async (req, res, next) => {
    try {
        const { searchTerm } = inventoryValidations_1.searchProductInventoryQuerySchema.parse(req.query);
        const sessionId = req.sessionID;
        const { products } = await (0, inventoryServices_1.searchProductInventoryService)({
            sessionId,
            searchTerm: searchTerm,
        });
        res.json(products);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        }
        else {
            next(error);
        }
    }
};
exports.searchProductInventory = searchProductInventory;
//# sourceMappingURL=inventory.js.map
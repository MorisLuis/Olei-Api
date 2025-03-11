"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchProductInventoryWithoutCodebar = exports.searchProductInventory = exports.postInventory = void 0;
const inventoryServices_1 = require("../services/inventoryServices");
const inventoryValidations_1 = require("../validations/inventoryValidations");
const zod_1 = require("zod");
const postInventory = async (req, res, next) => {
    try {
        const sessionId = req.sessionID;
        const Id_Usuario = req.Id_mobile;
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
/* const getInventory = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { Folio } = getInventoryQuerySchema.parse(req.query);
        const pool = await dbConnection();

        if (!pool) {
            throw new ValidationError('Error al conectarse a base de datos');
        }

        const getInventoryQuery = inventoryQuerys.getInventory;
        const request = await pool.request()
            .input("Folio", Folio)
            .query(getInventoryQuery)

        let inventory = request.recordset[0];

        res.json(inventory)

    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        } else {
            next(error);
        }
    }
};

const getInventoryDetails = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { Folio } = getInventoryQuerySchema.parse(req.query);

        const pool = await dbConnection()
        if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
        }

        const getInventoryQuery = inventoryQuerys.getInventoryDetails;
        const request = await pool.request()
            .input("Folio", Folio)
            .query(getInventoryQuery)

        const inventoryDetails = request.recordset;
        res.json(inventoryDetails)

    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        } else {
            next(error);
        }
    }
};
 */
const searchProductInventory = async (req, res, next) => {
    try {
        const { searchTerm } = inventoryValidations_1.searchProductInventoryQuerySchema.parse(req.query);
        const sessionId = req.sessionID;
        const { products } = await (0, inventoryServices_1.searchProductInventoryService)({
            sessionId,
            searchTerm: searchTerm,
            withCodebar: true
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
const searchProductInventoryWithoutCodebar = async (req, res, next) => {
    try {
        const { searchTerm } = inventoryValidations_1.searchProductInventoryQuerySchema.parse(req.query);
        const sessionId = req.sessionID;
        const { products } = await (0, inventoryServices_1.searchProductInventoryService)({
            sessionId,
            searchTerm: searchTerm,
            withCodebar: false
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
exports.searchProductInventoryWithoutCodebar = searchProductInventoryWithoutCodebar;
//# sourceMappingURL=inventory.js.map
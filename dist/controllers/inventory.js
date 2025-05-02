"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postInventory = void 0;
const inventoryServices_1 = require("../services/inventoryServices");
const inventoryValidations_1 = require("../validations/inventoryValidations");
const postInventory = async (req, res, next) => {
    try {
        const userSession = req.session;
        const { inventoryDetails, typeOfMovement } = inventoryValidations_1.postInventoryBodySchema.parse(req.body);
        const { Folio } = await (0, inventoryServices_1.postInventoryService)({
            userSession,
            inventoryDetails,
            typeOfMovement
        });
        return res.json({ Folio });
    }
    catch (error) {
        console.log({ error });
        return next(error);
    }
};
exports.postInventory = postInventory;
//# sourceMappingURL=inventory.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventory_1 = require("../controllers/inventory");
const router = (0, express_1.Router)();
router.get('/', inventory_1.getInventory);
router.get('/inventoryDetails', inventory_1.getInventoryDetails);
router.post('/', inventory_1.postInventory);
router.post('/inventoryDetails', inventory_1.postInventoryDetails);
exports.default = router;
//# sourceMappingURL=inventoryRouter.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventory_1 = require("../controllers/inventory");
const validate_jwt_1 = require("../helpers/validate-jwt");
const router = (0, express_1.Router)();
router.get('/', inventory_1.getInventory);
router.get('/inventoryDetails', inventory_1.getInventoryDetails);
router.post('/', validate_jwt_1.validateJWT, inventory_1.postInventory);
router.get('/search/product', validate_jwt_1.validateJWT, inventory_1.searchProductInventory);
exports.default = router;
//# sourceMappingURL=inventoryRouter.js.map
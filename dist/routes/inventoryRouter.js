"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventory_1 = require("../controllers/inventory");
const products_1 = require("../controllers/products/products");
const validateJWT_1 = require("../middleware/validateJWT");
const router = (0, express_1.Router)();
router.post('/', validateJWT_1.validateJWT, inventory_1.postInventory);
router.get('/search/product', validateJWT_1.validateJWT, products_1.searchProductInventory);
router.get('/search/product/withoutcodebar', validateJWT_1.validateJWT, products_1.searchProductInventoryWithoutCodebar);
exports.default = router;
//# sourceMappingURL=inventoryRouter.js.map
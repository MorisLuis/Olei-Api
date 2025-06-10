"use strict";
// Importar los tipos extendidos explícitamente
/// <reference path="../types/express.d.ts" />
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const products_1 = require("../controllers/products/products");
const productsWeb_1 = require("../controllers/products/productsWeb");
const validateJWT_1 = require("../middleware/validateJWT");
const validateJWTWeb_1 = require("../middleware/validateJWTWeb");
const router = (0, express_1.default)();
// Web endpoints
router.get("/", validateJWTWeb_1.validateJWTWeb, productsWeb_1.getProducts);
router.get("/web/:id", validateJWTWeb_1.validateJWTWeb, productsWeb_1.getProducByIdWeb);
router.get("/count", validateJWTWeb_1.validateJWTWeb, productsWeb_1.getTotalProducts);
router.get("/search", validateJWTWeb_1.validateJWTWeb, productsWeb_1.searchProduct);
// App endpoints
router.get("/byStock", validateJWT_1.validateJWT, products_1.getProductsByStock);
router.get("/byStockCount", validateJWT_1.validateJWT, products_1.getTotalOfProductsByStock);
router.get("/byStockAndCodeBar", validateJWT_1.validateJWT, products_1.getProductByStockAndCodeBar);
// This enndpoint is used in WEB and APP to get product details.
router.get("/:id", validateJWT_1.validateJWT, products_1.getProducById); // Verify > if a i used this endpoint.
exports.default = router;
//# sourceMappingURL=productRouter.js.map
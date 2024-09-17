"use strict";
// Importar los tipos extendidos explícitamente
/// <reference path="../types/express.d.ts" />
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const products_1 = require("../controllers/products/products");
const validate_jwt_1 = require("../helpers/validate-jwt");
const productsWeb_1 = require("../controllers/products/productsWeb");
const router = (0, express_1.default)();
// Web endpoints
router.get("/", validate_jwt_1.validateJWTWeb, productsWeb_1.getProducts);
router.get("/web/:id", validate_jwt_1.validateJWTWeb, productsWeb_1.getProducByIdWeb);
router.get("/count", validate_jwt_1.validateJWTWeb, productsWeb_1.getTotalProducts);
// App endpoints
router.get("/byStock", validate_jwt_1.validateJWT, products_1.getProductsByStock);
router.get("/byStockCount", validate_jwt_1.validateJWT, products_1.getTotalOfProductsByStock);
router.get("/byStockAndCodeBar", validate_jwt_1.validateJWT, products_1.getProductByStockAndCodeBar);
// This enndpoint is used in WEB and APP to get product details.
router.get("/:id", validate_jwt_1.validateJWT, products_1.getProducById);
exports.default = router;
//# sourceMappingURL=productRouter.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const products_1 = require("../controllers/products");
const router = (0, express_1.default)();
router.get("/", products_1.getProducts);
//router.post( "/", createNewProduct)
router.get("/:id", products_1.getProducById);
router.delete("/:id", products_1.deleteProductById);
router.get("/count", products_1.getTotalProducts);
//router.put( "/:id", updateProduct)
exports.default = router;
//# sourceMappingURL=productRouter.js.map
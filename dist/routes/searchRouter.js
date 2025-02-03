"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validate_jwt_1 = require("../helpers/validate-jwt");
const search_1 = require("../controllers/search/search");
const router = (0, express_1.Router)();
// App endpoints
//router.get("/inventory", validateJWT, searchProductInventory)
// Web endpoints
router.get("/familias", validate_jwt_1.validateJWTWeb, search_1.getFamilias);
router.get("/marcas", validate_jwt_1.validateJWTWeb, search_1.getMarcas);
router.get("/codigos", validate_jwt_1.validateJWTWeb, search_1.getCodigos);
router.get("/almacenes", validate_jwt_1.validateJWT, search_1.getAlmacenes);
//router.get("/", validateJWTWeb, searchProduct)
//router.get("/client", validateJWTWeb, searchClient)
exports.default = router;
//# sourceMappingURL=searchRouter.js.map
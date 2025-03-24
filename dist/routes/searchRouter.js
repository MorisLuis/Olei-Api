"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const search_1 = require("../controllers/search/search");
const validateJWT_1 = require("../middleware/validateJWT");
const router = (0, express_1.Router)();
// Web endpoints
router.get("/familias", validateJWT_1.validateJWTWeb, search_1.getFamilias);
router.get("/marcas", validateJWT_1.validateJWTWeb, search_1.getMarcas);
router.get("/codigos", validateJWT_1.validateJWTWeb, search_1.getCodigos);
exports.default = router;
//# sourceMappingURL=searchRouter.js.map
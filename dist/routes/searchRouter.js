"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const search_1 = require("../controllers/search/search");
const validateJWTWeb_1 = require("../middleware/validateJWTWeb");
const router = (0, express_1.Router)();
// Web endpoints
router.get("/familias", validateJWTWeb_1.validateJWTWeb, search_1.getFamilias);
router.get("/marcas", validateJWTWeb_1.validateJWTWeb, search_1.getMarcas);
router.get("/codigos", validateJWTWeb_1.validateJWTWeb, search_1.getCodigos);
exports.default = router;
//# sourceMappingURL=searchRouter.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validate_jwt_1 = require("../helpers/validate-jwt");
const searchWeb_1 = require("../controllers/search/searchWeb");
const search_1 = require("../controllers/search/search");
const router = (0, express_1.Router)();
router.get("/", validate_jwt_1.validateJWTWeb, searchWeb_1.searchProduct);
router.get("/inventory", validate_jwt_1.validateJWT, search_1.searchProductInventory);
router.get("/client", validate_jwt_1.validateJWTWeb, searchWeb_1.searchClient);
exports.default = router;
//# sourceMappingURL=searchRouter.js.map
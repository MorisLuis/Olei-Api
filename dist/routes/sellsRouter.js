"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validate_jwt_1 = require("../helpers/validate-jwt");
const sells_1 = require("../controllers/sells");
const router = (0, express_1.Router)();
router.get("/", validate_jwt_1.validateJWTWeb, sells_1.getSells);
router.get("/:folio", validate_jwt_1.validateJWTWeb, sells_1.getSellById);
router.get("/client/:client", validate_jwt_1.validateJWTWeb, sells_1.getSellsByClient);
exports.default = router;
//# sourceMappingURL=sellsRouter.js.map
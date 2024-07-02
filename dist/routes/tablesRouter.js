"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tables_1 = require("../controllers/tables");
const validate_jwt_1 = require("../helpers/validate-jwt");
const router = (0, express_1.Router)();
router.get("/", validate_jwt_1.validateJWTWeb, tables_1.getTables);
exports.default = router;
//# sourceMappingURL=tablesRouter.js.map
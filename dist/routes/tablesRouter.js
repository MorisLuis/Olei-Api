"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tables_1 = require("../controllers/tables");
const validateJWT_1 = require("../middleware/validateJWT");
const router = (0, express_1.Router)();
router.get("/", validateJWT_1.validateJWT, tables_1.getTables);
exports.default = router;
//# sourceMappingURL=tablesRouter.js.map
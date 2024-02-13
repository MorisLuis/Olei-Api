"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tables_1 = require("../controllers/tables");
const router = (0, express_1.Router)();
router.get("/", tables_1.getTables);
exports.default = router;
//# sourceMappingURL=tablesRouter.js.map
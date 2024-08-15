"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const utils_1 = require("../controllers/utils");
const router = (0, express_1.Router)();
router.get("/", utils_1.getUtils);
exports.default = router;
//# sourceMappingURL=utilsRouter.js.map
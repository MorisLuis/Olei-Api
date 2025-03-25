"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const costos_1 = require("../controllers/costos");
const validateJWT_1 = require("../middleware/validateJWT");
const router = (0, express_1.Router)();
router.put('/', validateJWT_1.validateJWT, costos_1.updateCostos);
exports.default = router;
//# sourceMappingURL=costosRouter.js.map
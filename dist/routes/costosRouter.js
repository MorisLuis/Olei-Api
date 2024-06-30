"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const costos_1 = require("../controllers/costos");
const validate_jwt_1 = require("../helpers/validate-jwt");
const router = (0, express_1.Router)();
router.put('/', validate_jwt_1.validateJWT, costos_1.updateCostos);
exports.default = router;
//# sourceMappingURL=costosRouter.js.map
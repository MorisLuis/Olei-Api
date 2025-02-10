"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const utils_1 = require("../controllers/utils");
const validate_jwt_1 = require("../helpers/validate-jwt");
const router = (0, express_1.Router)();
router.get("/excell", validate_jwt_1.validateJWTWeb, utils_1.getExcellTest);
exports.default = router;
//# sourceMappingURL=reportsRouter.js.map
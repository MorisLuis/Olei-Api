"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validate_jwt_1 = require("../helpers/validate-jwt");
const remissions_1 = require("../controllers/remissions");
const router = (0, express_1.Router)();
router.get("/", validate_jwt_1.validateJWTWeb, remissions_1.getRemissions);
router.get("/:folio", validate_jwt_1.validateJWTWeb, remissions_1.getRemission);
exports.default = router;
//# sourceMappingURL=remissionsRouter.js.map
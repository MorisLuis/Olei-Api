"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("../controllers/client");
const validate_jwt_1 = require("../helpers/validate-jwt");
const router = (0, express_1.Router)();
router.post('/', validate_jwt_1.validateJWTWeb, client_1.selectClient);
exports.default = router;
//# sourceMappingURL=clientRouter.js.map
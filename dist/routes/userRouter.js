"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_1 = require("../controllers/users");
const validate_jwt_1 = require("../helpers/validate-jwt");
const router = (0, express_1.Router)();
router.get("/", validate_jwt_1.validateJWTWeb, users_1.getUsers);
exports.default = router;
//# sourceMappingURL=userRouter.js.map
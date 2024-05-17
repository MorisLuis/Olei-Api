"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controllers/auth/auth");
const validate_jwt_1 = require("../helpers/validate-jwt");
const authWeb_1 = require("../controllers/auth/authWeb");
const router = (0, express_1.Router)();
router.post("/loginDB", auth_1.loginDB);
router.post("/login", authWeb_1.loginWeb);
router.post("/logout", authWeb_1.logout);
router.get('/renew', validate_jwt_1.validateJWT, auth_1.renew);
router.get('/renewWeb', validate_jwt_1.validateJWT, authWeb_1.renewWeb);
exports.default = router;
//# sourceMappingURL=authRouter.js.map
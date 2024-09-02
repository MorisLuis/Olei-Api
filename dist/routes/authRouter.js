"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controllers/auth/auth");
const validate_jwt_1 = require("../helpers/validate-jwt");
const authWeb_1 = require("../controllers/auth/authWeb");
const router = (0, express_1.Router)();
router.post("/loginWeb", authWeb_1.loginWeb);
router.get('/renewWeb', validate_jwt_1.validateJWTWeb, authWeb_1.renewWeb);
router.post("/loginDB", auth_1.loginDB);
router.post("/login", validate_jwt_1.validateJWTDB, auth_1.login);
router.get('/renew', validate_jwt_1.validateJWTDB, auth_1.renewDB);
router.get('/renewLogin', validate_jwt_1.validateJWT, auth_1.renewLogin);
router.post("/logout", authWeb_1.logout);
exports.default = router;
//# sourceMappingURL=authRouter.js.map
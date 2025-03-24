"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controllers/auth/auth");
const validateJWT_1 = require("../middleware/validateJWT");
const authWeb_1 = require("../controllers/auth/authWeb");
const router = (0, express_1.Router)();
// Web
router.post("/loginWeb", authWeb_1.loginWeb);
router.get('/renewWeb', validateJWT_1.validateJWTWeb, authWeb_1.renewWeb);
router.get("/logout", validateJWT_1.validateJWTWeb, authWeb_1.logout);
// App
router.post("/loginServer", auth_1.loginServer);
router.post("/login", validateJWT_1.validateJWTLogin, auth_1.login);
router.get('/logoutUser', validateJWT_1.validateJWT, auth_1.logoutUser);
router.get('/logoutServer', validateJWT_1.validateJWT, auth_1.logoutServer);
router.post('/refresh', validateJWT_1.validateRefreshJWT, auth_1.refresh);
exports.default = router;
//# sourceMappingURL=authRouter.js.map
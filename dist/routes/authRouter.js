"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controllers/auth/auth");
const authWeb_1 = require("../controllers/auth/authWeb");
const validateJWT_1 = require("../middleware/validateJWT");
const validateJWTWeb_1 = require("../middleware/validateJWTWeb");
const router = (0, express_1.Router)();
// Web
router.post("/loginWeb", authWeb_1.loginWeb);
router.get('/renewWeb', validateJWTWeb_1.validateJWTWeb, authWeb_1.renewWeb);
router.get("/logout", validateJWTWeb_1.validateJWTWeb, authWeb_1.logout);
// App
router.post("/loginServer", auth_1.loginServer);
router.post("/login", validateJWT_1.validateJWT, auth_1.login);
router.get('/logoutServer', validateJWT_1.validateJWT, auth_1.logoutServer);
router.get('/logoutUser', validateJWT_1.validateJWTokenServer, auth_1.logoutUser);
router.post('/refreshServer', validateJWT_1.validateJWT, auth_1.refreshServer);
router.post('/refresh', validateJWT_1.validateRefreshToken, auth_1.refresh);
exports.default = router;
//# sourceMappingURL=authRouter.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("../controllers/client");
const validateJWT_1 = require("../middleware/validateJWT");
const router = (0, express_1.Router)();
router.get('/', validateJWT_1.validateJWTWeb, client_1.getClients);
router.get('/total', validateJWT_1.validateJWTWeb, client_1.getTotalClients);
router.get('/clientId', validateJWT_1.validateJWTWeb, client_1.getClientId);
router.post('/', validateJWT_1.validateJWTWeb, client_1.selectClient);
router.get("/search", validateJWT_1.validateJWTWeb, client_1.searchClient);
exports.default = router;
//# sourceMappingURL=clientRouter.js.map
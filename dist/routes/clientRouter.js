"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("../controllers/client");
const validateJWTWeb_1 = require("../middleware/validateJWTWeb");
const router = (0, express_1.Router)();
router.get('/', validateJWTWeb_1.validateJWTWeb, client_1.getClients);
router.get('/total', validateJWTWeb_1.validateJWTWeb, client_1.getTotalClients);
router.get('/clientId', validateJWTWeb_1.validateJWTWeb, client_1.getClientId);
router.post('/', validateJWTWeb_1.validateJWTWeb, client_1.selectClient);
router.get("/search", validateJWTWeb_1.validateJWTWeb, client_1.searchClient);
exports.default = router;
//# sourceMappingURL=clientRouter.js.map
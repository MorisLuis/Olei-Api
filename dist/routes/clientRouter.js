"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_controller_1 = require("../controllers/clients/client.controller");
const validateJWTWeb_1 = require("../middleware/validateJWTWeb");
const router = (0, express_1.Router)();
router.get('/', validateJWTWeb_1.validateJWTWeb, client_controller_1.getClients);
router.get('/total', validateJWTWeb_1.validateJWTWeb, client_controller_1.getTotalClients);
router.get('/clientId', validateJWTWeb_1.validateJWTWeb, client_controller_1.getClientId);
router.post('/', validateJWTWeb_1.validateJWTWeb, client_controller_1.selectClient);
router.get("/search", validateJWTWeb_1.validateJWTWeb, client_controller_1.searchClient);
router.put("/:id", validateJWTWeb_1.validateJWTWeb, client_controller_1.updateClient);
exports.default = router;
//# sourceMappingURL=clientRouter.js.map
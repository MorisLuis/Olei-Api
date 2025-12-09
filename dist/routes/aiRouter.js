"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_controller_1 = require("../controllers/ai/ai.controller");
const validateJWTWeb_1 = require("../middleware/validateJWTWeb");
const router = (0, express_1.Router)();
router.post('/', validateJWTWeb_1.validateJWTWeb, ai_controller_1.askAI);
router.get('/export', validateJWTWeb_1.validateJWTWeb, ai_controller_1.exportToCSV);
exports.default = router;
//# sourceMappingURL=aiRouter.js.map
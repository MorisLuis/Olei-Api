"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const email_1 = require("../controllers/email");
const validateJWTWeb_1 = require("../middleware/validateJWTWeb");
const router = (0, express_1.Router)();
router.post('/', validateJWTWeb_1.validateJWTWeb, email_1.sendEmail);
router.post('/cobranza/pdf/:client', validateJWTWeb_1.validateJWTWeb, email_1.sendEmailWithPDF);
router.post('/cobranza/excell', validateJWTWeb_1.validateJWTWeb, email_1.sendEmailWithPDF);
exports.default = router;
//# sourceMappingURL=emailRouter.js.map
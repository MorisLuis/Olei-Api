"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const email_1 = require("../controllers/email");
const validateJWT_1 = require("../middleware/validateJWT");
const router = (0, express_1.Router)();
router.post('/', email_1.sendEmail);
router.post('/cobranza/pdf/:client', validateJWT_1.validateJWTWeb, email_1.sendEmailWithPDF);
router.post('/cobranza/excell', validateJWT_1.validateJWTWeb, email_1.sendEmailWithPDF);
exports.default = router;
//# sourceMappingURL=emailRouter.js.map
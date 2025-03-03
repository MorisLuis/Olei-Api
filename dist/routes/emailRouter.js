"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const email_1 = require("../controllers/email");
const validate_jwt_1 = require("../helpers/validate-jwt");
const router = (0, express_1.Router)();
router.post('/', email_1.sendEmailWithPDF);
router.post('/cobranza/pdf/:client', validate_jwt_1.validateJWTWeb, email_1.sendEmailWithPDF);
router.post('/cobranza/excell', validate_jwt_1.validateJWTWeb, email_1.sendEmailWithPDF);
exports.default = router;
//# sourceMappingURL=emailRouter.js.map
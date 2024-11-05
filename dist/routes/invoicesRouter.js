"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validate_jwt_1 = require("../helpers/validate-jwt");
const invoices_1 = require("../controllers/invoices");
const router = (0, express_1.Router)();
router.get("/", validate_jwt_1.validateJWTWeb, invoices_1.getInvoices);
router.get("/:folio", validate_jwt_1.validateJWTWeb, invoices_1.getInvoice);
exports.default = router;
//# sourceMappingURL=invoicesRouter.js.map
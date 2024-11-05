"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validate_jwt_1 = require("../helpers/validate-jwt");
const quotes_1 = require("../controllers/quotes");
const router = (0, express_1.Router)();
router.get("/", validate_jwt_1.validateJWTWeb, quotes_1.getQuotes);
router.get("/:folio", validate_jwt_1.validateJWTWeb, quotes_1.getQuote);
exports.default = router;
//# sourceMappingURL=quotesRoutes.js.map
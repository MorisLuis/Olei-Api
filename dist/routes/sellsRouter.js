"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validate_jwt_1 = require("../helpers/validate-jwt");
const sells_1 = require("../controllers/sells");
const router = (0, express_1.Router)();
router.get("/", validate_jwt_1.validateJWTWeb, sells_1.getSells);
router.get("/total", validate_jwt_1.validateJWTWeb, sells_1.getTotalSells);
router.get("/:folio", validate_jwt_1.validateJWTWeb, sells_1.getSellById); // Ruta general al final
router.get("/cobranza/total/:client", validate_jwt_1.validateJWTWeb, sells_1.getTotalCobranza);
router.get("/cobranza/:client", validate_jwt_1.validateJWTWeb, sells_1.getCobranza);
router.get("/client/total/:client", validate_jwt_1.validateJWTWeb, sells_1.getTotalSellsByClient);
router.get("/client/:client", validate_jwt_1.validateJWTWeb, sells_1.getSellsByClient);
exports.default = router;
//# sourceMappingURL=sellsRouter.js.map
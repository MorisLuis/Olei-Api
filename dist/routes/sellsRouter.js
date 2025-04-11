"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sells_1 = require("../controllers/sells");
const validateJWT_1 = require("../middleware/validateJWT");
const router = (0, express_1.Router)();
router.get("/", validateJWT_1.validateJWTWeb, sells_1.getSells);
router.get("/total", validateJWT_1.validateJWTWeb, sells_1.getTotalSells);
router.get("/:folio", validateJWT_1.validateJWTWeb, sells_1.getSellById); // Ruta general al final
router.get("/client/total/:client", validateJWT_1.validateJWTWeb, sells_1.getTotalSellsByClient);
router.get("/client/:client", validateJWT_1.validateJWTWeb, sells_1.getSellsByClient);
router.get("/cobranza/total/:client", validateJWT_1.validateJWTWeb, sells_1.getTotalCobranza);
router.get("/cobranza/:client", validateJWT_1.validateJWTWeb, sells_1.getCobranza);
router.get("/cobranza/getCobranzaWithTotals/:client", validateJWT_1.validateJWTWeb, sells_1.getCobranzaWithTotals);
exports.default = router;
//# sourceMappingURL=sellsRouter.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sells_1 = require("../controllers/sells");
const validateJWT_1 = require("../middleware/validateJWT");
const router = (0, express_1.Router)();
router.get("/", validateJWT_1.validateJWTWeb, sells_1.getSells);
router.get("/totals", validateJWT_1.validateJWTWeb);
router.get("/:folio", validateJWT_1.validateJWTWeb, sells_1.getSellById);
router.get("/client/:client", validateJWT_1.validateJWTWeb, sells_1.getSellsByClient);
router.get("/cobranza/clients", validateJWT_1.validateJWTWeb, sells_1.getCobranza);
router.get("/cobranza/clients/totals", validateJWT_1.validateJWTWeb, sells_1.getCobranzaCountAndTotal);
router.get("/cobranza/:client", validateJWT_1.validateJWTWeb, sells_1.getCobranzaByClient);
router.get("/cobranza/totals/:client", validateJWT_1.validateJWTWeb, sells_1.getCobranzaByClientCountAndTotal);
router.get("/cobranza/getCobranzaWithTotals/:client", validateJWT_1.validateJWTWeb, sells_1.getCobranzaWithTotals);
exports.default = router;
//# sourceMappingURL=sellsRouter.js.map
import { Router } from "express";
import { getCobranza, getCobranzaWithTotals, getSellById, getSells, getSellsByClient, getTotalCobranza, getTotalSells, getTotalSellsByClient } from "../controllers/sells";
import { validateJWTWeb } from "../middleware/validateJWT";


const router = Router();
router.get("/", validateJWTWeb, getSells);
router.get("/total", validateJWTWeb, getTotalSells);
router.get("/:folio", validateJWTWeb, getSellById); // Ruta general al final
router.get("/client/total/:client", validateJWTWeb, getTotalSellsByClient);
router.get("/client/:client", validateJWTWeb, getSellsByClient);

router.get("/cobranza/total/:client", validateJWTWeb, getTotalCobranza);
router.get("/cobranza/:client", validateJWTWeb, getCobranza);
router.get("/cobranza/getCobranzaWithTotals/:client", validateJWTWeb, getCobranzaWithTotals);

export default router;
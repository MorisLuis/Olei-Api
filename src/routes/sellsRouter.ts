import { Router } from "express";
import { getCobranza, getCobranzaByClient, getCobranzaByClientCountAndTotal, getCobranzaWithTotals, getSellById, getSells, getSellsByClient } from "../controllers/sells";
import { validateJWTWeb } from "../middleware/validateJWT";


const router = Router();
router.get("/", validateJWTWeb, getSells);
router.get("/:folio", validateJWTWeb, getSellById); // Ruta general al final
router.get("/client/:client", validateJWTWeb, getSellsByClient);


router.get("/cobranza/clients", validateJWTWeb, getCobranza);
router.get("/cobranza/:client", validateJWTWeb, getCobranzaByClient);
router.get("/cobranza/totals/:client", validateJWTWeb, getCobranzaByClientCountAndTotal);

router.get("/cobranza/getCobranzaWithTotals/:client", validateJWTWeb, getCobranzaWithTotals);

export default router;
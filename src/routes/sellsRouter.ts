import { Router } from "express";
import { getCobranza, getSellById, getSells, getSellsByClient, getTotalCobranza, getTotalSells, getTotalSellsByClient } from "../controllers/sells";
import { validateJWTWeb } from "../middleware/validateJWT";


const router = Router();
router.get("/", validateJWTWeb, getSells);
router.get("/total", validateJWTWeb, getTotalSells);
router.get("/:folio", validateJWTWeb, getSellById); // Ruta general al final
router.get("/cobranza/total/:client", validateJWTWeb, getTotalCobranza);
router.get("/cobranza/:client", validateJWTWeb, getCobranza);
router.get("/client/total/:client", validateJWTWeb, getTotalSellsByClient);
router.get("/client/:client", validateJWTWeb, getSellsByClient);

export default router;
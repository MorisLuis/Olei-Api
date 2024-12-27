import { Router } from "express";
import { validateJWTWeb } from "../helpers/validate-jwt";
import { getCobranza, getSellById, getSells, getSellsByClient, getTotalCobranza, getTotalSells, getTotalSellsByClient } from "../controllers/sells";


const router = Router();
router.get("/", validateJWTWeb, getSells);
router.get("/total", validateJWTWeb, getTotalSells);
router.get("/:folio", validateJWTWeb, getSellById); // Ruta general al final
router.get("/cobranza/total/:client", validateJWTWeb, getTotalCobranza);
router.get("/cobranza/:client", validateJWTWeb, getCobranza);
router.get("/client/total/:client", validateJWTWeb, getTotalSellsByClient);
router.get("/client/:client", validateJWTWeb, getSellsByClient);

export default router;
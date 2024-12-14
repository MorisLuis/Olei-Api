import { Router } from "express";
import { validateJWTWeb } from "../helpers/validate-jwt";
import { getCobranza, getSellById, getSells, getSellsByClient, getTotalSells, getTotalSellsByClient } from "../controllers/sells";


const router = Router();

router.get("/", validateJWTWeb, getSells);
router.get("/total", validateJWTWeb, getTotalSells);
router.get("/:folio", validateJWTWeb, getSellById);
router.get("/cobranza/:client", validateJWTWeb, getCobranza);
router.get("/client/:client", validateJWTWeb, getSellsByClient);
router.get("/client/total/:client", validateJWTWeb, getTotalSellsByClient);

export default router;
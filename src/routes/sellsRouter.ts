import { Router } from "express";
import { validateJWTWeb } from "../helpers/validate-jwt";
import { getCobranza, getSellById, getSells, getSellsByClient } from "../controllers/sells";


const router = Router();

router.get("/", validateJWTWeb, getSells);
router.get("/:folio", validateJWTWeb, getSellById);
router.get("/cobranza/:client", validateJWTWeb, getCobranza);
router.get("/client/:client", validateJWTWeb, getSellsByClient);

export default router;
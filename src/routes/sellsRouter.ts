import { Router } from "express";
import { validateJWTWeb } from "../helpers/validate-jwt";
import { getSellById, getSells, getSellsByClient } from "../controllers/sells";


const router = Router();

router.get("/", validateJWTWeb, getSells);
router.get("/:folio", validateJWTWeb, getSellById);
router.get("/client/:client", validateJWTWeb, getSellsByClient);

export default router;
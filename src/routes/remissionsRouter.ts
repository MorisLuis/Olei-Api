import { Router } from "express";
import { validateJWTWeb } from "../helpers/validate-jwt";
import { getRemission, getRemissions } from "../controllers/remissions";


const router = Router();

router.get("/", validateJWTWeb, getRemissions);
router.get("/:folio", validateJWTWeb, getRemission);

export default router;
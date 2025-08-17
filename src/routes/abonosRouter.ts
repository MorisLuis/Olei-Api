import { Router } from "express";
import { validateJWTWeb } from "../middleware/validateJWTWeb";
import { getAbonoById, getAbonos } from "../controllers/abonos/abonos.controller";


const router = Router();
router.get('/', validateJWTWeb, getAbonos)
router.get('/:folio', validateJWTWeb, getAbonoById)

export default router;
import { Router } from "express";
import { validateJWTWeb } from "../middleware/validateJWTWeb";
import { getAbonoById, getAbonoDetails, getAbonos } from "../controllers/abonos/abonos.controller";


const router = Router();
router.get('/', validateJWTWeb, getAbonos)
router.get('/:folio', validateJWTWeb, getAbonoById)
router.get('/details/:folio', validateJWTWeb, getAbonoDetails)

export default router;
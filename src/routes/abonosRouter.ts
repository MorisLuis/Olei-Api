import { Router } from "express";
import { validateJWTWeb } from "../middleware/validateJWTWeb";
import { getAbonos } from "../controllers/abonos/abonos.controller";


const router = Router();
router.get('/', validateJWTWeb, getAbonos)

export default router;
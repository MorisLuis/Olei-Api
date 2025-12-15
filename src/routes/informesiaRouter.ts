import { Router } from "express";
import { validateJWTWeb } from "../middleware/validateJWTWeb";
import { getInformesia, postInformesia } from "../controllers/informesia/informesia.controller";


const router = Router();
router.get('/', validateJWTWeb, getInformesia)
router.post('/', validateJWTWeb, postInformesia)

export default router;
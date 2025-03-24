import { Router } from "express";
import { updateCostos } from "../controllers/costos";
import { validateJWT } from "../middleware/validateJWT";


const router = Router();
router.put('/', validateJWT, updateCostos)

export default router;
import { Router } from "express";
import { updateCostos } from "../controllers/costos";
import { validateJWTClient } from "../middleware/validateJWT";


const router = Router();
router.put('/', validateJWTClient, updateCostos)

export default router;